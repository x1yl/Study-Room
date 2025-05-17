"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export function CreateRoom() {
  const [name, setName] = useState("");
  const utils = api.useUtils();
  const router = useRouter();

  const createRoom = api.room.create.useMutation({
    onSuccess: async (room) => {
      setName("");
      await utils.room.getUserRooms.invalidate();
      router.push(`/room/${room.id}`);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        createRoom.mutate({ name });
      }}
      className="flex flex-col gap-2"
    >
      <input
        type="text"
        placeholder="Room name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-white"
      />
      <button
        type="submit"
        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        disabled={createRoom.isPending}
      >
        {createRoom.isPending ? "Creating..." : "Create Room"}
      </button>
    </form>
  );
}
