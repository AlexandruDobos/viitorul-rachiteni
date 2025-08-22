// src/forms/CompetitionsManager.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { BASE_URL } from '../utils/constants';

const Chip = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border ${className}`}>
    {children}
  </span>
);

const IconBtn = ({ title, onClick, className = '', children, disabled }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center px-2 py-1 rounded border text-xs hover:bg-gray-50 disabled:opacity-60 ${className}`}
  >
    {children}
  </button>
);

const CompetitionsManager = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // add competition
  const [newName, setNewName] = useState('');

  // edit competition
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [busyId, setBusyId] = useState(null); // block spam on one row

  // seasons: add input per competition
  const [seasonAddInput, setSeasonAddInput] = useState({}); // { [competitionId]: "2024/2025" }
  const [seasonBusyKey, setSeasonBusyKey] = useState(''); // `${compId}:${seasonId||'new'}`

  // seasons: edit inline
  const [seasonEditing, setSeasonEditing] = useState({
    competitionId: null,
    seasonId: null,
    label: ''
  });

  // optional search
  const [q, setQ] = useState('');

  const fetchCompetitions = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(`${BASE_URL}/api/app/competitions`, { credentials: 'include' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCompetitions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr('Eroare la încărcarea competițiilor.');
      setCompetitions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return competitions;
    return competitions.filter(c => (c.name || '').toLowerCase().includes(term));
  }, [competitions, q]);

  // ---------- COMPETITIONS CRUD ----------
  const addCompetition = async (e) => {
    e?.preventDefault?.();
    const name = newName.trim();
    if (!name) return;
    try {
      setBusyId('new');
      const res = await fetch(`${BASE_URL}/api/app/competitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(await res.text());
      setNewName('');
      await fetchCompetitions();
    } catch (e) {
      console.error(e);
      alert('Eroare la adăugare competiție.');
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (comp) => {
    setEditingId(comp.id);
    setEditingName(comp.name || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = async (id) => {
    const name = editingName.trim();
    if (!name) return;
    try {
      setBusyId(id);
      const res = await fetch(`${BASE_URL}/api/app/competitions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(await res.text());
      cancelEdit();
      await fetchCompetitions();
    } catch (e) {
      console.error(e);
      alert('Eroare la salvare competiție.');
    } finally {
      setBusyId(null);
    }
  };

  const deactivate = async (id) => {
    if (!confirm('Ești sigur că vrei să dezactivezi această competiție?')) return;
    try {
      setBusyId(id);
      const res = await fetch(`${BASE_URL}/api/app/competitions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchCompetitions();
    } catch (e) {
      console.error(e);
      alert('Eroare la dezactivare competiție.');
    } finally {
      setBusyId(null);
    }
  };

  // ---------- SEASONS CRUD ----------
  const addSeason = async (competitionId) => {
    const label = (seasonAddInput[competitionId] || '').trim();
    if (!label) return;
    const busyKey = `${competitionId}:new`;
    try {
      setSeasonBusyKey(busyKey);
      const res = await fetch(`${BASE_URL}/api/app/competitions/${competitionId}/seasons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ label }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSeasonAddInput(prev => ({ ...prev, [competitionId]: '' }));
      await fetchCompetitions();
    } catch (e) {
      console.error(e);
      alert('Eroare la adăugare sezon.');
    } finally {
      setSeasonBusyKey('');
    }
  };

  const startEditSeason = (competitionId, season) => {
    setSeasonEditing({
      competitionId,
      seasonId: season.id,
      label: season.label || ''
    });
  };

  const cancelEditSeason = () => {
    setSeasonEditing({ competitionId: null, seasonId: null, label: '' });
  };

  const saveEditSeason = async () => {
    const { competitionId, seasonId, label } = seasonEditing;
    const trimmed = (label || '').trim();
    if (!competitionId || !seasonId || !trimmed) return;
    const busyKey = `${competitionId}:${seasonId}`;
    try {
      setSeasonBusyKey(busyKey);
      const res = await fetch(`${BASE_URL}/api/app/competitions/${competitionId}/seasons/${seasonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ label: trimmed }),
      });
      if (!res.ok) throw new Error(await res.text());
      cancelEditSeason();
      await fetchCompetitions();
    } catch (e) {
      console.error(e);
      alert('Eroare la salvare sezon.');
    } finally {
      setSeasonBusyKey('');
    }
  };

  const deleteSeason = async (competitionId, seasonId) => {
    if (!confirm('Ștergi / dezactivezi sezonul?')) return;
    const busyKey = `${competitionId}:${seasonId}`;
    try {
      setSeasonBusyKey(busyKey);
      const res = await fetch(`${BASE_URL}/api/app/competitions/${competitionId}/seasons/${seasonId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchCompetitions();
    } catch (e) {
      console.error(e);
      alert('Eroare la ștergere sezon.');
    } finally {
      setSeasonBusyKey('');
    }
  };

  const isSeasonEditing = (competitionId, seasonId) =>
    seasonEditing.competitionId === competitionId && seasonEditing.seasonId === seasonId;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-xl p-5">
        <h2 className="text-xl font-semibold mb-4">Competiții</h2>

        {/* Add competition */}
        <form onSubmit={addCompetition} className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Nume competiție (ex: Liga V-a, Cupa României)"
            className="flex-1 p-3 border rounded"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            type="submit"
            disabled={busyId === 'new'}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            Adaugă
          </button>
        </form>

        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Caută competiție..."
            className="w-full p-3 border rounded"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-24">
            <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : err ? (
          <p className="text-red-600">{err}</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">Nu există competiții.</p>
        ) : (
          <ul className="space-y-4">
            {filtered.map((c) => {
              const isEditing = editingId === c.id;
              const seasons = Array.isArray(c.seasons) ? c.seasons : [];
              const addVal = seasonAddInput[c.id] || '';
              return (
                <li key={c.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex flex-col gap-4">
                    {/* Top row: name + actions */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            className="w-full md:w-80 p-2 border rounded"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <h3 className="text-lg font-semibold">
                            {c.name}
                            {!c.active && (
                              <span className="ml-2 text-xs rounded px-2 py-1 bg-gray-100 text-gray-600 border">inactiv</span>
                            )}
                          </h3>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(c.id)}
                              disabled={busyId === c.id}
                              className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                            >
                              Salvează
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-2 rounded border"
                            >
                              Renunță
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(c)}
                              className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Editează
                            </button>
                            <button
                              onClick={() => deactivate(c.id)}
                              disabled={busyId === c.id}
                              className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
                            >
                              Dezactivează
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Seasons list + inline add/edit */}
                    <div>
                      <div className="text-sm font-medium mb-2">Sezoane</div>

                      {seasons.length === 0 && (
                        <div className="text-xs text-gray-500 mb-2">Fără sezoane</div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {seasons.map((s) => {
                          const editingThis = isSeasonEditing(c.id, s.id);
                          const thisBusyKey = `${c.id}:${s.id}`;
                          const busy = seasonBusyKey === thisBusyKey;

                          return (
                            <div key={s.id} className="flex items-center gap-2">
                              {editingThis ? (
                                <>
                                  <input
                                    className="px-2 py-1 border rounded text-xs"
                                    value={seasonEditing.label}
                                    onChange={(e) =>
                                      setSeasonEditing(prev => ({ ...prev, label: e.target.value }))
                                    }
                                    autoFocus
                                  />
                                  <IconBtn title="Salvează" onClick={saveEditSeason} disabled={busy}>
                                    💾
                                  </IconBtn>
                                  <IconBtn title="Renunță" onClick={cancelEditSeason}>
                                    ✖
                                  </IconBtn>
                                </>
                              ) : (
                                <>
                                  <Chip className="bg-gray-100">{s.label}</Chip>
                                  <IconBtn
                                    title="Editează sezon"
                                    onClick={() => startEditSeason(c.id, s)}
                                  >
                                    ✎
                                  </IconBtn>
                                  <IconBtn
                                    title="Șterge sezon"
                                    onClick={() => deleteSeason(c.id, s.id)}
                                    disabled={busy}
                                    className="border-red-200 text-red-700"
                                  >
                                    🗑
                                  </IconBtn>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Season inline */}
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="Ex: 2024/2025"
                          className="p-2 border rounded text-sm"
                          value={addVal}
                          onChange={(e) =>
                            setSeasonAddInput(prev => ({ ...prev, [c.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addSeason(c.id);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addSeason(c.id)}
                          disabled={seasonBusyKey === `${c.id}:new`}
                          className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm disabled:opacity-60"
                        >
                          Adaugă sezon
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CompetitionsManager;
