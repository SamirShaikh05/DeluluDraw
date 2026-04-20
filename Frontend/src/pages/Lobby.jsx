import { PlayerList } from "../components/game/PlayerList";

export function Lobby({ goHome, isHost, notice, players, room, startGame }) {
  return (
    <section className="lobby-screen">
      <div className="lobby-hero">
        <p className="eyebrow">Private room</p>
        <h1>{room.roomId}</h1>
        <p>Share this code with friends. The host starts the game when the room feels loud enough.</p>
        <div className="lobby-actions">
          <button className="play-button" onClick={startGame} disabled={!isHost} type="button">
            {isHost ? "Start Game" : "Waiting For Host"}
          </button>
          <button className="private-button" onClick={goHome} type="button">Home</button>
        </div>
        {notice && <p className="notice">{notice}</p>}
      </div>
      <PlayerList players={players} hostId={room.hostId} drawerId="" />
    </section>
  );
}
