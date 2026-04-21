import { useState } from "react";
import { PlayerList } from "../components/game/PlayerList";

export function Lobby({ goHome, isHost, myId, notice, onKickVote, players, room, startGame, updateRoomSettings }) {
  const [copied, setCopied] = useState(false);
  const isPrivate = room.isPrivate;
  const waitingForPlayers = !isPrivate && players.length < 2;
  const showKickVotes = !isPrivate && players.length >= 3;

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(room.roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <section className="relative z-10 mx-auto my-14.5 grid w-[min(100%-20px,620px)] grid-cols-1 gap-6 md:w-[min(100%-28px,920px)] md:grid-cols-[minmax(0,1fr)_320px] md:gap-8">
      <div className="rounded-xl border-4 border-[rgba(255,255,255,0.2)] bg-gradient-to-br from-[rgba(9,50,122,0.8)] to-[rgba(15,70,163,0.8)] p-8 text-white shadow-2xl md:p-12">
        <p className="m-0 font-black uppercase text-[#f2e84b] text-lg tracking-wide">{isPrivate ? "Private Room" : "Public Match"}</p>
        {isPrivate ? (
          <div className="mt-4 flex items-center gap-4">
            <h1 className="text-4xl font-black leading-none md:text-5xl">Room Code:</h1>
            <div className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-2">
              <span className="text-3xl font-black text-white md:text-4xl">{room.roomId}</span>
              <button
                onClick={copyRoomCode}
                className="rounded-md bg-[#58df28] px-3 py-1 text-sm font-bold text-white transition-colors hover:bg-[#4ade80] focus:outline-none focus:ring-2 focus:ring-[#58df28]"
                type="button"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        ) : (
          <h1 className="my-4 text-5xl leading-none font-black md:text-7xl">LIVE</h1>
        )}
        <p className="mt-6 max-w-lg text-lg font-bold leading-relaxed text-[#dbeafe]">
          {isPrivate
            ? "Share this code with friends. The host starts the game when the room feels loud enough."
            : waitingForPlayers
              ? "Waiting for players. The public match starts automatically as soon as two players are here."
              : "The public match is getting ready. You'll be moved into the round automatically."}
        </p>
        {isPrivate && (
          <>
            <div className="mt-8">
              <label className="grid max-w-48 gap-2 font-black text-white">
                <span className="text-lg">Rounds</span>
                <input
                  className="w-full rounded-lg border-2 border-[#d4dded] bg-white px-4 py-3 font-bold text-[#172033] outline-none focus:border-[#72e34b] focus:ring-2 focus:ring-[#72e34b]/20 disabled:cursor-not-allowed disabled:bg-[#dbeafe] transition-colors"
                  type="number"
                  min="1"
                  max="10"
                  value={room.settings.rounds}
                  onChange={(event) => updateRoomSettings({ rounds: event.target.value })}
                  disabled={!isHost}
                />
              </label>
              <p className="mt-3 text-sm font-bold text-[#dbeafe]">
                {isHost ? "Private rooms start with 3 rounds by default, but you can change it before starting." : "Only the host can change the round count before the game starts."}
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_160px]">
              <button
                className="min-h-14 w-full rounded-lg bg-[#58df28] text-xl font-extrabold text-white shadow-lg transition-all hover:bg-[#4ade80] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#58df28] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-[#58df28]"
                onClick={startGame}
                disabled={!isHost}
                type="button"
              >
                {isHost ? "Start Game" : "Waiting For Host"}
              </button>
              <button
                className="min-h-14 w-full rounded-lg bg-[#2f97e8] text-xl font-extrabold text-white shadow-lg transition-all hover:bg-[#3b82f6] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#2f97e8]"
                onClick={goHome}
                type="button"
              >
                Home
              </button>
            </div>
          </>
        )}
        {!isPrivate && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:max-w-48">
            <button
              className="min-h-14 w-full rounded-lg bg-[#2f97e8] text-xl font-extrabold text-white shadow-lg transition-all hover:bg-[#3b82f6] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#2f97e8]"
              onClick={goHome}
              type="button"
            >
              Home
            </button>
          </div>
        )}
        {notice && <p className="mt-6 text-center font-extrabold text-[#fff5f5] text-lg bg-red-500/20 rounded-lg p-3">{notice}</p>}
      </div>
      <PlayerList
        players={players}
        hostId={room.hostId}
        drawerId=""
        myId={myId}
        kickVotes={room.kickVotes}
        onKickVote={onKickVote}
        showKickVotes={showKickVotes}
      />
    </section>
  );
}
