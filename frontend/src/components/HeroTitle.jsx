/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PILL_LABELS = ['Echipă', 'Comunitate', 'Pasiune'];
const DELAY_MS = 1200; // <- ~1.2s între pilule; poți pune 1000-2000

export default function HeroTitle({ text = 'ACS VIITORUL RĂCHITENI' }) {
  const [visibleCount, setVisibleCount] = useState(0);

  // dezvăluire progresivă a pilulelor
  useEffect(() => {
    setVisibleCount(0);
    let i = 0;
    const tick = () => {
      i += 1;
      setVisibleCount(i);
      if (i < PILL_LABELS.length) {
        timer = setTimeout(tick, DELAY_MS);
      }
    };
    let timer = setTimeout(tick, DELAY_MS);
    return () => clearTimeout(timer);
    // rerulează când se schimbă textul (ex: altă pagină/echipă)
  }, [text]);

  return (
    <div className="relative mx-auto mb-6 mt-2 max-w-4xl px-2">
      {/* glow discret în spatele titlului */}
      <div aria-hidden className="absolute inset-0 -z-10 flex justify-center">
        <div className="h-16 md:h-20 w-[70%] md:w-[60%] bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 blur-2xl opacity-25 rounded-full" />
      </div>

      {/* Titlu (cu tranziție la schimbarea textului) */}
      <div className="flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.h1
            key={text}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="text-center font-extrabold tracking-tight text-2xl md:text-3xl lg:text-4xl"
          >
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
              {text}
            </span>
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* Underline animat */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
        className="origin-left mx-auto mt-2 h-1 w-40 md:w-56 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500"
        aria-hidden="true"
      />

      {/* Semnătură: pilule „glass” cu reveal la 1.2s */}
      <div className="mx-auto mt-3 flex items-center justify-center gap-2">
        <AnimatePresence>
          {PILL_LABELS.slice(0, visibleCount).map((label) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="px-3 py-1 rounded-full text-[10px] md:text-xs font-medium
                         bg-white/60 text-gray-800 backdrop-blur
                         ring-1 ring-white/60 border border-transparent
                         relative"
            >
              {/* contur/granulație gradient */}
              <span className="absolute inset-0 rounded-full pointer-events-none
                               [background:linear-gradient(135deg,rgba(59,130,246,0.35),rgba(99,102,241,0.35),rgba(56,189,248,0.35))] opacity-70" aria-hidden />
              <span className="relative">{label}</span>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
