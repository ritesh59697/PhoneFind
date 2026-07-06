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
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

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

  // Google Maps Native Embed URL (Find My Device style)
  // t=m for Roadmap, t=k for Satellite, t=h for Hybrid Satellite + Roads
  const embedMapType = mapType === "satellite" ? "h" : "m";
  const googleEmbedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&t=${embedMapType}&z=16&output=embed`;

  return (
    <div className={`mt-4 border-[2.5px] rounded-2xl overflow-hidden transition-all ${
      darkMode
        ? "border-neutral-700 bg-[#111622] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.08)] text-neutral-100"
        : "border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-neutral-900"
    }`}>
      {/* Interactive Google Maps Frame (Find My Device Style) */}
      <div className="relative w-full h-72 border-b-[2.5px] border-black bg-stone-100">
        <iframe
          title="Google Find My Device Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={googleEmbedUrl}
          className={`w-full h-full filter ${darkMode ? "contrast-[1.05] brightness-[0.95]" : "contrast-[1]"}`}
        />

        {/* Map Type Mode Switcher (Google Roadmap vs Google Satellite) */}
        <div className="absolute top-3 right-3 z-10 flex items-center p-1 rounded-xl border-[2px] border-black bg-white/95 backdrop-blur shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-mono text-xs">
          <button
            onClick={() => setMapType("roadmap")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all ${
              mapType === "roadmap"
                ? "bg-black text-white"
                : "text-neutral-700 hover:text-black"
            }`}
          >
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>MAP</span>
          </button>
          <button
            onClick={() => setMapType("satellite")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all ${
              mapType === "satellite"
                ? "bg-black text-white"
                : "text-neutral-700 hover:text-black"
            }`}
          >
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V7a2 2 0 00-2-2h-1a2 2 0 01-2-2v-.935M16 20a9 9 0 10-8-16 9 9 0 008 16z" />
            </svg>
            <span>SATELLITE</span>
          </button>
        </div>
      </div>

      {/* Location Metadata Block */}
      <div className="p-4 space-y-3 font-mono">
        <div className="flex items-start justify-between gap-3">
          <div className="w-full">
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-2 text-[11px] font-black tracking-widest uppercase text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                GPS REAL-TIME VECTOR
              </div>
              {batteryPct !== null && (
                <div className={`text-[11px] px-2.5 py-1 rounded-lg border-[2px] font-mono font-bold flex items-center gap-1.5 ${
                  darkMode ? "bg-[#090D12] text-emerald-400 border-neutral-700" : "bg-[#F9F9F7] text-emerald-700 border-black"
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

        {/* Action External Navigation Buttons */}
        <div className={`flex flex-wrap items-center gap-3 pt-3 border-t-2 ${darkMode ? "border-neutral-800" : "border-neutral-200"}`}>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 text-xs font-mono font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border-[2.5px] border-emerald-500 bg-emerald-600 hover:bg-emerald-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
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
            className={`inline-flex items-center justify-center gap-2 text-xs font-mono font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border-[2.5px] transition-all active:translate-x-[2px] active:translate-y-[2px] ${
              darkMode
                ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border-neutral-600 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.08)]"
                : "bg-white hover:bg-stone-200 text-neutral-900 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
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
