/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_PAGE_SIZE = 6; // /stiri: 6 pe pagină
const WINDOW = 5;

/* utils */
const slugify = (s = '') =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return iso || ''; }
}
function wordsExcerpt(text = '', maxWords = 26) {
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

/* CARD */
function AnnouncementCard({ a, isLCP = false }) {
  const imgSrc = toAbsoluteUrl(a.coverUrl);
  const href = `/stiri/${a.id}/${slugify(a.title || '')}`;

  return (
    <Link
      to={href}
      title={a.title}
      className="group block h-full rounded-2xl ring-1 ring-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.06)] overflow-hidden transition hover:shadow-[0_10px_28px_rgba(15,23,42,0.10)]"
    >
      {/* imagine 16:9 */}
      <div className="relative w-full">
        <div className="w-full aspect-[16/9] bg-slate-100" />
        {imgSrc && (
          <img
            src={imgSrc}
            alt={a.title}
            loading={isLCP ? 'eager' : 'lazy'}
            fetchpriority={isLCP ? 'high' : 'auto'}
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
            onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
          />
        )}
      </div>

      {/* conținut */}
      <div className="grid grid-rows-[auto_1fr_auto] px-4 py-4 sm:px-5 sm:py-5 h-[300px] sm:h-[320px] lg:h-[340px]">
        <h3 className="text-slate-900 font-semibold tracking-tight text-[15px] sm:text-base md:text-[17px] leading-snug line-clamp-3">
          {a.title}
        </h3>

        <p className="mt-1.5 text-sm sm:text-[15px] text-slate-600 line-clamp-2">
          {wordsExcerpt(a.contentText, 28)}
        </p>

        {/* separator FULL-BLEED -> nu mai e „întrerupt” */}
        <div className="mt-2">
          <div className="-mx-4 sm:-mx-5 border-t border-slate-200" />
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-indigo-700">
              {formatDate(a.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-slate-600 group-hover:text-indigo-700 transition">
              Citește
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M7.3 4.7a1 1 0 011.4 0L14 10l-5.3 5.3a1 1 0 11-1.4-1.4L11.17 10 7.3 6.1a1 1 0 010-1.4z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* animații */
const gridVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.06 } }, exit: { opacity: 0, y: -8, transition: { duration: 0.2 } } };
const itemVariants = { hidden: { opacity: 0, y: 12, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: 'easeOut' } }, exit: { opacity: 0, y: -8, transition: { duration: 0.18 } } };
const pagerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.1 } }, exit: { opacity: 0 } };

/* Buton „Vezi toate știrile” (full-width pe mobil) */
function ViewAllButton() {
  return (
    <Link
      to="/stiri"
      className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto justify-center"
    >
      Vezi toate știrile
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path d="M7.3 4.7a1 1 0 011.4 0L14 10l-5.3 5.3a1 1 0 11-1.4-1.4L11.17 10 7.3 6.1a1 1 0 010-1.4z" />
      </svg>
    </Link>
  );
}

const SkeletonCard = () => (
  <div className="h-full rounded-2xl ring-1 ring-slate-200 bg-white overflow-hidden">
    <div className="animate-pulse">
      <div className="aspect-[16/9] bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-200 rounded" />
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
      </div>
    </div>
  </div>
);

