export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">Welcome to CURD App</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          Create, Read, Update, and Delete your posts with ease
        </p>
        <div className="flex gap-4">
          <a
            href="/register"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Register
          </a>
          <a
            href="/login"
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
