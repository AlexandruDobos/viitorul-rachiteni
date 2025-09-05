// src/pages/Donations.jsx
import React, { useMemo, useState } from 'react';
import logo from '../assets/logo.png';
import { BASE_URL } from '../utils/constants'; // backend base, ex: http://localhost:3000

const CURRENCIES = [
  { value: 'ron', label: 'RON' },
  { value: 'eur', label: 'EUR' },
];

const PRESETS = {
  ron: [25, 50, 100],
  eur: [5, 10, 20],
};

// helper: normalizează inputul "50" / "50,5" -> 5050 (minor units)
function parseToMinorUnits(amountStr) {
  const n = Number(String(amountStr).replace(',', '.'));
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

export default function Donations() {
  const [currency, setCurrency] = useState('ron');
  const [amount, setAmount] = useState('50'); // default vizual
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const presets = useMemo(() => PRESETS[currency] || [], [currency]);

  const onPreset = (v) => {
    setAmount(String(v));
    setError('');
  };

  const onDonate = async () => {
    setError('');
    const minor = parseToMinorUnits(amount);

    if (minor === null || minor < 100) {
      setError('Introdu o sumă validă (minim 1).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/donations/checkout`, {
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
        window.location.href = data.url; // redirect la Stripe Checkout
      } else {
        throw new Error('Nu am primit URL-ul de plată.');
      }
    } catch (e) {
      setError(e.message || 'A apărut o eroare.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4">
      <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl bg-white shadow ring-1 ring-gray-200">
        {/* Header cu gradient */}
        <div className="bg-gradient-to-r from-emerald-600 to-black px-6 py-6 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Donează pentru echipă</h1>
              <p className="text-white/80 text-sm mt-1">
                Mulțumim pentru susținere! Completează suma și apasă „Donează cu Stripe”.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs bg-white/10 px-3 py-1 rounded-full">
              <span role="img" aria-label="lock">🔒</span>
              Plăți securizate prin Stripe
            </div>
          </div>
        </div>

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
                  Dezvoltarea proiectelor și a comunității.
                </li>
              </ul>

              <div className="mt-6 border-t pt-4">
                <div className="flex items-center gap-3">
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

              <div className="mt-6 text-[11px] text-gray-500">
                Nu stocăm datele tale de card. Procesarea plăților este efectuată de Stripe.
                Apple Pay și Google Pay pot fi disponibile pe dispozitive compatibile.
              </div>
            </div>
          </aside>

          {/* Col dreapta – Formular donație */}
          <section className="lg:col-span-3">
            <div className="rounded-xl ring-1 ring-gray-100 bg-white p-5">
              <div className="grid gap-4">
                {/* Currency + preset amounts */}
                <div className="grid gap-3">
                  <label className="text-sm font-medium">Monedă</label>
                  <div className="flex flex-wrap gap-2">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        className={`px-3 py-1.5 rounded-full border text-sm ${
                          currency === c.value
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setCurrency(c.value);
                          // setează niște sume implicite frumoase când schimbi moneda
                          setAmount(String(PRESETS[c.value][1])); // mijlocul listei
                          setError('');
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3">
                  <label className="text-sm font-medium">Alege rapid o sumă</label>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((v) => (
                      <button
                        key={v}
                        type="button"
                        className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
                        onClick={() => onPreset(v)}
                        aria-label={`Donează ${v} ${currency.toUpperCase()}`}
                      >
                        {v} {currency.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount input */}
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Sumă personalizată</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`ex: ${currency === 'ron' ? '50' : '10'}`}
                        className="w-full rounded-lg border-gray-300 focus:ring-emerald-600 focus:border-emerald-600"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                        {currency.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Minim 1 {currency.toUpperCase()} (poți folosi virgulă pentru zecimale).</p>
                </div>

                {/* Donor details (optional) */}
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <label className="text-sm text-gray-600">Nume (opțional)</label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="rounded-lg border-gray-300 focus:ring-emerald-600 focus:border-emerald-600"
                      placeholder="Prenume Nume"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm text-gray-600">Email (opțional)</label>
                    <input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="rounded-lg border-gray-300 focus:ring-emerald-600 focus:border-emerald-600"
                      placeholder="email@exemplu.com"
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <label className="text-sm text-gray-600">Mesaj (opțional)</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="rounded-lg border-gray-300 focus:ring-emerald-600 focus:border-emerald-600"
                    placeholder="Un gând pentru echipă 😊"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                {/* Donate button */}
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <button
                    type="button"
                    onClick={onDonate}
                    disabled={submitting}
                    className={`inline-flex justify-center items-center gap-2 px-6 py-3 rounded-lg text-white 
                      ${submitting ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}
                    `}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2a5 5 0 00-5 5 5 5 0 001 3l-5 5a3 3 0 000 4l2 2a3 3 0 004 0l5-5a5 5 0 003 1 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
                    </svg>
                    {submitting ? 'Se deschide Stripe…' : 'Donează cu Stripe'}
                  </button>

                  <div className="text-xs text-gray-500">
                    Vei fi redirecționat către pagina Stripe pentru a completa plata.
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 text-center sm:text-left">
                  Prin finalizare, ești de acord cu termenii și politica noastră de confidențialitate.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
