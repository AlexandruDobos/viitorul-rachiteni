// src/utils/img.js

// Construiește URL-ul pentru Cloudflare Image Resizing.
// Exemplu rezultat:
//   /cdn-cgi/image/width=960,quality=75,format=auto/https://cdn.viitorulrachiteni.ro/poza.jpg
export function cfImg(url, opts = {}) {
  if (!url) return "";

  const u = String(url);

  // Nu atinge date/blob sau imagini deja „resized”
  if (/^(data:|blob:)/i.test(u) || u.includes("/cdn-cgi/image/")) return u;

  // Cloudflare acceptă „remote image” absolută după transformări
  // (dacă primești un path relativ, îl facem absolut relativ la origin)
  const absolute = /^https?:\/\//i.test(u) ? u : `${window?.location?.origin || ""}${u}`;

  const {
    w, h, q = 75, fmt = "auto", fit, sharpen = false,
  } = opts;

  const params = [];
  if (w) params.push(`width=${w}`);
  if (h) params.push(`height=${h}`);
  if (fit) params.push(`fit=${fit}`);
  else if (w && h) params.push("fit=cover");

  params.push(`quality=${q}`);
  params.push(`format=${fmt}`);
  if (sharpen) params.push("sharpen=1");

  return `/cdn-cgi/image/${params.join(",")}/${encodeURI(absolute)}`;
}

// Generează srcset pentru diverse lățimi
export function buildSrcSet(url, widths = [360, 540, 720, 960, 1280], q = 75, fmt = "auto") {
  return widths.map((w) => `${cfImg(url, { w, q, fmt })} ${w}w`).join(", ");
}
