import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import AnnouncementsSection from '../components/AnnouncementsSection';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

const API_ORIGIN = (() => {
  try {
    return new URL(BASE_URL).origin;
  } catch {
    return BASE_URL || '';
  }
})();

/** Insert a <link rel="preconnect"> once per origin */
function preconnect(origin, cross = true) {
  if (!origin) return;
  const id = `preconnect-${origin}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'preconnect';
  link.href = origin;
  if (cross) link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

/** Idle-callback with fallback for older browsers */
function onIdle(cb, timeout = 1500) {
  const ric =
    window.requestIdleCallback ||
    ((fn) => setTimeout(() => fn({ timeRemaining: () => 0 }), timeout));
  return ric(cb, { timeout });
}

const Home = () => {
  // --- Network pre-warm and parallel fetches -----------------------------
  useEffect(() => {
    // 1) Preconnect to API (reduces handshake/TLS time in waterfall)
    preconnect(API_ORIGIN);

    // 2) Start critical data fetches IN PARALLEL (no auth/status wait)
    //    Even if components refetch, connections + caches are warm.
    const ac = new AbortController();
    const q = new URLSearchParams({ page: '0', size: '4' });

    // Start both without awaiting each other
    fetch(`${BASE_URL}/app/announcements/page?${q.toString()}`, {
      signal: ac.signal,
      credentials: 'include',
    }).catch(() => {});

    fetch(`${BASE_URL}/app/matches/next`, {
      signal: ac.signal,
      credentials: 'include',
    }).catch(() => {});

    // 3) Defer NON-critical endpoints (ads / social) to idle time
    const device = window.matchMedia('(max-width: 1023px)').matches
      ? 'MOBILE'
      : 'DESKTOP';

    const idleId = onIdle(() => {
      // Fire-and-forget; ignore errors intentionally
      fetch(`${BASE_URL}/app/ads?device=${device}`, { credentials: 'include' }).catch(() => {});
      fetch(`${BASE_URL}/app/social`, { credentials: 'include' }).catch(() => {});
    });

    return () => {
      ac.abort();
      // cancelIdleCallback fallback: clearTimeout is okay for our shim
      (window.cancelIdleCallback || clearTimeout)(idleId);
    };
  }, []);

  // -----------------------------------------------------------------------

  return (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Layout cu sidebar pe stânga + conținut */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
          {/* Un singur Sidebar (stânga) */}
          <aside className="hidden lg:block">
            <Sidebar />
          </aside>

          <main className="space-y-8">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white shadow">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#ffffff33,transparent_40%),radial-gradient(circle_at_80%_30%,#ffffff22,transparent_40%)]" />
              <div className="relative p-6 md:p-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold">ACS Viitorul Răchiteni</h1>
                    <p className="text-white/80 mt-1">
                      Știri, rezultate, program și informații despre echipă – totul într-un singur loc.
                    </p>
                  </div>

                  {/* CTA rapide (opțional) */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/squad"
                      className="px-4 py-2 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100"
                    >
                      Lotul echipei
                    </Link>
                    <Link
                      to="/results"
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 hover:bg-white/90"
                    >
                      Rezultate
                    </Link>
                    <Link
                      to="/standings"
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900 hover:bg-white/90"
                    >
                      Clasament
                    </Link>
                    <Link
                      to="/donations"
                      className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      Donează
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* ANUNȚURI */}
            <section>
              <AnnouncementsSection pageSize={4} />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;
