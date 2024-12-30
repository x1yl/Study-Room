import { type PropsWithChildren } from "react";
import { HydrateClient } from "~/trpc/server";
import { Providers } from "~/app/_components/providers";

export default function RoomLayout({ children }: PropsWithChildren) {
  return (
    <Providers>
      <HydrateClient>
        <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </HydrateClient>
    </Providers>
  );
}
