import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/constants';

const AddTeamForm = () => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [teams, setTeams] = useState([]);
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);

  const fetchTeams = async () => {
    const res = await fetch(`${BASE_URL}/app/teams`);
    const data = await res.json();
    setTeams(data);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/app/teams${editId ? '/' + editId : ''}`, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, logo }),
      });

      if (!res.ok) throw new Error('Failed to save team');

      const data = await res.json();
      setMessage(`✅ Echipa "${data.name}" a fost ${editId ? 'modificată' : 'adăugată'} cu succes.`);
      setName('');
      setLogo('');
      setEditId(null);
      fetchTeams();
    } catch (err) {
      setMessage('❌ Eroare la salvare echipă.');
      console.error(err);
    }
  };

  const handleEdit = (team) => {
    setName(team.name);
    setLogo(team.logo);
    setEditId(team.id);
  };

  const handleDelete = async (id) => {
    if (confirm('Sigur vrei să ștergi această echipă?')) {
      try {
        const res = await fetch(`${BASE_URL}/app/teams/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        fetchTeams();
      } catch {
        alert('❌ Eroare la ștergere echipă.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4 text-center">
          {editId ? 'Editează Echipă' : 'Adaugă Echipă'}
        </h2>

        {message && <p className="mb-4 text-sm text-center">{message}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nume echipă</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">URL Logo</label>
          <input
            type="text"
            value={logo}
            onChange={e => setLogo(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
        >
          {editId ? 'Salvează modificările' : 'Salvează echipa'}
        </button>
      </form>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Echipe existente</h3>
        <ul className="space-y-2">
          {teams.map((team) => (
            <li key={team.id} className="flex justify-between items-center border p-2 rounded">
              <div className="flex items-center gap-2">
                <img
                  src={team.logo || '/unknown-team-logo.png'}
                  alt="Logo echipă"
                  className="w-6 h-6 object-contain rounded"
                />
                <strong>{team.name}</strong>
              </div>
              <div className="space-x-2">
                <button onClick={() => handleEdit(team)} className="text-blue-600 text-sm">Edit</button>
                <button onClick={() => handleDelete(team.id)} className="text-red-600 text-sm">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddTeamForm;