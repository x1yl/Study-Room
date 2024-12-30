"use client";

import { signIn, useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { useState } from "react";

export function CalendarWidget() {
  const { data: session } = useSession();
  const [timeRange] = useState({
    timeMin: new Date().toISOString(),
    timeMax: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  });

  const { data: events, isLoading } = api.calendar.getEvents.useQuery(
    timeRange,
    {
      enabled: !!session,
      retry: false,
    },
  );

  if (!session) {
    return (
      <div className="rounded-lg bg-white/10 p-4 text-white">
        <h3 className="mb-4 text-lg font-semibold">Calendar Events</h3>
        <button
          onClick={() => void signIn("google")}
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
        >
          Connect Google Calendar
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white/10 p-4 text-white">
        <h3 className="mb-4 text-lg font-semibold">Calendar Events</h3>
        <p>Loading events...</p>
      </div>
    );
  }

  if (!events) {
    return (
      <div className="rounded-lg bg-white/10 p-4 text-white">
        <h3 className="mb-4 text-lg font-semibold">Calendar Events</h3>
        <p>No events found or calendar not connected.</p>
        <button
          onClick={() => void signIn("google")}
          className="mt-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
        >
          Connect Google Calendar
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white/10 p-4 text-white">
      <h3 className="mb-4 text-lg font-semibold">Upcoming Events</h3>
      <div className="flex flex-col gap-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-md bg-white/5 p-3 hover:bg-white/10"
          >
            <h4 className="font-medium">{event.summary}</h4>
            <p className="text-sm text-gray-300">
              {event.start?.dateTime
                ? new Date(event.start.dateTime).toLocaleString()
                : event.start?.date}
            </p>
          </div>
        ))}
        {events.length === 0 && <p>No upcoming events</p>}
      </div>
    </div>
  );
}
