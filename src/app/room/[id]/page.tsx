import { redirect } from "next/navigation";
import { PomodoroTimer } from "~/app/_components/pomodoro-timer";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { AccessDenied } from "~/app/_components/access-denied";
import { DeleteRoom } from "~/app/_components/delete-room";
import { Chat } from "~/app/_components/chat";
import { type Metadata } from "next";
import { MemberMenu } from "~/app/_components/member-menu";
import { LeaveRoom } from "~/app/_components/leave-room";
import { CalendarWidget } from "~/app/_components/calendar-widget";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const room = await api.room
    .getRoom({ roomId: resolvedParams.id })
    .catch(() => null);

  return {
    title: room ? `${room.name} - Study Room` : "Study Room",
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
    <main className="flex flex-col items-center justify-start text-white">
      <div className="container flex flex-col items-center gap-12 px-4 py-16">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold">{room.name}</h1>
          <MemberMenu roomId={resolvedParams.id} />
          {isOwner ? (
            <DeleteRoom roomId={resolvedParams.id} />
          ) : (
            <LeaveRoom roomId={resolvedParams.id} />
          )}
        </div>
        <Chat roomId={resolvedParams.id} />
        <CalendarWidget />
      </div>
      <PomodoroTimer />
    </main>
  );
}
