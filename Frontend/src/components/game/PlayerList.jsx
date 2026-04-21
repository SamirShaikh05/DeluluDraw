import { MiniAvatar } from "../ui/MiniAvatar";

export function PlayerList({ drawerId, hostId, kickVotes = {}, myId, onKickVote, players, showKickVotes = false }) {
  return (
    <aside className="border-x-[3px] border-b-[3px] border-[#0c3579] bg-white md:border-t-0 md:[grid-area:auto] max-md:grid max-md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
      {players.map((player, index) => (
        <div
          className={`grid min-h-14 grid-cols-[38px_minmax(0,1fr)_42px] items-center gap-1.5 px-[7px] py-[5px] ${
            player.id === drawerId
              ? "bg-[#cbf8ba]"
              : index % 2 === 0
                ? "bg-white"
                : "bg-[#ececec]"
          }`}
          key={player.id}
        >
          <span className="font-black text-[#111827]">#{index + 1}</span>
          <div>
            <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold text-[#153e91]">
              {player.name}
              {player.id === hostId ? " *" : ""}
            </strong>
            <small className="block overflow-hidden text-ellipsis whitespace-nowrap text-xs font-extrabold text-[#111827]">{player.score} points</small>
            {showKickVotes && player.id !== myId && (
              <button
                className="mt-1 inline-flex min-h-0 rounded bg-[#153e91] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
                onClick={() => onKickVote(player.id)}
                type="button"
              >
                {kickVotes[player.id]?.hasVoted ? "Remove vote" : "Vote kick"}
                {kickVotes[player.id] ? ` ${kickVotes[player.id].count}/${kickVotes[player.id].required}` : ""}
              </button>
            )}
          </div>
          <MiniAvatar color={player.avatarColor} guessed={player.hasGuessed} />
        </div>
      ))}
    </aside>
  );
}
