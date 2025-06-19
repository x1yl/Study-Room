import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="group inline-block">
              <div className="mb-4 flex items-center gap-3 transition-opacity duration-200 group-hover:opacity-80">
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
              </div>
            </Link>
            <p className="max-w-md text-slate-600">
              Boost your productivity with collaborative study rooms, calendar
              integration, and focused work sessions designed for students.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Legal</h3>
            <div className="space-y-3">
              <Link
                href="/privacy"
                className="hover:text-primary-600 block text-sm text-slate-600 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/tos"
                className="hover:text-primary-600 block text-sm text-slate-600 transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="hover:text-primary-600 block text-sm text-slate-600 transition-colors duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Credits */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Credits
            </h3>
            <a
              href="https://www.flaticon.com/free-icons/studying"
              title="studying icons"
              className="hover:text-primary-600 block text-sm text-slate-600 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              Icons by Freepik - Flaticon
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} StudySync. All rights reserved.
            </p>
            <p className="mt-4 text-sm text-slate-500 sm:mt-0">
              Made with ❤️ for students everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
