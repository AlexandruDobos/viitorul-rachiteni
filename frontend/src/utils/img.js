// src/utils/img.js
const CF_HOSTS = ['cdn.viitorulrachiteni.ro', 'www.viitorulrachiteni.ro', 'viitorulrachiteni.ro'];

/**
 * Generează URL optimizat cu Cloudflare Image Resizing (dacă hostul e pe CF).
 * Fallback: întoarce URL-ul original.
 * @param {string} url - imaginea originală
 * @param {object} o   - { w, q, fmt } width, quality, format ('auto' recomandat)
 */
export function cfImg(url, { w = 720, q = 75, fmt = 'auto' } = {}) {
  try {
    if (!url) return url;
    const u = new URL(url, window.location.origin);

    // dacă e deja resizată, nu mai adăugăm încă o dată
    if (u.pathname.startsWith('/cdn-cgi/image/')) return url;

    // aplică doar dacă e pe unul din hosturile noastre
    if (!CF_HOSTS.includes(u.hostname)) return url;

    // Cloudflare: /cdn-cgi/image/width=...,quality=...,format=auto/<restul>
    const ops = [
      `width=${Math.round(w)}`,
      `quality=${Math.min(Math.max(q, 40), 90)}`,
      `format=${fmt}` // 'auto' sau 'webp'/'avif'
    ].join(',');

    return `${u.origin}/cdn-cgi/image/${ops}${u.pathname}${u.search}`;
  } catch {
    return url;
  }
}

/**
 * Construiește srcset pentru câteva lățimi standard.
 */
export function buildSrcSet(url, widths = [360, 540, 720, 960, 1200], q = 75, fmt = 'auto') {
  return widths.map(w => `${cfImg(url, { w, q, fmt })} ${w}w`).join(', ');
}
