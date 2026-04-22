import { motion } from "framer-motion";
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
        <motion.div
          className="font-['Comic_Sans_MS','Trebuchet_MS',sans-serif] text-[56px] leading-[0.9] font-black tracking-normal text-shadow-[-4px_-4px_0_#0b1320,4px_-4px_0_#0b1320,-4px_4px_0_#0b1320,4px_4px_0_#0b1320] sm:text-[80px]"
          aria-label="deluludraw"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.span
            style={{ color: "#ef4444" }}
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            d
          </motion.span>
          <motion.span
            style={{ color: "#f97316" }}
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            e
          </motion.span>
          <motion.span
            style={{ color: "#fde047" }}
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            l
          </motion.span>
          <motion.span
            style={{ color: "#22c55e" }}
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            u
          </motion.span>
          <motion.span
            style={{ color: "#06b6d4" }}
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            l
          </motion.span>
          <motion.span
            style={{ color: "#3b82f6" }}
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            u
          </motion.span>
          <motion.span
            style={{ color: "#a855f7" }}
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            d
          </motion.span>
          <motion.span
            style={{ color: "#ec4899" }}
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            r
          </motion.span>
          <motion.span
            style={{ color: "#f8fafc" }}
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            a
          </motion.span>
          <motion.span
            className="text-amber-500"
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 },
            }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            w
          </motion.span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <AvatarParade />
        </motion.div>
      </div>

      <motion.div
        className="mt-10 w-full max-w-md rounded-xl bg-gradient-to-br from-[rgba(15,70,163,0.8)] to-[rgba(9,50,122,0.8)] shadow-2xl p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
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
        <motion.div
          className="relative flex min-h-32 items-center justify-center gap-8 overflow-hidden mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <motion.button
            className="bg-transparent text-[60px] leading-none text-white [text-shadow:4px_4px_0_#061731] hover:scale-110 transition-transform"
            type="button"
            whileHover={{ scale: 1.2, rotate: -10 }}
            whileTap={{ scale: 0.9 }}
          >
            {"<"}
          </motion.button>
          <PixelFace />
          <motion.button
            className="bg-transparent text-[60px] leading-none text-white [text-shadow:4px_4px_0_#061731] hover:scale-110 transition-transform"
            type="button"
            whileHover={{ scale: 1.2, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
          >
            {">"}
          </motion.button>
        </motion.div>
        <motion.div
          className="space-y-3 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
        >
          <motion.button
            className="min-h-14 w-full rounded-lg bg-[#58df28] text-xl font-extrabold text-white shadow-lg transition-all hover:bg-[#4ade80] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#58df28] hover:scale-105"
            onClick={joinRoom}
            type="button"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(88, 223, 40, 0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            Play!
          </motion.button>
          <motion.button
            className="min-h-14 w-full rounded-lg bg-[#2f97e8] text-xl font-extrabold text-white shadow-lg transition-all hover:bg-[#3b82f6] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#2f97e8] hover:scale-105"
            onClick={createRoom}
            type="button"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(47, 151, 232, 0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            Create Private Room
          </motion.button>
        </motion.div>
        <motion.p
          className="mt-4 text-center text-sm font-bold text-[#dbeafe]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          Leave the room code empty to join the public match.
        </motion.p>
        {notice && (
          <motion.p
            className="mt-4 text-center font-extrabold text-[#fff5f5] text-lg bg-red-500/20 rounded-lg p-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {notice}
          </motion.p>
        )}
      </motion.div>

      <motion.section
        className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-8 border-t border-t-[rgba(255,255,255,0.18)] pt-10 text-[#f4f8ff] md:grid-cols-3"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <motion.article
          className="text-center rounded-lg bg-white/5 p-6 backdrop-blur-sm"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <span className="mb-4 block text-[48px] font-black text-[#f2e84b] [text-shadow:3px_3px_0_#071a38]">?</span>
          <h2 className="mb-4 text-2xl font-bold">About</h2>
          <p className="m-0 font-bold leading-relaxed text-[#dbeafe]">Draw the secret word while friends race to guess it. Correct guesses score fast, and the artist gets a bonus when people solve the sketch.</p>
        </motion.article>
        <motion.article
          className="text-center rounded-lg bg-white/5 p-6 backdrop-blur-sm"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <span className="mb-4 block text-[48px] font-black text-[#f2e84b] [text-shadow:3px_3px_0_#071a38]">#</span>
          <h2 className="mb-4 text-2xl font-bold">Room Code</h2>
          <p className="m-0 font-bold leading-relaxed text-[#dbeafe]">Create a private room, share the five-letter code, and start when everyone is ready.</p>
        </motion.article>
        <motion.article
          className="text-center rounded-lg bg-white/5 p-6 backdrop-blur-sm"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <span className="mb-4 block text-[48px] font-black text-[#f2e84b] [text-shadow:3px_3px_0_#071a38]">/</span>
          <h2 className="mb-4 text-2xl font-bold">How To Play</h2>
          <p className="m-0 font-bold leading-relaxed text-[#dbeafe]">Pick a word, draw with the toolbar, type guesses in chat, and survive the scoreboard chaos.</p>
        </motion.article>
      </motion.section>
    </section>
  );
}
