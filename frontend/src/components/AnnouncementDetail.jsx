// components/AnnouncementDetail.jsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { BASE_URL } from '../utils/constants';

/* ---------- utils ---------- */
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('ro-RO', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso || '';
  }
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[m]));
}

/* ---------- skeleton ---------- */
const Skeleton = () => (
  <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
    <div className="mb-4 h-4 w-40 bg-gray-200 rounded animate-pulse" />
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200">
      <div className="px-5 md:px-8 pt-6 pb-4">
        <div className="h-8 bg-gray-200 rounded mx-auto w-2/3 animate-pulse" />
        <div className="mt-3 h-4 bg-gray-200 rounded mx-auto w-40 animate-pulse" />
      </div>
      <div className="relative bg-gray-200 aspect-[16/9] mx-5 md:mx-8 mb-6 rounded-2xl animate-pulse" />
      <div className="p-5 md:p-8 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
      </div>
    </div>
  </div>
);

/* ---------- component ---------- */
const AnnouncementDetail = ({ id, onBack }) => {
  const [item, setItem] = useState(null);
  const [state, setState] = useState({ loading: true, error: null });

  // Toast
  const [toast, setToast] = useState({ show: false, kind: 'success', text: '' });
  const toastTimer = useRef(null);
  const openToast = (text, kind = 'success', ms = 2200) => {
    setToast({ show: true, kind, text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), ms);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setState({ loading: true, error: null });
        const res = await fetch(`${BASE_URL}/app/announcements/${id}`);
        if (!res.ok) throw new Error('Eroare la încărcarea anunțului');
        const data = await res.json();
        setItem(data);
        setState({ loading: false, error: null });
      } catch (e) {
        setState({ loading: false, error: e.message || 'Eroare' });
      }
    };
    run();
  }, [id]);

  const shareUrl = useMemo(() => {
    return `https://api.viitorulrachiteni.ro/share/stiri/${id}`;
  }, [id]);


  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      openToast('Link copiat în clipboard! ✅', 'success');
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = shareUrl;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        openToast('Link copiat în clipboard! ✅', 'success');
      } catch {
        openToast('Nu am putut copia linkul.', 'error');
      }
    }
  };

  if (state.loading) return <Skeleton />;
  if (state.error) {
    return (
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <button onClick={onBack} className="text-sm text-blue-600 mb-4 hover:underline">
          ← Înapoi la anunțuri
        </button>
        <div className="bg-white rounded-xl p-4 ring-1 ring-red-200 text-red-700">
          {state.error}
        </div>
      </div>
    );
  }
  if (!item) return null;

  const hasCover = Boolean(item.coverUrl);

  // Fallback: dacă HTML-ul e gol, construim din contentText (păstrăm line breaks)
  const safeHtml =
    item.contentHtml && item.contentHtml.trim()
      ? item.contentHtml
      : (item.contentText || '')
        .split(/\n{2,}/)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`)
        .join('');

  return (
    <div className="pt-2 md:pt-4">
      {/* CSS pentru conținut – fix: img block + respectă width/align inline */}
      <style>{`
        .richtext p:empty::before { content: "\\00a0"; }
        .richtext img { display:block; height:auto; max-width:100%; }
      `}</style>

      {/* Toast */}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] transition-all ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        <div
          className={`pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ring-1 ${toast.kind === 'success'
            ? 'bg-emerald-600 text-white ring-emerald-500/60'
            : 'bg-red-600 text-white ring-red-500/60'
            }`}
        >
          {toast.kind === 'success' ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4 12 14.01l-3-3" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          )}
          <span className="font-medium text-sm">{toast.text}</span>
        </div>
      </div>

      {/* container principal */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <button onClick={onBack} className="mb-4 inline-flex items-center gap-1 text-blue-600 hover:underline">
          <span>←</span> Înapoi la anunțuri
        </button>

        {/* card */}
        <article className="overflow-hidden rounded-2xl bg-white shadow ring-1 ring-gray-200">
          {/* HEADER */}
          <header className="px-5 md:px-8 pt-6 pb-4 text-center">
            <h1
              className="
                font-sans font-extrabold uppercase tracking-tight leading-tight
                text-2xl md:text-3xl lg:text-4xl text-slate-900
              "
            >
              {item.title}
            </h1>

            <div className="mt-3 w-full max-w-[760px] mx-auto flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              <span className="whitespace-nowrap text-xs md:text-sm font-medium text-slate-600">
                Publicat: {formatDate(item.publishedAt)}
              </span>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            </div>
          </header>

          {/* HERO */}
          {hasCover && (
            <div className="mx-5 md:mx-8 mb-6">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl ring-1 ring-indigo-100/70 shadow-[0_10px_30px_rgba(30,58,138,0.12)]">
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
              </div>
            </div>
          )}

          {/* BODY */}
          <div className="p-5 md:p-8 lg:p-10">
            <div className="flex items-center justify-center gap-2 mb-6">
              <button onClick={copyLink} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50" title="Copiază link">
                Copiază link
              </button>
              {hasCover && (
                <a
                  href={item.coverUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50"
                >
                  Deschide imaginea
                </a>
              )}
            </div>

            <div
              className="
                richtext
                prose md:prose-lg lg:prose-xl
                max-w-none
                prose-headings:font-semibold
                prose-strong:font-semibold
                prose-p:my-5 md:prose-p:my-6
                prose-p:leading-7 md:prose-p:leading-8 lg:prose-p:leading-9
                prose-li:my-1.5 md:prose-li:my-2
                prose-a:text-blue-600 hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow
                prose-ul:list-disc prose-ol:list-decimal
                prose-blockquote:border-l-4 prose-blockquote:border-gray-300
                prose-hr:my-8
              "
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default AnnouncementDetail;
