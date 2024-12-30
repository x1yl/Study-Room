import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { google } from "googleapis";
import { TRPCError } from "@trpc/server";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export const calendarRouter = createTRPCRouter({
  getEvents: protectedProcedure
    .input(z.object({ 
      timeMin: z.string().optional(),
      timeMax: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const account = await ctx.db.account.findFirst({
        where: { 
          userId: ctx.session.user.id,
          provider: 'google'
        }
      });

      if (!account?.access_token) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Google account not connected'
        });
      }

      oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token ?? undefined,
      });

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: input.timeMin ?? new Date().toISOString(),
        timeMax: input.timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items ?? [];
    }),
});
