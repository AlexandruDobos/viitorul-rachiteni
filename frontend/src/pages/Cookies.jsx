/* eslint-disable no-unused-vars */
// src/pages/Cookies.jsx
import React from "react";
import logo from "../assets/logo.png";

export default function Cookies() {
  const updated = new Date().toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-200">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-6 py-7 text-white">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="ACS Viitorul Răchiteni"
              className="h-12 w-12 rounded-full ring-1 ring-white/30 object-cover"
              onError={(e)=>{e.currentTarget.style.display='none';}}
            />
            <div className="min-w-0">
              <h1 className="truncate text-2xl md:text-3xl font-extrabold tracking-tight">
                Politica de cookie-uri
              </h1>
              <p className="mt-1 text-sm md:text-base text-white/90">
                Ultima actualizare: {updated}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 prose prose-sm max-w-none text-gray-700">
          <p>
            Folosim cookie-uri <strong>strict necesare</strong> pentru
            autentificare și securitate (ex.: sesiune, token anti-fraudă) și
            pentru funcționarea site-ului. Nu folosim cookie-uri de marketing sau
            analytics proprii.
          </p>

          <h2>Cookie-uri esențiale</h2>
          <ul>
            <li>
              <strong>Session/Auth</strong> – păstrează sesiunea utilizatorului
              autentificat; se șterge automat sau la logout.
            </li>
            <li>
              <strong>CSRF/anti-abuz</strong> – protejează formularele și
              procesele critice.
            </li>
          </ul>

          <h2>Terți</h2>
          <ul>
            <li>
              <strong>Stripe</strong> (donații) poate seta cookie-uri pentru
              prevenirea fraudei și finalizarea plăților.
            </li>
            <li>
              <strong>Google</strong> – dacă alegi autentificarea cu Google
              OAuth, Google poate seta cookie-uri legate de procesul de login.
            </li>
          </ul>

          <h2>Gestionare</h2>
          <p>
            Cookie-urile esențiale sunt necesare tehnic și nu pot fi dezactivate
            din aplicație. Poți controla cookie-urile din setările browserului
            tău, însă dezactivarea lor poate afecta funcționarea site-ului.
          </p>

          <h2>Contact</h2>
          <p>
            Întrebări? Scrie-ne la{" "}
            <a className="text-indigo-600 underline" href="mailto:viitorulrachiteni@gmail.com">
              viitorulrachiteni@gmail.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
