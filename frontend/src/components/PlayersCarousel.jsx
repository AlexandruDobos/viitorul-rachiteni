/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

/* mici utilitare */
const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

/* card de jucător (umple o celulă din grid) */
function PlayerCard({ p }) {
  const img = p.profileImageUrl || "";
  const nr = p.shirtNumber ?? null;
  const name = p.name || "Jucător";
  const to = p?.id ? `/players/${p.id}` : "#";

  return (
    <Link
      to={to}
      className="group relative block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 rounded-2xl"
      title={`Deschide profilul lui ${name}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-gray-100">
        {nr != null && (
          <span
            className="absolute left-2 top-2 z-10 rounded-md px-1.5 py-0.5 text-[11px] font-semibold bg-indigo-600/90 text-white shadow-sm"
          >
            #{nr}
          </span>
        )}

        {img ? (
          <img
            src={img}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            width={600}
            height={800}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-20 w-20 rounded-full bg-gray-200 text-xl font-bold text-gray-600 grid place-items-center">
              {initials(name)}
            </div>
          </div>
        )}

        {/* gradient jos pentru lizibilitate */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* eticheta cu numele (click trece prin ea către Link) */}
      <div className="pointer-events-none absolute left-1/2 -bottom-3 -translate-x-1/2">
        <div className="rounded-xl bg-white px-4 py-2 text-center text-sm font-medium shadow ring-1 ring-gray-200">
          {name}
        </div>
      </div>
    </Link>
  );
}

/* carusel pe pagini: tel=1, tablet=2, laptop+=4 per cadru */
export default function PlayersCarousel({ title = "JUCĂTORI" }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [perPage, setPerPage] = useState(4);
  const [page, setPage] = useState(0);

  const railRef = useRef(null);

  /* injectăm CSS ca să ascundem scrollbar-ul */
  useEffect(() => {
    const id = "no-scrollbar-style";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.innerHTML = `
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      `;
      document.head.appendChild(s);
    }
  }, []);

  /* responsive: 1 / 2 / 4 per pagină */
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 640) setPerPage(1);          // < sm
      else if (w < 1024) setPerPage(2);    // < lg
      else setPerPage(4);                  // ≥ lg
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  /* fetch jucători — DOAR activii */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/app/players?activeOnly=true`);
        const data = await res.json();
        const onlyActive = (Array.isArray(data) ? data : []).filter(
          (p) => p.isActive !== false
        );
        setPlayers(onlyActive);
      } catch (e) {
        console.error("Failed to load players:", e);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* împărțim în pagini */
  const pages = useMemo(() => {
    if (!players.length) return [];
    const out = [];
    for (let i = 0; i < players.length; i += perPage) {
      out.push(players.slice(i, i + perPage));
    }
    if (page > out.length - 1) setPage(0);
    return out;
  }, [players, perPage]); // eslint-disable-line react-hooks/exhaustive-deps

  /* scroll la pagina x (100% din lățimea containerului) */
  const goTo = (idx) => {
    const el = railRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(idx, pages.length - 1));
    setPage(clamped);
    el.scrollTo({ left: el.clientWidth * clamped, behavior: "smooth" });
  };

  /* actualizează pagina curentă când utilizatorul derulează manual (swipe/drag) */
  const onScroll = () => {
    const el = railRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== page) setPage(idx);
  };

  /* navigare cu tastatura pe slider (←/→) */
  const onKeyDown = (e) => {
    if (pages.length <= 1) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(page - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(page + 1);
    }
  };

  return (
    <section className="mt-10">
      {/* Titlu + underline în paleta clubului */}
      <div className="text-center mb-4">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
            {title}
          </span>
        </h2>
        <div className="mx-auto mt-2 h-1 w-32 md:w-44 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500" />
      </div>

      {/* Carusel pe „pagini” */}
      <div className="relative overflow-hidden">
        {/* fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white to-transparent z-10" />

        {/* Butoane prev/next: vizibile DOAR pe mobil; ascunse pe md+ */}
        {pages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              aria-label="Anterior"
              className="md:hidden absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 shadow ring-1 ring-gray-200 hover:bg-white h-11 w-11 grid place-items-center"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M12.7 15.3a1 1 0 01-1.4 0L6 10l5.3-5.3a1 1 0 111.4 1.4L8.83 10l3.87 3.9a1 1 0 010 1.4z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo(page + 1)}
              aria-label="Următor"
              className="md:hidden absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 shadow ring-1 ring-gray-200 hover:bg-white h-11 w-11 grid place-items-center"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M7.3 4.7a1 1 0 011.4 0L14 10l-5.3 5.3a1 1 0 11-1.4-1.4L11.17 10 7.3 6.1a1 1 0 010-1.4z" />
              </svg>
            </button>
          </>
        )}

        {/* RAIL – fiecare „pagină” ocupă 100% lățime și are 1/2/4 carduri */}
        <div
          ref={railRef}
          onScroll={onScroll}
          onKeyDown={onKeyDown}
          tabIndex={0}
          aria-roledescription="carousel"
          aria-label="Carusel jucători"
          className="no-scrollbar relative flex overflow-x-auto scroll-smooth snap-x snap-mandatory focus:outline-none"
          style={{ willChange: "scroll-position" }}
        >
          {loading ? (
            <div className="mx-auto my-10 flex items-center gap-2 text-gray-500">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              Se încarcă jucătorii…
            </div>
          ) : pages.length === 0 ? (
            <div className="mx-auto my-8 text-gray-500">Nu există jucători de afișat.</div>
          ) : (
            pages.map((chunk, idx) => (
              <div
                key={idx}
                className="w-full flex-shrink-0 snap-center px-2 sm:px-3 py-4"
                role="group"
                aria-label={`Pagina ${idx + 1} din ${pages.length}`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {chunk.map((p) => (
                    <PlayerCard key={p.id} p={p} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pager (buline) — hit area ≥ 44px, semantic tabs pentru a11y */}
        {pages.length > 1 && (
          <div className="mt-4 flex justify-center gap-1.5" role="tablist" aria-label="Paginare carusel jucători">
            {pages.map((_, i) => {
              const active = i === page;
              return (
                <button
                  type="button"
                  key={i}
                  role="tab"
                  aria-label={`Pagina ${i + 1}`}
                  aria-selected={active}
                  onClick={() => goTo(i)}
                  className="relative inline-flex items-center justify-center min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 rounded-full"
                  title={`Pagina ${i + 1}`}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      "block h-2.5 w-2.5 rounded-full transition",
                      active
                        ? "bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 shadow ring-1 ring-indigo-400/40"
                        : "bg-gray-300 hover:bg-gray-400",
                    ].join(" ")}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
