const EVENTS = require("../constants/events");

function addMessage(io, room, message) {
  const fullMessage = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: Date.now(),
    ...message,
  };
  room.chat.push(fullMessage);
  room.chat = room.chat.slice(-120);
  io.to(room.id).emit(EVENTS.MESSAGE, fullMessage);
}

module.exports = {
  addMessage,
};
