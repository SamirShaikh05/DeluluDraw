export function MessageItem({ message }) {
  return (
    <p className={message.type === "system" ? "system-message" : "chat-message"}>
      {message.type === "chat" && <strong>{message.playerName}: </strong>}
      {message.text}
    </p>
  );
}
