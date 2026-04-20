function clearTimers(game) {
  if (game?.timerRef) clearTimeout(game.timerRef);
  if (game?.tickRef) clearInterval(game.tickRef);
  if (game) {
    game.timerRef = null;
    game.tickRef = null;
  }
}

module.exports = {
  clearTimers,
};
