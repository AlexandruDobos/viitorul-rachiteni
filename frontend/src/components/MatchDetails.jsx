/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
// src/components/MatchDetails.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
import AuthContext from '../context/AuthContext';

/* UI mici */
const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${className}`}>
    {children}
  </span>
);
const cellHL = (cond, base, active) => (cond ? active : base);
const Trophy = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M6 2a1 1 0 0 0-1 1v2H3a1 1 0 0 0-1 1c0 3.314 2.686 6 6 6 .9 1.198 2.236 2.07 3.777 2.38V17H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2.777v-2.62C13.764 13.07 15.1 12.198 16 11c3.314 0 6-2.686 6-6a1 1 0 0 0-1-1h-2V3a1 1 0 0 0-1-1H6Zm1 2h10v1a1 1 0 0 0 1 1h1.938c-.48 1.94-2.2 3.368-4.224 3.484A1 1 0 0 0 15 10c-1.022 1.704-2.877 3-5 3s-3.978-1.296-5-3a1 1 0 0 0-.714-.516C2.262 7.368.542 5.94.062 4H2a1 1 0 0 0 1-1V4h4Z"/>
  </svg>
);

/* Card MVP */
function MVPSpotlight({ isFinal, topPlayerId, getPlayerName, getPlayerImg, votesSummary }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isFinal || !topPlayerId) { setVisible(false); return; }
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, [isFinal, topPlayerId]);

  if (!isFinal || !topPlayerId) return null;

  const name = getPlayerName(topPlayerId);
  const img = getPlayerImg(topPlayerId);
  const votes = votesSummary.totals?.[topPlayerId] || 0;
  const total = votesSummary.totalVotes || 0;
  const pct = total ? Math.round((votes / total) * 100) : 0;

  return (
    <div
      className={[
        'relative mt-5',
        'rounded-2xl p-[2px]',
        'bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400',
        'shadow-xl',
        'transition-all duration-700',
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-[.98]',
      ].join(' ')}
      aria-live="polite"
    >
      <div className="relative rounded-2xl bg-white/70 backdrop-blur-md">
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-4 p-4 sm:p-5">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden ring-2 ring-white shadow-lg mx-auto sm:mx-0">
            {img ? (
              <img src={img} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center bg-gray-100 text-gray-500 text-xs">Fără foto</div>
            )}
          </div>

          <div className="min-w-0 text-center sm:text-left">
            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-indigo-600 font-semibold">
              Jucătorul meciului (live)
            </div>
            <div className="text-lg sm:text-2xl font-extrabold text-gray-900 truncate">{name}</div>
            <div className="mt-1 text-xs sm:text-sm text-gray-600">
              {votes} vot{votes === 1 ? '' : 'uri'} din {total} &middot; {pct}%
            </div>

            <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-600 transition-[width] duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchDetails() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  // 🔗 folosește AuthContext (fără requests separate pentru auth)
  const { user, loading: authLoading } = useContext(AuthContext);

  /* --- STATE --- */
  const [match, setMatch] = useState(null);
  const [matchStats, setMatchStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vot
  const [votesSummary, setVotesSummary] = useState({ totals: {}, totalVotes: 0 });
  const [myVote, setMyVote] = useState(null);
  const [savingVote, setSavingVote] = useState(false);

  // drept de vot = user autentificat (poți schimba să ceară un rol anume)
  const canVote = !!user;

  /* --- EFFECT: datele de bază --- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [resMatch, resStats, resPlayers] = await Promise.all([
          fetch(`${BASE_URL}/app/matches/${matchId}`),
          fetch(`${BASE_URL}/app/matches/player-stats/${matchId}`),
          fetch(`${BASE_URL}/app/players`),
        ]);
        const [matchData, statsData, playersData] = await Promise.all([
          resMatch.json(),
          resStats.json(),
          resPlayers.json(),
        ]);
        setMatch(matchData || null);
        setMatchStats(Array.isArray(statsData) ? statsData : []);
        setPlayers(Array.isArray(playersData) ? playersData : []);
      } catch (e) {
        console.error('Eroare la încărcarea datelor:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [matchId]);

  /* --- Votes summary loader --- */
  const loadVotes = async () => {
    try {
      const res = await fetch(`${BASE_URL}/app/matches/${matchId}/votes/summary`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setVotesSummary({
          totals: data?.totals || {},
          totalVotes: Number(data?.totalVotes || 0),
        });
      }
    } catch {}
  };

  /* --- My vote loader --- */
  const loadMyVote = async () => {
    if (!canVote) { setMyVote(null); return; }
    try {
      const res = await fetch(`${BASE_URL}/app/matches/${matchId}/my-vote`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMyVote(data?.playerId ?? null);
      } else if (res.status === 401) {
        setMyVote(null);
      }
    } catch {
      setMyVote(null);
    }
  };

  /* --- EFFECT: votes + myVote (reactiv la matchId și user) --- */
  useEffect(() => {
    (async () => {
      await loadVotes();
      await loadMyVote();
    })();
    const id = setInterval(loadVotes, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, canVote]); // recalculează când se schimbă user-ul (login/logout)

  /* --- MEMOs --- */
  const playersById = useMemo(() => {
    const m = new Map();
    for (const p of players) m.set(p.id, p);
    return m;
  }, [players]);

  const statsByPlayer = useMemo(() => {
    const m = new Map();
    for (const s of matchStats) m.set(s.playerId, s);
    return m;
  }, [matchStats]);

  const starterIds = match?.startingPlayerIds ?? [];
  const subIds = match?.substitutePlayerIds ?? [];

  const ballotIds = useMemo(
    () => Array.from(new Set([...(starterIds || []), ...(subIds || [])])),
    [starterIds, subIds]
  );

  // Tie-break: la egalitate luăm pe primul din buletin (determinist)
  const topPlayerId = useMemo(() => {
    const totals = votesSummary.totals || {};
    let bestId = null;
    let best = -1;
    for (const id of ballotIds) {
      const v = Number(totals[id] || 0);
      if (v > best || (v === best && bestId === null)) {
        best = v;
        bestId = id;
      }
    }
    return bestId;
  }, [votesSummary, ballotIds]);

  /* --- Early returns --- */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin" />
      </div>
    );
  }
  if (!match) {
    return <p className="text-center text-red-600">Nu s-au găsit detalii despre meci.</p>;
  }

  /* --- Helpers --- */
  const getPlayerName = (id) => playersById.get(id)?.name ?? `Jucător #${id}`;
  const getPlayerNumber = (id) => playersById.get(id)?.shirtNumber ?? '-';
  const getPlayerImg = (id) => playersById.get(id)?.profileImageUrl || '';

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

  const starters = starterIds.map((id) => makeRow(id, 'Titular'));
  const subs = subIds.map((id) => makeRow(id, 'Rezervă'));

  const extraIds = matchStats.map((s) => s.playerId).filter((id) => !starterIds.includes(id) && !subIds.includes(id));
  const extras = extraIds.map((id) => makeRow(id, 'Alții'));

  const competitionName = match.competitionName ?? match.competition?.name ?? match.competition ?? null;
  const seasonLabel = match.seasonLabel ?? match.season?.label ?? match.season ?? null;

  const isFinal = match.homeGoals != null && match.awayGoals != null;
  const showVoteColumn = isFinal && canVote;

  /* --- Vote --- */
  const handleVote = async (playerId) => {
    try {
      setSavingVote(true);
      const res = await fetch(`${BASE_URL}/app/matches/${matchId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ playerId }),
      });
      if (res.status === 401) {
        navigate(`/login?next=${encodeURIComponent(`/matches/${matchId}`)}`);
        return;
      }
      setMyVote(playerId);
      await loadVotes();
    } catch {
    } finally {
      setSavingVote(false);
    }
  };

  /* --- Render --- */
  return (
    <div className="px-4 max-w-[1100px] mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 font-medium hover:underline">
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
            {competitionName && <Badge className="bg-indigo-100 text-indigo-800">{competitionName}</Badge>}
            {seasonLabel && <Badge className="bg-gray-100 text-gray-800">{seasonLabel}</Badge>}
          </div>
        )}

        {match.notes && <p className="text-sm text-gray-500 mt-3">{match.notes}</p>}

        {match.matchReportUrl && (
          <div className="mt-3">
            <a href={match.matchReportUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              Citește articolul complet
            </a>
          </div>
        )}

        {/* CTA / status voting */}
        {isFinal && !canVote && (
          <div className="mt-4 rounded-lg bg-indigo-50 text-indigo-900 px-4 py-3 inline-flex items-center gap-3">
            <Trophy />
            <div>
              <div className="font-semibold">Votează jucătorul meciului</div>
              <div className="text-sm">
                <Link className="underline font-medium" to={`/login?next=${encodeURIComponent(`/matches/${matchId}`)}`}>
                  Conectează-te
                </Link>{' '}
                pentru a-ți înregistra votul (Titulari + Rezerve).
              </div>
            </div>
          </div>
        )}

        {isFinal && canVote && (
          <div className="mt-4 text-sm text-gray-600">
            {myVote ? (
              <>
                Ai votat pentru <span className="font-semibold text-gray-900">{getPlayerName(myVote)}</span>. Poți
                schimba votul oricând.
              </>
            ) : (
              <>
                Alege jucătorul tău favorit din coloana <span className="font-semibold">Vot</span> (un singur vot per
                utilizator – îl poți schimba).
              </>
            )}
          </div>
        )}

        <MVPSpotlight
          isFinal={isFinal}
          topPlayerId={topPlayerId}
          getPlayerName={getPlayerName}
          getPlayerImg={getPlayerImg}
          votesSummary={votesSummary}
        />
      </div>

      {/* Legendă */}
      <div className="mt-4 flex flex-wrap gap-3 items-center text-sm">
        <Badge className="bg-emerald-100 text-emerald-800">Titular</Badge>
        <Badge className="bg-amber-100 text-amber-800">Rezervă</Badge>
        <Badge className="bg-green-100 text-green-800">Goluri &gt; 0</Badge>
        <Badge className="bg-sky-100 text-sky-800">Assisturi &gt; 0</Badge>
        <Badge className="bg-yellow-100 text-yellow-800">Galbene &gt; 0</Badge>
        <Badge className="bg-red-100 text-red-800">Cartonaș roșu</Badge>
        {isFinal && <Badge className="bg-indigo-100 text-indigo-800">Jucătorul meciului</Badge>}
      </div>

      {/* Tabel */}
      <div className="mt-6 bg-white shadow rounded-xl">
        <div className="overflow-x-auto md:overflow-x-visible">
          <table className="min-w-full text-left text-sm md:text-base">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700 w-16 hidden md:table-cell">#</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Jucător</th>
                <th className="px-4 py-3 font-semibold text-gray-700 w-28 hidden md:table-cell">Rol</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-center md:w-20">Goluri</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-center md:w-24">Assisturi</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-center w-24 hidden md:table-cell">Galbene</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-center w-24 hidden md:table-cell">Roșu</th>
                {showVoteColumn && <th className="px-4 py-3 font-semibold text-gray-700 text-center w-24">Vot</th>}
              </tr>
            </thead>

            {/* Titulari */}
            <tbody>
              {starters.length > 0 && (
                <tr>
                  <td colSpan={showVoteColumn ? 8 : 7} className="px-4 py-2 bg-emerald-50 text-emerald-900 font-semibold">
                    Titulari
                  </td>
                </tr>
              )}
              {starters.map((r) => (
                <tr
                  key={`st-${r.id}`}
                  className={`border-t hover:bg-emerald-50/50 ${topPlayerId === r.id ? 'ring-1 ring-indigo-200 bg-indigo-50/40' : ''}`}
                >
                  <td className="px-4 py-3 font-semibold hidden md:table-cell">{r.number}</td>
                  <td className="px-4 py-3">
                    <Link to={`/players/${r.id}`} className="text-blue-600 hover:underline" title={`Vezi profilul lui ${r.name}`}>
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
                  {showVoteColumn && (
                    <td className="px-4 py-3 text-center">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="mvp"
                          checked={myVote === r.id}
                          onChange={() => handleVote(r.id)}
                          disabled={savingVote}
                          className="h-4 w-4 accent-indigo-600"
                        />
                        <span className="text-xs text-gray-500">
                          {(votesSummary.totals?.[r.id] || 0)} vot{(votesSummary.totals?.[r.id] || 0) === 1 ? '' : 'uri'}
                        </span>
                      </label>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>

            {/* Rezerve */}
            <tbody>
              {subs.length > 0 && (
                <tr>
                  <td colSpan={showVoteColumn ? 8 : 7} className="px-4 py-2 bg-amber-50 text-amber-900 font-semibold">
                    Rezerve
                  </td>
                </tr>
              )}
              {subs.map((r) => (
                <tr
                  key={`sub-${r.id}`}
                  className={`border-t hover:bg-amber-50/50 ${topPlayerId === r.id ? 'ring-1 ring-indigo-200 bg-indigo-50/40' : ''}`}
                >
                  <td className="px-4 py-3 font-semibold hidden md:table-cell">{r.number}</td>
                  <td className="px-4 py-3">
                    <Link to={`/players/${r.id}`} className="text-blue-600 hover:underline" title={`Vezi profilul lui ${r.name}`}>
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
                  {showVoteColumn && (
                    <td className="px-4 py-3 text-center">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="mvp"
                          checked={myVote === r.id}
                          onChange={() => handleVote(r.id)}
                          disabled={savingVote}
                          className="h-4 w-4 accent-indigo-600"
                        />
                        <span className="text-xs text-gray-500">
                          {(votesSummary.totals?.[r.id] || 0)} vot{(votesSummary.totals?.[r.id] || 0) === 1 ? '' : 'uri'}
                        </span>
                      </label>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>

            {/* Alții */}
            {extras.length > 0 && (
              <tbody>
                <tr>
                  <td colSpan={showVoteColumn ? 8 : 7} className="px-4 py-2 bg-gray-50 text-gray-700 font-semibold">
                    Alți jucători cu statistici
                  </td>
                </tr>
                {extras.map((r) => (
                  <tr key={`ex-${r.id}`} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold hidden md:table-cell">{r.number}</td>
                    <td className="px-4 py-3">
                      <Link to={`/players/${r.id}`} className="text-blue-600 hover:underline" title={`Vezi profilul lui ${r.name}`}>
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
                    {showVoteColumn && (
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-gray-400">—</span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
