const words = require("../data/words.json");

function pickWords(count) {
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

module.exports = pickWords;
