// src/pages/Donations.jsx
import React, { useMemo, useState } from 'react';
import logo from '../assets/logo.png';
import { BASE_URL } from '../utils/constants';

const CURRENCIES = [
  { value: 'ron', label: 'RON' },
  { value: 'eur', label: 'EUR' },
];

const PRESETS = {
  ron: [25, 50, 100],
  eur: [5, 10, 20],
};

const MIN_BY_CURRENCY = { ron: 2, eur: 0.5 };

// "50" / "50,5" -> 5050 (minor units)
function parseToMinorUnits(amountStr) {
  const n = Number(String(amountStr).replace(',', '.'));
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

export default function Donations() {
  const [currency, setCurrency] = useState('ron');
  const [amount, setAmount] = useState('50');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const presets = useMemo(() => PRESETS[currency] || [], [currency]);
  const minHuman = MIN_BY_CURRENCY[currency] ?? 0.5;

  const onPreset = (v) => {
    setAmount(String(v));
    setError('');
  };

  const onDonate = async () => {
    setError('');
    const minor = parseToMinorUnits(amount);

    if (minor === null || minor < Math.round(minHuman * 100)) {
      setError(`Suma minimă este ${minHuman} ${currency.toUpperCase()}.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/donations/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: minor,
          currency,
          donorEmail: donorEmail || undefined,
          donorName: donorName || undefined,
          message: message || undefined,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Eroare la crearea sesiunii de plată.');
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Nu am primit URL-ul de plată.');
      }
    } catch (e) {
      setError(e.message || 'A apărut o eroare.');
    } finally {
      setSubmitting(false);
    }
  };

  const presetActive = (v) => Number(amount.replace(',', '.')) === v;

  return (
    <div className="px-4">
      {/* tiny CSS for animated CTA sheen */}
      <style>{`
        @keyframes btn-sheen {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
      `}</style>

      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-200">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 px-5 md:px-7 py-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-xl md:text-2xl font-bold tracking-tight">
                Donează pentru echipă
              </h1>
              <p className="mt-1 text-sm text-white/85">
                Mulțumim pentru susținere! Alege suma și apasă „Donează cu Stripe”.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs ring-1 ring-white/25">
              <span aria-hidden>🔒</span> Plăți securizate prin Stripe
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 p-5 md:p-6">
          {/* LEFT CARD (compact info) */}
          <aside className="lg:col-span-2">
            <div className="h-full rounded-2xl border border-gray-100 bg-gray-50 p-4 md:p-5">
              <h2 className="text-base md:text-lg font-semibold">De ce ajută donația ta</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span> Echipamente, mingi și materiale pentru antrenamente.
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span> Taxe de organizare și logistică în ziua meciului.
                </li>
                <li className="flex gap-2">
                  <span className="text-gray-400">•</span> Dezvoltarea proiectelor și a comunității.
                </li>
              </ul>

              <div className="mt-5 border-t pt-4">
                <div className="flex items-center gap-3">
                  <img
                    src={logo}
                    alt="ACS Viitorul Răchiteni"
                    className="h-11 w-11 rounded-full object-cover ring-1 ring-black/10"
                  />
                  <div className="min-w-0">
                    <div className="font-medium leading-5">ACS Viitorul Răchiteni</div>
                    <div className="text-xs text-gray-500">#SustinEchipa</div>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-gray-500">
                Nu stocăm datele tale de card. Procesarea plăților este efectuată de Stripe.
                Apple Pay și Google Pay pot fi disponibile pe dispozitive compatibile.
              </p>
            </div>
          </aside>

          {/* RIGHT FORM */}
          <section className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
              <div className="grid gap-4">
                {/* Currency + Presets in one compact row on wide screens */}
                <div className="grid gap-3 md:grid-cols-3">
                  {/* Currency segmented */}
                  <div className="md:col-span-1">
                    <label className="text-sm font-medium text-gray-800">Monedă</label>
                    <div className="mt-1 inline-flex w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      {CURRENCIES.map((c, idx) => {
                        const active = currency === c.value;
                        return (
                          <button
                            key={c.value}
                            type="button"
                            className={[
                              'w-1/2 px-3 py-2 text-sm transition',
                              active
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 hover:bg-white',
                              idx !== CURRENCIES.length - 1 ? 'border-r border-gray-200' : '',
                            ].join(' ')}
                            onClick={() => {
                              setCurrency(c.value);
                              setAmount(String(PRESETS[c.value][1])); // preset mediu
                              setError('');
                            }}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-800">Alege rapid o sumă</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {presets.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => onPreset(v)}
                          className={[
                            'rounded-xl px-4 py-2 text-sm border transition',
                            presetActive(v)
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/50 text-gray-800'
                          ].join(' ')}
                          aria-label={`Donează ${v} ${currency.toUpperCase()}`}
                        >
                          <span className="font-semibold">{v}</span>{' '}
                          <span className="text-gray-500">{currency.toUpperCase()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom amount */}
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-gray-800">Sumă personalizată</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`ex: ${currency === 'ron' ? '50' : '10'}`}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25"
                    />
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md bg-gray-50 px-2 py-1 text-[11px] text-gray-600 ring-1 ring-gray-200">
                      {currency.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Minim <b>{minHuman} {currency.toUpperCase()}</b> (poți folosi virgulă pentru zecimale).
                  </p>
                </div>

                {/* Donor details (compact, no overlap) */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="min-w-0">
                    <label className="text-sm text-gray-700">Nume (opțional)</label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="mt-1 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25"
                      placeholder="Nume"
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="text-sm text-gray-700">Email (opțional)</label>
                    <input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="mt-1 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25"
                      placeholder="email@exemplu.com"
                    />
                  </div>
                </div>

                {/* Message (short, single row feel) */}
                <div className="grid gap-1.5">
                  <label className="text-sm text-gray-700">Mesaj (opțional)</label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25"
                    placeholder="Un gând pentru echipă 😊"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    {error}
                  </div>
                )}

                {/* CTA */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={onDonate}
                    disabled={submitting}
                    className={[
                      'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-white shadow-sm transition',
                      'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-[length:200%_200%]',
                      'hover:opacity-95',
                      submitting ? 'cursor-not-allowed opacity-80' : 'animate-[btn-sheen_6s_ease_infinite]'
                    ].join(' ')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2a5 5 0 00-5 5 5 5 0 001 3l-5 5a3 3 0 000 4l2 2a3 3 0 004 0l5-5a5 5 0 003 1 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
                    </svg>
                    {submitting ? 'Se deschide Stripe…' : 'Donează cu Stripe'}
                  </button>

                  <div className="text-xs text-gray-500">
                    Vei fi redirecționat către pagina Stripe pentru plată.
                  </div>
                </div>

                <div className="pt-1 text-center text-[11px] text-gray-400 sm:text-left">
                  Prin finalizare, ești de acord cu termenii și politica de confidențialitate.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
