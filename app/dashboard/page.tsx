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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 text-neutral-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading security dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-emerald-500 selection:text-white">
      <div className="max-w-3xl mx-auto p-6 md:p-10">
        {/* Header Bar */}
        <header className="flex items-center justify-between pb-8 mb-8 border-b border-neutral-800">
          <div className="flex items-center gap-3.5">
            <img src="/logo.png" alt="PhoneFind Logo" className="w-10 h-10 rounded-xl shadow-md" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">PhoneFind</h1>
              <p className="text-xs text-neutral-400">Device Security & Tracking Portal</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all"
          >
            <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log out</span>
          </button>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {devices.length === 0 && (
          <div className="p-8 text-center bg-neutral-900/50 border border-neutral-800 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No Devices Registered</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Install the PhoneFind app on your Android phone and log in with this account to pair your device.
            </p>
          </div>
        )}

        {/* Devices List */}
        <div className="space-y-6">
          {devices.map((device) => (
            <div key={device.id} className="bg-neutral-900/60 border border-neutral-800/90 rounded-2xl p-5 md:p-6 backdrop-blur-sm shadow-xl">
              {/* Card Top Details */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <h2 className="text-base font-bold text-white">{device.deviceModel}</h2>
                  </div>
                  <p className="text-xs font-mono text-neutral-400">IMEI: {device.imei}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                    device.status === "lost"
                      ? "bg-red-950/80 text-red-300 border-red-800/60"
                      : device.status === "locked"
                      ? "bg-amber-950/80 text-amber-300 border-amber-800/60"
                      : "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${device.status === "active" ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className="capitalize">{device.status}</span>
                </span>
              </div>

              {/* Map Preview */}
              {device.lastLocation ? (
                <DeviceMap
                  latitude={device.lastLocation.latitude}
                  longitude={device.lastLocation.longitude}
                  capturedAt={device.lastLocation.capturedAt}
                  batteryPct={device.lastLocation.batteryPct}
                />
              ) : (
                <div className="my-4 p-4 bg-neutral-950/60 border border-neutral-800/80 rounded-xl text-xs text-neutral-400 flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-neutral-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>No location reported yet. Click <strong>Locate</strong> below to ping device GPS position.</span>
                </div>
              )}

              {/* Action Commands Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-neutral-800/80">
                {/* Locate */}
                <button
                  onClick={() => issueCommand(device.id, "locate")}
                  disabled={pendingCommand === `${device.id}:locate`}
                  className="inline-flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 text-white transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{pendingCommand === `${device.id}:locate` ? "Sending..." : "Locate"}</span>
                </button>

                {/* Alarm */}
                <button
                  onClick={() => issueCommand(device.id, "alarm")}
                  disabled={pendingCommand === `${device.id}:alarm`}
                  className="inline-flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 text-white transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>{pendingCommand === `${device.id}:alarm` ? "Sending..." : "Sound Alarm"}</span>
                </button>

                {/* Lock */}
                <button
                  onClick={() => issueCommand(device.id, "lock")}
                  disabled={pendingCommand === `${device.id}:lock`}
                  className="inline-flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 text-white transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>{pendingCommand === `${device.id}:lock` ? "Sending..." : "Lock"}</span>
                </button>

                {/* Wipe */}
                <button
                  onClick={() => issueCommand(device.id, "wipe")}
                  disabled={pendingCommand === `${device.id}:wipe`}
                  className="inline-flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-200 transition-all disabled:opacity-50 active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>{pendingCommand === `${device.id}:wipe` ? "Sending..." : "Erase Device"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
