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
}) {
  return (
    <section className="relative z-10 flex flex-col items-center px-4 pb-20 pt-8 sm:px-6">
      <div className="text-center">
        <div
          className="font-['Comic_Sans_MS','Trebuchet_MS',sans-serif] text-[56px] leading-[0.9] font-black tracking-normal text-shadow-[-4px_-4px_0_#0b1320,4px_-4px_0_#0b1320,-4px_4px_0_#0b1320,4px_4px_0_#0b1320] sm:text-[80px]"
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

      <div className="mt-10 w-full max-w-md rounded-xl bg-gradient-to-br from-[rgba(15,70,163,0.8)] to-[rgba(9,50,122,0.8)] shadow-2xl p-8">
        <div className="flex items-between gap-5">
          <input
            className="w-7/11 rounded-lg border-2 border-[#d4dded] bg-white px-4 py-4 text-lg font-bold text-[#172033] outline-none focus:border-[#72e34b] focus:ring-2 focus:ring-[#72e34b]/20 transition-colors placeholder:text-gray-400"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            placeholder="Enter your name"
            maxLength={20}
          />
          <input
            className="w-4/11 rounded-lg border-2 border-[#d4dded] bg-white px-4 py-4 text-lg font-bold text-[#172033] outline-none focus:border-[#72e34b] focus:ring-2 focus:ring-[#72e34b]/20 transition-colors placeholder:text-gray-400"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            placeholder="Room code"
            maxLength={5}
          />
        </div>
        <div className="relative flex min-h-32 items-center justify-center gap-8 overflow-hidden mt-6">
          <button className="bg-transparent text-[60px] leading-none text-white [text-shadow:4px_4px_0_#061731] hover:scale-110 transition-transform" type="button">{"<"}</button>
          <PixelFace />
          <button className="bg-transparent text-[60px] leading-none text-white [text-shadow:4px_4px_0_#061731] hover:scale-110 transition-transform" type="button">{">"}</button>
          <img src={heroImage} alt="" className="absolute right-3 top-4 h-8 w-8 rounded border-2 border-[#0c2e6b] object-cover" />
        </div>
        <div className="space-y-3 mt-6">
          <button
            className="min-h-14 w-full rounded-lg bg-[#58df28] text-xl font-extrabold text-white shadow-lg transition-all hover:bg-[#4ade80] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#58df28] hover:scale-105"
            onClick={joinRoom}
            type="button"
          >
            Play!
          </button>
          <button
            className="min-h-14 w-full rounded-lg bg-[#2f97e8] text-xl font-extrabold text-white shadow-lg transition-all hover:bg-[#3b82f6] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#2f97e8] hover:scale-105"
            onClick={createRoom}
            type="button"
          >
            Create Private Room
          </button>
        </div>
        <p className="mt-4 text-center text-sm font-bold text-[#dbeafe]">Leave the room code empty to join the public match.</p>
        {notice && <p className="mt-4 text-center font-extrabold text-[#fff5f5] text-lg bg-red-500/20 rounded-lg p-3">{notice}</p>}
      </div>

      <section className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-8 border-t border-t-[rgba(255,255,255,0.18)] pt-10 text-[#f4f8ff] md:grid-cols-3">
        <article className="text-center rounded-lg bg-white/5 p-6 backdrop-blur-sm">
          <span className="mb-4 block text-[48px] font-black text-[#f2e84b] [text-shadow:3px_3px_0_#071a38]">?</span>
          <h2 className="mb-4 text-2xl font-bold">About</h2>
          <p className="m-0 font-bold leading-relaxed text-[#dbeafe]">Draw the secret word while friends race to guess it. Correct guesses score fast, and the artist gets a bonus when people solve the sketch.</p>
        </article>
        <article className="text-center rounded-lg bg-white/5 p-6 backdrop-blur-sm">
          <span className="mb-4 block text-[48px] font-black text-[#f2e84b] [text-shadow:3px_3px_0_#071a38]">#</span>
          <h2 className="mb-4 text-2xl font-bold">Room Code</h2>
          <p className="m-0 font-bold leading-relaxed text-[#dbeafe]">Create a private room, share the five-letter code, and start when everyone is ready.</p>
        </article>
        <article className="text-center rounded-lg bg-white/5 p-6 backdrop-blur-sm">
          <span className="mb-4 block text-[48px] font-black text-[#f2e84b] [text-shadow:3px_3px_0_#071a38]">/</span>
          <h2 className="mb-4 text-2xl font-bold">How To Play</h2>
          <p className="m-0 font-bold leading-relaxed text-[#dbeafe]">Pick a word, draw with the toolbar, type guesses in chat, and survive the scoreboard chaos.</p>
        </article>
      </section>
    </section>
  );
}
