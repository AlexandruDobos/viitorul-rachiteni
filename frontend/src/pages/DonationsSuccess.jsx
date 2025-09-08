// src/pages/DonationsSuccess.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';

function centsToHuman(v, currency) {
  if (typeof v !== 'number') return '';
  return `${(v / 100).toFixed(2)} ${currency?.toUpperCase()}`;
}

export default function DonationsSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [err, setErr] = useState('');
  const canvasRef = useRef(null);

  // Fetch session details (păstrat endpointul tău cu {id} în path)
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        if (!sessionId) return;
        setLoading(true);
        const res = await fetch(`${BASE_URL}/donations/session/${sessionId}`);
        if (!res.ok) throw new Error('Nu am putut încărca detaliile plății.');
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

  // Confetti minimal (fără librării)
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

    // generate particles
    const colors = ['#16a34a', '#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6'];
    const confetti = Array.from({ length: 180 }, () => ({
      x: Math.random() * W,
      y: -20 - Math.random() * H * 0.5,
      r: 3 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      vy: 2 + Math.random() * 3,
      vx: Math.random() * 1 - 0.5,
      rot: Math.random() * Math.PI,
      vr: Math.random() * 0.2 - 0.1
    }));

    let start = performance.now();
    let raf;

    const draw = (t) => {
      const elapsed = (t - start) / 1000; // sec
      ctx.clearRect(0, 0, W, H);

      confetti.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > H + 20) {
          p.y = -20;
          p.x = Math.random() * W;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        // mic romb/”petală”
        ctx.beginPath();
        ctx.moveTo(0, -p.r);
        ctx.lineTo(p.r, 0);
        ctx.lineTo(0, p.r);
        ctx.lineTo(-p.r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // rulează ~6s apoi oprește ușor
      if (elapsed < 6) {
        raf = requestAnimationFrame(draw);
      } else if (elapsed < 7.5) {
        // fade-out
        ctx.fillStyle = `rgba(255,255,255,${(elapsed - 6) / 1.5})`;
        ctx.fillRect(0, 0, W, H);
        raf = requestAnimationFrame(draw);
      }
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      ctx.clearRect(0, 0, W, H);
    };
  }, [sessionId]);

  return (
    <div className="relative px-4 py-10">
      {/* Confetti overlay */}
      <div className="pointer-events-none absolute inset-0">
        <canvas ref={canvasRef} className="w-full h-full block"></canvas>
      </div>

      <div className="relative max-w-3xl mx-auto">
        {/* Card principal */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
          {/* Header festiv cu gradient + check animat */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-10 text-white">
            <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
              {/* pattern subtil */}
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>
            </div>

            <div className="relative flex flex-col items-center text-center gap-4">
              {/* Check SVG animat */}
              <svg
                className="h-16 w-16"
                viewBox="0 0 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle className="opacity-90" cx="26" cy="26" r="24" stroke="white" strokeWidth="2" />
                <path
                  d="M16 27.5 L23 34 L36 18"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 50,
                    strokeDashoffset: 50,
                    animation: 'dash 1.2s ease-out forwards 0.2s'
                  }}
                />
              </svg>

              <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>

              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Mulțumim pentru donație! 🎉
              </h1>
              <p className="text-white/90 max-w-xl">
                Sprijinul tău ne ajută să creștem și să construim proiecte frumoase la
                <span className="font-semibold"> ACS Viitorul Răchiteni</span>.
              </p>
            </div>
          </div>

          {/* Conținut */}
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
                {/* Rezumat donație */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Suma</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">
                      {centsToHuman(data?.amountTotal ?? 0, data?.currency)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Status</div>
                    <div className="mt-1 inline-flex items-center gap-2 text-gray-900">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span className="font-semibold">{(data?.paymentStatus || '').toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-500">Email</div>
                    <div
                      className="mt-1 text-gray-900 text-sm break-all"
                      title={data?.customerEmail || ''}
                    >
                      {data?.customerEmail || '—'}
                    </div>
                  </div>
                </div>

                {/* Detalii tehnice */}
                <div className="mt-4 text-sm text-gray-600">
                  <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">ID sesiune</div>
                    <code className="text-gray-700 break-all">{data?.id || sessionId}</code>
                  </div>
                </div>

                {/* Secțiune „Impactul tău” */}
                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900">Impactul donației tale</h2>
                  <p className="text-sm text-gray-600">
                    Contribuția ta sprijină echipamente, materiale pentru antrenamente și inițiative pentru copii.
                  </p>

                  <div className="mt-4 grid md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-gray-100 bg-white p-4">
                      <div className="text-2xl">🥇</div>
                      <div className="mt-2 font-medium text-gray-900">Echipamente mai bune</div>
                      <div className="text-sm text-gray-600">Mingi, veste, accesorii și tot ce e nevoie la antrenamente.</div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-4">
                      <div className="text-2xl">🚍</div>
                      <div className="mt-2 font-medium text-gray-900">Logistică eficientă</div>
                      <div className="text-sm text-gray-600">Transport și organizare în zilele de meci.</div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-white p-4">
                      <div className="text-2xl">🌱</div>
                      <div className="mt-2 font-medium text-gray-900">Proiecte pe termen lung</div>
                      <div className="text-sm text-gray-600">Creștem comunitatea și dezvoltăm programe noi.</div>
                    </div>
                  </div>
                </div>

                {/* CTA simplu (fără share) */}
                <div className="mt-8">
                  <Link
                    to="/"
                    className="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                  >
                    Înapoi la site
                  </Link>
                </div>

                {/* Notă */}
                <p className="mt-6 text-xs text-gray-500">
                  Dacă nu recunoști această plată, contactează-ne imediat. Mulțumim încă o dată pentru încredere! 💚
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
