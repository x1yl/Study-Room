"use client";

import { api } from "~/trpc/react";

interface LocalUser {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
}

interface MemberWithOwner extends LocalUser {
  isOwner: boolean;
}

interface MemberListProps {
  roomId: string;
  members: MemberWithOwner[];
  isOwner: boolean;
}

export function MemberList({ roomId, members, isOwner }: MemberListProps) {
  const utils = api.useUtils();

  const removeMember = api.room.removeMember.useMutation({
    onSuccess: async () => {
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
    <div className="flex flex-wrap justify-center gap-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1"
        >
          <span>{member.name}</span>
          {isOwner && !member.isOwner && (
            <button
              onClick={() => {
                if (window.confirm(`Remove ${member.name} from the room?`)) {
                  removeMember.mutate({ roomId, userId: member.id });
                }
              }}
              className="ml-2 text-red-400 hover:text-red-300"
              disabled={removeMember.isPending}
              title="Remove member"
              aria-label={`Remove ${member.name} from room`}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
