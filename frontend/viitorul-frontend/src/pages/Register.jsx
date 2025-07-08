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
    console.log(name, email, password)
    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
    }
  };

  return (
    <div className="flex justify-center mt-4">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center">
        <h2 className="text-xl font-semibold mb-6">ÎNREGISTRARE</h2>

        <input
          type="text"
          placeholder="NUME"
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
          className="w-full mb-1 px-4 py-2 border rounded-full focus:outline-none focus:ring"
        />
        {nameError && <p className="text-red-500 text-sm mb-2">{nameError}</p>}

        <input
          type="email"
          placeholder="EMAIL"
          value={email}
          onChange={(e) => {
            const val = e.target.value;
            setEmail(val);
            setEmailError(val && !isValidEmail(val) ? 'Emailul nu este valid.' : '');
          }}
          className="w-full mb-1 px-4 py-2 border rounded-full focus:outline-none focus:ring"
        />
        {emailError && <p className="text-red-500 text-sm mb-2">{emailError}</p>}

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="PAROLĂ"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-1 px-4 py-2 border rounded-full focus:outline-none focus:ring pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-sm text-gray-600"
          >
            {showPassword ? 'Ascunde' : 'Afișează'}
          </button>
        </div>
        {password && !isPasswordStrong(password) && (
          <p className="text-red-600 text-sm mb-2">Parola nu îndeplinește cerințele</p>
        )}

        <input
          type="password"
          placeholder="CONFIRMĂ PAROLA"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-full focus:outline-none focus:ring"
        />

        <p className="text-xs text-left mb-4 text-gray-600">
          🔒 Parola trebuie să aibă minim 8 caractere, o literă mare, una mică, o cifră și un simbol.
        </p>

        <button
          type="submit"
          disabled={!isFormValid()}
          className={`px-6 py-2 rounded-full mb-4 text-white ${isFormValid() ? 'bg-black hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'
            }`}
        >
          ÎNREGISTREAZĂ-TE
        </button>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}

        <p className="text-xs">
          AI DEJA CONT?{' '}
          <Link to="/login" className="font-semibold underline">
            AUTENTIFICĂ-TE
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
