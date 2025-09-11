/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
import AnnouncementDetail from './AnnouncementDetail';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_PAGE_SIZE = 4; // 4 per pagină în modul listă/paginare
const WINDOW = 5;

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

/* -------------------- CARD ANUNȚ -------------------- */
function AnnouncementCard({ a, onOpen }) {
  const imgSrc = toAbsoluteUrl(a.coverUrl);
  return (
    <button
      onClick={() => onOpen?.(a.id)}
      className="group w-full text-left overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-[3px] hover:shadow-xl hover:ring-indigo-200/70 hover:shadow-indigo-100"
      title={a.title}
    >
      <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={a.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.02] group-hover:saturate-125 group-hover:contrast-110"
            onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-gray-400">Fără imagine</div>
        )}

        {/* overlay pentru lizibilitate */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-white text-lg md:text-xl font-semibold leading-snug line-clamp-2">
            {a.title}
          </h3>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-white/85 text-xs md:text-sm">{formatDate(a.publishedAt)}</p>
            <span className="inline-flex items-center gap-1 text-white/90 text-[11px] md:text-xs opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              Citește <span>→</span>
            </span>
          </div>
          <div className="mt-2 h-0.5 w-10 origin-left scale-x-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500 transition-transform duration-300 group-hover:scale-x-100" />
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm md:text-base text-gray-600 line-clamp-3">
          {wordsExcerpt(a.contentText, 30)}
        </p>
      </div>
    </button>
  );
}

/* -------------------- CARUSEL HOMEPAGE (limit mode) -------------------- */
function HomeAnnouncementsCarousel({ items, onOpen }) {
  // 1/2/4 pe cadru (mobil/tabletă/laptop)
  const [perPage, setPerPage] = useState(4);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 640) setPerPage(1);
      else if (w < 1024) setPerPage(2);
      else setPerPage(4);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const pages = useMemo(() => {
    if (!items?.length) return [];
    const out = [];
    for (let i = 0; i < items.length; i += perPage) out.push(items.slice(i, i + perPage));
    return out.length ? out : [items];
  }, [items, perPage]);

  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [perPage, items?.length]);

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(pages.length - 1, p + 1));

  return (
    <section
      className="
        rounded-3xl ring-1 ring-gray-100 bg-white/95 shadow-sm overflow-hidden
        bg-gradient-to-b from-white to-sky-50/30
      "
      aria-label="Ultimele noutăți"
    >
      {/* Header chenar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 items-center rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 px-3 text-xs font-semibold text-white shadow-sm">
            NOUTĂȚI
          </span>
          <span className="hidden sm:block text-sm text-gray-500">
            ultimele {items.length}
          </span>
        </div>

        {pages.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={prev}
              disabled={page === 0}
              className="rounded-full bg-white p-2 shadow ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Anterioare"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M12.7 15.3a1 1 0 01-1.4 0L6 10l5.3-5.3a1 1 0 111.4 1.4L8.83 10l3.87 3.9a1 1 0 010 1.4z" /></svg>
            </button>
            <button
              onClick={next}
              disabled={page === pages.length - 1}
              className="rounded-full bg-white p-2 shadow ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
              aria-label="Următoare"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M7.3 4.7a1 1 0 011.4 0L14 10l-5.3 5.3a1 1 0 11-1.4-1.4L11.17 10 7.3 6.1a1 1 0 010-1.4z" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Pista cu pagini – fără swipe/scroll, doar butoane */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${page * 100}%)`, width: `${pages.length * 100}%` }}
        >
          {pages.map((chunk, i) => (
            <div key={i} className="w-full flex-shrink-0 px-3 sm:px-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {chunk.map((a) => (
                  <AnnouncementCard key={a.id} a={a} onOpen={onOpen} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buline pager */}
      {pages.length > 1 && (
        <div className="pb-4 pt-2 flex justify-center gap-2">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={`Pagina ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === page
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 shadow ring-1 ring-indigo-400/40'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* -------------------- ANIMAȚII pentru modul listă -------------------- */
const gridVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.06 },
  },
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
      <div className="relative bg-gray-200 aspect-[16/9]" />
      <div className="p-5 space-y-4">
        <div className="h-5 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  </div>
);

