"use client";

import { signIn, useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { useState } from "react";

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
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

  const { data: events = [], isLoading: isLoadingEvents } =
    api.calendar.getEvents.useQuery<CalendarEvent[]>(timeRange, {
      enabled: !!session,
      retry: false,
    });

  const { data: tasks = [], isLoading: isLoadingTasks } =
    api.tasks.getTasks.useQuery<Task[]>(timeRange, {
      enabled: !!session,
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

  const sortedItems = [...events, ...tasks].sort((firstItem, secondItem) => {
    const firstItemDateTime = getItemDateTime(firstItem);
    const secondItemDateTime = getItemDateTime(secondItem);
    return firstItemDateTime.localeCompare(secondItemDateTime);
  });

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
          className="mt-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
        >
          Connect Google Calendar
        </button>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto rounded-lg bg-white/10 p-4 text-white">
      <h3 className="sticky top-0 mb-4 bg-[#2e026d] py-2 text-lg font-semibold">
        Upcoming Items ({items.length})
      </h3>
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
                  ? new Date(item.due).toLocaleDateString()
                  : "No due date"
                : item.start?.dateTime
                  ? new Date(item.start.dateTime).toLocaleString()
                  : item.start?.date
                    ? new Date(item.start.date).toLocaleDateString()
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
