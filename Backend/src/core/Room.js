class Room {
  constructor(id, hostPlayer, settings, options = {}) {
    this.id = id;
    this.isPrivate = options.isPrivate ?? true;
    this.hostId = hostPlayer?.id || "";
    this.players = hostPlayer ? [hostPlayer] : [];
    this.chat = [];
    this.settings = settings;
    this.game = null;
    this.kickVotes = {};
  }

  addPlayer(player) {
    this.players.push(player);
    if (!this.hostId) this.hostId = player.id;
  }

  removePlayer(playerId) {
    const playerIndex = this.players.findIndex((player) => player.id === playerId);
    if (playerIndex === -1) return null;

    const [player] = this.players.splice(playerIndex, 1);
    if (this.hostId === playerId && this.players.length > 0) {
      this.hostId = this.players[0].id;
    }
    return player;
  }

  isEmpty() {
    return this.players.length === 0;
  }
}

module.exports = Room;
