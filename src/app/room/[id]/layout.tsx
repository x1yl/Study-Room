import { type PropsWithChildren } from "react";
import { SessionProvider } from "next-auth/react";

export default function RoomLayout({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="mx-auto max-w-7xl">{children}</div>
      </div>
    </SessionProvider>
  );
}
