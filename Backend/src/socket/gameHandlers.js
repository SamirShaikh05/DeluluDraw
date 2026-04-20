const EVENTS = require("../constants/events");
const { CHOOSE_TIME_MS, ROUND_TRANSITION_MS } = require("../constants/config");
const Game = require("../core/Game");
const rooms = require("../store/rooms");
const { emitRoomState } = require("../utils/broadcast");
const { addMessage } = require("../utils/messages");
const { getDrawer } = require("../utils/roomState");
const { publicGame, publicPlayer } = require("../utils/serializers");
const { drawerPoints, guessPoints } = require("../utils/scoreCalculator");
const { clearTimers } = require("../utils/timers");
const { normalizeWord, sanitizeText } = require("../utils/validators");
const pickWords = require("../utils/wordSelector");

function registerGameHandlers(io, socket) {
  socket.on(EVENTS.START_GAME, ({ roomId } = {}) => {
    const room = rooms[sanitizeText(roomId).toUpperCase()];
    if (!room) return socket.emit(EVENTS.ERROR, { message: "Room not found." });
    if (room.hostId !== socket.id) return socket.emit(EVENTS.ERROR, { message: "Only the host can start." });
    startGame(io, room);
  });

  socket.on(EVENTS.WORD_CHOSEN, ({ roomId, word } = {}) => {
    const room = rooms[sanitizeText(roomId).toUpperCase()];
    if (!room || !chooseWord(io, room, socket.id, word)) {
      socket.emit(EVENTS.ERROR, { message: "That word cannot be chosen now." });
    }
  });
}

function startGame(io, room) {
  room.players.forEach((player) => {
    player.score = 0;
    player.hasGuessed = false;
  });
  room.game = new Game(room.settings, room.players.length);
  beginChoosing(io, room);
}

function beginChoosing(io, room) {
  const game = room.game;
  if (!game || room.players.length === 0) return;

  clearTimers(game);
  room.players.forEach((player) => {
    player.hasGuessed = false;
  });
  game.resetForChoosing(pickWords(room.settings.wordOptionsCount), room.players.length, CHOOSE_TIME_MS);

  const drawer = getDrawer(room);
  io.to(room.id).emit(EVENTS.CANVAS_CLEAR);
  addMessage(io, room, {
    type: "system",
    text: `${drawer.name} is choosing a word.`,
  });
  io.to(drawer.id).emit(EVENTS.CHOOSE_WORD, { wordOptions: game.wordOptions });
  emitRoomState(io, room);

  game.timerRef = setTimeout(() => {
    if (game.phase === "choosing") chooseWord(io, room, drawer.id, game.wordOptions[0]);
  }, CHOOSE_TIME_MS);
}

function chooseWord(io, room, socketId, word) {
  const game = room.game;
  const drawer = getDrawer(room);
  if (!game || !drawer || drawer.id !== socketId || game.phase !== "choosing") return false;

  const chosen = normalizeWord(word);
  if (!game.wordOptions.includes(chosen)) return false;

  clearTimers(game);
  game.startDrawing(chosen, room.settings.drawTime);

  addMessage(io, room, {
    type: "system",
    text: `${drawer.name} started drawing.`,
  });
  io.to(room.id).emit(EVENTS.ROUND_START, {
    drawerId: drawer.id,
    drawerName: drawer.name,
    drawTime: room.settings.drawTime,
  });
  emitRoomState(io, room);

  game.tickRef = setInterval(() => {
    revealHintIfNeeded(io, room);
    emitRoomState(io, room);
  }, 1000);

  game.timerRef = setTimeout(() => endRound(io, room.id), room.settings.drawTime * 1000);
  return true;
}

function revealHintIfNeeded(io, room) {
  const game = room.game;
  if (!game || game.phase !== "drawing" || !game.currentWord) return;

  const elapsed = Date.now() - game.startedAt;
  const duration = room.settings.drawTime * 1000;
  const maxHints = Math.min(room.settings.hints, game.currentWord.replace(/\s/g, "").length - 1);
  if (maxHints <= 0) return;

  const desiredHints = Math.floor((elapsed / duration) * (maxHints + 1));
  while (game.revealedIndexes.length < desiredHints) {
    const hidden = game.currentWord
      .split("")
      .map((char, index) => ({ char, index }))
      .filter(({ char, index }) => char !== " " && !game.revealedIndexes.includes(index));
    if (!hidden.length) break;

    const next = hidden[Math.floor(Math.random() * hidden.length)].index;
    game.revealedIndexes.push(next);
    io.to(room.id).emit(EVENTS.GAME_STATE, { game: publicGame(room) });
  }
}

function endRound(io, roomId) {
  const room = rooms[roomId];
  const game = room?.game;
  if (!room || !game || game.phase === "round_end" || game.phase === "game_over") return;

  clearTimers(game);
  game.endRound();

  addMessage(io, room, {
    type: "system",
    text: `The word was "${game.currentWord}".`,
  });
  io.to(room.id).emit(EVENTS.ROUND_END, {
    word: game.currentWord,
    scores: room.players.map(({ id, name, score }) => ({ id, name, score })),
  });
  emitRoomState(io, room);

  setTimeout(() => {
    const latestRoom = rooms[roomId];
    if (!latestRoom?.game) return;

    latestRoom.game.advanceTurn();
    if (latestRoom.game.isComplete() || latestRoom.players.length === 0) {
      latestRoom.game.phase = "game_over";
      const leaderboard = [...latestRoom.players]
        .sort((a, b) => b.score - a.score)
        .map(publicPlayer);
      io.to(latestRoom.id).emit(EVENTS.GAME_OVER, { leaderboard });
      emitRoomState(io, latestRoom);
      return;
    }
    beginChoosing(io, latestRoom);
  }, ROUND_TRANSITION_MS);
}

function handleCorrectGuess(io, room, player) {
  const game = room.game;
  const drawer = getDrawer(room);
  if (!game || !drawer) return;

  const orderIndex = game.playersGuessed.length;
  player.score += guessPoints(orderIndex);
  player.hasGuessed = true;
  game.playersGuessed.push(player.id);
  drawer.score += drawerPoints();

  addMessage(io, room, {
    type: "system",
    text: `${player.name} guessed the word!`,
    playerId: player.id,
    playerName: player.name,
  });
  io.to(room.id).emit(EVENTS.SCORE_UPDATE, {
    scores: room.players.map(({ id, name, score }) => ({ id, name, score })),
  });
  emitRoomState(io, room);

  const guessers = room.players.filter((candidate) => candidate.id !== drawer.id);
  if (guessers.length > 0 && guessers.every((candidate) => candidate.hasGuessed)) {
    endRound(io, room.id);
  }
}

module.exports = {
  beginChoosing,
  endRound,
  handleCorrectGuess,
  registerGameHandlers,
  startGame,
};
