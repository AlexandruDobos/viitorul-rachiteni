/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import AnnouncementDetail from './AnnouncementDetail';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_PAGE_SIZE = 4; // pentru /stiri (mod listă)
const WINDOW = 5;

/* ===== utilitare ===== */
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('ro-RO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso || '';
  }
}
function wordsExcerpt(text = '', maxWords = 24) {
  const words = (text || '').trim().split(/\s+/);
  if (words.length <= maxWords) return text || '';
  return words.slice(0, maxWords).join(' ') + '…';
}
function toAbsoluteUrl(maybeUrl) {
  if (!maybeUrl) return null;
  if (/^https?:\/\//i.test(maybeUrl)) return maybeUrl;
  const base = (BASE_URL || '').replace(/\/$/, '');
  const path = String(maybeUrl).replace(/^\//, '');
  return `${base}/${path}`;
}

/* =========================================================
   CARD ANUNȚ – chenar FIX + imagine FIT (fără crop)
   ========================================================= */
function AnnouncementCard({ a, onOpen }) {
  const imgSrc = toAbsoluteUrl(a.coverUrl);

  return (
    <button
      type="button"
      onClick={() => onOpen?.(a.id)}
      title={a.title}
      className="group block w-full text-left"
    >
      {/* CHENARUL mare – transparență în paleta site-ului, NU își schimbă înălțimea după poză */}
      <div
        className="
          relative rounded-3xl p-3 sm:p-4
          bg-gradient-to-br from-indigo-500/10 via-sky-500/10 to-blue-500/10
          ring-1 ring-indigo-200/50 shadow-[0_10px_30px_rgba(30,58,138,0.10)]
          backdrop-blur-sm
        "
      >
        {/* CHENARUL interior FIX pentru imagine (preview box) */}
        <div
          className="
            relative overflow-hidden rounded-2xl
            ring-1 ring-white/60 bg-white/70
          "
        >
          {/* Înălțime FIXĂ pe breakpoints:
             - mobil:   220px
             - tabletă: 300px
             - laptop:  380px
             - desktop mare: 440px
          */}
          <div className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[440px]">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={a.title}
                /* FIT – fără crop/zoom */
                className="absolute inset-0 h-full w-full object-contain object-center"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.png';
                }}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-gray-400">
                Fără imagine
              </div>
            )}

            {/* overlay subtil pentru lizibilitate – acoperă și barele letterbox */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />

            {/* titlu + dată în interiorul chenarului de imagine */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <h3 className="text-white font-extrabold uppercase tracking-tight leading-tight drop-shadow
                              text-xl sm:text-2xl lg:text-3xl">
                {a.title}
              </h3>
              <p className="mt-1 text-white/85 text-xs sm:text-sm">{formatDate(a.publishedAt)}</p>
              <div className="mt-2 h-0.5 w-12 origin-left scale-x-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 transition-all duration-300 group-hover:scale-x-100" />
            </div>
          </div>
        </div>

        {/* descriere scurtă sub boxul fix – nu afectează înălțimea imaginii */}
        <div className="p-4">
          <p className="text-sm sm:text-base text-gray-700">
            {wordsExcerpt(a.contentText, 36)}
          </p>
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   CARUSEL HOMEPAGE – 1 anunț / ecran + butoane + swipe
   ========================================================= */
function HomeAnnouncementsCarousel({ items, onOpen }) {
  const [page, setPage] = useState(0);
  const pages = useMemo(() => (items?.length ? items : []), [items]);

  const dragRef = useRef({ startX: 0, deltaX: 0, active: false });
  const THRESH = 40;

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(pages.length - 1, p + 1));

  // swipe
  const onPointerDown = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    dragRef.current = { startX: x, deltaX: 0, active: true };
  };
  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    dragRef.current.deltaX = x - dragRef.current.startX;
  };
  const onPointerUp = () => {
    if (!dragRef.current.active) return;
    const { deltaX } = dragRef.current;
    dragRef.current.active = false;
    if (Math.abs(deltaX) > THRESH) (deltaX > 0 ? prev() : next());
  };

  // accesibilitate
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  return (
    <section
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="
        relative select-none
        rounded-[32px] overflow-hidden
        ring-1 ring-indigo-200/50
        bg-white/60 backdrop-blur-sm
        bg-gradient-to-b from-white via-sky-50/40 to-indigo-50/30
        shadow-[0_12px_40px_rgba(30,58,138,0.10)]
        px-2 sm:px-4 md:px-6 py-4 md:py-6
      "
      style={{ touchAction: 'pan-y' }}
      aria-label="Anunțuri"
    >
      {/* butoane discrete în colțul dreapta-sus */}
      {pages.length > 1 && (
        <div className="absolute right-3 top-3 z-20 flex gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Anterior"
            disabled={page === 0}
            className="rounded-xl bg-white/95 p-2 shadow ring-1 ring-indigo-200/60 hover:bg-white disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M12.7 15.3a1 1 0 01-1.4 0L6 10l5.3-5.3a1 1 0 111.4 1.4L8.83 10l3.87 3.9a1 1 0 010 1.4z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Următor"
            disabled={page === pages.length - 1}
            className="rounded-xl bg-white/95 p-2 shadow ring-1 ring-indigo-200/60 hover:bg-white disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.3 4.7a1 1 0 011.4 0L14 10l-5.3 5.3a1 1 0 11-1.4-1.4L11.17 10 7.3 6.1a1 1 0 010-1.4z" />
            </svg>
          </button>
        </div>
      )}

      {/* rail: 1 card pe ecran; toate cardurile au aceeași înălțime fixă */}
      <div
        className="relative overflow-hidden rounded-[24px]"
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${page * 100}%)`, width: `${pages.length * 100}%` }}
        >
          {pages.map((a, i) => (
            <div key={a.id ?? i} className="w-full flex-shrink-0 px-1 sm:px-2 md:px-3">
              <AnnouncementCard a={a} onOpen={onOpen} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== animații pentru /stiri ===== */
const gridVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.06 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};
const pagerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.1 } }, exit: { opacity: 0 } };

const SkeletonCard = () => (
  <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-gray-200">
    <div className="animate-pulse">
      <div className="relative bg-gray-200 h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[440px]" />
      <div className="p-5 space-y-4">
        <div className="h-5 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  </div>
);

/* =========================================================
   COMPONENTA PRINCIPALĂ
   - homepage (limit): carusel 1x, fără text „noutăți”
   - /stiri: listă + paginare (+ opțional search)
   ========================================================= */
const AnnouncementsSection = ({ limit, pageSize, title = 'Ultimele noutăți', enableSearch = false }) => {
  const EFFECTIVE_SIZE = pageSize || limit || DEFAULT_PAGE_SIZE;

  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: false, error: null });
  const [selectedId, setSelectedId] = useState(null);

  // paginare /stiri
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // search /stiri
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');

  // fetch helper
  const fetchPage = async (pageNum = 0, effectiveQuery = '') => {
    try {
      setState({ loading: true, error: null });
      const params = new URLSearchParams({
        page: String(pageNum),
        size: String(EFFECTIVE_SIZE),
      });
      if (!limit && enableSearch) params.set('q', effectiveQuery || '');

      const res = await fetch(`${BASE_URL}/app/announcements/page?${params.toString()}`);
      if (!res.ok) throw new Error('Eroare la încărcarea anunțurilor');
      const data = await res.json();
      setItems(data.content || []);
      setTotalPages(data.totalPages || 1);
      setState({ loading: false, error: null });
    } catch (e) {
      console.error(e);
      setState({ loading: false, error: e.message || 'Eroare' });
    }
  };

  // inițial & la schimbări
  useEffect(() => {
    fetchPage(limit ? 0 : page, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, EFFECTIVE_SIZE]);

  // live search doar pe /stiri
  useEffect(() => {
    if (limit || !enableSearch) return;
    const t = setTimeout(() => {
      const newQ = queryInput.trim();
      setPage(0);
      setQuery(newQ);
      fetchPage(0, newQ);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput, enableSearch, limit]);

  // Detaliu
  if (selectedId) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`detail-${selectedId}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <AnnouncementDetail id={selectedId} onBack={() => setSelectedId(null)} />
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ---------- HOMEPAGE: CARUSEL 1x ---------- */
  if (limit) {
    if (state.loading) {
      return (
        <section className="rounded-[32px] ring-1 ring-indigo-200/50 bg-white/60 backdrop-blur-sm px-3 sm:px-4 md:px-6 py-5 shadow-[0_12px_40px_rgba(30,58,138,0.10)]">
          <SkeletonCard />
        </section>
      );
    }
    if (state.error) {
      return <div className="rounded-[32px] ring-1 ring-red-200 bg-white p-4 text-red-700">{state.error}</div>;
    }
    if (!items.length) {
      return <div className="rounded-[32px] ring-1 ring-gray-200 bg-white p-6 text-gray-600">Nu există anunțuri momentan.</div>;
    }
    return <HomeAnnouncementsCarousel items={items.slice(0, limit)} onOpen={setSelectedId} />;
  }

  /* ---------- /stiri: GRID + PAGINARE + (opțional) SEARCH ---------- */
  const pageNumbers = useMemo(() => {
    const total = Math.max(1, totalPages);
    const current = page + 1;
    const half = Math.floor(WINDOW / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + WINDOW - 1);
    start = Math.max(1, Math.min(start, end - WINDOW + 1));
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const onClear = () => {
    setQueryInput('');
    setPage(0);
    setQuery('');
    fetchPage(0, '');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* titlu + search (doar /stiri). pe homepage nu afișăm „noutăți” */}
      <div className={`flex ${!enableSearch ? 'flex-col sm:flex-row sm:items-end sm:justify-between gap-3' : ''}`}>
        {!enableSearch && <h2 className="text-2xl md:text-3xl font-bold">Ultimele noutăți</h2>}

        {enableSearch && (
          <div className="w-full sm:w-96 sm:ml-auto relative">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Caută după titlu…"
              className="peer h-12 w-full rounded-full border border-gray-300 bg-white pl-10 pr-10 text-sm outline-none ring-blue-600/20 shadow-sm transition focus:border-blue-600 focus:ring-2"
              aria-label="Caută știri după titlu"
              inputMode="search"
              autoComplete="off"
            />
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 peer-focus:text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            {queryInput && (
              <button
                type="button"
                onClick={onClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full text-gray-500 hover:text-gray-700"
                aria-label="Șterge căutarea"
                title="Șterge"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* listă /stiri */}
      {state.loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: DEFAULT_PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : state.error ? (
        <div className="bg-white rounded-xl p-4 ring-1 ring-red-200 text-red-700">{state.error}</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200 text-gray-600">
          {enableSearch && query
            ? <>Nu s-a găsit niciun rezultat pentru „<strong>{query}</strong>”.</>
            : 'Nu există anunțuri momentan.'}
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={`page-${page}-${query || 'all'}`}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={gridVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {items.map((a) => (
                <motion.div key={a.id} variants={itemVariants} layout>
                  <AnnouncementCard a={a} onOpen={setSelectedId} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* PAGINARE */}
          {totalPages > 1 && (
            <AnimatePresence>
              <motion.div
                className="flex items-center justify-center gap-2 pt-4"
                variants={pagerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <button className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => setPage(0)} disabled={page === 0} title="Prima pagină">«</button>
                <button className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} title="Anterior">←</button>

                {(() => {
                  const total = Math.max(1, totalPages);
                  const current = page + 1;
                  const half = Math.floor(WINDOW / 2);
                  let start = Math.max(1, current - half);
                  let end = Math.min(total, start + WINDOW - 1);
                  start = Math.max(1, Math.min(start, end - WINDOW + 1));
                  const nums = Array.from({ length: end - start + 1 }, (_, i) => start + i);
                  return (
                    <>
                      {nums[0] > 1 && (
                        <>
                          <button className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50" onClick={() => setPage(0)}>1</button>
                          {nums[0] > 2 && <span className="px-1 text-sm text-gray-500">…</span>}
                        </>
                      )}
                      {nums.map((n) => (
                        <button key={n}
                          onClick={() => setPage(n - 1)}
                          className={`px-3 py-1.5 text-sm rounded-lg border ${n - 1 === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}>
                          {n}
                        </button>
                      ))}
                      {nums[nums.length - 1] < totalPages && (
                        <>
                          {nums[nums.length - 1] < totalPages - 1 && <span className="px-1 text-sm text-gray-500">…</span>}
                          <button className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50" onClick={() => setPage(totalPages - 1)}>{totalPages}</button>
                        </>
                      )}
                    </>
                  );
                })()}

                <button className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1} title="Următor">→</button>
                <button className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1} title="Ultima pagină">»</button>
              </motion.div>
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
};

export default AnnouncementsSection;
