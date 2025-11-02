import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Internship Application Generator
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Create personalized cold emails, DMs, and applications with AI
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12">
        <Link href="/profile" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <div className="text-3xl mb-3">👤</div>
          <h3 className="text-lg font-semibold mb-2">Step 1: Profile</h3>
          <p className="text-gray-600">Set up your personal information, skills, and experience</p>
        </Link>

        <Link href="/companies" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <div className="text-3xl mb-3">🏢</div>
          <h3 className="text-lg font-semibold mb-2">Step 2: Companies</h3>
          <p className="text-gray-600">Add companies you want to apply to</p>
        </Link>

        <Link href="/examples" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition border-2 border-blue-200">
          <div className="text-3xl mb-3">📚</div>
          <h3 className="text-lg font-semibold mb-2">Optional: Examples</h3>
          <p className="text-gray-600">Add sample emails to improve AI quality</p>
        </Link>

        <Link href="/generate" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition md:col-span-3 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="text-3xl mb-3">✨</div>
          <h3 className="text-lg font-semibold mb-2">Step 3: Generate</h3>
          <p className="text-gray-600">Create personalized application content with AI</p>
        </Link>
      </div>
    </div>
  );
}
