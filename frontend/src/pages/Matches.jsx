/* eslint-disable no-unused-vars */
// src/pages/Matches.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(`${BASE_URL}/app/matches/upcoming`, { credentials: 'include' });
        const data = await res.json();
        const upcoming = Array.isArray(data)
          ? data
              .filter((m) => !m.result)
              .sort((a, b) => new Date(a.date) - new Date(b.date))
          : [];
        setMatches(upcoming);
      } catch (err) {
        console.error('Eroare la preluarea meciurilor:', err);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const items = useMemo(() => matches ?? [], [matches]);

  const formatDate = (d) => {
    if (!d) return '-';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return d;
    return date.toLocaleDateString('ro-RO', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (t) => (t ? String(t).slice(0, 5) : '-');

  return (
    <div className="px-4 sm:px-6">
      {/* ===== TITLU ANIMAT ===== */}
      <div className="relative mx-auto mt-2 mb-8 max-w-3xl px-2">
        <div aria-hidden className="absolute inset-0 -z-10 flex justify-center">
          <div className="h-14 w-[75%] bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 blur-3xl opacity-25 rounded-full" />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center font-extrabold tracking-tight text-2xl sm:text-3xl"
        >
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
            MECIURI PROGRAMATE
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

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-600">
          Nu există meciuri viitoare disponibile.
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-10">
          {items.map((match) => {
            const homeName = match.homeTeamName ?? 'Echipă gazdă';
            const awayName = match.awayTeamName ?? 'Echipă oaspete';
            const homeLogo = match.homeTeamLogo || '/logo-placeholder.png';
            const awayLogo = match.awayTeamLogo || '/logo-placeholder.png';
            const compName = match.competitionName ?? match.competition?.name ?? match.competition ?? null;
            const seasonLabel = match.seasonLabel ?? match.season?.label ?? match.season ?? null;

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl shadow-xl bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-sky-600/90 text-white overflow-hidden"
              >
                {/* Header titlu vs */}
                <div className="px-6 py-3 bg-white/15 backdrop-blur-md text-center text-lg sm:text-xl font-bold tracking-wide">
                  {homeName} <span className="text-yellow-300">VS</span> {awayName}
                </div>

                {/* Logos + separator “–” */}
                <div className="px-6 py-6 flex items-center justify-center gap-10 sm:gap-16">
                  <img src={homeLogo} alt={homeName} className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg" />
                  <div className="text-4xl sm:text-5xl font-extrabold text-white/70">-</div>
                  <img src={awayLogo} alt={awayName} className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg" />
                </div>

                {/* Badges competiție/sezon */}
                <div className="px-6 pb-2 flex justify-center flex-wrap gap-2">
                  {compName && (
                    <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-semibold">
                      Competiție: {compName}
                    </span>
                  )}
                  {seasonLabel && (
                    <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-semibold">
                      Sezon: {seasonLabel}
                    </span>
                  )}
                </div>

                {/* Dată / oră / locație */}
                <div className="px-6 pb-4 text-center text-sm sm:text-base text-white/90">
                  <div>{formatDate(match.date)} | Ora: {formatTime(match.kickoffTime)}</div>
                  {match.location && <div className="mt-1">📍 {match.location}</div>}
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => navigate(`/matches/${match.id}`)}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500 shadow-md hover:opacity-90 transition"
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

export default Matches;
