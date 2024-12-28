"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function Chat({ roomId }: { roomId: string }) {
  const [message, setMessage] = useState("");
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
      <div className="mb-4 h-[400px] overflow-y-auto">
        <div className="flex flex-col-reverse gap-2">
          {messages?.map((msg) => (
            <div key={msg.id} className="rounded bg-white/5 p-2">
              <span className="font-bold">{msg.user.name}: </span>
              <span>{msg.content}</span>
            </div>
          ))}
        </div>
      </div>
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
          className="flex-1 rounded-lg bg-white/10 p-2 text-white"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="rounded-lg bg-white/10 px-4 py-2 font-semibold hover:bg-white/20"
        >
          Send
        </button>
      </form>
    </div>
  );
}
