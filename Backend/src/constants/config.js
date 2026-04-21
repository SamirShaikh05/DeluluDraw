const DEFAULT_SETTINGS = {
  maxPlayers: 12,
  rounds: 3,
  drawTime: 80,
  wordOptionsCount: 3,
  hints: 2,
};

const MIN_PLAYERS_TO_START = 2;
const PUBLIC_ROOM_ID = "GLOBAL";
const CHOOSE_TIME_MS = 15000;
const ROUND_TRANSITION_MS = 4500;

module.exports = {
  CHOOSE_TIME_MS,
  DEFAULT_SETTINGS,
  MIN_PLAYERS_TO_START,
  PUBLIC_ROOM_ID,
  ROUND_TRANSITION_MS,
};
