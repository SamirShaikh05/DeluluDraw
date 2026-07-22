function getDrawer(room) {
  if (!room.game || room.players.length === 0) return null;

  if (room.game.drawerId) {
    return room.players.find((player) => player.id === room.game.drawerId) || null;
  }

  const index = room.game.drawerIndex % room.players.length;
  return room.players[index];
}

function getPlayerForSocket(room, socketId) {
  return room?.players.find((player) => player.socketId === socketId) || null;
}

module.exports = {
  getDrawer,
  getPlayerForSocket,
};
