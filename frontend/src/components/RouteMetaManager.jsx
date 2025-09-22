/* eslint-disable no-empty */
// src/components/RouteMetaManager.jsx
import { useEffect, useState } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { setDocumentTitle, setFavicon } from '../utils/meta';
import { BASE_URL } from '../utils/constants';

// importă logo-ul echipei din assets (vite rezolvă URL-ul corect)
import clubIcon from '../assets/logo.png';

// Domeniul tău live (folosit pentru canonical / og:url)
const SITE_ORIGIN = 'https://viitorulrachiteni.ro';

// Map implicit: rută -> titlu + icon opțional (pentru favicon contextual)
const ROUTE_META = [
  { path: '/',                title: 'Acasă',           icon: null },
  { path: '/stiri',           title: 'Știri',           icon: null },
  { path: '/squad',           title: 'Jucători',        icon: null },
  { path: '/players/:id',     title: 'Profil jucător',  icon: null },
  { path: '/matches',         title: 'Meciuri',         icon: null },
  { path: '/results',         title: 'Rezultate',       icon: null },
  { path: '/standings',       title: 'Clasament',       icon: null },
  { path: '/contact',         title: 'Contact',         icon: null },
  { path: '/donations',       title: 'Donații',         icon: null },
  { path: '/admin',           title: 'Admin',           icon: null },
];

/* utilitare mici pt meta din <head> */
function setMeta(name, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setOG(property, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(href) {
  if (!href) return;
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

export default function RouteMetaManager() {
  const { pathname } = useLocation();

  // numele aplicației îl ții local (sau din .env)
  const [appName] = useState(
    import.meta.env.VITE_APP_NAME || 'ACS Viitorul Răchiteni'
  );

  // favicon implicit: logo-ul echipei
  const [defaultIcon] = useState(clubIcon);

  useEffect(() => {
    // ——— Defaults (Home) ———
    let title = 'ACS Viitorul Răchiteni – știri, rezultate, meciuri & lot';
    let description =
      'Site-ul oficial ACS Viitorul Răchiteni: știri și rezultate, programul meciurilor, lotul de jucători, clasament Liga, galerie foto și contacte.';
    let canonical = SITE_ORIGIN + '/';

    // favicon per-rută (fallback: logo)
    const found = ROUTE_META.find(
      r =>
        matchPath({ path: r.path, end: true }, pathname) ||
        matchPath({ path: r.path, end: false }, pathname)
    );
    setFavicon(found?.icon || defaultIcon);

    // ——— Știri (/stiri) ———
    if (matchPath({ path: '/stiri', end: true }, pathname)) {
      title = 'Știri ACS Viitorul Răchiteni – rezultate, transferuri, evenimente';
      description = 'Noutăți despre ACS Viitorul Răchiteni: cronici de meci, rezultate, program, anunțuri și informații despre echipă.';
      canonical = SITE_ORIGIN + '/stiri';
    }

    // ——— Meci (/matches/:id) ———
    const matchRoute = matchPath({ path: '/matches/:id', end: true }, pathname);
    if (matchRoute) {
      const id = matchRoute.params.id;
      // fallback rapid până vin datele
      title = 'Detalii meci – ACS Viitorul Răchiteni';
      description = 'Rezumat meci Viitorul Răchiteni: scor, marcatori și momente importante.';
      canonical = `${SITE_ORIGIN}/matches/${id}`;

      // aplicăm fallback-ul imediat
      setDocumentTitle(title);
      setMeta('description', description);
      setCanonical(canonical);
      setOG('og:title', title);
      setOG('og:description', description);
      setOG('og:url', canonical);
      setMeta('twitter:card', 'summary_large_image');

      // apoi rafinăm dinamic din API (nu blocăm randarea)
      (async () => {
        try {
          const res = await fetch(`${BASE_URL}/app/matches/${id}`);
          if (!res.ok) return;
          const m = await res.json();

          const vrName = 'Viitorul Răchiteni';
          const opponent =
            (m.homeTeamName && m.homeTeamName.includes(vrName))
              ? (m.awayTeamName || 'Adversar')
              : (m.awayTeamName && m.awayTeamName.includes(vrName))
              ? (m.homeTeamName || 'Adversar')
              : (m.awayTeamName || m.homeTeamName || 'Adversar');

          const dateStr = m.date
            ? new Date(m.date + 'T00:00').toLocaleDateString('ro-RO', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })
            : '';

          const hasScore = m.homeGoals != null && m.awayGoals != null;
          const score = hasScore ? `${m.homeGoals}-${m.awayGoals}` : null;

          const dynTitle = `Viitorul Răchiteni vs ${opponent} – ${dateStr}${hasScore ? `, scor & highlights` : ', program & info'}`;
          const dynDesc = `Rezumat meci Viitorul Răchiteni – ${opponent}${score ? ` (${score})` : ''}: scor, marcatori, ocazii, galerie foto.`;
          const dynCanon = `${SITE_ORIGIN}/matches/${id}`;

          setDocumentTitle(dynTitle);
          setMeta('description', dynDesc);
          setCanonical(dynCanon);
          setOG('og:title', dynTitle);
          setOG('og:description', dynDesc);
          setOG('og:url', dynCanon);
          setMeta('twitter:card', 'summary_large_image');
        } catch {
          // dacă pică fetch-ul, rămâne fallback-ul
        }
      })();

      // ieșim — restul nu trebuie să rescrie ceea ce am pus acum
      return;
    }

    // ——— Alte rute: folosim titlul din map + numele aplicației (și descrierea generală) ———
    if (!matchPath({ path: '/', end: true }, pathname) && !matchPath({ path: '/stiri', end: true }, pathname)) {
      const pageTitle = found?.title ? `${found.title} – ${appName}` : `${appName}`;
      title = pageTitle;

      // canonical generic
      canonical = SITE_ORIGIN + pathname.replace(/\/+$/, '') || SITE_ORIGIN + '/';
    }

    // aplicăm pentru Home/Știri/alte rute statice
    setDocumentTitle(title);
    setMeta('description', description);
    setCanonical(canonical);
    setOG('og:title', title);
    setOG('og:description', description);
    setOG('og:url', canonical);
    setMeta('twitter:card', 'summary_large_image');
  }, [pathname, appName, defaultIcon]);

  return null;
}
