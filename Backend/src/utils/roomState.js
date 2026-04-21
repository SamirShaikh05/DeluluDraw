function getDrawer(room) {
  if (!room.game || room.players.length === 0) return null;

  if (room.game.drawerId) {
    return room.players.find((player) => player.id === room.game.drawerId) || null;
  }

  const index = room.game.drawerIndex % room.players.length;
  return room.players[index];
}

module.exports = {
  getDrawer,
};
