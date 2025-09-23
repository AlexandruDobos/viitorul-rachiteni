// src/pages/Contact.jsx
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { BASE_URL } from '../utils/constants';
import logo from '../assets/logo.png';
import JsonLd from '../components/JsonLD';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const MAX_MSG = 1000;

const Contact = () => {
  const UI = {
    mainTitle: 'Contactează-ne',
    subtitle:
      'Ai întrebări, idei sau propuneri de parteneriat? Scrie-ne!',
    message: 'Mesaj',
    messagePlaceholder: 'Mesajul tău pentru noi',
    nameLabel: 'Nume și prenume',
    emailLabel: 'Email',
    phoneLabel: 'Mobil (opțional)',
    phonePlaceholder: 'ex. 07xx xxx xxx',
    submitButtonText: 'Trimite mesajul',
  };

  // Coordonate hartă (mutate aici din Footer)
  const MAP_LAT = 47.039275;
  const MAP_LNG = 26.9022791;
  const MAP_NAME = "Stadion AS Viitorul Răchiteni";
  const MAP_LINK =
    "https://www.google.com/maps/place/Stadion+AS+Viitorul+Rachiteni/@47.0408353,26.8979189,15.04z/data=!4m6!3m5!1s0x40cab9007ab923ef:0xd9579ff8e5789606!8m2!3d47.039275!4d26.9022791!16s%2Fg%2F11ldxsbz9_?entry=ttu";
  const MAP_EMBED_SRC = `https://www.google.com/maps?q=${MAP_LAT},${MAP_LNG}&z=16&output=embed`;

  const [form, setForm] = useState({
    message: '',
    name: '',
    email: '',
    phone: '',
  });
  const [state, setState] = useState({ sending: false, sent: false, error: null });
  const [touched, setTouched] = useState({});

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onBlur = (e) =>
    setTouched((t) => ({ ...t, [e.target.name]: true }));

  const invalid = {
    name: touched.name && !form.name.trim(),
    email: touched.email && !emailRegex.test(form.email.trim()),
    message: touched.message && !form.message.trim(),
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });

    if (!form.name.trim()) return;
    if (!emailRegex.test(form.email.trim())) return;
    if (!form.message.trim()) return;

    try {
      setState({ sending: true, sent: false, error: null });

      const res = await fetch(`${BASE_URL}/app/contact/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
        }),
      });

      if (!res.ok) throw new Error('Eroare la trimiterea mesajului');

      setState({ sending: false, sent: true, error: null });
      setForm({ message: '', name: '', email: '', phone: '' });
      setTouched({});
    } catch (err) {
      setState({
        sending: false,
        sent: false,
        error: err.message || 'A apărut o eroare. Încearcă din nou.',
      });
    }
  };

  return (
    <div className="px-4">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact ACS Viitorul Răchiteni",
        "url": "https://viitorulrachiteni.ro/contact"
      }} />
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-200">
        {/* HERO în culorile site-ului */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-6 py-7 text-white">
          <div className="flex items-center gap-4">
            <img
              src={logo}
              alt="ACS Viitorul Răchiteni"
              className="h-12 w-12 rounded-full ring-1 ring-white/30 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="min-w-0">
              <h1 className="truncate text-2xl md:text-3xl font-extrabold tracking-tight">
                {UI.mainTitle}
              </h1>
              <p className="mt-1 text-sm md:text-base text-white/90">{UI.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Conținut */}
        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-5">
          {/* Col stânga – info + HARTĂ (jos, în chenar) */}
          <aside className="lg:col-span-2">
            <div className="h-full rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <h2 className="text-base md:text-lg font-semibold">
                ACS Viitorul Răchiteni
              </h2>
              <p className="mt-2 text-sm text-gray-700">
                Ideal pentru parteneriate, presă, meciuri amicale sau întrebări despre club.
              </p>

              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-gray-400">•</span>
                  Răspundem de obicei în 1–2 zile lucrătoare.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-gray-400">•</span>
                  Te rugăm să folosești o adresă de email valabilă.
                </li>
              </ul>

              <p className="mt-5 text-[11px] leading-5 text-gray-500">
                Trimițând mesajul, ești de acord cu prelucrarea datelor în scopul soluționării cererii tale.
              </p>

              {/* Harta mutată din Footer – plasată jos în chenar */}
              <div className="mt-5">
                <div className="rounded-xl overflow-hidden ring-1 ring-indigo-100 shadow-sm max-w-[300px] mx-auto lg:mx-0">
                  <iframe
                    title={`Hartă Google – ${MAP_NAME}`}
                    src={MAP_EMBED_SRC}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-40 md:h-48"
                  />
                </div>
                <a
                  href={MAP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-[11px] text-blue-700 hover:underline"
                >
                  Deschide în Google Maps
                </a>
              </div>
            </div>
          </aside>

          {/* Col dreapta – formular */}
          <section className="lg:col-span-3">
            {/* feedback global */}
            <div aria-live="polite" className="mb-2 space-y-3">
              {state.sent && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                  Mesajul a fost trimis cu succes. Mulțumim!
                </div>
              )}
              {state.error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  {state.error}
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Mesaj */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {UI.message} <span className="text-indigo-600">*</span>
                </label>
                <div className="relative">
                  <textarea
                    name="message"
                    rows={6}
                    maxLength={MAX_MSG}
                    required
                    value={form.message}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={UI.messagePlaceholder}
                    aria-invalid={invalid.message || undefined}
                    className={`w-full rounded-xl border px-3 py-2 shadow-sm outline-none transition
                      ${invalid.message
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30'
                        : 'border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25'
                      }`}
                  />
                  <div className="pointer-events-none absolute bottom-1 right-2 text-[11px] text-gray-400">
                    {form.message.length}/{MAX_MSG}
                  </div>
                </div>
                {invalid.message && (
                  <p className="mt-1 text-xs text-rose-600">Te rugăm să scrii un mesaj.</p>
                )}
              </div>

              {/* Nume */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {UI.nameLabel} <span className="text-indigo-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder={UI.nameLabel}
                  aria-invalid={invalid.name || undefined}
                  className={`w-full rounded-xl border px-3 py-2 shadow-sm outline-none transition
                    ${invalid.name
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30'
                      : 'border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25'
                    }`}
                />
                {invalid.name && (
                  <p className="mt-1 text-xs text-rose-600">
                    Te rugăm să completezi numele.
                  </p>
                )}
              </div>

              {/* Email & Telefon */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {UI.emailLabel} <span className="text-indigo-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder="email@exemplu.com"
                    aria-invalid={invalid.email || undefined}
                    className={`w-full rounded-xl border px-3 py-2 shadow-sm outline-none transition
                      ${invalid.email
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30'
                        : 'border-gray-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25'
                      }`}
                  />
                  {invalid.email && (
                    <p className="mt-1 text-xs text-rose-600">
                      Te rugăm să introduci un email valid.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {UI.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={UI.phonePlaceholder}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25"
                  />
                </div>
              </div>

              {/* CTA */}
              <div className="pt-2 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-gray-500">
                  Câmpurile marcate cu <span className="text-indigo-600">*</span> sunt obligatorii.
                </div>

                <button
                  type="submit"
                  disabled={state.sending}
                  className={[
                    'inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-white shadow-sm transition',
                    'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:opacity-95',
                    state.sending ? 'opacity-80 cursor-not-allowed' : '',
                  ].join(' ')}
                >
                  {!state.sending ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2.94 2.94a1.5 1.5 0 0 1 1.59-.35l12.5 4.5a1.5 1.5 0 0 1 .04 2.83l-5.2 2.13-2.12 5.2a1.5 1.5 0 0 1-2.83.04l-4.5-12.5a1.5 1.5 0 0 1 .52-1.35Z" />
                      </svg>
                      {UI.submitButtonText}
                    </>
                  ) : (
                    'Se trimite…'
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Contact;
