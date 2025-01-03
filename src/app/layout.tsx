import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import Footer from "~/app/_components/Footer";
import { auth } from "~/server/auth";
import { ProfileMenu } from "./_components/ProfileMenu";

export const metadata: Metadata = {
  title: "Study Rooms",
  description: "Improve your productivity with study rooms",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Study Room" />
      </head>
      <body>
        {session?.user && (
          <div className="fixed right-4 top-4 z-50">
            <ProfileMenu user={session.user} />
          </div>
        )}
        {children}
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Footer />
      </body>
    </html>
  );
}
