import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const roomRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.room.create({
        data: {
          name: input.name,
          createdBy: {
            connect: { id: ctx.session.user.id },
          },
          members: {
            connect: { id: ctx.session.user.id },
          },
        },
        include: {
          members: true,
          createdBy: true,
        },
      });
    }),

  join: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
      });

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }

      return ctx.db.room.update({
        where: { id: input.roomId },
        data: {
          members: {
            connect: { id: ctx.session.user.id },
          },
        },
        include: {
          members: true,
          createdBy: true,
        },
      });
    }),

  getRoom: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: {
          createdBy: true,
          members: true,
        },
      });

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }

      const isMember = room.members.some(
        (member) => member.id === ctx.session.user.id,
      );

      if (!isMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this room",
        });
      }

      return room;
    }),

  getUserRooms: protectedProcedure.query(({ ctx }) => {
    return ctx.db.room.findMany({
      where: {
        OR: [
          { createdById: ctx.session.user.id },
          { members: { some: { id: ctx.session.user.id } } },
        ],
      },
      include: {
        createdBy: true,
        members: true,
      },
    });
  }),

  autoJoin: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: {
          members: true,
        },
      });

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }

      const isAlreadyMember = room.members.some(
        (member) => member.id === ctx.session.user.id,
      );

      if (isAlreadyMember) {
        return room;
      }

      return ctx.db.room.update({
        where: { id: input.roomId },
        data: {
          members: {
            connect: { id: ctx.session.user.id },
          },
        },
        include: {
          members: true,
          createdBy: true,
        },
      });
    }),

  addMember: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        username: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: { createdBy: true },
      });

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }

      if (room.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only room owner can add members",
        });
      }

      const userToAdd = await ctx.db.user.findFirst({
        where: { name: input.username },
      });

      if (!userToAdd) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return ctx.db.room.update({
        where: { id: input.roomId },
        data: {
          members: {
            connect: { id: userToAdd.id },
          },
        },
        include: {
          members: true,
          createdBy: true,
        },
      });
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: { createdBy: true },
      });

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }

      const userId =
        input.userId === "self" ? ctx.session.user.id : input.userId;

      // Allow self-removal or owner removal
      if (
        userId !== ctx.session.user.id &&
        room.createdById !== ctx.session.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only room owner can remove other members",
        });
      }

      if (userId === room.createdById) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove room owner",
        });
      }

      return ctx.db.room.update({
        where: { id: input.roomId },
        data: {
          members: {
            disconnect: { id: userId },
          },
        },
        include: {
          members: true,
          createdBy: true,
        },
      });
    }),

  deleteRoom: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
        include: { createdBy: true },
      });

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Room not found",
        });
      }

      if (room.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only room owner can delete the room",
        });
      }

      return ctx.db.room.delete({
        where: { id: input.roomId },
      });
    }),

  sendMessage: protectedProcedure
    .input(z.object({ roomId: z.string(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is member of room
      const room = await ctx.db.room.findFirst({
        where: {
          id: input.roomId,
          OR: [
            { createdById: ctx.session.user.id },
            { members: { some: { id: ctx.session.user.id } } },
          ],
        },
      });

      if (!room) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be a member of this room to send messages",
        });
      }

      return ctx.db.message.create({
        data: {
          content: input.content,
          room: { connect: { id: input.roomId } },
          user: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getMessages: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.message.findMany({
        where: { roomId: input.roomId },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    }),
});
