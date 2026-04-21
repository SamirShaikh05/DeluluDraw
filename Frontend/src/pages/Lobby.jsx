import { PlayerList } from "../components/game/PlayerList";

export function Lobby({ goHome, isHost, notice, players, room, startGame }) {
  const isPrivate = room.isPrivate;
  const waitingForPlayers = !isPrivate && players.length < 2;

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
          <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_150px]">
            <button className="min-h-12 w-full bg-[#58df28] text-lg font-extrabold text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.14)] disabled:cursor-not-allowed disabled:opacity-62" onClick={startGame} disabled={!isHost} type="button">
              {isHost ? "Start Game" : "Waiting For Host"}
            </button>
            <button className="min-h-12 w-full bg-[#2f97e8] text-lg font-extrabold text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)]" onClick={goHome} type="button">Home</button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-2.5 sm:max-w-[150px]">
            <button className="min-h-12 w-full bg-[#2f97e8] text-lg font-extrabold text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)]" onClick={goHome} type="button">Home</button>
          </div>
        )}
        {notice && <p className="mt-3 text-center font-extrabold text-[#fff5f5]">{notice}</p>}
      </div>
      <PlayerList players={players} hostId={room.hostId} drawerId="" />
    </section>
  );
}
