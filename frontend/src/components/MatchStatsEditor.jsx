// MatchStatsEditor.jsx
import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/constants';

const FieldNumber = ({ value, onChange, name, min = 0 }) => (
  <input
    type="number"
    inputMode="numeric"
    pattern="[0-9]*"
    min={min}
    step={1}
    value={value ?? ''}
    onChange={onChange}
    name={name}
    className="w-16 md:w-14 border rounded px-2 py-1 text-center h-9"
  />
);

const MatchStatsEditor = ({ matchId }) => {
  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState({});
  // keep only one card open at a time on mobile
  const [openPlayerId, setOpenPlayerId] = useState(null);

  // 🔎 search state
  const [query, setQuery] = useState('');

  // ✅ feedback banner state (persistent)
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: string }

  useEffect(() => {
    fetch(`${BASE_URL}/app/players`)
      .then(res => res.json())
      .then(setPlayers)
      .catch(console.error);

    fetch(`${BASE_URL}/app/matches/player-stats/${matchId}`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) {
          console.error('Date invalide primite:', data);
          return;
        }
        const mapped = {};
        data.forEach(s => {
          mapped[s.playerId] = s;
        });
        setStats(mapped);
      })
      .catch(console.error);
  }, [matchId]);

  const handleChange = (playerId, field, value) => {
    const parsed = field === 'redCard' ? value : parseInt(value || 0, 10);
    setStats(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], playerId, matchId, [field]: parsed },
    }));
  };

  const handleSave = async (playerId) => {
    const data =
      stats[playerId] ?? { playerId, matchId, goals: 0, assists: 0, yellowCards: 0, redCard: false };
    try {
      const res = await fetch(`${BASE_URL}/app/matches/${matchId}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Fail save');

      // success feedback (persistent)
      const p = players.find(pl => pl.id === playerId);
      setFeedback({
        type: 'success',
        text: `Statistici salvate${p?.name ? ` pentru ${p.name}` : ''}.`,
      });
      window?.navigator?.vibrate?.(40);
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'error',
        text: 'Eroare la salvare. Încearcă din nou.',
      });
    }
    // ❌ eliminat auto-hide — mesajul rămâne vizibil până la următorul save
  };

  const togglePlayer = (id) => {
    setOpenPlayerId(prev => (prev === id ? null : id));
  };

  // 🔎 apply simple case-insensitive filter by name
  const filteredPlayers = players.filter(p =>
    (p?.name || '').toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="bg-gray-50 rounded-xl p-4 my-6 border">
      <h3 className="text-base md:text-lg font-semibold mb-4">Statistici jucători</h3>

      {/* ✅ feedback banner (persistent) */}
      {feedback && (
        <div
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${
            feedback.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
          role="status"
          aria-live="polite"
        >
          {feedback.text}
        </div>
      )}

      {/* 🔎 Search input */}
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută jucător după nume…"
          className="w-full md:w-80 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* MOBILE: accordion – fields open only when header tapped */}
      <div className="md:hidden space-y-3">
        {filteredPlayers.map((player) => {
          const s = stats[player.id] || {};
          const isOpen = openPlayerId === player.id;
          return (
            <div key={player.id} className="bg-white rounded-lg border shadow-sm">
              {/* Header (tap to expand/collapse) */}
              <button
                type="button"
                onClick={() => togglePlayer(player.id)}
                className="w-full flex items-center justify-between gap-3 p-3"
                aria-expanded={isOpen}
                aria-controls={`player-panel-${player.id}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-600">
                    {player.shirtNumber ?? '-'}
                  </div>
                  <div className="truncate text-left">
                    <div className="font-medium truncate">{player.name}</div>
                  </div>
                </div>
                <span className="shrink-0 text-gray-500">{isOpen ? '▾' : '▸'}</span>
              </button>

              {/* Collapsible content */}
              {isOpen && (
                <div
                  id={`player-panel-${player.id}`}
                  className="px-3 pb-3 pt-1 border-t"
                >
                  <div className="grid grid-cols-1 gap-3 mt-1">
                    <label className="text-sm flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                      <span className="text-gray-600 mr-2">Goluri</span>
                      <FieldNumber
                        value={s.goals}
                        onChange={e => handleChange(player.id, 'goals', e.target.value)}
                        name="goals"
                      />
                    </label>

                    <label className="text-sm flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                      <span className="text-gray-600 mr-2">Assisturi</span>
                      <FieldNumber
                        value={s.assists}
                        onChange={e => handleChange(player.id, 'assists', e.target.value)}
                        name="assists"
                      />
                    </label>

                    <label className="text-sm flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                      <span className="text-gray-600 mr-2">Galbene</span>
                      <FieldNumber
                        value={s.yellowCards}
                        onChange={e => handleChange(player.id, 'yellowCards', e.target.value)}
                        name="yellowCards"
                      />
                    </label>

                    <label className="text-sm flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                      <span className="text-gray-600 mr-2">Roșu</span>
                      <input
                        type="checkbox"
                        checked={!!s.redCard}
                        onChange={e => handleChange(player.id, 'redCard', e.target.checked)}
                        className="h-5 w-5"
                        aria-label="Cartonaș roșu"
                      />
                    </label>
                  </div>

                  <button
                    onClick={() => handleSave(player.id)}
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
                  >
                    Salvează
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DESKTOP/TABLET: tabel (md și mai sus) */}
      <div className="hidden md:block">
        <div className="overflow-x-auto -mx-2 md:mx-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-white">
                <th className="text-left px-3 py-2 w-10">#</th>
                <th className="text-left px-3 py-2">Nume</th>
                <th className="text-center px-3 py-2">Goluri</th>
                <th className="text-center px-3 py-2">Assisturi</th>
                <th className="text-center px-3 py-2">Galbene</th>
                <th className="text-center px-3 py-2">Roșu</th>
                <th className="px-3 py-2 w-28" />
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map(player => {
                const s = stats[player.id] || {};
                return (
                  <tr key={player.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-600">{player.shirtNumber}</td>
                    <td className="px-3 py-2 font-medium">{player.name}</td>
                    <td className="px-3 py-2 text-center">
                      <FieldNumber
                        value={s.goals}
                        onChange={e => handleChange(player.id, 'goals', e.target.value)}
                        name="goals"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <FieldNumber
                        value={s.assists}
                        onChange={e => handleChange(player.id, 'assists', e.target.value)}
                        name="assists"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <FieldNumber
                        value={s.yellowCards}
                        onChange={e => handleChange(player.id, 'yellowCards', e.target.value)}
                        name="yellowCards"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={!!s.redCard}
                        onChange={e => handleChange(player.id, 'redCard', e.target.checked)}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleSave(player.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded"
                      >
                        Salvează
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MatchStatsEditor;
