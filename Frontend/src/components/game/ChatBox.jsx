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
    <aside className="grid h-90 min-h-90 grid-rows-[104px_minmax(0,1fr)_44px] border-x-[3px] border-b-[3px] border-[#0c3579] bg-white md:h-[calc(min(62vh,560px)+58px)] md:min-h-[488px] md:border-t-0">
      <div className="grid content-center gap-1.5 bg-[linear-gradient(90deg,rgba(17,24,39,0.82),rgba(239,68,68,0.34)),url('./assets/hero.png')] bg-cover bg-center px-[14px] py-[14px] text-white">
        <strong className="text-[17px]">Ride Smart, Save More</strong>
        <span className="text-xs font-extrabold">Sponsored sketch fuel</span>
      </div>
      <div className="chat-stream overflow-y-auto bg-[#f6f6f6]" ref={scrollRef}>
        {messages.map((message) => (
          <MessageItem message={message} key={message.id} />
        ))}
      </div>
      <form onSubmit={submit}>
        <input
          className="h-11 rounded-none border-2 border-[#d4dded] px-3.25 py-3 font-bold text-[#172033] outline-none focus:border-[#72e34b] disabled:cursor-not-allowed disabled:opacity-100"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={disabled ? `${drawer?.name || "Artist"} is drawing` : "Type your guess here..."}
          disabled={disabled}
        />
      </form>
    </aside>
  );
}
