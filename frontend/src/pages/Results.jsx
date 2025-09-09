/* eslint-disable no-unused-vars */
// src/pages/Results.jsx
import React, { useEffect, useMemo, useState } from 'react';
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

const bySeasonDesc = (a, b) => {
  const parse = (s) => {
    if (!s) return { start: -Infinity, end: -Infinity, raw: s || '' };
    const m = String(s).match(/(\d{4}).*?(\d{4})/);
    if (m) return { start: parseInt(m[1], 10), end: parseInt(m[2], 10), raw: s };
    return { start: -Infinity, end: -Infinity, raw: s };
  };
  const A = parse(a);
  const B = parse(b);
  if (A.start !== B.start) return B.start - A.start;
  if (A.end !== B.end) return B.end - A.end;
  return String(B.raw).localeCompare(String(A.raw));
};

const Results = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/app/matches`, { credentials: 'include' });
        const data = await res.json();

        const finished = Array.isArray(data)
          ? data.filter((m) => m.homeGoals !== null && m.awayGoals !== null)
          : [];
        setMatches(finished);

        const uniq = Array.from(
          new Set(finished.map(seasonLabelOf).filter(Boolean))
        ).sort(bySeasonDesc);

        setSeasons(uniq);
        setSelectedSeason((prev) => prev ?? (uniq[0] || null));
      } catch (err) {
        console.error('Eroare la preluarea meciurilor:', err);
        setMatches([]);
        setSeasons([]);
        setSelectedSeason(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const items = useMemo(() => {
    if (!Array.isArray(matches)) return [];
    if (!selectedSeason) return matches;
    return matches.filter((m) => seasonLabelOf(m) === selectedSeason);
  }, [matches, selectedSeason]);

  const formatDate = (d) => {
    if (!d) return '-';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return d;
    return date.toLocaleDateString('ro-RO', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (t) => (t ? String(t).slice(0, 5) : '-');

  /** determină culoarea fundalului în funcție de rezultat */
  const resultColor = (match) => {
    const home = match.homeTeamName?.toLowerCase() || '';
    const away = match.awayTeamName?.toLowerCase() || '';
    const viitorulHome = home.includes('rachiteni');
    const viitorulAway = away.includes('rachiteni');

    if (!viitorulHome && !viitorulAway) {
      return 'bg-gray-100 text-gray-800';
    }

    const hg = match.homeGoals;
    const ag = match.awayGoals;

    let outcome = 'draw';
    if (viitorulHome) {
      if (hg > ag) outcome = 'win';
      else if (hg < ag) outcome = 'loss';
    } else if (viitorulAway) {
      if (ag > hg) outcome = 'win';
      else if (ag < hg) outcome = 'loss';
    }

    switch (outcome) {
      case 'win':
        return 'bg-green-600/90 text-white';
      case 'loss':
        return 'bg-red-600/90 text-white';
      case 'draw':
        return 'bg-yellow-400/90 text-black';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 sm:px-6">
      {/* TITLU */}
      <div className="relative mx-auto mt-2 mb-6 max-w-4xl px-2">
        <div aria-hidden className="absolute inset-0 -z-10 flex justify-center">
          <div className="h-12 md:h-16 w-[70%] md:w-[60%] bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 blur-2xl opacity-25 rounded-full" />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center font-extrabold tracking-tight text-2xl sm:text-3xl"
        >
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
            Rezultate
          </span>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
          className="origin-left mx-auto mt-2 h-1 w-32 md:w-44 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500"
          aria-hidden="true"
        />
      </div>

      {/* SELECTOR SEZON */}
      <div className="mx-auto max-w-4xl mb-5">
        {seasons.length > 0 ? (
          <div className="relative rounded-xl ring-1 ring-gray-200 bg-white p-2">
            <div className="text-xs font-semibold text-gray-600 px-1 mb-1">Sezon</div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-1 py-1">
              {seasons.map((s) => {
                const active = s === selectedSeason;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSeason(s)}
                    className={[
                      'whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition',
                      active
                        ? 'text-white shadow-sm ring-1 ring-indigo-400/50 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ].join(' ')}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="relative rounded-xl ring-1 ring-gray-200 bg-white p-2">
            <div className="text-xs font-semibold text-gray-600 px-1 mb-1">Sezon</div>
            <div className="px-1 py-1">
              <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-500 px-3.5 py-1.5 text-sm">
                Nedisponibil
              </span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-600 max-w-4xl mx-auto">
          Nu există rezultate pentru sezonul selectat.
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8">
          {items.map((match) => {
            const homeName = match.homeTeamName ?? 'Echipă gazdă';
            const awayName = match.awayTeamName ?? 'Echipă oaspete';
            const homeLogo = match.homeTeamLogo || '/logo-placeholder.png';
            const awayLogo = match.awayTeamLogo || '/logo-placeholder.png';
            const compName = match.competitionName ?? match.competition?.name ?? match.competition ?? null;
            const seasonLabel = seasonLabelOf(match);

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className={`rounded-3xl shadow-xl overflow-hidden ${resultColor(match)}`}
              >
                {/* Header titlu vs */}
                <div className="px-5 pt-4 text-center text-base sm:text-lg md:text-xl font-bold">
                  {homeName} <span className="text-black/80">vs</span> {awayName}
                </div>

                {/* Logos + scor final */}
                <div className="px-5 py-5 flex items-center justify-center gap-10 sm:gap-14">
                  <img src={homeLogo} alt={homeName} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow" />
                  <div className="text-4xl sm:text-5xl font-extrabold">
                    {match.homeGoals} <span className="mx-1">-</span> {match.awayGoals}
                  </div>
                  <img src={awayLogo} alt={awayName} className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow" />
                </div>

                {/* Badges competiție/sezon */}
                <div className="px-5 pb-1 flex justify-center gap-2 flex-wrap">
                  {compName && <Badge className="bg-white/20 text-xs sm:text-sm">Competiție: {compName}</Badge>}
                  {seasonLabel && <Badge className="bg-white/20 text-xs sm:text-sm">Sezon: {seasonLabel}</Badge>}
                </div>

                {/* Dată / locație */}
                <div className="px-5 pb-3 text-xs sm:text-sm text-center opacity-90">
                  <div>{formatDate(match.date)} | Ora: {formatTime(match.kickoffTime)}</div>
                  {match.location && <div className="mt-1">📍 {match.location}</div>}
                </div>

                {/* CTA */}
                <div className="px-5 pb-6">
                  <button
                    onClick={() => navigate(`/matches/${match.id}`)}
                    className="w-full py-3 rounded-xl font-semibold bg-black/80 text-white hover:bg-black transition"
                  >
                    Detalii meci
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Results;
