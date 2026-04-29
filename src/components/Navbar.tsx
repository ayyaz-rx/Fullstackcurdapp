import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-gray-200 transition-colors">
          CURD APP
        </Link>
        <div className="flex gap-6">
          <Link href="/register" className="hover:text-gray-200 transition-colors">
            Register
          </Link>
          <Link href="/login" className="hover:text-gray-200 transition-colors">
            Login
          </Link>
          <Link href="/posts" className="hover:text-gray-200 transition-colors">
            Posts
          </Link>
        </div>
      </div>
    </nav>
  );
}