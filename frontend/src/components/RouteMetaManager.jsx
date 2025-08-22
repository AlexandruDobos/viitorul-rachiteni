/* eslint-disable no-empty */
// src/components/RouteMetaManager.jsx
import { useEffect, useState } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { setDocumentTitle, setFavicon } from '../utils/meta';

// importă logo-ul echipei din assets (vite rezolvă URL-ul corect)
import clubIcon from '../assets/logo.png';

// map implicit: rută -> titlu + icon opțional (poți pune svg-uri din /public/icons)
const ROUTE_META = [
  { path: '/',                title: 'Acasă',           icon: null },
  { path: '/squad',           title: 'Jucători',        icon: null },
  { path: '/players/:id',     title: 'Profil jucător',  icon: null },
  { path: '/matches',         title: 'Meciuri',         icon: null },
  { path: '/results',         title: 'Rezultate',       icon: null },
  { path: '/standings',       title: 'Clasament',       icon: null },
  { path: '/contact',         title: 'Contact',         icon: null },
  { path: '/donations',       title: 'Donații',         icon: null },
  { path: '/admin',           title: 'Admin',           icon: null },
];

export default function RouteMetaManager() {
  const { pathname } = useLocation();

  // numele aplicației îl ții local (sau din .env)
  const [appName] = useState(
    import.meta.env.VITE_APP_NAME || 'ACS Viitorul Răchiteni'
  );

  // favicon implicit: logo-ul echipei
  const [defaultIcon] = useState(clubIcon);

  useEffect(() => {
    const found = ROUTE_META.find(
      r =>
        matchPath({ path: r.path, end: true }, pathname) ||
        matchPath({ path: r.path, end: false }, pathname)
    );

    const page = found?.title || 'Pagină';
    setDocumentTitle(`${page} – ${appName}`);

    // dacă nu ai icon per-rută, folosește logo-ul
    setFavicon(found?.icon || defaultIcon);
  }, [pathname, appName, defaultIcon]);

  return null;
}
