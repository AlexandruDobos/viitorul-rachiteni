/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from 'react';
import { BASE_URL } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const seasonLabelOf = (m) =>
  m?.seasonLabel ?? m?.season?.label ?? (typeof m?.season === 'string' ? m.season : null);

const OUTCOME_STYLES = {
  win:   { container: 'bg-green-50 border-green-600',   button: 'bg-green-600 hover:bg-green-700 text-white' },
  draw:  { container: 'bg-yellow-50 border-yellow-600', button: 'bg-yellow-600 hover:bg-yellow-700 text-black' },
  lose:  { container: 'bg-red-50 border-red-600',       button: 'bg-red-600 hover:bg-red-700 text-white' },
  neutral: { container: 'bg-gray-50 border-gray-500',   button: 'bg-gray-600 hover:bg-gray-700 text-white' },
};

const TOATE = 'Toate';

const Results = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [seasons, setSeasons] = useState([]);     // [Toate, ...labels]
  const [selectedSeason, setSelectedSeason] = useState(null); // va deveni labels[0]

  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const hasMore = page < totalPages - 1;

  const formatDate = (d) => {
    if (!d) return '-';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return d;
    return date.toLocaleDateString('ro-RO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (t) => (t ? String(t).slice(0, 5) : '-');

  const resultKey = (match) => {
    const home = (match.homeTeamName || '').toLowerCase();
    const away = (match.awayTeamName || '').toLowerCase();
    const viitorulHome = home.includes('răchiteni') || home.includes('rachiteni');
    const viitorulAway = away.includes('răchiteni') || away.includes('rachiteni');
    if (!viitorulHome && !viitorulAway) return 'neutral';
    const { homeGoals: hg, awayGoals: ag } = match;
    if ((viitorulHome && hg > ag) || (viitorulAway && ag > hg)) return 'win';
    if ((viitorulHome && hg < ag) || (viitorulAway && ag < hg)) return 'lose';
    return 'draw';
  };

  // 1) Fetch sezoane – afișăm Toate primul, dar selectăm implicit sezonul curent (labels[0])
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const res = await fetch(`${BASE_URL}/app/matches/results/seasons`, { credentials: 'include' });
        const arr = await res.json();
        const labels = Array.isArray(arr) ? arr : [];
        setSeasons([TOATE, ...labels]);
        if (!selectedSeason) setSelectedSeason(labels[0] ?? TOATE);
      } catch (e) {
        console.error(e);
        setSeasons([TOATE]);
        if (!selectedSeason) setSelectedSeason(TOATE);
      }
    };
    fetchSeasons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Fetch paginat – dacă e "Toate", nu trimitem seasonLabel
  const fetchPage = useCallback(async (pageToLoad, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(pageToLoad));
      params.set('size', String(size));
      if (q && q.trim()) params.set('q', q.trim());
      if (selectedSeason && selectedSeason !== TOATE) {
        params.set('seasonLabel', selectedSeason);
      }

      const res = await fetch(`${BASE_URL}/app/matches/results?${params.toString()}`, { credentials: 'include' });
      const pageJson = await res.json();

      const content = Array.isArray(pageJson?.content) ? pageJson.content : [];
      setTotalPages(pageJson?.totalPages ?? 0);
      setItems((prev) => (append ? [...prev, ...content] : content));
    } catch (err) {
      console.error('Eroare la preluarea meciurilor:', err);
      if (!append) setItems([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [q, selectedSeason, size]);

  useEffect(() => {
    if (selectedSeason === null) return; // așteaptă să fie setat din fetchSeasons
    setPage(0);
    fetchPage(0, false);
  }, [q, selectedSeason, fetchPage]);

  const onLoadMore = async () => {
    if (!hasMore || loading) return;
    const next = page + 1;
    setPage(next);
    await fetchPage(next, true);
  };

  return (
    <div className="px-4 sm:px-6">
      {/* TITLU */}
      <div className="relative mx-auto mt-2 mb-6 max-w-4xl px-2">
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center font-extrabold tracking-tight text-2xl sm:text-3xl">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">REZULTATE</span>
        </motion.h1>
        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
          className="origin-left mx-auto mt-2 h-1 w-32 md:w-44 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500" />
      </div>

      {/* FILTRE */}
      <div className="mx-auto max-w-4xl mb-5 flex flex-col gap-3">
        <div className="relative rounded-xl ring-1 ring-gray-200 bg-white p-2">
          <div className="text-xs font-semibold text-gray-600 px-1 mb-1">Sezon</div>
          <div className="flex flex-wrap gap-2 px-1 py-1">
            {seasons.map((s) => {
              const active = s === selectedSeason;
              return (
                <button key={s} onClick={() => setSelectedSeason(s)}
                  className={[
                    'whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition',
                    active ? 'text-white shadow-sm ring-1 ring-indigo-400/50 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500'
                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ].join(' ')}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative rounded-xl ring-1 ring-gray-200 bg-white p-3">
          <div className="text-xs font-semibold text-gray-600 px-1 mb-2">Căutare</div>
          <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
                 placeholder="Caută după numele echipelor..."
                 className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          {q && <div className="text-xs text-gray-500 mt-1">Rezultate pentru: <span className="font-semibold">{q}</span></div>}
        </div>
      </div>

      {/* LISTĂ */}
      {initialLoading ? (
        <div className="flex justify-center items-center h-32"><div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-600 max-w-4xl mx-auto">Nu există rezultate pentru criteriile curente.</div>
      ) : (
        <>
          <div className="max-w-4xl mx-auto space-y-8">
            {items.map((match) => {
              const homeName = match.homeTeamName ?? 'Echipă gazdă';
              const awayName = match.awayTeamName ?? 'Echipă oaspete';
              const homeLogo = match.homeTeamLogo || '/logo-placeholder.png';
              const awayLogo = match.awayTeamLogo || '/logo-placeholder.png';
              const compName = match.competitionName ?? match.competition?.name ?? match.competition ?? null;
              const seasonLabel = seasonLabelOf(match);
              const k = resultKey(match);
              const styles = OUTCOME_STYLES[k] ?? OUTCOME_STYLES.neutral;

              return (
                <motion.div key={match.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                  className={`relative rounded-3xl shadow-md overflow-hidden border ${styles.container}`}>
                  <div className="relative">
                    <div className="px-5 pt-6 text-center text-base sm:text-lg md:text-xl font-bold">
                      {homeName} <span className="text-gray-700">vs</span> {awayName}
                    </div>
                    <div className="px-5 py-6 flex items-center justify-center gap-6 sm:gap-12">
                      <img src={homeLogo} alt={homeName} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow" />
                      <div className="text-3xl sm:text-5xl font-extrabold min-w-[60px] text-center">
                        {match.homeGoals} <span className="mx-1">-</span> {match.awayGoals}
                      </div>
                      <img src={awayLogo} alt={awayName} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow" />
                    </div>
                    <div className="px-5 pb-2 flex justify-center gap-2 flex-wrap">
                      {compName && <Badge className="bg-gray-200/60 text-xs sm:text-sm">Competiție: {compName}</Badge>}
                      {seasonLabel && <Badge className="bg-gray-200/60 text-xs sm:text-sm">Sezon: {seasonLabel}</Badge>}
                    </div>
                    <div className="px-5 pb-4 text-xs sm:text-sm text-center text-gray-700">
                      <div>{formatDate(match.date)} | Ora: {formatTime(match.kickoffTime)}</div>
                      {match.location && <div className="mt-1">📍 {match.location}</div>}
                    </div>
                    <div className="px-5 pb-6">
                      <button onClick={() => navigate(`/matches/${match.id}`)} className={`w-full py-3 rounded-xl font-semibold transition ${styles.button}`}>
                        Detalii meci
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="max-w-4xl mx-auto my-8 flex justify-center">
            {hasMore ? (
              <button onClick={onLoadMore} disabled={loading} className="px-5 py-2.5 rounded-xl font-semibold bg-gray-900 text-white hover:bg-black disabled:opacity-50">
                {loading ? 'Se încarcă...' : 'Încarcă mai multe'}
              </button>
            ) : (
              <div className="text-sm text-gray-500">Ai ajuns la finalul listei.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Results;
