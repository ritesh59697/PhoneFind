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
    <div className={`min-h-screen font-sans transition-colors flex items-center justify-center p-6 ${darkMode ? "bg-neutral-950 text-neutral-100 selection:bg-emerald-500 selection:text-white" : "bg-stone-100 text-neutral-900 selection:bg-neutral-900 selection:text-white"}`}>
      <div className="w-full max-w-md">
        {/* Top Header Console Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center p-2.5 transition-all ${
              darkMode
                ? "bg-neutral-900 border-neutral-700 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]"
                : "bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            }`}>
              <img src="/logo.png" alt="PhoneFind Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-mono font-bold tracking-tight">PhoneFind</h1>
              <p className="text-[11px] font-mono text-neutral-500">HARDWARE SECURITY PORTAL</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={`p-2.5 rounded-lg border-2 font-mono font-bold text-xs transition-all active:translate-x-[1px] active:translate-y-[1px] ${
              darkMode
                ? "bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-amber-400 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.08)]"
                : "bg-white hover:bg-stone-200 border-neutral-900 text-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            {darkMode ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Neo-Brutalist Authentication Card */}
        <div className={`border-2 rounded-xl p-6 md:p-8 transition-all ${
          darkMode
            ? "bg-neutral-900 border-neutral-700 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.08)]"
            : "bg-white border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        }`}>
          {/* Mode Switcher Tabs */}
          <div className={`grid grid-cols-2 p-1 border-2 rounded-lg mb-6 ${darkMode ? "bg-neutral-950 border-neutral-800" : "bg-stone-100 border-neutral-900"}`}>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`text-xs font-mono font-bold uppercase tracking-wider py-2.5 rounded transition-all ${
                mode === "login"
                  ? darkMode
                    ? "bg-neutral-800 text-white border-2 border-neutral-600 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
                    : "bg-white text-neutral-900 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
              className={`text-xs font-mono font-bold uppercase tracking-wider py-2.5 rounded transition-all ${
                mode === "signup"
                  ? darkMode
                    ? "bg-neutral-800 text-white border-2 border-neutral-600 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
                    : "bg-white text-neutral-900 border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-lg border-2 border-red-500 bg-red-500/10 text-red-500 text-xs font-mono font-bold flex items-center gap-2.5">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
                className={`w-full border-2 rounded-lg px-3.5 py-2.5 text-xs font-mono focus:outline-none transition-colors ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-emerald-500 placeholder-neutral-600"
                    : "bg-stone-50 border-neutral-900 text-neutral-900 focus:border-emerald-600 placeholder-neutral-400"
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
                className={`w-full border-2 rounded-lg px-3.5 py-2.5 text-xs font-mono focus:outline-none transition-colors ${
                  darkMode
                    ? "bg-neutral-950 border-neutral-800 text-white focus:border-emerald-500 placeholder-neutral-600"
                    : "bg-stone-50 border-neutral-900 text-neutral-900 focus:border-emerald-600 placeholder-neutral-400"
                }`}
              />
              {mode === "signup" && (
                <p className="text-[10px] font-mono font-bold text-neutral-500 mt-1">MINIMUM 8 CHARACTERS REQUIRED</p>
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
                  className={`w-full border-2 rounded-lg px-3.5 py-2.5 text-xs font-mono focus:outline-none transition-colors ${
                    darkMode
                      ? "bg-neutral-950 border-neutral-800 text-white focus:border-emerald-500 placeholder-neutral-600"
                      : "bg-stone-50 border-neutral-900 text-neutral-900 focus:border-emerald-600 placeholder-neutral-400"
                  }`}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 inline-flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-4 py-3.5 rounded-lg border-2 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 ${
                darkMode
                  ? "bg-white text-black border-white hover:bg-neutral-200 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)]"
                  : "bg-black text-white border-black hover:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <span>{mode === "login" ? "AUTHENTICATE CONSOLE" : "INITIALIZE SECURITY ACCOUNT"}</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] font-mono font-bold text-neutral-500 mt-6 flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>HARDWARE-ENCRYPTED HARDWARE SECURITY</span>
        </p>
      </div>
    </div>
  );
}
