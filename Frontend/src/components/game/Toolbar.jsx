import { PALETTE } from "../../utils/constants";

export function Toolbar({ color, setColor, size, setSize, socketRef, roomId, enabled }) {
  return (
    <div className="grid grid-cols-1 items-center gap-2.5 border-t-2 border-[#d9e4f5] bg-[#eef4ff] p-2.5 sm:grid-cols-[minmax(0,1fr)_170px_82px]">
      <div className="flex flex-wrap gap-[5px]">
        {PALETTE.map((swatch) => (
          <button
            className={`h-6.5 w-6.5 border-[3px] border-white shadow-[0_0_0_1px_#172033] ${swatch === color ? "shadow-[0_0_0_3px_#58df28]" : ""}`}
            key={swatch}
            onClick={() => setColor(swatch)}
            style={{ background: swatch }}
            type="button"
            aria-label={`Use ${swatch}`}
          />
        ))}
      </div>
      <label className="grid gap-0.5 text-xs font-black">
        Brush
        <input type="range" min="2" max="26" value={size} onChange={(event) => setSize(Number(event.target.value))} />
      </label>
      <button
        className="min-h-9 bg-red-500 text-white disabled:cursor-not-allowed disabled:opacity-62"
        disabled={!enabled}
        onClick={() => socketRef.current?.emit("canvas_clear", { roomId })}
        type="button"
      >
        Clear
      </button>
    </div>
  );
}
