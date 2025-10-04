// AddMatchForm.jsx — refined UI, same API contracts (with search + pagination on list, scroll-to-top on edit)
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BASE_URL } from '../utils/constants';
import MatchStatsEditor from '../components/MatchStatsEditor';

/** ------------------ Small UI helpers ------------------ */
const Badge = ({ children, className = '' }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ring-black/5 ${className}`}
  >
    {children}
  </span>
);

const Chip = ({ text, onRemove, title }) => (
  <div className="group flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border bg-gray-50 hover:bg-gray-100 transition">
    <span className="truncate" title={title || text}>{text}</span>
    <button
      type="button"
      onClick={onRemove}
      className="text-xs px-2 py-0.5 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      aria-label="remove"
    >
      ×
    </button>
  </div>
);

const Label = ({ children, htmlFor, hint }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-900">
    {children}
    {hint && <span className="ml-2 text-gray-500 font-normal">{hint}</span>}
  </label>
);

const Input = ({ id, className = '', ...props }) => (
  <input
    id={id}
    className={`w-full h-11 px-3 border rounded-xl bg-white/90 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition ${className}`}
    {...props}
  />
);

const Select = ({ id, className = '', children, ...props }) => (
  <select
    id={id}
    className={`w-full h-11 px-3 border rounded-xl bg-white/90 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition ${className}`}
    {...props}
  >
    {children}
  </select>
);

const SectionCard = ({ title, subtitle, children, footer, className = '' }) => (
  <div className={`bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl ring-1 ring-gray-100 ${className}`}>
    <div className="border-b rounded-t-2xl p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-white/90 mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
    {footer && <div className="border-t p-4 bg-gray-50 rounded-b-2xl">{footer}</div>}
  </div>
);

/** ---------- ZERO STATS TEMPLATE ---------- */
const ZERO_STATS_TEMPLATE = { goals: 0, assists: 0, yellowCards: 0, redCard: false };

/** ------------------ Inline Lineup Editor (nemodificat) ------------------ */
const InlineLineupEditor = ({ match, players, initialStarting = [], initialSubs = [], onCancel, onSaved }) => {
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
    () => (players || []).map((p) => ({
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
    return allPlayers.filter((p) => p.name.toLowerCase().includes(q) || String(p.shirt).toLowerCase().includes(q));
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

  const buildZeroBatch = (starterIds, subIds) => {
    const mk = (pid) => ({ playerId: pid, ...ZERO_STATS_TEMPLATE });
    return [...starterIds.map(mk), ...subIds.map(mk)];
  };

  const save = async () => {
    if (!canSave) return;
    try {
      const patchRes = await fetch(`${BASE_URL}/app/matches/${match.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ startingPlayerIds: starting, substitutePlayerIds: subs }),
      });
      if (!patchRes.ok) {
        const txt = await patchRes.text();
        alert('Eroare la salvarea line-up-ului: ' + txt);
        return;
      }

      const batchPayload = buildZeroBatch(starting, subs);
      const batchRes = await fetch(`${BASE_URL}/app/matches/${match.id}/stats/batch`, {
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
    <div className="mt-4 border rounded-2xl overflow-hidden ring-1 ring-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 border-b bg-gradient-to-r from-blue-700 to-indigo-600">
        <div className="w-full md:w-1/2">
          <Input type="text" placeholder="Caută jucători (nume sau număr)…" value={query} onChange={(e) => setQuery(e.target.value)} className="bg-white" />
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${starting.length === 11 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-700'}`}>{starting.length}/11 Titulari</Badge>
          <Badge className="bg-sky-100 text-sky-800">{subs.length} Rezerve</Badge>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-white/30 bg-white/10 text-white hover:bg-white/20">Închide</button>
          <button onClick={save} disabled={!canSave} className={`px-4 py-2 rounded-xl text-white shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${canSave ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}>Salvează line-up</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
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
                <div key={p.id} className="flex items-center justify-between gap-2 p-2 hover:bg-gray-50">
                  <div className="truncate">
                    <div className="font-medium truncate">{p.label}</div>
                    <div className="text-xs text-gray-500">{isStarter ? 'Titular' : isSub ? 'Rezervă' : 'Disponibil'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => addStarter(p.id)} disabled={isStarter || startersFull} className={`px-2 py-1 rounded-lg text-sm text-white transition ${isStarter ? 'bg-blue-400 cursor-not-allowed' : startersFull ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>Titular</button>
                    <button type="button" onClick={() => addReserve(p.id)} disabled={isSub} className={`px-2 py-1 rounded-lg text-sm text-white transition ${isSub ? 'bg-sky-400 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-700'}`}>Rezervă</button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && <div className="p-4 text-sm text-gray-500">Niciun jucător găsit.</div>}
          </div>
        </div>

        <div className="grid grid-rows-2">
          <div className="border-b lg:border-b-0 lg:border-l">
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
              <h4 className="font-medium">Titulari</h4>
              <Badge className={`${starting.length === 11 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-700'}`}>{starting.length}/11</Badge>
            </div>
            <div className="p-3 space-y-2 max-h-[200px] md:max-h-[280px] overflow-auto">
              {starting.length === 0 && <div className="text-sm text-gray-500">Niciun titular adăugat încă.</div>}
              {starting.map((id) => {
                const p = allPlayers.find((x) => x.id === id);
                return <Chip key={id} text={p ? p.label : `ID ${id}`} onRemove={() => removeStarter(id)} title={p?.name} />;
              })}
            </div>
          </div>

          <div className="lg:border-l">
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
              <h4 className="font-medium">Rezerve</h4>
              <Badge className="bg-sky-100 text-sky-800">{subs.length}</Badge>
            </div>
            <div className="p-3 space-y-2 max-h-[200px] md:max-h-[280px] overflow-auto">
              {subs.length === 0 && <div className="text-sm text-gray-500">Nicio rezervă adăugată încă.</div>}
              {subs.map((id) => {
                const p = allPlayers.find((x) => x.id === id);
                return <Chip key={id} text={p ? p.label : `ID ${id}`} onRemove={() => removeReserve(id)} title={p?.name} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/** ------------------ MAIN ADD/EDIT + LIST (cu search & pagination) ------------------ */
const AddMatchForm = () => {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  // LIST page state (server-side)
  const [matches, setMatches] = useState([]);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10); // 5/10/15 – cum dorești
  const [totalPages, setTotalPages] = useState(0);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // other existing states
  const [competitions, setCompetitions] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [selectedMatchIdForStats, setSelectedMatchIdForStats] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [openLineupMatchId, setOpenLineupMatchId] = useState(null);

  const formTopRef = useRef(null); // for scroll-to-top on edit

  const [formData, setFormData] = useState({
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

  // -------- Fetch helpers --------
  const fetchTeams = async () => {
    const res = await fetch(`${BASE_URL}/app/teams`);
    if (!res.ok) throw new Error('Nu s-au putut încărca echipele.');
    return res.json();
  };
  const fetchPlayers = async () => {
    const res = await fetch(`${BASE_URL}/app/players?activeOnly=true`);
    if (!res.ok) throw new Error('Nu s-au putut încărca jucătorii.');
    return res.json();
  };
  const fetchCompetitions = async () => {
    const res = await fetch(`${BASE_URL}/app/competitions`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };
  const fetchSeasonsForCompetition = async (competitionId) => {
    if (!competitionId) return [];
    const res = await fetch(`${BASE_URL}/app/competitions/${competitionId}/seasons`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };

  // NEW: paged matches fetcher
  const fetchMatchesPaged = async (pageArg = page, sizeArg = size, qArg = debouncedQ) => {
    setLoadingMatches(true);
    try {
      const params = new URLSearchParams({
        page: String(pageArg),
        size: String(sizeArg),
        q: qArg || '',
      });
      const res = await fetch(`${BASE_URL}/app/matches/page?${params.toString()}`);
      if (!res.ok) throw new Error('Nu s-au putut încărca meciurile (paged).');
      const data = await res.json(); // Spring Page
      setMatches(Array.isArray(data.content) ? data.content : []);
      setTotalPages(data.totalPages ?? 0);
    } catch (err) {
      console.error(err);
      setMatches([]);
      setTotalPages(0);
    } finally {
      setLoadingMatches(false);
    }
  };

  // prime data
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [t, p, c] = await Promise.all([fetchTeams(), fetchPlayers(), fetchCompetitions()]);
        setTeams(t);
        setPlayers(p);
        setCompetitions(c);
      } catch (err) {
        console.error(err);
        setError('A apărut o eroare la încărcarea datelor. Încearcă din nou.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // seasons re-fetch on competition change
  useEffect(() => {
    (async () => {
      if (formData.competitionId) {
        const s = await fetchSeasonsForCompetition(formData.competitionId);
        setSeasons(s);
      } else {
        setSeasons([]);
      }
    })();
  }, [formData.competitionId]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  // fetch paged when page/size/debouncedQ change
  useEffect(() => {
    fetchMatchesPaged(page, size, debouncedQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, debouncedQ]);

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
    const numericFields = new Set(['homeTeamId', 'awayTeamId', 'homeGoals', 'awayGoals', 'competitionId', 'seasonId']);
    const parsedValue = numericFields.has(name) ? (value === '' ? '' : Number(value)) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
      ...(name === 'competitionId' ? { seasonId: '' } : null),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId ? `${BASE_URL}/app/matches/${editId}` : `${BASE_URL}/app/matches`;
    const method = editId ? 'PUT' : 'POST';
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
        resetForm();
        // reîncărcăm pagina curentă a listei (păstrăm paginarea/filtrul)
        fetchMatchesPaged(page, size, debouncedQ);
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
      startingPlayerIds: match.startingPlayerIds || match.startingPlayers?.map((p) => p.id) || [],
      substitutePlayerIds: match.substitutePlayerIds || match.substitutePlayers?.map((p) => p.id) || [],
      active: match.active ?? true,
    });
    setEditId(match.id);

    // 🔝 Scroll to top (cu offset pentru mobil)
    const top = 0;
    try {
      window.scrollTo({ top, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, top);
    }
  };

  const requestDelete = (id) => setConfirmDeleteId(id);

  const confirmDelete = async () => {
    const id = confirmDeleteId;
    if (!id) return;
    try {
      const res = await fetch(`${BASE_URL}/app/matches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmDeleteId(null);
        // reîncărcăm pagina curentă
        fetchMatchesPaged(page, size, debouncedQ);
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
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, startingPlayerIds, substitutePlayerIds } : m)));
  };

  const swapTeams = () => {
    setFormData((prev) => ({ ...prev, homeTeamId: prev.awayTeamId || '', awayTeamId: prev.homeTeamId || '' }));
  };

  // match list is already sorted DESC by backend; we keep it as-is
  const displayedMatches = matches; 

  return (
    <div
      className="space-y-8"
      style={{
        paddingTop:
          'clamp(0px, calc((1024px - 100vw) * 9999), calc(env(safe-area-inset-top, 0px) + 56px))',
      }}
      ref={formTopRef}
    >
      {/* FORM */}
      <SectionCard title={editId ? 'Editează Meci' : 'Adaugă Meci'} subtitle="Completează detaliile și salvează.">
        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>}

        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-10 rounded-xl bg-gray-100" />
            <div className="h-10 rounded-xl bg-gray-100" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 rounded-xl bg-gray-100" />
              <div className="h-10 rounded-xl bg-gray-100" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="homeTeamId">Echipa gazdă</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Select name="homeTeamId" id="homeTeamId" value={formData.homeTeamId} onChange={handleChange}>
                    <option value="">Selectează echipa gazdă</option>
                    {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="awayTeamId">Echipa oaspete</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Select name="awayTeamId" id="awayTeamId" value={formData.awayTeamId} onChange={handleChange}>
                    <option value="">Selectează echipa oaspete</option>
                    {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-center -my-2">
              <button type="button" onClick={swapTeams} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 text-sm shadow-sm" title="Schimbă gazdă ↔ oaspete">
                <span className="inline-block rotate-90">⇅</span>
                Swap teams
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input name="date" id="date" type="date" value={formData.date} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="kickoffTime">Ora start</Label>
                <Input name="kickoffTime" id="kickoffTime" type="time" value={formData.kickoffTime} onChange={handleChange} />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Locație</Label>
              <Input name="location" id="location" placeholder="ex: Stadion Mircești" value={formData.location} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="competitionId">Competiție</Label>
                <Select name="competitionId" id="competitionId" value={formData.competitionId} onChange={handleChange}>
                  <option value="">Selectează competiția</option>
                  {competitions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="seasonId" hint={!formData.competitionId ? '(alege competiția mai întâi)' : ''}>Sezon</Label>
                <Select name="seasonId" id="seasonId" value={formData.seasonId} onChange={handleChange} disabled={!formData.competitionId}>
                  <option value="">{formData.competitionId ? 'Selectează sezonul' : 'Selectează întâi competiția'}</option>
                  {seasons.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="homeGoals">Goluri gazdă</Label>
                <Input name="homeGoals" id="homeGoals" type="number" placeholder="0" value={formData.homeGoals} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="awayGoals">Goluri oaspete</Label>
                <Input name="awayGoals" id="awayGoals" type="number" placeholder="0" value={formData.awayGoals} onChange={handleChange} />
              </div>
            </div>

            <div>
              <Label htmlFor="matchReportUrl">Link articol presă</Label>
              <Input name="matchReportUrl" id="matchReportUrl" placeholder="https://…" value={formData.matchReportUrl} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="notes">Observații</Label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Note interne (ex: absențe, starea terenului etc.)"
                value={formData.notes}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl min-h-[88px] bg-white/90 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-sm">
                {editId ? 'Salvează modificările' : 'Adaugă Meci'}
              </button>
              {editId && (
                <button type="button" onClick={resetForm} className="border px-5 py-2.5 rounded-xl hover:bg-gray-50">
                  Anulează editarea
                </button>
              )}
            </div>
          </form>
        )}
      </SectionCard>

      {/* MATCH LIST: Search + Pagination + List */}
      <SectionCard title="Meciuri existente" subtitle="Caută, paginează, editează rezultatele/statisticile/line-up.">
        {/* Toolbar: search + page size */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Caută după echipă, locație sau notițe…"
            className="w-full sm:w-80 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Pe pagină:</span>
            <select
              className="h-9 rounded-lg border px-2 text-sm"
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>
        </div>

        {/* List */}
        {loadingMatches ? (
          <div className="space-y-3">
            <div className="h-20 rounded-xl bg-gray-100 animate-pulse" />
            <div className="h-20 rounded-xl bg-gray-100 animate-pulse" />
            <div className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          </div>
        ) : displayedMatches.length === 0 ? (
          <div className="text-sm text-gray-600">Niciun meci găsit.</div>
        ) : (
          <ul className="space-y-5">
            {displayedMatches.map((match) => {
              const home = byTeamId(match.homeTeamId ?? match.homeTeam?.id);
              const away = byTeamId(match.awayTeamId ?? match.awayTeam?.id);
              const isLineupOpen = openLineupMatchId === match.id;

              return (
                <li key={match.id} className="border rounded-2xl overflow-hidden ring-1 ring-gray-100">
                  <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-center">
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="flex items-center gap-2">
                          {home?.logo && <img src={home.logo} alt={home?.name || 'home'} className="w-8 h-8 object-contain" />}
                          <span className="font-medium">{home?.name || `Echipa #${match.homeTeamId}`}</span>
                        </div>
                        <span className="text-sm text-gray-500">vs</span>
                        <div className="flex items-center gap-2">
                          {away?.logo && <img src={away.logo} alt={away?.name || 'away'} className="w-8 h-8 object-contain" />}
                          <span className="font-medium">{away?.name || `Echipa #${match.awayTeamId}`}</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold tracking-tight">
                          {match.homeGoals ?? '-'}
                          <span className="text-gray-400"> : </span>
                          {match.awayGoals ?? '-'}
                        </div>
                        <div className="mt-1 text-gray-600 text-sm">{match.date} {match.kickoffTime}</div>
                        {(match.competitionName || match.seasonLabel) && (
                          <div className="mt-1 flex items-center justify-center gap-2">
                            {match.competitionName && <Badge className="bg-sky-100 text-sky-800">{match.competitionName}</Badge>}
                            {match.seasonLabel && <Badge className="bg-indigo-100 text-indigo-800">{match.seasonLabel}</Badge>}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:justify-center">
                        <button onClick={() => handleEdit(match)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm shadow-sm">Editează</button>
                        <button
                          onClick={() => setSelectedMatchIdForStats(selectedMatchIdForStats === match.id ? null : match.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm shadow-sm"
                        >
                          Statistici
                        </button>
                        <button
                          onClick={() => toggleLineup(match.id)}
                          className={`text-white px-4 py-2 rounded-xl text-sm shadow-sm ${isLineupOpen ? 'bg-sky-700' : 'bg-sky-600 hover:bg-sky-700'}`}
                        >
                          {isLineupOpen ? 'Ascunde Line-up' : 'Line-up'}
                        </button>
                        <button onClick={() => requestDelete(match.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm shadow-sm">
                          Șterge
                        </button>
                      </div>
                    </div>

                    {selectedMatchIdForStats === match.id && (
                      <div className="mt-4">
                        <MatchStatsEditor matchId={match.id} />
                      </div>
                    )}

                    {isLineupOpen && (
                      <InlineLineupEditor
                        match={match}
                        players={players}
                        initialStarting={match.startingPlayerIds || match.startingPlayers?.map((p) => p.id) || []}
                        initialSubs={match.substitutePlayerIds || match.substitutePlayers?.map((p) => p.id) || []}
                        onCancel={() => toggleLineup(match.id)}
                        onSaved={(payload) => onLineupSaved(payload, match.id)}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Pagination controls */}
        <div className="mt-5 flex items-center justify-between">
          <button
            className="px-3 py-2 rounded-lg border disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page <= 0}
          >
            ‹ Anterioare
          </button>
          <div className="text-sm text-gray-600">Pagina {page + 1} / {Math.max(1, totalPages)}</div>
          <button
            className="px-3 py-2 rounded-lg border disabled:opacity-50"
            onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
            disabled={page + 1 >= totalPages}
          >
            Următoare ›
          </button>
        </div>
      </SectionCard>

      {/* DELETE CONFIRMATION (modal simplu) */}
      {confirmDeleteId && (() => {
        const m = matches.find((x) => x.id === confirmDeleteId);
        const home = byTeamId(m?.homeTeamId ?? m?.homeTeam?.id);
        const away = byTeamId(m?.awayTeamId ?? m?.awayTeam?.id);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmDeleteId(null)} />
            <div className="relative bg-white w-[90%] max-w-md rounded-2xl shadow-2xl ring-1 ring-gray-100 overflow-hidden">
              <div className="p-5 border-b bg-gradient-to-r from-red-600 to-rose-600 text-white">
                <h4 className="text-lg font-semibold">Ești sigur că vrei să ștergi?</h4>
              </div>
              <div className="p-6">
                {m && (
                  <div className="mb-4 text-sm">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      {home?.logo && <img src={home.logo} alt={home?.name} className="w-6 h-6 object-contain" />}
                      <span className="font-medium">{home?.name || `Echipa #${m.homeTeamId}`}</span>
                      <span className="text-gray-400">vs</span>
                      {away?.logo && <img src={away.logo} alt={away?.name} className="w-6 h-6 object-contain" />}
                      <span className="font-medium">{away?.name || `Echipa #${m.awayTeamId}`}</span>
                    </div>
                    <div className="text-center text-gray-700">
                      Scor: <strong>{m.homeGoals ?? '-'} - {m.awayGoals ?? '-'}</strong>
                      <br />
                      {m.date} {m.kickoffTime}
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">Anulează</button>
                  <button onClick={confirmDelete} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm">Da, șterge</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AddMatchForm;
