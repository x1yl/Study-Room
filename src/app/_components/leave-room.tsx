"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline";

export function LeaveRoom({ roomId }: { roomId: string }) {
  const router = useRouter();
  const utils = api.useUtils();

  const removeMember = api.room.removeMember.useMutation({
    onSuccess: async () => {
      await utils.room.getUserRooms.invalidate();
      router.push("/");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleLeave = () => {
    if (window.confirm("Are you sure you want to leave this room?")) {
      removeMember.mutate({ roomId, userId: "self" });
    }
  };

  return (
    <button
      onClick={handleLeave}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 font-medium text-slate-700 transition-all duration-200 hover:bg-slate-200"
      disabled={removeMember.isPending}
    >
      <ArrowLeftEndOnRectangleIcon className="h-4 w-4" />
      {removeMember.isPending ? "Leaving..." : "Leave Room"}
    </button>
  );
}
