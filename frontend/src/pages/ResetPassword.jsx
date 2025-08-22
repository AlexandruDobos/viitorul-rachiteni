/* eslint-disable no-useless-escape */
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError('Token invalid sau lipsă.');
  }, [token]);

  const isPasswordStrong = (pwd) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{}[\]:;"'<>,.?/~`|\\])\S{8,}$/.test(pwd);

  const disabled =
    !token ||
    !newPassword ||
    !confirmPassword ||
    newPassword !== confirmPassword ||
    !isPasswordStrong(newPassword) ||
    loading;

  const pwdChecks = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    digit: /\d/.test(newPassword),
    symbol: /[!@#$%^&*()\-_=+{}\[\]:;"'<>,.?/~`|\\]/.test(newPassword),
  };

  const handleSubmit = async () => {
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Parolele nu coincid.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Eroare resetare');
      }

      const text = await response.text();
      setSuccess(text || 'Parola a fost resetată cu succes.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Eroare resetare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-200">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 px-6 py-6 text-white">
          <h2 className="text-2xl font-extrabold tracking-tight">Resetare parolă</h2>
          <p className="text-white/80 text-sm mt-1">Introdu parola nouă mai jos.</p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2" role="status">
              {success} Se redirecționează către login…
            </div>
          )}

          {!success && (
            <>
              {/* New password */}
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="newPass">
                  Noua parolă
                </label>
                <div className="relative">
                  <input
                    id="newPass"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Noua parolă"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      newPassword && !isPasswordStrong(newPassword) ? 'border-red-300' : 'border-gray-300'
                    }`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 hover:text-gray-800"
                  >
                    {showPassword ? 'Ascunde' : 'Afișează'}
                  </button>
                </div>

                {/* Checklist */}
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

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="confirmPass">
                  Confirmă parola
                </label>
                <div className="relative">
                  <input
                    id="confirmPass"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirmă parola"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 hover:text-gray-800"
                  >
                    {showConfirmPassword ? 'Ascunde' : 'Afișează'}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-red-600 text-xs mt-1">Parolele nu coincid.</p>
                )}
              </div>

              <p className="text-xs text-gray-600">
                🔒 Parola trebuie să aibă minim 8 caractere, o literă mare, una mică, o cifră și un simbol.
              </p>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={disabled}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white ${
                  !disabled
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 hover:brightness-110'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-dashed rounded-full animate-spin" />
                    Se trimite…
                  </>
                ) : (
                  'Trimite'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
