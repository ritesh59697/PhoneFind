"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken, clearToken } from "@/lib/client/api";
import DeviceMap from "./DeviceMap";

interface LocationPing {
  latitude: number;
  longitude: number;
  batteryPct: number | null;
  capturedAt: string;
}

interface Device {
  id: string;
  deviceModel: string;
  imei: string;
  status: "active" | "lost" | "locked" | "wiped";
  lastSeenAt: string | null;
  lastLocation: LocationPing | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
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

  const loadDevices = useCallback(async () => {
    try {
      const data = await apiFetch("/api/devices");
      setDevices(data.devices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load devices.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    loadDevices();
    const interval = setInterval(loadDevices, 15000);
    return () => clearInterval(interval);
  }, [router, loadDevices]);

  async function issueCommand(deviceId: string, type: string) {
    setPendingCommand(`${deviceId}:${type}`);
    try {
      await apiFetch(`/api/devices/${deviceId}/commands`, {
        method: "POST",
        body: JSON.stringify({ type }),
      });
      await loadDevices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Command failed.");
    } finally {
      setPendingCommand(null);
    }
  }

  function logout() {
    clearToken();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${darkMode ? "bg-neutral-950 text-neutral-300" : "bg-stone-100 text-neutral-900"}`}>
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest font-bold">
          <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>INITIALIZING SECURITY CONSOLE...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors ${darkMode ? "bg-neutral-950 text-neutral-100 selection:bg-emerald-500 selection:text-white" : "bg-stone-100 text-neutral-900 selection:bg-neutral-900 selection:text-white"}`}>
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        {/* Top Header Navigation */}
        <header className={`flex items-center justify-between pb-6 mb-8 border-b-2 ${darkMode ? "border-neutral-800" : "border-neutral-900"}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center p-2 transition-all ${
              darkMode
                ? "bg-neutral-900 border-neutral-700 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]"
                : "bg-white border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            }`}>
              <img src="/favicon.svg" alt="PhoneFind Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-mono font-bold tracking-tight">PhoneFind</h1>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border-2 border-emerald-500 bg-emerald-500/10 text-emerald-500 tracking-wider">
                  NEO-SYSTEM v1.0
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-500">HARDWARE MONITORING & TELEMETRY</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
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

            {/* Logout Button */}
            <button
              onClick={logout}
              className={`inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border-2 transition-all active:translate-x-[2px] active:translate-y-[2px] ${
                darkMode
                  ? "bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.08)]"
                  : "bg-white hover:bg-stone-200 border-neutral-900 text-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">DISCONNECT</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl border-2 border-red-500 bg-red-500/10 text-red-500 font-mono text-xs font-bold flex items-center gap-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {devices.length === 0 && (
          <div className={`p-10 text-center border-2 rounded-xl transition-all ${
            darkMode
              ? "bg-neutral-900 border-neutral-700 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)]"
              : "bg-white border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          }`}>
            <div className="w-12 h-12 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 text-emerald-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider mb-2">NO ACTIVE TARGET DEVICE FOUND</h3>
            <p className="text-xs text-neutral-500 font-mono max-w-md mx-auto leading-relaxed">
              Install the PhoneFind Android security client on your target mobile device and log in with this account.
            </p>
          </div>
        )}

        {/* Neo-Brutalist Target Device Cards */}
        <div className="space-y-6">
          {devices.map((device) => (
            <div key={device.id} className={`border-2 rounded-xl p-5 md:p-6 transition-all ${
              darkMode
                ? "bg-neutral-900 border-neutral-700 shadow-[5px_5px_0px_0px_rgba(255,255,255,0.08)]"
                : "bg-white border-neutral-900 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
            }`}>
              {/* Card Header Section */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] uppercase font-bold tracking-widest text-emerald-500">DEVICE //</span>
                    <h2 className="text-lg font-mono font-bold tracking-tight uppercase">{device.deviceModel}</h2>
                  </div>
                  <p className="text-xs font-mono font-semibold text-neutral-500">IMEI: {device.imei}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg border-2 ${
                    device.status === "lost"
                      ? "bg-red-500/10 text-red-500 border-red-500"
                      : device.status === "locked"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${device.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                  <span>{device.status}</span>
                </span>
              </div>

              {/* Location Map Preview */}
              {device.lastLocation ? (
                <DeviceMap
                  latitude={device.lastLocation.latitude}
                  longitude={device.lastLocation.longitude}
                  capturedAt={device.lastLocation.capturedAt}
                  batteryPct={device.lastLocation.batteryPct}
                  darkMode={darkMode}
                />
              ) : (
                <div className={`my-4 p-4 border-2 rounded-lg text-xs font-mono font-bold text-neutral-400 flex items-center gap-2.5 ${
                  darkMode ? "bg-neutral-950 border-neutral-800" : "bg-stone-100 border-neutral-900"
                }`}>
                  <svg className="w-5 h-5 text-neutral-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>GPS TELEMETRY PENDING. CLICK <strong>LOCATE</strong> TO TRANSMIT PING COMMAND.</span>
                </div>
              )}

              {/* Command Action Buttons Toolbar */}
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t-2 ${darkMode ? "border-neutral-800" : "border-neutral-200"}`}>
                {/* Locate */}
                <button
                  onClick={() => issueCommand(device.id, "locate")}
                  disabled={pendingCommand === `${device.id}:locate`}
                  className={`inline-flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-3 rounded-lg border-2 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 ${
                    darkMode
                      ? "bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.08)]"
                      : "bg-white hover:bg-stone-100 text-neutral-900 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  }`}
                >
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{pendingCommand === `${device.id}:locate` ? "SENDING..." : "LOCATE"}</span>
                </button>

                {/* Sound Alarm */}
                <button
                  onClick={() => issueCommand(device.id, "alarm")}
                  disabled={pendingCommand === `${device.id}:alarm`}
                  className={`inline-flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-3 rounded-lg border-2 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 ${
                    darkMode
                      ? "bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.08)]"
                      : "bg-white hover:bg-stone-100 text-neutral-900 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  }`}
                >
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>{pendingCommand === `${device.id}:alarm` ? "SENDING..." : "ALARM"}</span>
                </button>

                {/* Lock */}
                <button
                  onClick={() => issueCommand(device.id, "lock")}
                  disabled={pendingCommand === `${device.id}:lock`}
                  className={`inline-flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-3 rounded-lg border-2 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 ${
                    darkMode
                      ? "bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.08)]"
                      : "bg-white hover:bg-stone-100 text-neutral-900 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  }`}
                >
                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>{pendingCommand === `${device.id}:lock` ? "SENDING..." : "LOCK"}</span>
                </button>

                {/* Erase Device */}
                <button
                  onClick={() => issueCommand(device.id, "wipe")}
                  disabled={pendingCommand === `${device.id}:wipe`}
                  className="inline-flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-3 rounded-lg border-2 border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-500 shadow-[3px_3px_0px_0px_rgba(239,68,68,0.3)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>{pendingCommand === `${device.id}:wipe` ? "SENDING..." : "ERASE"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
