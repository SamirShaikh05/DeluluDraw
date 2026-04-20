const DOODLES = [":)", "?", "!", "car", "sun", "hat", "box", "cat", "zip", "key", "cup", "pen"];

export function DoodleLayer() {
  return (
    <div className="doodles" aria-hidden="true">
      {DOODLES.map((item, index) => (
        <span key={`${item}-${index}`}>{item}</span>
      ))}
    </div>
  );
}
