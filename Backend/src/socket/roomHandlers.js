const EVENTS = require("../constants/events");
const { DEFAULT_SETTINGS, MIN_PLAYERS_TO_START, PUBLIC_ROOM_ID } = require("../constants/config");
const Player = require("../core/Player");
const Room = require("../core/Room");
const rooms = require("../store/rooms");
const { emitRoomState } = require("../utils/broadcast");
const { addMessage } = require("../utils/messages");
const { getDrawer, getPlayerForSocket } = require("../utils/roomState");
const { publicPlayer } = require("../utils/serializers");
const { clearTimers } = require("../utils/timers");
const { normalizeSettings, sanitizeName, sanitizeText } = require("../utils/validators");
const { beginChoosing, endRound, resetRoomToWaiting, startGame } = require("./gameHandlers");
const { customAlphabet } = require("nanoid");
const { randomUUID } = require("crypto");

const createRoomId = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 5);
const DISCONNECT_GRACE_MS = 30000;

function createUniqueRoomId() {
  let id = createRoomId();
  while (rooms[id]) id = createRoomId();
  return id;
}

function registerRoomHandlers(io, socket) {
  socket.on(EVENTS.SESSION_READY, () => sendRejoinAvailability(socket));

  socket.on(EVENTS.REJOIN_ROOM, ({ roomId } = {}) => {
    const room = rooms[sanitizeText(roomId).toUpperCase()];
    const player = room?.players.find((candidate) => candidate.id === socket.data.playerId);
    if (!room || !player) {
      return socket.emit(EVENTS.ERROR, { message: "That game session is no longer available." });
    }

    if (player.disconnectTimer) clearTimeout(player.disconnectTimer);
    player.disconnectTimer = null;
    player.socketId = socket.id;
    player.isConnected = true;
    socket.join(room.id);
    socket.emit(EVENTS.ROOM_REJOINED, { roomId: room.id, player: publicPlayer(player), hostId: room.hostId });
    emitRoomState(io, room);
  });

  socket.on(EVENTS.QUIT_ROOM, ({ roomId } = {}) => {
    const room = rooms[sanitizeText(roomId).toUpperCase()];
    const player = room?.players.find((candidate) => candidate.id === socket.data.playerId);
    const spectator = room?.spectators.find((candidate) => candidate.id === socket.data.playerId);
    if (!room || (!player && !spectator)) return;
    socket.emit(EVENTS.ROOM_LEFT);
    if (spectator) removeSpectatorFromRoom(io, room, spectator.id);
    else removePlayerFromRoom(io, room, player.id, { reason: `${player.name} left the room.` });
  });

  socket.on(EVENTS.CREATE_ROOM, ({ playerName, settings } = {}) => {
    const name = sanitizeName(playerName);
    if (!name) return socket.emit(EVENTS.ERROR, { message: "Enter a name first." });

    const roomId = createUniqueRoomId();
    const player = new Player(socket.data.playerId || randomUUID(), name, socket.id);
    socket.data.playerId = player.id;
    const room = new Room(roomId, player, normalizeSettings(settings), { isPrivate: true });
    rooms[roomId] = room;

    socket.join(roomId);
    socket.emit(EVENTS.ROOM_JOINED, { roomId, player: publicPlayer(player), hostId: room.hostId });
    addMessage(io, room, { type: "system", text: `${name} created the room.` });
    emitRoomState(io, room);
  });

  socket.on(EVENTS.UPDATE_ROOM_SETTINGS, ({ roomId, settings } = {}) => {
    const id = sanitizeText(roomId).toUpperCase();
    const room = rooms[id];
    if (!room) return socket.emit(EVENTS.ERROR, { message: "Room not found." });
    if (!room.isPrivate) return socket.emit(EVENTS.ERROR, { message: "Public match settings are fixed." });
    if (room.hostId !== socket.data.playerId) return socket.emit(EVENTS.ERROR, { message: "Only the host can change room settings." });
    if (room.game) return socket.emit(EVENTS.ERROR, { message: "Can't change settings after the game starts." });

    room.settings = normalizeSettings({
      ...room.settings,
      ...settings,
    });
    emitRoomState(io, room);
  });

  socket.on(EVENTS.VOTE_KICK, ({ roomId, targetId } = {}) => {
    const id = sanitizeText(roomId).toUpperCase();
    const room = rooms[id];
    if (!room) return socket.emit(EVENTS.ERROR, { message: "Room not found." });
    if (room.isPrivate) return socket.emit(EVENTS.ERROR, { message: "Kick voting is only available in public matches." });
    if (room.players.length < 3) return socket.emit(EVENTS.ERROR, { message: "Kick voting needs at least 3 players." });
    if (socket.data.playerId === targetId) return socket.emit(EVENTS.ERROR, { message: "You can't vote to kick yourself." });

    const voter = getPlayerForSocket(room, socket.id);
    const target = room.players.find((player) => player.id === targetId);
    if (!voter || !target) return socket.emit(EVENTS.ERROR, { message: "Player not found in this match." });

    const votes = room.kickVotes[targetId] || new Set();
    if (votes.has(socket.data.playerId)) {
      votes.delete(socket.data.playerId);
      if (votes.size === 0) {
        delete room.kickVotes[targetId];
      } else {
        room.kickVotes[targetId] = votes;
      }
      emitRoomState(io, room);
      return;
    }

    votes.add(socket.data.playerId);
    room.kickVotes[targetId] = votes;

    const requiredVotes = Math.floor(room.players.length / 2) + 1;
    io.to(room.id).emit("kick_vote", {
      voterName: voter.name,
      targetName: target.name,
      count: votes.size,
      required: requiredVotes,
    });
    if (votes.size >= requiredVotes) {
      removePlayerFromRoom(io, room, target.id, {
        reason: `${target.name} was kicked by majority vote.`,
        notice: "You were removed from the public match by majority vote.",
        kicked: true,
      });
      return;
    }

    emitRoomState(io, room);
  });

  socket.on(EVENTS.JOIN_ROOM, ({ roomId, playerName, role = "player" } = {}) => {
    const name = sanitizeName(playerName);
    const id = sanitizeText(roomId).toUpperCase();
    const room = id ? rooms[id] : getOrCreatePublicRoom();

    if (!name) return socket.emit(EVENTS.ERROR, { message: "Enter a name first." });
    if (!room) return socket.emit(EVENTS.ERROR, { message: "That room does not exist." });
    if (role === "spectator" && !room.isPrivate) {
      return socket.emit(EVENTS.ERROR, { message: "Spectator mode is only available in custom rooms." });
    }
    if (role === "spectator" && room.spectators.length >= 20) {
      return socket.emit(EVENTS.ERROR, { message: "This room has reached its spectator limit." });
    }
    if (room.players.length >= room.settings.maxPlayers) {
      if (role !== "spectator") return socket.emit(EVENTS.ERROR, { message: "That room is full." });
    }

    const existingPlayer = room.players.find((candidate) => candidate.id === socket.data.playerId);
    const existingSpectator = room.spectators.find((candidate) => candidate.id === socket.data.playerId);

    if (existingPlayer) {
      if (existingPlayer.disconnectTimer) clearTimeout(existingPlayer.disconnectTimer);
      existingPlayer.disconnectTimer = null;
      existingPlayer.name = name;
      existingPlayer.socketId = socket.id;
      existingPlayer.isConnected = true;
      existingPlayer.isSpectator = false;
      socket.data.playerId = existingPlayer.id;
      socket.join(room.id);
      socket.emit(EVENTS.ROOM_JOINED, { roomId: room.id, player: publicPlayer(existingPlayer), hostId: room.hostId });
      emitRoomState(io, room);
      return;
    }

    if (existingSpectator) {
      if (existingSpectator.disconnectTimer) clearTimeout(existingSpectator.disconnectTimer);
      existingSpectator.disconnectTimer = null;
      existingSpectator.name = name;
      existingSpectator.socketId = socket.id;
      existingSpectator.isConnected = true;
      existingSpectator.isSpectator = true;
      socket.data.playerId = existingSpectator.id;
      socket.join(room.id);
      socket.emit(EVENTS.ROOM_JOINED, { roomId: room.id, player: publicPlayer(existingSpectator), hostId: room.hostId });
      emitRoomState(io, room);
      return;
    }

    const player = new Player(socket.data.playerId || randomUUID(), name, socket.id, { isSpectator: role === "spectator" });
    socket.data.playerId = player.id;
    if (player.isSpectator) room.addSpectator(player);
    else room.addPlayer(player);
    socket.join(room.id);
    socket.emit(EVENTS.ROOM_JOINED, { roomId: room.id, player: publicPlayer(player), hostId: room.hostId });
    addMessage(io, room, {
      type: "system",
      text: player.isSpectator ? `${name} started watching the room.` : room.isPrivate ? `${name} joined the room.` : `${name} joined the public match.`,
    });

    if (!room.isPrivate && room.players.length >= MIN_PLAYERS_TO_START && !room.game) {
      startGame(io, room);
      return;
    }

    emitRoomState(io, room);
  });

  socket.on(EVENTS.DISCONNECT, () => {
    markPlayerDisconnected(io, socket);
  });

  sendRejoinAvailability(socket);
}

