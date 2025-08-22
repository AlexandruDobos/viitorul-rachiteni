// src/pages/Donations.jsx (sau components/Donations.jsx)
import React, { useMemo, useState } from 'react';
import logo from '../assets/logo.png'; // <- logo-ul tău

const REVOLUT_USERNAME = import.meta.env.VITE_REVOLUT_USERNAME || 'NUMELE_TAU';

// Link simplu către Revolut.me
function buildRevolutLink(username) {
  return `https://revolut.me/${username}`;
}

// Generator imagine QR din URL (serviciu public)
function qrSrcFor(url, size = 240) {
  const encoded = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
}

export default function Donations() {
  const paymentUrl = useMemo(() => buildRevolutLink(REVOLUT_USERNAME), []);
  const qrImage = useMemo(() => qrSrcFor(paymentUrl, 240), [paymentUrl]);

  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback simplu
      // eslint-disable-next-line no-alert
      prompt('Copiază manual linkul:', paymentUrl);
    }
  };

  const notConfigured = REVOLUT_USERNAME === 'NUMELE_TAU';

  return (
    <div className="px-4">
      <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl bg-white shadow ring-1 ring-gray-200">
        {/* Header cu gradient */}
        <div className="bg-gradient-to-r from-emerald-600 to-black px-6 py-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Donează pentru echipă</h1>
          <p className="text-white/80 text-sm mt-1">
            Mulțumim pentru susținere! Scanează codul QR sau apasă butonul pentru a deschide pagina de plată.
          </p>
        </div>

        {/* Avertisment dacă username-ul nu e setat în .env */}
        {notConfigured && (
          <div className="px-6 pt-4">
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
              Nu ai setat <code>VITE_REVOLUT_USERNAME</code>. Editează <code>.env</code> și adaugă numele tău Revolut
              (ex: <code>VITE_REVOLUT_USERNAME=acsvr</code>), apoi repornește dev server-ul.
            </div>
          </div>
        )}

        {/* Conținut: 2 coloane pe desktop */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Col stânga – info/beneficii */}
          <aside className="lg:col-span-2">
            <div className="h-full rounded-xl ring-1 ring-gray-100 bg-gray-50 p-5">
              <h2 className="text-lg font-semibold">De ce ajută donația ta</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  Echipamente, mingi și materiale pentru antrenamente.
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  Taxe de organizare și logistică în ziua meciului.
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  Dezvoltarea proiectelor echipei.
                </li>
              </ul>

              <div className="mt-6 border-t pt-4">
                <div className="flex items-center gap-3">
                  {/* ✅ logo-ul echipei */}
                  <img
                    src={logo}
                    alt="ACS Viitorul Răchiteni"
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-black/10"
                  />
                  <div>
                    <div className="font-medium">ACS Viitorul Răchiteni</div>
                    <div className="text-xs text-gray-500">#SusțineEchipa</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Col dreapta – QR + acțiuni */}
          <section className="lg:col-span-3">
            <div className="rounded-xl ring-1 ring-gray-100 bg-white p-5">
              <div className="grid place-items-center gap-4">
                <img
                  src={qrImage}
                  alt="QR donație Revolut"
                  width={240}
                  height={240}
                  className="rounded"
                />

                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex justify-center items-center gap-2 px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {/* icon send */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M15.854.146a.5.5 0 0 0-.52-.116l-15 6a.5.5 0 0 0 .034.95l6.223 1.555L8.146 14a.5.5 0 0 0 .948-.032l1.596-4.787 4.787-1.596a.5.5 0 0 0 .377-.439l.5-6a.5.5 0 0 0-.5-.5z" />
                    </svg>
                    Donează acum
                  </a>

                  <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex justify-center items-center gap-2 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    {/* icon copy */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M10 1.5A1.5 1.5 0 0 1 11.5 3v7A1.5 1.5 0 0 1 10 11.5H5A1.5 1.5 0 0 1 3.5 10V3A1.5 1.5 0 0 1 5 1.5h5z"/>
                      <path d="M3 4a2 2 0 0 0-2 2v6.5A2.5 2.5 0 0 0 3.5 15h6a2 2 0 0 0 2-2V12H10v1a1 1 0 0 1-1 1h-6A1.5 1.5 0 0 1 1.5 12.5V6A1 1 0 0 1 2.5 5H3V4z"/>
                    </svg>
                    {copied ? 'Copiat!' : 'Copiază linkul'}
                  </button>

                  <a
                    href={qrImage}
                    download="donatie-viitorul-rachiteni-qr.png"
                    className="inline-flex justify-center items-center gap-2 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    {/* icon download */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M.5 9.9a.5.5 0 0 1 .5-.5h4V1.5a.5.5 0 0 1 1 0v7.9h4a.5.5 0 0 1 .35.85l-4 4a.5.5 0 0 1-.7 0l-4-4a.5.5 0 0 1-.15-.35z"/>
                      <path d="M.5 15a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1H.5z"/>
                    </svg>
                    Descarcă QR
                  </a>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Scanează cu camera telefonului sau folosește butonul „Donează acum”.
                </p>

                <div className="text-[11px] text-gray-400 text-center">
                  Plățile sunt procesate pe platforma Revolut. Nu stocăm date de plată.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
