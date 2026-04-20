const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { createServer } = require("http");
const path = require("path");
const { Server } = require("socket.io");

loadEnv(path.join(__dirname, "..", ".env"));

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

const DEFAULT_SETTINGS = {
  maxPlayers: 12,
  rounds: 3,
  drawTime: 80,
  wordOptionsCount: 3,
  hints: 2,
};

const WORDS = [
  "scientist",
  "elephant",
  "rainbow",
  "pizza",
  "spaceship",
  "guitar",
  "dragon",
  "castle",
  "banana",
  "volcano",
  "robot",
  "pirate",
  "butterfly",
  "snowman",
  "camera",
  "dinosaur",
  "telescope",
  "mermaid",
  "rocket",
  "treasure",
  "penguin",
  "lighthouse",
  "wizard",
  "octopus",
  "skateboard",
  "sandwich",
  "mountain",
  "football",
  "umbrella",
  "helicopter",
];

const rooms = {};

function makeId(size = 5) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < size; i += 1) {
    id += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return id;
}

function createRoomId() {
  let id = makeId();
  while (rooms[id]) id = makeId();
  return id;
}

function sanitizeName(name) {
  if (typeof name !== "string") return "";
  return name.trim().replace(/\s+/g, " ").slice(0, 20);
}

function sanitizeText(text) {
  if (typeof text !== "string") return "";
  return text.trim().replace(/\s+/g, " ").slice(0, 140);
}

function normalizeWord(text) {
  return sanitizeText(text).toLowerCase();
}

