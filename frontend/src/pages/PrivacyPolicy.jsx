/* eslint-disable no-unused-vars */
// src/pages/PrivacyPolicy.jsx
import React from "react";
import logo from "../assets/logo.png";

const Section = ({ title, children }) => (
  <section className="space-y-2">
    <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
    <div className="prose prose-sm max-w-none text-gray-700">{children}</div>
  </section>
);

export default function PrivacyPolicy() {
  const updated = new Date().toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-200">
        {/* Header gradient în culorile site-ului */}
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
                Politica de confidențialitate
              </h1>
              <p className="mt-1 text-sm md:text-base text-white/90">
                Ultima actualizare: {updated}
              </p>
            </div>
          </div>
        </div>

        {/* Conținut */}
        <div className="p-6 space-y-6">
          <Section title="Cine suntem">
            <p>
              <strong>ACS Viitorul Răchiteni</strong> (denumit „clubul” sau
              „noi”) administrează acest website pentru informare, contact și
              colectare de donații. Ne poți contacta la{" "}
              <a
                href="mailto:viitorulrachiteni@gmail.com"
                className="text-indigo-600 underline"
              >
                viitorulrachiteni@gmail.com
              </a>{" "}
              – Răchiteni, Iași.
            </p>
          </Section>

          <Section title="Ce date prelucrăm">
            <ul className="list-disc pl-5">
              <li>
                <strong>Cont/autentificare:</strong> nume, email (inclusiv
                autentificare cu Google, dacă o folosești).
              </li>
              <li>
                <strong>Contact:</strong> nume, email, telefon (opțional),
                mesaj.
              </li>
              <li>
                <strong>Donații:</strong> sumă, monedă, stare plată, date
                furnizate către Stripe. <em>Nu stocăm datele cardului.</em>
              </li>
              <li>
                <strong>Jurnale tehnice:</strong> adrese IP/identificatori
                necesari pentru securitate și prevenirea abuzurilor.
              </li>
            </ul>
          </Section>

          <Section title="Temei legal">
            <ul className="list-disc pl-5">
              <li>executarea unui contract / pași la cererea ta (donație, cont);</li>
              <li>consimțământ (ex: opțional, dacă este cazul);</li>
              <li>interes legitim (securitate, prevenirea fraudei, administrare site);</li>
              <li>obligații legale (contabilitate, raportări).</li>
            </ul>
          </Section>

          <Section title="Cât timp păstrăm datele">
            <p>
              Păstrăm datele strict cât este necesar: mesaje de contact – până
              la soluționare + o perioadă rezonabilă; date cont – pe durata
              contului; date donații – conform legislației financiar-contabile.
            </p>
          </Section>

          <Section title="Cui divulgăm date">
            <ul className="list-disc pl-5">
              <li>
                <strong>Stripe</strong> – procesator plăți (checkout/donații).
              </li>
              <li>
                <strong>Google</strong> – dacă te autentifici cu Google OAuth.
              </li>
              <li>Furnizori de hosting/mentenanță, strict necesar.</li>
              <li>Autorități, când legea o cere.</li>
            </ul>
          </Section>

          <Section title="Drepturile tale">
            <p>
              Ai dreptul de acces, rectificare, ștergere, restricționare,
              portabilitate, opoziție și retragere a consimțământului. Ne poți
              scrie la{" "}
              <a
                href="mailto:viitorulrachiteni@gmail.com"
                className="text-indigo-600 underline"
              >
                viitorulrachiteni@gmail.com
              </a>
              .
            </p>
          </Section>

          <Section title="Securitate">
            <p>
              Aplicăm măsuri rezonabile pentru protecție (comunicații HTTPS,
              acces restricționat, logare securizată). Nicio metodă nu este
              100% sigură, dar ne străduim să menținem un nivel înalt.
            </p>
          </Section>

          <Section title="Modificări">
            <p>
              Putem actualiza această politică. Versiunea curentă este afișată
              pe această pagină.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
