import { api } from "~/trpc/react";
import { useState } from "react";

export function CalendarWidget() {
  const [timeMin] = useState(() => new Date().toISOString());
  const [timeMax] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString();
  });

  const { data: events, isLoading } = api.calendar.getEvents.useQuery({
    timeMin,
    timeMax,
  });

  if (isLoading) return <div>Loading calendar...</div>;
  if (!events) return <div>No events found</div>;

  return (
    <div className="rounded-lg bg-white/10 p-4">
      <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
      <div className="space-y-2">
        {events.map((event) => (
          <div key={event.id} className="p-2 bg-white/5 rounded">
            <h3 className="font-semibold">{event.summary}</h3>
            <p className="text-sm text-gray-300">
              {new Date(event.start?.dateTime ?? "").toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
