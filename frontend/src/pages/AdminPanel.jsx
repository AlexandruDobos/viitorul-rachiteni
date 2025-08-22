// src/pages/AdminPanel.jsx
import React, { useState } from 'react';
import AddPlayerForm from '../forms/AddPlayerForm';
import AddMatchForm from '../forms/AddMatchForm';
import AddTeamForm from '../forms/AddTeamForm';
import AdsManager from '../forms/AdsManager';
import ContactEditor from '../forms/ContactEditor';
import LogoEditor from '../forms/LogoEditor';
import AppNameEditor from '../forms/AppNameEditor';
import AddAnnouncementForm from '../forms/AddAnnouncementForm';
import StandingsManager from '../forms/StandingsManager';
import CompetitionsManager from '../forms/CompetitionsManager';
import SocialLinksAdmin from './SocialLinksAdmin';

const AdminPanel = () => {
  const [activeView, setActiveView] = useState('add-announcement');

  const menuItems = [
    { key: 'add-announcement', label: 'Anunț nou' },
    { key: 'competitions', label: 'Competiții' },
    { key: 'matches', label: 'Meciuri' },
    { key: 'add-player', label: 'Jucători' },
    { key: 'add-team', label: 'Echipe' },
    { key: 'manage-ads', label: 'Reclame' },
    { key: 'social', label: 'Rețele sociale' }, // ← NOU
    { key: 'edit-contact', label: 'Pagina Contact' },
    { key: 'edit-logo', label: 'Logo App' },
    { key: 'edit-name', label: 'Nume App' },
    { key: 'edit-standings', label: 'Editare clasament' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'competitions': return <CompetitionsManager />;
      case 'add-player':   return <AddPlayerForm />;
      case 'add-team':     return <AddTeamForm />;
      case 'matches':      return <AddMatchForm />;
      case 'manage-ads':   return <AdsManager />;
      case 'social':       return <SocialLinksAdmin />; // ← NOU
      case 'edit-contact': return <ContactEditor />;
      case 'edit-logo':    return <LogoEditor />;
      case 'edit-name':    return <AppNameEditor />;
      case 'add-announcement': return <AddAnnouncementForm />;
      case 'edit-standings':   return <StandingsManager />;
      default: return <div>Selectează o acțiune din meniu.</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop Menu */}
      <aside className="hidden lg:block w-64 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-semibold mb-4">Meniu Admin</h2>
        <nav className="space-y-2">
          {menuItems.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              className={`w-full text-left px-4 py-2 rounded text-sm ${
                activeView === key ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Dropdown */}
      <div className="block lg:hidden px-4 pt-4 bg-gray-100 border-b z-10">
        <label htmlFor="adminMenu" className="block text-sm font-semibold mb-1">
          Selectează secțiunea:
        </label>
        <select
          id="adminMenu"
          value={activeView}
          onChange={(e) => setActiveView(e.target.value)}
          className="w-full p-2 border rounded"
          style={{ position: 'relative', zIndex: 20 }}
        >
          {menuItems.map(({ key, label }) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <main className="flex-1 p-4 md:p-8 bg-gray-50">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPanel;
