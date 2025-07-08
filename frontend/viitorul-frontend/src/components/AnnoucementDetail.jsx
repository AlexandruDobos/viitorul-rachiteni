import React from 'react';
import viitorulImg from '../assets/rachiteni.jpg';

const AnnouncementDetail = ({ id, onBack }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={onBack} className="text-sm text-blue-600 mb-4 hover:underline">← Înapoi la anunțuri</button>
      <h2 className="text-2xl font-bold mb-2">Titlu Anunț {id}</h2>
      <p className="text-sm text-gray-500 mb-4">Publicat pe: 03.07.2025</p>
      <img src={viitorulImg} alt={`Anunț ${id}`} className="w-full h-auto object-contain mb-4 rounded" />
      <p className="text-base leading-relaxed">Aici va fi conținutul detaliat al anunțului {id}...</p>
    </div>
  );
};

export default AnnouncementDetail;
