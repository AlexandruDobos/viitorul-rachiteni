import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/constants';

const Starting11Selector = ({ matchId, onSave }) => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch(`${BASE_URL}/app/players`);
        const data = await res.json();
        setPlayers(data);
      } catch (err) {
        console.error('Eroare la încărcarea jucătorilor:', err);
      }
    };

    fetchPlayers();
  }, []);

  const togglePlayer = (id) => {
    if (selectedPlayerIds.includes(id)) {
      setSelectedPlayerIds(selectedPlayerIds.filter(pid => pid !== id));
    } else {
      if (selectedPlayerIds.length >= 11) {
        alert('Poți selecta doar 11 jucători titulari.');
        return;
      }
      setSelectedPlayerIds([...selectedPlayerIds, id]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/app/matches/${matchId}/starting-players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerIds: selectedPlayerIds })
      });

      if (res.ok) {
        alert('Titularii au fost salvați cu succes.');
        onSave?.();
      } else {
        alert('Eroare la salvare.');
      }
    } catch (error) {
      console.error('Eroare la salvare:', error);
      alert('Eroare de rețea.');
    } finally {
      setSaving(false);
    }
  };

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Caută jucători..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded shadow-sm"
        />
      </div>

      <p className="mb-2 font-semibold">
        Titulari selectați: {selectedPlayerIds.length} / 11
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            onClick={() => togglePlayer(player.id)}
            className={`cursor-pointer p-2 border rounded-md shadow-sm transition-all duration-200
              ${selectedPlayerIds.includes(player.id)
              ? 'bg-blue-100 border-blue-600 text-blue-800 font-semibold'
              : 'bg-white hover:bg-gray-100'}`}
          >
            #{player.shirtNumber || '-'} {player.name}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleSave}
          disabled={saving || selectedPlayerIds.length !== 11}
          className="bg-black text-white py-2 px-6 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? 'Se salvează...' : 'Salvează primul 11'}
        </button>
      </div>
    </div>
  );
};

export default Starting11Selector;
