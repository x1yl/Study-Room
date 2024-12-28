"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function AddMember({ roomId }: { roomId: string }) {
  const [username, setUsername] = useState("");
  const utils = api.useUtils();

  const addMember = api.room.addMember.useMutation({
    onSuccess: async () => {
      setUsername("");
      // Invalidate both room and userRooms queries
      await Promise.all([
        utils.room.getRoom.invalidate({ roomId }),
        utils.room.getUserRooms.invalidate()
      ]);
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addMember.mutate({ roomId, username });
      }}
      className="flex gap-2"
    >
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <button
        type="submit"
        className="rounded-full bg-white/10 px-6 py-2 font-semibold transition hover:bg-white/20"
        disabled={addMember.isPending}
      >
        {addMember.isPending ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
