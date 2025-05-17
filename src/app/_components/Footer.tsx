import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-6">
          <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
            Privacy Policy
          </Link>
          <Link href="/tos" className="text-gray-600 hover:text-gray-900">
            Terms of Service
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900">
            Contact
          </Link>
          <a className="text-gray-600 hover:text-gray-900" href="https://www.flaticon.com/free-icons/studying" title="studying icons">Studying icons created by Freepik - Flaticon</a>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Study Rooms. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
