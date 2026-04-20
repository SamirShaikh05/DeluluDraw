import { MiniAvatar } from "../ui/MiniAvatar";

export function PlayerList({ players, hostId, drawerId }) {
  return (
    <aside className="player-list">
      {players.map((player, index) => (
        <div className={player.id === drawerId ? "player-row drawing" : "player-row"} key={player.id}>
          <span className="rank">#{index + 1}</span>
          <div>
            <strong>{player.name}{player.id === hostId ? " *" : ""}</strong>
            <small>{player.score} points</small>
          </div>
          <MiniAvatar color={player.avatarColor} guessed={player.hasGuessed} />
        </div>
      ))}
    </aside>
  );
}
