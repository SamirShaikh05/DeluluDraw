export function WordDisplay({ game, isDrawer, totalRounds }) {
  return (
    <div className="grid justify-items-center text-center">
      <small className="text-xs font-black uppercase text-[#172033]">round {game?.round || 1} of {totalRounds}</small>
      <strong className="overflow-wrap-anywhere font-['Courier_New',monospace] text-lg tracking-normal sm:text-[25px]">
        {isDrawer ? game?.currentWord || "choose a word" : game?.maskedWord || "waiting"}
      </strong>
    </div>
  );
}
