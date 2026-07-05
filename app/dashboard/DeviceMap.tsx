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
        // Fallback gracefully if rate-limited
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
    <div className="mt-4 border border-neutral-800 bg-neutral-900/60 rounded-xl overflow-hidden shadow-sm">
      {/* Interactive Map Preview */}
      <div className="relative w-full h-52 bg-neutral-950">
        <iframe
          title="Device Location Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          src={embedUrl}
          className="w-full h-full filter saturate-[0.85] contrast-[1.05]"
        />
        {batteryPct !== null && (
          <div className="absolute top-3 right-3 bg-neutral-900/90 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full border border-neutral-700/60 flex items-center gap-1.5 shadow-md">
            <span>🔋</span>
            <span className="font-semibold">{batteryPct}%</span>
          </div>
        )}
      </div>

      {/* Location Metadata & Action Controls */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live GPS Location
            </div>
            {address ? (
              <p className="text-sm font-medium text-neutral-200 line-clamp-2">{address}</p>
            ) : loadingAddress ? (
              <p className="text-sm text-neutral-400 animate-pulse">Resolving address...</p>
            ) : (
              <p className="text-sm font-medium text-neutral-200">
                Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
              </p>
            )}
            <p className="text-xs text-neutral-400 mt-1">
              Captured on {new Date(capturedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-800">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
          >
            <span>📍</span>
            <span>Track on Google Maps</span>
          </a>
          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
          >
            <span>🧭</span>
            <span>Apple Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
}
