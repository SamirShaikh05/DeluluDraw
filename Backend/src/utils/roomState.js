function getDrawer(room) {
  if (!room.game || room.players.length === 0) return null;
  const index = room.game.drawerIndex % room.players.length;
  return room.players[index];
}

module.exports = {
  getDrawer,
};
