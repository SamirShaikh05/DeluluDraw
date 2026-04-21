import { useState } from "react";
import { DoodleLayer } from "./components/layout/DoodleLayer";
import { Navbar } from "./components/layout/Navbar";
import { useGameState } from "./hooks/useGameState";
import { useSocket } from "./hooks/useSocket";
import { Game } from "./pages/Game";
import { Home } from "./pages/Home";
import { Lobby } from "./pages/Lobby";
import { DEFAULT_SETTINGS } from "./utils/constants";

function App() {
  const { connected, myId, socketRef } = useSocket();
  const {
    messages,
    notice,
    players,
    room,
    screen,
    setScreen,
    sortedPlayers,
    wordOptions,
    setWordOptions,
  } = useGameState(socketRef);

  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const game = room?.game;
  const me = players.find((player) => player.id === myId);
  const drawer = players.find((player) => player.id === game?.drawerId);
  const isHost = room?.hostId === myId;
  const isDrawer = game?.drawerId === myId;

  function createRoom() {
    socketRef.current?.emit("create_room", {
      playerName,
      settings,
    });
  }

  function joinRoom() {
    socketRef.current?.emit("join_room", {
      playerName,
      roomId: roomCode.trim(),
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
    <main className="relative min-h-screen overflow-x-hidden bg-[#2366bd] [background-image:linear-gradient(180deg,rgba(36,103,195,0.94),rgba(22,80,170,0.92))]">
      <DoodleLayer />
      <Navbar connected={connected} goHome={() => setScreen(room ? "lobby" : "home")} />

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

export default App;
