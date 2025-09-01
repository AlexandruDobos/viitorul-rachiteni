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

/** extrage eticheta de sezon dintr-un meci, indiferent de formă */
const seasonLabelOf = (m) =>
  m?.seasonLabel ?? m?.season?.label ?? (typeof m?.season === 'string' ? m.season : null);

/** comparator care încearcă să sorteze corect etichete de tipul "2025/2026" descrescător */
const bySeasonDesc = (a, b) => {
  const parse = (s) => {
    if (!s) return { start: -Infinity, end: -Infinity, raw: s || '' };
    const m = String(s).match(/(\d{4}).*?(\d{4})/);
    if (m) return { start: parseInt(m[1], 10), end: parseInt(m[2], 10), raw: s };
    // fallback lexicografic
    return { start: -Infinity, end: -Infinity, raw: s };
  };
  const A = parse(a);
  const B = parse(b);
  if (A.start !== B.start) return B.start - A.start;
  if (A.end !== B.end) return B.end - A.end;
  return String(B.raw).localeCompare(String(A.raw)); // desc
};

const Results = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([]);          // etichete unice
  const [selectedSeason, setSelectedSeason] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/app/matches`, { credentials: 'include' });
        const data = await res.json();

        const finished = Array.isArray(data)
          ? data
              .filter((m) => m.homeGoals !== null && m.awayGoals !== null)
              .sort((a, b) => new Date(b.date) - new Date(a.date))
          : [];
        setMatches(finished);

        // derive sezoane unice din meciuri
        const uniq = Array.from(
          new Set(
            finished
              .map(seasonLabelOf)
              .filter(Boolean)
          )
        ).sort(bySeasonDesc);

        setSeasons(uniq);
        setSelectedSeason((prev) => prev ?? (uniq[0] || null)); // default: cel mai nou sezon
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

  // filtrare după sezonul selectat
  const items = useMemo(() => {
    if (!Array.isArray(matches)) return [];
    if (!selectedSeason) return matches; // dacă nu avem sezoane, afișăm tot
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

  return (
    <div className="px-4 sm:px-6">
      {/* ===== TITLU ANIMAT ===== */}
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
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
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
      {/* ===== /TITLU ANIMAT ===== */}

      {/* ===== SELECTOR SEZON ===== */}
      <div className="mx-auto max-w-4xl mb-5">
        {/* bară cu „pills”, scrollabilă pe mobil */}
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
          // dacă nu avem etichete – oferim un select simplu inactiv (doar ca aspect)
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
      {/* ===== /SELECTOR SEZON ===== */}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-600 max-w-4xl mx-auto">
          Nu există rezultate pentru sezonul selectat.
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {items.map((match) => {
            const homeName = match.homeTeamName ?? 'Echipă gazdă';
            const awayName = match.awayTeamName ?? 'Echipă oaspete';
            const homeLogo = match.homeTeamLogo || '/logo-placeholder.png';
            const awayLogo = match.awayTeamLogo || '/logo-placeholder.png';
            const compName =
              match.competitionName ?? match.competition?.name ?? match.competition ?? null;
            const seasonLabel =
              match.seasonLabel ?? match.season?.label ?? match.season ?? null;

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition"
              >
                {/* Header titlu vs */}
                <div className="px-5 pt-4">
                  <div className="bg-gray-50 rounded-lg px-3 py-2 text-center text-sm sm:text-base md:text-lg font-semibold">
                    <span className="truncate">{homeName}</span>{' '}
                    <span className="text-red-600 font-extrabold">vs</span>{' '}
                    <span className="truncate">{awayName}</span>
                  </div>
                </div>

                {/* Logos + scor final */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-center gap-8 sm:gap-12">
                    <img src={homeLogo} alt={homeName} className="w-14 h-14 sm:w-20 sm:h-20 object-contain" />
                    <div className="text-4xl sm:text-5xl font-extrabold text-gray-800">
                      {match.homeGoals} <span className="text-gray-400">-</span> {match.awayGoals}
                    </div>
                    <img src={awayLogo} alt={awayName} className="w-14 h-14 sm:w-20 sm:h-20 object-contain" />
                  </div>
                </div>

                {/* Badges competiție/sezon */}
                <div className="px-5 pb-1">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {compName && <Badge className="bg-indigo-100 text-indigo-800">Competiție: {compName}</Badge>}
                    {seasonLabel && <Badge className="bg-gray-100 text-gray-800">Sezon: {seasonLabel}</Badge>}
                  </div>
                </div>

                {/* Dată / oră / locație */}
                <div className="px-5 pb-2 text-xs sm:text-sm text-gray-600 text-center">
                  <div className="mt-1">
                    {formatDate(match.date)} | Ora: {formatTime(match.kickoffTime)}
                  </div>
                  {match.location && <div className="mt-1">📍 {match.location}</div>}
                </div>

                {/* CTA */}
                <div className="px-5 pb-5">
                  <div className="flex justify-center">
                    <button
                      onClick={() => navigate(`/matches/${match.id}`)}
                      className="bg-black text-white text-sm py-2 px-4 rounded-lg hover:bg-gray-800 transition"
                    >
                      Detalii meci
                    </button>
                  </div>
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
