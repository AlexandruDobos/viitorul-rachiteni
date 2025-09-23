/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';

const PILL_LABELS = ['Echipă', 'Comunitate', 'Pasiune'];

export default function HeroTitle({ text = 'ACS VIITORUL RĂCHITENI' }) {
  return (
    <div
      className="relative mx-auto mb-6 mt-2 max-w-4xl px-2 overflow-x-clip overflow-y-visible"
      // isolate paint/layout so this header doesn’t push siblings during anims
      style={{ contain: 'layout paint' }}
    >
      {/* Fără background/glow decorativ */}

      <div className="flex items-center justify-center">
        <motion.h1
          key={text}
          initial={{ opacity: 0, y: 8 }}        // transform-only
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-center font-extrabold tracking-tight text-2xl md:text-3xl lg:text-4xl"
          style={{ willChange: 'transform, opacity' }}
        >
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
            {text}
          </span>
        </motion.h1>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}                 // transform-only
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.45, ease: 'easeOut' }}
        className="origin-left mx-auto mt-2 h-1 w-40 md:w-56 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500"
        aria-hidden="true"
        style={{ willChange: 'transform' }}
      />

      {/* Pastile statice (fără animații) – min-width pentru stabilitate/CLS */}
      <div className="mx-auto mt-3 flex flex-wrap items-center justify-center gap-2 min-h-[32px]">
        {PILL_LABELS.map((label) => (
          <span
            key={label}
            className="
              inline-flex items-center justify-center
              px-3 py-1 rounded-full text-[11px] md:text-sm font-semibold text-white shadow-md
              bg-gradient-to-r from-blue-600 to-indigo-500 ring-1 ring-indigo-400/40
              min-w-[88px] md:min-w-[96px]
            "
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
