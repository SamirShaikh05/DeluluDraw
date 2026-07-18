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
    <aside className="grid h-90 min-h-90 grid-rows-[minmax(0,1fr)_44px] border-x-[3px] border-b-[3px] border-[#0c3579] bg-white md:h-[calc(min(62vh,560px)+58px)] md:min-h-122 md:border-t-0">
      <div className="chat-stream overflow-y-auto bg-[#f6f6f6]" ref={scrollRef}>
        {messages.map((message) => (
          <MessageItem message={message} key={message.id} />
        ))}
      </div>
      <form className="flex items-stretch" onSubmit={submit}>
        <input
          className="h-11 flex-1 rounded-none border-2 border-[#d4dded] px-3.25 py-3 font-bold text-[#172033] outline-none focus:border-[#72e34b] disabled:cursor-not-allowed disabled:opacity-100"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={disabled ? `${drawer?.name || "Artist"} is drawing` : "Type your guess here..."}
          disabled={disabled}
        />
        <button
          type="submit"
          className="h-11 w-12 shrink-0 border-2 border-[#0c3579] bg-[#0c3579] px-2 text-sm font-bold text-white transition-colors hover:bg-[#0a2a61] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled || !text.trim()}
          aria-label="Send guess"
        >
          Send
        </button>
      </form>
    </aside>
  );
}