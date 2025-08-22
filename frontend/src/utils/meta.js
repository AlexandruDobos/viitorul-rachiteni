// src/utils/meta.js
export function setDocumentTitle(title) {
  if (typeof document !== 'undefined') document.title = title;
}

export function setFavicon(href) {
  if (typeof document === 'undefined') return;

  let link = document.querySelector('link#app-favicon[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.id = 'app-favicon';
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  // lasă browserul să detecteze tipul, sau pune explicit image/png dacă folosești .png
  link.type = '';
  link.href = href;
}
