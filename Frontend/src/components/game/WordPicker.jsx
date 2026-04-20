export function WordPicker({ chooseWord, game, isDrawer, players, wordOptions }) {
  if (wordOptions.length > 0 && isDrawer) {
    return (
      <div className="word-picker">
        <h2>Pick a word</h2>
        <div>
          {wordOptions.map((word) => (
            <button key={word} onClick={() => chooseWord(word)} type="button">{word}</button>
          ))}
        </div>
      </div>
    );
  }

  if (game?.phase === "round_end") {
    return (
      <div className="word-picker compact">
        <h2>The word was {game.currentWord}</h2>
      </div>
    );
  }

  if (game?.phase === "game_over") {
    return (
      <div className="word-picker compact">
        <h2>Game over</h2>
        <p>{players[0]?.name || "Nobody"} wins this one.</p>
      </div>
    );
  }

  return null;
}
