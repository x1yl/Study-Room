"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

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
      className="rounded-full bg-white/10 px-5 py-2 font-semibold transition hover:bg-white/20"
      disabled={removeMember.isPending}
    >
      {removeMember.isPending ? "Leaving..." : "Leave Room"}
    </button>
  );
}
