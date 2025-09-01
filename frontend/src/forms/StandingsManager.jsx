// src/forms/StandingsManager.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '../utils/constants';

const emptyRow = {
  rank: '',
  teamName: '',
  teamUrl: '',
  played: '',
  wins: '',
  draws: '',
  losses: '',
  goalsFor: '',
  goalsAgainst: '',
  points: '',
};

export default function StandingsManager() {
  const [sourceUrl, setSourceUrl] = useState(
    'https://www.frf-ajf.ro/iasi/competitii-fotbal/liga-a-v-a-seria-iii-13761/clasament'
  );
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load config + standings at mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [confRes, dataRes] = await Promise.all([
          fetch(`${BASE_URL}/app/standings/config`),
          fetch(`${BASE_URL}/app/standings`),
        ]);
        if (confRes.ok) {
          const conf = await confRes.json();
          if (conf?.sourceUrl) setSourceUrl(conf.sourceUrl);
          if (typeof conf?.scheduleEnabled === 'boolean')
            setScheduleEnabled(conf.scheduleEnabled);
        }
        if (dataRes.ok) {
          const data = await dataRes.json();
          setRows(Array.isArray(data?.rows) ? data.rows : []);
          setLastUpdated(data?.last_updated || null);
        }
      } catch (e) {
        setError(e.message || 'Eroare la încărcarea datelor');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addRow = () => setRows(prev => [...prev, { ...emptyRow }]);
  const removeRow = idx => setRows(prev => prev.filter((_, i) => i !== idx));
  const updateCell = (idx, key, value) => {
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r)));
  };

  const sortedRows = useMemo(() => {
    return [...rows].sort(
      (a, b) => Number(a.rank || 0) - Number(b.rank || 0)
    );
  }, [rows]);

  const handleScrape = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${BASE_URL}/app/standings/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl }),
      });
      if (!res.ok) throw new Error('Eroare la scraping');
      const data = await res.json();
      setRows(Array.isArray(data?.rows) ? data.rows : []);
      setLastUpdated(data?.last_updated || new Date().toISOString());
    } catch (e) {
      setError(e.message || 'Eroare la scraping');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const res = await fetch(`${BASE_URL}/app/standings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl: sourceUrl, // camelCase fix
          rows: rows,
        }),
      });
      if (!res.ok) throw new Error('Eroare la salvare');
      const data = await res.json();
      setLastUpdated(data?.last_updated || new Date().toISOString());
    } catch (e) {
      setError(e.message || 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  const toggleSchedule = async () => {
    const next = !scheduleEnabled;
    try {
      setScheduleEnabled(next);
      setError('');
      const res = await fetch(`${BASE_URL}/app/standings/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      });
      if (!res.ok) throw new Error('Nu am putut actualiza programarea');
    } catch (e) {
      setScheduleEnabled(!scheduleEnabled);
      setError(e.message || 'Eroare la actualizarea programării');
    }
  };

  return (
    <div className="space-y-6">
      {/* Titlu centrat */}
      <header className="text-center">
        <h2 className="text-xl font-semibold">Editare clasament</h2>
        <p className="text-sm text-gray-600">
          Configurează sursa, pornește scraping-ul, activează/dezactivează
          execuția automată și editează manual rândurile.
        </p>
      </header>

      {/* Buton Enable centrat */}
      <div className="flex justify-center">
        <button
          onClick={toggleSchedule}
          className={`px-4 py-2 rounded text-sm ${
            scheduleEnabled ? 'bg-green-600 text-white' : 'bg-gray-300'
          }`}
          title="Enable/Disable programatically scripts"
        >
          {scheduleEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* Link sursă + Start scraping centrate vertical */}
      <div className="flex flex-col items-center gap-3 bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium">Link sursă (clasament):</label>
        <input
          type="url"
          value={sourceUrl}
          onChange={e => setSourceUrl(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="https://www.frf-ajf.ro/iasi/competitii-fotbal/.../clasament"
        />
        <button
          onClick={handleScrape}
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Se încarcă…' : 'Start scraping'}
        </button>
        {lastUpdated && (
          <p className="text-xs text-gray-500">
            Ultima actualizare: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-lg shadow p-4 overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              {['#', 'Echipa', 'URL', 'M', 'V', 'E', 'I', 'GM', 'GP', 'P', ''].map(
                h => (
                  <th key={h} className="text-left px-2 py-2">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((r, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-2 py-1 w-12">
                  <input
                    value={r.rank ?? ''}
                    onChange={e => updateCell(idx, 'rank', e.target.value)}
                    className="w-12 border rounded px-1 py-1"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    value={r.teamName ?? ''}
                    onChange={e => updateCell(idx, 'teamName', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    value={r.teamUrl ?? ''}
                    onChange={e => updateCell(idx, 'teamUrl', e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    placeholder="https://..."
                  />
                </td>
                <td className="px-2 py-1 w-16">
                  <input
                    value={r.played ?? ''}
                    onChange={e => updateCell(idx, 'played', e.target.value)}
                    className="w-16 border rounded px-1 py-1"
                  />
                </td>
                <td className="px-2 py-1 w-16">
                  <input
                    value={r.wins ?? ''}
                    onChange={e => updateCell(idx, 'wins', e.target.value)}
                    className="w-16 border rounded px-1 py-1"
                  />
                </td>
                <td className="px-2 py-1 w-16">
                  <input
                    value={r.draws ?? ''}
                    onChange={e => updateCell(idx, 'draws', e.target.value)}
                    className="w-16 border rounded px-1 py-1"
                  />
                </td>
                <td className="px-2 py-1 w-16">
                  <input
                    value={r.losses ?? ''}
                    onChange={e => updateCell(idx, 'losses', e.target.value)}
                    className="w-16 border rounded px-1 py-1"
                  />
                </td>
                <td className="px-2 py-1 w-16">
                  <input
                    value={r.goalsFor ?? ''}
                    onChange={e => updateCell(idx, 'goalsFor', e.target.value)}
                    className="w-16 border rounded px-1 py-1"
                  />
                </td>
                <td className="px-2 py-1 w-16">
                  <input
                    value={r.goalsAgainst ?? ''}
                    onChange={e => updateCell(idx, 'goalsAgainst', e.target.value)}
                    className="w-16 border rounded px-1 py-1"
                  />
                </td>
                <td className="px-2 py-1 w-16">
                  <input
                    value={r.points ?? ''}
                    onChange={e => updateCell(idx, 'points', e.target.value)}
                    className="w-16 border rounded px-1 py-1"
                  />
                </td>
                <td className="px-2 py-1 w-10">
                  <button
                    onClick={() => removeRow(idx)}
                    className="text-red-600 hover:underline"
                  >
                    Șterge
                  </button>
                </td>
              </tr>
            ))}
            {sortedRows.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="text-center text-gray-500 py-8"
                >
                  Nu există rânduri încă. Apasă „Start scraping” sau „Adaugă
                  rând”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* +Adaugă rând și Salvează manual sub tabel */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={addRow}
          className="px-4 py-2 rounded border hover:bg-gray-50"
        >
          + Adaugă rând
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? 'Se salvează…' : 'Salvează manual'}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Programarea automată (duminică 15:00 și 20:00) este controlată de
        butonul „Enable programatically scripts”.
      </p>
    </div>
  );
}
