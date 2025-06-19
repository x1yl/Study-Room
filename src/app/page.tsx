import Link from "next/link";
import { CreateRoom } from "~/app/_components/create-room";
import { JoinRoom } from "~/app/_components/join-room";
import { RoomList } from "~/app/_components/room-list";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import {
  BookOpenIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    return (
      <HydrateClient>
        <div className="min-h-screen">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl lg:text-6xl">
                Welcome back,{" "}
                <span className="text-primary-600">
                  {session.user.name?.split(" ")[0]}
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-xl text-slate-600">
                Ready to dive into your next study session? Join a room or
                create a new one to get started.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mb-12">
              <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="shadow-study-lg hover:shadow-study-xl rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300">
                  <div className="mb-6 text-center">
                    <div className="bg-primary-100 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
                      <BookOpenIcon className="text-primary-600 h-8 w-8" />
                    </div>
                    <h3 className="mb-2 text-2xl font-semibold text-slate-900">
                      Create Study Room
                    </h3>
                    <p className="text-slate-600">
                      Start a new focused study session and invite friends
                    </p>
                  </div>
                  <CreateRoom />
                </div>

                <div className="shadow-study-lg hover:shadow-study-xl rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300">
                  <div className="mb-6 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
                      <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="mb-2 text-2xl font-semibold text-slate-900">
                      Join Study Room
                    </h3>
                    <p className="text-slate-600">
                      Connect with friends in an existing study session
                    </p>
                  </div>
                  <JoinRoom />
                </div>
              </div>
            </div>

            {/* Your Rooms */}
            <div className="mx-auto max-w-6xl">
              <RoomList userId={session.user.id} />
            </div>
          </div>
        </div>
      </HydrateClient>
    );
  }

  return (
    <HydrateClient>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
                Study Better,{" "}
                <span className="from-primary-600 bg-gradient-to-r to-blue-600 bg-clip-text text-transparent">
                  Together
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-slate-600">
                Join focused study rooms with friends, sync your calendar, track
                your progress with Pomodoro timers, and eliminate distractions
                to maximize your productivity.
              </p>
              <div className="mt-10">
                <Link
                  href="/auth/signin"
                  className="bg-primary-600 hover:bg-primary-700 shadow-study-lg hover:shadow-study-xl inline-flex transform items-center rounded-full px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">
                Everything you need to{" "}
                <span className="text-primary-600">focus</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-xl text-slate-600">
                Powerful features designed to help you stay productive and
                motivated
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="group text-center">
                <div className="bg-primary-100 group-hover:bg-primary-200 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-300">
                  <BookOpenIcon className="text-primary-600 h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900">
                  Study Rooms
                </h3>
                <p className="text-slate-600">
                  Create private or shared study spaces with real-time
                  collaboration
                </p>
              </div>

              <div className="group text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 transition-colors duration-300 group-hover:bg-blue-200">
                  <CalendarIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900">
                  Calendar Sync
                </h3>
                <p className="text-slate-600">
                  Integrate with Google Calendar to track your study schedule
                </p>
              </div>

              <div className="group text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 transition-colors duration-300 group-hover:bg-green-200">
                  <ClockIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900">
                  Pomodoro Timer
                </h3>
                <p className="text-slate-600">
                  Built-in focus timer to help you maintain productivity
                </p>
              </div>

              <div className="group text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 transition-colors duration-300 group-hover:bg-purple-200">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900">
                  Team Chat
                </h3>
                <p className="text-slate-600">
                  Communicate with study partners without leaving your room
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="from-primary-600 bg-gradient-to-r to-blue-600 py-24">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white sm:text-5xl">
              Ready to boost your productivity?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
              Join thousands of students who are already studying more
              effectively with StudySync.
            </p>
            <div className="mt-10">
              <Link
                href="/auth/signin"
                className="text-primary-600 shadow-study-lg hover:shadow-study-xl inline-flex transform items-center rounded-full bg-white px-8 py-4 text-lg font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50"
              >
                Start Studying Now
              </Link>
            </div>
          </div>
        </section>
      </div>
    </HydrateClient>
  );
}
