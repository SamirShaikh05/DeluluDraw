const { DEFAULT_SETTINGS } = require("../constants/config");

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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

module.exports = {
  clamp,
  normalizeSettings,
  normalizeWord,
  sanitizeName,
  sanitizeText,
};