function normalizeSettings(settings = {}) {
  return {
    maxPlayers: clamp(Number(settings.maxPlayers) || DEFAULT_SETTINGS.maxPlayers, 2, 20),
    rounds: clamp(Number(settings.rounds) || DEFAULT_SETTINGS.rounds, 1, 10),
    drawTime: clamp(Number(settings.drawTime) || DEFAULT_SETTINGS.drawTime, 15, 240),
    wordOptionsCount: clamp(
      Number(settings.wordOptionsCount) || DEFAULT_SETTINGS.wordOptionsCount,
      1,
      5
    ),
    hints: clamp(Number(settings.hints) || DEFAULT_SETTINGS.hints, 0, 5),
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createPlayer(socket, name) {
  return {
    id: socket.id,
    name,
    score: 0,
    hasGuessed: false,
    isConnected: true,
    avatarColor: pickAvatarColor(socket.id),
  };
}

function pickAvatarColor(id) {
  const colors = ["#e94747", "#f59e0b", "#ffe047", "#55d63b", "#38dbe8", "#516dff", "#a338e8", "#ff70bd"];
  let total = 0;
  for (const char of id) total += char.charCodeAt(0);
  return colors[total % colors.length];
}

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

function emitRoomState(io, room) {
  for (const player of room.players) {
    io.to(player.id).emit("room_state", roomSnapshot(room, player.id));
  }
  io.to(room.id).emit("player_list", {
    players: room.players.map(publicPlayer),
    hostId: room.hostId,
  });
}

function addMessage(io, room, message) {
  const fullMessage = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: Date.now(),
    ...message,
  };
  room.chat.push(fullMessage);
  room.chat = room.chat.slice(-120);
  io.to(room.id).emit("message", fullMessage);
}

function pickWords(count) {
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getDrawer(room) {
  if (!room.game || room.players.length === 0) return null;
  const index = room.game.drawerIndex % room.players.length;
  return room.players[index];
}

function clearTimers(game) {
  if (game?.timerRef) clearTimeout(game.timerRef);
  if (game?.tickRef) clearInterval(game.tickRef);
  if (game) {
    game.timerRef = null;
    game.tickRef = null;
  }
}

function startGame(io, room) {
  room.players.forEach((player) => {
    player.score = 0;
    player.hasGuessed = false;
  });
  room.game = {
    phase: "choosing",
    round: 1,
    turn: 0,
    totalTurns: Math.max(1, room.settings.rounds * room.players.length),
    drawerIndex: 0,
    currentWord: "",
    wordOptions: [],
    playersGuessed: [],
    revealedIndexes: [],
    startedAt: Date.now(),
    endsAt: Date.now(),
    timerRef: null,
    tickRef: null,
  };
  beginChoosing(io, room);
}

function beginChoosing(io, room) {
  const game = room.game;
  if (!game || room.players.length === 0) return;
  clearTimers(game);
  room.players.forEach((player) => {
    player.hasGuessed = false;
  });
  game.phase = "choosing";
  game.currentWord = "";
  game.playersGuessed = [];
  game.revealedIndexes = [];
  game.wordOptions = pickWords(room.settings.wordOptionsCount);
  game.round = Math.floor(game.turn / Math.max(1, room.players.length)) + 1;
  game.drawerIndex = game.turn % room.players.length;
  game.startedAt = Date.now();
  game.endsAt = Date.now() + 15000;

  const drawer = getDrawer(room);
  io.to(room.id).emit("canvas_clear");
  addMessage(io, room, {
    type: "system",
    text: `${drawer.name} is choosing a word.`,
  });
  io.to(drawer.id).emit("choose_word", { wordOptions: game.wordOptions });
  emitRoomState(io, room);

  game.timerRef = setTimeout(() => {
    if (game.phase === "choosing") chooseWord(io, room, drawer.id, game.wordOptions[0]);
  }, 15000);
}

function chooseWord(io, room, socketId, word) {
  const game = room.game;
  const drawer = getDrawer(room);
  if (!game || !drawer || drawer.id !== socketId || game.phase !== "choosing") return false;

  const chosen = normalizeWord(word);
  if (!game.wordOptions.includes(chosen)) return false;

  clearTimers(game);
  game.currentWord = chosen;
  game.phase = "drawing";
  game.startedAt = Date.now();
  game.endsAt = game.startedAt + room.settings.drawTime * 1000;
  game.revealedIndexes = [];

  addMessage(io, room, {
    type: "system",
    text: `${drawer.name} started drawing.`,
  });
  io.to(room.id).emit("round_start", {
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
    io.to(room.id).emit("game_state", { game: publicGame(room) });
  }
}

function endRound(io, roomId) {
  const room = rooms[roomId];
  const game = room?.game;
  if (!room || !game || game.phase === "round_end" || game.phase === "game_over") return;
  clearTimers(game);
  game.phase = "round_end";
  game.endsAt = Date.now();

  addMessage(io, room, {
    type: "system",
    text: `The word was "${game.currentWord}".`,
  });
  io.to(room.id).emit("round_end", {
    word: game.currentWord,
    scores: room.players.map(({ id, name, score }) => ({ id, name, score })),
  });
  emitRoomState(io, room);

  setTimeout(() => {
    const latestRoom = rooms[roomId];
    if (!latestRoom?.game) return;
    latestRoom.game.turn += 1;
    if (latestRoom.game.turn >= latestRoom.game.totalTurns || latestRoom.players.length === 0) {
      latestRoom.game.phase = "game_over";
      const leaderboard = [...latestRoom.players]
        .sort((a, b) => b.score - a.score)
        .map(publicPlayer);
      io.to(latestRoom.id).emit("game_over", { leaderboard });
      emitRoomState(io, latestRoom);
      return;
    }
    beginChoosing(io, latestRoom);
  }, 4500);
}

function handleCorrectGuess(io, room, player) {
  const game = room.game;
  const drawer = getDrawer(room);
  if (!game || !drawer) return;
  const orderIndex = game.playersGuessed.length;
  const points = Math.max(20, 100 - orderIndex * 20);
  player.score += points;
  player.hasGuessed = true;
  game.playersGuessed.push(player.id);
  drawer.score += 20;

  addMessage(io, room, {
    type: "system",
    text: `${player.name} guessed the word!`,
    playerId: player.id,
    playerName: player.name,
  });
  io.to(room.id).emit("score_update", {
    scores: room.players.map(({ id, name, score }) => ({ id, name, score })),
  });
  emitRoomState(io, room);

  const guessers = room.players.filter((candidate) => candidate.id !== drawer.id);
  if (guessers.length > 0 && guessers.every((candidate) => candidate.hasGuessed)) {
    endRound(io, room.id);
  }
}

function removePlayerFromRooms(io, socket) {
  for (const room of Object.values(rooms)) {
    const playerIndex = room.players.findIndex((player) => player.id === socket.id);
    if (playerIndex === -1) continue;

    const wasDrawer = room.game && getDrawer(room)?.id === socket.id;
    const [player] = room.players.splice(playerIndex, 1);
    socket.leave(room.id);
    addMessage(io, room, {
      type: "system",
      text: `${player.name} left the room.`,
    });

    if (room.players.length === 0) {
      clearTimers(room.game);
      delete rooms[room.id];
      continue;
    }

    if (room.hostId === socket.id) room.hostId = room.players[0].id;
    if (wasDrawer && room.game?.phase === "drawing") {
      endRound(io, room.id);
    } else if (wasDrawer && room.game?.phase === "choosing") {
      beginChoosing(io, room);
    } else {
      emitRoomState(io, room);
    }
  }
}

const app = express();
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.get("/health", (_, res) => {
  res.json({ ok: true, rooms: Object.keys(rooms).length });
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("create_room", ({ playerName, settings } = {}) => {
    const name = sanitizeName(playerName);
    if (!name) return socket.emit("error", { message: "Enter a name first." });

    const roomId = createRoomId();
    const player = createPlayer(socket, name);
    const room = {
      id: roomId,
      hostId: socket.id,
      players: [player],
      chat: [],
      settings: normalizeSettings(settings),
      game: null,
    };
    rooms[roomId] = room;
    socket.join(roomId);
    socket.emit("room_joined", { roomId, player: publicPlayer(player), hostId: room.hostId });
    addMessage(io, room, { type: "system", text: `${name} created the room.` });
    emitRoomState(io, room);
  });

  socket.on("join_room", ({ roomId, playerName } = {}) => {
    const id = sanitizeText(roomId).toUpperCase();
    const name = sanitizeName(playerName);
    const room = rooms[id];
    if (!name) return socket.emit("error", { message: "Enter a name first." });
    if (!room) return socket.emit("error", { message: "That room does not exist." });
    if (room.players.length >= room.settings.maxPlayers) {
      return socket.emit("error", { message: "That room is full." });
    }
    if (room.game && room.game.phase !== "game_over") {
      return socket.emit("error", { message: "That game is already running." });
    }

    const player = createPlayer(socket, name);
    room.players.push(player);
    socket.join(id);
    socket.emit("room_joined", { roomId: id, player: publicPlayer(player), hostId: room.hostId });
    addMessage(io, room, { type: "system", text: `${name} joined the room.` });
    emitRoomState(io, room);
  });

  socket.on("start_game", ({ roomId } = {}) => {
    const room = rooms[sanitizeText(roomId).toUpperCase()];
    if (!room) return socket.emit("error", { message: "Room not found." });
    if (room.hostId !== socket.id) return socket.emit("error", { message: "Only the host can start." });
    startGame(io, room);
  });

  socket.on("word_chosen", ({ roomId, word } = {}) => {
    const room = rooms[sanitizeText(roomId).toUpperCase()];
    if (!room || !chooseWord(io, room, socket.id, word)) {
      socket.emit("error", { message: "That word cannot be chosen now." });
    }
  });

  socket.on("guess", ({ roomId, text } = {}) => {
    const room = rooms[sanitizeText(roomId).toUpperCase()];
    if (!room) return socket.emit("error", { message: "Room not found." });
    const player = room.players.find((candidate) => candidate.id === socket.id);
    const drawer = getDrawer(room);
    const game = room.game;
    const cleanText = sanitizeText(text);
    if (!player || !cleanText) return;
    if (!game || game.phase !== "drawing") {
      return addMessage(io, room, {
        type: "chat",
        text: cleanText,
        playerId: player.id,
        playerName: player.name,
      });
    }
    if (drawer?.id === socket.id) return socket.emit("error", { message: "The drawer cannot guess." });
    if (player.hasGuessed) return socket.emit("error", { message: "You already guessed it." });

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

  socket.on("draw_start", (payload = {}) => relayDraw(io, socket, "start", payload));
  socket.on("draw_move", (payload = {}) => relayDraw(io, socket, "move", payload));
  socket.on("draw_end", (payload = {}) => relayDraw(io, socket, "end", payload));

  socket.on("canvas_clear", ({ roomId } = {}) => {
    const room = rooms[sanitizeText(roomId).toUpperCase()];
    if (!room) return;
    const drawer = getDrawer(room);
    if (drawer?.id !== socket.id || room.game?.phase !== "drawing") return;
    io.to(room.id).emit("canvas_clear");
  });

  socket.on("disconnect", () => {
    removePlayerFromRooms(io, socket);
  });
});

function relayDraw(io, socket, type, payload) {
  const room = rooms[sanitizeText(payload.roomId).toUpperCase()];
  if (!room || room.game?.phase !== "drawing") return;
  const drawer = getDrawer(room);
  if (drawer?.id !== socket.id) return;

  const data = {
    type,
    x: clamp(Number(payload.x) || 0, 0, 1),
    y: clamp(Number(payload.y) || 0, 0, 1),
    color: typeof payload.color === "string" ? payload.color.slice(0, 24) : "#111827",
    size: clamp(Number(payload.size) || 5, 1, 40),
  };
  socket.to(room.id).emit("draw_data", data);
}

server.listen(PORT, () => {
  console.log(`DeluluDraw server listening on http://localhost:${PORT}`);
});
