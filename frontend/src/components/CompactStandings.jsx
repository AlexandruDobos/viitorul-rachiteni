/* eslint-disable no-unused-vars */
// src/components/CompactStandings.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

const MY_TEAM_NAMES = [
  'ACS Viitorul Răchiteni',
  'ACS Viitorul Rachiteni',
  'AS Viitorul Răchiteni 2024',
];

const normalize = (s='') =>
  s.toLowerCase()
   .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .replace(/ș|ş/g,'s').replace(/ț|ţ/g,'t')
   .replace(/ă/g,'a').replace(/â/g,'a').replace(/î/g,'i');

const isMyTeam = (name) => MY_TEAM_NAMES.some(t => normalize(t) === normalize(name));

export default function CompactStandings({ title='Clasament' }) {
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState('');

  useEffect(() => {
    (async () => {
      try{
        setLoading(true); setErr('');
        const res = await fetch(`${BASE_URL}/app/standings`, { credentials:'include' });
        if(!res.ok) throw new Error('Eroare la încărcarea clasamentului');
        const data = await res.json();
        setRows(Array.isArray(data?.rows) ? data.rows : []);
      }catch(e){ setErr(e.message || 'Eroare'); setRows([]); }
      finally{ setLoading(false); }
    })();
  }, []);

  const table = useMemo(() =>
    [...rows]
      .map(r => ({...r, gd:(+r.goalsFor||0) - (+r.goalsAgainst||0)}))
      .sort((a,b) => (+a.rank||0) - (+b.rank||0))
  , [rows]);

  return (
    <section className="max-w-6xl mx-auto">
      <div className="rounded-2xl ring-1 ring-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold tracking-tight">{title}</h2>
            <Link to="/standings" className="text-[12px] sm:text-sm font-semibold underline-offset-2 hover:underline">Clasament complet →</Link>
          </div>
        </div>

        {loading ? (
          <div className="p-5 flex items-center justify-center">
            <div className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : err ? (
          <div className="p-4 text-sm text-red-600">{err}</div>
        ) : table.length === 0 ? (
          <div className="p-4 text-sm text-slate-600">Nu există date de clasament.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-slate-50">
                <tr className="text-slate-700">
                  <th className="px-2 py-1.5 text-left w-8 sm:w-10">#</th>
                  <th className="px-2 py-1.5 text-left">ECHIPĂ</th>
                  <th className="px-1.5 py-1.5 text-center w-10 hidden md:table-cell">MJ</th>
                  <th className="px-1.5 py-1.5 text-center w-8 hidden md:table-cell">V</th>
                  <th className="px-1.5 py-1.5 text-center w-8 hidden md:table-cell">E</th>
                  <th className="px-1.5 py-1.5 text-center w-8 hidden md:table-cell">Î</th>
                  <th className="px-1.5 py-1.5 text-center w-12 hidden md:table-cell">DG</th>
                  <th className="px-2 py-1.5 text-center w-12">P</th>
                </tr>
              </thead>
              <tbody>
                {table.map((r,i) => {
                  const mine = isMyTeam(r.teamName);
                  const rank = Number(r.rank);
                  const stripe = i % 2 ? 'bg-white' : 'bg-slate-50/40';

                  return (
                    <tr
                      key={`${r.teamName}-${rank}`}
                      // ⬇️ fără ring: nu mai apare „linia verde”
                      className={`${stripe} ${mine ? 'bg-emerald-50/60' : ''}`}
                    >
                      <td className="px-2 py-1.5 font-semibold text-slate-700">{rank}</td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-2">
                          {r.teamLogo && (
                            <img
                              src={r.teamLogo}
                              alt={r.teamName}
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded object-cover ring-1 ring-slate-200"
                              loading="lazy"
                              decoding="async"
                            />
                          )}
                          <span className={`truncate ${mine ? 'font-semibold text-emerald-800' : 'text-slate-800'}`} title={r.teamName}>
                            {r.teamName}
                          </span>
                        </div>
                      </td>
                      <td className="px-1.5 py-1.5 text-center text-slate-800 hidden md:table-cell">{r.played ?? '-'}</td>
                      <td className="px-1.5 py-1.5 text-center text-slate-800 hidden md:table-cell">{r.wins ?? '-'}</td>
                      <td className="px-1.5 py-1.5 text-center text-slate-800 hidden md:table-cell">{r.draws ?? '-'}</td>
                      <td className="px-1.5 py-1.5 text-center text-slate-800 hidden md:table-cell">{r.losses ?? '-'}</td>
                      <td className="px-1.5 py-1.5 text-center text-slate-800 hidden md:table-cell">{r.gd >= 0 ? `+${r.gd}` : r.gd}</td>
                      <td className="px-2 py-1.5 text-right">
                        <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold ${rank <= 2 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
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
