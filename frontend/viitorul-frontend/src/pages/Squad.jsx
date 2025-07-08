// Squad.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
const Squad = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Înlocuiește cu endpointul real din backend
    fetch(`${BASE_URL}/api/app/players`)
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(err => console.error('Failed to load players:', err));
  }, []);

  return (
    <div className="pt-20 px-4 max-w-[1440px] mx-auto">
      <h1 className="text-2xl font-bold mb-4">Squad</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {players.map(player => (
          <Link
            to={`/squad/${player.id}`}
            key={player.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden text-center"
          >
            <img
              src={player.imageUrl || '/default-player.png'}
              alt={player.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-2">
              <h2 className="font-semibold text-sm">{player.name}</h2>
              <p className="text-xs text-gray-500">{player.position}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Squad;
