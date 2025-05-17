import Link from "next/link";
import { CreateRoom } from "~/app/_components/create-room";
import { JoinRoom } from "~/app/_components/join-room";
import { RoomList } from "~/app/_components/room-list";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { ProfileMenu } from "./_components/ProfileMenu";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-[#2e026d] to-[#15162c] text-white">
        {session?.user && (
          <div className="fixed right-4 top-4 z-50">
            <ProfileMenu user={session.user} />
          </div>
        )}
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Study <span className="text-[hsl(280,100%,70%)]">Rooms</span>
          </h1>
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-2xl">
              {session ? (
                <span>Logged in as {session.user?.name}</span>
              ) : (
                <span>Sign in to create or join rooms</span>
              )}
            </p>
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </div>
          {session?.user && (
            <div className="flex w-full max-w-2xl flex-col gap-8">
              <div className="flex gap-4">
                <div className="flex-1">
                  <CreateRoom />
                </div>
                <div className="flex-1">
                  <JoinRoom />
                </div>
              </div>
              <RoomList userId={session.user.id} />
            </div>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
