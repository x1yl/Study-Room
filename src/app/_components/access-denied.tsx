import Link from "next/link";
import { ExclamationTriangleIcon, HomeIcon } from "@heroicons/react/24/outline";

export function AccessDenied({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="shadow-study-xl max-w-2xl rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-slate-900">
            Access Denied
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-slate-600">
            {message}
          </p>
          <Link
            href="/"
            className="bg-primary-600 hover:bg-primary-700 inline-flex transform items-center gap-2 rounded-xl px-8 py-3 font-semibold text-slate-700 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          >
            <HomeIcon className="h-5 w-5" />
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
