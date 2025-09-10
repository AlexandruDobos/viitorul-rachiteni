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

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 220, damping: 20 },
  },
};

const Squad = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [pos, setPos] = useState('ALL');

  useEffect(() => {
    // backendul returnează implicit doar activii (activeOnly=true)
    fetch(`${BASE_URL}/app/players`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        // defensiv: păstrăm DOAR activii chiar dacă backend-ul ar schimba default-ul
        setPlayers(list.filter((p) => p.isActive !== false));
      })
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
      <div className="relative mx-auto mt-2 mb-6 max-w-3xl px-2 text-center">
        {/* glow dinamic în spate */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0.2, scale: 0.95 }}
          animate={{ opacity: 0.35, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 -z-10 flex justify-center"
        >
          <div className="h-16 md:h-20 w-[75%] md:w-[60%] bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 blur-2xl rounded-full" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-extrabold tracking-tight text-2xl md:text-3xl"
        >
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
            JUCĂTORI ACS VIITORUL RĂCHITENI
          </span>
        </motion.h1>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        className="origin-left mx-auto mt-2 h-1 w-40 md:w-56 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500"
        aria-hidden="true"
      />
      </div>
      {/* ===== /TITLU ANIMAT ===== */}

      {/* Filtre simple */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-5 flex flex-col sm:flex-row gap-3 sm:items-center"
      >
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
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 p-8 text-center text-gray-600"
        >
          N-am găsit jucători pentru filtrul curent.
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filtered.map((player) => {
            const img = player.profileImageUrl;
            const name = player.name ?? 'Jucător';
            const posLbl = player.position ?? '';
            const nr = player.shirtNumber ?? null;

            return (
              <motion.div
                key={player.id}
                variants={cardVariants}
                whileHover={{ y: -4, rotate: -0.4 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                {/* Border gradient animat */}
                <div className="pointer-events-none absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-400 opacity-0 blur transition group-hover:opacity-40" />

                <Link
                  to={`/players/${player.id}`}
                  className="relative block overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-md transition will-change-transform"
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
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Squad;
