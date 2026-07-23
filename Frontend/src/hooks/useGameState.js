import { useEffect, useMemo, useState } from "react";

const SESSION_KEY = "deluludraw:session";

function saveSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function useGameState(socketRef) {
  const [screen, setScreen] = useState("home");
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [wordOptions, setWordOptions] = useState([]);
  const [notice, setNotice] = useState("");
  const [rejoinSession, setRejoinSession] = useState(null);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return undefined;

    const onKickVote = ({ voterName, targetName, count, required }) => {
      setMessages((current) => [
        ...current.slice(-90),
        {
          id: crypto.randomUUID(),
          type: "kick-vote",
          playerName: voterName,
          targetName,
          count,
          required,
        },
      ]);
    };
    const onRoomJoined = ({ roomId, hostId, player }) => {
      saveSession({ roomId, playerName: player?.name || "" });
      setRoom((current) => ({ ...(current || {}), roomId, hostId }));
      setScreen("lobby");
      setNotice("");
    };
    const onRejoinAvailable = (sessions) => {
      const savedSession = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null");
      const session = (sessions || []).find((candidate) => candidate.roomId === savedSession?.roomId);
      if (session) setRejoinSession(session);
    };
    const onRoomRejoined = ({ roomId, player }) => {
      saveSession({ roomId, playerName: player?.name || "" });
      setRejoinSession(null);
      setNotice("");
    };
    const onRoomState = (snapshot) => {
      setRoom(snapshot);
      setMessages(snapshot.messages || []);
      if (snapshot.game) {
        setScreen("game");
      } else {
        setWordOptions([]);
        setScreen("lobby");
      }
    };
    const onGameState = ({ game } = {}) => {
      if (!game) return;
      setRoom((current) => (current ? { ...current, game } : current));
    };
    const onMessage = (message) => {
      setMessages((current) => [...current.slice(-90), message]);
    };
    const onChooseWord = ({ wordOptions: options }) => {
      setWordOptions(options || []);
      setScreen("game");
    };
    const clearWordOptions = () => setWordOptions([]);
    const onError = ({ message }) => setNotice(message);
    const onKickedFromRoom = ({ message }) => {
      clearSession();
      setRoom(null);
      setMessages([]);
      setWordOptions([]);
      setScreen("home");
      setNotice(message || "You were removed from the match.");
    };
    const onRoomLeft = () => {
      clearSession();
      setRoom(null);
      setMessages([]);
      setWordOptions([]);
      setScreen("home");
      setNotice("");
    };
    
    socket.on("room_joined", onRoomJoined);
    socket.on("rejoin_available", onRejoinAvailable);
    socket.on("room_rejoined", onRoomRejoined);
    socket.on("room_left", onRoomLeft);
    socket.on("room_state", onRoomState);
    socket.on("game_state", onGameState);
    socket.on("message", onMessage);
    socket.on("choose_word", onChooseWord);
    socket.on("round_start", clearWordOptions);
    socket.on("kick_vote", onKickVote);
    socket.on("game_over", clearWordOptions);
    socket.on("error", onError);
    socket.on("kicked_from_room", onKickedFromRoom);
    socket.emit("session_ready");

    return () => {
      socket.off("room_joined", onRoomJoined);
      socket.off("rejoin_available", onRejoinAvailable);
      socket.off("room_rejoined", onRoomRejoined);
      socket.off("room_left", onRoomLeft);
      socket.off("room_state", onRoomState);
      socket.off("game_state", onGameState);
      socket.off("message", onMessage);
      socket.off("choose_word", onChooseWord);
      socket.off("round_start", clearWordOptions);
      socket.off("kick_vote", onKickVote);
      socket.off("game_over", clearWordOptions);
      socket.off("error", onError);
      socket.off("kicked_from_room", onKickedFromRoom);
    };
  }, [socketRef]);

  const players = useMemo(() => room?.players || [], [room?.players]);
  const spectators = useMemo(() => room?.spectators || [], [room?.spectators]);
  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players]);

  function rejoinRoom() {
    if (rejoinSession) {
      socketRef.current?.emit("rejoin_room", { roomId: rejoinSession.roomId });
    }
  }

  function quitRejoinSession() {
    if (rejoinSession) {
      socketRef.current?.emit("quit_room", { roomId: rejoinSession.roomId });
    }
    clearSession();
    setRejoinSession(null);
  }

  return {
    messages,
    notice,
    players,
    spectators,
    room,
    screen,
    setNotice,
    setScreen,
    sortedPlayers,
    wordOptions,
    setWordOptions,
    rejoinSession,
    rejoinRoom,
    quitRejoinSession,
  };
}
