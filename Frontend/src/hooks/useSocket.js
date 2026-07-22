import { useEffect, useRef, useState } from "react";
import { createSocket } from "../services/socketService";

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [myId, setMyId] = useState("");
  const [ping, setPing] = useState(null);

  useEffect(() => {
    const socket = createSocket();
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
  }, []);

  return {
    connected,
    myId,
    ping,
    socketRef,
  };
}
