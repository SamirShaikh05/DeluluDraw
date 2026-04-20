const EVENTS = require("../constants/events");
const { publicPlayer, roomSnapshot } = require("./serializers");

function emitRoomState(io, room) {
  for (const player of room.players) {
    io.to(player.id).emit(EVENTS.ROOM_STATE, roomSnapshot(room, player.id));
  }
  io.to(room.id).emit(EVENTS.PLAYER_LIST, {
    players: room.players.map(publicPlayer),
    hostId: room.hostId,
  });
}

module.exports = {
  emitRoomState,
};
