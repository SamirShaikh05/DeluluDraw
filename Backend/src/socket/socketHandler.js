const EVENTS = require("../constants/events");
const { registerChatHandlers } = require("./chatHandlers");
const { registerDrawHandlers } = require("./drawHandlers");
const { registerGameHandlers } = require("./gameHandlers");
const { registerRoomHandlers } = require("./roomHandlers");

function registerSocketHandlers(io) {
  io.on(EVENTS.CONNECTION, (socket) => {
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerDrawHandlers(io, socket);
  });
}

module.exports = registerSocketHandlers;
