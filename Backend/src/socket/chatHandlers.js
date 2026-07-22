const EVENTS = require("../constants/events");
const rooms = require("../store/rooms");
const { addMessage } = require("../utils/messages");
const { getDrawer, getMemberForSocket } = require("../utils/roomState");
const { normalizeWord, sanitizeText } = require("../utils/validators");
const { handleCorrectGuess } = require("./gameHandlers");

function registerChatHandlers(io, socket) {
  socket.on(EVENTS.GUESS, ({ roomId, text } = {}) => {
    const room = rooms[sanitizeText(roomId).toUpperCase()];
    if (!room) return socket.emit(EVENTS.ERROR, { message: "Room not found." });

    const player = getMemberForSocket(room, socket.id);
    const drawer = getDrawer(room);
    const game = room.game;
    const cleanText = sanitizeText(text);
    if (!player || !cleanText) return;

    if (player.isSpectator) {
      return addMessage(io, room, {
        type: "chat",
        text: cleanText,
        playerId: player.id,
        playerName: player.name,
      });
    }

    if (!game || game.phase !== "drawing") {
      return addMessage(io, room, {
        type: "chat",
        text: cleanText,
        playerId: player.id,
        playerName: player.name,
      });
    }
    if (drawer?.id === player.id) return socket.emit(EVENTS.ERROR, { message: "The drawer cannot guess." });
    if (player.hasGuessed) return socket.emit(EVENTS.ERROR, { message: "You already guessed it." });

    if (normalizeWord(cleanText) === game.currentWord) {
      handleCorrectGuess(io, room, player);
      return;
    }

    addMessage(io, room, {
      type: "chat",
      text: cleanText,
      playerId: player.id,
      playerName: player.name,
    });
  });
}

module.exports = {
  registerChatHandlers,
};
