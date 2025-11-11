// src/components/LastResultSection.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import { useNavigate } from 'react-router-dom';

const CARD_MIN_H = 'min-h-[360px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[440px]';

const teamIsUs = (n = '') => /răchiteni|rachiteni/i.test(n);

const outcomeStyles = {
  win:    { chip: 'bg-emerald-700 text-white', ring: 'ring-emerald-300/60' },
  draw:   { chip: 'bg-yellow-600 text-black', ring: 'ring-yellow-300/60' },
  lose:   { chip: 'bg-rose-700 text-white',   ring: 'ring-rose-300/60' },
  neutral:{ chip: 'bg-slate-700 text-white',  ring: 'ring-slate-300/60' },
};

export default function LastResultSection() {
  const [m, setM] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr('');
        const res = await fetch(`${BASE_URL}/app/matches/last`);
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
      <section className="max-w-6xl mx-auto my-8">
        <div className={`rounded-2xl bg-white p-6 flex items-center justify-center shadow-[0_6px_24px_rgba(15,23,42,0.06)] ${CARD_MIN_H}`}>
          <div className="h-6 w-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
      </section>
    );
  }
  if (err || !m) return null;

  const homeName = m.homeTeamName ?? 'Echipa gazdă';
  const awayName = m.awayTeamName ?? 'Echipa oaspete';
  const homeLogo = m.homeTeamLogo || '/logo-placeholder.png';
  const awayLogo = m.awayTeamLogo || '/logo-placeholder.png';

  const hg = Number.isFinite(m.homeGoals) ? m.homeGoals : '-';
  const ag = Number.isFinite(m.awayGoals) ? m.awayGoals : '-';

  const usH = teamIsUs(homeName);
  const usA = teamIsUs(awayName);

  let outcome = 'neutral';
  if (usH || usA) {
    if ((usH && hg > ag) || (usA && ag > hg)) outcome = 'win';
    else if ((usH && hg < ag) || (usA && ag < hg)) outcome = 'lose';
    else outcome = 'draw';
  }
  const styles = outcomeStyles[outcome];

  const fmtDate = (d) => {
    try { return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return d || ''; }
  };
  const fmtTime = (t) => (t ? String(t).slice(0, 5) : '');

  return (
    <section className="max-w-6xl mx-auto my-8">
      <div
        className={[
          'relative overflow-hidden rounded-3xl px-4 sm:px-6 py-6 sm:py-8',
          'shadow-[0_20px_60px_-15px_rgba(180,83,9,0.35)]',
          // ⬇️ temă galbenă
          'bg-gradient-to-b from-amber-600 via-amber-500 to-orange-500',
          'text-white ring-1', styles.ring, CARD_MIN_H,
        ].join(' ')}
        style={{ contain: 'layout paint' }}
      >
        {/* header */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide uppercase">ULTIMUL REZULTAT</h2>
          <div className="mx-auto mt-2 h-1 w-36 rounded-full bg-white/60" />
          <div className="mt-3 text-sm text-white/90">
            {fmtDate(m.date)}
            {m.kickoffTime ? ` • ${fmtTime(m.kickoffTime)}` : ''}
            {m.location ? ` • ${m.location}` : ''}
            {(m.competitionName || m.seasonLabel) && (
              <>
                {' • '}
                <span className="font-semibold">
                  {m.competitionName ? `${m.competitionName}` : ''}
                  {m.seasonLabel ? `${m.competitionName ? ' – ' : ''}${m.seasonLabel}` : ''}
                </span>
              </>
            )}
          </div>
        </div>

        {/* central matchup */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-10">
          {/* home */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <img
              src={homeLogo}
              alt={homeName}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)] bg-white/10 rounded-full p-2 ring-1 ring-white/30"
              loading="lazy"
              decoding="async"
            />
            <div className={['text-base sm:text-lg font-semibold text-center md:text-right', usH ? 'text-emerald-100' : 'text-white'].join(' ')}>
              {homeName}
            </div>
          </div>

          {/* score */}
          <div className="flex flex-col items-center gap-3">
            <span className={['px-3 py-1 rounded-full text-xs font-bold shadow-sm', styles.chip].join(' ')}>
              FINAL
            </span>
            <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-wider drop-shadow">
              {hg}<span className="opacity-90 mx-1.5">–</span>{ag}
            </div>
          </div>

          {/* away */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <img
              src={awayLogo}
              alt={awayName}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)] bg-white/10 rounded-full p-2 ring-1 ring-white/30"
              loading="lazy"
              decoding="async"
            />
            <div className={['text-base sm:text-lg font-semibold text-center md:text-left', usA ? 'text-emerald-100' : 'text-white'].join(' ')}>
              {awayName}
            </div>
          </div>
        </div>

        {/* button */}
        <div className="mt-7 flex justify-center">
          <button
            onClick={() => navigate(`/matches/${m.id}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-white/95 text-slate-900 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/60"
          >
            Detalii meci
            <span aria-hidden>›</span>
          </button>
        </div>

        {/* decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      </div>
    </section>
  );
}
