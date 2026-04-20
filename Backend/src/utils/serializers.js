const { getDrawer } = require("./roomState");

function publicPlayer(player) {
  return {
    id: player.id,
    name: player.name,
    score: player.score,
    hasGuessed: player.hasGuessed,
    isConnected: player.isConnected,
    avatarColor: player.avatarColor,
  };
}

function publicGame(room, forSocketId) {
  if (!room.game) return null;
  const { timerRef, tickRef, ...game } = room.game;
  const drawer = getDrawer(room);
  const isDrawer = drawer?.id === forSocketId;
  return {
    ...game,
    currentWord: isDrawer || game.phase === "round_end" || game.phase === "game_over" ? game.currentWord : "",
    maskedWord: maskWord(game.currentWord, game.revealedIndexes || []),
    drawerId: drawer?.id || "",
    drawerName: drawer?.name || "",
    remaining: Math.max(0, Math.ceil((game.endsAt - Date.now()) / 1000)),
  };
}

function roomSnapshot(room, forSocketId) {
  return {
    roomId: room.id,
    hostId: room.hostId,
    settings: room.settings,
    players: room.players.map(publicPlayer),
    messages: room.chat.slice(-80),
    game: publicGame(room, forSocketId),
  };
}

function maskWord(word, revealedIndexes = []) {
  if (!word) return "";
  const revealed = new Set(revealedIndexes);
  return word
    .split("")
    .map((char, index) => {
      if (char === " ") return " ";
      return revealed.has(index) ? char : "_";
    })
    .join(" ");
}

module.exports = {
  publicGame,
  publicPlayer,
  roomSnapshot,
};
