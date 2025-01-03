import { type PropsWithChildren } from "react";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto max-w-7xl">
      {children}
    </div>
  );
}
