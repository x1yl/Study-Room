"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

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

  // Auto-scroll to bottom function
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // Scroll to bottom when messages change or when chat is opened
  useEffect(() => {
    if (!isCollapsed) {
      // Small delay to ensure DOM is updated
      setTimeout(scrollToBottom, 10);
    }
  }, [messages, isCollapsed]);

  // Scroll to bottom when new message is sent (immediate scroll)
  useEffect(() => {
    if (!isCollapsed && messages?.length) {
      scrollToBottom();
    }
  }, [messages?.length, isCollapsed]);

  return (
    <div className="shadow-study-lg fixed right-4 bottom-4 z-40 w-full max-w-[calc(100%-2rem)] rounded-2xl border border-slate-200 bg-white sm:max-w-[360px] md:max-w-[384px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 flex h-8 w-8 items-center justify-center rounded-lg">
            <ChatBubbleLeftRightIcon className="text-primary-600 h-4 w-4" />
          </div>
          <h3 className="font-semibold text-slate-900">Team Chat</h3>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1 text-sm text-slate-500 transition-colors duration-200 hover:text-slate-700"
        >
          {isCollapsed ? (
            <>
              <span>Show</span>
              <ChevronUpIcon className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>Hide</span>
              <ChevronDownIcon className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Chat Messages */}
      {!isCollapsed && (
        <div
          ref={messagesContainerRef}
          className="h-[250px] space-y-3 overflow-y-auto p-4 sm:h-[300px] md:h-[400px]"
        >
          {messages && messages.length > 0 ? (
            <div className="flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="animate-slide-up rounded-lg bg-slate-50 p-3"
                >
                  <div className="mb-1 text-sm font-medium text-slate-900">
                    {msg.user.name}
                  </div>
                  <div className="text-sm break-words whitespace-pre-wrap text-slate-700">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ChatBubbleLeftRightIcon className="mb-3 h-12 w-12 text-slate-300" />
              <p className="text-sm text-slate-500">No messages yet</p>
              <p className="text-xs text-slate-400">Start the conversation!</p>
            </div>
          )}
        </div>
      )}

      {/* Chat Input */}
      {!isCollapsed && (
        <div className="border-t border-slate-200 p-4">
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
              className="focus:ring-primary-500 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:outline-none"
              placeholder="Type a message..."
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!message.trim() || sendMessage.isPending}
              className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
