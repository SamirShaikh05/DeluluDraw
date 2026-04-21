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

    // add this handler function with the others at the top of the useEffect
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
    const onRoomJoined = ({ roomId, hostId }) => {
      setRoom((current) => ({ ...(current || {}), roomId, hostId }));
      setScreen("lobby");
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
      setRoom(null);
      setMessages([]);
      setWordOptions([]);
      setScreen("home");
      setNotice(message || "You were removed from the match.");
    };
    
    socket.on("room_joined", onRoomJoined);
    socket.on("room_state", onRoomState);
    socket.on("message", onMessage);
    socket.on("choose_word", onChooseWord);
    socket.on("round_start", clearWordOptions);
    socket.on("kick_vote", onKickVote);
    socket.on("game_over", clearWordOptions);
    socket.on("error", onError);
    socket.on("kicked_from_room", onKickedFromRoom);

    return () => {
      socket.off("room_joined", onRoomJoined);
      socket.off("room_state", onRoomState);
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
