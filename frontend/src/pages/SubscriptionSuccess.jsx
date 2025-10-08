import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

export default function SubscriptionSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [err, setErr] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        if (!sessionId) return;
        setLoading(true);
        const res = await fetch(`${BASE_URL}/donations/subscriptions/session/${sessionId}`);
        if (!res.ok) throw new Error('Nu am putut încărca detaliile abonamentului.');
        const json = await res.json();
        if (!ignore) setData(json);
      } catch (e) {
        if (!ignore) setErr(e.message || 'Eroare');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [sessionId]);

  // confetti minimal (ca la DonationsSuccess)
  useEffect(() => {
    if (!sessionId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = (canvas.width = canvas.offsetWidth);
    let H = (canvas.height = canvas.offsetHeight);
    const onResize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);
    const colors = ['#16a34a', '#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6'];
    const confetti = Array.from({ length: 160 }, () => ({
      x: Math.random() * W, y: -20 - Math.random() * H * 0.5, r: 3 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: 2 + Math.random() * 3, vx: Math.random() * 1 - 0.5, rot: Math.random() * Math.PI, vr: Math.random() * 0.2 - 0.1
    }));
    let start = performance.now();
    let raf;
    const draw = (t) => {
      const elapsed = (t - start) / 1000;
      ctx.clearRect(0, 0, W, H);
      confetti.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.moveTo(0, -p.r); ctx.lineTo(p.r, 0); ctx.lineTo(0, p.r); ctx.lineTo(-p.r, 0); ctx.closePath(); ctx.fill();
        ctx.restore();
      });
      if (elapsed < 6) raf = requestAnimationFrame(draw);
      else if (elapsed < 7.5) { ctx.fillStyle = `rgba(255,255,255,${(elapsed - 6) / 1.5})`; ctx.fillRect(0, 0, W, H); raf = requestAnimationFrame(draw); }
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); ctx.clearRect(0,0,W,H); };
  }, [sessionId]);

  const prettyInterval = (s) => (s || '').toUpperCase() === 'MONTH' ? 'lunar' : (s || '').toLowerCase();

  return (
    <div className="relative px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <canvas ref={canvasRef} className="w-full h-full block"></canvas>
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
          <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-10 text-white">
            <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs><pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>
            </div>
            <div className="relative flex flex-col items-center text-center gap-4">
              <svg className="h-16 w-16" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-90" cx="26" cy="26" r="24" stroke="white" strokeWidth="2" />
                <path d="M16 27.5 L23 34 L36 18" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                  style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: 'dash 1.2s ease-out forwards 0.2s' }} />
              </svg>
              <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Mulțumim — abonament activ! 🎉</h1>
              <p className="text-white/90 max-w-xl">
                Abonamentul tău ne ajută constant. Poți gestiona plata din emailul Stripe (portal abonament).
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {loading && (
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-4 w-2/5 bg-gray-200 rounded"></div>
                <div className="h-24 w-full bg-gray-100 rounded-lg"></div>
              </div>
            )}

            {!loading && err && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {err}
              </div>
            )}

            {!loading && !err && (
              <>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Plan</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">
                      {data?.amount ? `${data.amount} ${data?.currency?.toUpperCase()}/lună` : '—'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Status</div>
                    <div className="mt-1 inline-flex items-center gap-2 text-gray-900">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold">{(data?.status || '').toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Frecvență</div>
                    <div className="mt-1 text-gray-900 text-sm">{prettyInterval(data?.interval)}</div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">ID sesiune</div>
                  <code className="text-gray-700 break-all">{data?.id || sessionId}</code>
                </div>

                <div className="mt-8">
                  <Link
                    to="/"
                    className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                  >
                    Înapoi la site
                  </Link>
                </div>

                <p className="mt-6 text-xs text-gray-500">
                  Vei primi email de la Stripe cu detalii și link către portalul de administrare al abonamentului.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
