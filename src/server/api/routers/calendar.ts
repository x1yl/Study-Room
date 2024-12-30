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

      const response = await calendar.events.list({
        auth,
        calendarId: "primary",
        timeMin: input.timeMin ?? new Date().toISOString(),
        timeMax: input.timeMax,
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      });

      return response.data.items ?? [];
    }),
});
