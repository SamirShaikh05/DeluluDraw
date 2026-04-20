import { useCallback, useEffect, useRef } from "react";

export function useCanvas({ color, enabled, roomId, size, socketRef }) {
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

  return {
    canvasRef,
    end,
    move,
    start,
  };
}
