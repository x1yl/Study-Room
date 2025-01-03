import { createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "../../src/server/api/routers/user";

export const appRouter = createTRPCRouter({
  // ...existing code...
  user: userRouter,
});

export type AppRouter = typeof appRouter;
