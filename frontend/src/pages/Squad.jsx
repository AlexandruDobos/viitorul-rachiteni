/* eslint-disable no-unused-vars */
// src/pages/Squad.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

const PositionChip = ({ children }) => (
  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/70 text-white">
    {children}
  </span>
);

const NumberBadge = ({ children }) => (
  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold bg-white text-gray-900 shadow ring-1 ring-black/5">
    {children}
  </span>
);

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200">
    <div className="animate-pulse">
      <div className="relative bg-gray-200 aspect-[3/4]" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  </div>
);

const Squad = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [pos, setPos] = useState('ALL');

  useEffect(() => {
    fetch(`${BASE_URL}/api/app/players`)
      .then((res) => res.json())
      .then((data) => setPlayers(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Failed to load players:', err);
        setPlayers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const positions = useMemo(() => {
    const set = new Set(players.map((p) => p.position).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [players]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return players.filter((p) => {
      const okPos = pos === 'ALL' || p.position === pos;
      const okQ =
        !term ||
        (p.name || '').toLowerCase().includes(term) ||
        String(p.shirtNumber ?? '').includes(term);
      return okPos && okQ;
    });
  }, [players, q, pos]);

  return (
    <div className="px-4 max-w-[1200px] mx-auto">
      {/* ===== TITLU ANIMAT ===== */}
      <div className="relative mx-auto mt-2 mb-4 max-w-3xl px-2">
        {/* glow discret în spate */}
        <div aria-hidden className="absolute inset-0 -z-10 flex justify-center">
          <div className="h-12 md:h-16 w-[70%] md:w-[60%] bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 blur-2xl opacity-25 rounded-full" />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center font-extrabold tracking-tight text-2xl md:text-3xl"
        >
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
            Jucători ACS Viitorul Răchiteni
          </span>
        </motion.h1>

        {/* underline animat */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
          className="origin-left mx-auto mt-2 h-1 w-32 md:w-44 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500"
          aria-hidden="true"
        />
      </div>
      {/* ===== /TITLU ANIMAT ===== */}

      {/* Filtre simple */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Caută după nume sau număr..."
          className="flex-1 p-3 border rounded-lg"
        />
        <select
          value={pos}
          onChange={(e) => setPos(e.target.value)}
          className="p-3 border rounded-lg w-full sm:w-48"
        >
          {positions.map((p) => (
            <option key={p} value={p}>
              {p === 'ALL' ? 'Toate posturile' : p}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8 text-center text-gray-600">
          N-am găsit jucători pentru filtrul curent.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((player) => {
            const img = player.profileImageUrl;
            const name = player.name ?? 'Jucător';
            const posLbl = player.position ?? '';
            const nr = player.shirtNumber ?? null;

            return (
              <Link
                key={player.id}
                to={`/players/${player.id}`}
                className="group block overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 hover:ring-gray-300 hover:-translate-y-0.5 hover:shadow-md transition"
              >
                {/* Media */}
                <div className="relative aspect-[3/4] bg-gray-100">
                  {img ? (
                    <img
                      src={img}
                      alt={name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
                        {getInitials(name)}
                      </div>
                    </div>
                  )}

                  {/* Top badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    {nr != null && <NumberBadge>#{nr}</NumberBadge>}
                  </div>
                  <div className="absolute top-2 right-2">
                    {posLbl && <PositionChip>{posLbl}</PositionChip>}
                  </div>

                  {/* Bottom gradient + name */}
                  <div className="absolute inset-x-0 bottom-0">
                    <div className="h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="text-white font-semibold drop-shadow-sm truncate">
                        {name}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Squad;
