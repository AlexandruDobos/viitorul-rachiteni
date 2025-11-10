// src/components/LastResultSection.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import { useNavigate } from 'react-router-dom';

const OUTCOME = {
  win:   { wrap: 'bg-green-50 ring-1 ring-green-200',   btn: 'bg-green-600 hover:bg-green-700 text-white' },
  draw:  { wrap: 'bg-yellow-50 ring-1 ring-yellow-200', btn: 'bg-yellow-600 hover:bg-yellow-700 text-black' },
  lose:  { wrap: 'bg-red-50 ring-1 ring-red-200',       btn: 'bg-red-600 hover:bg-red-700 text-white' },
  neutral: { wrap: 'bg-gray-50 ring-1 ring-gray-200',   btn: 'bg-gray-700 hover:bg-gray-800 text-white' },
};

const teamIsUs = (n='') => /răchiteni|rachiteni/i.test(n);

export default function LastResultSection() {
  const [m, setM] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr('');
        const res = await fetch(`${BASE_URL}/app/matches/last`, { credentials: 'include' });
        if (!res.ok) throw new Error('Nu am găsit ultimul rezultat.');
        const data = await res.json();
        setM(data);
      } catch (e) {
        setErr(e.message || 'Eroare');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto">
        <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-6 flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </section>
    );
  }
  if (err || !m) return null;

  const home = m.homeTeamName ?? 'Gazde';
  const away = m.awayTeamName ?? 'Oaspeți';
  const hg = m.homeGoals ?? '-';
  const ag = m.awayGoals ?? '-';
  const homeUs = teamIsUs(home);
  const awayUs = teamIsUs(away);

  let k = 'neutral';
  if (homeUs || awayUs) {
    if ((homeUs && hg > ag) || (awayUs && ag > hg)) k = 'win';
    else if ((homeUs && hg < ag) || (awayUs && ag < hg)) k = 'lose';
    else k = 'draw';
  }
  const s = OUTCOME[k];

  const fmtDate = (d) => {
    try { return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return d || ''; }
  };
  const fmtTime = (t) => (t ? String(t).slice(0,5) : '');

  return (
    <section className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-base sm:text-lg font-semibold tracking-tight">Ultimul rezultat</h2>
      </div>

      <div className={`rounded-2xl overflow-hidden ${s.wrap} shadow-[0_6px_24px_rgba(15,23,42,0.06)]`}>
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-slate-600">
              {fmtDate(m.date)}{m.kickoffTime ? ` • ${fmtTime(m.kickoffTime)}` : ''}{m.location ? ` • ${m.location}` : ''}
            </div>
            {m.seasonLabel && (
              <div className="text-xs px-2 py-1 rounded-full bg-white/70 ring-1 ring-slate-200 text-slate-700">
                {m.competitionName ? `${m.competitionName} – ` : ''}{m.seasonLabel}
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
            <div className={`text-right font-semibold ${homeUs ? 'text-emerald-700' : 'text-slate-900'}`}>{home}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {hg}<span className="mx-1">–</span>{ag}
            </div>
            <div className={`text-left font-semibold ${awayUs ? 'text-emerald-700' : 'text-slate-900'}`}>{away}</div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => navigate(`/matches/${m.id}`)}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl font-semibold ${s.btn}`}
            >
              Detalii meci
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
