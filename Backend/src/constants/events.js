const EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  ERROR: "error",

  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room",
  UPDATE_ROOM_SETTINGS: "update_room_settings",
  VOTE_KICK: "vote_kick",
  ROOM_JOINED: "room_joined",
  ROOM_STATE: "room_state",
  KICKED_FROM_ROOM: "kicked_from_room",
  PLAYER_LIST: "player_list",

  START_GAME: "start_game",
  CHOOSE_WORD: "choose_word",
  WORD_CHOSEN: "word_chosen",
  ROUND_START: "round_start",
  ROUND_END: "round_end",
  GAME_OVER: "game_over",
  GAME_STATE: "game_state",

  GUESS: "guess",
  MESSAGE: "message",
  SCORE_UPDATE: "score_update",

  DRAW_START: "draw_start",
  DRAW_MOVE: "draw_move",
  DRAW_END: "draw_end",
  DRAW_DATA: "draw_data",
  CANVAS_CLEAR: "canvas_clear",
};

module.exports = EVENTS;
