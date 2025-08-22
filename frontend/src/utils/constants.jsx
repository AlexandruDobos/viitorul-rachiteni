// constants.jsx
// Ia din env (Vite injectează doar variabile care încep cu VITE_)
const envBase = import.meta.env.VITE_API_BASE_URL;

// normalizează (fără slash la final) și folosește localhost doar ca fallback pentru dev
export const BASE_URL =
  (envBase && envBase.replace(/\/$/, '')) || 'http://localhost:8080';

// restul codului tău poate rămâne: `${BASE_URL}/api/...`
