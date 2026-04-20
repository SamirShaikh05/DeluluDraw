import { useEffect, useMemo, useState } from "react";

export function useGameState(socketRef) {
  const [screen, setScreen] = useState("home");
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [wordOptions, setWordOptions] = useState([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return undefined;

    const onRoomJoined = ({ roomId }) => {
      setRoom((current) => (current ? { ...current, roomId } : current));
      setScreen("lobby");
      setNotice("");
    };
    const onRoomState = (snapshot) => {
      setRoom(snapshot);
      setMessages(snapshot.messages || []);
      if (snapshot.game) setScreen(snapshot.game.phase === "lobby" ? "lobby" : "game");
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

    socket.on("room_joined", onRoomJoined);
    socket.on("room_state", onRoomState);
    socket.on("message", onMessage);
    socket.on("choose_word", onChooseWord);
    socket.on("round_start", clearWordOptions);
    socket.on("game_over", clearWordOptions);
    socket.on("error", onError);

    return () => {
      socket.off("room_joined", onRoomJoined);
      socket.off("room_state", onRoomState);
      socket.off("message", onMessage);
      socket.off("choose_word", onChooseWord);
      socket.off("round_start", clearWordOptions);
      socket.off("game_over", clearWordOptions);
      socket.off("error", onError);
    };
  }, [socketRef]);

  const players = useMemo(() => room?.players || [], [room?.players]);
  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.score - a.score), [players]);

  return {
    messages,
    notice,
    players,
    room,
    screen,
    setNotice,
    setScreen,
    sortedPlayers,
    wordOptions,
    setWordOptions,
  };
}
