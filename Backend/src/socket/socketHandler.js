const EVENTS = require("../constants/events");
const { registerChatHandlers } = require("./chatHandlers");
const { registerDrawHandlers } = require("./drawHandlers");
const { registerGameHandlers } = require("./gameHandlers");
const { registerRoomHandlers } = require("./roomHandlers");

function registerSocketHandlers(io) {
  io.on(EVENTS.CONNECTION, (socket) => {
    socket.on(EVENTS.PING, ({ timestamp } = {}) => {
      socket.emit(EVENTS.PONG, { timestamp });
    });
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerDrawHandlers(io, socket);
  });
}

module.exports = registerSocketHandlers;
