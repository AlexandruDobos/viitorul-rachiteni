/* eslint-disable no-useless-escape */
import React, { useState } from 'react';
import { BASE_URL } from '../utils/constants';

const Profile = () => {
  // Stare locală
  const [name, setName] = useState('');
  const [subscribe, setSubscribe] = useState(false); // default: NU (false)
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isPasswordStrong = (pwd) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]:;"'<>,.?/~`|\\])\S{8,}$/.test(pwd);

  const wantsPasswordChange = !!(currentPwd || newPwd || confirmNewPwd);

  const canSubmit =
    name.trim().length > 0 &&
    (!wantsPasswordChange
      || (
        currentPwd && newPwd && confirmNewPwd &&
        newPwd === confirmNewPwd && isPasswordStrong(newPwd)
      )
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setMsg('');
    setError('');
    setSubmitting(true);

    try {
      // 1) Update profil (nume + abonare)
      {
        const res = await fetch(`${BASE_URL}/auth/me`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: name.trim(), subscribe }),
        });

        if (!res.ok) {
          let detail = 'Eroare la actualizarea profilului.';
          try {
            const data = await res.json();
            if (data?.message) detail = data.message;
          } catch {}
          throw new Error(detail);
        }
      }

      // 2) Schimbare parolă (opțional, doar dacă a completat câmpurile)
      if (wantsPasswordChange) {
        const resPwd = await fetch(`${BASE_URL}/auth/me/password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            currentPassword: currentPwd,
            newPassword: newPwd,
          }),
        });

        if (!resPwd.ok) {
          let detail = 'Eroare la schimbarea parolei.';
          try {
            const data = await resPwd.json();
            if (data?.message) detail = data.message;
          } catch {}
          throw new Error(detail);
        }
      }

      setMsg(wantsPasswordChange
        ? 'Profilul și parola au fost actualizate.'
        : 'Profilul a fost actualizat cu succes.'
      );
      // Curăță câmpurile de parolă după succes
      setCurrentPwd('');
      setNewPwd('');
      setConfirmNewPwd('');
    } catch (err) {
      setError(err?.message || 'A apărut o eroare.');
    } finally {
      setSubmitting(false);
    }
  };

  const pwdChecks = {
    length: newPwd.length >= 8,
    upper: /[A-Z]/.test(newPwd),
    lower: /[a-z]/.test(newPwd),
    digit: /\d/.test(newPwd),
    symbol: /[!@#$%^&*()\-_=+{}\[\]:;"'<>,.?/~`|\\]/.test(newPwd),
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header gradient ca la restul site-ului */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 px-6 py-6 text-white shadow">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Profilul meu</h1>
        <p className="text-white/85 text-sm mt-1">Editează-ți datele de cont și preferințele.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-sm">
        {msg && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {msg}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <div className="grid gap-5">
          {/* Nume */}
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-gray-800">Nume</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nume și prenume"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25"
              required
            />
            <p className="text-xs text-gray-500">Acest nume poate fi afișat în zona publică (de ex. la comentarii/donații).</p>
          </div>

          {/* Abonare noutăți */}
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-gray-800">Abonează-te la noutăți</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSubscribe(false)}
                className={[
                  'rounded-lg border px-3 py-2 text-sm transition',
                  !subscribe
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/50 text-gray-800',
                ].join(' ')}
              >
                NU
              </button>
              <button
                type="button"
                onClick={() => setSubscribe(true)}
                className={[
                  'rounded-lg border px-3 py-2 text-sm transition',
                  subscribe
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50/50 text-gray-800',
                ].join(' ')}
              >
                DA
              </button>
            </div>
            <p className="text-xs text-gray-500">Dacă te abonezi, ne permiți să îți trimitem emailuri cu noutăți.</p>
          </div>

          {/* Schimbare parolă */}
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-gray-800">Schimbă parola (opțional)</label>
            <div className="grid gap-3 md:grid-cols-3">
              <input
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="Parola curentă"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25"
              />
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Parola nouă"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25"
              />
              <input
                type="password"
                value={confirmNewPwd}
                onChange={(e) => setConfirmNewPwd(e.target.value)}
                placeholder="Confirmă parola nouă"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25"
              />
            </div>

            {(newPwd || confirmNewPwd) && (
              <>
                {newPwd !== confirmNewPwd && (
                  <p className="text-xs text-rose-600 mt-1">Parolele noi nu coincid.</p>
                )}
                <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-gray-600">
                  <div className={`flex items-center gap-1 ${pwdChecks.length ? 'text-emerald-600' : ''}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    Min. 8 caractere
                  </div>
                  <div className={`flex items-center gap-1 ${pwdChecks.upper ? 'text-emerald-600' : ''}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    O literă mare
                  </div>
                  <div className={`flex items-center gap-1 ${pwdChecks.lower ? 'text-emerald-600' : ''}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    O literă mică
                  </div>
                  <div className={`flex items-center gap-1 ${pwdChecks.digit ? 'text-emerald-600' : ''}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    O cifră
                  </div>
                  <div className={`flex items-center gap-1 ${pwdChecks.symbol ? 'text-emerald-600' : ''}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    Un simbol
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  🔒 Parola trebuie să aibă minim 8 caractere, o literă mare, una mică, o cifră și un simbol.
                </p>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className={[
                'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-white shadow-sm transition',
                canSubmit && !submitting
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:opacity-95'
                  : 'bg-gray-400 cursor-not-allowed',
              ].join(' ')}
            >
              {submitting ? 'Se salvează…' : 'Salvează modificările'}
            </button>
            <span className="text-xs text-gray-500">Modificările sunt salvate în contul tău.</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
