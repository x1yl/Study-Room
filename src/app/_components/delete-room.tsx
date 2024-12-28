"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export function DeleteRoom({ roomId }: { roomId: string }) {
  const router = useRouter();
  const utils = api.useUtils();

  const deleteRoom = api.room.deleteRoom.useMutation({
    onSuccess: async () => {
      await utils.room.getUserRooms.invalidate();
      router.push("/");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this room? This action cannot be undone.",
      )
    ) {
      deleteRoom.mutate({ roomId });
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="rounded-full bg-red-500/10 px-5 py-2 font-semibold text-red-500 transition hover:bg-red-500/20"
      disabled={deleteRoom.isPending}
    >
      {deleteRoom.isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
