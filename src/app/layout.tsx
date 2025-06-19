import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { TRPCReactProvider } from "~/trpc/react";
import { auth } from "~/server/auth";
import { ProfileMenu } from "./_components/ProfileMenu";
import Footer from "./_components/Footer";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "StudySync - Focus Together",
  description:
    "Boost your productivity with collaborative study rooms, calendar integration, and focused work sessions",
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
        <meta name="apple-mobile-web-app-title" content="StudySync" />
        <meta
          name="google-site-verification"
          content="ZdQDWk0xevv3I1HFeo_FpZZlm-M6P0CNr9lzwDXOsc0"
        />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <TRPCReactProvider {...{ headers: headers() }}>
          <nav className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-80"
                >
                  <div className="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white">
                    <Image
                      src="/icon.svg"
                      alt="StudySync Logo"
                      className="h-6 w-6"
                      width={24}
                      height={24}
                    />
                  </div>
                  <span className="text-xl font-semibold text-slate-900">
                    StudySync
                  </span>
                </Link>
                {session?.user && <ProfileMenu user={session.user} />}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          <Footer />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
