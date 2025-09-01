import React, { useEffect, useState } from "react";
import { BASE_URL } from "../utils/constants";

const CONTACT_API = `${BASE_URL}/app/contact-settings`;

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i; // simplu și suficient pentru UI

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
            // prima rulare, nu există încă setări
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
      // unificăm + scăpăm de duplicate
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

  if (loading) {
    return (
      <div className="bg-white shadow p-6 rounded-lg">
        <div className="text-sm text-gray-600">Se încarcă setările…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow p-6 rounded-lg">
        <div className="text-sm text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow p-6 rounded-lg max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Destinație mesaje Contact</h2>
      <p className="text-sm text-gray-600">
        Adaugă unul sau mai multe emailuri unde vor fi trimise mesajele din formularul de contact.
        Poți lipi o listă (separată prin spațiu, virgulă sau punct și virgulă).
      </p>

      {/* Input + Add */}
      <div className="flex gap-2">
        <input
          type="email"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePasteList}
          placeholder="ex: contact@club.ro"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          type="button"
          onClick={addEmail}
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Adaugă
        </button>
      </div>

      {/* Chips list */}
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

      <div className="pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
        >
          {saving ? "Se salvează…" : "Salvează"}
        </button>
      </div>
    </div>
  );
};

export default ContactEditor;
