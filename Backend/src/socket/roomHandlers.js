const EVENTS = require("../constants/events");
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
const { beginChoosing, endRound } = require("./gameHandlers");

function registerRoomHandlers(io, socket) {
  socket.on(EVENTS.CREATE_ROOM, ({ playerName, settings } = {}) => {
    const name = sanitizeName(playerName);
    if (!name) return socket.emit(EVENTS.ERROR, { message: "Enter a name first." });

    const roomId = createRoomId();
    const player = new Player(socket.id, name);
    const room = new Room(roomId, player, normalizeSettings(settings));
    rooms[roomId] = room;

    socket.join(roomId);
    socket.emit(EVENTS.ROOM_JOINED, { roomId, player: publicPlayer(player), hostId: room.hostId });
    addMessage(io, room, { type: "system", text: `${name} created the room.` });
    emitRoomState(io, room);
  });

  socket.on(EVENTS.JOIN_ROOM, ({ roomId, playerName } = {}) => {
    const id = sanitizeText(roomId).toUpperCase();
    const name = sanitizeName(playerName);
    const room = rooms[id];

    if (!name) return socket.emit(EVENTS.ERROR, { message: "Enter a name first." });
    if (!room) return socket.emit(EVENTS.ERROR, { message: "That room does not exist." });
    if (room.players.length >= room.settings.maxPlayers) {
      return socket.emit(EVENTS.ERROR, { message: "That room is full." });
    }
    if (room.game && room.game.phase !== "game_over") {
      return socket.emit(EVENTS.ERROR, { message: "That game is already running." });
    }

    const player = new Player(socket.id, name);
    room.addPlayer(player);
    socket.join(id);
    socket.emit(EVENTS.ROOM_JOINED, { roomId: id, player: publicPlayer(player), hostId: room.hostId });
    addMessage(io, room, { type: "system", text: `${name} joined the room.` });
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

    if (wasDrawer && room.game?.phase === "drawing") {
      endRound(io, room.id);
    } else if (wasDrawer && room.game?.phase === "choosing") {
      beginChoosing(io, room);
    } else {
      emitRoomState(io, room);
    }
  }
}

module.exports = {
  registerRoomHandlers,
};
