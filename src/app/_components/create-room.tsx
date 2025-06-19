"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";

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
        if (name.trim()) {
          createRoom.mutate({ name: name.trim() });
        }
      }}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="room-name"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Room Name
        </label>
        <input
          id="room-name"
          type="text"
          placeholder="e.g., CS Study Group, Final Exam Prep..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="focus:ring-primary-500 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:outline-none"
          maxLength={50}
          required
        />
      </div>
      <button
        type="submit"
        disabled={createRoom.isPending || !name.trim()}
        className="hover:shadow-study-md flex w-full transform items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {createRoom.isPending ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
            Creating...
          </div>
        ) : (
          <>
            <PlusIcon className="h-5 w-5" />
            Create Study Room
          </>
        )}
      </button>
    </form>
  );
}
