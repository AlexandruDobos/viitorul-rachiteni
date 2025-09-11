// src/components/AnnouncementsSection.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import AnnouncementDetail from './AnnouncementDetail';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_PAGE_SIZE = 4; // ✅ 4 per pagină
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

/** Animations */
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
const detailVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2 } },
};

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

/**
 * Props:
 * - limit: when present (e.g., homepage), shows first N items (no pager/search)
 * - pageSize: items per page for full page mode (default 4)
 * - title: section title
 * - enableSearch: show a search bar (server-side via ?q=)
 */
const AnnouncementsSection = ({ limit, pageSize, title = 'Ultimele noutăți', enableSearch = false }) => {
  const EFFECTIVE_SIZE = pageSize || limit || DEFAULT_PAGE_SIZE;

  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: false, error: null });
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(0); // 0-based
  const [totalPages, setTotalPages] = useState(1);

  // search state (only used if enableSearch)
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');

  // inject keyframes once for shine effect
  useEffect(() => {
    const id = 'ann-cards-keyframes';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.innerHTML = `
        @media (prefers-reduced-motion: no-preference) {
          .ann-card:hover .ann-shine { animation: annCardShine 900ms ease-in-out; }
          @keyframes annCardShine {
            0%   { transform: translateX(-120%) skewX(-18deg); opacity: .0; }
            30%  { opacity: .18; }
            60%  { opacity: .18; }
            100% { transform: translateX(130%) skewX(-18deg); opacity: 0; }
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const fetchPage = async (pageNum = 0, effectiveQuery = '') => {
    try {
      setState({ loading: true, error: null });
      const params = new URLSearchParams({
        page: String(pageNum),
        size: String(EFFECTIVE_SIZE),
      });
      if (enableSearch && effectiveQuery.trim()) {
        params.set('q', effectiveQuery.trim());
      }
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

  // initial + when page size / page / query changes
  useEffect(() => {
    fetchPage(page, query);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, EFFECTIVE_SIZE, query]);

  const pageNumbers = useMemo(() => {
    const total = Math.max(1, totalPages);
    const current = page + 1;
    const half = Math.floor(WINDOW / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + WINDOW - 1);
    start = Math.max(1, Math.min(start, end - WINDOW + 1));
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const onSearchSubmit = (e) => {
    e?.preventDefault?.();
    setPage(0);
    setQuery(queryInput);
  };

  const onClear = () => {
    setQueryInput('');
    setPage(0);
    setQuery('');
  };

  if (selectedId) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key={`detail-${selectedId}`} variants={detailVariants} initial="hidden" animate="show" exit="exit">
          <AnnouncementDetail id={selectedId} onBack={() => setSelectedId(null)} />
        </motion.div>
      </AnimatePresence>
    );
  }

  const showPager = !limit && totalPages > 1;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>

        {enableSearch && (
          <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
            <input
              type="search"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Caută după titlu…"
              className="h-11 w-64 max-w-[70vw] rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none ring-blue-600/20 transition focus:border-blue-600 focus:ring-2"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white shadow-sm hover:bg-blue-700"
            >
              Caută
            </button>
            {query || queryInput ? (
              <button
                type="button"
                onClick={onClear}
                className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                title="Șterge căutarea"
              >
                Reset
              </button>
            ) : null}
          </form>
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
        <div className="bg-white rounded-xl p-6 ring-1 ring-gray-200 text-gray-600">Nu există anunțuri momentan.</div>
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
              {items.map((a) => {
                const imgSrc = toAbsoluteUrl(a.coverUrl);
                return (
                  <motion.div key={a.id} variants={itemVariants} layout>
                    <button
                      onClick={() => setSelectedId(a.id)}
                      className="ann-card group w-full text-left overflow-hidden rounded-3xl bg-white ring-1 ring-gray-200 transition-all duration-300
                                 hover:-translate-y-[3px] hover:shadow-xl hover:ring-indigo-200/70 hover:shadow-indigo-100"
                      title={a.title}
                    >
                      <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={a.title}
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-500
                                       group-hover:scale-[1.02] group-hover:saturate-125 group-hover:contrast-110"
                            onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-gray-400">Fără imagine</div>
                        )}

                        {/* shine diagonal */}
                        <div
                          className="ann-shine pointer-events-none absolute top-0 bottom-0 w-1/3 -translate-x-full opacity-0"
                          style={{
                            background:
                              'linear-gradient(105deg, transparent 0%, rgba(255,255,255,.28) 45%, rgba(255,255,255,.05) 70%, transparent 100%)',
                          }}
                        />

                        {/* gradient de citire */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                        {/* titlu + dată + underline + CTA */}
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
                  </motion.div>
                );
              })}
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
