// src/pages/DonationsCancel.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function DonationsCancel() {
  return (
    <div className="relative px-4 py-10">
      {/* fundal subtil animat */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
        <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] animate-[float_10s_linear_infinite]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots-cancel" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#9ca3af" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-cancel)" />
          </svg>
        </div>
        <style>
          {`@keyframes float { 
              0% { transform: translateY(0px); } 
              50% { transform: translateY(8px); } 
              100% { transform: translateY(0px); } 
            }`}
        </style>
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
          {/* Header cu gradient „calm” + X animat */}
          <div className="relative bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 px-6 py-10 text-white">
            <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dots2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots2)" />
              </svg>
            </div>

            <div className="relative flex flex-col items-center text-center gap-4">
              {/* X animat (stroke-dash) */}
              <svg
                className="h-16 w-16"
                viewBox="0 0 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle className="opacity-90" cx="26" cy="26" r="24" stroke="white" strokeWidth="2" />
                <path
                  d="M18 18 L34 34 M34 18 L18 34"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 60,
                    strokeDashoffset: 60,
                    animation: 'dashCancel 1s ease-out forwards 0.2s'
                  }}
                />
              </svg>
              <style>{`@keyframes dashCancel { to { stroke-dashoffset: 0; } }`}</style>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Plata a fost anulată
              </h1>
              <p className="text-white/90 max-w-xl">
                Nicio tranzacție nu a fost efectuată. Poți reîncerca oricând — suntem aici când ești pregătit(ă).
              </p>
            </div>
          </div>

          {/* Conținut */}
          <div className="p-6 md:p-8">
            {/* Tips rapide */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Ce poți face mai departe</h2>
              <p className="text-sm text-gray-600">
                Dacă ai ajuns aici din greșeală sau a apărut o întrerupere, încearcă una dintre opțiunile de mai jos.
              </p>

              <div className="mt-4 grid md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-2xl">🔁</div>
                  <div className="mt-2 font-medium text-gray-900">Reîncearcă plata</div>
                  <div className="text-sm text-gray-600">
                    Revino la pagina de donații și inițiază din nou plata cu Stripe.
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-2xl">💳</div>
                  <div className="mt-2 font-medium text-gray-900">Verifică metoda</div>
                  <div className="text-sm text-gray-600">
                    Asigură-te că datele cardului sunt corecte sau încearcă alt card/portofel.
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="text-2xl">📶</div>
                  <div className="mt-2 font-medium text-gray-900">Conexiune stabilă</div>
                  <div className="text-sm text-gray-600">
                    O conexiune mai stabilă poate preveni întreruperile în timpul plății.
                  </div>
                </div>
              </div>
            </div>

            {/* CTA-uri */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/donations"
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
              >
                Reîncearcă donația
              </Link>

              <Link
                to="/"
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium"
              >
                Înapoi la site
              </Link>
            </div>

            {/* Notă liniștitoare */}
            <p className="mt-6 text-xs text-gray-500 text-center sm:text-left">
              Nu am procesat nicio plată. Dacă ai întrebări, scrie-ne și te ajutăm cu drag.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
