// src/forms/CompetitionsManager.jsx
import React, { useEffect, useState, useMemo } from "react";
import { BASE_URL } from "../utils/constants";
import {
  Search,
  Plus,
  Save,
  X,
  Pencil,
  Trash2,
  Archive,
  Loader2,
  CalendarRange,
  Tag,
} from "lucide-react";

/* Small styled helpers */
const Pill = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs bg-gray-50 text-gray-700 ${className}`}
  >
    {children}
  </span>
);

const TinyIconBtn = ({ title, onClick, disabled, className = "", children }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-gray-700 hover:bg-gray-50 disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

const CompetitionsManager = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // add competition
  const [newName, setNewName] = useState("");

  // edit competition
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [busyId, setBusyId] = useState(null); // block spam on one row

  // seasons: add input per competition
  const [seasonAddInput, setSeasonAddInput] = useState({}); // { [competitionId]: "2024/2025" }
  const [seasonBusyKey, setSeasonBusyKey] = useState(""); // `${compId}:${seasonId||'new'}`

  // seasons: edit inline
  const [seasonEditing, setSeasonEditing] = useState({
    competitionId: null,
    seasonId: null,
    label: "",
  });

  // optional search
  const [q, setQ] = useState("");

  const fetchCompetitions = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${BASE_URL}/app/competitions`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCompetitions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setErr("Eroare la încărcarea competițiilor.");
      setCompetitions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return competitions;
    return competitions.filter((c) =>
      (c.name || "").toLowerCase().includes(term)
    );
  }, [competitions, q]);

  // ---------- COMPETITIONS CRUD ----------
  const addCompetition = async (e) => {
    e?.preventDefault?.();
    const name = newName.trim();
    if (!name) return;
    try {
      setBusyId("new");
      const res = await fetch(`${BASE_URL}/app/competitions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(await res.text());
      setNewName("");
      await fetchCompetitions();
    } catch (e) {
      console.error(e);
      alert("Eroare la adăugare competiție.");
    } finally {
      setBusyId(null);
    }
  };

  const startEdit = (comp) => {
    setEditingId(comp.id);
    setEditingName(comp.name || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async (id) => {
    const name = editingName.trim();
    if (!name) return;
    try {
      setBusyId(id);
      const res = await fetch(`${BASE_URL}/app/competitions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error(await res.text());
      cancelEdit();
      await fetchCompetitions();
    } catch (e) {
      console.error(e);
      alert("Eroare la salvare competiție.");
    } finally {
      setBusyId(null);
    }
  };

  const deactivate = async (id) => {
    if (!confirm("Ești sigur că vrei să dezactivezi această competiție?")) return;
    try {
      setBusyId(id);
      const res = await fetch(`${BASE_URL}/app/competitions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchCompetitions();
    } catch (e) {
      console.error(e);
      alert("Eroare la dezactivare competiție.");
    } finally {
      setBusyId(null);
    }
  };

  // ---------- SEASONS CRUD ----------
  const addSeason = async (competitionId) => {
    const label = (seasonAddInput[competitionId] || "").trim();
    if (!label) return;
    const busyKey = `${competitionId}:new`;
    try {
      setSeasonBusyKey(busyKey);
      const res = await fetch(
        `${BASE_URL}/app/competitions/${competitionId}/seasons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ label }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      setSeasonAddInput((prev) => ({ ...prev, [competitionId]: "" }));
      await fetchCompetitions();
    } catch (e) {
      console.error(e);
      alert("Eroare la adăugare sezon.");
    } finally {
      setSeasonBusyKey("");
    }
  };

  const startEditSeason = (competitionId, season) => {
    setSeasonEditing({
      competitionId,
      seasonId: season.id,
      label: season.label || "",
    });
  };

  const cancelEditSeason = () => {
    setSeasonEditing({ competitionId: null, seasonId: null, label: "" });
  };

  const saveEditSeason = async () => {
    const { competitionId, seasonId, label } = seasonEditing;
    const trimmed = (label || "").trim();
    if (!competitionId || !seasonId || !trimmed) return;
    const busyKey = `${competitionId}:${seasonId}`;
    try {
      setSeasonBusyKey(busyKey);
      const res = await fetch(
        `${BASE_URL}/app/competitions/${competitionId}/seasons/${seasonId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ label: trimmed }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      cancelEditSeason();
      await fetchCompetitions();
    } catch (e) {
      console.error(e);
      alert("Eroare la salvare sezon.");
    } finally {
      setSeasonBusyKey("");
    }
  };

  const deleteSeason = async (competitionId, seasonId) => {
    if (!confirm("Ștergi / dezactivezi sezonul?")) return;
    const busyKey = `${competitionId}:${seasonId}`;
    try {
      setSeasonBusyKey(busyKey);
      const res = await fetch(
        `${BASE_URL}/app/competitions/${competitionId}/seasons/${seasonId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error(await res.text());
      await fetchCompetitions();
    } catch (e) {
      console.error(e);
      alert("Eroare la ștergere sezon.");
    } finally {
      setSeasonBusyKey("");
    }
  };

  const isSeasonEditing = (competitionId, seasonId) =>
    seasonEditing.competitionId === competitionId &&
    seasonEditing.seasonId === seasonId;

  /* ============================= UI ============================= */
  return (
    <div
      className="space-y-6"
      style={{
        // ✅ Padding top only on mobile (under fixed admin menu); 0 on ≥1024px
        paddingTop:
          "clamp(0px, calc((1024px - 100vw) * 9999), calc(env(safe-area-inset-top, 0px) + 56px))",
      }}
    >
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Competiții
          </h2>
          <Pill className="hidden sm:inline-flex">
            <Tag className="mr-1 h-3.5 w-3.5" /> {competitions.length} total
          </Pill>
        </div>

        {/* Add & Search */}
        <div className="grid gap-4 p-5 md:grid-cols-12">
          {/* Add competition */}
          <form
            onSubmit={addCompetition}
            className="order-1 md:order-none md:col-span-7"
          >
            <div className="flex w-full gap-2">
              <input
                type="text"
                placeholder="Nume competiție (ex: Liga V-a, Cupa României)"
                className="h-11 w-full flex-1 rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder-gray-400 outline-none ring-indigo-600/20 transition focus:border-indigo-600 focus:ring-2"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button
                type="submit"
                disabled={busyId === "new"}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-4 text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
              >
                {busyId === "new" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Adaugă
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Adaugă
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Search */}
          <div className="order-2 md:order-none md:col-span-5">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Caută competiție..."
                className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-gray-900 placeholder-gray-400 outline-none ring-indigo-600/20 transition focus:border-indigo-600 focus:ring-2"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-5">
          {loading ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : err ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
              {err}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-500">Nu există competiții.</p>
          ) : (
            <ul className="space-y-4">
              {filtered.map((c) => {
                const isEditing = editingId === c.id;
                const seasons = Array.isArray(c.seasons) ? c.seasons : [];
                const addVal = seasonAddInput[c.id] || "";
                return (
                  <li
                    key={c.id}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-4">
                      {/* Top row */}
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          {isEditing ? (
                            <input
                              className="h-10 w-full rounded-xl border border-gray-300 px-3 outline-none ring-indigo-600/20 transition focus:border-indigo-600 focus:ring-2 md:w-96"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <h3 className="text-lg font-semibold">
                              {c.name}
                              {!c.active && (
                                <Pill className="ml-2">inactiv</Pill>
                              )}
                            </h3>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(c.id)}
                                disabled={busyId === c.id}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-3 py-2 text-sm text-white shadow-sm hover:opacity-95 disabled:opacity-60"
                              >
                                {busyId === c.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Salvează
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4" />
                                    Salvează
                                  </>
                                )}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                              >
                                Renunță
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(c)}
                                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                              >
                                <Pencil className="h-4 w-4" />
                                Editează
                              </button>
                              <button
                                onClick={() => deactivate(c.id)}
                                disabled={busyId === c.id}
                                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
                              >
                                <Archive className="h-4 w-4" />
                                Dezactivează
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Seasons */}
                      <div>
                        <div className="mb-2 text-sm font-medium">Sezoane</div>

                        {seasons.length === 0 && (
                          <div className="mb-2 text-xs text-gray-500">
                            Fără sezoane
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {seasons.map((s) => {
                            const editingThis = isSeasonEditing(c.id, s.id);
                            const thisBusyKey = `${c.id}:${s.id}`;
                            const busy = seasonBusyKey === thisBusyKey;

                            return (
                              <div key={s.id} className="flex items-center gap-2">
                                {editingThis ? (
                                  <>
                                    <input
                                      className="h-8 rounded-lg border px-2 text-xs"
                                      value={seasonEditing.label}
                                      onChange={(e) =>
                                        setSeasonEditing((prev) => ({
                                          ...prev,
                                          label: e.target.value,
                                        }))
                                      }
                                      autoFocus
                                    />
                                    <TinyIconBtn
                                      title="Salvează"
                                      onClick={saveEditSeason}
                                      disabled={busy}
                                    >
                                      {busy ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Save className="h-4 w-4" />
                                      )}
                                    </TinyIconBtn>
                                    <TinyIconBtn title="Renunță" onClick={cancelEditSeason}>
                                      <X className="h-4 w-4" />
                                    </TinyIconBtn>
                                  </>
                                ) : (
                                  <>
                                    <Pill>{s.label}</Pill>
                                    <TinyIconBtn
                                      title="Editează sezon"
                                      onClick={() => startEditSeason(c.id, s)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </TinyIconBtn>
                                    <TinyIconBtn
                                      title="Șterge sezon"
                                      onClick={() => deleteSeason(c.id, s.id)}
                                      disabled={busy}
                                      className="border-red-200 text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </TinyIconBtn>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Add Season inline */}
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <input
                            type="text"
                            placeholder="Ex: 2024/2025"
                            className="h-10 rounded-xl border border-gray-300 px-3 text-sm outline-none ring-indigo-600/20 transition focus:border-indigo-600 focus:ring-2 sm:w-48"
                            value={addVal}
                            onChange={(e) =>
                              setSeasonAddInput((prev) => ({
                                ...prev,
                                [c.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addSeason(c.id);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => addSeason(c.id)}
                            disabled={seasonBusyKey === `${c.id}:new`}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-4 py-2 text-sm text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
                          >
                            {seasonBusyKey === `${c.id}:new` ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Adaugă sezon
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4" />
                                Adaugă sezon
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionsManager;
