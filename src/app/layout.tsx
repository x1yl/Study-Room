import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { auth } from "~/server/auth";
import { ProfileMenu } from "./_components/ProfileMenu";
import Footer from "./_components/Footer";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Study Rooms",
  description: "Improve your productivity with study rooms",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Study Room" />
        <meta name="google-site-verification" content="ZdQDWk0xevv3I1HFeo_FpZZlm-M6P0CNr9lzwDXOsc0" />
      </head>
      <body>
        <TRPCReactProvider {...{ headers: headers() }}>
          <div className="min-h-screen bg-linear-to-b from-[#2e026d] to-[#15162c]">
            {session?.user && (
              <div className="fixed top-4 right-4 z-50">
                <ProfileMenu user={session.user} />
              </div>
            )}
            {children}
          </div>
          <Footer />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
