import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { google } from "googleapis";

const tasks = google.tasks("v1");

export const tasksRouter = createTRPCRouter({
  getTasks: protectedProcedure
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
          message: "Google Tasks not connected",
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

      // Get all task lists
      const taskLists = await tasks.tasklists.list({ auth });
      const lists = taskLists.data.items ?? [];

      // Fetch tasks from all lists in parallel
      const allTasksPromises = lists.map((list) =>
        tasks.tasks.list({
          auth,
          tasklist: list.id!,
          showCompleted: false,
          // Google Tasks API uses different date format
          dueMin: input.timeMin ? new Date().toISOString() : undefined,
          dueMax: input.timeMax ? new Date(input.timeMax).toISOString() : undefined,
          maxResults: 100,  // Add a limit to ensure we get results
        }),
      );

      const allTasksResponses = await Promise.all(allTasksPromises);

      // Combine all tasks and add list info
      const allTasks = allTasksResponses.flatMap((response, index) => {
        const listInfo = lists[index];
        return (response.data.items ?? []).map((task) => ({
          ...task,
          listId: listInfo!.id,
          listTitle: listInfo!.title,
          type: "task" as const,
        }));
      });

      return allTasks;
    }),
});
