import { useState } from "react";
import { FaWifi } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
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
  onQuitRoom,
  players,
  ping,
  room,
  selectedWord,
  sendGuess,
  socketRef,
  wordOptions,
  spectators = [],
  isSpectator = false,
}) {
  const [color, setColor] = useState("#111827");
  const [size, setSize] = useState(7);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const showKickVotes = !room.isPrivate && players.length >= 3;

  const getPingBadgeStyles = (pingValue) => {
    if (pingValue === null) return "border-gray-500 text-gray-400 bg-gray-900/50";
    if (pingValue < 100) return "border-emerald-500 text-emerald-400 bg-emerald-950/40";
    if (pingValue < 500) return "border-amber-500 text-amber-400 bg-amber-950/40";
    return "border-red-500 text-red-400 bg-red-950/40";
  };

  return (
    <section className="game-page mx-auto mb-7 mt-3 w-[min(100%-24px,1170px)]">
      {/* Top Header Row */}
      <div className="game-header grid gap-3 rounded-t-[7px] border-[3px] border-[#0c3579] bg-white p-2.5 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex items-center justify-start">
          <div className="grid h-12 w-12 place-items-center rounded-full border-4 border-[#111827] bg-white font-black text-[#111827]">
            <span>{game?.remaining ?? 0}</span>
          </div>
        </div>

        <div className="min-w-0 flex justify-center">
          <WordDisplay game={game} isDrawer={isDrawer} selectedWord={selectedWord} totalRounds={room.settings.rounds} />
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

          <div className="relative">
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-[#0c3579] bg-[#111827] text-white transition hover:bg-[#0a2a61] focus:outline-none focus:ring-2 focus:ring-[#0c3579]/60"
              aria-label="Open game menu"
              aria-expanded={showMenu}
              onClick={() => setShowMenu((current) => !current)}
            >
              <FiMenu className="h-5 w-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border-2 border-[#0c3579] bg-white p-2 shadow-xl">
                <button
                  type="button"
                  className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-black text-[#172033] transition hover:bg-gray-100"
                  onClick={() => setShowMenu(false)}
                >
                  Settings
                </button>
                <button
                  type="button"
                  className="mt-1 flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-black text-red-600 transition hover:bg-red-50"
                  onClick={() => {
                    setShowMenu(false);
                    setShowLeaveConfirm(true);
                  }}
                >
                  Leave game
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#061731]/75 px-4">
          <div className="w-full max-w-sm rounded-xl border-4 border-[#0c3579] bg-white p-6 text-[#172033] shadow-2xl">
            <h2 className="text-xl font-black">Leave this game?</h2>
            <p className="mt-2 font-semibold text-gray-600">You will be removed immediately and can’t rejoin this session.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="rounded-lg bg-gray-200 px-4 py-3 font-black hover:bg-gray-300" onClick={() => setShowLeaveConfirm(false)} type="button">Stay</button>
              <button className="rounded-lg bg-red-600 px-4 py-3 font-black text-white hover:bg-red-700" onClick={onQuitRoom} type="button">Leave game</button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED: changed items-start to items-stretch */}
      <div className="game-layout">
        <PlayerList
          players={players}
          hostId={room.hostId}
          drawerId={game?.drawerId}
          myId={myId}
          kickVotes={room.kickVotes}
          onKickVote={onKickVote}
          showKickVotes={showKickVotes}
          spectators={spectators}
        />
        <div className="game-stage relative flex min-h-0 min-w-0 flex-col justify-between border-b-[3px] border-[#0c3579] bg-white">
          <WordPicker chooseWord={chooseWord} game={game} isDrawer={isDrawer} players={players} wordOptions={wordOptions} />
          <CanvasBoard socketRef={socketRef} roomId={room.roomId} enabled={isDrawer && game?.phase === "drawing"} color={color} size={size} initialStrokes={room.canvas || []} />
          {isDrawer && !isSpectator && (
            <Toolbar
              color={color}
              setColor={setColor}
              size={size}
              setSize={setSize}
              socketRef={socketRef}
              roomId={room.roomId}
              enabled
            />
          )}
        </div>
        <ChatBox messages={messages} sendGuess={sendGuess} disabled={isSpectator || isDrawer || game?.phase !== "drawing" || me?.hasGuessed} drawer={drawer} />
      </div>
    </section>
  );
}
