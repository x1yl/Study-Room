import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { roomRouter } from "~/server/api/routers/room";
import { calendarRouter } from "~/server/api/routers/calendar";
import { tasksRouter } from "./routers/tasks";
import { userRouter } from "~/server/api/routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  room: roomRouter,
  calendar: calendarRouter,
  tasks: tasksRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
