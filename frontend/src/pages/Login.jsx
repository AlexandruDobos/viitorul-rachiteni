import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { BASE_URL } from '../utils/constants';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('message');
  const { checkAuth } = useContext(AuthContext);

  useEffect(() => {
    if (status === 'success') alert('Cont confirmat cu succes!');
    else if (status === 'error') alert(`Eroare: ${decodeURIComponent(message || '')}`);
  }, [status, message]);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Autentificare eșuată. Verifică datele.');
      await res.json();

      // protecție: apelează doar dacă e funcție; altfel fallback la reload
      if (typeof checkAuth === 'function') {
        await checkAuth();
      } else {
        window.location.replace('/'); // forțează AuthProvider să refacă statusul
        return;
      }
      navigate('/');
    } catch (error) {
      setErr(error?.message || 'Eroare la autentificare.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
    const apiOrigin = /^https?:\/\//.test(apiBase) ? new URL(apiBase).origin : '';
    window.location.href = `${apiOrigin}/oauth2/authorization/google`;
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-200">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 px-6 py-6 text-white">
          <h2 className="text-2xl font-extrabold tracking-tight">Login</h2>
          <p className="text-white/80 text-sm mt-1">Autentifică-te pentru a continua.</p>
        </div>

        <form onSubmit={handleLogin} className="px-6 py-6 space-y-4">
          {err && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
              {err}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email" type="email" placeholder="adresa@exemplu.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoComplete="email" required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Parolă</label>
            <input
              id="password" type="password" placeholder="Parola"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoComplete="current-password" required
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Ai uitat parola?{' '}
              <Link to="/request-reset" className="font-semibold text-blue-700 hover:underline">
                Reseteaz-o aici
              </Link>
            </span>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white
                       bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 hover:brightness-110
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (<><span className="w-4 h-4 border-2 border-white border-dashed rounded-full animate-spin" />Se conectează…</>) : 'Login'}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-gray-500">sau</span></div>
          </div>

          <button
            type="button" onClick={handleGoogleLogin}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white
                       px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            <svg viewBox="0 0 533.5 544.3" className="h-4 w-4" aria-hidden="true">
              <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272.1v95.3h147.1c-6.3 34.2-25.5 63.2-54.3 82.6v68h87.8c51.3-47.3 80.8-117 80.8-195.5z"/>
              <path fill="#34a853" d="M272.1 544.3c73.3 0 134.9-24.3 179.8-66.1l-87.8-68c-24.4 16.4-55.7 26.1-92 26.1-70.7 0-130.6-47.7-152-111.8h-91.3v70.3c44.5 88 136.1 149.5 243.3 149.5z"/>
              <path fill="#fbbc05" d="M120.1 324.5c-10.3-30.8-10.3-64.1 0-94.9V159.3h-91.3C10.3 197.7 0 240.3 0 272.1s10.3 74.4 28.8 112.8l91.3-60.4z"/>
              <path fill="#ea4335" d="M272.1 107.7c39.8-.6 78.1 14.9 106.9 43.8l79.6-79.6C404.9 25 342.9-.1 272.1 0 165 0 73.3 61.5 28.8 149.6l91.3 70.3c21.3-64.1 81.3-112.2 152-112.2z"/>
            </svg>
            Continuă cu Google
          </button>

          <p className="text-xs text-center text-gray-600">
            Nu ai cont?{' '}<Link to="/register" className="font-semibold text-blue-700 hover:underline">Înregistrează-te</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
