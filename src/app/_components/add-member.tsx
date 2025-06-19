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
        utils.room.getUserRooms.invalidate(),
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
      className="flex gap-3"
    >
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="focus:ring-primary-500 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:outline-none"
      />
      <button
        type="submit"
        className="bg-primary-600 text-slate-650 hover:bg-primary-700 transform rounded-xl px-6 py-2 font-semibold shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        disabled={addMember.isPending}
      >
        {addMember.isPending ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
