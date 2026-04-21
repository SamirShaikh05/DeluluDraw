import { useState } from "react";
import { MiniAvatar } from "../ui/MiniAvatar";

export function PlayerList({ drawerId, hostId, kickVotes = {}, myId, onKickVote, players, showKickVotes = false }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <aside className="h-full border-[3px] border-[#0c3579] bg-white md:border-t-0 max-md:grid max-md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
      <div className="bg-[#0c3579] p-2 text-center text-white">
        <h3 className="text-sm font-bold uppercase tracking-wide">Players</h3>
      </div>
      <div>
        {players.map((player, index) => {
          const isHovered = hoveredId === player.id;
          const canKick = showKickVotes && player.id !== myId;
          const hasVoted = kickVotes[player.id]?.hasVoted;

          return (
            <div
              key={player.id}
              className={`grid grid-cols-[28px_minmax(0,1fr)_30px] items-center gap-1.5 px-2 py-1.5 min-h-[44px] border-t border-gray-200 ${player.id === drawerId
                  ? "bg-[#cbf8ba]"
                  : index % 2 === 0
                    ? "bg-white"
                    : "bg-[#f8f9fa]"
                }`}
              onMouseEnter={() => canKick && setHoveredId(player.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Rank */}
              <span className="text-xs font-black text-[#111827] shrink-0">
                #{index + 1}
              </span>

              {/* Name / Score / Kick button */}
              <div className="relative min-w-0">
                {isHovered && canKick ? (
                  <div className="flex flex-col gap-0.5">
                    <button
                      className={`w-full rounded px-2 py-1 text-xs font-black text-white transition-colors ${hasVoted
                          ? "bg-[#dc2626] hover:bg-[#b91c1c]"
                          : "bg-[#ef4444] hover:bg-[#dc2626]"
                        }`}
                      onClick={() => onKickVote(player.id)}
                      type="button"
                    >
                      {hasVoted ? "✓ Voted" : "Kick"}
                    </button>
                    {kickVotes[player.id] && (
                      <p className="text-center text-[10px] font-bold text-[#dc2626] leading-tight">
                        {kickVotes[player.id].count}/{kickVotes[player.id].required} votes
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="truncate text-xs font-bold text-[#153e91] leading-tight">
                      {player.name}
                      {player.id === hostId && (
                        <span className="ml-0.5 text-[#d97706]">★</span>
                      )}
                    </p>
                    <p className="truncate text-[11px] font-semibold text-[#374151] leading-tight">
                      {player.score} pts
                    </p>
                  </>
                )}
              </div>

              {/* Avatar */}
              <MiniAvatar color={player.avatarColor} guessed={player.hasGuessed} />
            </div>
          );
        })}
      </div>
    </aside>
  );
}