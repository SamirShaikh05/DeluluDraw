import { useState } from "react";
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
  room,
  sendGuess,
  socketRef,
  wordOptions,
}) {
  const [color, setColor] = useState("#111827");
  const [size, setSize] = useState(7);
  const showKickVotes = !room.isPrivate && players.length >= 3;

  return (
    <section className="mx-auto mb-7 mt-3 w-[min(100%-24px,1170px)]">
      <div className="grid min-h-15.5 grid-cols-[62px_minmax(0,1fr)_72px] items-center rounded-t-[7px] border-[3px] border-[#0c3579] bg-white md:grid-cols-[72px_minmax(0,1fr)_90px]">
        <div className="-ml-0.5 grid h-14.5 w-14.5 place-items-center rounded-full border-[5px] border-[#111827] bg-white font-black text-[#111827]">
          <span>{game?.remaining ?? 0}</span>
        </div>
        <WordDisplay game={game} isDrawer={isDrawer} totalRounds={room.settings.rounds} />
        <button className="mr-2.5 justify-self-end bg-[#111827] px-1.75 py-1.75 text-[10px] text-white sm:px-2.5 sm:py-2 sm:text-xs" type="button">settings</button>
      </div>

      <div className="grid grid-cols-1 items-start gap-0 md:grid-cols-[180px_minmax(0,1fr)_266px]">
        <PlayerList
          players={players}
          hostId={room.hostId}
          drawerId={game?.drawerId}
          myId={myId}
          kickVotes={room.kickVotes}
          onKickVote={onKickVote}
          showKickVotes={showKickVotes}
        />
        <div className="relative min-w-0 border-b-[3px] border-[#0c3579] bg-white">
          <WordPicker chooseWord={chooseWord} game={game} isDrawer={isDrawer} players={players} wordOptions={wordOptions} />
          <CanvasBoard socketRef={socketRef} roomId={room.roomId} enabled={isDrawer && game?.phase === "drawing"} color={color} size={size} />
          <Toolbar color={color} setColor={setColor} size={size} setSize={setSize} socketRef={socketRef} roomId={room.roomId} enabled={isDrawer} />
        </div>
        <ChatBox messages={messages} sendGuess={sendGuess} disabled={isDrawer || game?.phase !== "drawing" || me?.hasGuessed} drawer={drawer} />
      </div>
    </section>
  );
}
