import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { google } from "googleapis";

const calendar = google.calendar("v3");

export const calendarRouter = createTRPCRouter({
  getEvents: protectedProcedure
    .input(
      z.object({
        timeMin: z.string().optional(),
        timeMax: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.account.findFirst({
        where: {
          userId: ctx.session.user.id,
          provider: "google",
        },
      });

      if (!account?.access_token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Google Calendar not connected",
        });
      }

      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
      );

      auth.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
      });

      // Get list of all calendars
      const calendarList = await calendar.calendarList.list({ auth });
      const calendars = calendarList.data.items ?? [];

      // Fetch events from all calendars in parallel
      const allEventsPromises = calendars.map((cal) =>
        calendar.events.list({
          auth,
          calendarId: cal.id ?? "primary",
          timeMin: input.timeMin ?? new Date().toISOString(),
          timeMax: input.timeMax,
          singleEvents: true,
          orderBy: "startTime",
        }),
      );

      const allEventsResponses = await Promise.all(allEventsPromises);

      // Combine all events and add calendar info
      const allEvents = allEventsResponses.flatMap((response, index) => {
        const calendarInfo = calendars[index];
        return (response.data.items ?? []).map((event) => ({
          ...event,
          calendarId: calendarInfo!.id,
          calendarTitle: calendarInfo!.summary,
          backgroundColor: calendarInfo!.backgroundColor,
        }));
      });

      // Sort all events by start time
      allEvents.sort((a, b) => {
        const aTime = a.start?.dateTime ?? a.start?.date ?? "";
        const bTime = b.start?.dateTime ?? b.start?.date ?? "";
        return aTime.localeCompare(bTime);
      });

      return allEvents;
    }),
});
