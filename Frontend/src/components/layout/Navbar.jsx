export function Navbar({ connected, goHome }) {
  return (
    <header className="relative z-30 flex items-center justify-between px-3 py-3 text-[#eaf2ff] sm:px-5.5 sm:py-3.5">
      <button className="inline-flex items-center gap-2 bg-transparent font-extrabold text-inherit" onClick={goHome} type="button">
        <span className="text-[#7cf244]">*</span>
        <span>deluludraw</span>
      </button>
      <div className="inline-flex items-center gap-2 text-[13px] font-extrabold uppercase">
        <span className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-[#73ec42]" : "bg-red-500"}`} />
        {connected ? "online" : "connecting"}
      </div>
    </header>
  );
}
