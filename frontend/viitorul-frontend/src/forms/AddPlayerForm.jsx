import React, { useState } from 'react';
import { BASE_URL } from '../utils/constants';
const AddPlayerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    shirtNumber: '',
    profileImageUrl: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/api/app/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Jucător adăugat cu succes!');
        setFormData({ name: '', position: '', shirtNumber: '', profileImageUrl: '' });
      } else {
        const error = await res.text();
        alert('Eroare: ' + error);
      }
    } catch (err) {
      console.error(err);
      alert('Eroare la conectare.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 space-y-4">
      <input type="text" name="name" placeholder="Nume" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" />
      <input type="text" name="position" placeholder="Poziție" value={formData.position} onChange={handleChange} className="w-full p-2 border rounded" />
      <input type="number" name="shirtNumber" placeholder="Număr tricou" value={formData.shirtNumber} onChange={handleChange} className="w-full p-2 border rounded" />
      <input type="text" name="profileImageUrl" placeholder="Link poză" value={formData.profileImageUrl} onChange={handleChange} className="w-full p-2 border rounded" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Adaugă</button>
    </form>
  );
};

export default AddPlayerForm;
