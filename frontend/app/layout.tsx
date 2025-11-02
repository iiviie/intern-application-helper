import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internship Application Generator",
  description: "Generate personalized internship applications with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <Link href="/" className="flex items-center text-gray-900 font-semibold">
                  🚀 InternApp
                </Link>
                <Link href="/profile" className="flex items-center text-gray-600 hover:text-gray-900">
                  Profile
                </Link>
                <Link href="/companies" className="flex items-center text-gray-600 hover:text-gray-900">
                  Companies
                </Link>
                <Link href="/generate" className="flex items-center text-gray-600 hover:text-gray-900">
                  Generate
                </Link>
                <Link href="/examples" className="flex items-center text-gray-600 hover:text-gray-900">
                  Examples
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
