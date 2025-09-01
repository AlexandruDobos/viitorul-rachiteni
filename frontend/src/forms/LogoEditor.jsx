import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/constants';

const LogoEditor = () => {
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    fetch(`${BASE_URL}/app/logo`)
      .then(res => res.json())
      .then(data => setLogoUrl(data.url || ''));
  }, []);

  const handleSave = async () => {
    await fetch(`${BASE_URL}/app/logo`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: logoUrl }),
    });
    alert('Logo actualizat!');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Editează logo-ul aplicației</h2>
      <input
        value={logoUrl}
        onChange={e => setLogoUrl(e.target.value)}
        className="w-full border p-2 mb-4"
        placeholder="URL logo"
      />
      <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">
        Salvează
      </button>
    </div>
  );
};

export default LogoEditor;
