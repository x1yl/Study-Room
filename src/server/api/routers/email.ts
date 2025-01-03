import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailRouter = createTRPCRouter({
  send: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        subject: z.string().min(1),
        message: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await resend.emails.send({
          from: "Study Rooms <onboarding@resend.dev>",
          to: `${process.env.CONTACT_EMAIL}`, 
          replyTo: input.email,
          subject: `Contact Form: ${input.subject}`,
          text: `Name: ${input.name}\nEmail: ${input.email}\nMessage: ${input.message}`,
        });
        return { success: true };
      } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
      }
    }),
});
