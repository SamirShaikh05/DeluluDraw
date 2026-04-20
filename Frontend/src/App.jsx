import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import heroImage from "./assets/hero.png";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";
const palette = ["#111827", "#ef4444", "#f59e0b", "#fde047", "#22c55e", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899"];

function App() {
  const socketRef = useRef(null);
  const [screen, setScreen] = useState("home");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [myId, setMyId] = useState("");
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [wordOptions, setWordOptions] = useState([]);
  const [notice, setNotice] = useState("");
  const [settings, setSettings] = useState({ rounds: 3, drawTime: 80, maxPlayers: 12 });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setMyId(socket.id);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("room_joined", ({ roomId }) => {
      setRoomCode(roomId);
      setScreen("lobby");
      setNotice("");
    });
    socket.on("room_state", (snapshot) => {
      setRoom(snapshot);
      setMessages(snapshot.messages || []);
      if (snapshot.game) setScreen(snapshot.game.phase === "lobby" ? "lobby" : "game");
    });
    socket.on("message", (message) => {
      setMessages((current) => [...current.slice(-90), message]);
    });
    socket.on("choose_word", ({ wordOptions: options }) => {
      setWordOptions(options || []);
      setScreen("game");
    });
    socket.on("round_start", () => setWordOptions([]));
    socket.on("game_over", () => setWordOptions([]));
    socket.on("error", ({ message }) => setNotice(message));

    return () => socket.disconnect();
  }, []);

  const game = room?.game;
  const players = useMemo(() => room?.players || [], [room?.players]);
  const me = players.find((player) => player.id === myId);
  const drawer = players.find((player) => player.id === game?.drawerId);
  const isHost = room?.hostId === myId;
  const isDrawer = game?.drawerId === myId;
  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players]);

  function createRoom() {
    socketRef.current?.emit("create_room", {
      playerName,
      settings,
    });
  }

  function joinRoom() {
    socketRef.current?.emit("join_room", {
      playerName,
      roomId: roomCode,
    });
  }

  function startGame() {
    socketRef.current?.emit("start_game", { roomId: room?.roomId });
  }

  function chooseWord(word) {
    socketRef.current?.emit("word_chosen", { roomId: room?.roomId, word });
    setWordOptions([]);
  }

  function sendGuess(text) {
    socketRef.current?.emit("guess", { roomId: room?.roomId, text });
  }

  return (
    <main className="app-shell">
      <DoodleLayer />
      <header className="topbar">
        <button className="brand" onClick={() => setScreen(room ? "lobby" : "home")} type="button">
          <span className="bolt">*</span>
          <span>deluludraw</span>
        </button>
        <div className="connection">
          <span className={connected ? "dot online" : "dot"} />
          {connected ? "online" : "connecting"}
        </div>
      </header>

      {screen === "home" && (
        <Home
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          createRoom={createRoom}
          joinRoom={joinRoom}
          settings={settings}
          setSettings={setSettings}
          notice={notice}
        />
      )}

      {screen === "lobby" && room && (
        <Lobby
          room={room}
          players={players}
          isHost={isHost}
          startGame={startGame}
          notice={notice}
          goHome={() => setScreen("home")}
        />
      )}

      {screen === "game" && room && (
        <Game
          room={room}
          game={game}
          players={sortedPlayers}
          me={me}
          drawer={drawer}
          isDrawer={isDrawer}
          messages={messages}
          sendGuess={sendGuess}
          socketRef={socketRef}
          wordOptions={wordOptions}
          chooseWord={chooseWord}
        />
      )}
    </main>
  );
}

