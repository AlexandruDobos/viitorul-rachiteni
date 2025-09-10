// src/pages/SocialLinksAdmin.jsx
import React, { useEffect, useState } from "react";
import { getSocialLinks, saveSocialLinks } from "../utils/settings";

const isUrl = (v) => !v || /^https?:\/\/.+/i.test(v);
const blueGrad = "from-blue-600 via-indigo-600 to-sky-600";

/* ---------- UI helpers (match ContactEditor styling) ---------- */
const SectionCard = ({ title, subtitle, children }) => (
  <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl ring-1 ring-gray-100 overflow-hidden">
    <div className={`p-5 border-b bg-gradient-to-r ${blueGrad} text-white`}>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-white/90 mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const ButtonPrimary = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${blueGrad} px-4 py-2 text-sm text-white shadow-sm transition hover:opacity-95 disabled:opacity-60 ${className}`}
  >
    {children}
  </button>
);

const ButtonGhost = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-60 ${className}`}
  >
    {children}
  </button>
);

const Icon = ({ name, className = "h-5 w-5" }) => {
  if (name === "fb") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 4.99 3.66 9.13 8.44 9.94v-7.03H8.08v-2.9h2.36V9.41c0-2.33 1.39-3.62 3.52-3.62.99 0 2.02.18 2.02.18v2.22h-1.14c-1.12 0-1.47.7-1.47 1.42v1.7h2.5l-.4 2.9h-2.1V22c4.78-.81 8.44-4.95 8.44-9.94z" />
      </svg>
    );
  }
  if (name === "ig") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6ZM18 6.6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
      </svg>
    );
  }
  if (name === "yt") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.7 3.6 12 3.6 12 3.6s-7.7 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.7.5 9.4.5 9.4.5s7.7 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6 3.6-6 3.6Z" />
      </svg>
    );
  }
  return null;
};

export default function SocialLinksAdmin() {
  const [form, setForm] = useState({
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getSocialLinks();
      setForm(data || { facebookUrl: "", instagramUrl: "", youtubeUrl: "" });
      setLoaded(true);
    })();
  }, []);

  const onChange = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value.trim() }));
    setErr("");
    setOk("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    if (!isUrl(form.facebookUrl) || !isUrl(form.instagramUrl) || !isUrl(form.youtubeUrl)) {
      setErr("Link-urile trebuie să fie goale sau să înceapă cu http:// sau https://");
      return;
    }
    try {
      setSaving(true);
      await saveSocialLinks(form);
      setOk("Salvat cu succes!");
    } catch (e) {
      setErr(e.message || "Eroare la salvare");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setForm({ facebookUrl: "", instagramUrl: "", youtubeUrl: "" });
    setErr("");
    setOk("");
  };

  const Field = ({ label, icon, valueKey, placeholder, colorClass }) => {
    const value = form[valueKey];
    const invalid = value && !isUrl(value);
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700">{label}</label>
        <div className={`flex items-center rounded-xl ring-1 bg-white ${invalid ? "ring-red-300" : "ring-gray-300"}`}>
          <span className={`pl-3 pr-2 ${colorClass}`}>{icon}</span>
          <input
            value={value}
            onChange={onChange(valueKey)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm py-2 pr-2"
          />
          {value ? (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="px-2 text-xs text-blue-600 hover:underline"
              title="Deschide link-ul într-o filă nouă"
            >
              Testează
            </a>
          ) : null}
        </div>
        {invalid && <div className="text-xs text-red-600">Link invalid. Folosește http:// sau https://</div>}
      </div>
    );
  };

  return (
    <div
      className="space-y-8 max-w-3xl mx-auto px-4"
      style={{
        // ✅ doar pe mobil adăugăm offset sub bara fixă; pe ≥1024px padding devine 0
        paddingTop:
          "clamp(0px, calc((1024px - 100vw) * 9999), calc(env(safe-area-inset-top, 0px) + 56px))",
      }}
    >
      {!loaded ? (
        <SectionCard title="Rețele sociale" subtitle="Se încarcă setările…">
          <div className="space-y-3">
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-8 w-28 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </SectionCard>
      ) : (
        <>
          {/* FORM */}
          <SectionCard
            title="Rețele sociale"
            subtitle="Configurează link-urile oficiale. Câmpurile goale nu vor afișa pictograme în footer."
          >
            <form onSubmit={submit} className="space-y-4">
              {err && <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{err}</div>}
              {ok && <div className="rounded-lg bg-green-50 text-green-700 px-3 py-2 text-sm">{ok}</div>}

              <Field
                label="Facebook"
                icon={<Icon name="fb" />}
                valueKey="facebookUrl"
                placeholder="https://www.facebook.com/..."
                colorClass="text-[#1877F2]"
              />
              <Field
                label="Instagram"
                icon={<Icon name="ig" />}
                valueKey="instagramUrl"
                placeholder="https://www.instagram.com/..."
                colorClass="text-pink-500"
              />
              <Field
                label="YouTube"
                icon={<Icon name="yt" />}
                valueKey="youtubeUrl"
                placeholder="https://www.youtube.com/@..."
                colorClass="text-red-600"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <ButtonGhost type="button" onClick={reset}>
                  Resetează
                </ButtonGhost>
                <ButtonPrimary type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Se salvează…
                    </>
                  ) : (
                    "Salvează"
                  )}
                </ButtonPrimary>
              </div>
            </form>
          </SectionCard>

          {/* PREVIEW */}
          <SectionCard title="Previzualizare footer">
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 ring-1 ring-gray-200">
              {form.facebookUrl ? (
                <a
                  className="text-[#1877F2] hover:opacity-80"
                  href={form.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Facebook"
                >
                  <Icon name="fb" className="h-6 w-6" />
                </a>
              ) : null}
              {form.instagramUrl ? (
                <a
                  className="text-pink-500 hover:opacity-80"
                  href={form.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram"
                >
                  <Icon name="ig" className="h-6 w-6" />
                </a>
              ) : null}
              {form.youtubeUrl ? (
                <a
                  className="text-red-600 hover:opacity-80"
                  href={form.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="YouTube"
                >
                  <Icon name="yt" className="h-6 w-6" />
                </a>
              ) : null}
              {!form.facebookUrl && !form.instagramUrl && !form.youtubeUrl && (
                <div className="text-sm text-gray-500">Nu vor fi afișate pictograme.</div>
              )}
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
