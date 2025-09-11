// src/pages/News.jsx
import React from 'react';
import AnnouncementsSection from '../components/AnnouncementsSection';

const News = () => {
  return (
    <div className="px-4 space-y-6">
      {/* Banner albastru frumos, în tonul site-ului */}
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl p-6 md:p-8 text-white ring-1 ring-indigo-400/40 shadow-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Știri</h1>
          <p className="mt-1 text-white/90 text-sm md:text-base">
            Ultimele anunțuri, rezultate și informații despre echipă.
          </p>
        </div>
      </div>

      {/* Secțiunea cu listă + căutare live + paginare (4 / pagină) */}
      <AnnouncementsSection title="Știri" enableSearch pageSize={4} />
    </div>
  );
};

export default News;
