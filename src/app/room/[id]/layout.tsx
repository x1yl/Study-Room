import { type PropsWithChildren } from "react";
import { HydrateClient } from "~/trpc/server";
import { Providers } from "~/app/_components/providers";

export default function RoomLayout({ children }: PropsWithChildren) {
  return (
    <Providers>
      <HydrateClient>
        <div className="mx-auto max-w-7xl">{children}</div>
      </HydrateClient>
    </Providers>
  );
}