/* -------------------- COMPONENTA PRINCIPALĂ -------------------- */
/**
 * Props:
 * - limit: când există (ex. homepage), arătăm un carusel într-un chenar mare (1/2/4 per cadru).
 * - pageSize: câte pe pagină în modul /stiri (default 4)
 * - title: titlul secțiunii în modul listă; ESTE ASCUNS în limit-mode
 * - enableSearch: bara de căutare în modul listă
 */
const AnnouncementsSection = ({ limit, pageSize, title = 'Ultimele noutăți', enableSearch = false }) => {
  const EFFECTIVE_SIZE = pageSize || limit || DEFAULT_PAGE_SIZE;

  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: false, error: null });
  const [selectedId, setSelectedId] = useState(null);

  // pagination pentru modul listă
  const [page, setPage] = useState(0); // 0-based
  const [totalPages, setTotalPages] = useState(1);

  // search (doar în modul listă)
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
      if (enableSearch && !limit) params.set('q', effectiveQuery || '');

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

  // inițial & când se schimbă pagina/mărimea paginii
  useEffect(() => {
    fetchPage(limit ? 0 : page, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, EFFECTIVE_SIZE]);

  // live search doar în modul listă
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

  // Detaliu anunț
  if (selectedId) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key={`detail-${selectedId}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
          <AnnouncementDetail id={selectedId} onBack={() => setSelectedId(null)} />
        </motion.div>
      </AnimatePresence>
    );
  }

  /* ---------- LIMIT MODE (homepage) = carusel manual în chenar ---------- */
  if (limit) {
    if (state.loading) {
      return (
        <section className="rounded-3xl ring-1 ring-gray-100 bg-white/95 shadow-sm overflow-hidden p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: Math.min(limit, 4) }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </section>
      );
    }
    if (state.error) {
      return <div className="rounded-3xl ring-1 ring-red-200 bg-white p-4 text-red-700">{state.error}</div>;
    }
    if (!items.length) {
      return <div className="rounded-3xl ring-1 ring-gray-200 bg-white p-6 text-gray-600">Nu există anunțuri momentan.</div>;
    }
    return <HomeAnnouncementsCarousel items={items.slice(0, limit)} onOpen={setSelectedId} />;
  }

  /* ---------- MODUL LISTĂ / PAGINARE (pagina /stiri) ---------- */

  const showTitle = Boolean(title) && !enableSearch; // în modul listă putem păstra titlul
  const showPager = totalPages > 1;

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
      <div className={`flex ${showTitle ? 'flex-col sm:flex-row sm:items-end sm:justify-between gap-3' : ''}`}>
        {showTitle && <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>}

        {enableSearch && (
          <div className={`${showTitle ? 'sm:ml-auto sm:w-96' : 'w-full'} relative`}>
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Caută după titlu…"
              className="peer h-12 w-full rounded-full border border-gray-300 bg-white pl-10 pr-10 text-sm outline-none ring-blue-600/20 shadow-sm transition
                         focus:border-blue-600 focus:ring-2"
              aria-label="Caută știri după titlu"
              inputMode="search"
              autoComplete="off"
            />
            {/* lupa */}
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
            {/* clear */}
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

      {/* Loading / Error / Empty */}
      {state.loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: EFFECTIVE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
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
          {/* GRID animat */}
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
          {showPager && (
            <AnimatePresence>
              <motion.div
                className="flex items-center justify-center gap-2 pt-4"
                variants={pagerVariants}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <button
                  className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  title="Prima pagină"
                >
                  «
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  title="Anterior"
                >
                  ←
                </button>

                {pageNumbers[0] > 1 && (
                  <>
                    <button className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50" onClick={() => setPage(0)}>
                      1
                    </button>
                    {pageNumbers[0] > 2 && <span className="px-1 text-sm text-gray-500">…</span>}
                  </>
                )}

                {pageNumbers.map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num - 1)}
                    className={`px-3 py-1.5 text-sm rounded-lg border ${
                      num - 1 === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                  <>
                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                      <span className="px-1 text-sm text-gray-500">…</span>
                    )}
                    <button
                      className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50"
                      onClick={() => setPage(totalPages - 1)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  title="Următor"
                >
                  →
                </button>
                <button
                  className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page === totalPages - 1}
                  title="Ultima pagină"
                >
                  »
                </button>
              </motion.div>
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
};

export default AnnouncementsSection;
