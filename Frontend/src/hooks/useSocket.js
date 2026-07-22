import { useEffect, useRef, useState } from "react";
import { createSocket } from "../services/socketService";

const PLAYER_ID_KEY = "deluludraw:player-id";

function getPlayerId() {
  const existingId = window.localStorage.getItem(PLAYER_ID_KEY);
  if (existingId) return existingId;
  const newId = crypto.randomUUID();
  window.localStorage.setItem(PLAYER_ID_KEY, newId);
  return newId;
}

export function useSocket() {
  const socketRef = useRef(null);
  const [playerId] = useState(getPlayerId);
  const [connected, setConnected] = useState(false);
  const [myId, setMyId] = useState("");
  const [ping, setPing] = useState(null);

  useEffect(() => {
    const socket = createSocket(playerId);
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      setMyId(socket.id);
    });
    socket.on("disconnect", () => {
      setConnected(false);
      setPing(null);
    });

    const sendPing = () => {
      if (socket.connected) {
        socket.emit("PING", { timestamp: Date.now() });
      }
    };

    const pingInterval = window.setInterval(sendPing, 2000);
    socket.on("PONG", ({ timestamp } = {}) => {
      if (typeof timestamp === "number") {
        setPing(Math.max(0, Date.now() - timestamp));
      }
    });

    return () => {
      window.clearInterval(pingInterval);
      socket.off("PONG");
      socket.disconnect();
    };
  }, [playerId]);

  return {
    connected,
    myId,
    playerId,
    ping,
    socketRef,
  };
}
