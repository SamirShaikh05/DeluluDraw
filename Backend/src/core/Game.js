class Game {
  constructor(settings, playerCount) {
    this.phase = "choosing";
    this.round = 1;
    this.turn = 0;
    this.totalTurns = Math.max(1, settings.rounds * playerCount);
    this.drawerIndex = 0;
    this.currentWord = "";
    this.wordOptions = [];
    this.playersGuessed = [];
    this.revealedIndexes = [];
    this.startedAt = Date.now();
    this.endsAt = Date.now();
    this.timerRef = null;
    this.tickRef = null;
  }

  resetForChoosing(wordOptions, playerCount, chooseTimeMs) {
    this.phase = "choosing";
    this.currentWord = "";
    this.playersGuessed = [];
    this.revealedIndexes = [];
    this.wordOptions = wordOptions;
    this.round = Math.floor(this.turn / Math.max(1, playerCount)) + 1;
    this.drawerIndex = this.turn % playerCount;
    this.startedAt = Date.now();
    this.endsAt = Date.now() + chooseTimeMs;
  }

  startDrawing(word, drawTime) {
    this.currentWord = word;
    this.phase = "drawing";
    this.startedAt = Date.now();
    this.endsAt = this.startedAt + drawTime * 1000;
    this.revealedIndexes = [];
  }

  endRound() {
    this.phase = "round_end";
    this.endsAt = Date.now();
  }

  advanceTurn() {
    this.turn += 1;
  }

  isComplete() {
    return this.turn >= this.totalTurns;
  }
}

module.exports = Game;
