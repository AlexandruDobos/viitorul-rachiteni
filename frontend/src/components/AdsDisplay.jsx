import React, { useEffect, useState } from "react";
import { api } from "../utils/constants";

const FADE_MS = 700;
const INTERVAL_MS = 3500;

const AdsDisplay = ({ position, compactUntil = 1024 }) => {
  const initialCompact =
    typeof window !== "undefined" ? window.innerWidth < compactUntil : true;
  const initialDevice = initialCompact ? "MOBILE" : "LAPTOP";

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompact, setIsCompact] = useState(initialCompact);
  const [deviceType, setDeviceType] = useState(initialDevice);

  useEffect(() => {
    const id = "ads-anim-keyframes";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.innerHTML = `
        @media (prefers-reduced-motion: no-preference) {
          @keyframes ads-fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes ads-glowPulse {
            0%, 100% { box-shadow: 0 0 4px rgba(59,130,246,0.4); }
            50% { box-shadow: 0 0 20px rgba(59,130,246,0.9); }
          }
          @keyframes ads-mobile-zoom {
            0% { transform: scale(0.95); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
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
      setLoading(true);
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
        setAds([]);
      } finally {
        setLoading(false);
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

  if (loading) {
    const commonClasses =
      "flex items-center justify-center rounded-xl border border-gray-200 bg-white shadow-md";
    return isCompact ? (
      <div className={`relative w-full min-w-0 h-28 sm:h-32 md:h-36 ${commonClasses}`} role="status" aria-label="Se încarcă reclamele">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    ) : (
      <div className={`w-full min-w-0 ${commonClasses} p-6`} role="status" aria-label="Se încarcă reclamele">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!ads.length) return null;

  if (isCompact) {
    return (
      <div className="relative w-full min-w-0 h-28 sm:h-32 md:h-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md">
        {ads.map((ad, i) => {
          const active = i === currentIndex;
          return (
            <a
              key={ad.id}
              href={ad.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`absolute inset-0 isolate transition-opacity duration-700 ease-out ${
                active ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              title={ad.title || "Sponsor"}
              style={{ animation: active ? "ads-mobile-zoom 0.7s ease-out" : "none" }}
            >
              <div className="absolute inset-0 flex items-center justify-center p-1.5">
                <img
                  src={ad.imageUrl}
                  alt={ad.title || "publicitate"}
                  className="w-full h-full max-w-full max-h-full object-contain"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {ads.map((ad, idx) => (
        <a
          key={ad.id}
          href={ad.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-xl overflow-hidden border bg-white shadow-lg hover:shadow-2xl transition-transform"
          style={{
            animation: `ads-fade-in 400ms ease-out both, ads-glowPulse 3s ease-in-out infinite`,
            animationDelay: `${idx * 100}ms`,
          }}
          title={ad.title || "Sponsor"}
        >
          <div className="relative">
            <img
              src={ad.imageUrl}
              alt={ad.title || "publicitate"}
              className="w-full h-auto will-change-transform transition-transform duration-700 ease-in-out group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-indigo-900" />
          </div>
        </a>
      ))}
    </div>
  );
};

export default AdsDisplay;
