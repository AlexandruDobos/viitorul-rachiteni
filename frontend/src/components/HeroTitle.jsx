/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const PILL_LABELS = ['Echipă', 'Comunitate', 'Pasiune'];
const DELAY_STEP = 800; // ms

export default function HeroTitle({ text = 'ACS VIITORUL RĂCHITENI' }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timers = PILL_LABELS.map((_, i) =>
      setTimeout(() => setVisibleCount((c) => c + 1), (i + 1) * DELAY_STEP)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    // IMPORTANT: overflow-hidden ca să nu mai poată ieși blur-ul în afară
    <div className="relative mx-auto mb-6 mt-2 max-w-4xl px-2 overflow-hidden">
      {/* Glow discret – lățime limitată + centrat; pointer-events-none și -z pentru siguranță */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex justify-center"
      >
        <div className="h-16 md:h-20 w-full max-w-[640px] bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 blur-2xl opacity-30 rounded-full" />
      </div>

      {/* Titlu */}
      <div className="flex items-center justify-center">
        <motion.h1
          key={text}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center font-extrabold tracking-tight text-2xl md:text-3xl lg:text-4xl"
        >
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
            {text}
          </span>
        </motion.h1>
      </div>

      {/* Underline animat */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        className="origin-left mx-auto mt-2 h-1 w-40 md:w-56 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500"
        aria-hidden="true"
      />

      {/* Pilule – acum cu flex-wrap ca să nu împingă pe orizontală */}
      <div className="mx-auto mt-3 flex flex-wrap items-center justify-center gap-2 min-h-[32px]">
        {PILL_LABELS.slice(0, visibleCount).map((label, idx) => (
          <motion.span
            key={label}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: idx * 0.15, duration: 0.5, ease: 'easeOut' }}
            className="px-3 py-1 rounded-full text-[11px] md:text-sm font-semibold
                       text-white shadow-md
                       bg-gradient-to-r from-blue-600 to-indigo-500
                       ring-1 ring-indigo-400/40"
          >
            {label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
