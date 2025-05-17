"use client";

import { signIn, useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { useState } from "react";
import { Settings, X } from "lucide-react";

interface Calendar {
  id: string;
  summary: string;
  backgroundColor: string;
  primary?: boolean;
  selected?: boolean;
  accessRole: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  backgroundColor: string;
  calendarTitle: string;
  calendarId: string;
}

interface Task {
  id: string;
  title: string;
  due?: string;
  type: "task";
  listTitle: string;
  listId: string;
}

export function CalendarWidget() {
  const { data: session } = useSession();
  const [timeRange] = useState({
    timeMin: new Date().toISOString(),
    timeMax: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Extended to 30 days
  });
  const [showSettings, setShowSettings] = useState(false);
  const [hiddenCalendars, setHiddenCalendars] = useState<Set<string>>(
    new Set(),
  );
  const [showTasks, setShowTasks] = useState(true);

  const { data, isLoading: isLoadingEvents } =
    api.calendar.getCalendarData.useQuery<{
      allEvents: CalendarEvent[];
      calendars: Calendar[];
    }>(timeRange, {
      enabled: !!session,
      retry: false,
    });

  const events = data?.allEvents ?? [];
  const calendars = data?.calendars ?? [];

  const { data: tasks = [], isLoading: isLoadingTasks } =
    api.tasks.getTasks.useQuery<Task[]>(timeRange, {
      enabled: !!session && showTasks,
      retry: false,
    });

  const isLoading = isLoadingEvents || isLoadingTasks;

  const isTaskItem = (item: CalendarEvent | Task): item is Task => {
    return "type" in item && item.type === "task";
  };

  const getItemDateTime = (item: CalendarEvent | Task): string => {
    if (isTaskItem(item)) {
      return item.due ?? "";
    }
    return item.start?.dateTime ?? item.start?.date ?? "";
  };

  // Filter events based on hidden calendars
  const filteredEvents = events.filter(
    (event) => !hiddenCalendars.has(event.calendarId),
  );

  const sortedItems = [...filteredEvents, ...(showTasks ? tasks : [])].sort(
    (a, b) => getItemDateTime(a).localeCompare(getItemDateTime(b)),
  );

  const items = sortedItems;

  const getItemKey = (item: CalendarEvent | Task): string => {
    if ("type" in item) {
      return `task-${item.listId}-${item.id}`;
    }
    return `event-${item.calendarId}-${item.id}`;
  };

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

  if (!events.length && !tasks.length) {
    return (
      <div className="rounded-lg bg-white/10 p-4 text-white">
        <h3 className="mb-4 text-lg font-semibold">Calendar Events</h3>
        <p>No events found or calendar not connected.</p>
        <button
          onClick={() => void signIn("google")}
          className="mt-2 rounded-sm bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
        >
          Connect Google Calendar
        </button>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto rounded-lg bg-white/10 p-4 text-white">
      <div className="sticky top-0 mb-4 flex items-center justify-between bg-[#2e026d] py-2">
        <h3 className="text-lg font-semibold">
          Upcoming Items ({sortedItems.length})
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-full p-1 hover:bg-white/10"
          title="Settings"
        >
          {showSettings ? <X size={20} /> : <Settings size={20} />}
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 rounded-lg bg-white/5 p-3">
          <div className="mb-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showTasks}
                onChange={(e) => setShowTasks(e.target.checked)}
                className="rounded"
              />
              <span>Show Tasks</span>
            </label>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Calendars</h4>
            {calendars.map((cal) => (
              <label key={cal.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!hiddenCalendars.has(cal.id)}
                  onChange={() => {
                    const newHidden = new Set(hiddenCalendars);
                    if (hiddenCalendars.has(cal.id)) {
                      newHidden.delete(cal.id);
                    } else {
                      newHidden.add(cal.id);
                    }
                    setHiddenCalendars(newHidden);
                  }}
                  className="rounded"
                />
                <span className="flex items-center space-x-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: cal.backgroundColor ?? "#4285f4",
                    }}
                  ></span>
                  <span>{cal.summary}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={getItemKey(item)}
            className="rounded-md bg-white/5 p-3 hover:bg-white/10"
            style={{
              borderLeft: `4px solid ${
                "type" in item
                  ? "#db4437" // Task color
                  : (item.backgroundColor ?? "#4285f4") // Calendar color
              }`,
            }}
          >
            <div className="flex items-start justify-between">
              <h4 className="font-medium">
                {"type" in item ? item.title : item.summary}
              </h4>
              <span className="text-xs text-gray-400">
                {"type" in item ? item.listTitle : item.calendarTitle}
              </span>
            </div>
            <p className="text-sm text-gray-300">
              {"type" in item
                ? item.due
                  ? `${(new Date(item.due).getUTCMonth() + 1).toString().padStart(2, "0")}/${new Date(item.due).getUTCDate().toString().padStart(2, "0")}/${new Date(item.due).getUTCFullYear()}`
                  : "No due date"
                : item.start?.dateTime
                  ? `${new Date(item.start.dateTime).toLocaleString()} - ${new Date(item.end?.dateTime ?? "").toLocaleString()}`
                  : item.start?.date
                    ? `${(new Date(item.start.date).getUTCMonth() + 1).toString().padStart(2, "0")}/${new Date(item.start.date).getUTCDate().toString().padStart(2, "0")}/${new Date(item.start.date).getUTCFullYear()}`
                    : "No date"}
            </p>
            {!("type" in item) && (
              <>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-400">
                    {item.description}
                  </p>
                )}
                {item.location && (
                  <p className="mt-1 text-sm text-gray-400">{item.location}</p>
                )}
              </>
            )}
          </div>
        ))}
        {items.length === 0 && <p>No upcoming items</p>}
      </div>
    </div>
  );
}
