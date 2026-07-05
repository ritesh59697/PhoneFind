"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, getToken, clearToken } from "@/lib/client/api";

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

const COMMAND_LABELS: Record<string, string> = {
  lock: "Lock",
  locate: "Locate",
  alarm: "Sound alarm",
  wipe: "Erase device",
};

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
    // Poll every 15s so command status ("Locked ✓") updates without a manual refresh.
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
    return <div className="p-6 text-sm text-neutral-500">Loading your devices...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="PhoneFind Logo" className="w-8 h-8 rounded-md" />
          <h1 className="text-xl font-semibold">Your devices</h1>
        </div>
        <button onClick={logout} className="text-sm text-neutral-500 underline">
          Log out
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {devices.length === 0 && (
        <p className="text-sm text-neutral-500">
          No devices registered yet. Install the app on your phone and log in with this
          same account to register it.
        </p>
      )}

      <div className="space-y-4">
        {devices.map((device) => (
          <div key={device.id} className="border border-neutral-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium">{device.deviceModel}</p>
                <p className="text-xs text-neutral-500">IMEI: {device.imei}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  device.status === "lost"
                    ? "bg-red-100 text-red-800"
                    : device.status === "locked"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {device.status}
              </span>
            </div>

            {device.lastLocation ? (
              <p className="text-sm text-neutral-600 mb-3">
                Last seen at {device.lastLocation.latitude.toFixed(5)},{" "}
                {device.lastLocation.longitude.toFixed(5)} on{" "}
                {new Date(device.lastLocation.capturedAt).toLocaleString()}
                {device.lastLocation.batteryPct !== null &&
                  ` — battery ${device.lastLocation.batteryPct}%`}
              </p>
            ) : (
              <p className="text-sm text-neutral-400 mb-3">No location reported yet.</p>
            )}

            <div className="flex gap-2 flex-wrap">
              {Object.entries(COMMAND_LABELS).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => issueCommand(device.id, type)}
                  disabled={pendingCommand === `${device.id}:${type}`}
                  className={`text-sm px-3 py-1.5 rounded-md border disabled:opacity-50 ${
                    type === "wipe"
                      ? "border-red-300 text-red-700"
                      : "border-neutral-300 text-neutral-700"
                  }`}
                >
                  {pendingCommand === `${device.id}:${type}` ? "Sending..." : label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
