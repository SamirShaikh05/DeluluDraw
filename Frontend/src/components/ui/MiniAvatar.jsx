export function MiniAvatar({ color, guessed = false }) {
  return (
    <span className={guessed ? "mini-avatar guessed" : "mini-avatar"} style={{ "--avatar": color }}>
      <i />
    </span>
  );
}
