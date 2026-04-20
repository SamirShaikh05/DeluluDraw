class Room {
  constructor(id, hostPlayer, settings) {
    this.id = id;
    this.hostId = hostPlayer.id;
    this.players = [hostPlayer];
    this.chat = [];
    this.settings = settings;
    this.game = null;
  }

  addPlayer(player) {
    this.players.push(player);
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
