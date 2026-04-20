export function Navbar({ connected, goHome }) {
  return (
    <header className="topbar">
      <button className="brand" onClick={goHome} type="button">
        <span className="bolt">*</span>
        <span>deluludraw</span>
      </button>
      <div className="connection">
        <span className={connected ? "dot online" : "dot"} />
        {connected ? "online" : "connecting"}
      </div>
    </header>
  );
}
