/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '../utils/constants';
import AnnouncementDetail from './AnnouncementDetail';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_PAGE_SIZE = 6;
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

/** Skeleton */
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

const AnnouncementsSection = ({ limit, pageSize, title = 'Ultimele noutăți' }) => {
  const EFFECTIVE_SIZE = pageSize || limit || DEFAULT_PAGE_SIZE;

  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: false, error: null });
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(0); // 0-based
  const [totalPages, setTotalPages] = useState(1);

  const fetchPage = async (pageNum = 0) => {
    try {
      setState({ loading: true, error: null });
      const url = `${BASE_URL}/app/announcements/page?page=${pageNum}&size=${EFFECTIVE_SIZE}`;
      const res = await fetch(url);
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

  useEffect(() => {
    fetchPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, EFFECTIVE_SIZE]);

  const pageNumbers = useMemo(() => {
    const total = Math.max(1, totalPages);
    const current = page + 1;
    const half = Math.floor(WINDOW / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + WINDOW - 1);
    start = Math.max(1, Math.min(start, end - WINDOW + 1));
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  if (selectedId) {
    return (
      <AnimatePresence mode="wait">
        <motion.div key={`detail-${selectedId}`} variants={detailVariants} initial="hidden" animate="show" exit="exit">
          <AnnouncementDetail id={selectedId} onBack={() => setSelectedId(null)} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header secțiune */}
      <div className="flex items-end justify-between">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
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
              key={`page-${page}`}
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
                      className="group w-full text-left overflow-hidden rounded-3xl bg-white ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-lg hover:-translate-y-1 transition"
                      title={a.title}
                    >
                      <div className="relative aspect-[16/9] bg-gray-100">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={a.title}
                            className="absolute inset-0 w-full h-full object-cover transform transition duration-300 group-hover:scale-105"
                            onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-gray-400">Fără imagine</div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <h3 className="text-white text-lg md:text-xl font-semibold leading-snug line-clamp-2">
                            {a.title}
                          </h3>
                          <p className="text-white/80 text-xs md:text-sm mt-1">
                            {formatDate(a.publishedAt)}
                          </p>
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
          {totalPages > 1 && (
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
