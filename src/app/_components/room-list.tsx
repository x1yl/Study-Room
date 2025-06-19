"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import { DeleteRoom } from "./delete-room";
import { LeaveRoom } from "./leave-room";
import {
  UserGroupIcon,
  CalendarIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export function RoomList({ userId }: { userId: string }) {
  const { data: rooms, isLoading } = api.room.getUserRooms.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-slate-900">Your Study Rooms</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="shadow-study animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="mb-4 h-6 rounded bg-slate-200"></div>
              <div className="mb-2 h-4 rounded bg-slate-200"></div>
              <div className="mb-4 h-4 w-3/4 rounded bg-slate-200"></div>
              <div className="h-10 rounded bg-slate-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!rooms?.length) {
    return (
      <div className="py-12 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <UserGroupIcon className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mb-2 text-2xl font-semibold text-slate-900">
          No study rooms yet
        </h3>
        <p className="mx-auto max-w-md text-slate-600">
          Create your first study room or join an existing one to start
          collaborating with others.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Your Study Rooms</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">
          {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="group shadow-study hover:shadow-study-lg hover:border-primary-200 animate-slide-up rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="group-hover:text-primary-600 mb-2 text-xl font-semibold text-slate-900 transition-colors duration-200">
                  {room.name}
                </h3>
                <div className="mb-3 flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="h-4 w-4" />
                    <span>{room.members.length} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Created by {room.createdBy.name}</span>
                  </div>
                </div>
              </div>

              <div className="ml-4">
                {room.createdBy.id === userId ? (
                  <DeleteRoom roomId={room.id} />
                ) : (
                  <LeaveRoom roomId={room.id} />
                )}
              </div>
            </div>

            <div className="mb-4 border-t border-slate-100 pt-4">
              <p className="rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-400">
                ID: {room.id}
              </p>
            </div>

            <Link
              href={`/room/${room.id}`}
              className="bg-primary-50 text-primary-600 hover:bg-primary-100 group-hover:bg-primary-600 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 font-semibold transition-all duration-200 group-hover:text-blue-600"
            >
              Enter Room
              <ChevronRightIcon className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
