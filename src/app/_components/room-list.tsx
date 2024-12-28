"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { DeleteRoom } from "./delete-room";

export function RoomList() {
  const { data: rooms, isLoading } = api.room.getUserRooms.useQuery();

  if (isLoading) return <div>Loading rooms...</div>;
  if (!rooms?.length) return <div>No rooms found.</div>;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Your Rooms</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="flex flex-col gap-2 rounded-xl bg-white/10 p-4"
          >
            <Link
              href={`/room/${room.id}`}
              className="flex flex-col gap-2 transition hover:text-[hsl(280,100%,70%)]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{room.name}</h3>
                {room.createdBy.id === room.members[0]?.id && (
                  <DeleteRoom roomId={room.id} />
                )}
              </div>

              <div className="mt-2 border-t border-white/10 pt-2"></div>
              <p className="text-sm text-gray-300">
                Created by: {room.createdBy.name}
              </p>
              <p className="text-sm text-gray-300">
                Members: {room.members.length}
              </p>
              <p className="text-xs text-gray-400">ID: {room.id}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
