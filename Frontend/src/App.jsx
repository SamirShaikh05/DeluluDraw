import { useCallback, useState } from "react";
import { DoodleLayer } from "./components/layout/DoodleLayer";
import { Navbar } from "./components/layout/Navbar";
import { useGameState } from "./hooks/useGameState";
import { useSocket } from "./hooks/useSocket";
import { Game } from "./pages/Game";
import { Home } from "./pages/Home";
import { Lobby } from "./pages/Lobby";
import { DEFAULT_SETTINGS } from "./utils/constants";

function App() {
  const { connected, playerId, ping, socketRef } = useSocket();
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
    rejoinSession,
    rejoinRoom,
    quitRejoinSession,
  } = useGameState(socketRef);

  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [joinChoiceOpen, setJoinChoiceOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [settings] = useState(DEFAULT_SETTINGS);
  const myId = playerId;

  const game = room?.game;
  const me = players.find((player) => player.id === myId);
  const drawer = players.find((player) => player.id === game?.drawerId);
  const isHost = room?.hostId === myId;
  const isDrawer = game?.drawerId === myId;

  const visibleSelectedWord = game?.phase === "choosing" ? "" : selectedWord;

  const createRoom = useCallback(() => {
    socketRef.current?.emit("create_room", {
      playerName,
      settings,
    });
  }, [playerName, settings, socketRef]);

  const joinRoom = useCallback(() => {
    if (roomCode.trim()) {
      setJoinChoiceOpen(true);
      return;
    }
    socketRef.current?.emit("join_room", {
      playerName,
      roomId: roomCode.trim(),
    });
  }, [playerName, roomCode, socketRef]);

  const joinAs = useCallback((role) => {
    setJoinChoiceOpen(false);
    socketRef.current?.emit("join_room", {
      playerName,
      roomId: roomCode.trim(),
      role,
    });
  }, [playerName, roomCode, socketRef]);

  const startGame = useCallback(() => {
    socketRef.current?.emit("start_game", { roomId: room?.roomId });
  }, [room?.roomId, socketRef]);

  const updateRoomSettings = useCallback((nextSettings) => {
    socketRef.current?.emit("update_room_settings", {
      roomId: room?.roomId,
      settings: nextSettings,
    });
  }, [room?.roomId, socketRef]);

  const chooseWord = useCallback((word) => {
    setSelectedWord(word);
    socketRef.current?.emit("word_chosen", { roomId: room?.roomId, word });
    setWordOptions([]);
  }, [room?.roomId, setWordOptions, socketRef]);

  const voteKick = useCallback((targetId) => {
    socketRef.current?.emit("vote_kick", { roomId: room?.roomId, targetId });
  }, [room?.roomId, socketRef]);

  const sendGuess = useCallback((text) => {
    socketRef.current?.emit("guess", { roomId: room?.roomId, text });
  }, [room?.roomId, socketRef]);

  const quitRoom = useCallback(() => {
    socketRef.current?.emit("quit_room", { roomId: room?.roomId });
  }, [room?.roomId, socketRef]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#2366bd] bg-[linear-gradient(180deg,rgba(36,103,195,0.94),rgba(22,80,170,0.92))]">
      <DoodleLayer static={screen === "game"} />
      <Navbar connected={connected} goHome={() => setScreen(room ? "lobby" : "home")} />

      {screen === "home" && (
        <Home
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          createRoom={createRoom}
          joinRoom={joinRoom}
          notice={notice}
          joinChoiceOpen={joinChoiceOpen}
          setJoinChoiceOpen={setJoinChoiceOpen}
          joinAs={joinAs}
        />
      )}

      {screen === "lobby" && room && (
        <Lobby
          room={room}
          players={players}
          isHost={isHost}
          myId={myId}
          onKickVote={voteKick}
          onQuitRoom={quitRoom}
          startGame={startGame}
          updateRoomSettings={updateRoomSettings}
          notice={notice}
        />
      )}

      {screen === "game" && room && (
        <Game
          room={room}
          game={game}
          selectedWord={visibleSelectedWord}
          players={sortedPlayers}
          spectators={room.spectators || []}
          ping={ping}
          me={me}
          myId={myId}
          onKickVote={voteKick}
          drawer={drawer}
          isDrawer={isDrawer}
          messages={messages}
          sendGuess={sendGuess}
          socketRef={socketRef}
          wordOptions={wordOptions}
          isSpectator={room.isSpectator}
          chooseWord={chooseWord}
          onQuitRoom={quitRoom}
        />
      )}

      {rejoinSession && !room && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#061731]/75 px-4">
          <div className="w-full max-w-md rounded-xl border-4 border-[#0c3579] bg-white p-6 text-[#172033] shadow-2xl">
            <p className="text-sm font-black uppercase tracking-wider text-[#2563eb]">Session found</p>
            <h2 className="mt-2 text-2xl font-black">You were in room {rejoinSession.roomId}</h2>
            <p className="mt-3 font-semibold text-gray-600">
              Rejoin as {rejoinSession.playerName}? Your score and game position are still saved.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="rounded-lg bg-[#58df28] px-4 py-3 font-black text-white hover:bg-[#4ade80]" onClick={rejoinRoom} type="button">
                Rejoin
              </button>
              <button className="rounded-lg bg-[#e5e7eb] px-4 py-3 font-black text-[#172033] hover:bg-[#d1d5db]" onClick={quitRejoinSession} type="button">
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
