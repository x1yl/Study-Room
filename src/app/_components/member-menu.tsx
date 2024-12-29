"use client";

import { useState } from "react";
import { AddMember } from "./add-member";
import { MemberList } from "./member-list";
import { api } from "~/trpc/react";

export function MemberMenu({ roomId }: { roomId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: room } = api.room.getRoom.useQuery(
    { roomId },
    { enabled: isOpen },
  );

  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);

  const isOwner =
    room?.createdBy.id ===
    room?.members.find((m) => m.id === room?.createdBy.id)?.id;
  const membersWithOwnerFlag =
    room?.members.map((member) => ({
      ...member,
      isOwner: member.id === room?.createdBy.id,
    })) ?? [];

  return (
    <>
      <button
        onClick={handleOpen}
        className="rounded-full bg-white/10 px-4 py-2 font-semibold hover:bg-white/20"
      >
        Members
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div
                className="relative w-full max-w-md rounded-lg bg-[#2e026d] p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Room Members</h2>
                  <button
                    onClick={handleClose}
                    className="text-2xl text-white/70 hover:text-white"
                  >
                    ×
                  </button>
                </div>

                {isOwner && (
                  <div className="mb-6">
                    <AddMember roomId={roomId} />
                  </div>
                )}

                {room && (
                  <MemberList
                    roomId={roomId}
                    members={membersWithOwnerFlag}
                    isOwner={isOwner ?? false}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
