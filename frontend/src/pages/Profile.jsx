/* eslint-disable no-useless-escape */
import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/constants';

const Profile = () => {
  // Date profil
  const [name, setName] = useState('');
  const [subscribe, setSubscribe] = useState(false);

  // Parolă
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmNewPwd, setConfirmNewPwd] = useState('');

  // Mesaje per secțiune
  const [msgName, setMsgName] = useState('');
  const [errName, setErrName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [msgSub, setMsgSub] = useState('');
  const [errSub, setErrSub] = useState('');
  const [savingSub, setSavingSub] = useState(false);

  const [msgPwd, setMsgPwd] = useState('');
  const [errPwd, setErrPwd] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  // Preluare profil curent (nume + abonare)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/profile`, { credentials: 'include' });
        if (!res.ok) throw new Error('Nu am putut încărca profilul.');
        const data = await res.json();
        setName(data?.name ?? '');
        setSubscribe(Boolean(data?.subscribe));
      } catch (e) {
        setErrName(e.message || 'Eroare la încărcarea profilului.');
      }
    })();
  }, []);

  const isPasswordStrong = (pwd) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]:;"'<>,.?/~`|\\])\S{8,}$/.test(pwd);

  /* ---- Save NUME (PATCH doar cu { name }) ---- */
  const onSaveName = async () => {
    setMsgName(''); setErrName('');
    const trimmed = name.trim();
    if (!trimmed) {
      setErrName('Numele nu poate fi gol.');
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        let detail = 'Eroare la actualizarea numelui.';
        try { const d = await res.json(); if (d?.message) detail = d.message; } catch {}
        throw new Error(detail);
      }
      setMsgName('Numele a fost actualizat.');
    } catch (e) {
      setErrName(e.message || 'Eroare la actualizarea numelui.');
    } finally {
      setSavingName(false);
    }
  };

  /* ---- Save ABONARE (PATCH doar cu { subscribe }) ---- */
  const onSaveSubscribe = async () => {
    setMsgSub(''); setErrSub('');
    setSavingSub(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subscribe }),
      });
      if (!res.ok) {
        let detail = 'Eroare la actualizarea preferinței de abonare.';
        try { const d = await res.json(); if (d?.message) detail = d.message; } catch {}
        throw new Error(detail);
      }
      setMsgSub('Preferința de abonare a fost actualizată.');
    } catch (e) {
      setErrSub(e.message || 'Eroare la actualizarea preferinței de abonare.');
    } finally {
      setSavingSub(false);
    }
  };

  /* ---- Save PAROLĂ (PATCH doar cu { currentPassword, newPassword }) ---- */
  const onSavePassword = async () => {
    setMsgPwd(''); setErrPwd('');
    if (!currentPwd || !newPwd || !confirmNewPwd) {
      setErrPwd('Completează toate câmpurile de parolă.');
      return;
    }
    if (newPwd !== confirmNewPwd) {
      setErrPwd('Parolele noi nu coincid.');
      return;
    }
    if (!isPasswordStrong(newPwd)) {
      setErrPwd('Parola nu respectă regulile de complexitate.');
      return;
    }
    setSavingPwd(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      if (!res.ok) {
        let detail = 'Eroare la schimbarea parolei.';
        try { const d = await res.json(); if (d?.message) detail = d.message; } catch {}
        throw new Error(detail);
      }
      setMsgPwd('Parola a fost schimbată.');
      setCurrentPwd(''); setNewPwd(''); setConfirmNewPwd('');
    } catch (e) {
      setErrPwd(e.message || 'Eroare la schimbarea parolei.');
    } finally {
      setSavingPwd(false);
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
      {/* Header gradient */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 px-6 py-6 text-white shadow">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Profilul meu</h1>
        <p className="text-white/85 text-sm mt-1">Editează-ți datele de cont și preferințele.</p>
      </div>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-sm space-y-8">

        {/* ======= Secțiunea NUME ======= */}
        <section>
          {msgName && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msgName}</div>}
          {errName && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{errName}</div>}

          <h2 className="text-base md:text-lg font-semibold mb-2">Nume</h2>
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-gray-800">Nume afișat</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nume și prenume"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25"
              />
              <button
                type="button"
                onClick={onSaveName}
                disabled={!name.trim() || savingName}
                className={[
                  'shrink-0 inline-flex items-center justify-center rounded-xl px-4 py-3 text-white shadow-sm transition',
                  name.trim() && !savingName
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:opacity-95'
                    : 'bg-gray-400 cursor-not-allowed',
                ].join(' ')}
              >
                {savingName ? 'Se salvează…' : 'Salvează'}
              </button>
            </div>
            <p className="text-xs text-gray-500">Acest nume poate fi afișat public (de ex. la comentarii/donații).</p>
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* ======= Secțiunea ABONARE ======= */}
        <section>
          {msgSub && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msgSub}</div>}
          {errSub && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{errSub}</div>}

          <h2 className="text-base md:text-lg font-semibold mb-2">Abonare la noutăți</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
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

            <button
              type="button"
              onClick={onSaveSubscribe}
              disabled={savingSub}
              className={[
                'ml-auto inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-white shadow-sm transition',
                !savingSub
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:opacity-95'
                  : 'bg-gray-400 cursor-not-allowed',
              ].join(' ')}
            >
              {savingSub ? 'Se salvează…' : 'Salvează'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Dacă te abonezi, îți putem trimite emailuri cu noutăți.</p>
        </section>

        <hr className="border-gray-100" />

        {/* ======= Secțiunea PAROLĂ ======= */}
        <section>
          {msgPwd && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msgPwd}</div>}
          {errPwd && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{errPwd}</div>}

          <h2 className="text-base md:text-lg font-semibold mb-2">Schimbă parola</h2>
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

          <div className="mt-3">
            <button
              type="button"
              onClick={onSavePassword}
              disabled={savingPwd}
              className={[
                'inline-flex items-center justify-center rounded-xl px-5 py-3 text-white shadow-sm transition',
                !savingPwd
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:opacity-95'
                  : 'bg-gray-400 cursor-not-allowed',
              ].join(' ')}
            >
              {savingPwd ? 'Se salvează…' : 'Salvează parola'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
