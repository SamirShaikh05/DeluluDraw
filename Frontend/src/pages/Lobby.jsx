import { PlayerList } from "../components/game/PlayerList";

export function Lobby({ goHome, isHost, myId, notice, onKickVote, players, room, startGame, updateRoomSettings }) {
  const isPrivate = room.isPrivate;
  const waitingForPlayers = !isPrivate && players.length < 2;
  const showKickVotes = !isPrivate && players.length >= 3;

  return (
    <section className="relative z-10 mx-auto my-14.5 grid w-[min(100%-20px,620px)] grid-cols-1 gap-4.5 md:w-[min(100%-28px,920px)] md:grid-cols-[minmax(0,1fr)_290px]">
      <div className="rounded-lg border-4 border-[rgba(255,255,255,0.16)] bg-[rgba(9,50,122,0.58)] p-7 text-white md:p-10.5">
        <p className="m-0 font-black uppercase text-[#f2e84b]">{isPrivate ? "Private room" : "Public match"}</p>
        <h1 className="my-2.5 text-[58px] leading-none font-black md:text-[84px]">{isPrivate ? room.roomId : "LIVE"}</h1>
        <p className="max-w-140 text-lg font-bold leading-[1.5]">
          {isPrivate
            ? "Share this code with friends. The host starts the game when the room feels loud enough."
            : waitingForPlayers
              ? "Waiting for players. The public match starts automatically as soon as two players are here."
              : "The public match is getting ready. You'll be moved into the round automatically."}
        </p>
        {isPrivate ? (
          <>
            <label className="mt-6 grid max-w-40 gap-1.75 font-black text-white">
              Rounds
              <input
                className="w-full rounded-[3px] border-2 border-[#d4dded] bg-white px-2.5 py-2.25 font-bold text-[#172033] outline-none focus:border-[#72e34b] disabled:cursor-not-allowed disabled:bg-[#dbeafe]"
                type="number"
                min="1"
                max="10"
                value={room.settings.rounds}
                onChange={(event) => updateRoomSettings({ rounds: event.target.value })}
                disabled={!isHost}
              />
            </label>
            <p className="mt-2 text-sm font-bold text-[#dbeafe]">
              {isHost ? "Private rooms start with 3 rounds by default, but you can change it before starting." : "Only the host can change the round count before the game starts."}
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_150px]">
            <button className="min-h-12 w-full bg-[#58df28] text-lg font-extrabold text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.14)] disabled:cursor-not-allowed disabled:opacity-62" onClick={startGame} disabled={!isHost} type="button">
              {isHost ? "Start Game" : "Waiting For Host"}
            </button>
            <button className="min-h-12 w-full bg-[#2f97e8] text-lg font-extrabold text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)]" onClick={goHome} type="button">Home</button>
            </div>
          </>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-2.5 sm:max-w-[150px]">
            <button className="min-h-12 w-full bg-[#2f97e8] text-lg font-extrabold text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)]" onClick={goHome} type="button">Home</button>
          </div>
        )}
        {notice && <p className="mt-3 text-center font-extrabold text-[#fff5f5]">{notice}</p>}
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
