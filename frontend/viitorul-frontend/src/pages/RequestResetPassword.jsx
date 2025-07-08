import React, { useState } from 'react';
import { BASE_URL } from '../utils/constants';
const RequestResetPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async () => {
    setMessage('');
    setError('');

    if (!isValidEmail(email)) {
      setEmailError('Emailul nu este valid.');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/request-reset?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        redirect: 'manual'
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const text = await response.text();
      setMessage(text);
    } catch (err) {
      setError(err.message || 'Eroare trimitere email');
    }
  };

  return (
    <div className="flex justify-center mt-10">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm text-center">
        <h2 className="text-xl font-semibold mb-4">Resetează parola</h2>

        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {emailError && <p className="text-red-600 mb-2">{emailError}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            const val = e.target.value;
            setEmail(val);
            setEmailError(val && !isValidEmail(val) ? 'Emailul nu este valid.' : '');
          }}
          className="w-full mb-4 px-4 py-2 border rounded-full focus:outline-none focus:ring"
        />

        <button
          onClick={handleSubmit}
          disabled={!email || !!emailError}
          className={`px-6 py-2 rounded-full text-white ${!email || !!emailError ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}`}
        >
          Trimite link de resetare
        </button>
      </div>
    </div>
  );
};

export default RequestResetPassword;
