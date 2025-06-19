import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { AccessDenied } from "~/app/_components/access-denied";
import { DeleteRoom } from "~/app/_components/delete-room";
import { Chat } from "~/app/_components/chat";
import { type Metadata } from "next";
import { MemberMenu } from "~/app/_components/member-menu";
import { LeaveRoom } from "~/app/_components/leave-room";
import { CalendarWidget } from "~/app/_components/calendar-widget";
import { PomodoroWidget } from "~/app/_components/pomodoro-widget";
import { HomeIcon, UserGroupIcon } from "@heroicons/react/24/outline";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const room = await api.room
    .getRoom({ roomId: resolvedParams.id })
    .catch(() => null);

  return {
    title: room ? `${room.name} - StudySync` : "StudySync",
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/");

  const resolvedParams = await params;
  const room = await api.room
    .getRoom({ roomId: resolvedParams.id })
    .catch(() => null);

  if (!room) {
    return (
      <AccessDenied message="This room doesn't exist or you don't have access to it. If your friend gave this link make sure to tell them to add you as a member." />
    );
  }

  const isOwner = room.createdBy.id === session.user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Room Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors duration-200 hover:bg-slate-200"
              >
                <HomeIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {room.name}
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  <UserGroupIcon className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-500">
                    {room.members.length} member
                    {room.members.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm text-slate-500">
                    Created by {room.createdBy.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MemberMenu roomId={resolvedParams.id} />
              {isOwner ? (
                <DeleteRoom roomId={resolvedParams.id} />
              ) : (
                <LeaveRoom roomId={resolvedParams.id} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Calendar Widget */}
          <div className="lg:col-span-2">
            <div className="shadow-study-lg overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Your Schedule
                </h2>
                <p className="mt-1 text-slate-600">
                  Stay on top of your upcoming events and tasks
                </p>
              </div>
              <div className="p-6">
                <CalendarWidget />
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Pomodoro Timer */}
            <PomodoroWidget />

            {/* Room Info */}
            <div className="shadow-study rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Room Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Room ID
                  </label>
                  <p className="mt-1 rounded bg-slate-50 px-2 py-1 font-mono text-sm text-slate-600">
                    {resolvedParams.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                    <span className="text-sm text-slate-600">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Tips */}
            <div className="from-primary-50 border-primary-200 rounded-2xl border bg-gradient-to-br to-blue-50 p-6">
              <h3 className="text-primary-900 mb-4 text-lg font-semibold">
                Study Tips
              </h3>
              <ul className="text-primary-800 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  Use the Pomodoro timer for focused 25-minute sessions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  Check your calendar for upcoming deadlines
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1">•</span>
                  Collaborate with room members via chat
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Components */}
      <Chat roomId={resolvedParams.id} />
    </div>
  );
}
