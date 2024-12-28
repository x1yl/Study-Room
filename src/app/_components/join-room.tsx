"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export function JoinRoom() {
  const [roomId, setRoomId] = useState("");
  const utils = api.useUtils();
  const router = useRouter();

  const joinRoom = api.room.join.useMutation({
    onSuccess: async (room) => {
      setRoomId("");
      await utils.room.getUserRooms.invalidate();
      router.push(`/room/${room.id}`);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        joinRoom.mutate({ roomId });
      }}
      className="flex flex-col gap-2"
    >
      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={joinRoom.isPending}
      >
        {joinRoom.isPending ? "Joining..." : "Join Room"}
      </button>
    </form>
  );
}