function Home({ playerName, setPlayerName, roomCode, setRoomCode, createRoom, joinRoom, settings, setSettings, notice }) {
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

function Lobby({ room, players, isHost, startGame, notice, goHome }) {
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

function Game({ room, game, players, me, drawer, isDrawer, messages, sendGuess, socketRef, wordOptions, chooseWord }) {
  const [color, setColor] = useState("#111827");
  const [size, setSize] = useState(7);

  return (
    <section className="game-screen">
      <div className="game-header">
        <div className="timer-badge">
          <span>{game?.remaining ?? 0}</span>
        </div>
        <div className="round-copy">
          <small>round {game?.round || 1} of {room.settings.rounds}</small>
          <strong>{isDrawer ? game?.currentWord || "choose a word" : game?.maskedWord || "waiting"}</strong>
        </div>
        <button className="gear" type="button">settings</button>
      </div>

      <div className="game-layout">
        <PlayerList players={players} hostId={room.hostId} drawerId={game?.drawerId} />
        <div className="board-zone">
          {wordOptions.length > 0 && isDrawer && (
            <div className="word-picker">
              <h2>Pick a word</h2>
              <div>
                {wordOptions.map((word) => (
                  <button key={word} onClick={() => chooseWord(word)} type="button">{word}</button>
                ))}
              </div>
            </div>
          )}
          {game?.phase === "round_end" && (
            <div className="word-picker compact">
              <h2>The word was {game.currentWord}</h2>
            </div>
          )}
          {game?.phase === "game_over" && (
            <div className="word-picker compact">
              <h2>Game over</h2>
              <p>{players[0]?.name || "Nobody"} wins this one.</p>
            </div>
          )}
          <CanvasBoard socketRef={socketRef} roomId={room.roomId} enabled={isDrawer && game?.phase === "drawing"} color={color} size={size} />
          <Toolbar color={color} setColor={setColor} size={size} setSize={setSize} socketRef={socketRef} roomId={room.roomId} enabled={isDrawer} />
        </div>
        <ChatPanel messages={messages} sendGuess={sendGuess} disabled={isDrawer || game?.phase !== "drawing" || me?.hasGuessed} drawer={drawer} />
      </div>
    </section>
  );
}

function CanvasBoard({ socketRef, roomId, enabled, color, size }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const drawStroke = useCallback((data, local = true) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const point = { x: data.x * rect.width, y: data.y * rect.height };

    if (data.type === "start") {
      lastPointRef.current = point;
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      return;
    }

    if (data.type === "end") {
      lastPointRef.current = null;
      ctx.beginPath();
      return;
    }

    if (!lastPointRef.current) lastPointRef.current = point;
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;

    if (local) socketRef.current?.emit("draw_move", { roomId, x: data.x, y: data.y, color, size });
  }, [color, roomId, size, socketRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const snapshot = document.createElement("canvas");
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      snapshot.getContext("2d").drawImage(canvas, 0, 0);
      canvas.width = Math.floor(rect.width * window.devicePixelRatio);
      canvas.height = Math.floor(rect.height * window.devicePixelRatio);
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.drawImage(snapshot, 0, 0, rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return undefined;

    const drawRemote = (data) => {
      drawStroke(data, false);
    };
    const clear = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    socket.on("draw_data", drawRemote);
    socket.on("canvas_clear", clear);
    return () => {
      socket.off("draw_data", drawRemote);
      socket.off("canvas_clear", clear);
    };
  }, [drawStroke, socketRef]);

  function pointFromEvent(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const client = event.touches?.[0] || event;
    return {
      x: (client.clientX - rect.left) / rect.width,
      y: (client.clientY - rect.top) / rect.height,
    };
  }

  function start(event) {
    if (!enabled) return;
    event.preventDefault();
    drawingRef.current = true;
    const point = pointFromEvent(event);
    const data = { type: "start", ...point, color, size };
    drawStroke(data);
    socketRef.current?.emit("draw_start", { roomId, ...point, color, size });
  }

  function move(event) {
    if (!enabled || !drawingRef.current) return;
    event.preventDefault();
    const point = pointFromEvent(event);
    drawStroke({ type: "move", ...point, color, size });
  }

  function end() {
    if (!enabled || !drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    socketRef.current?.emit("draw_end", { roomId, x: 0, y: 0, color, size });
  }

  return (
    <canvas
      ref={canvasRef}
      className={enabled ? "draw-canvas active" : "draw-canvas"}
      onMouseDown={start}
      onMouseMove={move}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={start}
      onTouchMove={move}
      onTouchEnd={end}
    />
  );
}

function Toolbar({ color, setColor, size, setSize, socketRef, roomId, enabled }) {
  return (
    <div className="toolbar">
      <div className="swatches">
        {palette.map((swatch) => (
          <button
            className={swatch === color ? "swatch selected" : "swatch"}
            key={swatch}
            onClick={() => setColor(swatch)}
            style={{ background: swatch }}
            type="button"
            aria-label={`Use ${swatch}`}
          />
        ))}
      </div>
      <label>
        Brush
        <input type="range" min="2" max="26" value={size} onChange={(event) => setSize(Number(event.target.value))} />
      </label>
      <button disabled={!enabled} onClick={() => socketRef.current?.emit("canvas_clear", { roomId })} type="button">Clear</button>
    </div>
  );
}

function ChatPanel({ messages, sendGuess, disabled, drawer }) {
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function submit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    sendGuess(text);
    setText("");
  }

  return (
    <aside className="chat-panel">
      <div className="ad-box">
        <strong>Ride Smart, Save More</strong>
        <span>Sponsored sketch fuel</span>
      </div>
      <div className="chat-stream" ref={scrollRef}>
        {messages.map((message) => (
          <p className={message.type === "system" ? "system-message" : "chat-message"} key={message.id}>
            {message.type === "chat" && <strong>{message.playerName}: </strong>}
            {message.text}
          </p>
        ))}
      </div>
      <form onSubmit={submit} className="guess-form">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={disabled ? `${drawer?.name || "Artist"} is drawing` : "Type your guess here..."}
          disabled={disabled}
        />
      </form>
    </aside>
  );
}

function PlayerList({ players, hostId, drawerId }) {
  return (
    <aside className="player-list">
      {players.map((player, index) => (
        <div className={player.id === drawerId ? "player-row drawing" : "player-row"} key={player.id}>
          <span className="rank">#{index + 1}</span>
          <div>
            <strong>{player.name}{player.id === hostId ? " *" : ""}</strong>
            <small>{player.score} points</small>
          </div>
          <MiniAvatar color={player.avatarColor} guessed={player.hasGuessed} />
        </div>
      ))}
    </aside>
  );
}

function AvatarParade() {
  return (
    <div className="avatar-parade">
      {palette.slice(1).map((color) => <MiniAvatar color={color} key={color} />)}
    </div>
  );
}

function MiniAvatar({ color, guessed = false }) {
  return (
    <span className={guessed ? "mini-avatar guessed" : "mini-avatar"} style={{ "--avatar": color }}>
      <i />
    </span>
  );
}

function PixelFace() {
  return (
    <div className="pixel-face">
      <span />
      <span />
    </div>
  );
}

function DoodleLayer() {
  return (
    <div className="doodles" aria-hidden="true">
      {[":)", "?", "!", "car", "sun", "hat", "box", "cat", "zip", "key", "cup", "pen"].map((item, index) => (
        <span key={`${item}-${index}`}>{item}</span>
      ))}
    </div>
  );
}

export default App;
