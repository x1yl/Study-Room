import { type PropsWithChildren } from "react";

export default async function RoomLayout({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto max-w-7xl">
      {children}
    </div>
  );
}
