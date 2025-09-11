// src/pages/News.jsx
import React from 'react';
import AnnouncementsSection from '../components/AnnouncementsSection';

const News = () => {
  return (
    <div className="px-4">
      {/* Public site already has the fixed navbar spacing handled by the layout */}
      <AnnouncementsSection title="Știri" enableSearch pageSize={4} />
    </div>
  );
};

export default News;
