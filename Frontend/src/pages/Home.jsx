import heroImage from "../assets/hero.png";
import { AvatarParade } from "../components/home/AvatarParade";
import { PixelFace } from "../components/home/PixelFace";

export function Home({
  createRoom,
  joinRoom,
  notice,
  playerName,
  roomCode,
  setPlayerName,
  setRoomCode,
  setSettings,
  settings,
}) {
  return (
    <section className="relative z-10 flex flex-col items-center px-2.5 pb-15 pt-5.5 sm:px-4.5">
      <div className="text-center">
        <div
          className="font-['Comic_Sans_MS','Trebuchet_MS',sans-serif] text-[54px] leading-[0.9] font-black tracking-normal text-shadow-[-4px_-4px_0_#0b1320,4px_-4px_0_#0b1320,-4px_4px_0_#0b1320,4px_4px_0_#0b1320] sm:text-[78px]"
          aria-label="deluludraw"
        >
          <span style={{ color: "#ef4444" }}>d</span>
          <span style={{ color: "#f97316" }}>e</span>
          <span style={{ color: "#fde047" }}>l</span>
          <span style={{ color: "#22c55e" }}>u</span>
          <span style={{ color: "#06b6d4" }}>l</span>
          <span style={{ color: "#3b82f6" }}>u</span>
          <span style={{ color: "#a855f7" }}>d</span>
          <span style={{ color: "#ec4899" }}>r</span>
          <span style={{ color: "#f8fafc" }}>a</span>
          <span className="text-amber-500">w</span>
        </div>
        <AvatarParade />
      </div>

      <div className="mt-8 w-full max-w-87.5 bg-[rgba(15,70,163,0.76)] shadow-[0_12px_0_rgba(8,54,124,0.18)] sm:mt-12">
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-[1fr_112px]">
          <input
            className="w-full rounded-[3px] border-2 border-[#d4dded] bg-white px-3.25 py-3 font-bold text-[#172033] outline-none focus:border-[#72e34b]"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Enter your name"
            maxLength={20}
          />
          <input
            className="w-full rounded-[3px] border-2 border-[#d4dded] bg-white px-3.25 py-3 font-bold text-[#172033] outline-none focus:border-[#72e34b]"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            placeholder="Room code (optional)"
            maxLength={5}
          />
        </div>
        <div className="relative flex min-h-30.5 items-center justify-center gap-6 overflow-hidden">
          <button className="bg-transparent text-[56px] leading-none text-white [text-shadow:4px_4px_0_#061731]" type="button">{"<"}</button>
          <PixelFace />
          <button className="bg-transparent text-[56px] leading-none text-white [text-shadow:4px_4px_0_#061731]" type="button">{">"}</button>
          <img src={heroImage} alt="" className="absolute right-2.5 top-3.5 h-7 w-7 rounded border-2 border-[#0c2e6b] object-cover" />
        </div>
        <button className="min-h-12 w-full bg-[#58df28] text-lg font-extrabold text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.14)]" onClick={joinRoom} type="button">Play!</button>
        <button className="min-h-12 w-full bg-[#2f97e8] text-lg font-extrabold text-white shadow-[inset_0_-4px_0_rgba(0,0,0,0.12)]" onClick={createRoom} type="button">Create Private Room</button>
        <p className="m-3 text-center text-sm font-bold text-[#dbeafe]">Leave the room code empty to join the public match.</p>
        {notice && <p className="m-3 text-center font-extrabold text-[#fff5f5]">{notice}</p>}
      </div>

      <div className="mt-7 grid w-full max-w-155 grid-cols-1 gap-2.5 text-white sm:grid-cols-3">
        <label className="grid gap-1.75 font-black">
          Rounds
          <input
            className="w-full rounded-[3px] border-2 border-[#d4dded] bg-white px-2.5 py-2.25 font-bold text-[#172033] outline-none focus:border-[#72e34b]"
            type="number"
            min="1"
            max="10"
            value={settings.rounds}
            onChange={(event) => setSettings({ ...settings, rounds: event.target.value })}
          />
        </label>
        <label className="grid gap-1.75 font-black">
          Draw time
          <input
            className="w-full rounded-[3px] border-2 border-[#d4dded] bg-white px-2.5 py-2.25 font-bold text-[#172033] outline-none focus:border-[#72e34b]"
            type="number"
            min="15"
            max="240"
            value={settings.drawTime}
            onChange={(event) => setSettings({ ...settings, drawTime: event.target.value })}
          />
        </label>
        <label className="grid gap-1.75 font-black">
          Seats
          <input
            className="w-full rounded-[3px] border-2 border-[#d4dded] bg-white px-2.5 py-2.25 font-bold text-[#172033] outline-none focus:border-[#72e34b]"
            type="number"
            min="2"
            max="20"
            value={settings.maxPlayers}
            onChange={(event) => setSettings({ ...settings, maxPlayers: event.target.value })}
          />
        </label>
      </div>

      <section className="mt-14 grid w-full max-w-235 grid-cols-1 gap-7 border-t border-t-[rgba(255,255,255,0.18)] pt-8.5 text-[#f4f8ff] md:grid-cols-3">
        <article className="text-center">
          <span className="mb-2 block text-[42px] font-black text-[#f2e84b] [text-shadow:3px_3px_0_#071a38]">?</span>
          <h2 className="mb-3 text-2xl font-bold">About</h2>
          <p className="m-0 font-bold leading-[1.55] text-[#dbeafe]">Draw the secret word while friends race to guess it. Correct guesses score fast, and the artist gets a bonus when people solve the sketch.</p>
        </article>
        <article className="text-center">
          <span className="mb-2 block text-[42px] font-black text-[#f2e84b] [text-shadow:3px_3px_0_#071a38]">#</span>
          <h2 className="mb-3 text-2xl font-bold">Room Code</h2>
          <p className="m-0 font-bold leading-[1.55] text-[#dbeafe]">Create a private room, share the five-letter code, and start when everyone is ready.</p>
        </article>
        <article className="text-center">
          <span className="mb-2 block text-[42px] font-black text-[#f2e84b] [text-shadow:3px_3px_0_#071a38]">/</span>
          <h2 className="mb-3 text-2xl font-bold">How To Play</h2>
          <p className="m-0 font-bold leading-[1.55] text-[#dbeafe]">Pick a word, draw with the toolbar, type guesses in chat, and survive the scoreboard chaos.</p>
        </article>
      </section>
    </section>
  );
}
