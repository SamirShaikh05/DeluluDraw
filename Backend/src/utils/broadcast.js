const EVENTS = require("../constants/events");
const { publicPlayer, roomSnapshot } = require("./serializers");

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

module.exports = {
  emitRoomState,
};
