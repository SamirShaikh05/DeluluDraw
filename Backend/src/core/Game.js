class Game {
  constructor(settings, playerCount) {
    this.roundLimit = settings.rounds;
    this.phase = "choosing";
    this.round = 1;
    this.turn = 0;
    this.totalTurns = Math.max(1, this.roundLimit * playerCount);
    this.drawerIndex = 0;
    this.drawerId = "";
    this.currentWord = "";
    this.wordOptions = [];
    this.playersGuessed = [];
    this.revealedIndexes = [];
    this.startedAt = Date.now();
    this.endsAt = Date.now();
    this.timerRef = null;
    this.tickRef = null;
  }

  resetForChoosing(wordOptions, playerCount, chooseTimeMs, drawerId) {
    this.phase = "choosing";
    this.currentWord = "";
    this.playersGuessed = [];
    this.revealedIndexes = [];
    this.wordOptions = wordOptions;
    this.totalTurns = Math.max(this.turn + 1, this.roundLimit * playerCount);
    this.round = Math.floor(this.turn / Math.max(1, playerCount)) + 1;
    this.drawerIndex = this.turn % playerCount;
    this.drawerId = drawerId;
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
