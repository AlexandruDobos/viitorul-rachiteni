/* eslint-disable no-unused-vars */
// src/components/CookieBanner.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cookieConsent");
    // arătăm bannerul doar dacă nu am informat deja
    if (!stored) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookieConsent", "ack");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] md:left-auto md:right-6 md:w-[520px]">
      <div className="rounded-2xl border border-indigo-200/70 bg-white/95 shadow-xl backdrop-blur-md p-4">
        <p className="text-sm text-gray-800">
          Folosim <strong>doar cookie-uri esențiale</strong> pentru
          autentificare și securitate. Află mai multe în{" "}
          <Link to="/cookie-uri" className="text-indigo-700 underline">
            Politica de cookie-uri
          </Link>{" "}
          și{" "}
          <Link to="/confidentialitate" className="text-indigo-700 underline">
            Politica de confidențialitate
          </Link>
          .
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={accept}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-white text-sm hover:bg-indigo-700 transition"
          >
            Am înțeles
          </button>
          <Link
            to="/cookie-uri"
            className="text-sm px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            Detalii
          </Link>
        </div>
      </div>
    </div>
  );
}
