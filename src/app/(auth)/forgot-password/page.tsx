"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setToken("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create reset token");
        return;
      }

      setMessage(data.message || "Reset token created");
      setToken(data.token || "");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-center">Forgot Password</h1>

        <p className="text-gray-500 text-center mt-2">
          Enter your email to reset password
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 space-y-3 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
            <p>{message}</p>
            {token && (
              <div className="break-all rounded-md bg-white px-3 py-2 text-gray-900 border border-green-200">
                {token}
              </div>
            )}
            <Link href="/reset-password" className="inline-block font-semibold text-blue-700 hover:text-blue-800">
              Go to reset password
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded"
          />

          <button className="w-full bg-black text-white p-3 rounded disabled:opacity-60" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
