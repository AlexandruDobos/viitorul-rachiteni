import React, { useState } from 'react';
import { BASE_URL } from '../utils/constants';
const AddMatchForm = () => {
  const [formData, setFormData] = useState({
    homeTeam: '',
    awayTeam: '',
    date: '',
    location: '',
    competition: '',
    season: '',
    result: '',
    matchReportUrl: '',
    notes: '',
    kickoffTime: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/api/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Meci adăugat cu succes!');
        setFormData({
          homeTeam: '',
          awayTeam: '',
          date: '',
          location: '',
          competition: '',
          season: '',
          result: '',
          matchReportUrl: '',
          notes: '',
          kickoffTime: '',
        });
      } else {
        const error = await res.text();
        alert('Eroare: ' + error);
      }
    } catch (err) {
      console.error(err);
      alert('Eroare la conectare.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 space-y-4">
      <input name="homeTeam" placeholder="Echipă gazdă" value={formData.homeTeam} onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="awayTeam" placeholder="Echipă oaspete" value={formData.awayTeam} onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="date" type="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="kickoffTime" type="time" value={formData.kickoffTime} onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="location" placeholder="Locație" value={formData.location} onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="competition" placeholder="Competiție" value={formData.competition} onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="season" placeholder="Sezon" value={formData.season} onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="result" placeholder="Scor (ex: 2-1)" value={formData.result} onChange={handleChange} className="w-full p-2 border rounded" />
      <input name="matchReportUrl" placeholder="Link articol presă" value={formData.matchReportUrl} onChange={handleChange} className="w-full p-2 border rounded" />
      <textarea name="notes" placeholder="Observații" value={formData.notes} onChange={handleChange} className="w-full p-2 border rounded" />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Adaugă Meci</button>
    </form>
  );
};

export default AddMatchForm;
