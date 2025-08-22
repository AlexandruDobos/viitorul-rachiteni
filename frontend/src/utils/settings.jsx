/* eslint-disable no-empty */
// src/utils/settings.js
import { BASE_URL } from '../utils/constants';

export async function getSocialLinks() {
  try {
    const res = await fetch(`${BASE_URL}/api/app/social`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to load social links');
    const data = await res.json();
    return {
      facebookUrl: data.facebookUrl || '',
      instagramUrl: data.instagramUrl || '',
      youtubeUrl: data.youtubeUrl || '',
    };
  } catch {
    // fallback: nimic configurat
    return { facebookUrl: '', instagramUrl: '', youtubeUrl: '' };
  }
}

export async function saveSocialLinks(payload) {
  const res = await fetch(`${BASE_URL}/api/app/social`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = 'Eroare la salvare';
    try { const e = await res.json(); msg = e.message || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}
