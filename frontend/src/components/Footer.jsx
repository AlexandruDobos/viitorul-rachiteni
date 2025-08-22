// src/components/Footer.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { getSocialLinks } from '../utils/settings';

const SocialIcon = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-gray-200 bg-white hover:bg-gray-50 hover:ring-gray-300 transition"
  >
    {children}
  </a>
);

export default function Footer() {
  const year = new Date().getFullYear();

  // link-urile din DB (se afișează condiționat)
  const [links, setLinks] = useState({
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getSocialLinks(); // { facebookUrl, instagramUrl, youtubeUrl }
        setLinks({
          facebookUrl: data?.facebookUrl || '',
          instagramUrl: data?.instagramUrl || '',
          youtubeUrl: data?.youtubeUrl || '',
        });
      } catch {
        // lăsăm gol – nu afișăm nimic dacă nu putem citi setările
      }
    })();
  }, []);

  return (
    <footer role="contentinfo" className="mt-10 bg-white border-t">
      {/* accent gradient */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500" />

      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-10 py-10">
        {/* grid principal – centrat pe mobil, left pe desktop */}
        <div className="grid gap-8 lg:grid-cols-4 place-items-center lg:place-items-start text-center lg:text-left">
          {/* Brand */}
          <div className="col-span-1 w-full max-w-sm">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <img
                src={logo}
                alt="ACS Viitorul Răchiteni"
                className="h-12 w-auto object-contain drop-shadow-sm"
                loading="lazy"
              />
              <div className="font-extrabold text-lg leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
                  ACS VIITORUL
                </span>
                <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
                  RĂCHITENI
                </div>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-600">
              Comunitate, echipă, pasiune. Proiect de fotbal local susținut de
              voluntari și parteneri.
            </p>

            {/* social – se afișează DOAR dacă există în DB */}
            {(links.facebookUrl || links.instagramUrl || links.youtubeUrl) && (
              <div className="mt-4 flex items-center justify-center lg:justify-start gap-3">
                {links.facebookUrl && (
                  <SocialIcon href={links.facebookUrl} label="Facebook">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.26.2 2.26.2v2.5h-1.27c-1.25 0-1.64.78-1.64 1.58v1.9h2.79l-.45 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z"/>
                    </svg>
                  </SocialIcon>
                )}
                {links.instagramUrl && (
                  <SocialIcon href={links.instagramUrl} label="Instagram">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3a5 5 0 110 10 5 5 0 010-10zm0 2.2a2.8 2.8 0 100 5.6 2.8 2.8 0 000-5.6zM18 6.3a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                    </svg>
                  </SocialIcon>
                )}
                {links.youtubeUrl && (
                  <SocialIcon href={links.youtubeUrl} label="YouTube">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.3 3.5 12 3.5 12 3.5s-7.3 0-9.4.6A3 3 0 00.5 6.2 31.8 31.8 0 000 12a31.8 31.8 0 00.5 5.8 3 3 0 002.1 2.1c2.1.6 9.4.6 9.4.6s7.3 0 9.4-.6a3 3 0 002.1-2.1A31.8 31.8 0 0024 12a31.8 31.8 0 00-.5-5.8zM9.8 15.3V8.7l6 3.3-6 3.3z"/>
                    </svg>
                  </SocialIcon>
                )}
              </div>
            )}
          </div>

          {/* Linkuri rapide */}
          <nav className="col-span-1 w-full max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900">Navigație</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li><Link className="hover:text-gray-900" to="/squad">Jucători</Link></li>
              <li><Link className="hover:text-gray-900" to="/matches">Meciuri</Link></li>
              <li><Link className="hover:text-gray-900" to="/results">Rezultate</Link></li>
              <li><Link className="hover:text-gray-900" to="/standings">Clasament</Link></li>
              <li><Link className="hover:text-gray-900" to="/contact">Contact</Link></li>
            </ul>
          </nav>

          {/* Susținere */}
          <div className="col-span-1 w-full max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900">Susține clubul</h3>
            <p className="mt-3 text-sm text-gray-600">
              Donează pentru echipament, logistică și proiectele de juniori.
            </p>
            <Link
              to="/donations"
              className="inline-flex mt-4 items-center gap-2 rounded-lg px-4 py-2 text-white
                         bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500
                         hover:opacity-95 transition shadow ring-1 ring-indigo-400/40"
            >
              Donează acum
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                <path d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L14 6.414V17a1 1 0 11-2 0V6.414L8.707 8.707A1 1 0 117.293 7.293l4-4z"/>
              </svg>
            </Link>
          </div>

          {/* Contact */}
          <div className="col-span-1 w-full max-w-sm">
            <h3 className="text-sm font-semibold text-gray-900">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>Email: <a className="hover:underline" href="mailto:contact@viitorul-rachiteni.ro">contact@viitorul-rachiteni.ro</a></li>
              <li>Telefon: <a className="hover:underline" href="tel:+40700000000">+40 700 000 000</a></li>
              <li>Răchiteni, Iași</li>
            </ul>
          </div>
        </div>

        {/* subfooter – mesaj personalizat */}
        <div className="mt-8 border-t pt-4 text-xs text-gray-500 flex flex-col items-center gap-3 text-center lg:flex-row lg:justify-between lg:text-left">
          <div>© {year} ACS Viitorul Răchiteni. Toate drepturile rezervate.</div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span className="text-gray-600">Vrei și tu un astfel de site?</span>
            <a href="tel:+40733305547" className="font-medium text-gray-700 hover:text-gray-900">
              +40 733 305 547
            </a>
            <span className="hidden sm:inline">•</span>
            <a href="mailto:dobosalexandru2502@gmail.com" className="font-medium text-gray-700 hover:text-gray-900">
              dobosalexandru2502@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
