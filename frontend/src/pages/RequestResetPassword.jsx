import React, { useState } from 'react';
import { BASE_URL } from '../utils/constants';

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const RequestResetPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setMessage('');
    setError('');

    if (!isValidEmail(email)) {
      setEmailError('Emailul nu este valid.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/auth/request-reset?email=${encodeURIComponent(email)}`,
        { method: 'POST', redirect: 'manual' }
      );

      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || 'Eroare trimitere email');
      }

      setMessage(text || 'Ți-am trimis un link de resetare a parolei.');
    } catch (err) {
      setError(err.message || 'Eroare trimitere email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-200">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 px-6 py-6 text-white">
          <h2 className="text-2xl font-extrabold tracking-tight">Resetează parola</h2>
          <p className="text-white/80 text-sm mt-1">
            Introdu adresa ta de email pentru a primi linkul de resetare.
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {message && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2" role="status">
              {message} Verifică și folderul Spam/Promotions.
            </div>
          )}
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
              {error}
            </div>
          )}
          {emailError && !error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
              {emailError}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Adresă de email
            </label>
            <input
              id="email"
              type="email"
              placeholder="nume@exemplu.ro"
              value={email}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                setEmailError(val && !isValidEmail(val) ? 'Emailul nu este valid.' : '');
              }}
              className={`w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                email && emailError ? 'border-red-300' : 'border-gray-300'
              }`}
              autoComplete="email"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Îți vom trimite un link de resetare dacă adresa există în sistem.
            </p>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!email || !!emailError || loading}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white ${
              !email || !!emailError || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 hover:brightness-110'
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-dashed rounded-full animate-spin" />
                Se trimite…
              </>
            ) : (
              'Trimite link de resetare'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestResetPassword;
