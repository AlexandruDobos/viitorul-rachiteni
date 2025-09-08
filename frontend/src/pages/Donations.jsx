// src/pages/Donations.jsx
import React, { useMemo, useState } from 'react';
import logo from '../assets/logo.png';
import { BASE_URL } from '../utils/constants'; // backend base, ex: https://api.site.ro

const CURRENCIES = [
  { value: 'ron', label: 'RON' },
  { value: 'eur', label: 'EUR' },
];

// sume presetate afișate ca „chip”-uri
const PRESETS = {
  ron: [25, 50, 100],
  eur: [5, 10, 20],
};

// prag minim pe monedă (în unități „umane”, nu minor units)
const MIN_BY_CURRENCY = { ron: 2, eur: 0.5, usd: 0.5 };

// normalizează "50" / "50,5" -> 5050 (minor units)
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
  const minHuman = MIN_BY_CURRENCY[currency] ?? 0.5;

  const onPreset = (v) => {
    setAmount(String(v));
    setError('');
  };

  const onDonate = async () => {
    setError('');
    const minor = parseToMinorUnits(amount);

    // ✅ validare minimă dependentă de monedă
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
    <div className="px-4 py-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-200">
        {/* Header cu gradient & badge securitate */}
        <div className="bg-gradient-to-r from-emerald-600 to-black px-6 py-7 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Donează pentru echipă</h1>
              <p className="mt-1 text-sm md:text-base text-white/80">
                Mulțumim pentru susținere! Completează suma și apasă „Donează cu Stripe”.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
              <span role="img" aria-label="lock">🔒</span>
              Plăți securizate prin Stripe
            </div>
          </div>
        </div>

        {/* Conținut: 2 coloane pe desktop */}
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-5">
          {/* Col stânga – info/beneficii */}
          <aside className="lg:col-span-2">
            <div className="h-full rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <h2 className="text-lg font-semibold">De ce ajută donația ta</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><span className="text-gray-400">•</span> Echipamente, mingi și materiale pentru antrenamente.</li>
                <li className="flex gap-2"><span className="text-gray-400">•</span> Taxe de organizare și logistică în ziua meciului.</li>
                <li className="flex gap-2"><span className="text-gray-400">•</span> Dezvoltarea proiectelor și a comunității.</li>
              </ul>

              <div className="mt-6 border-t pt-4">
                <div className="flex items-center gap-3">
                  <img
                    src={logo}
                    alt="ACS Viitorul Răchiteni"
                    className="h-12 w-12 rounded-full object-cover ring-1 ring-black/10"
                  />
                  <div>
                    <div className="font-medium">ACS Viitorul Răchiteni</div>
                    <div className="text-xs text-gray-500">#SusțineEchipa</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-[11px] leading-5 text-gray-500">
                Nu stocăm datele tale de card. Procesarea plăților este efectuată de Stripe.
                Apple Pay și Google Pay pot fi disponibile pe dispozitive compatibile.
              </div>
            </div>
          </aside>

          {/* Col dreapta – formular donație */}
          <section className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="grid gap-5">
                {/* Monedă (segmented control) */}
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-800">Monedă</label>
                  <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    {CURRENCIES.map((c, idx) => {
                      const active = currency === c.value;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          className={[
                            'px-4 py-2 text-sm transition',
                            active
                              ? 'bg-emerald-600 text-white'
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

                {/* Preset amounts */}
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-800">Alege rapid o sumă</label>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((v) => (
                      <button
                        key={v}
                        type="button"
                        className="group rounded-xl border border-gray-300 px-4 py-2 text-sm transition hover:border-emerald-300 hover:bg-emerald-50"
                        onClick={() => onPreset(v)}
                        aria-label={`Donează ${v} ${currency.toUpperCase()}`}
                      >
                        <span className="font-medium">{v}</span>{' '}
                        <span className="text-gray-500 group-hover:text-emerald-700">{currency.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sumă personalizată */}
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-800">Sumă personalizată</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`ex: ${currency === 'ron' ? '50' : '10'}`}
                      className="w-full rounded-xl border border-gray-300 bg-white/90 px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-600 ring-1 ring-gray-200">
                      {currency.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Minim <b>{minHuman} {currency.toUpperCase()}</b> (poți folosi virgulă pentru zecimale).
                  </p>
                </div>

                {/* Detalii donator (opțional) */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-sm text-gray-700">Nume (opțional)</label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="rounded-xl border border-gray-300 bg-white/90 px-4 py-3 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30"
                      placeholder="Prenume Nume"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-sm text-gray-700">Email (opțional)</label>
                    <input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="rounded-xl border border-gray-300 bg-white/90 px-4 py-3 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30"
                      placeholder="email@exemplu.com"
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <label className="text-sm text-gray-700">Mesaj (opțional)</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="rounded-xl border border-gray-300 bg-white/90 px-4 py-3 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/30"
                    placeholder="Un gând pentru echipă 😊"
                  />
                </div>

                {/* Alerte / erori */}
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
                      'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-white transition',
                      submitting
                        ? 'cursor-not-allowed bg-emerald-400'
                        : 'bg-emerald-600 hover:bg-emerald-700',
                      'shadow-sm',
                    ].join(' ')}
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

                <div className="pt-2 text-center text-[11px] text-gray-400 sm:text-left">
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
