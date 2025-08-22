// src/pages/Contact.jsx
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { BASE_URL } from '../utils/constants';
import logo from '../assets/logo.png'; // ✅ logo-ul tău

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const MAX_MSG = 1000;

const Contact = () => {
  const UI = {
    mainTitle: 'Completează formularul de contact',
    message: 'Mesaj',
    messagePlaceholder: 'Despre ce vrei să comunici cu noi',
    nameLabel: 'Nume și Prenume',
    emailLabel: 'Email',
    phoneLabel: 'Mobil',
    phonePlaceholder: 'format 07xx.xxx.xxx',
    submitButtonText: 'Trimite',
  };

  const [form, setForm] = useState({ message: '', name: '', email: '', phone: '' });
  const [state, setState] = useState({ sending: false, sent: false, error: null });
  const [touched, setTouched] = useState({});

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onBlur   = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

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

      const res = await fetch(`${BASE_URL}/api/app/contact/messages`, {
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
      setState({ sending: false, sent: false, error: err.message || 'Eroare' });
    }
  };

  return (
    <div className="px-4">
      <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl bg-white shadow ring-1 ring-gray-200">
        {/* Header cu gradient */}
        <div className="bg-gradient-to-r from-red-600 to-black px-6 py-6 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">{UI.mainTitle}</h1>
          <p className="text-white/80 text-sm mt-1">
            Completează câmpurile de mai jos și apasă „{UI.submitButtonText}”.
          </p>
        </div>

        {/* Conținut: 2 coloane pe desktop */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Col stânga – info/brand (1/5) */}
          <aside className="lg:col-span-2">
            <div className="h-full rounded-xl ring-1 ring-gray-100 bg-gray-50 p-5">
              <h2 className="text-lg font-semibold">ACS Viitorul Răchiteni</h2>
              <p className="text-sm text-gray-600 mt-1">
                Scrie-ne pentru parteneriate, presă, meciuri amicale sau întrebări despre club.
              </p>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">•</span>
                  Răspundem de obicei în 1–2 zile lucrătoare.
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">•</span>
                  Te rugăm să lași o adresă de email validă.
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="flex items-center gap-3">
                  {/* ✅ logo-ul echipei în loc de “VR” */}
                  <img
                    src={logo}
                    alt="ACS Viitorul Răchiteni"
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-black/10"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div>
                    <div className="font-medium">Echipa ACSVR</div>
                    <div className="text-xs text-gray-500">#ViitorulRăchiteni</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Col dreapta – formular (3/5) */}
          <section className="lg:col-span-3">
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Mesaj */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {UI.message} <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <textarea
                    name="message"
                    rows="6"
                    maxLength={MAX_MSG}
                    required
                    value={form.message}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={UI.messagePlaceholder}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      invalid.message ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute bottom-1 right-2 text-[11px] text-gray-400">
                    {form.message.length}/{MAX_MSG}
                  </div>
                </div>
                {invalid.message && (
                  <p className="text-xs text-red-600 mt-1">Te rugăm să scrii un mesaj.</p>
                )}
              </div>

              {/* Nume */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {UI.nameLabel} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder={UI.nameLabel}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    invalid.name ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {invalid.name && (
                  <p className="text-xs text-red-600 mt-1">Te rugăm să completezi numele.</p>
                )}
              </div>

              {/* Email & Telefon */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {UI.emailLabel} <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={UI.emailLabel}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      invalid.email ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                  {invalid.email && (
                    <p className="text-xs text-red-600 mt-1">Introdu un email valid.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{UI.phoneLabel}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={UI.phonePlaceholder}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
                  />
                </div>
              </div>

              {/* Buton + mesaje */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                  Câmpurile marcate cu <span className="text-red-600">*</span> sunt obligatorii.
                </div>
                <button
                  type="submit"
                  disabled={state.sending}
                  className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-medium px-6 py-2 rounded-lg disabled:opacity-60"
                >
                  {!state.sending ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M15.854.146a.5.5 0 0 0-.52-.116l-15 6a.5.5 0 0 0 .034.95l6.223 1.555L8.146 14a.5.5 0 0 0 .948-.032l1.596-4.787 4.787-1.596a.5.5 0 0 0 .377-.439l.5-6a.5.5 0 0 0-.5-.5z" />
                      </svg>
                      {UI.submitButtonText}
                    </>
                  ) : (
                    'Se trimite…'
                  )}
                </button>
              </div>

              {state.sent && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 text-center">
                  Mesajul a fost trimis. Mulțumim!
                </div>
              )}
              {state.error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 text-center">
                  {state.error}
                </div>
              )}
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Contact;
