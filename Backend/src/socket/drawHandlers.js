const EVENTS = require("../constants/events");
const rooms = require("../store/rooms");
const { getDrawer } = require("../utils/roomState");
const { clamp, sanitizeText } = require("../utils/validators");

function registerDrawHandlers(io, socket) {
  socket.on(EVENTS.DRAW_START, (payload = {}) => relayDraw(socket, "start", payload));
  socket.on(EVENTS.DRAW_MOVE, (payload = {}) => relayDraw(socket, "move", payload));
  socket.on(EVENTS.DRAW_END, (payload = {}) => relayDraw(socket, "end", payload));

  socket.on(EVENTS.CANVAS_CLEAR, ({ roomId } = {}) => {
    const room = rooms[sanitizeText(roomId).toUpperCase()];
    if (!room) return;

    const drawer = getDrawer(room);
    if (drawer?.id !== socket.id || room.game?.phase !== "drawing") return;
    io.to(room.id).emit(EVENTS.CANVAS_CLEAR);
  });
}

function relayDraw(socket, type, payload) {
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
  socket.to(room.id).emit(EVENTS.DRAW_DATA, data);
}

module.exports = {
  registerDrawHandlers,
};
