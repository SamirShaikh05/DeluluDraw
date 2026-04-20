import { useEffect, useRef, useState } from "react";
import { MessageItem } from "./MessageItem";

export function ChatBox({ messages, sendGuess, disabled, drawer }) {
  const [text, setText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function submit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    sendGuess(text);
    setText("");
  }

  return (
    <aside className="chat-panel">
      <div className="ad-box">
        <strong>Ride Smart, Save More</strong>
        <span>Sponsored sketch fuel</span>
      </div>
      <div className="chat-stream" ref={scrollRef}>
        {messages.map((message) => (
          <MessageItem message={message} key={message.id} />
        ))}
      </div>
      <form onSubmit={submit} className="guess-form">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={disabled ? `${drawer?.name || "Artist"} is drawing` : "Type your guess here..."}
          disabled={disabled}
        />
      </form>
    </aside>
  );
}
