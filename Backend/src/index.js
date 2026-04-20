const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const path = require("path");
const { Server } = require("socket.io");

const registerSocketHandlers = require("./socket/socketHandler");
const rooms = require("./store/rooms");
const loadEnv = require("./utils/env");

loadEnv(path.join(__dirname, "..", ".env"));

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

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

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`DeluluDraw server listening on http://localhost:${PORT}`);
});
