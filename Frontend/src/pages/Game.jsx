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
  players,
  room,
  sendGuess,
  socketRef,
  wordOptions,
}) {
  const [color, setColor] = useState("#111827");
  const [size, setSize] = useState(7);

  return (
    <section className="game-screen">
      <div className="game-header">
        <div className="timer-badge">
          <span>{game?.remaining ?? 0}</span>
        </div>
        <WordDisplay game={game} isDrawer={isDrawer} totalRounds={room.settings.rounds} />
        <button className="gear" type="button">settings</button>
      </div>

      <div className="game-layout">
        <PlayerList players={players} hostId={room.hostId} drawerId={game?.drawerId} />
        <div className="board-zone">
          <WordPicker chooseWord={chooseWord} game={game} isDrawer={isDrawer} players={players} wordOptions={wordOptions} />
          <CanvasBoard socketRef={socketRef} roomId={room.roomId} enabled={isDrawer && game?.phase === "drawing"} color={color} size={size} />
          <Toolbar color={color} setColor={setColor} size={size} setSize={setSize} socketRef={socketRef} roomId={room.roomId} enabled={isDrawer} />
        </div>
        <ChatBox messages={messages} sendGuess={sendGuess} disabled={isDrawer || game?.phase !== "drawing" || me?.hasGuessed} drawer={drawer} />
      </div>
    </section>
  );
}
