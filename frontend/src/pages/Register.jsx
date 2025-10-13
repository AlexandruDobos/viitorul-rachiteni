/* eslint-disable no-useless-escape */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const isPasswordStrong = (pwd) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]:;"'<>,.?/~`|\\])\S{8,}$/.test(pwd);

  const isFormValid = () =>
    name &&
    email &&
    password &&
    confirmPassword &&
    !nameError &&
    !emailError &&
    isPasswordStrong(password) &&
    password === confirmPassword;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isFormValid()) {
      setError('Completează corect toate câmpurile.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'USER' }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Înregistrare reușită! Verifică emailul.');
        setEmail('');
        setName('');
        setPassword('');
        setConfirmPassword('');
        setNameError('');
        setEmailError('');
      } else {
        if (data.message?.includes('Email')) {
          setError('Emailul este deja folosit. Încearcă altul.');
        } else {
          setError(data.message || 'Ceva n-a mers. Încearcă din nou.');
        }
      }
    } catch {
      setError('Eroare la conectare cu serverul.');
    } finally {
      setLoading(false);
    }
  };

  const pwdChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
    symbol: /[!@#$%^&*()\-_=+{}\[\]:;"'<>,.?/~`|\\]/.test(password),
  };

  return (
    <div className="flex justify-center">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-200"
      >
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 px-6 py-6 text-white">
          <h2 className="text-2xl font-extrabold tracking-tight">ÎNREGISTRARE</h2>
          <p className="text-white/80 text-sm mt-1">Creează-ți contul în câteva secunde.</p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {error && (
            <div
              className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
              role="alert"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"
              role="status"
            >
              {success}
            </div>
          )}

          {/* Nume */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Nume
            </label>
            <input
              id="name"
              type="text"
              placeholder="Nume și prenume"
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                const trimmed = val.trim();
                if (trimmed.length > 50) {
                  setNameError('Numele nu poate avea mai mult de 50 de caractere.');
                } else if (
                  trimmed &&
                  !/^[a-zA-ZăâîșțĂÂÎȘȚ]+(?: [a-zA-ZăâîșțĂÂÎȘȚ]+)*$/.test(trimmed)
                ) {
                  setNameError('Numele poate conține doar litere și un singur spațiu între cuvinte.');
                } else {
                  setNameError('');
                }
              }}
              className={`w-full rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                nameError ? 'border-red-300' : 'border-gray-300'
              } border`}
              autoComplete="name"
              required
            />
            {nameError && <p className="text-red-600 text-xs mt-1">{nameError}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="adresa@exemplu.com"
              value={email}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                setEmailError(val && !isValidEmail(val) ? 'Emailul nu este valid.' : '');
              }}
              className={`w-full rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                emailError ? 'border-red-300' : 'border-gray-300'
              } border`}
              autoComplete="email"
              required
            />
            {emailError && <p className="text-red-600 text-xs mt-1">{emailError}</p>}
          </div>

          {/* Parolă */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Parolă
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Parolă"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 hover:text-gray-800"
              >
                {showPassword ? 'Ascunde' : 'Afișează'}
              </button>
            </div>

            {/* Checklist parolă */}
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
          </div>

          {/* Confirmare parolă */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="confirm">
              Confirmă parola
            </label>
            <input
              id="confirm"
              type="password"
              placeholder="Confirmă parola"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoComplete="new-password"
              required
            />
            {confirmPassword && confirmPassword !== password && (
              <p className="text-red-600 text-xs mt-1">Parolele nu coincid.</p>
            )}
          </div>

          {/* Mesaj informativ despre abonare automată */}
          <div className="text-xs rounded-lg border border-blue-200 bg-blue-50 text-blue-800 px-3 py-2">
            ℹ️ La crearea contului ești <span className="font-semibold">abonat automat</span> la
            noutățile echipei (email). Te poți dezabona oricând din
            <span className="font-semibold"> Profil → Abonare la noutăți</span>.
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid() || loading}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white
              ${isFormValid() && !loading
                ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 hover:brightness-110'
                : 'bg-gray-400 cursor-not-allowed'}`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-dashed rounded-full animate-spin" />
                Se înregistrează…
              </>
            ) : (
              'ÎNREGISTREAZĂ-TE'
            )}
          </button>

          <p className="text-xs text-center text-gray-600">
            Ai deja cont?{' '}
            <Link to="/login" className="font-semibold text-blue-700 hover:underline">
              Autentifică-te
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
