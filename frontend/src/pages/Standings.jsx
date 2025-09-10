/* eslint-disable no-unused-vars */
// src/pages/Standings.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import { motion } from 'framer-motion';

// echipa ta (acceptă variații cu/ fără diacritice)
const MY_TEAM_NAMES = [
  'ACS Viitorul Răchiteni',
  'ACS Viitorul Rachiteni',
  'AS Viitorul Răchiteni 2024',
];

// diacritics-insensitive normalize
const normalize = (s) =>
  (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ș|ş/g, 's')
    .replace(/ț|ţ/g, 't')
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i');

const isMyTeam = (name) => {
  const n = normalize(name);
  return MY_TEAM_NAMES.some((t) => normalize(t) === n);
};

const desktopColumns = [
  { key: 'rank', label: '#' },
  { key: 'team', label: 'Echipa' },
  { key: 'played', label: 'M' },
  { key: 'wins', label: 'V' },
  { key: 'draws', label: 'E' },
  { key: 'losses', label: 'I' },
  { key: 'goalsFor', label: 'GM' },
  { key: 'goalsAgainst', label: 'GP' },
  { key: 'gd', label: 'DG' },
  { key: 'points', label: 'P' },
];

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const RankBadge = ({ rank }) => {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 shadow-sm">
        <span aria-hidden>🏆</span> 1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-zinc-300 to-zinc-400 text-zinc-800 shadow-sm">
        <span aria-hidden>🥈</span> 2
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
      {rank ?? '-'}
    </span>
  );
};

const Standings = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await fetch(`${BASE_URL}/app/standings`);
        if (!res.ok) throw new Error('Eroare la încărcarea clasamentului');
        const data = await res.json();
        setRows(Array.isArray(data?.rows) ? data.rows : []);
      } catch (e) {
        setErr(e.message || 'Eroare');
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sorted = useMemo(
    () =>
      [...rows]
        .map((r) => ({
          ...r,
          gd: (Number(r.goalsFor || 0) - Number(r.goalsAgainst || 0)) || 0,
        }))
        .sort((a, b) => Number(a.rank || 0) - Number(b.rank || 0)),
    [rows]
  );

  return (
    <div className="px-4 max-w-5xl mx-auto">
      {/* ===== TITLU / HERO ===== */}
      <div className="relative mx-auto mt-2 mb-4 max-w-3xl px-2 text-center">
        <div aria-hidden className="absolute inset-0 -z-10 flex justify-center">
          <div className="h-16 md:h-20 w-[75%] md:w-[60%] bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 blur-2xl opacity-25 rounded-full" />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-extrabold tracking-tight text-2xl md:text-3xl"
        >
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
            CLASAMENT LIGĂ
          </span>
        </motion.h1>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        className="origin-left mx-auto mt-2 h-1 w-40 md:w-56 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500"
        aria-hidden="true"
      />
      </div>
      {/* ===== /TITLU ===== */}

      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-10 h-10 border-4 border-emerald-500 border-dashed rounded-full animate-spin" />
          </div>
        ) : err ? (
          <div className="p-6 text-center text-red-600">{err}</div>
        ) : sorted.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Nu există date de clasament încă.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10 backdrop-blur">
                  <tr>
                    {desktopColumns.map((c) => (
                      <th
                        key={c.key}
                        className={`px-3 py-3 font-semibold text-gray-700 ${
                          c.key === 'points' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sorted.map((r, idx) => {
                    const mine = isMyTeam(r.teamName);
                    const rankNum = Number(r.rank);
                    const isTop2 = rankNum === 1 || rankNum === 2;

                    return (
                      <tr
                        key={`${r.teamName}-${idx}`}
                        className={`group transition ${
                          mine
                            ? 'bg-emerald-50/70 ring-1 ring-emerald-400/50 shadow-[inset_0_1px_0_rgba(16,185,129,0.25)]'
                            : idx % 2
                            ? 'bg-white'
                            : 'bg-gray-50/60'
                        } hover:bg-emerald-50/60`}
                      >
                        <td className="px-3 py-2">
                          <RankBadge rank={rankNum} />
                        </td>

                        <td className="px-3 py-2">
                          <div className="flex items-center gap-3">
                            {/* arată doar logo dacă există; fără avatar din litere */}
                            {r.teamLogo && (
                              <img
                                src={r.teamLogo}
                                alt={r.teamName}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200"
                              />
                            )}
                            <span className={`${mine ? 'font-semibold text-emerald-800' : 'text-gray-800'}`}>
                              {r.teamName}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-2">{r.played ?? '-'}</td>
                        <td className="px-3 py-2">{r.wins ?? '-'}</td>
                        <td className="px-3 py-2">{r.draws ?? '-'}</td>
                        <td className="px-3 py-2">{r.losses ?? '-'}</td>
                        <td className="px-3 py-2">{r.goalsFor ?? '-'}</td>
                        <td className="px-3 py-2">{r.goalsAgainst ?? '-'}</td>
                        <td className="px-3 py-2">
                          {r.gd >= 0 ? `+${r.gd}` : r.gd}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {isTop2 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-semibold bg-gray-900 text-white">
                              {r.points ?? 0}
                            </span>
                          ) : (
                            <span className="text-gray-800">{r.points ?? 0}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y">
              {sorted.map((r, idx) => {
                const mine = isMyTeam(r.teamName);
                const rankNum = Number(r.rank);
                const isTop2 = rankNum === 1 || rankNum === 2;

                return (
                  <div
                    key={`${r.teamName}-m-${idx}`}
                    className={`p-4 transition ${mine ? 'bg-emerald-50/80 ring-1 ring-emerald-400/50' : 'bg-white'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <RankBadge rank={rankNum} />
                        <div className={`font-semibold ${mine ? 'text-emerald-800' : 'text-gray-900'}`}>
                          {r.teamName}
                        </div>
                      </div>
                      {isTop2 ? (
                        <span className="px-2 py-0.5 rounded-full text-sm font-semibold bg-gray-900 text-white">
                          {r.points ?? 0} p
                        </span>
                      ) : (
                        <span className="text-sm text-gray-800">{r.points ?? 0} p</span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        <div className="text-gray-500">M</div>
                        <div className="font-medium">{r.played ?? '-'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">V-E-I</div>
                        <div className="font-medium">
                          {r.wins ?? 0}-{r.draws ?? 0}-{r.losses ?? 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">GM-GP (DG)</div>
                        <div className="font-medium">
                          {(r.goalsFor ?? 0)}-{(r.goalsAgainst ?? 0)} ({r.gd >= 0 ? `+${r.gd}` : r.gd})
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Standings;
