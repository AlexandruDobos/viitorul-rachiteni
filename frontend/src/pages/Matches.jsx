/* eslint-disable no-unused-vars */
// src/pages/Matches.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/app/matches/upcoming`, { credentials: 'include' });
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
      <div className="relative mx-auto mt-2 mb-6 max-w-3xl px-2">
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
            Meciuri programate
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
        <div className="max-w-4xl mx-auto space-y-6">
          {items.map((match) => {
            const homeName = match.homeTeamName ?? 'Echipă gazdă';
            const awayName = match.awayTeamName ?? 'Echipă oaspete';
            const homeLogo = match.homeTeamLogo || '/logo-placeholder.png';
            const awayLogo = match.awayTeamLogo || '/logo-placeholder.png';
            const compName = match.competitionName ?? match.competition?.name ?? match.competition ?? null;
            const seasonLabel = match.seasonLabel ?? match.season?.label ?? match.season ?? null;

            return (
              <div
                key={match.id}
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

                {/* Logos + separator “–” */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-center gap-8 sm:gap-12">
                    <img src={homeLogo} alt={homeName} className="w-14 h-14 sm:w-20 sm:h-20 object-contain" />
                    <div className="text-4xl sm:text-5xl font-bold text-gray-300">-</div>
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Matches;
