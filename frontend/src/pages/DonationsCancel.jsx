import React from 'react';
import { Link } from 'react-router-dom';

export default function DonationsCancel() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto rounded-2xl bg-white shadow ring-1 ring-gray-200 p-6 text-center">
        <div className="text-3xl">❕ Plata a fost anulată</div>
        <p className="mt-2 text-gray-600">
          Nu s-a efectuat nicio tranzacție. Poți încerca din nou oricând.
        </p>
        <Link to="/donations" className="mt-6 inline-flex items-center justify-center px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
          Înapoi la donații
        </Link>
      </div>
    </div>
  );
}
