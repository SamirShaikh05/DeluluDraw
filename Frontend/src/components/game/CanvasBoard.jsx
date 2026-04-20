import { useCanvas } from "../../hooks/useCanvas";

export function CanvasBoard({ socketRef, roomId, enabled, color, size }) {
  const { canvasRef, end, move, start } = useCanvas({ color, enabled, roomId, size, socketRef });

  return (
    <canvas
      ref={canvasRef}
      className={enabled ? "draw-canvas active" : "draw-canvas"}
      onMouseDown={start}
      onMouseMove={move}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={start}
      onTouchMove={move}
      onTouchEnd={end}
    />
  );
}
