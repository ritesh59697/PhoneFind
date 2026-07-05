"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setToken } from "@/lib/client/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [backupContact, setBackupContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(
          mode === "signup" ? { email, password, backupContact } : { email, password }
        ),
      });
      setToken(data.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 antialiased selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl mb-4 p-2.5">
            <img src="/logo.png" alt="PhoneFind Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">PhoneFind</h1>
          <p className="text-xs text-neutral-400">
            {mode === "login" ? "Log in to access your anti-theft security portal" : "Create your PhoneFind security account"}
          </p>
        </div>

        {/* Auth Container Card */}
        <div className="bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-neutral-950 border border-neutral-800/80 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`text-xs font-semibold py-2.5 rounded-lg transition-all ${
                mode === "login"
                  ? "bg-neutral-800 text-white shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`text-xs font-semibold py-2.5 rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-neutral-800 text-white shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-center gap-2.5">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
              />
              {mode === "signup" && (
                <p className="text-[11px] text-neutral-500 mt-1">Must be at least 8 characters</p>
              )}
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">Backup Contact Email (Optional)</label>
                <input
                  type="email"
                  placeholder="trusted-friend@example.com"
                  value={backupContact}
                  onChange={(e) => setBackupContact(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50 active:scale-[0.99] shadow-lg shadow-emerald-950/40"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{mode === "login" ? "Sign In to Dashboard" : "Create Account"}</span>
              )}
            </button>
          </form>
        </div>

        {/* Security Footer Note */}
        <p className="text-center text-xs text-neutral-500 mt-6 flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>End-to-End Encrypted Device Connection</span>
        </p>
      </div>
    </div>
  );
}
