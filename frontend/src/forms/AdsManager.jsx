import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/constants';

const AdsManager = () => {
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: '',
    imageUrl: '',
    link: '',
    position: 'left',
    orderIndex: 1,
    startDate: '',
    endDate: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchAds = async () => {
    const res = await fetch(`${BASE_URL}/app/ads`);
    const data = await res.json();
    setAds(data);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id
      ? `${BASE_URL}/app/ads/${form.id}`
      : `${BASE_URL}/app/ads`;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        orderIndex: parseInt(form.orderIndex, 10),
      }),
    });

    setForm({
      id: null,
      title: '',
      imageUrl: '',
      link: '',
      position: 'left',
      orderIndex: 1,
      startDate: '',
      endDate: '',
    });

    setSuccessMessage(form.id ? 'Reclamă actualizată cu succes!' : 'Reclamă adăugată cu succes!');
    setTimeout(() => setSuccessMessage(''), 3000);
    fetchAds();
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Sigur vrei să ștergi această reclamă?');
    if (!confirmDelete) return;
    setDeletingId(id);
    await fetch(`${BASE_URL}/app/ads/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    fetchAds();
  };

  const handleEdit = (ad) => {
    setForm({ ...ad });
  };

  const resetForm = () => {
    setForm({
      id: null,
      title: '',
      imageUrl: '',
      link: '',
      position: 'left',
      orderIndex: 1,
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Administrare Reclame</h2>

      {successMessage && (
        <div className="mb-4 text-green-600 font-medium">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input
          className="w-full border p-2"
          placeholder="Titlu"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="w-full border p-2"
          placeholder="Link imagine"
          value={form.imageUrl}
          onChange={e => setForm({ ...form, imageUrl: e.target.value })}
        />
        <input
          className="w-full border p-2"
          placeholder="Link destinație"
          value={form.link}
          onChange={e => setForm({ ...form, link: e.target.value })}
        />
        <select
          className="w-full border p-2"
          value={form.position}
          onChange={e => setForm({ ...form, position: e.target.value })}
        >
          <option value="left">Stânga</option>
          <option value="right">Dreapta</option>
        </select>
        <input
          className="w-full border p-2"
          type="number"
          placeholder="Ordine afișare (1, 2, 3...)"
          value={form.orderIndex}
          onChange={e => setForm({ ...form, orderIndex: parseInt(e.target.value) || 1 })}
        />
        <input
          className="w-full border p-2"
          type="date"
          value={form.startDate}
          onChange={e => setForm({ ...form, startDate: e.target.value })}
        />
        <input
          className="w-full border p-2"
          type="date"
          value={form.endDate}
          onChange={e => setForm({ ...form, endDate: e.target.value })}
        />

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {form.id ? 'Actualizează reclama' : 'Adaugă reclamă'}
          </button>
          {form.id && (
            <button
              type="button"
              className="text-gray-600 underline"
              onClick={resetForm}
            >
              Renunță la editare
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-2">
        {ads.map(ad => (
          <li
            key={ad.id}
            className="flex justify-between items-center border p-2 rounded"
          >
            <div>
              <strong>{ad.title}</strong> — {ad.position} — Ordine: {ad.orderIndex}
              <br />
              <small>{ad.startDate} → {ad.endDate}</small>
            </div>
            <div className="flex space-x-4">
              <button
                className="text-blue-600"
                onClick={() => handleEdit(ad)}
              >
                Editează
              </button>
              <button
                className="text-red-600"
                onClick={() => handleDelete(ad.id)}
                disabled={deletingId === ad.id}
              >
                {deletingId === ad.id ? 'Se șterge...' : 'Șterge'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdsManager;
