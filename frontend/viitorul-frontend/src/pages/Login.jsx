import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { BASE_URL } from '../utils/constants';
const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const message = searchParams.get('message');
  const { setIsAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (status === 'success') {
      alert('Cont confirmat cu succes!');
    } else if (status === 'error') {
      alert(`Eroare: ${decodeURIComponent(message || '')}`);
    }
  }, [status, message]);
  const handleLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();
      console.log('Login successful:', data);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };


  const handleGoogleLogin = () => {
    window.location.href = `${BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="flex justify-center mt-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm text-center">
        <h2 className="text-xl font-semibold mb-6">LOGIN</h2>

        <input
          type="email"
          placeholder="EMAIL"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-full focus:outline-none focus:ring"
        />
        <input
          type="password"
          placeholder="PASSWORD"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-full focus:outline-none focus:ring"
        />
        <p className="text-xs mt-2">
          AI UITAT PAROLA?{' '}
          <Link to="/request-reset" className="font-semibold underline">Reseteaz-o aici!</Link>
        </p>
        <button
          onClick={handleLogin}
          className="bg-black text-white px-6 py-2 mt-4 rounded-full mb-4 hover:bg-gray-800"
        >
          LOGIN
        </button>

        <p className="text-sm mb-2">Sau loghează-te cu:</p>
        <button
          onClick={handleGoogleLogin}
          className="border px-4 py-1 rounded bg-white hover:bg-gray-100 mb-4"
        >
          GOOGLE
        </button>

        <p className="text-xs">
          NU AI CONT?{' '}
          <Link to="/register" className="font-semibold underline">ÎNREGISTREAZĂ-TE</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;