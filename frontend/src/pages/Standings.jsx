/* eslint-disable no-unused-vars */
// src/pages/Standings.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import { motion } from 'framer-motion';

const DESIRED_TEAM = 'AS Viitorul Răchiteni 2024'; // diacritics-insensitive match

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

// Simple diacritics-insensitive normalize
const normalize = (s) =>
  (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ș|ş/g, 's')
    .replace(/ț|ţ/g, 't');

const isMyTeam = (name) => normalize(name) === normalize(DESIRED_TEAM);

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

const Standings = () => {
  const [rows, setRows] = useState([]);
  const [sourceUrl, setSourceUrl] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
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
        setSourceUrl(
          data?.source_url ||
            'https://www.frf-ajf.ro/iasi/competitii-fotbal/liga-a-v-a-seria-iii-13761/clasament'
        );
        setLastUpdated(data?.last_updated || null);
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

  const headerNote =
    lastUpdated &&
    new Date(lastUpdated).toLocaleString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const rankBadgeClass = (rank) => {
    if (rank === 1) return 'bg-amber-100 text-amber-800';
    if (rank === 2) return 'bg-gray-200 text-gray-800';
    if (rank === 3) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="px-4 max-w-5xl mx-auto">
      {/* ===== TITLU ANIMAT ===== */}
      <div className="relative mx-auto mt-2 mb-2 max-w-3xl px-2 text-center">
        <div aria-hidden className="absolute inset-0 -z-10 flex justify-center">
          <div className="h-12 md:h-16 w-[70%] md:w-[60%] bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 blur-2xl opacity-25 rounded-full" />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-extrabold tracking-tight text-2xl md:text-3xl"
        >
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
            Clasament
          </span>
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
          className="origin-left mx-auto mt-2 h-1 w-32 md:w-44 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500"
          aria-hidden="true"
        />
        {headerNote && (
          <div className="mt-1 text-xs text-gray-500">
            Actualizat: {headerNote}
          </div>
        )}
      </div>
      {/* ===== /TITLU ANIMAT ===== */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
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
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {desktopColumns.map((c) => (
                      <th
                        key={c.key}
                        className={`px-3 py-2 font-semibold text-gray-700 ${
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
                    return (
                      <tr
                        key={`${r.teamName}-${idx}`}
                        className={`${
                          mine
                            ? 'bg-emerald-50/80'
                            : idx % 2
                            ? 'bg-white'
                            : 'bg-gray-50'
                        } hover:bg-emerald-50/60 transition`}
                      >
                        <td className="px-3 py-2">
                          <Badge className={rankBadgeClass(Number(r.rank))}>
                            {r.rank ?? '-'}
                          </Badge>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {r.teamLogo && (
                              <img
                                src={r.teamLogo}
                                alt={r.teamName}
                                className="w-6 h-6 object-contain"
                              />
                            )}
                            {r.teamUrl ? (
                              <a
                                href={r.teamUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`hover:underline ${
                                  mine ? 'font-semibold text-emerald-800' : 'text-gray-800'
                                }`}
                              >
                                {r.teamName}
                              </a>
                            ) : (
                              <span
                                className={mine ? 'font-semibold text-emerald-800' : 'text-gray-800'}
                              >
                                {r.teamName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">{r.played ?? '-'}</td>
                        <td className="px-3 py-2">{r.wins ?? '-'}</td>
                        <td className="px-3 py-2">{r.draws ?? '-'}</td>
                        <td className="px-3 py-2">{r.losses ?? '-'}</td>
                        <td className="px-3 py-2">{r.goalsFor ?? '-'}</td>
                        <td className="px-3 py-2">{r.goalsAgainst ?? '-'}</td>
                        <td className="px-3 py-2">{r.gd >= 0 ? `+${r.gd}` : r.gd}</td>
                        <td className="px-3 py-2 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold ${
                              mine ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {r.points ?? 0}
                          </span>
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
                return (
                  <div
                    key={`${r.teamName}-m-${idx}`}
                    className={`p-4 ${mine ? 'bg-emerald-50/80' : 'bg-white'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={rankBadgeClass(Number(r.rank))}>
                          {r.rank ?? '-'}
                        </Badge>
                        <div className="font-semibold text-gray-900">
                          {r.teamName}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-sm font-semibold ${
                          mine ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {r.points ?? 0} p
                      </span>
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

                    {r.teamUrl && (
                      <div className="mt-3">
                        <a
                          href={r.teamUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Pagina echipei ↗
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Clasament conform cu{' '}
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          {sourceUrl}
        </a>
        .
      </p>
    </div>
  );
};

export default Standings;
