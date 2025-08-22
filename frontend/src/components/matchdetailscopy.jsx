// MatchDetails.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${className}`}>
    {children}
  </span>
);

const cellHL = (cond, base, active) => (cond ? active : base);

const MatchDetails = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [matchStats, setMatchStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const [resMatch, resStats, resPlayers] = await Promise.all([
          fetch(`${BASE_URL}/api/app/matches/${matchId}`),
          fetch(`${BASE_URL}/api/app/matches/player-stats/${matchId}`),
          fetch(`${BASE_URL}/api/app/players`)
        ]);

        const matchData = await resMatch.json();
        const statsData = await resStats.json();
        const playersData = await resPlayers.json();

        setMatch(matchData);
        setMatchStats(Array.isArray(statsData) ? statsData : []);
        setPlayers(playersData);
      } catch (err) {
        console.error('Eroare la încărcarea datelor:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchData();
  }, [matchId]);

  // ----- Hook-uri înainte de orice return condițional -----
  const playersById = useMemo(() => {
    const map = new Map();
    for (const p of players) map.set(p.id, p);
    return map;
  }, [players]);

  const statsByPlayer = useMemo(() => {
    const map = new Map();
    for (const s of matchStats) map.set(s.playerId, s);
    return map;
  }, [matchStats]);

  // ----- Return-uri condiționale -----
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!match) {
    return <p className="text-center text-red-600">Nu s-au găsit detalii despre meci.</p>;
  }

  // ----- Restul logicii (fără hook-uri) -----
  const getPlayerName = (id) => playersById.get(id)?.name ?? `Jucător #${id}`;
  const getPlayerNumber = (id) => playersById.get(id)?.shirtNumber ?? '-';

  const starterIds = match.startingPlayerIds || [];
  const subIds = match.substitutePlayerIds || [];

  const zeroStat = { goals: 0, assists: 0, yellowCards: 0, redCard: false };

  const makeRow = (id, role) => {
    const stat = statsByPlayer.get(id) || zeroStat;
    return {
      id,
      role,
      number: getPlayerNumber(id),
      name: getPlayerName(id),
      goals: stat.goals || 0,
      assists: stat.assists || 0,
      yellow: stat.yellowCards || 0,
      red: !!stat.redCard,
    };
  };

  const starters = starterIds.map(id => makeRow(id, 'Titular'));
  const subs = subIds.map(id => makeRow(id, 'Rezervă'));

  const extraIds = matchStats
    .map(s => s.playerId)
    .filter(id => !starterIds.includes(id) && !subIds.includes(id));
  const extras = extraIds.map(id => makeRow(id, 'Alții'));

  // --- NEW: competition & season with fallbacks (works with old/new DTOs) ---
  const competitionName =
    match.competitionName ??
    match.competition?.name ??
    match.competition ??
    null;

  const seasonLabel =
    match.seasonLabel ??
    match.season?.label ??
    match.season ??
    null;

  return (
    <div className="pt-20 px-4 max-w-[1100px] mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 font-medium hover:underline"
      >
        ← Înapoi
      </button>

      {/* Header meci */}
      <div className="bg-white shadow rounded-xl p-5 text-center">
        <h1 className="text-2xl font-bold mb-2">
          {match.homeTeamName} vs {match.awayTeamName}
        </h1>

        <div className="flex items-center justify-center gap-6 my-4">
          <img src={match.homeTeamLogo} alt={match.homeTeamName} className="w-16 h-16 object-contain" />
          <span className="text-3xl font-extrabold text-gray-800">
            {match.homeGoals} - {match.awayGoals}
          </span>
          <img src={match.awayTeamLogo} alt={match.awayTeamName} className="w-16 h-16 object-contain" />
        </div>

        <p className="text-gray-600">
          {match.date} &middot; {match.kickoffTime} &middot; {match.location}
        </p>

        {(competitionName || seasonLabel) && (
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            {competitionName && (
              <Badge className="bg-indigo-100 text-indigo-800">
                {competitionName}
              </Badge>
            )}
            {seasonLabel && (
              <Badge className="bg-gray-100 text-gray-800">
                {seasonLabel}
              </Badge>
            )}
          </div>
        )}

        {match.notes && (
          <p className="text-sm text-gray-500 mt-3">{match.notes}</p>
        )}

        {match.matchReportUrl && (
          <div className="mt-3">
            <a
              href={match.matchReportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Citește articolul complet
            </a>
          </div>
        )}
      </div>

      {/* Legendă */}
      <div className="mt-4 flex flex-wrap gap-3 items-center text-sm">
        <Badge className="bg-emerald-100 text-emerald-800">Titular</Badge>
        <Badge className="bg-amber-100 text-amber-800">Rezervă</Badge>
        <Badge className="bg-green-100 text-green-800">Goluri &gt; 0</Badge>
        <Badge className="bg-sky-100 text-sky-800">Assisturi &gt; 0</Badge>
        <Badge className="bg-yellow-100 text-yellow-800">Galbene &gt; 0</Badge>
        <Badge className="bg-red-100 text-red-800">Cartonaș roșu</Badge>
      </div>

      {/* Tabel */}
      <div className="mt-6 bg-white shadow rounded-xl">
        <div className="overflow-x-auto md:overflow-x-visible">
          <table className="min-w-full text-left text-sm md:text-base">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {/* # și Rol ascunse pe mobil */}
                <th className="px-4 py-3 font-semibold text-gray-700 w-16 hidden md:table-cell">#</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Jucător</th>
                <th className="px-4 py-3 font-semibold text-gray-700 w-28 hidden md:table-cell">Rol</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-center md:w-20">Goluri</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-center md:w-24">Assisturi</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-center w-24 hidden md:table-cell">Galbene</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-center w-24 hidden md:table-cell">Roșu</th>
              </tr>
            </thead>

            {/* Titulari */}
            <tbody>
              {starters.length > 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-2 bg-emerald-50 text-emerald-900 font-semibold">
                    Titulari
                  </td>
                </tr>
              )}
              {starters.map((r) => (
                <tr key={`st-${r.id}`} className="border-t hover:bg-emerald-50/50">
                  <td className="px-4 py-3 font-semibold hidden md:table-cell">{r.number}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/players/${r.id}`}
                      className="text-blue-600 hover:underline"
                      title={`Vezi profilul lui ${r.name}`}
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge className="bg-emerald-100 text-emerald-800">Titular</Badge>
                  </td>
                  <td className={cellHL(r.goals > 0, 'px-4 py-3 text-center', 'px-4 py-3 text-center bg-green-100 text-green-900 font-semibold rounded')}>
                    {r.goals}
                  </td>
                  <td className={cellHL(r.assists > 0, 'px-4 py-3 text-center', 'px-4 py-3 text-center bg-sky-100 text-sky-900 font-semibold rounded')}>
                    {r.assists}
                  </td>
                  <td className={cellHL(r.yellow > 0, 'px-4 py-3 text-center hidden md:table-cell', 'px-4 py-3 text-center bg-yellow-100 text-yellow-900 font-semibold rounded hidden md:table-cell')}>
                    {r.yellow}
                  </td>
                  <td className={cellHL(r.red, 'px-4 py-3 text-center hidden md:table-cell', 'px-4 py-3 text-center bg-red-100 text-red-900 font-semibold rounded hidden md:table-cell')}>
                    {r.red ? 'Da' : 'Nu'}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Rezerve */}
            <tbody>
              {subs.length > 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-2 bg-amber-50 text-amber-900 font-semibold">
                    Rezerve
                  </td>
                </tr>
              )}
              {subs.map((r) => (
                <tr key={`sub-${r.id}`} className="border-t hover:bg-amber-50/50">
                  <td className="px-4 py-3 font-semibold hidden md:table-cell">{r.number}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/players/${r.id}`}
                      className="text-blue-600 hover:underline"
                      title={`Vezi profilul lui ${r.name}`}
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge className="bg-amber-100 text-amber-800">Rezervă</Badge>
                  </td>
                  <td className={cellHL(r.goals > 0, 'px-4 py-3 text-center', 'px-4 py-3 text-center bg-green-100 text-green-900 font-semibold rounded')}>
                    {r.goals}
                  </td>
                  <td className={cellHL(r.assists > 0, 'px-4 py-3 text-center', 'px-4 py-3 text-center bg-sky-100 text-sky-900 font-semibold rounded')}>
                    {r.assists}
                  </td>
                  <td className={cellHL(r.yellow > 0, 'px-4 py-3 text-center hidden md:table-cell', 'px-4 py-3 text-center bg-yellow-100 text-yellow-900 font-semibold rounded hidden md:table-cell')}>
                    {r.yellow}
                  </td>
                  <td className={cellHL(r.red, 'px-4 py-3 text-center hidden md:table-cell', 'px-4 py-3 text-center bg-red-100 text-red-900 font-semibold rounded hidden md:table-cell')}>
                    {r.red ? 'Da' : 'Nu'}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Alții (dacă există) */}
            {extras.length > 0 && (
              <tbody>
                <tr>
                  <td colSpan={7} className="px-4 py-2 bg-gray-50 text-gray-700 font-semibold">
                    Alți jucători cu statistici
                  </td>
                </tr>
                {extras.map((r) => (
                  <tr key={`ex-${r.id}`} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold hidden md:table-cell">{r.number}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/players/${r.id}`}
                        className="text-blue-600 hover:underline"
                        title={`Vezi profilul lui ${r.name}`}
                      >
                        {r.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge className="bg-gray-100 text-gray-700">N/A</Badge>
                    </td>
                    <td className={cellHL(r.goals > 0, 'px-4 py-3 text-center', 'px-4 py-3 text-center bg-green-100 text-green-900 font-semibold rounded')}>
                      {r.goals}
                    </td>
                    <td className={cellHL(r.assists > 0, 'px-4 py-3 text-center', 'px-4 py-3 text-center bg-sky-100 text-sky-900 font-semibold rounded')}>
                      {r.assists}
                    </td>
                    <td className={cellHL(r.yellow > 0, 'px-4 py-3 text-center hidden md:table-cell', 'px-4 py-3 text-center bg-yellow-100 text-yellow-900 font-semibold rounded hidden md:table-cell')}>
                      {r.yellow}
                    </td>
                    <td className={cellHL(r.red, 'px-4 py-3 text-center hidden md:table-cell', 'px-4 py-3 text-center bg-red-100 text-red-900 font-semibold rounded hidden md:table-cell')}>
                      {r.red ? 'Da' : 'Nu'}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
