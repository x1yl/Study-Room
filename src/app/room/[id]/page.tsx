import { Metadata } from 'next'
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { HydrateClient } from "~/trpc/server";
import { AccessDenied } from "~/app/_components/access-denied";
import { PomodoroTimer } from "~/app/_components/pomodoro-timer";
import { AddMember } from "~/app/_components/add-member";
import { MemberList } from "~/app/_components/member-list";
import { DeleteRoom } from "~/app/_components/delete-room";

interface PageProps {
  params: {
    id: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const room = await api.room.getRoom({ roomId: params.id }).catch(() => null);

  return {
    title: room ? `${room.name} - Study Room` : 'Study Room',
    icons: {
      icon: '/favicon.png',
    },
  }
}

export default async function RoomPage({
  params,
}: PageProps) {
  const session = await auth();
  if (!session) redirect("/");

  const room = await api.room.getRoom({ roomId: params.id }).catch(() => null);
  
  if (!room) {
    return (
      <AccessDenied message="This room doesn't exist or you don't have access to it. If your friend gave this link make sure to tell them to add you as a member." />
    );
  }

  const isOwner = room.createdBy.id === session.user.id;
  const membersWithOwnerFlag = room.members.map(member => ({
    ...member,
    isOwner: member.id === room.createdBy.id
  }));

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center gap-12 px-4 py-16">
            <h1 className="text-4xl font-bold">{room.name} {isOwner && <DeleteRoom roomId={params.id} />}</h1>
          <PomodoroTimer />
          <div className="w-full max-w-md text-center">
            <h2 className="mb-4 text-2xl font-semibold">Members</h2>
            {isOwner && (
              <div className="mb-4">
                <AddMember roomId={params.id} />
              </div>
            )}
            <MemberList 
              roomId={params.id}
              members={membersWithOwnerFlag}
              isOwner={isOwner}
            />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}