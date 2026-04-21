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

  socket.on(EVENTS.JOIN_ROOM, ({ roomId, playerName } = {}) => {
    const name = sanitizeName(playerName);
    const id = sanitizeText(roomId).toUpperCase();
    const room = id ? rooms[id] : getOrCreatePublicRoom();

    if (!name) return socket.emit(EVENTS.ERROR, { message: "Enter a name first." });
    if (!room) return socket.emit(EVENTS.ERROR, { message: "That room does not exist." });
    if (room.players.length >= room.settings.maxPlayers) {
      return socket.emit(EVENTS.ERROR, { message: "That room is full." });
    }
    if (room.game && room.game.phase !== "game_over") {
      if (!room.isPrivate) {
        return socket.emit(EVENTS.ERROR, { message: "The public match is in progress. Try again shortly." });
      }
      return socket.emit(EVENTS.ERROR, { message: "That game is already running." });
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
    const wasDrawer = room.game && getDrawer(room)?.id === socket.id;
    const player = room.removePlayer(socket.id);
    if (!player) continue;

    socket.leave(room.id);
    addMessage(io, room, {
      type: "system",
      text: `${player.name} left the room.`,
    });

    if (room.isEmpty()) {
      clearTimers(room.game);
      delete rooms[room.id];
      continue;
    }

    if (!room.isPrivate && room.players.length < MIN_PLAYERS_TO_START) {
      resetRoomToWaiting(io, room, "Not enough players. Waiting for more players.");
      continue;
    }

    if (wasDrawer && room.game?.phase === "drawing") {
      endRound(io, room.id);
    } else if (wasDrawer && room.game?.phase === "choosing") {
      beginChoosing(io, room);
    } else {
      emitRoomState(io, room);
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
