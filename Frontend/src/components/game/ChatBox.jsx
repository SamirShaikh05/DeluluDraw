import { useEffect, useRef, useState } from "react";
import { IoMdSend } from "react-icons/io";
import { MessageItem } from "./MessageItem";

export function ChatBox({ messages, sendGuess, disabled, drawer }) {
  const [text, setText] = useState("");
  const scrollRef = useRef(null);
  const previousMessageCountRef = useRef(null);

  useEffect(() => {
    const currentMessageCount = messages.length;

    if (previousMessageCountRef.current === null) {
      previousMessageCountRef.current = currentMessageCount;
      if (currentMessageCount > 0) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
        });
      }
      return;
    }

    if (currentMessageCount > previousMessageCountRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      });
    }

    previousMessageCountRef.current = currentMessageCount;
  }, [messages.length, messages[messages.length - 1]?.id]);

  function submit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    sendGuess(text);
    setText("");
  }

  return (
    <aside className="chat-box flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-x-[3px] border-b-[3px] border-[#0c3579] bg-white md:border-t-0">
      {/* Messages Stream */}
      <div className="chat-stream flex-1 min-h-0 overflow-y-auto bg-[#f8fafc]" ref={scrollRef}>
        {messages.map((message) => (
          <MessageItem message={message} key={message.id} />
        ))}
      </div>

      {/* Minimal Form Container */}
      <form 
        className="relative flex h-11 w-full min-w-0 items-center border-t-2 border-[#0c3579] bg-white px-2"
        onSubmit={submit}
      >
        <input
          className="h-full w-full min-w-0 bg-transparent pr-9 pl-2 font-medium text-[#1e293b] placeholder-gray-400 outline-none disabled:cursor-not-allowed disabled:opacity-60"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={disabled ? `${drawer?.name || "Artist"} is drawing...` : "Type a guess..."}
          disabled={disabled}
        />

        {/* Minimal Embedded Send Icon */}
        <button
          type="submit"
          className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-md text-[#2563eb] transition-all hover:bg-blue-50 active:scale-95 disabled:pointer-events-none disabled:text-gray-300"
          disabled={disabled || !text.trim()}
          aria-label="Send guess"
        >
          <IoMdSend className="h-5 w-5" />
        </button>
      </form>
    </aside>
  );
}
