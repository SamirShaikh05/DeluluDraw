export function WordPicker({ chooseWord, game, isDrawer, players, wordOptions }) {
  if (wordOptions.length > 0 && isDrawer) {
    return (
      <div className="absolute left-1/2 top-6.5 z-40 w-[min(92%,460px)] -translate-x-1/2 rounded-lg border-4 border-white bg-[rgba(14,45,105,0.94)] p-5.5 text-center text-white">
        <h2 className="mb-4 text-2xl font-bold">Pick a word</h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {wordOptions.map((word) => (
            <button className="min-h-11.5 bg-[#58df28] text-white" key={word} onClick={() => chooseWord(word)} type="button">{word}</button>
          ))}
        </div>
      </div>
    );
  }

  if (game?.phase === "round_end") {
    return (
      <div className="absolute left-1/2 top-6.5 z-40 w-[min(92%,360px)] -translate-x-1/2 rounded-lg border-4 border-white bg-[rgba(14,45,105,0.94)] p-5.5 text-center text-white">
        <h2 className="m-0 text-2xl font-bold">The word was {game.currentWord}</h2>
      </div>
    );
  }

  if (game?.phase === "game_over") {
    return (
      <div className="absolute left-1/2 top-6.5 z-40 w-[min(92%,360px)] -translate-x-1/2 rounded-lg border-4 border-white bg-[rgba(14,45,105,0.94)] p-5.5 text-center text-white">
        <h2 className="m-0 text-2xl font-bold">Game over</h2>
        <p className="m-0 mt-2">{players[0]?.name || "Nobody"} wins this one.</p>
      </div>
    );
  }

  return null;
}
