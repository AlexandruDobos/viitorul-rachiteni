/* eslint-disable no-unused-vars */
// src/pages/Terms.jsx
import React from "react";
import logo from "../assets/logo.png";

const H2 = ({ children }) => (
  <h2 className="text-lg md:text-xl font-semibold mt-6 mb-2">{children}</h2>
);

export default function Terms() {
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
                Termeni & Condiții
              </h1>
              <p className="mt-1 text-sm md:text-base text-white/90">
                Ultima actualizare: {updated}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 prose prose-sm max-w-none text-gray-700">
          <p>
            Acești Termeni guvernează folosirea site-ului <strong>ACS Viitorul
            Răchiteni</strong> („site-ul”). Prin accesare, ești de acord cu
            acești Termeni.
          </p>

          <H2>Scopul site-ului</H2>
          <p>
            Site-ul oferă informații despre club, noutăți, posibilitatea de a
            ne contacta și de a susține echipa prin donații procesate în
            siguranță de Stripe.
          </p>

          <H2>Conturi și autentificare</H2>
          <p>
            Poți alege să îți creezi un cont sau să te autentifici cu Google.
            Ești responsabil pentru confidențialitatea acreditărilor și pentru
            activitatea contului tău.
          </p>

          <H2>Donații</H2>
          <ul>
            <li>Donațiile sunt procesate de Stripe; nu stocăm datele cardului.</li>
            <li>
              În general, donațiile sunt considerate contribuții voluntare și
              <em> nu sunt rambursabile</em>.
            </li>
            <li>
              Vei primi confirmarea plății din partea Stripe și/sau a clubului.
            </li>
          </ul>

          <H2>Conduită</H2>
          <p>
            Este interzis: utilizarea abuzivă a site-ului, încercări de
            acces neautorizat, încărcarea de conținut ilegal sau dăunător.
          </p>

          <H2>Drepturi de proprietate intelectuală</H2>
          <p>
            Conținutul site-ului aparține clubului sau partenerilor noștri.
            Folosirea lui în afara scopului informativ necesită acordul nostru.
          </p>

          <H2>Limitarea răspunderii</H2>
          <p>
            Site-ul este oferit „ca atare”. Nu garantăm lipsa erorilor sau
            disponibilitatea neîntreruptă. În limitele legii, nu răspundem
            pentru pierderi indirecte rezultate din utilizarea site-ului.
          </p>

          <H2>Modificări</H2>
          <p>
            Putem actualiza Termenii. Versiunea curentă este publicată aici.
          </p>

          <H2>Contact</H2>
          <p>
            Pentru întrebări:{" "}
            <a className="text-indigo-600 underline" href="mailto:viitorulrachiteni@gmail.com">
              viitorulrachiteni@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
