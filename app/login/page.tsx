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

  const isFormValid = email.trim().length > 0 && password.length >= 8;

  return (
    <div className={`min-h-screen font-sans transition-colors flex items-center justify-center p-6 ${
      darkMode ? "dark bg-[#0B0F17] text-neutral-100 selection:bg-emerald-500 selection:text-white" : "light bg-[#F4F4EE] text-neutral-900 selection:bg-neutral-900 selection:text-white"
    }`}>
      <div className="w-full max-w-md">
        {/* Top Header Console Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Seamless White Logo Badge in both Light & Dark Mode */}
            <div className="relative">
              <div className={`absolute inset-0 translate-x-[4px] translate-y-[4px] rounded-2xl ${
                darkMode ? "bg-neutral-800" : "bg-black"
              }`} />
              <div className="relative w-16 h-16 rounded-2xl border-[2.5px] border-black bg-white flex items-center justify-center p-2.5 transition-all overflow-hidden">
                <img src="/logo.png" alt="PhoneFind Official Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-mono font-black tracking-tight">PhoneFind</h1>
              <p className="text-[11px] font-mono font-bold text-neutral-400 tracking-wider">HARDWARE SECURITY PORTAL</p>
            </div>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={`p-3 rounded-xl border-[2.5px] font-mono font-bold text-xs transition-all active:translate-x-[1px] active:translate-y-[1px] ${
              darkMode
                ? "bg-[#111622] hover:bg-[#1A2130] border-neutral-600 text-amber-400 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]"
                : "bg-white hover:bg-stone-200 border-black text-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Neo-Brutalist Authentication Card with 6px Hard Shadow */}
        <div className="relative">
          {/* Shadow Box */}
          <div className={`absolute inset-0 translate-x-[6px] translate-y-[6px] rounded-2xl ${
            darkMode ? "bg-neutral-800" : "bg-black"
          }`} />

          {/* Main Card */}
          <div className={`relative border-[2.5px] rounded-2xl p-6 md:p-8 transition-all ${
            darkMode ? "bg-[#111622] border-neutral-600 text-white" : "bg-white border-black text-neutral-900"
          }`}>
            {/* Mode Switcher Tabs */}
            <div className={`grid grid-cols-2 p-1.5 border-[2px] rounded-xl mb-6 ${
              darkMode ? "bg-[#0B0F17] border-neutral-700" : "bg-[#E5E5E0] border-black"
            }`}>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`text-xs font-mono font-black uppercase tracking-wider py-2.5 rounded-lg transition-all ${
                  mode === "login"
                    ? darkMode
                      ? "bg-white text-black border-[2px] border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
                      : "bg-black text-white border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
                className={`text-xs font-mono font-black uppercase tracking-wider py-2.5 rounded-lg transition-all ${
                  mode === "signup"
                    ? darkMode
                      ? "bg-white text-black border-[2px] border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]"
                      : "bg-black text-white border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl border-[2px] border-red-500 bg-red-500/10 text-red-500 text-xs font-mono font-bold flex items-center gap-2.5">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-black uppercase tracking-wider text-neutral-400 mb-1.5">EMAIL ADDRESS</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full border-[2px] rounded-xl px-4 py-3 text-xs font-mono focus:outline-none transition-colors ${
                    darkMode
                      ? "bg-[#090D12] border-neutral-700 text-white focus:border-emerald-500 placeholder:text-neutral-600/70"
                      : "bg-[#F9F9F7] border-black text-neutral-900 focus:border-emerald-600 placeholder:text-neutral-400/60"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-black uppercase tracking-wider text-neutral-400 mb-1.5">PASSWORD</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className={`w-full border-[2px] rounded-xl px-4 py-3 text-xs font-mono focus:outline-none transition-colors ${
                    darkMode
                      ? "bg-[#090D12] border-neutral-700 text-white focus:border-emerald-500 placeholder:text-neutral-600/70"
                      : "bg-[#F9F9F7] border-black text-neutral-900 focus:border-emerald-600 placeholder:text-neutral-400/60"
                  }`}
                />
                {mode === "signup" && (
                  <p className="text-[10px] font-mono font-bold text-neutral-500 mt-1">MINIMUM 8 CHARACTERS REQUIRED</p>
                )}
              </div>

              {mode === "signup" && (
                <div>
                  <label className="block text-[11px] font-mono font-black uppercase tracking-wider text-neutral-400 mb-1.5">BACKUP EMAIL (OPTIONAL)</label>
                  <input
                    type="email"
                    placeholder="trusted@domain.com"
                    value={backupContact}
                    onChange={(e) => setBackupContact(e.target.value)}
                    className={`w-full border-[2px] rounded-xl px-4 py-3 text-xs font-mono focus:outline-none transition-colors ${
                      darkMode
                        ? "bg-[#090D12] border-neutral-700 text-white focus:border-emerald-500 placeholder:text-neutral-600/70"
                        : "bg-[#F9F9F7] border-black text-neutral-900 focus:border-emerald-600 placeholder:text-neutral-400/60"
                    }`}
                  />
                </div>
              )}

              {/* Action Button */}
              <div className="relative mt-2">
                {isFormValid && (
                  <div className={`absolute inset-0 translate-x-[4px] translate-y-[4px] rounded-xl ${
                    darkMode ? "bg-white" : "bg-black"
                  }`} />
                )}
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className={`relative w-full inline-flex items-center justify-center gap-2 text-xs font-mono font-black uppercase tracking-wider px-4 py-3.5 rounded-xl border-[2.5px] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 ${
                    isFormValid
                      ? darkMode
                        ? "bg-white text-black border-white hover:bg-neutral-200"
                        : "bg-black text-white border-black hover:bg-neutral-800"
                      : darkMode
                      ? "bg-[#1A2130] text-neutral-500 border-neutral-700"
                      : "bg-[#E5E5E0] text-neutral-500 border-neutral-400"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>PROCESSING...</span>
                    </>
                  ) : (
                    <span>{mode === "login" ? "AUTHENTICATE CONSOLE" : "INITIALIZE SECURITY ACCOUNT"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
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
