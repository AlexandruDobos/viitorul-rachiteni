import React, { useEffect, useState } from "react";
import { api } from "../utils/constants";

const FADE_MS = 700;        // fade pe compact
const INTERVAL_MS = 3500;   // interval carousel compact

const AdsDisplay = ({ position, compactUntil = 1024 }) => {
  const initialCompact =
    typeof window !== "undefined" ? window.innerWidth < compactUntil : true;
  const initialDevice = initialCompact ? "MOBILE" : "LAPTOP";

  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompact, setIsCompact] = useState(initialCompact);
  const [deviceType, setDeviceType] = useState(initialDevice);

  // injectăm keyframes pentru animații
  useEffect(() => {
    const id = "ads-anim-keyframes";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.innerHTML = `
        @media (prefers-reduced-motion: no-preference) {
          @keyframes ads-fade-in {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes ads-kenburns-strong {
            0%   { transform: scale(1) translate(0, 0); }
            50%  { transform: scale(1.08) translate(-1%, -1%); }
            100% { transform: scale(1) translate(0, 0); }
          }
          @keyframes ads-flash {
            0%, 100% { opacity: 1; }
            45% { opacity: 0.5; }
            55% { opacity: 1; }
          }
          @keyframes ads-glow {
            0%, 100% { box-shadow: 0 0 6px rgba(255,255,0,0.4); }
            50% { box-shadow: 0 0 20px rgba(255,255,0,0.9); }
          }
        }`;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const onResize = () => {
      const compact = window.innerWidth < compactUntil;
      setIsCompact(compact);
      setDeviceType(compact ? "MOBILE" : "LAPTOP");
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [compactUntil]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const url = api(`/app/ads?device=${encodeURIComponent(deviceType)}`);
        const res = await fetch(url, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const today = new Date();

        const filtered = (data || [])
          .filter(
            (ad) =>
              ad.position === position &&
              (!ad.startDate || new Date(ad.startDate) <= today) &&
              (!ad.endDate || new Date(ad.endDate) >= today) &&
              (!ad.deviceType || ad.deviceType === deviceType)
          )
          .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

        setAds(filtered);
        setCurrentIndex(0);
      } catch (e) {
        console.error("Eroare la încărcarea reclamelor:", e);
      }
    };
    fetchAds();
  }, [position, deviceType]);

  useEffect(() => {
    ads.forEach((ad) => {
      const img = new Image();
      img.src = ad.imageUrl;
    });
  }, [ads]);

  useEffect(() => {
    if (!isCompact || ads.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((idx) => (idx + 1) % ads.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [isCompact, ads]);

  if (!ads.length) {
    return (
      <div className="text-center text-gray-500 italic text-sm p-2">
        Spațiu publicitar disponibil
      </div>
    );
  }

  // Compact (<1024px): carousel
  if (isCompact) {
    return (
      <div className="relative w-full h-28 sm:h-32 md:h-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {ads.map((ad, i) => {
          const active = i === currentIndex;
          return (
            <a
              key={ad.id}
              href={ad.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`absolute inset-0 isolate transition-opacity duration-700 ease-out ${
                active
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
              title={ad.title || "Sponsor"}
            >
              <div className="absolute inset-0 flex items-center justify-center p-1.5">
                <img
                  src={ad.imageUrl}
                  alt={ad.title || "publicitate"}
                  className="max-h-full max-w-full object-contain"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <span className="absolute z-10 top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-600/90 text-white ring-1 ring-indigo-400/50 shadow-sm">
                SPONSOR
              </span>
            </a>
          );
        })}
      </div>
    );
  }

  // Desktop (≥1024px): listă cu animații puternice
  return (
    <div className="flex flex-col gap-3">
      {ads.map((ad, idx) => (
        <a
          key={ad.id}
          href={ad.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-xl overflow-hidden border border-gray-300 bg-white shadow-md hover:shadow-2xl transition-transform"
          style={{
            animation: `ads-fade-in 300ms ease-out both, ads-glow 2s ease-in-out infinite`,
            animationDelay: `${idx * 100}ms`,
          }}
          title={ad.title || "Sponsor"}
        >
          <div className="relative">
            <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-pink-600/90 text-white ring-1 ring-pink-400/50 shadow-sm animate-pulse">
              AD
            </span>

            <img
              src={ad.imageUrl}
              alt={ad.title || "publicitate"}
              className="w-full h-auto will-change-transform transition-transform duration-700 ease-in-out group-hover:scale-105"
              style={{
                animation: "ads-kenburns-strong 10s ease-in-out infinite, ads-flash 6s linear infinite",
              }}
              loading="lazy"
              decoding="async"
            />

            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-black" />
          </div>
        </a>
      ))}
    </div>
  );
};

export default AdsDisplay;
