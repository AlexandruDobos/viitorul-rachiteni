import React, { useState } from 'react';
import AddPlayerForm from '../forms/AddPlayerForm';
import AddMatchForm from '../forms/AddMatchForm';
const AdminPanel = () => {
  const [activeView, setActiveView] = useState(null);

  return (
    <div className="pt-20 px-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Admin Panel</h1>
      <div className="flex gap-4 mb-6 justify-center">
        <button
          onClick={() => setActiveView('add-player')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add Player
        </button>
        <button
          onClick={() => setActiveView('add-match')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Add Match
        </button>
      </div>

      <div className="max-w-xl mx-auto">
        {activeView === 'add-player' && <AddPlayerForm />}
        {activeView === 'add-match' && <AddMatchForm />}
      </div>
    </div>
  );
};

export default AdminPanel;
