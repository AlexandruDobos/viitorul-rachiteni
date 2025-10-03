// components/PlayerDetails.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { BASE_URL } from '../utils/constants';
import { Link, useParams, useNavigate } from 'react-router-dom';
import JsonLd from './JsonLD';

const PositionChip = ({ children }) => (
  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/70 text-white">
    {children}
  </span>
);

const NumberBadge = ({ children }) => (
  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold bg-white text-gray-900 shadow ring-1 ring-black/5">
    {children}
  </span>
);

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const cellHL = (cond, base, active) => (cond ? `${base} ${active}` : base);

// Nume afișabil
const getDisplayName = (p = {}) => {
  const joined = [p.firstName, p.lastName].filter(Boolean).join(' ').trim();
  return (
    (typeof p.name === 'string' && p.name.trim()) ||
    (typeof p.fullName === 'string' && p.fullName.trim()) ||
    (typeof p.displayName === 'string' && p.displayName.trim()) ||
    (joined || '').trim()
  );
};

const PlayerDetails = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState([]);
  const [expandedMatchIds, setExpandedMatchIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NOU: filtru sezon
  const [seasonId, setSeasonId] = useState(''); // '' = toate
  const [seasonOptions, setSeasonOptions] = useState([]); // [{id,label}]

  const sortStatsDesc = useCallback((arr) => {
    return [...arr].sort((a, b) => {
      // backend oricum trimite DESC, dar păstrăm ca fallback
      const dA = a.matchDate ? new Date(a.matchDate) : new Date(0);
      const dB = b.matchDate ? new Date(b.matchDate) : new Date(0);
      if (dB.getTime() !== dA.getTime()) return dB - dA;

      const tA = a.matchKickoffTime || '00:00:00';
      const tB = b.matchKickoffTime || '00:00:00';
      return tB.localeCompare(tA);
    });
  }, []);

  const fetchStats = useCallback(async (pid, sid) => {
    const q = sid ? `?seasonId=${sid}` : '';
    const res = await fetch(`${BASE_URL}/app/matches/player/${pid}/stats${q}`);
    const data = await res.json();
    const safe = Array.isArray(data) ? data : [];
    return sortStatsDesc(safe);
  }, [sortStatsDesc]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 1) player
        const resPlayer = await fetch(`${BASE_URL}/app/players/${playerId}`);
        const dataPlayer = await resPlayer.json();
        setPlayer(dataPlayer);

        // 2) stats ALL → pentru totaluri + pentru a deduce opțiunile de sezon
        const allStats = await fetchStats(playerId, '');
        setStats(allStats);

        // construim opțiunile de sezon din răspuns (distinct după seasonId/label)
        const map = new Map();
        allStats.forEach(s => {
          if (s.seasonId && s.seasonLabel) {
            map.set(s.seasonId, s.seasonLabel);
          }
        });
        const opts = Array.from(map.entries()).map(([id, label]) => ({ id, label }));
        // sortăm desc după label dacă vrei, sau lăsăm ordinea naturală
        setSeasonOptions(opts);
      } catch (e) {
        console.error('Eroare încărcare player/stats', e);
        setStats([]);
        setSeasonOptions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [playerId, fetchStats]);

  // când se schimbă sezonul → re-fetch doar pentru acel sezon
  useEffect(() => {
    const refetch = async () => {
      setLoading(true);
      try {
        const filtered = await fetchStats(playerId, seasonId || '');
        setStats(filtered);
        setExpandedMatchIds([]); // mic reset UX
      } catch (e) {
        console.error('Eroare refetch pe sezon', e);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };
    // ignoră prima încărcare (când player/stats ALL au fost deja luate)
    if (player) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seasonId]);

  const toggleExpand = (matchId) => {
    setExpandedMatchIds((prev) =>
      prev.includes(matchId) ? prev.filter((id) => id !== matchId) : [...prev, matchId]
    );
  };

  const totals = useMemo(
    () =>
      stats.reduce(
        (acc, s) => {
          acc.g += s.goals || 0;
          acc.a += s.assists || 0;
          acc.y += s.yellowCards || 0;
          acc.r += s.redCard ? 1 : 0;
          return acc;
        },
        { g: 0, a: 0, y: 0, r: 0 }
      ),
    [stats]
  );

  if (loading || !player) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
      </div>
    );
  }

  const displayName =
    getDisplayName(player) || `Jucător${player.shirtNumber ? ` #${player.shirtNumber}` : ''}`;
  const img = player.profileImageUrl;
  const pos = player.position;
  const nr = player.shirtNumber;

  return (
    <div className="px-4 max-w-[1000px] mx-auto">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: displayName,
          image: player.profileImageUrl || undefined,
          memberOf: {
            '@type': 'SportsTeam',
            name: 'ACS Viitorul Răchiteni',
            sport: 'Football',
          },
          url: window.location.href,
        }}
      />

      {/* Buton înapoi */}
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 font-medium hover:underline">
        ← Înapoi
      </button>

      {/* Card info jucător */}
      <div className="overflow-hidden rounded-2xl bg-white shadow ring-1 ring-gray-200">
        <div className="p-4 md:p-6 md:flex md:items-start md:gap-6">
          {/* Col stânga – portret */}
          <div className="md:w-64 lg:w-72">
            <div className="relative w-full aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden">
              {img ? (
                <img src={img} alt={displayName} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-gray-400">
                  <div className="text-5xl">👤</div>
                </div>
              )}

              {/* overlay pe fotografie */}
              <div className="absolute top-2 left-2 flex items-center gap-2">
                {nr != null && <NumberBadge>#{nr}</NumberBadge>}
              </div>
              <div className="absolute top-2 right-2">{pos && <PositionChip>{pos}</PositionChip>}</div>
            </div>
          </div>

          {/* Col dreapta – detalii + sumar */}
          <div className="mt-4 md:mt-0 md:flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{displayName}</h1>
            <p className="text-gray-600 mt-1">
              {pos ? `${pos}` : ''}
              {nr != null ? ` • #${nr}` : ''}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Goluri: {totals.g}</Badge>
              <Badge className="bg-sky-100 text-sky-800">Assisturi: {totals.a}</Badge>
              <Badge className="bg-yellow-100 text-yellow-800">Galbene: {totals.y}</Badge>
              <Badge className="bg-red-100 text-red-800">Roșii: {totals.r}</Badge>
            </div>

            {/* ✅ Selector Sezon */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sezon</label>
              <select
                value={seasonId}
                onChange={(e) => setSeasonId(e.target.value)}
                className="w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="">Toate sezoanele</option>
                {seasonOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.seasonLabel || opt.label || `Sezon #${opt.id}`}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Statistici per meci */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Statistici pe meci</h2>

        {stats.length === 0 ? (
          <p className="text-gray-500">Nicio statistică disponibilă.</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-hidden rounded-xl bg-white shadow ring-1 ring-gray-200">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="px-3 py-2 text-left font-semibold">Meci</th>
                    <th className="px-3 py-2 text-center font-semibold">Goluri</th>
                    <th className="px-3 py-2 text-center font-semibold">Assisturi</th>
                    <th className="px-3 py-2 text-center font-semibold">Galbene</th>
                    <th className="px-3 py-2 text-center font-semibold">Roșu</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((stat) => (
                    <tr key={stat.matchId} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <Link to={`/matches/${stat.matchId}`} className="text-blue-600 hover:underline">
                          {stat.matchName || `Meci #${stat.matchId}`}
                        </Link>
                        {/* mic meta sub nume */}
                        {(stat.matchDate || stat.matchKickoffTime) && (
                          <div className="text-xs text-gray-500">
                            {stat.matchDate ?? ''}{stat.matchKickoffTime ? ` • ${stat.matchKickoffTime}` : ''}
                            {stat.seasonLabel ? ` • ${stat.seasonLabel}` : ''}
                          </div>
                        )}
                      </td>
                      <td
                        className={cellHL(
                          (stat.goals || 0) > 0,
                          'px-3 py-2 text-center',
                          'bg-green-100 text-green-900 font-semibold rounded'
                        )}
                      >
                        {stat.goals ?? 0}
                      </td>
                      <td
                        className={cellHL(
                          (stat.assists || 0) > 0,
                          'px-3 py-2 text-center',
                          'bg-sky-100 text-sky-900 font-semibold rounded'
                        )}
                      >
                        {stat.assists ?? 0}
                      </td>
                      <td
                        className={cellHL(
                          (stat.yellowCards || 0) > 0,
                          'px-3 py-2 text-center',
                          'bg-yellow-100 text-yellow-900 font-semibold rounded'
                        )}
                      >
                        {stat.yellowCards ?? 0}
                      </td>
                      <td
                        className={cellHL(
                          !!stat.redCard,
                          'px-3 py-2 text-center',
                          'bg-red-100 text-red-900 font-semibold rounded'
                        )}
                      >
                        {stat.redCard ? '1' : '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {stats.map((stat) => (
                <div key={stat.matchId} className="bg-white shadow rounded-xl ring-1 ring-gray-200 overflow-hidden">
                  <button
                    className="w-full text-left px-4 py-3 font-semibold text-base text-gray-800 bg-gray-50"
                    onClick={() => toggleExpand(stat.matchId)}
                  >
                    {stat.matchName || `Meci #${stat.matchId}`}
                    {(stat.matchDate || stat.matchKickoffTime) && (
                      <div className="text-xs text-gray-500 font-normal">
                        {stat.matchDate ?? ''}{stat.matchKickoffTime ? ` • ${stat.matchKickoffTime}` : ''}
                        {stat.seasonLabel ? ` • ${stat.seasonLabel}` : ''}
                      </div>
                    )}
                  </button>

                  {expandedMatchIds.includes(stat.matchId) && (
                    <div className="p-4 text-sm grid grid-cols-2 gap-x-4 gap-y-2">
                      <div className="text-gray-600">Goluri:</div>
                      <div
                        className={cellHL(
                          (stat.goals || 0) > 0,
                          'font-medium text-right',
                          'bg-green-100 text-green-900 font-semibold rounded px-2 py-0.5 inline-block'
                        )}
                      >
                        {stat.goals ?? 0}
                      </div>

                      <div className="text-gray-600">Assisturi:</div>
                      <div
                        className={cellHL(
                          (stat.assists || 0) > 0,
                          'font-medium text-right',
                          'bg-sky-100 text-sky-900 font-semibold rounded px-2 py-0.5 inline-block'
                        )}
                      >
                        {stat.assists ?? 0}
                      </div>

                      <div className="text-gray-600">Galbene:</div>
                      <div
                        className={cellHL(
                          (stat.yellowCards || 0) > 0,
                          'font-medium text-right',
                          'bg-yellow-100 text-yellow-900 font-semibold rounded px-2 py-0.5 inline-block'
                        )}
                      >
                        {stat.yellowCards ?? 0}
                      </div>

                      <div className="text-gray-600">Roșu:</div>
                      <div
                        className={cellHL(
                          !!stat.redCard,
                          'font-medium text-right',
                          'bg-red-100 text-red-900 font-semibold rounded px-2 py-0.5 inline-block'
                        )}
                      >
                        {stat.redCard ? '1' : '0'}
                      </div>

                      <div className="col-span-2 mt-3">
                        <Link to={`/matches/${stat.matchId}`} className="block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                          Detalii meci
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerDetails;
