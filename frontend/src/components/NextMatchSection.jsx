/* src/components/NextMatchSection.jsx */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { motion } from "framer-motion";

const pad = (n) => String(n).padStart(2, "0");

function useCountdown(targetDate) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!targetDate) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return useMemo(() => {
    if (!targetDate) return { done: true, d: 0, h: 0, m: 0, s: 0 };
    const diff = Math.max(0, targetDate.getTime() - now);
    const done = diff <= 999;
    const d = Math.floor(diff / (24 * 3600 * 1000));
    const h = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
    const m = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    const s = Math.floor((diff % (60 * 1000)) / 1000);
    return { done, d, h, m, s };
  }, [now, targetDate]);
}

export default function NextMatchSection() {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch next match
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/app/matches/next`);
        if (!res.ok) {
          // dacă nu există meci viitor, ascundem secțiunea
          setMatch(null);
        } else {
          const data = await res.json();
          setMatch(data);
        }
      } catch (e) {
        console.error("Failed to load next match:", e);
        setMatch(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const targetDate = useMemo(() => {
    if (!match?.date) return null;
    // construim data locală „YYYY-MM-DDTHH:mm:ss”
    const time = match.kickoffTime ? match.kickoffTime : "12:00:00";
    return new Date(`${match.date}T${time}`);
  }, [match]);

  const { done, d, h, m, s } = useCountdown(targetDate);

  if (loading) {
    return (
      <section className="my-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            Se încarcă următorul meci…
          </div>
        </div>
      </section>
    );
  }

  // dacă nu există meci viitor -> nu afișăm secțiunea
  if (!match) return null;

  return (
    <section className="my-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-gray-100 bg-white"
      >
        {/* Glow colorat discret în fundal */}
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 blur-3xl opacity-25" />
        </div>

        {/* Header */}
        <div className="px-6 pt-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="text-xl md:text-2xl font-extrabold tracking-tight"
          >
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
              URMĂTORUL MECI
            </span>
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.45, ease: "easeOut" }}
            className="origin-center mx-auto mt-2 h-1 w-28 md:w-40 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500"
          />
        </div>

        {/* Conținut */}
        <div className="p-6 md:p-8">
          {/* Placă centrală cu echipele */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-10">
            {/* Gazde */}
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide text-gray-500">Acasă</div>
              <div className="mt-1 font-bold text-lg md:text-xl text-gray-900">
                {match.homeTeamName}
              </div>
              {match.homeTeamLogo ? (
                <img
                  src={match.homeTeamLogo}
                  alt={match.homeTeamName}
                  className="mx-auto mt-2 h-14 w-14 object-contain drop-shadow-sm"
                />
              ) : null}
            </div>

            {/* VS + info */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-1.5 text-sm font-semibold shadow">
                VS
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {match.date}&nbsp;
                {match.kickoffTime ? `• ${match.kickoffTime.slice(0,5)}` : ''}
                {match.location ? ` • ${match.location}` : ''}
              </div>
            </div>

            {/* Oaspeți */}
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide text-gray-500">Deplasare</div>
              <div className="mt-1 font-bold text-lg md:text-xl text-gray-900">
                {match.awayTeamName}
              </div>
              {match.awayTeamLogo ? (
                <img
                  src={match.awayTeamLogo}
                  alt={match.awayTeamName}
                  className="mx-auto mt-2 h-14 w-14 object-contain drop-shadow-sm"
                />
              ) : null}
            </div>
          </div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="mt-6 md:mt-8"
          >
            {done ? (
              <div className="text-center text-lg font-semibold text-emerald-700">
                Meciul este pe cale să înceapă!
              </div>
            ) : (
              <div className="text-center">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">
                  Începe în
                </div>
                <div className="mt-2 flex items-center justify-center gap-2 md:gap-4">
                  <TimePill label="Zile" value={pad(d)} />
                  <Colon />
                  <TimePill label="Ore" value={pad(h)} />
                  <Colon />
                  <TimePill label="Minute" value={pad(m)} />
                  <Colon />
                  <TimePill label="Sec" value={pad(s)} />
                </div>
              </div>
            )}
          </motion.div>

          {/* Buton detalii */}
          <div className="mt-6 text-center">
            <Link
              to={`/matches/${match.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 px-5 py-2.5 text-white font-semibold shadow hover:brightness-110 transition"
            >
              Detalii meci
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.3 4.7a1 1 0 011.4 0L14 10l-5.3 5.3a1 1 0 11-1.4-1.4L11.17 10 7.3 6.1a1 1 0 010-1.4z" />
              </svg>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function TimePill({ value, label }) {
  return (
    <div className="grid gap-1 text-center">
      <div className="min-w-[64px] rounded-2xl bg-white px-3 py-2 text-2xl md:text-3xl font-extrabold text-gray-900 shadow ring-1 ring-gray-200">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
    </div>
  );
}

function Colon() {
  return <div className="text-xl md:text-3xl font-extrabold text-gray-400">:</div>;
}
