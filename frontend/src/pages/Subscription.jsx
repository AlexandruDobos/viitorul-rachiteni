import React, { useMemo, useState } from 'react';
import logo from '../assets/logo.png';
import { BASE_URL } from '../utils/constants';

const CURRENCIES = [
    { value: 'ron', label: 'RON' },
    { value: 'eur', label: 'EUR' },
];

// planurile fixe (lunar)
const PLANS = {
    ron: [50, 250, 500],
    eur: [10, 50, 100],
};

export default function Subscription() {
    const [currency, setCurrency] = useState('ron');
    const [plan, setPlan] = useState(50);            // default 50
    const [donorName, setDonorName] = useState('');
    const [donorEmail, setDonorEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const plans = useMemo(() => PLANS[currency] || [], [currency]);

    const onPlan = (v) => {
        setPlan(v);
        setError('');
    };

    const onSubscribe = async () => {
        setError('');
        setSubmitting(true);
        try {
            const res = await fetch(`${BASE_URL}/donations/subscriptions/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planCode: `${currency}_${plan}`,               // <— cheie exactă
                    supporterEmail: donorEmail || undefined,       // (denumiri aliniate cu backendul)
                    supporterName: donorName || undefined,
                }),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || 'Eroare la crearea sesiunii de abonament.');
            }
            const data = await res.json();
            if (data?.url) {
                window.location.href = data.url; // Stripe Checkout
            } else {
                throw new Error('Nu am primit URL-ul de plată (Stripe).');
            }
        } catch (e) {
            setError(e.message || 'A apărut o eroare.');
        } finally {
            setSubmitting(false);
        }
    };

    const planActive = (v) => Number(plan) === v;

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
                {/* HEADER (identic stil cu Donations) */}
                <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 px-5 md:px-7 py-5 text-white">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="truncate text-xl md:text-2xl font-bold tracking-tight">
                                Abonament lunar de susținere
                            </h1>
                            <p className="mt-1 text-sm text-white/85">
                                Alege un plan lunar — Stripe va retrage automat în fiecare lună (poți anula oricând).
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs ring-1 ring-white/25">
                            <span aria-hidden>🔒</span> Plăți recurente securizate prin Stripe
                        </div>
                    </div>
                </div>

                {/* CONTENT (identic layout cu Donations) */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 p-5 md:p-6">
                    {/* LEFT CARD */}
                    <aside className="lg:col-span-2">
                        <div className="h-full rounded-2xl border border-gray-100 bg-gray-50 p-4 md:p-5">
                            <h2 className="text-base md:text-lg font-semibold">De ce un abonament ajută mai mult</h2>
                            <ul className="mt-3 space-y-2 text-sm text-gray-700">
                                <li className="flex gap-2">
                                    <span className="text-gray-400">•</span> Ne oferi predictibilitate: planificăm mai bine sezonul.
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-gray-400">•</span> Acoperim costuri recurente (materiale, logistică).
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-gray-400">•</span> Poți anula sau schimba suma oricând din portalul Stripe.
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
                                        <div className="text-xs text-gray-500">#SustinEchipa lunar</div>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-4 text-[11px] leading-5 text-gray-500">
                                Datele cardului sunt procesate doar de Stripe. Primești email de confirmare și
                                acces la portal pentru gestionare (anulare/modificare).
                            </p>
                        </div>
                    </aside>

                    {/* RIGHT FORM */}
                    <section className="lg:col-span-3">
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
                            <div className="grid gap-4">
                                {/* Currency + Plans (în același stil ca la Donations) */}
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
                                                            setPlan(PLANS[c.value][0]); // 50 implicit
                                                            setError('');
                                                        }}
                                                    >
                                                        {c.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Planuri fixe (50 / 250 / 500) */}
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium text-gray-800">Alege planul lunar</label>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                            {plans.map((v) => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => onPlan(v)}
                                                    className={[
                                                        'rounded-xl px-4 py-2 text-sm border transition',
                                                        planActive(v)
                                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                            : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/50 text-gray-800'
                                                    ].join(' ')}
                                                    aria-label={`Abonament ${v} ${currency.toUpperCase()}/lună`}
                                                    title={`Abonament ${v} ${currency.toUpperCase()}/lună`}
                                                >
                                                    <span className="font-semibold">{v}</span>{' '}
                                                    <span className="text-gray-500">{currency.toUpperCase()}/lună</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Donor details (opționale) */}
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
                                        onClick={onSubscribe}
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
                                        {submitting ? 'Se deschide Stripe…' : `Abonează-te`}
                                    </button>

                                    <div className="text-xs text-gray-500">
                                        Redirecționare către Stripe pentru confirmare. Poți anula oricând.
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
