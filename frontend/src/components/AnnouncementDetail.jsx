// components/AnnouncementDetail.jsx
import React, { useEffect, useMemo, useState } from 'react';
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
  <div className="max-w-3xl mx-auto px-4 py-6">
    <div className="mb-4 h-4 w-40 bg-gray-200 rounded animate-pulse" />
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200">
      <div className="relative bg-gray-200 aspect-[16/9] animate-pulse" />
      <div className="p-5 md:p-7 space-y-3">
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

  useEffect(() => {
    const run = async () => {
      try {
        setState({ loading: true, error: null });
        const res = await fetch(`${BASE_URL}/api/app/announcements/${id}`);
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
      // dacă ai routing pe /announcements/:id, ajustează aici
      return window.location.href;
    } catch {
      return '';
    }
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copiat în clipboard!');
    } catch {
      // fallback simplu
      window.prompt('Copiază linkul:', shareUrl);
    }
  };

  if (state.loading) return <Skeleton />;
  if (state.error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
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
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1 text-blue-600 hover:underline"
        >
          <span>←</span> Înapoi la anunțuri
        </button>

        <article className="overflow-hidden rounded-2xl bg-white shadow ring-1 ring-gray-200">
          {/* HERO */}
          {hasCover ? (
            <div className="relative bg-gray-100 aspect-[16/9]">
              <img
                src={item.coverUrl}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 text-center">
                <h1 className="text-white text-2xl md:text-3xl font-bold drop-shadow">
                  {item.title}
                </h1>
                <p className="text-white/80 text-xs md:text-sm mt-1">
                  Publicat pe: {formatDate(item.publishedAt)}
                </p>
              </div>
            </div>
          ) : (
            <header className="px-5 md:px-7 pt-6 pb-2 text-center">
              <h1 className="text-2xl md:text-3xl font-bold">{item.title}</h1>
              <p className="text-gray-500 text-xs md:text-sm mt-1">
                Publicat pe: {formatDate(item.publishedAt)}
              </p>
            </header>
          )}

          {/* BODY */}
          <div className="p-5 md:p-7">
            {/* butoane acțiune */}
            <div className="flex items-center justify-center gap-2 mb-4">
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

            {/* conținut formatat */}
            <div
              className="
                prose prose-sm md:prose
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
