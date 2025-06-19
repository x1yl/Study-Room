"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { TrashIcon } from "@heroicons/react/24/outline";

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
      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-medium text-red-700 transition-all duration-200 hover:bg-red-100"
      disabled={deleteRoom.isPending}
    >
      <TrashIcon className="h-4 w-4" />
      {deleteRoom.isPending ? "Deleting..." : "Delete Room"}
    </button>
  );
}