/* SECTION */
const AnnouncementsSection = ({
  limit,
  pageSize,
  title = 'Ultimele noutăți',
  enableSearch = false,
  variant = 'grid',
  showViewAll = true,
  viewAllPlacement = 'below',
}) => {
  // /stiri: 6 (implicit); homepage: limit=3
  const EFFECTIVE_SIZE = pageSize || (limit ? limit : DEFAULT_PAGE_SIZE);

  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: false, error: null });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');

  const topRef = useRef(null);
  const scrollToTop = () => {
    if (!topRef.current) return;
    const headerOffset = window.innerWidth < 1024 ? 64 : 0;
    const y = topRef.current.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };

  const pageNumbers = useMemo(() => {
    const total = Math.max(1, totalPages);
    const current = page + 1;
    const half = Math.floor(WINDOW / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + WINDOW - 1);
    start = Math.max(1, Math.min(start, end - WINDOW + 1));
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  const fetchPage = async (pageNum = 0, effectiveQuery = '') => {
    try {
      setState({ loading: true, error: null });
      const params = new URLSearchParams({ page: String(pageNum), size: String(EFFECTIVE_SIZE) });
      if (!limit && enableSearch) params.set('q', effectiveQuery || '');

      const res = await fetch(`${BASE_URL}/app/announcements/page?${params.toString()}`);
      if (!res.ok) throw new Error('Eroare la încărcarea anunțurilor');
      const data = await res.json();

      const content = data.content || [];
      // SIGURANȚĂ: pe homepage, taie local la 3
      setItems(limit ? content.slice(0, limit) : content);

      setTotalPages(data.totalPages || 1);
      setState({ loading: false, error: null });
    } catch (e) {
      console.error(e);
      setState({ loading: false, error: e.message || 'Eroare' });
    }
  };

  useEffect(() => {
    fetchPage(limit ? 0 : page, query);
    if (!limit) scrollToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, EFFECTIVE_SIZE, limit]);

  useEffect(() => {
    if (limit || !enableSearch) return;
    const t = setTimeout(() => {
      const newQ = queryInput.trim();
      setPage(0);
      setQuery(newQ);
      fetchPage(0, newQ);
      scrollToTop();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput, enableSearch, limit]);

  const showPager = !limit;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
        {showViewAll && !limit && <ViewAllButton />}
      </div>

      {/* search doar pe /stiri */}
      {enableSearch && !limit && (
        <div className="w-full sm:w-[520px] md:w-[560px] mx-auto relative">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Caută după titlu…"
            className="peer h-12 w-full rounded-full border border-slate-300 bg-white pl-10 pr-10 text-sm outline-none ring-indigo-600/20 shadow-sm transition focus:border-indigo-600 focus:ring-2"
            aria-label="Caută știri după titlu"
            inputMode="search"
            autoComplete="off"
          />
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 peer-focus:text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
          </svg>
          {queryInput && (
            <button
              type="button"
              onClick={() => { setQueryInput(''); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full text-slate-500 hover:text-slate-700"
              aria-label="Șterge căutarea"
              title="Șterge"
            >
              ×
            </button>
          )}
        </div>
      )}

      {/* GRID: 1 / 2 / 3 coloane (nu ajunge la 4) */}
      {state.loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit || DEFAULT_PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : state.error ? (
        <div className="bg-white rounded-2xl p-4 ring-1 ring-red-200 text-red-700">{state.error}</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 ring-1 ring-slate-200 text-slate-600">
          {enableSearch && query ? <>Nu s-a găsit niciun rezultat pentru „<strong>{query}</strong>”.</> : 'Nu există anunțuri momentan.'}
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={`page-${page}-${query || 'all'}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={gridVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {items.map((a, idx) => (
                <motion.div key={a.id ?? idx} variants={itemVariants} layout className="h-full">
                  <AnnouncementCard a={a} isLCP={page === 0 && idx === 0} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* buton sub grilă pe homepage */}
          {showViewAll && limit && (
            <div className="flex justify-center pt-2">
              <ViewAllButton />
            </div>
          )}

          {/* pager doar pe /stiri */}
          {showPager && totalPages > 1 && (
            <AnimatePresence>
              <motion.div className="flex items-center justify-center gap-2 pt-2" variants={pagerVariants} initial="hidden" animate="show" exit="exit">
                <button className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50" onClick={() => { setPage(0); scrollToTop(); }} disabled={page === 0} title="Prima pagină">«</button>
                <button className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50" onClick={() => { setPage((p) => Math.max(0, p - 1)); scrollToTop(); }} disabled={page === 0} title="Anterior">←</button>

                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    onClick={() => { setPage(n - 1); scrollToTop(); }}
                    className={`px-3 py-1.5 text-sm rounded-lg border border-slate-300 ${n - 1 === page ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-slate-50'}`}
                  >
                    {n}
                  </button>
                ))}

                <button className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50" onClick={() => { setPage((p) => Math.min(totalPages - 1, p + 1)); scrollToTop(); }} disabled={page === totalPages - 1} title="Următor">→</button>
                <button className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50" onClick={() => { setPage(totalPages - 1); scrollToTop(); }} disabled={page === totalPages - 1} title="Ultima pagină">»</button>
              </motion.div>
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
};

export default AnnouncementsSection;
