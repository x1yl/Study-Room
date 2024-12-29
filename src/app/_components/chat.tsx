"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";

export function Chat({ roomId }: { roomId: string }) {
  const [message, setMessage] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const utils = api.useUtils();

  const {
    data: messages,
  }: {
    data: { id: string; user: { name: string }; content: string }[] | undefined;
  } = api.room.getMessages.useQuery({ roomId }, { refetchInterval: 1000 });

  const sendMessage = api.room.sendMessage.useMutation({
    onSuccess: async () => {
      setMessage("");
      await utils.room.getMessages.invalidate({ roomId });
    },
  });

  // Scroll to bottom when messages change or when chat is opened
  useEffect(() => {
    if (!isCollapsed && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isCollapsed]);

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-[calc(100%-2rem)] rounded-lg bg-white/10 p-4 shadow-lg sm:max-w-[360px] md:max-w-[384px]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="truncate font-semibold">Chat</h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sm text-white/80 hover:text-white"
        >
          {isCollapsed ? "Show" : "Hide"} chat
        </button>
      </div>

      {!isCollapsed && (
        <div
          ref={messagesContainerRef}
          className="mb-4 h-[250px] overflow-y-auto sm:h-[300px] md:h-[400px]"
        >
          <div className="flex flex-col-reverse gap-2">
            {messages?.map((msg) => (
              <div key={msg.id} className="break-words rounded bg-white/5 p-2">
                <div className="truncate font-bold">{msg.user.name}:</div>
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (message.trim()) {
            sendMessage.mutate({ roomId, content: message.trim() });
          }
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 overflow-x-hidden rounded-lg bg-white/10 p-2 text-sm text-white sm:text-base"
          placeholder="Type a message..."
          maxLength={500} // Add a reasonable character limit
        />
        <button
          type="submit"
          className="whitespace-nowrap rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20 sm:px-4 sm:text-base"
        >
          Send
        </button>
      </form>
    </div>
  );
}
