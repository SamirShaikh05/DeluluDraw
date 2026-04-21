const EVENTS = require("../constants/events");
const { DEFAULT_SETTINGS, MIN_PLAYERS_TO_START, PUBLIC_ROOM_ID } = require("../constants/config");
const Player = require("../core/Player");
const Room = require("../core/Room");
const rooms = require("../store/rooms");
const { emitRoomState } = require("../utils/broadcast");
const createRoomId = require("../utils/idGenerator");
const { addMessage } = require("../utils/messages");
const { getDrawer } = require("../utils/roomState");
const { publicPlayer } = require("../utils/serializers");
const { clearTimers } = require("../utils/timers");
const { normalizeSettings, sanitizeName, sanitizeText } = require("../utils/validators");
const { beginChoosing, endRound, resetRoomToWaiting, startGame } = require("./gameHandlers");

function registerRoomHandlers(io, socket) {
  socket.on(EVENTS.CREATE_ROOM, ({ playerName, settings } = {}) => {
    const name = sanitizeName(playerName);
    if (!name) return socket.emit(EVENTS.ERROR, { message: "Enter a name first." });

    const roomId = createRoomId();
    const player = new Player(socket.id, name);
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
    if (room.hostId !== socket.id) return socket.emit(EVENTS.ERROR, { message: "Only the host can change room settings." });
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
    if (socket.id === targetId) return socket.emit(EVENTS.ERROR, { message: "You can't vote to kick yourself." });

    const voter = room.players.find((player) => player.id === socket.id);
    const target = room.players.find((player) => player.id === targetId);
    if (!voter || !target) return socket.emit(EVENTS.ERROR, { message: "Player not found in this match." });

    const votes = room.kickVotes[targetId] || new Set();
    if (votes.has(socket.id)) {
      votes.delete(socket.id);
      if (votes.size === 0) {
        delete room.kickVotes[targetId];
      } else {
        room.kickVotes[targetId] = votes;
      }
      emitRoomState(io, room);
      return;
    }

    votes.add(socket.id);
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

  socket.on(EVENTS.JOIN_ROOM, ({ roomId, playerName } = {}) => {
    const name = sanitizeName(playerName);
    const id = sanitizeText(roomId).toUpperCase();
    const room = id ? rooms[id] : getOrCreatePublicRoom();

    if (!name) return socket.emit(EVENTS.ERROR, { message: "Enter a name first." });
    if (!room) return socket.emit(EVENTS.ERROR, { message: "That room does not exist." });
    if (room.players.length >= room.settings.maxPlayers) {
      return socket.emit(EVENTS.ERROR, { message: "That room is full." });
    }

    const player = new Player(socket.id, name);
    room.addPlayer(player);
    socket.join(room.id);
    socket.emit(EVENTS.ROOM_JOINED, { roomId: room.id, player: publicPlayer(player), hostId: room.hostId });
    addMessage(io, room, {
      type: "system",
      text: room.isPrivate ? `${name} joined the room.` : `${name} joined the public match.`,
    });

    if (!room.isPrivate && room.players.length >= MIN_PLAYERS_TO_START && !room.game) {
      startGame(io, room);
      return;
    }

    emitRoomState(io, room);
  });

  socket.on(EVENTS.DISCONNECT, () => {
    removePlayerFromRooms(io, socket);
  });
}

function removePlayerFromRooms(io, socket) {
  for (const room of Object.values(rooms)) {
    removePlayerFromRoom(io, room, socket.id, {
      reason: null,
      notice: null,
      kicked: false,
    });
  }
}

function removePlayerFromRoom(io, room, playerId, options = {}) {
  const player = room.players.find((candidate) => candidate.id === playerId);
  if (!player) return false;

  const wasDrawer = room.game && getDrawer(room)?.id === playerId;
  room.removePlayer(playerId);
  clearKickVotes(room, playerId);

  const playerSocket = io.sockets.sockets.get(playerId);
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

  if (!room.isPrivate && room.players.length < MIN_PLAYERS_TO_START) {
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
