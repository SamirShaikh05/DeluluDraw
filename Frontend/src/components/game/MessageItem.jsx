export function MessageItem({ message }) {
  return (
    <p className={`px-2 py-1.25 text-[13px] font-bold wrap-break-word ${message.type === "system" ? "text-[#48b72d]" : "text-[#172033]"}`}>
      {message.type === "chat" && <strong>{message.playerName}: </strong>}
      {message.text}
    </p>
  );
}
