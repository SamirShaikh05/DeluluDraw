import { MiniAvatar } from "../ui/MiniAvatar";

export function PlayerList({ drawerId, hostId, kickVotes = {}, myId, onKickVote, players, showKickVotes = false }) {
  return (
    <aside className="rounded-xl border-4 border-[#0c3579] bg-white shadow-2xl md:border-t-0 md:[grid-area:auto] max-md:grid max-md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] max-md:gap-2">
      <div className="rounded-t-lg bg-gradient-to-r from-[#1e62bd] to-[#0f46a3] p-4 text-center text-white">
        <h3 className="text-xl font-black uppercase tracking-wide">Players</h3>
        <p className="text-sm font-bold text-[#dbeafe]">{players.length} in room</p>
      </div>
      <div className="divide-y divide-gray-200">
        {players.map((player, index) => (
          <div
            className={`grid min-h-16 grid-cols-[40px_minmax(0,1fr)_50px] items-center gap-3 px-4 py-3 transition-colors ${
              player.id === drawerId
                ? "bg-[#cbf8ba] border-l-4 border-[#22c55e]"
                : index % 2 === 0
                  ? "bg-white hover:bg-gray-50"
                  : "bg-[#f8f9fa] hover:bg-gray-100"
            }`}
            key={player.id}
          >
            <span className="font-black text-[#111827] text-lg">#{index + 1}</span>
            <div className="min-w-0">
              <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-base font-bold text-[#153e91]">
                {player.name}
                {player.id === hostId && <span className="ml-1 text-[#f2e84b] font-black">*</span>}
              </strong>
              <small className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-extrabold text-[#111827]">{player.score} points</small>
              {showKickVotes && player.id !== myId && (
                <button
                  className={`mt-2 inline-flex min-h-8 items-center gap-1 rounded-lg px-3 py-1 text-xs font-black uppercase tracking-wide transition-all focus:outline-none focus:ring-2 ${
                    kickVotes[player.id]?.hasVoted
                      ? "bg-[#ef4444] text-white hover:bg-[#dc2626] focus:ring-[#ef4444] shadow-md"
                      : "bg-[#f87171] text-white hover:bg-[#ef4444] focus:ring-[#f87171] shadow-sm"
                  }`}
                  onClick={() => onKickVote(player.id)}
                  type="button"
                  title={kickVotes[player.id]?.hasVoted ? "Remove your vote to kick this player" : "Vote to kick this player"}
                >
                  {kickVotes[player.id]?.hasVoted ? "✓ Voted" : "👢 Kick"}
                  {kickVotes[player.id] && (
                    <span className="ml-1 font-bold">
                      {kickVotes[player.id].count}/{kickVotes[player.id].required}
                    </span>
                  )}
                </button>
              )}
            </div>
            <MiniAvatar color={player.avatarColor} guessed={player.hasGuessed} />
          </div>
        ))}
      </div>
    </aside>
  );
}
