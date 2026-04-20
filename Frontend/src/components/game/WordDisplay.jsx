export function WordDisplay({ game, isDrawer, totalRounds }) {
  return (
    <div className="round-copy">
      <small>round {game?.round || 1} of {totalRounds}</small>
      <strong>{isDrawer ? game?.currentWord || "choose a word" : game?.maskedWord || "waiting"}</strong>
    </div>
  );
}
