// utils/constants.js
const envBase = import.meta.env.VITE_API_BASE_URL ?? '/api';
export const BASE_URL = envBase.replace(/\/$/, ''); // fără trailing slash

export const api = (path) =>
  `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