function sendRejoinAvailability(socket) {
  const sessions = Object.values(rooms)
    .map((room) => {
      const player = room.players.find((candidate) => candidate.id === socket.data.playerId);
      if (!player) return null;
      return {
        roomId: room.id,
        playerName: player.name,
        playerCount: room.players.length,
        phase: room.game?.phase || "lobby",
      };
    })
    .filter(Boolean);
  if (sessions.length) socket.emit(EVENTS.REJOIN_AVAILABLE, sessions);
}

function markPlayerDisconnected(io, socket) {
  for (const room of Object.values(rooms)) {
    const player = getPlayerForSocket(room, socket.id);
    const spectator = room.spectators.find((candidate) => candidate.socketId === socket.id);
    if (!player && !spectator) continue;
    if (spectator) {
      removeSpectatorFromRoom(io, room, spectator.id);
      continue;
    }
    player.isConnected = false;
    player.socketId = null;
    player.disconnectTimer = setTimeout(() => {
      const currentPlayer = room.players.find((candidate) => candidate.id === player.id);
      if (currentPlayer && !currentPlayer.isConnected) {
        removePlayerFromRoom(io, room, player.id, {
          reason: `${player.name} left the room after disconnecting.`,
        });
      }
    }, DISCONNECT_GRACE_MS);
    emitRoomState(io, room);
  }
}

