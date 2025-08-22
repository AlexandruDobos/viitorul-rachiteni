import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/constants';

const AddPlayerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    shirtNumber: '',
    profileImageUrl: '',
  });
  const [players, setPlayers] = useState([]);
  const [editId, setEditId] = useState(null);

  const fetchPlayers = async () => {
    const res = await fetch(`${BASE_URL}/api/app/players`);
    const data = await res.json();
    setPlayers(data);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `${BASE_URL}/api/app/players/${editId}`
      : `${BASE_URL}/api/app/players`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      fetchPlayers();
      setFormData({ name: '', position: '', shirtNumber: '', profileImageUrl: '' });
      setEditId(null);
    } else {
      alert('Eroare la salvare');
    }
  };

  const handleEdit = (player) => {
    setFormData({
      name: player.name,
      position: player.position,
      shirtNumber: player.shirtNumber,
      profileImageUrl: player.profileImageUrl,
    });
    setEditId(player.id);
  };

  const handleDelete = async (id) => {
    if (confirm('Sigur vrei să ștergi acest jucător?')) {
      const res = await fetch(`${BASE_URL}/api/app/players/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchPlayers();
      else alert('Eroare la ștergere');
    }
  };

  return (
    <div className="space-y-6">
      {/* FORMULAR */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          {editId ? 'Editează Jucător' : 'Adaugă Jucător'}
        </h2>
        <input name="name" placeholder="Nume" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" />
        <select name="position" value={formData.position} onChange={handleChange} className="w-full border p-2 rounded">
          <option value="">Selectează poziția</option>
          <option value="portar">Portar</option>
          <option value="fundas">Fundaș</option>
          <option value="mijlocas">Mijlocaș</option>
          <option value="atacant">Atacant</option>
        </select>
        <input name="shirtNumber" type="number" placeholder="Număr tricou" value={formData.shirtNumber} onChange={handleChange} className="w-full border p-2 rounded" />
        <input name="profileImageUrl" placeholder="Link poză" value={formData.profileImageUrl} onChange={handleChange} className="w-full border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editId ? 'Salvează modificările' : 'Adaugă'}
        </button>
      </form>

      {/* LISTĂ */}
      <div className="bg-white shadow rounded p-4">
        <h3 className="text-lg font-semibold mb-2">Jucători existenți</h3>
        <ul className="space-y-2">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between border p-2 rounded"
            >
              <div className="flex items-center gap-3">
                <img
                  src={player.profileImageUrl || '/unknown-player.png'}
                  alt={player.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-sm text-gray-600">{player.position} #{player.shirtNumber}</div>
                </div>
              </div>
              <div className="space-x-2">
                <button onClick={() => handleEdit(player)} className="text-blue-600 text-sm">Edit</button>
                <button onClick={() => handleDelete(player.id)} className="text-red-600 text-sm">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddPlayerForm;
