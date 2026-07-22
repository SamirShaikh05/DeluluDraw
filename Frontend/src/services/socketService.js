import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

export function createSocket(playerId) {
  return io(SERVER_URL, {
    transports: ["websocket", "polling"],
    auth: { playerId },
  });
}
