const EVENTS = require("../constants/events");
const { publicGame, publicPlayer, roomSnapshot } = require("./serializers");

function emitRoomState(io, room) {
  for (const member of [...room.players, ...room.spectators]) {
    if (member.socketId) {
      io.to(member.socketId).emit(EVENTS.ROOM_STATE, roomSnapshot(room, member.socketId));
    }
  }
  io.to(room.id).emit(EVENTS.PLAYER_LIST, {
    players: room.players.map(publicPlayer),
    spectators: room.spectators.map(publicPlayer),
    hostId: room.hostId,
  });
}

// Countdown and hint changes are frequent. Keep them separate from the
// relatively large room snapshot (chat and canvas history).
function emitGameState(io, room) {
  for (const member of [...room.players, ...room.spectators]) {
    if (member.socketId) {
      io.to(member.socketId).emit(EVENTS.GAME_STATE, {
        game: publicGame(room, member.socketId),
      });
    }
  }
}

module.exports = {
  emitGameState,
  emitRoomState,
};
