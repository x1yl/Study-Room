"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export function JoinRoom() {
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const utils = api.useUtils();
  const router = useRouter();

  const joinRoom = api.room.join.useMutation({
    onSuccess: async (room) => {
      setRoomId("");
      setError("");
      await utils.room.getUserRooms.invalidate();
      router.push(`/room/${room.id}`);
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (roomId.trim()) {
          setError("");
          joinRoom.mutate({ roomId: roomId.trim() });
        }
      }}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="room-id"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Room ID
        </label>
        <input
          id="room-id"
          type="text"
          placeholder="Enter room ID to join..."
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={joinRoom.isPending || !roomId.trim()}
        className="hover:shadow-study-md flex w-full transform items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {joinRoom.isPending ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
            Joining...
          </div>
        ) : (
          <>
            <ArrowRightIcon className="h-5 w-5" />
            Join Study Room
          </>
        )}
      </button>
    </form>
  );
}
