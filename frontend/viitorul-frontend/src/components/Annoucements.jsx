import React from 'react';
import viitorulImg from '../assets/rachiteni.jpg';

const Announcements = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          onClick={() => onSelect(i)}
          className="bg-white shadow rounded-lg overflow-hidden flex flex-col h-[300px] cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="h-[15%] flex items-center justify-center px-2">
            <h2 className="text-base font-semibold text-center">Titlu Anunț {i}</h2>
          </div>
          <div className="h-[80%] flex items-center justify-center bg-white">
            <img
              src={viitorulImg}
              alt={`Anunț ${i}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="h-[5%] text-center text-xs text-gray-500">
            Publicat pe: 03.07.2025
          </div>
        </div>
      ))}
    </div>
  );
};

export default Announcements;
