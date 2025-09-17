// components/AnnouncementDetail.jsx
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { BASE_URL } from '../utils/constants';

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

const Skeleton = () => (
  <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
    <div className="mb-4 h-4 w-40 bg-gray-200 rounded animate-pulse" />
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200">
      <div className="relative bg-gray-200 aspect-[16/9] animate-pulse" />
      <div className="p-5 md:p-8 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
      </div>
    </div>
  </div>
);

const AnnouncementDetail = ({ id, onBack }) => {
  const [item, setItem] = useState(null);
  const [state, setState] = useState({ loading: true, error: null });

  // Toast state
  const [toast, setToast] = useState({ show: false, kind: 'success', text: '' });
  const toastTimer = useRef(null);

  const openToast = (text, kind = 'success', ms = 2200) => {
    setToast({ show: true, kind, text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), ms);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

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
    try {
      return window.location.href;
    } catch {
      return '';
    }
  }, []);

  // ✅ Custom copy (no alert/prompt). Falls back to execCommand if needed.
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
        <button
          onClick={onBack}
          className="text-sm text-blue-600 mb-4 hover:underline"
        >
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

  return (
    <div className="pt-2 md:pt-4">
      {/* Toast */}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] transition-all ${
          toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <div
          className={`pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ring-1 ${
            toast.kind === 'success'
              ? 'bg-emerald-600 text-white ring-emerald-500/60'
              : 'bg-red-600 text-white ring-red-500/60'
          }`}
        >
          {toast.kind === 'success' ? (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4 12 14.01l-3-3" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          )}
          <span className="font-medium text-sm">{toast.text}</span>
        </div>
      </div>

      {/* container lărgit la max-w-6xl pentru a ocupa tot spațiul coloanei centrale */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1 text-blue-600 hover:underline"
        >
          <span>←</span> Înapoi la anunțuri
        </button>

        {/* card pe toată lățimea disponibilă */}
        <article className="overflow-hidden rounded-2xl bg-white shadow ring-1 ring-gray-200">
          {/* HERO – imaginea umple complet lățimea cardului */}
          {hasCover ? (
            <div className="relative bg-gray-100 aspect-[16/9]">
              <img
                src={item.coverUrl}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.png';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 text-center">
                <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow">
                  {item.title}
                </h1>
                <p className="text-white/80 text-xs md:text-sm mt-1">
                  Publicat: {formatDate(item.publishedAt)}
                </p>
              </div>
            </div>
          ) : (
            <header className="px-5 md:px-8 pt-6 pb-2 text-center">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                {item.title}
              </h1>
              <p className="text-gray-500 text-xs md:text-sm mt-1">
                Publicat: {formatDate(item.publishedAt)}
              </p>
            </header>
          )}

          {/* BODY – conținutul folosește întreaga lățime a cardului */}
          <div className="p-5 md:p-8 lg:p-10">
            {/* butoane acțiune */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                onClick={copyLink}
                className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50"
                title="Copiază link"
              >
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

            {/* conținut formatat – fără limită de lățime în interiorul cardului */}
            <div
              className="
                prose prose-sm md:prose lg:prose-lg
                max-w-none
                prose-headings:font-semibold
                prose-a:text-blue-600 hover:prose-a:underline
                prose-img:rounded-lg prose-img:shadow
                prose-ul:list-disc prose-ol:list-decimal
                prose-blockquote:border-l-4 prose-blockquote:border-gray-300
              "
              dangerouslySetInnerHTML={{ __html: item.contentHtml }}
            />
          </div>
        </article>
      </div>
    </div>
  );
};

export default AnnouncementDetail;
