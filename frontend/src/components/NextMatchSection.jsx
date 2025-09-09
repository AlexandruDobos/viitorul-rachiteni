/* src/components/NextMatchSection.jsx */
import React, { useEffect, useMemo, useState } from "react";
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

function TeamBlock({ name, logo, align = "center" }) {
  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <motion.div
      className={`text-${align} grid place-items-center gap-3`}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ background:
            "radial-gradient(60% 60% at 50% 50%, rgba(59,130,246,0.35), transparent)"
          }}
          animate={{ opacity: [0.2, 0.4, 0.25, 0.35, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
          aria-hidden
        />
        {logo ? (
          <motion.img
            src={logo}
            alt={name}
            className="relative z-[1] mx-auto h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 object-contain drop-shadow-sm"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        ) : (
          <div className="relative z-[1] grid h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 place-items-center rounded-full bg-gray-100 text-gray-600 text-2xl font-bold ring-1 ring-gray-200">
            {initials || "?"}
          </div>
        )}
      </div>
      <motion.div
        className="font-extrabold text-gray-900 text-lg md:text-xl text-center leading-tight"
        initial={{ y: 6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
      >
        {name}
      </motion.div>
    </motion.div>
  );
}

function TimePill({ value, label }) {
  return (
    <motion.div
      className="grid gap-1 text-center"
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="min-w-[64px] rounded-2xl bg-white px-3 py-2 text-2xl md:text-3xl font-extrabold text-gray-900 shadow ring-1 ring-gray-200">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
    </motion.div>
  );
}

function Colon() {
  return (
    <motion.div
      className="text-xl md:text-3xl font-extrabold text-gray-400"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      :
    </motion.div>
  );
}

export default function NextMatchSection() {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/app/matches/next`);
        if (!res.ok) setMatch(null);
        else setMatch(await res.json());
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

  if (!match) return null;

  return (
    <section className="my-8">
      {/* CARD cu „breathe” + border glow */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-gray-100 bg-white"
      >
        {/* Glow dinamic în fundal */}
        <motion.div
          className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), transparent)",
          }}
          animate={{ y: [0, 10, 0], opacity: [0.25, 0.35, 0.25] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
        {/* Border animated shimmer */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(59,130,246,0.28), rgba(99,102,241,0.28), rgba(56,189,248,0.28), rgba(59,130,246,0.28))",
            mask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            padding: "1px",
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          aria-hidden
        />
        <div className="relative rounded-3xl p-6 md:p-8">
          {/* Header */}
          <div className="px-2 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.35 }}
              className="text-xl md:text-2xl font-extrabold tracking-tight"
            >
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
                URMĂTORUL MECI
              </span>
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.15, duration: 0.45, ease: "easeOut" }}
              className="origin-center mx-auto mt-2 h-1 w-28 md:w-40 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500"
            />
          </div>

          {/* TEAMS + CENTER INFO */}
          <div className="mt-6 grid grid-cols-1 items-center gap-6 md:mt-8 md:grid-cols-[1fr_auto_1fr] md:gap-10">
            <TeamBlock name={match.homeTeamName} logo={match.homeTeamLogo} align="center" />

            {/* VS + date/time/location */}
            <div className="text-center">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-1.5 text-sm font-semibold shadow"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                VS
              </motion.div>
              <motion.div
                className="mt-3 text-sm text-gray-600"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
              >
                {match.date}&nbsp;
                {match.kickoffTime ? `• ${match.kickoffTime.slice(0, 5)}` : ""}
                {match.location ? ` • ${match.location}` : ""}
              </motion.div>
            </div>

            <TeamBlock name={match.awayTeamName} logo={match.awayTeamLogo} align="center" />
          </div>

          {/* COUNTDOWN */}
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

          {/* CTA */}
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
