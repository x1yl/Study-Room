import Link from "next/link";

export function AccessDenied({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-4xl font-bold text-red-400">Access Denied</h1>
        <p className="text-xl">{message}</p>
        <Link
          href="/"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}
