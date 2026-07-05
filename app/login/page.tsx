"use client";

import { useState, useEffect } from "react";
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
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("phonefind_theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem("phonefind_theme", nextMode ? "dark" : "light");
  };

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
    <div className={`min-h-screen transition-colors flex items-center justify-center p-6 font-sans ${darkMode ? "bg-neutral-950 text-neutral-100 selection:bg-emerald-500 selection:text-white" : "bg-stone-50 text-stone-900 selection:bg-stone-900 selection:text-white"}`}>
      <div className="w-full max-w-md">
        {/* Top bar with theme toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center p-2 ${darkMode ? "bg-neutral-900 border-neutral-800" : "bg-white border-stone-300 shadow-sm"}`}>
              <img src="/favicon.svg" alt="PhoneFind Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base font-mono font-bold tracking-tight uppercase">PHONEFIND</h1>
              <p className="text-[10px] font-mono text-neutral-500">HARDWARE SECURITY PORTAL</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={`p-2.5 rounded-lg border transition-all ${darkMode ? "bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-amber-400" : "bg-white hover:bg-stone-100 border-stone-300 text-stone-700 shadow-sm"}`}
          >
            {darkMode ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Minimalist Brutalist Form Card */}
        <div className={`border rounded-xl p-6 md:p-8 transition-colors ${darkMode ? "bg-neutral-900/70 border-neutral-800" : "bg-white border-stone-300 shadow-sm"}`}>
          {/* Mode Switcher Tabs */}
          <div className={`grid grid-cols-2 p-1 border rounded-lg mb-6 ${darkMode ? "bg-neutral-950 border-neutral-800" : "bg-stone-100 border-stone-200"}`}>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`text-xs font-mono font-bold uppercase tracking-wider py-2.5 rounded-md transition-all ${
                mode === "login"
                  ? darkMode
                    ? "bg-neutral-800 text-white shadow-sm"
                    : "bg-white text-stone-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-300"
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
              className={`text-xs font-mono font-bold uppercase tracking-wider py-2.5 rounded-md transition-all ${
                mode === "signup"
                  ? darkMode
                    ? "bg-neutral-800 text-white shadow-sm"
                    : "bg-white text-stone-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono flex items-center gap-2.5">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 mb-1.5">EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full border rounded-lg px-3.5 py-2.5 text-xs font-mono focus:outline-none transition-colors ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-emerald-500 placeholder-neutral-600"
                    : "bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-900 placeholder-stone-400"
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 mb-1.5">PASSWORD</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className={`w-full border rounded-lg px-3.5 py-2.5 text-xs font-mono focus:outline-none transition-colors ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-emerald-500 placeholder-neutral-600"
                    : "bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-900 placeholder-stone-400"
                }`}
              />
              {mode === "signup" && (
                <p className="text-[10px] font-mono text-neutral-500 mt-1">MINIMUM 8 CHARACTERS REQUIRED</p>
              )}
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 mb-1.5">BACKUP EMAIL (OPTIONAL)</label>
                <input
                  type="email"
                  placeholder="trusted@domain.com"
                  value={backupContact}
                  onChange={(e) => setBackupContact(e.target.value)}
                  className={`w-full border rounded-lg px-3.5 py-2.5 text-xs font-mono focus:outline-none transition-colors ${
                    darkMode
                      ? "bg-neutral-950 border-neutral-800 text-white focus:border-emerald-500 placeholder-neutral-600"
                      : "bg-stone-50 border-stone-300 text-stone-900 focus:border-stone-900 placeholder-stone-400"
                  }`}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50 active:translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <span>{mode === "login" ? "AUTHENTICATE CONSOLE" : "INITIALIZE SECURITY ACCOUNT"}</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] font-mono text-neutral-500 mt-6 flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>HARDWARE-ENCRYPTED HARDWARE SECURITY</span>
        </p>
      </div>
    </div>
  );
}
