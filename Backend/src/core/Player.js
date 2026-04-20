const AVATAR_COLORS = ["#e94747", "#f59e0b", "#ffe047", "#55d63b", "#38dbe8", "#516dff", "#a338e8", "#ff70bd"];

class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.score = 0;
    this.hasGuessed = false;
    this.isConnected = true;
    this.avatarColor = pickAvatarColor(id);
  }
}

function pickAvatarColor(id) {
  let total = 0;
  for (const char of id) total += char.charCodeAt(0);
  return AVATAR_COLORS[total % AVATAR_COLORS.length];
}

module.exports = Player;
