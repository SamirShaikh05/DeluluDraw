import { useState } from "react";
import { IoMdSettings } from "react-icons/io";
import { FaWifi } from "react-icons/fa";
import { CanvasBoard } from "../components/game/CanvasBoard";
import { ChatBox } from "../components/game/ChatBox";
import { PlayerList } from "../components/game/PlayerList";
import { Toolbar } from "../components/game/Toolbar";
import { WordDisplay } from "../components/game/WordDisplay";
import { WordPicker } from "../components/game/WordPicker";

export function Game({
  chooseWord,
  drawer,
  game,
  isDrawer,
  me,
  messages,
  myId,
  onKickVote,
  players,
  ping,
  room,
  sendGuess,
  socketRef,
  wordOptions,
}) {
  const [color, setColor] = useState("#111827");
  const [size, setSize] = useState(7);
  const showKickVotes = !room.isPrivate && players.length >= 3;

  const getPingBadgeStyles = (pingValue) => {
    if (pingValue === null) return "border-gray-500 text-gray-400 bg-gray-900/50";
    if (pingValue < 100) return "border-emerald-500 text-emerald-400 bg-emerald-950/40";
    if (pingValue < 500) return "border-amber-500 text-amber-400 bg-amber-950/40";
    return "border-red-500 text-red-400 bg-red-950/40";
  };

  return (
    <section className="mx-auto mb-7 mt-3 w-[min(100%-24px,1170px)]">
      {/* Top Header Row */}
      <div className="grid gap-3 rounded-t-[7px] border-[3px] border-[#0c3579] bg-white p-2.5 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex items-center justify-start">
          <div className="grid h-12 w-12 place-items-center rounded-full border-[4px] border-[#111827] bg-white font-black text-[#111827]">
            <span>{game?.remaining ?? 0}</span>
          </div>
        </div>

        <div className="flex justify-center">
          <WordDisplay game={game} isDrawer={isDrawer} totalRounds={room.settings.rounds} />
        </div>

        <div className="flex items-center justify-end gap-2">
          <div
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border-2 px-2.5 text-[11px] font-black uppercase tracking-wider transition-colors ${getPingBadgeStyles(
              ping
            )}`}
          >
            <FaWifi className="h-3.5 w-3.5 shrink-0" />
            <span>{ping === null ? "--" : `${ping} ms`}</span>
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[#0c3579] bg-[#111827] text-white transition hover:bg-[#0a2a61] focus:outline-none focus:ring-2 focus:ring-[#0c3579]/60"
            aria-label="Open settings"
          >
            <IoMdSettings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* FIXED: changed items-start to items-stretch */}
      <div className="grid grid-cols-1 items-stretch gap-0 md:grid-cols-[220px_minmax(0,1fr)_266px]">
        <PlayerList
          players={players}
          hostId={room.hostId}
          drawerId={game?.drawerId}
          myId={myId}
          kickVotes={room.kickVotes}
          onKickVote={onKickVote}
          showKickVotes={showKickVotes}
        />
        <div className="relative flex flex-col justify-between min-w-0 border-b-[3px] border-[#0c3579] bg-white">
          <WordPicker chooseWord={chooseWord} game={game} isDrawer={isDrawer} players={players} wordOptions={wordOptions} />
          <CanvasBoard socketRef={socketRef} roomId={room.roomId} enabled={isDrawer && game?.phase === "drawing"} color={color} size={size} />
          <Toolbar color={color} setColor={setColor} size={size} setSize={setSize} socketRef={socketRef} roomId={room.roomId} enabled={isDrawer} />
        </div>
        <ChatBox messages={messages} sendGuess={sendGuess} disabled={isDrawer || game?.phase !== "drawing" || me?.hasGuessed} drawer={drawer} />
      </div>
    </section>
  );
}