/* eslint-disable no-unused-vars */
// src/components/CompactStandings.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

/* Echipa noastră (cu/ fără diacritice) */
const MY_TEAM_NAMES = [
  'ACS Viitorul Răchiteni',
  'ACS Viitorul Rachiteni',
  'AS Viitorul Răchiteni 2024',
];

const normalize = (s = '') =>
  s.toString()
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

export default function CompactStandings({ title = 'Clasament' }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await fetch(`${BASE_URL}/app/standings`, { credentials: 'include' });
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

  const table = useMemo(() => {
    return [...rows]
      .map((r) => ({
        ...r,
        gd: (Number(r.goalsFor || 0) - Number(r.goalsAgainst || 0)) || 0,
      }))
      .sort((a, b) => Number(a.rank || 0) - Number(b.rank || 0));
  }, [rows]);

  return (
    <section className="max-w-6xl mx-auto">
      <div className="rounded-2xl ring-1 ring-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.06)] overflow-hidden">
        {/* header compact */}
        <div className="px-4 sm:px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold tracking-tight">{title}</h2>
            <Link
              to="/standings"
              className="text-[12px] sm:text-sm font-semibold underline-offset-2 hover:underline"
            >
              Clasament complet →
            </Link>
          </div>
        </div>

        {/* body */}
        {loading ? (
          <div className="p-6 flex items-center justify-center">
            <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : err ? (
          <div className="p-4 text-sm text-red-600">{err}</div>
        ) : table.length === 0 ? (
          <div className="p-4 text-sm text-slate-600">Nu există date de clasament.</div>
        ) : (
          <div className="overflow-x-auto">
            {/* tabel mic (#, ECHIPĂ, MJ, V, E, Î, DG, P) – toate echipele */}
            <table className="min-w-[560px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-slate-700">
                  <th className="px-3 py-2 text-left w-10">#</th>
                  <th className="px-3 py-2 text-left">ECHIPĂ</th>
                  <th className="px-2 py-2 text-center w-12">MJ</th>
                  <th className="px-2 py-2 text-center w-10">V</th>
                  <th className="px-2 py-2 text-center w-10">E</th>
                  <th className="px-2 py-2 text-center w-10">Î</th>
                  <th className="px-2 py-2 text-center w-12">DG</th>
                  <th className="px-3 py-2 text-right w-12">P</th>
                </tr>
              </thead>
              <tbody>
                {table.map((r, i) => {
                  const mine = isMyTeam(r.teamName);
                  const rank = Number(r.rank);
                  const stripe =
                    rank <= 3
                      ? 'bg-emerald-50'
                      : i % 2
                      ? 'bg-white'
                      : 'bg-slate-50/60';

                  return (
                    <tr
                      key={`${r.teamName}-${rank}`}
                      className={`${stripe} ${mine ? 'ring-1 ring-emerald-400/60 bg-emerald-50' : ''}`}
                    >
                      <td className="px-3 py-2 font-semibold text-slate-700">{rank}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {r.teamLogo && (
                            <img
                              src={r.teamLogo}
                              alt={r.teamName}
                              className="w-5 h-5 rounded object-cover ring-1 ring-slate-200"
                              loading="lazy"
                              decoding="async"
                            />
                          )}
                          <span
                            className={`truncate ${
                              mine ? 'font-semibold text-emerald-800' : 'text-slate-800'
                            }`}
                            title={r.teamName}
                          >
                            {r.teamName}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center text-slate-800">{r.played ?? '-'}</td>
                      <td className="px-2 py-2 text-center text-slate-800">{r.wins ?? '-'}</td>
                      <td className="px-2 py-2 text-center text-slate-800">{r.draws ?? '-'}</td>
                      <td className="px-2 py-2 text-center text-slate-800">{r.losses ?? '-'}</td>
                      <td className="px-2 py-2 text-center text-slate-800">
                        {r.gd >= 0 ? `+${r.gd}` : r.gd}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span
                          className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-bold ${
                            rank <= 2 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
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
        )}
      </div>
    </section>
  );
}
