import { PALETTE } from "../../utils/constants";

export function Toolbar({ color, setColor, size, setSize, socketRef, roomId, enabled }) {
  return (
    <div className="toolbar">
      <div className="swatches">
        {PALETTE.map((swatch) => (
          <button
            className={swatch === color ? "swatch selected" : "swatch"}
            key={swatch}
            onClick={() => setColor(swatch)}
            style={{ background: swatch }}
            type="button"
            aria-label={`Use ${swatch}`}
          />
        ))}
      </div>
      <label>
        Brush
        <input type="range" min="2" max="26" value={size} onChange={(event) => setSize(Number(event.target.value))} />
      </label>
      <button disabled={!enabled} onClick={() => socketRef.current?.emit("canvas_clear", { roomId })} type="button">Clear</button>
    </div>
  );
}
