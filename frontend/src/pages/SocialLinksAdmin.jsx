// src/pages/SocialLinksAdmin.jsx
import React, { useEffect, useState } from 'react';
import { getSocialLinks, saveSocialLinks } from '../utils/settings';

const isUrl = (v) => !v || /^https?:\/\/.+/i.test(v);

const Label = ({ children }) => (
  <div className="text-xs font-semibold text-gray-700 mb-1">{children}</div>
);

const Input = ({ error, ...rest }) => (
  <input
    {...rest}
    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      error ? 'border-red-300' : 'border-gray-300'
    }`}
  />
);


const Icon = ({ name, className = 'h-5 w-5' }) => {
  if (name === 'fb') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 4.99 3.66 9.13 8.44 9.94v-7.03H8.08v-2.9h2.36V9.41c0-2.33 1.39-3.62 3.52-3.62.99 0 2.02.18 2.02.18v2.22h-1.14c-1.12 0-1.47.7-1.47 1.42v1.7h2.5l-.4 2.9h-2.1V22c4.78-.81 8.44-4.95 8.44-9.94z" />
      </svg>
    );
  }
  if (name === 'ig') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6ZM18 6.6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/>
      </svg>
    );
  }
  if (name === 'yt') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.7 3.6 12 3.6 12 3.6s-7.7 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.7.5 9.4.5 9.4.5s7.7 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6 3.6-6 3.6Z"/>
      </svg>
    );
  }
  return null;
};

export default function SocialLinksAdmin() {
  const [form, setForm] = useState({
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      const data = await getSocialLinks();
      setForm(data);
      setLoaded(true);
    })();
  }, []);

  const onChange = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value.trim() }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    if (!isUrl(form.facebookUrl) || !isUrl(form.instagramUrl) || !isUrl(form.youtubeUrl)) {
      setErr('Link-urile trebuie să fie goale sau să înceapă cu http:// sau https://');
      return;
    }

    try {
      setSaving(true);
      await saveSocialLinks(form);
    } catch (e) {
      setErr(e.message || 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="p-4">
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-3" />
        <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl p-4">
      <h2 className="text-xl font-bold mb-1">Rețele sociale</h2>
      <p className="text-sm text-gray-600 mb-4">
        Configurează link-urile oficiale ale echipei. Dacă un câmp e gol, pictograma nu va apărea în footer.
      </p>

      <form onSubmit={submit} className="space-y-4 bg-white rounded-xl p-4 ring-1 ring-gray-200">
        {err && (
          <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{err}</div>
        )}

        <div>
          <Label>Facebook</Label>
          <div className="flex items-center gap-2">
            <span className="text-[#1877F2]"><Icon name="fb" /></span>
            <Input
              placeholder="https://www.facebook.com/..."
              value={form.facebookUrl}
              onChange={onChange('facebookUrl')}
              error={form.facebookUrl && !isUrl(form.facebookUrl)}
            />
          </div>
        </div>

        <div>
          <Label>Instagram</Label>
          <div className="flex items-center gap-2">
            <span className="text-pink-500"><Icon name="ig" /></span>
            <Input
              placeholder="https://www.instagram.com/..."
              value={form.instagramUrl}
              onChange={onChange('instagramUrl')}
              error={form.instagramUrl && !isUrl(form.instagramUrl)}
            />
          </div>
        </div>

        <div>
          <Label>YouTube</Label>
          <div className="flex items-center gap-2">
            <span className="text-red-600"><Icon name="yt" /></span>
            <Input
              placeholder="https://www.youtube.com/@..."
              value={form.youtubeUrl}
              onChange={onChange('youtubeUrl')}
              error={form.youtubeUrl && !isUrl(form.youtubeUrl)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-60"
          >
            {saving && (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            )}
            Salvează
          </button>
        </div>
      </form>

      <div className="mt-5">
        <div className="text-xs font-semibold text-gray-600 mb-2">Previzualizare footer</div>
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200">
          {form.facebookUrl ? (
            <a className="text-[#1877F2] hover:opacity-80" href={form.facebookUrl} target="_blank" rel="noreferrer" title="Facebook">
              <Icon name="fb" className="h-6 w-6" />
            </a>
          ) : null}
          {form.instagramUrl ? (
            <a className="text-pink-500 hover:opacity-80" href={form.instagramUrl} target="_blank" rel="noreferrer" title="Instagram">
              <Icon name="ig" className="h-6 w-6" />
            </a>
          ) : null}
          {form.youtubeUrl ? (
            <a className="text-red-600 hover:opacity-80" href={form.youtubeUrl} target="_blank" rel="noreferrer" title="YouTube">
              <Icon name="yt" className="h-6 w-6" />
            </a>
          ) : null}
          {!form.facebookUrl && !form.instagramUrl && !form.youtubeUrl && (
            <div className="text-sm text-gray-500">Nu vor fi afișate pictograme.</div>
          )}
        </div>
      </div>
    </div>
  );
}
