"use client";

import { useState } from "react";
import { AddMember } from "./add-member";
import { MemberList } from "./member-list";
import { api } from "~/trpc/react";
import { UserGroupIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 font-medium text-slate-700 transition-all duration-200 hover:bg-slate-200"
      >
        <UserGroupIcon className="h-4 w-4" />
        Members ({room?.members.length ?? 0})
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div
                className="shadow-study-xl relative w-full max-w-md rounded-2xl border border-slate-200 bg-white"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b border-slate-200 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-100 flex h-10 w-10 items-center justify-center rounded-xl">
                        <UserGroupIcon className="text-primary-600 h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        Room Members
                      </h2>
                    </div>
                    <button
                      onClick={handleClose}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors duration-200 hover:bg-slate-200 hover:text-slate-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {isOwner && (
                    <div className="mb-6">
                      <label className="mb-3 block text-sm font-medium text-slate-700">
                        Add New Member
                      </label>
                      <AddMember roomId={roomId} />
                    </div>
                  )}

                  <div>
                    <label className="mb-3 block text-sm font-medium text-slate-700">
                      Current Members
                    </label>
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
            </div>
          </div>
        </>
      )}
    </>
  );
}
