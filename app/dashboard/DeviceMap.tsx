"use client";

import { useEffect, useState } from "react";

interface DeviceMapProps {
  latitude: number;
  longitude: number;
  capturedAt: string;
  batteryPct: number | null;
  darkMode?: boolean;
}

export default function DeviceMap({ latitude, longitude, capturedAt, batteryPct, darkMode = true }: DeviceMapProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchAddress() {
      setLoadingAddress(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.display_name) {
            setAddress(data.display_name);
          }
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setLoadingAddress(false);
      }
    }

    fetchAddress();
    return () => {
      isMounted = false;
    };
  }, [latitude, longitude]);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${latitude},${longitude}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.004},${latitude - 0.003},${longitude + 0.004},${latitude + 0.003}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className={`mt-4 border ${darkMode ? "border-neutral-800 bg-neutral-900/90 text-neutral-100" : "border-neutral-300 bg-white text-neutral-900"} rounded-xl overflow-hidden shadow-sm transition-colors`}>
      {/* Interactive Map Preview */}
      <div className={`relative w-full h-56 ${darkMode ? "bg-neutral-950" : "bg-neutral-100"}`}>
        <iframe
          title="Device Location Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={embedUrl}
          className={`w-full h-full filter ${darkMode ? "saturate-[0.85] contrast-[1.05] invert-[0.88] hue-rotate-180" : "saturate-[1]"}`}
        />
        {batteryPct !== null && (
          <div className={`absolute top-3 right-3 ${darkMode ? "bg-neutral-900/90 text-white border-neutral-700/80" : "bg-white/90 text-neutral-900 border-neutral-300"} backdrop-blur-md text-xs px-3 py-1.5 rounded-lg border font-mono flex items-center gap-2 shadow-sm`}>
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h11M3 14h11m-8-7h6a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2zm13 4h1a1 1 0 011 1v2a1 1 0 01-1 1h-1v-4z" />
            </svg>
            <span className="font-bold">{batteryPct}%</span>
          </div>
        )}
      </div>

      {/* Location Metadata & Action Controls */}
      <div className="p-4 space-y-3 font-sans">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-widest uppercase text-emerald-500 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              GPS Coordinates Logged
            </div>
            {address ? (
              <p className={`text-xs font-semibold leading-relaxed ${darkMode ? "text-neutral-200" : "text-neutral-800"}`}>{address}</p>
            ) : loadingAddress ? (
              <p className="text-xs text-neutral-400 font-mono animate-pulse">Resolving location vector...</p>
            ) : (
              <p className="text-xs font-mono font-semibold">
                LAT: {latitude.toFixed(5)} // LNG: {longitude.toFixed(5)}
              </p>
            )}
            <p className="text-[11px] font-mono text-neutral-500 mt-1">
              {new Date(capturedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-wrap items-center gap-2 pt-2.5 border-t ${darkMode ? "border-neutral-800" : "border-neutral-200"}`}>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm active:translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Google Maps</span>
          </a>
          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border ${darkMode ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700" : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300"} transition-all active:translate-y-0.5`}
          >
            <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Apple Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
}
