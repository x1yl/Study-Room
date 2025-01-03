import { type PropsWithChildren } from "react";
import { HydrateClient } from "~/trpc/server";
import { Providers } from "~/app/_components/providers";
import Footer from "~/app/_components/Footer";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <HydrateClient>
            <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
              <div className="mx-auto max-w-7xl">{children}</div>
            </div>
          </HydrateClient>
        </Providers>
        <Footer />
      </body>
    </html>
  );
}
