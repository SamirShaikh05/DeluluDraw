import { useEffect, useRef, useState } from "react";
import { createSocket } from "../services/socketService";

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [myId, setMyId] = useState("");

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setMyId(socket.id);
    });
    socket.on("disconnect", () => setConnected(false));

    return () => socket.disconnect();
  }, []);

  return {
    connected,
    myId,
    socketRef,
  };
}
