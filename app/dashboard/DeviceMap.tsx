"use client";

import { useEffect, useState } from "react";

interface DeviceMapProps {
  latitude: number;
  longitude: number;
  capturedAt: string;
  batteryPct: number | null;
}

export default function DeviceMap({ latitude, longitude, capturedAt, batteryPct }: DeviceMapProps) {
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
        // Fallback gracefully
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
    <div className="mt-4 border border-neutral-800 bg-neutral-900/80 rounded-2xl overflow-hidden shadow-lg backdrop-blur-md">
      {/* Interactive Map Preview */}
      <div className="relative w-full h-56 bg-neutral-950">
        <iframe
          title="Device Location Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={embedUrl}
          className="w-full h-full filter saturate-[0.9] contrast-[1.05]"
        />
        {batteryPct !== null && (
          <div className="absolute top-3 right-3 bg-neutral-900/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-neutral-700/60 flex items-center gap-2 shadow-lg">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h11M3 14h11m-8-7h6a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2zm13 4h1a1 1 0 011 1v2a1 1 0 01-1 1h-1v-4z" />
            </svg>
            <span className="font-semibold">{batteryPct}%</span>
          </div>
        )}
      </div>

      {/* Location Metadata & Action Controls */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live GPS Location
            </div>
            {address ? (
              <p className="text-sm font-medium text-neutral-100 leading-snug line-clamp-2">{address}</p>
            ) : loadingAddress ? (
              <p className="text-sm text-neutral-400 animate-pulse">Resolving location address...</p>
            ) : (
              <p className="text-sm font-medium text-neutral-200">
                Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
              </p>
            )}
            <p className="text-xs text-neutral-400 mt-1.5">
              Captured on {new Date(capturedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-neutral-800">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Track on Google Maps</span>
          </a>
          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-xs font-medium px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-all active:scale-[0.98]"
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
