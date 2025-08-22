// AddMatchForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { BASE_URL } from '../utils/constants';
import MatchStatsEditor from '../components/MatchStatsEditor';

/** ---------- Small UI helpers ---------- */
const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Chip = ({ text, onRemove }) => (
  <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded border bg-gray-50">
    <span className="truncate">{text}</span>
    <button
      type="button"
      onClick={onRemove}
      className="text-xs px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700"
      aria-label="remove"
    >
      ×
    </button>
  </div>
);

/** ---------- ZERO STATS TEMPLATE (aliniat la DTO-ul tău) ---------- */
const ZERO_STATS_TEMPLATE = {
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCard: false,
};

/** ---------- INLINE LINE-UP EDITOR (no modal) ---------- */
const InlineLineupEditor = ({
  match,
  players,
  initialStarting = [],
  initialSubs = [],
  onCancel,
  onSaved,
}) => {
  const [query, setQuery] = useState('');
  const [starting, setStarting] = useState(initialStarting);
  const [subs, setSubs] = useState(initialSubs);
  const startersFull = starting.length >= 11;
  const canSave = starting.length === 11;

  useEffect(() => {
    setStarting(initialStarting || []);
    setSubs(initialSubs || []);
  }, [initialStarting, initialSubs]);

  const allPlayers = useMemo(
    () =>
      (players || []).map((p) => ({
        id: p.id,
        shirt: p.shirtNumber ?? '',
        name: p.name ?? '',
        label: `#${p.shirtNumber ?? '-'} ${p.name ?? ''}`.trim(),
      })),
    [players]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allPlayers;
    return allPlayers.filter(
      (p) => p.name.toLowerCase().includes(q) || String(p.shirt).toLowerCase().includes(q)
    );
  }, [allPlayers, query]);

  const inStarting = (id) => starting.includes(id);
  const inSubs = (id) => subs.includes(id);

  const addStarter = (id) => {
    if (inStarting(id) || startersFull) return;
    setStarting((prev) => [...prev, id]);
    setSubs((prev) => prev.filter((x) => x !== id));
  };

  const addReserve = (id) => {
    if (inSubs(id)) return;
    setSubs((prev) => [...prev, id]);
    setStarting((prev) => prev.filter((x) => x !== id));
  };

  const removeStarter = (id) => setStarting((prev) => prev.filter((x) => x !== id));
  const removeReserve = (id) => setSubs((prev) => prev.filter((x) => x !== id));

  /** Creează payload de zero pentru toți jucătorii (DTO: MatchPlayerStatDTO) */
  const buildZeroBatch = (starterIds, subIds) => {
    const mk = (pid) => ({ playerId: pid, ...ZERO_STATS_TEMPLATE });
    return [...starterIds.map(mk), ...subIds.map(mk)];
  };

  const save = async () => {
    if (!canSave) return;
    try {
      // 1) Salvează line-up în Match (PATCH)
      const patchRes = await fetch(`${BASE_URL}/api/app/matches/${match.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          startingPlayerIds: starting,
          substitutePlayerIds: subs,
        }),
      });
      if (!patchRes.ok) {
        const txt = await patchRes.text();
        alert('Eroare la salvarea line-up-ului: ' + txt);
        return;
      }

      // 2) Upsert batch stats cu valori 0 (titulari + rezerve)
      const batchPayload = buildZeroBatch(starting, subs);
      const batchRes = await fetch(`${BASE_URL}/api/app/matches/${match.id}/stats/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(batchPayload),
      });
      if (!batchRes.ok) {
        const txt = await batchRes.text();
        alert('Line-up salvat, dar a eșuat inserarea statisticilor implicite: ' + txt);
      }

      onSaved?.({ startingPlayerIds: starting, substitutePlayerIds: subs });
      onCancel?.();
    } catch (e) {
      console.error(e);
      alert('Eroare de rețea la salvare.');
    }
  };

  return (
    <div className="mt-4 border rounded-lg overflow-hidden">
      {/* Header inline */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 border-b bg-white">
        <div className="w-full md:w-1/2">
          <input
            type="text"
            placeholder="Caută jucători (nume sau număr)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 border rounded"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={`${
              starting.length === 11 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {starting.length}/11 Titulari
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-700">{subs.length} Rezerve</Badge>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50">
            Închide
          </button>
          <button
            onClick={save}
            disabled={!canSave}
            className={`px-4 py-2 rounded text-white ${
              canSave ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Salvează line-up
          </button>
        </div>
      </div>

      {/* Conținut — mobil: stivuit; desktop: 2 coloane */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Lista jucători */}
        <div className="border-r">
          <div className="flex items-center justify-between p-3 border-b bg-gray-50">
            <h4 className="font-medium">Toți jucătorii</h4>
            <Badge className="bg-gray-100 text-gray-700">{filtered.length}</Badge>
          </div>
          <div className="max-h-[420px] md:max-h-[560px] overflow-auto divide-y">
            {filtered.map((p) => {
              const isStarter = inStarting(p.id);
              const isSub = inSubs(p.id);
              return (
                <div key={p.id} className="flex items-center justify-between gap-2 p-2">
                  <div className="truncate">
                    <div className="font-medium truncate">{p.label}</div>
                    <div className="text-xs text-gray-500">
                      {isStarter ? 'Titular' : isSub ? 'Rezervă' : 'Disponibil'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addStarter(p.id)}
                      disabled={isStarter || startersFull}
                      className={`px-2 py-1 rounded text-sm text-white ${
                        isStarter
                          ? 'bg-green-400 cursor-not-allowed'
                          : startersFull
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      Titular
                    </button>
                    <button
                      type="button"
                      onClick={() => addReserve(p.id)}
                      disabled={isSub}
                      className={`px-2 py-1 rounded text-sm text-white ${
                        isSub ? 'bg-yellow-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
                      }`}
                    >
                      Rezervă
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-4 text-sm text-gray-500">Niciun jucător găsit.</div>
            )}
          </div>
        </div>

        {/* Selecții */}
        <div className="grid grid-rows-2">
          {/* Titulari */}
          <div className="border-b lg:border-b-0 lg:border-l">
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
              <h4 className="font-medium">Titulari</h4>
              <Badge
                className={`${
                  starting.length === 11 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {starting.length}/11
              </Badge>
            </div>
            <div className="p-3 space-y-2 max-h-[200px] md:max-h-[280px] overflow-auto">
              {starting.length === 0 && (
                <div className="text-sm text-gray-500">Niciun titular adăugat încă.</div>
              )}
              {starting.map((id) => {
                const p = allPlayers.find((x) => x.id === id);
                return <Chip key={id} text={p ? p.label : `ID ${id}`} onRemove={() => removeStarter(id)} />;
              })}
            </div>
            {startersFull && (
              <div className="px-3 pb-2 text-xs text-green-700">Ai atins limita de 11 titulari.</div>
            )}
          </div>

          {/* Rezerve */}
          <div className="lg:border-l">
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
              <h4 className="font-medium">Rezerve</h4>
              <Badge className="bg-yellow-100 text-yellow-700">{subs.length}</Badge>
            </div>
            <div className="p-3 space-y-2 max-h-[200px] md:max-h-[280px] overflow-auto">
              {subs.length === 0 && <div className="text-sm text-gray-500">Nicio rezervă adăugată încă.</div>}
              {subs.map((id) => {
                const p = allPlayers.find((x) => x.id === id);
                return <Chip key={id} text={p ? p.label : `ID ${id}`} onRemove={() => removeReserve(id)} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** ---------- MAIN ADD/EDIT + LIST ---------- */
const AddMatchForm = () => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);

  // NEW: competitions & seasons
  const [competitions, setCompetitions] = useState([]);
  const [seasons, setSeasons] = useState([]);

  const [editId, setEditId] = useState(null);
  const [selectedMatchIdForStats, setSelectedMatchIdForStats] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // lineup inline panel state
  const [openLineupMatchId, setOpenLineupMatchId] = useState(null);

  const [formData, setFormData] = useState({
    homeTeamId: '',
    awayTeamId: '',
    date: '',
    kickoffTime: '',
    location: '',
    competitionId: '', // NEW
    seasonId: '', // NEW
    homeGoals: '',
    awayGoals: '',
    matchReportUrl: '',
    notes: '',
    startingPlayerIds: [],
    substitutePlayerIds: [],
    active: true,
  });

  // -------- Fetch helpers --------
  const fetchTeams = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/app/teams`);
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      console.error('Eroare la încărcarea echipelor:', err);
    }
  };

  const fetchPlayers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/app/players`);
      const data = await res.json();
      setPlayers(data);
    } catch (err) {
      console.error('Eroare la încărcarea jucătorilor:', err);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/app/matches`);
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      console.error('Eroare la încărcarea meciurilor:', err);
    }
  };

  const fetchCompetitions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/app/competitions`);
      const data = await res.json();
      setCompetitions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Eroare competiții:', err);
      setCompetitions([]);
    }
  };

  const fetchSeasonsForCompetition = async (competitionId) => {
    if (!competitionId) {
      setSeasons([]);
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/app/competitions/${competitionId}/seasons`);
      const data = await res.json();
      setSeasons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Eroare sezoane:', err);
      setSeasons([]);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchPlayers();
    fetchMatches();
    fetchCompetitions();
  }, []);

  // când se schimbă competiția în formular, reîncarcă sezoanele
  useEffect(() => {
    if (formData.competitionId) {
      fetchSeasonsForCompetition(formData.competitionId);
    } else {
      setSeasons([]);
    }
  }, [formData.competitionId]);

  const resetForm = () => {
    setFormData({
      homeTeamId: '',
      awayTeamId: '',
      date: '',
      kickoffTime: '',
      location: '',
      competitionId: '',
      seasonId: '',
      homeGoals: '',
      awayGoals: '',
      matchReportUrl: '',
      notes: '',
      startingPlayerIds: [],
      substitutePlayerIds: [],
      active: true,
    });
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // IDs și scoruri în numeric unde e cazul
    const numericFields = new Set([
      'homeTeamId',
      'awayTeamId',
      'homeGoals',
      'awayGoals',
      'competitionId',
      'seasonId',
    ]);

    const parsedValue = numericFields.has(name)
      ? (value === '' ? '' : Number(value))
      : value;

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
      ...(name === 'competitionId' ? { seasonId: '' } : null), // reset sezon când schimb competiția
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId ? `${BASE_URL}/api/app/matches/${editId}` : `${BASE_URL}/api/app/matches`;
    const method = editId ? 'PUT' : 'POST';

    // Asigură payload corect (competitionId/seasonId, nu strings)
    const payload = {
      homeTeamId: formData.homeTeamId || null,
      awayTeamId: formData.awayTeamId || null,
      date: formData.date || null,
      kickoffTime: formData.kickoffTime || null,
      location: formData.location || null,
      competitionId: formData.competitionId || null,
      seasonId: formData.seasonId || null,
      homeGoals: formData.homeGoals === '' ? null : formData.homeGoals,
      awayGoals: formData.awayGoals === '' ? null : formData.awayGoals,
      matchReportUrl: formData.matchReportUrl || null,
      notes: formData.notes || null,
      startingPlayerIds: formData.startingPlayerIds || [],
      substitutePlayerIds: formData.substitutePlayerIds || [],
      active: formData.active,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(editId ? 'Meci actualizat!' : 'Meci adăugat!');
        fetchMatches();
        resetForm();
      } else {
        const errText = await res.text();
        alert('Eroare: ' + errText);
      }
    } catch (err) {
      console.error(err);
      alert('Eroare la conectare.');
    }
  };

  const handleEdit = (match) => {
    setFormData({
      homeTeamId: (match.homeTeamId ?? match.homeTeam?.id) || '',
      awayTeamId: (match.awayTeamId ?? match.awayTeam?.id) || '',
      date: match.date || '',
      kickoffTime: match.kickoffTime || '',
      location: match.location || '',
      competitionId: match.competitionId ?? match.competition?.id ?? '',
      seasonId: match.seasonId ?? match.season?.id ?? '',
      homeGoals: match.homeGoals ?? '',
      awayGoals: match.awayGoals ?? '',
      matchReportUrl: match.matchReportUrl || '',
      notes: match.notes || '',
      startingPlayerIds:
        match.startingPlayerIds || match.startingPlayers?.map((p) => p.id) || [],
      substitutePlayerIds:
        match.substitutePlayerIds || match.substitutePlayers?.map((p) => p.id) || [],
      active: match.active ?? true,
    });
    setEditId(match.id);

    // pre-încarcă sezoanele pentru competiția curentă
    if (match.competitionId ?? match.competition?.id) {
      fetchSeasonsForCompetition(match.competitionId ?? match.competition?.id);
    } else {
      setSeasons([]);
    }
  };

  const requestDelete = (id) => setConfirmDeleteId(id);

  const confirmDelete = async () => {
    const id = confirmDeleteId;
    if (!id) return;
    try {
      const res = await fetch(`${BASE_URL}/api/app/matches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmDeleteId(null);
        fetchMatches();
      } else {
        alert('Eroare la ștergere');
      }
    } catch (err) {
      console.error(err);
      alert('Eroare de rețea.');
    }
  };

  const byTeamId = (id) => teams.find((t) => t.id === id);

  const toggleLineup = (matchId) => {
    setOpenLineupMatchId((prev) => (prev === matchId ? null : matchId));
  };

  const onLineupSaved = ({ startingPlayerIds, substitutePlayerIds }, matchId) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, startingPlayerIds, substitutePlayerIds } : m
      )
    );
    fetchMatches();
  };

  return (
    <div className="space-y-6">
      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 md:p-8 space-y-4 w-full">
        <h2 className="text-xl font-semibold">{editId ? 'Editează Meci' : 'Adaugă Meci'}</h2>

        <select
          name="homeTeamId"
          value={formData.homeTeamId}
          onChange={handleChange}
          className="w-full p-3 h-11 border rounded"
        >
          <option value="">Selectează echipa gazdă</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <select
          name="awayTeamId"
          value={formData.awayTeamId}
          onChange={handleChange}
          className="w-full p-3 h-11 border rounded"
        >
          <option value="">Selectează echipa oaspete</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-3 h-11 border rounded"
          />
          <input
            name="kickoffTime"
            type="time"
            value={formData.kickoffTime}
            onChange={handleChange}
            className="w-full p-3 h-11 border rounded"
          />
        </div>

        <input
          name="location"
          placeholder="Locație"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-3 h-11 border rounded"
        />

        {/* NEW: Competition + Season dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="competitionId"
            value={formData.competitionId}
            onChange={handleChange}
            className="w-full p-3 h-11 border rounded"
          >
            <option value="">Selectează competiția</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            name="seasonId"
            value={formData.seasonId}
            onChange={handleChange}
            className="w-full p-3 h-11 border rounded"
            disabled={!formData.competitionId}
          >
            <option value="">{formData.competitionId ? 'Selectează sezonul' : 'Selectează întâi competiția'}</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="homeGoals"
            type="number"
            placeholder="Goluri echipa gazdă"
            value={formData.homeGoals}
            onChange={handleChange}
            className="w-full p-3 h-11 border rounded"
          />
          <input
            name="awayGoals"
            type="number"
            placeholder="Goluri echipa oaspete"
            value={formData.awayGoals}
            onChange={handleChange}
            className="w-full p-3 h-11 border rounded"
          />
        </div>

        <input
          name="matchReportUrl"
          placeholder="Link articol presă"
          value={formData.matchReportUrl}
          onChange={handleChange}
          className="w-full p-3 h-11 border rounded"
        />
        <textarea
          name="notes"
          placeholder="Observații"
          value={formData.notes}
          onChange={handleChange}
          className="w-full p-3 border rounded min-h-[88px]"
        />

        <div className="pt-2">
          <button type="submit" className="w-full sm:w-auto bg-green-600 text-white px-5 py-2.5 rounded">
            {editId ? 'Salvează modificările' : 'Adaugă Meci'}
          </button>
        </div>
      </form>

      {/* MATCH LIST */}
      <div className="bg-white shadow rounded-xl p-6 md:p-8 w-full">
        <h3 className="text-lg font-semibold mb-4">Meciuri existente</h3>
        <ul className="space-y-5">
          {matches
            .filter((m) => m.active)
            .map((match) => {
              const home = byTeamId(match.homeTeamId ?? match.homeTeam?.id);
              const away = byTeamId(match.awayTeamId ?? match.awayTeam?.id);
              const isLineupOpen = openLineupMatchId === match.id;

              return (
                <li key={match.id} className="border rounded-lg">
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          {home?.logo && (
                            <img src={home.logo} alt={home?.name || 'home'} className="w-8 h-8 object-contain" />
                          )}
                          <span className="font-medium">{home?.name || `Echipa #${match.homeTeamId}`}</span>
                        </div>
                        <span className="text-sm text-gray-500">vs</span>
                        <div className="flex items-center gap-2">
                          {away?.logo && (
                            <img src={away.logo} alt={away?.name || 'away'} className="w-8 h-8 object-contain" />
                          )}
                          <span className="font-medium">{away?.name || `Echipa #${match.awayTeamId}`}</span>
                        </div>
                      </div>

                      <div className="text-gray-700 text-sm">
                        <div className="font-semibold">{match.homeGoals ?? '-'} - {match.awayGoals ?? '-'}</div>
                        <div className="text-gray-500">{match.date} {match.kickoffTime}</div>
                        {/* NEW: afișează competiția + sezonul dacă sunt disponibile */}
                        {(match.competitionName || match.seasonLabel) && (
                          <div className="text-gray-500">
                            {match.competitionName || 'Competiție'}{match.seasonLabel ? ` • ${match.seasonLabel}` : ''}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:justify-center">
                        <button
                          onClick={() => handleEdit(match)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                        >
                          Editează
                        </button>

                        <button
                          onClick={() =>
                            setSelectedMatchIdForStats(
                              selectedMatchIdForStats === match.id ? null : match.id
                            )
                          }
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm"
                        >
                          Statistici
                        </button>

                        <button
                          onClick={() => toggleLineup(match.id)}
                          className={`text-white px-4 py-2 rounded text-sm ${
                            isLineupOpen ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'
                          }`}
                        >
                          {isLineupOpen ? 'Ascunde Line-up' : 'Line-up'}
                        </button>

                        <button
                          onClick={() => requestDelete(match.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                        >
                          Șterge
                        </button>
                      </div>
                    </div>

                    {selectedMatchIdForStats === match.id && (
                      <div className="mt-4">
                        <MatchStatsEditor matchId={match.id} />
                      </div>
                    )}

                    {/* INLINE LINEUP PANEL */}
                    {isLineupOpen && (
                      <InlineLineupEditor
                        match={match}
                        players={players}
                        initialStarting={
                          match.startingPlayerIds || match.startingPlayers?.map((p) => p.id) || []
                        }
                        initialSubs={
                          match.substitutePlayerIds || match.substitutePlayers?.map((p) => p.id) || []
                        }
                        onCancel={() => toggleLineup(match.id)}
                        onSaved={(payload) => onLineupSaved(payload, match.id)}
                      />
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </div>

      {/* DELETE CONFIRMATION (modal simplu) */}
      {confirmDeleteId &&
        (() => {
          const m = matches.find((x) => x.id === confirmDeleteId);
          const home = byTeamId(m?.homeTeamId ?? m?.homeTeam?.id);
          const away = byTeamId(m?.awayTeamId ?? m?.awayTeam?.id);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDeleteId(null)} />
              <div className="relative bg-white w-[90%] max-w-md rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-semibold mb-3">Ești sigur că vrei să ștergi?</h4>
                {m && (
                  <div className="mb-4 text-sm">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      {home?.logo && (
                        <img src={home.logo} alt={home?.name} className="w-6 h-6 object-contain" />
                      )}
                      <span className="font-medium">{home?.name || `Echipa #${m.homeTeamId}`}</span>
                      <span className="text-gray-400">vs</span>
                      {away?.logo && (
                        <img src={away.logo} alt={away?.name} className="w-6 h-6 object-contain" />
                      )}
                      <span className="font-medium">{away?.name || `Echipa #${m.awayTeamId}`}</span>
                    </div>
                    <div className="text-center text-gray-600">
                      Scor: <strong>{m.homeGoals ?? '-'} - {m.awayGoals ?? '-'}</strong>
                      <br />
                      {m.date} {m.kickoffTime}
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-4 py-2 rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Anulează
                  </button>
                  <button onClick={confirmDelete} className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white">
                    Da, șterge
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default AddMatchForm;
