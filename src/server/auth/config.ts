import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider, {
  type DiscordProfile,
} from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
  providers: [
    DiscordProvider({
      profile(profile: DiscordProfile) {
        if (profile.avatar === null) {
          const defaultAvatarNumber =
            profile.discriminator === "0"
              ? Number(BigInt(profile.id) >> BigInt(22)) % 6
              : parseInt(profile.discriminator) % 5;
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
        } else {
          const format = profile.avatar.startsWith("a_") ? "gif" : "png";
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          image: profile.image_url,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "https://www.googleapis.com/auth/calendar.events.readonly https://www.googleapis.com/auth/calendar.calendarlist.readonly https://www.googleapis.com/auth/tasks.readonly openid profile email",
        },
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async redirect({ baseUrl, url }) {
      try {
        // If url is relative, resolve it against baseUrl
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`;
        }

        // If url is absolute and starts with baseUrl, allow it
        if (url.startsWith(baseUrl)) {
          return url;
        }

        // Try to parse as URL to check for returnTo parameter
        const urlObj = new URL(url);
        const returnTo = urlObj.searchParams.get("returnTo");
        if (returnTo?.startsWith(baseUrl)) {
          return returnTo;
        }
      } catch (error) {
        console.warn("Redirect URL parsing error:", error);
      }

      // Default fallback to baseUrl
      return baseUrl;
    },
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }

      try {
        // Check if user exists with this email
        const existingUser = await db.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        if (existingUser) {
          // Check if this provider account already exists
          const existingAccount = await db.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account!.provider,
                providerAccountId: account!.providerAccountId,
              },
            },
          });

          // If no existing account for this provider, link it
          if (!existingAccount) {
            await db.account.create({
              data: {
                userId: existingUser.id,
                type: account!.type,
                provider: account!.provider,
                providerAccountId: account!.providerAccountId,
                access_token: account!.access_token,
                expires_at: account!.expires_at,
                token_type: account!.token_type,
                scope: account!.scope,
                id_token: account!.id_token,
                refresh_token: account!.refresh_token,
              },
            });
          }

          // Update user ID to match existing user
          user.id = existingUser.id;
        }

        // Google-specific token handling
        if (account?.provider === "google" && account.scope) {
          const accountToUpdate = await db.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: account.providerAccountId,
              },
            },
          });

          if (accountToUpdate) {
            await db.account.update({
              where: {
                provider_providerAccountId: {
                  provider: "google",
                  providerAccountId: account.providerAccountId,
                },
              },
              data: {
                scope: account.scope,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                id_token: account.id_token,
                refresh_token: account.refresh_token,
              },
            });
          }
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },
} satisfies NextAuthConfig;
