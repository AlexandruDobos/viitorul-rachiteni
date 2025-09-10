import React, { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";

const CONTACT_API = `${BASE_URL}/app/contact-settings`;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i; // simplu și suficient pentru UI

/* ---------- UI helpers (blue-only) ---------- */
const SectionCard = ({ title, subtitle, children }) => (
  <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl ring-1 ring-gray-100 overflow-hidden">
    <div className="p-5 border-b bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-white/90 mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Label = ({ children }) => (
  <div className="text-xs font-semibold text-gray-700 mb-1">{children}</div>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full h-11 px-3 border rounded-xl bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition ${props.className || ""}`}
  />
);

const ButtonPrimary = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-4 py-2 text-sm text-white shadow-sm transition hover:opacity-95 disabled:opacity-60 ${className}`}
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

const ContactEditor = () => {
  const [emails, setEmails] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load existing settings
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(CONTACT_API);
        if (!res.ok) {
          if (res.status === 404) {
            setEmails([]);
          } else {
            throw new Error("Eroare la încărcarea setărilor de contact");
          }
        } else {
          const data = await res.json();
          setEmails(Array.isArray(data.destinationEmails) ? data.destinationEmails : []);
        }
        setError(null);
      } catch (e) {
        setError(e.message || "Eroare");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const addEmail = () => {
    const val = (input || "").trim().toLowerCase();
    if (!val) return;
    if (!emailRegex.test(val)) {
      alert("Email invalid.");
      return;
    }
    if (emails.includes(val)) {
      setInput("");
      return;
    }
    setEmails((prev) => [...prev, val]);
    setInput("");
  };

  const removeEmail = (val) => {
    setEmails((prev) => prev.filter((e) => e !== val));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail();
    }
  };

  const handlePasteList = (e) => {
    const text = e.clipboardData.getData("text");
    if (!text) return;
    const tokens = text
      .split(/[\s,;]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const valid = tokens.filter((t) => emailRegex.test(t));
    if (valid.length) {
      const merged = Array.from(new Set([...emails, ...valid]));
      setEmails(merged);
      e.preventDefault();
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(CONTACT_API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationEmails: emails }),
      });
      if (!res.ok) throw new Error("Eroare la salvare");
      alert("Setările de contact au fost salvate.");
      setError(null);
    } catch (e) {
      alert(e.message || "Eroare la salvare");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="space-y-8"
      style={{
        // ✅ doar pe mobil adăugăm offset sub bara fixă; pe ≥1024px paddingul devine 0
        paddingTop:
          "clamp(0px, calc((1024px - 100vw) * 9999), calc(env(safe-area-inset-top, 0px) + 56px))",
      }}
    >
      {loading ? (
        <SectionCard title="Destinație mesaje Contact" subtitle="Se încarcă setările…">
          <div className="space-y-3">
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-8 w-24 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </SectionCard>
      ) : error ? (
        <SectionCard title="Destinație mesaje Contact">
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        </SectionCard>
      ) : (
        <SectionCard
          title="Destinație mesaje Contact"
          subtitle="Adaugă unul sau mai multe emailuri unde vor fi trimise mesajele din formularul de contact. Poți lipi o listă (separată prin spațiu, virgulă sau punct și virgulă)."
        >
          {/* Input + Add */}
          <div className="grid gap-2">
            <Label>Email</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePasteList}
                placeholder="ex: contact@club.ro"
              />
              <ButtonGhost type="button" onClick={addEmail}>
                Adaugă
              </ButtonGhost>
            </div>
          </div>

          {/* Chips list */}
          <div className="mt-4">
            {emails.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {emails.map((e) => (
                  <span
                    key={e}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-sm"
                  >
                    {e}
                    <button
                      type="button"
                      onClick={() => removeEmail(e)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Șterge"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Nu ai adăugat încă niciun email.</div>
            )}
          </div>

          <div className="pt-4">
            <ButtonPrimary type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Se salvează…" : "Salvează"}
            </ButtonPrimary>
          </div>
        </SectionCard>
      )}
    </div>
  );
};

export default ContactEditor;
