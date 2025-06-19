"use client";

import { api } from "~/trpc/react";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useCachedImage } from "~/lib/useCachedImage";

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

interface MemberAvatarProps {
  member: LocalUser;
}

function MemberAvatar({ member }: MemberAvatarProps) {
  const { imageUrl: cachedImageUrl, isLoading: imageLoading } = useCachedImage(
    member.image,
    {
      cacheKey: `member_${member.id}`,
    },
  );

  if (cachedImageUrl && !imageLoading) {
    return (
      <Image
        src={cachedImageUrl}
        alt={`${member.name}'s avatar`}
        className="h-8 w-8 rounded-full"
        width={32}
        height={32}
        unoptimized
      />
    );
  }

  // Fallback to initials or icon
  if (member.name) {
    return (
      <div className="bg-primary-100 flex h-8 w-8 items-center justify-center rounded-full">
        <span className="text-primary-700 text-sm font-medium">
          {member.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
      <UserCircleIcon className="h-5 w-5 text-slate-500" />
    </div>
  );
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
    <div className="space-y-3">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
        >
          <div className="flex items-center gap-3">
            <MemberAvatar member={member} />
            <div>
              <p className="text-sm font-medium text-slate-900">
                {member.name}
              </p>
              {member.isOwner && (
                <p className="text-primary-600 text-xs font-medium">
                  Room Owner
                </p>
              )}
            </div>
          </div>
          {isOwner && !member.isOwner && (
            <button
              onClick={() => {
                if (window.confirm(`Remove ${member.name} from the room?`)) {
                  removeMember.mutate({ roomId, userId: member.id });
                }
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-200"
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
