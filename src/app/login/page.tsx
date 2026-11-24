
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 px-4 py-10">
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">

        <section className="flex flex-col justify-between bg-gradient-to-br from-blue-700 to-indigo-950 p-8 text-white md:p-12">
          <div>
            <div className="mb-12 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl">
              🎓
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">
              Welcome Back
            </p>

            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              Smart Institute
              <span className="block text-blue-200">Management</span>
              System
            </h1>

            <p className="mt-6 max-w-sm text-sm leading-7 text-blue-100">
              Manage students, teachers, courses, attendance and fees
              efficiently through one simple platform.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">✓</span>
              <span className="text-sm text-blue-100">Centralized Institute Management</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">✓</span>
              <span className="text-sm text-blue-100">Secure Admin Authentication</span>
            </div>
          </div>

          <p className="mt-12 text-xs text-blue-200">
            © 2026 Smart Institute Management System
          </p>
        </section>

        <section className="flex items-center justify-center bg-white p-7 md:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <span className="text-sm font-semibold text-blue-600">
                ADMIN PORTAL
              </span>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                Sign In
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-14 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-slate-500 hover:text-blue-600"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In to Dashboard →"}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span>🔒</span>
              Secure Admin Access
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
