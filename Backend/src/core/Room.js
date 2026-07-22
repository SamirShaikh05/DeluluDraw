class Room {
  constructor(id, hostPlayer, settings, options = {}) {
    this.id = id;
    this.isPrivate = options.isPrivate ?? true;
    this.hostId = hostPlayer?.id || "";
    this.players = hostPlayer ? [hostPlayer] : [];
    this.spectators = [];
    this.chat = [];
    this.settings = settings;
    this.game = null;
    this.kickVotes = {};
    this.canvas = [];
  }

  addPlayer(player) {
    this.players.push(player);
    if (!this.hostId) this.hostId = player.id;
  }

  addSpectator(spectator) {
    this.spectators.push(spectator);
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

  removeSpectator(spectatorId) {
    const spectatorIndex = this.spectators.findIndex((spectator) => spectator.id === spectatorId);
    if (spectatorIndex === -1) return null;
    return this.spectators.splice(spectatorIndex, 1)[0];
  }

  isEmpty() {
    return this.players.length === 0 && this.spectators.length === 0;
  }
}

module.exports = Room;
