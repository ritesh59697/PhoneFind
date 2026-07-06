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
    <div className={`mt-4 border-2 rounded-xl overflow-hidden transition-all ${
      darkMode
        ? "border-neutral-700 bg-neutral-900 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)] text-neutral-100"
        : "border-neutral-900 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-neutral-900"
    }`}>
      {/* Interactive Map Preview Frame */}
      <div className={`relative w-full h-60 border-b-2 ${darkMode ? "bg-neutral-950 border-neutral-700" : "bg-stone-100 border-neutral-900"}`}>
        <iframe
          title="Device Location Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={embedUrl}
          className={`w-full h-full filter ${darkMode ? "saturate-[0.85] contrast-[1.1] invert-[0.88] hue-rotate-180" : "saturate-[1]"}`}
        />
      </div>

      {/* Location Metadata Block */}
      <div className="p-4 space-y-3 font-mono">
        <div className="flex items-start justify-between gap-3">
          <div className="w-full">
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                GPS REAL-TIME VECTOR
              </div>
              {batteryPct !== null && (
                <div className={`text-[11px] px-2.5 py-1 rounded-md border-2 font-mono font-bold flex items-center gap-1.5 ${
                  darkMode ? "bg-neutral-950 text-emerald-400 border-neutral-700" : "bg-stone-100 text-emerald-700 border-neutral-900"
                }`}>
                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h11M3 14h11m-8-7h6a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2zm13 4h1a1 1 0 011 1v2a1 1 0 01-1 1h-1v-4z" />
                  </svg>
                  <span>{batteryPct}% BATTERY</span>
                </div>
              )}
            </div>
            {address ? (
              <p className={`text-xs font-semibold leading-relaxed ${darkMode ? "text-neutral-200" : "text-neutral-900"}`}>{address}</p>
            ) : loadingAddress ? (
              <p className="text-xs text-neutral-400 font-mono animate-pulse">Resolving vector address...</p>
            ) : (
              <p className="text-xs font-mono font-bold">
                LAT: {latitude.toFixed(5)} // LNG: {longitude.toFixed(5)}
              </p>
            )}
            <p className="text-[10px] text-neutral-500 mt-1">
              TIMESTAMP: {new Date(capturedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-wrap items-center gap-3 pt-3 border-t-2 ${darkMode ? "border-neutral-800" : "border-neutral-200"}`}>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border-2 border-emerald-500 bg-emerald-600 hover:bg-emerald-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>GOOGLE MAPS</span>
          </a>
          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg border-2 transition-all active:translate-x-[2px] active:translate-y-[2px] ${
              darkMode
                ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border-neutral-600 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]"
                : "bg-stone-100 hover:bg-stone-200 text-neutral-900 border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>APPLE MAPS</span>
          </a>
        </div>
      </div>
    </div>
  );
}
