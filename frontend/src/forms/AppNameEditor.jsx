import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/constants';

const AppNameEditor = () => {
  const [appName, setAppName] = useState('');

  useEffect(() => {
    fetch(`${BASE_URL}/app/name`)
      .then(res => res.json())
      .then(data => setAppName(data.name || ''));
  }, []);

  const handleSave = async () => {
    await fetch(`${BASE_URL}/app/name`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: appName }),
    });
    alert('Numele aplicației a fost actualizat!');
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Editează numele aplicației</h2>
      <input
        value={appName}
        onChange={e => setAppName(e.target.value)}
        className="w-full border p-2 mb-4"
        placeholder="Nume aplicație"
      />
      <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">
        Salvează
      </button>
    </div>
  );
};

export default AppNameEditor;
