"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function Chat({ roomId }: { roomId: string }) {
  const [message, setMessage] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  return (
    <div className="fixed bottom-4 right-4 w-96 rounded-lg bg-white/10 p-4 shadow-lg">
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
        <div className="mb-4 h-[400px] overflow-y-auto">
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
          className="flex-1 overflow-x-hidden rounded-lg bg-white/10 p-2 text-white"
          placeholder="Type a message..."
          maxLength={500} // Add a reasonable character limit
        />
        <button
          type="submit"
          className="whitespace-nowrap rounded-lg bg-white/10 px-4 py-2 font-semibold hover:bg-white/20"
        >
          Send
        </button>
      </form>
    </div>
  );
}
