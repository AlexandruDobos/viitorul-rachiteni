import React from 'react';
import { Link } from 'react-router-dom';

export default function SubscriptionCancel() {
  return (
    <div className="relative px-4 py-10">
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
              <svg className="h-16 w-16" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-90" cx="26" cy="26" r="24" stroke="white" strokeWidth="2" />
                <path d="M18 18 L34 34 M34 18 L18 34" stroke="white" strokeWidth="4" strokeLinecap="round"
                  style={{ strokeDasharray: 60, strokeDashoffset: 60, animation: 'dashCancel 1s ease-out forwards 0.2s' }} />
              </svg>
              <style>{`@keyframes dashCancel { to { stroke-dashoffset: 0; } }`}</style>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Procesul a fost anulat</h1>
              <p className="text-white/90 max-w-xl">
                Nicio subscriere nu a fost creată. Poți reîncerca oricând.
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="mt-2 flex flex-col sm:flex-row gap-3">
              <Link
                to="/abonament"
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
              >
                Reîncearcă abonarea
              </Link>

              <Link
                to="/"
                className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium"
              >
                Înapoi la site
              </Link>
            </div>

            <p className="mt-6 text-xs text-gray-500 text-center sm:text-left">
              Nu am creat un abonament. Dacă ai întrebări, scrie-ne și te ajutăm cu drag.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
