import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-6">
          <Link 
            href="/privacy"
            className="text-gray-600 hover:text-gray-900"
          >
            Privacy Policy
          </Link>
          <Link 
            href="/contact"
            className="text-gray-600 hover:text-gray-900"
          >
            Contact
          </Link>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Study Rooms. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
