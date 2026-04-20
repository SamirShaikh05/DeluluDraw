const rooms = require("../store/rooms");

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

module.exports = createRoomId;
