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
    <section className="home-screen">
      <div className="logo-wrap">
        <div className="sketch-logo" aria-label="deluludraw">
          <span style={{ color: "#ef4444" }}>d</span>
          <span style={{ color: "#f97316" }}>e</span>
          <span style={{ color: "#fde047" }}>l</span>
          <span style={{ color: "#22c55e" }}>u</span>
          <span style={{ color: "#06b6d4" }}>l</span>
          <span style={{ color: "#3b82f6" }}>u</span>
          <span style={{ color: "#a855f7" }}>d</span>
          <span style={{ color: "#ec4899" }}>r</span>
          <span style={{ color: "#f8fafc" }}>a</span>
          <span className="pencil">w</span>
        </div>
        <AvatarParade />
      </div>

      <div className="join-panel">
        <div className="entry-row">
          <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="Enter your name" maxLength={20} />
          <input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} placeholder="Room code" maxLength={5} />
        </div>
        <div className="mascot-stage">
          <button className="arrow" type="button">{"<"}</button>
          <PixelFace />
          <button className="arrow" type="button">{">"}</button>
          <img src={heroImage} alt="" className="hero-stamp" />
        </div>
        <button className="play-button" onClick={joinRoom} type="button">Play!</button>
        <button className="private-button" onClick={createRoom} type="button">Create Private Room</button>
        {notice && <p className="notice">{notice}</p>}
      </div>

      <div className="settings-strip">
        <label>
          Rounds
          <input
            type="number"
            min="1"
            max="10"
            value={settings.rounds}
            onChange={(event) => setSettings({ ...settings, rounds: event.target.value })}
          />
        </label>
        <label>
          Draw time
          <input
            type="number"
            min="15"
            max="240"
            value={settings.drawTime}
            onChange={(event) => setSettings({ ...settings, drawTime: event.target.value })}
          />
        </label>
        <label>
          Seats
          <input
            type="number"
            min="2"
            max="20"
            value={settings.maxPlayers}
            onChange={(event) => setSettings({ ...settings, maxPlayers: event.target.value })}
          />
        </label>
      </div>

      <section className="info-grid">
        <article>
          <span className="section-icon">?</span>
          <h2>About</h2>
          <p>Draw the secret word while friends race to guess it. Correct guesses score fast, and the artist gets a bonus when people solve the sketch.</p>
        </article>
        <article>
          <span className="section-icon">#</span>
          <h2>Room Code</h2>
          <p>Create a private room, share the five-letter code, and start when everyone is ready.</p>
        </article>
        <article>
          <span className="section-icon">/</span>
          <h2>How To Play</h2>
          <p>Pick a word, draw with the toolbar, type guesses in chat, and survive the scoreboard chaos.</p>
        </article>
      </section>
    </section>
  );
}
