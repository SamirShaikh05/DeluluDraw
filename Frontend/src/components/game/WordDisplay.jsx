export function WordDisplay({ game, isDrawer, totalRounds }) {
  return (
    <div className="grid justify-items-center text-center">
      <small className="text-xs font-black uppercase text-[#172033]">round {game?.round || 1} of {totalRounds}</small>
      <strong className="max-w-full overflow-wrap-anywhere font-['Courier_New',monospace] text-[clamp(1rem,4vw,1.5625rem)] tracking-normal">
        {isDrawer ? game?.currentWord || "choose a word" : game?.maskedWord || "waiting"}
      </strong>
    </div>
  );
}