function removeSpectatorFromRoom(io, room, spectatorId) {
  const spectator = room.removeSpectator(spectatorId);
  if (!spectator) return false;
  const spectatorSocket = spectator.socketId ? io.sockets.sockets.get(spectator.socketId) : null;
  spectatorSocket?.leave(room.id);
  addMessage(io, room, { type: "system", text: `${spectator.name} stopped watching the room.` });
  if (room.isEmpty()) {
    clearTimers(room.game);
    delete rooms[room.id];
  } else {
    emitRoomState(io, room);
  }
  return true;
}

function removePlayerFromRoom(io, room, playerId, options = {}) {
  const player = room.players.find((candidate) => candidate.id === playerId);
  if (!player) return false;

  const wasDrawer = room.game && getDrawer(room)?.id === playerId;
  if (player.disconnectTimer) clearTimeout(player.disconnectTimer);
  room.removePlayer(playerId);
  clearKickVotes(room, playerId);

  const playerSocket = player.socketId ? io.sockets.sockets.get(player.socketId) : null;
  playerSocket?.leave(room.id);
  if (options.kicked) {
    playerSocket?.emit(EVENTS.KICKED_FROM_ROOM, { message: options.notice || "You were removed from the match." });
  }

  addMessage(io, room, {
    type: "system",
    text: options.reason || `${player.name} left the room.`,
  });

  if (room.isEmpty()) {
    clearTimers(room.game);
    delete rooms[room.id];
    return true;
  }

  if (!room.isPrivate && room.players.length < 3) {
    room.kickVotes = {};
  }

  // A custom match also needs to leave the game when a player leaves. Keeping
  // the old game object here leaves the remaining player stuck on the game
  // screen with a private `game_over` state instead of returning to the room
  // lobby where another player can join.
  if (room.players.length < MIN_PLAYERS_TO_START) {
    resetRoomToWaiting(io, room, "Not enough players. Waiting for more players.");
    return true;
  }

  if (wasDrawer && room.game?.phase === "drawing") {
    endRound(io, room.id);
  } else if (wasDrawer && room.game?.phase === "choosing") {
    beginChoosing(io, room);
  } else {
    emitRoomState(io, room);
  }

  return true;
}

function clearKickVotes(room, removedPlayerId) {
  delete room.kickVotes[removedPlayerId];

  for (const [targetId, voters] of Object.entries(room.kickVotes)) {
    voters.delete(removedPlayerId);
    if (voters.size === 0 || !room.players.some((player) => player.id === targetId)) {
      delete room.kickVotes[targetId];
    }
  }
}

function getOrCreatePublicRoom() {
  if (!rooms[PUBLIC_ROOM_ID]) {
    rooms[PUBLIC_ROOM_ID] = new Room(PUBLIC_ROOM_ID, null, normalizeSettings(DEFAULT_SETTINGS), {
      isPrivate: false,
    });
  }

  return rooms[PUBLIC_ROOM_ID];
}

module.exports = {
  registerRoomHandlers,
};
