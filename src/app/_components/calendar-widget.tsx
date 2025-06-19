"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession, signIn } from "next-auth/react";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

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

  const formatDateTime = (dateTimeString: string): string => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    const isTomorrow =
      new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() ===
      date.toDateString();
    if (isTomorrow) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!session) {
    return (
      <div className="py-12 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
          <CalendarIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="mb-3 text-xl font-semibold text-slate-900">
          Connect Your Calendar
        </h3>
        <p className="mx-auto mb-6 max-w-md text-slate-600">
          Sync with Google Calendar to see your upcoming events and tasks right
          here in your study room.
        </p>
        <button
          onClick={() => void signIn("google")}
          className="shadow-study inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700"
        >
          <CalendarIcon className="h-5 w-5" />
          Connect Google Calendar
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-slate-200"></div>
          <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200"></div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="animate-pulse rounded-lg bg-slate-50 p-4">
              <div className="mb-2 h-4 w-3/4 rounded bg-slate-200"></div>
              <div className="h-3 w-1/2 rounded bg-slate-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!events.length && !tasks.length) {
    return (
      <div className="py-12 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <ExclamationTriangleIcon className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mb-3 text-xl font-semibold text-slate-900">
          No Events Found
        </h3>
        <p className="mx-auto mb-6 max-w-md text-slate-600">
          No upcoming events or tasks found in your calendar. Make sure your
          calendar is connected and has events.
        </p>
        <button
          onClick={() => void signIn("google")}
          className="shadow-study inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700"
        >
          <CalendarIcon className="h-5 w-5" />
          Reconnect Calendar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 flex h-8 w-8 items-center justify-center rounded-lg">
            <CalendarIcon className="text-primary-600 h-4 w-4" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Upcoming Items ({sortedItems.length})
          </h3>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600"
          title="Settings"
        >
          {showSettings ? (
            <XMarkIcon className="h-4 w-4" />
          ) : (
            <Cog6ToothIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="animate-slide-up space-y-4 rounded-xl bg-slate-50 p-4">
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={showTasks}
                onChange={(e) => setShowTasks(e.target.checked)}
                className="text-primary-600 focus:ring-primary-500 rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">
                Show Tasks
              </span>
            </label>
          </div>

          {calendars.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-700">
                Calendars
              </h4>
              <div className="space-y-2">
                {calendars.map((calendar) => (
                  <label key={calendar.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!hiddenCalendars.has(calendar.id)}
                      onChange={(e) => {
                        const newHidden = new Set(hiddenCalendars);
                        if (e.target.checked) {
                          newHidden.delete(calendar.id);
                        } else {
                          newHidden.add(calendar.id);
                        }
                        setHiddenCalendars(newHidden);
                      }}
                      className="text-primary-600 focus:ring-primary-500 rounded border-slate-300"
                    />
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: calendar.backgroundColor }}
                      />
                      <span className="text-sm text-slate-700">
                        {calendar.summary}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Events List */}
      <div className="max-h-80 space-y-3 overflow-y-auto">
        {items.slice(0, 10).map((item) => (
          <div
            key={getItemKey(item)}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors duration-200 hover:bg-slate-100"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                {isTaskItem(item) ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                ) : (
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.backgroundColor }}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-medium text-slate-900">
                  {isTaskItem(item) ? item.title : item.summary}
                </h4>
                <div className="mt-1 flex items-center gap-2">
                  <ClockIcon className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-500">
                    {formatDateTime(getItemDateTime(item))}
                  </span>
                </div>
                {!isTaskItem(item) && item.location && (
                  <p className="mt-1 truncate text-xs text-slate-500">
                    📍 {item.location}
                  </p>
                )}
                <div className="mt-1 text-xs text-slate-400">
                  {isTaskItem(item) ? item.listTitle : item.calendarTitle}
                </div>
              </div>
            </div>
          </div>
        ))}

        {items.length > 10 && (
          <div className="py-3 text-center">
            <span className="text-sm text-slate-500">
              and {items.length - 10} more items...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
