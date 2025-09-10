// src/pages/AdsManager.jsx
import React, { useState, useEffect, useRef } from "react";
import { BASE_URL } from "../utils/constants";

const DEVICE_OPTIONS = [
  { value: "LAPTOP", label: "Laptop" },
  { value: "MOBILE", label: "Telefon" },
];

const blueGrad = "from-blue-600 via-indigo-500 to-sky-500";

function labelForDeviceType(v) {
  return DEVICE_OPTIONS.find((d) => d.value === v)?.label || v || "—";
}

const Chip = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200 px-2 py-0.5 text-[11px]">
    {children}
  </span>
);

const AdsManager = () => {
  // FILTER TAB (Laptop/Mobile)
  const [filterDevice, setFilterDevice] = useState("LAPTOP");

  // DATA
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // FORM
  const [form, setForm] = useState({
    id: null,
    title: "",
    imageUrl: "",
    link: "",
    position: "left",
    orderIndex: 1,
    startDate: "",
    endDate: "",
    deviceType: "LAPTOP",
  });

  // UPLOAD
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [showImg, setShowImg] = useState(false);

  // FEEDBACK
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setShowImg(Boolean(preview || form.imageUrl));
  }, [preview, form.imageUrl]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // FETCH
  const fetchAds = async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams({ device: filterDevice });
      const res = await fetch(`${BASE_URL}/app/ads?${q.toString()}`);
      const data = await res.json();
      setAds(Array.isArray(data) ? data : []);
    } catch {
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
    // keep form in current tab & reset edit
    setForm((f) => ({ ...f, deviceType: filterDevice, id: null, orderIndex: 1 }));
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDevice]);

  // R2 helpers
  async function presignForR2(file, folder = "ads") {
    const q = new URLSearchParams({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      folder,
    });
    const res = await fetch(`${BASE_URL}/app/uploads/sign?${q.toString()}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Nu s-a putut obține URL-ul de încărcare.");
    const data = await res.json();
    const uploadUrl = data.uploadUrl;
    const publicUrl = data.publicUrl;
    if (!uploadUrl || !publicUrl) throw new Error("Răspuns invalid la presign.");
    return { uploadUrl, publicUrl };
  }

  async function putFileToR2(uploadUrl, file) {
    const res = await fetch(uploadUrl, { method: "PUT", body: file });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Încărcarea către R2 a eșuat (${res.status}). ${t.slice(0, 200)}`);
    }
  }

  // UPLOAD
  const onChooseImage = () => fileRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);
    const local = URL.createObjectURL(file);
    setPreview(local);

    try {
      setUploadingImage(true);
      const { uploadUrl, publicUrl } = await presignForR2(file, "ads");
      await putFileToR2(uploadUrl, file);
      setForm((prev) => ({ ...prev, imageUrl: publicUrl }));
      setSuccessMessage("✅ Imagine încărcată.");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err) {
      setSuccessMessage(err.message || "❌ Încărcarea a eșuat.");
      setTimeout(() => setSuccessMessage(""), 3500);
      setPreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // FORM SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = form.id ? "PUT" : "POST";
    const url = form.id ? `${BASE_URL}/app/ads/${form.id}` : `${BASE_URL}/app/ads`;

    const payload = {
      ...form,
      orderIndex: parseInt(form.orderIndex, 10) || 1,
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      alert(t || "Eroare la salvare.");
      return;
    }

    setForm({
      id: null,
      title: "",
      imageUrl: "",
      link: "",
      position: "left",
      orderIndex: 1,
      startDate: "",
      endDate: "",
      deviceType: filterDevice,
    });

    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }

    setSuccessMessage(form.id ? "Reclamă actualizată!" : "Reclamă adăugată!");
    setTimeout(() => setSuccessMessage(""), 2500);
    fetchAds();
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Sigur vrei să ștergi această reclamă?");
    if (!ok) return;
    setDeletingId(id);
    await fetch(`${BASE_URL}/app/ads/${id}`, { method: "DELETE" });
    setDeletingId(null);
    fetchAds();
  };

  const handleEdit = (ad) => {
    setForm({ ...ad, deviceType: ad.deviceType || "LAPTOP" });
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    // scroll to top (spațiul sub bară este calculat mai jos)
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm({
      id: null,
      title: "",
      imageUrl: "",
      link: "",
      position: "left",
      orderIndex: 1,
      startDate: "",
      endDate: "",
      deviceType: filterDevice,
    });
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  return (
    /**
     * IMPORTANT: offset pe mobil sub bara fixă din Admin.
     * Folosim safe-area pentru notch + o înălțime aproximativă a barei (56px).
     * Pe ecrane ≥lg, paddingul se anulează.
     */
    <div
      className="space-y-6 lg:pt-0"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 56px)",
      }}
    >
      {/* hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-semibold">Administrare Reclame</h2>

        {/* Tabs (compact) */}
        <div className="inline-flex rounded-xl border border-gray-200 bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setFilterDevice("LAPTOP")}
            className={`px-3 py-1.5 text-sm transition ${
              filterDevice === "LAPTOP"
                ? "bg-gradient-to-r " + blueGrad + " text-white"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            Laptop
          </button>
          <button
            type="button"
            onClick={() => setFilterDevice("MOBILE")}
            className={`px-3 py-1.5 text-sm transition ${
              filterDevice === "MOBILE"
                ? "bg-gradient-to-r " + blueGrad + " text-white"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            Telefon
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-lg bg-green-50 text-green-700 ring-1 ring-green-200 px-3 py-2 text-sm">{successMessage}</div>
      )}

      {/* FORM CARD */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-4 md:p-5 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{form.id ? "Editează reclamă" : "Adaugă reclamă"}</h3>
          <Chip>Device curent: {labelForDeviceType(form.deviceType)}</Chip>
        </div>

        {/* Titlu */}
        <div className="grid gap-1.5">
          <label className="text-xs font-medium text-gray-600">Titlu</label>
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Ex: Sponsor Principal"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Imagine: URL + Upload */}
        <div className="grid md:grid-cols-[1fr_auto] gap-2">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Imagine (URL sau upload)</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://..."
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={onChooseImage}
              disabled={uploadingImage}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
              title="Încarcă în R2"
            >
              {uploadingImage ? "Upload…" : "Upload"}
            </button>
          </div>
        </div>

        {/* Preview mic */}
        <div className="flex items-center gap-3">
          {showImg ? (
            <img
              src={preview || form.imageUrl}
              alt=""
              className="h-14 w-24 object-contain rounded-lg border bg-white"
              onError={() => setShowImg(false)}
            />
          ) : (
            <div className="h-14 w-24 grid place-items-center rounded-lg border bg-white text-[11px] text-gray-500">—</div>
          )}
          {form.imageUrl && (
            <a
              href={form.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs underline text-gray-600 break-all line-clamp-1"
              title={form.imageUrl}
            >
              {form.imageUrl}
            </a>
          )}
        </div>

        {/* Link */}
        <div className="grid gap-1.5">
          <label className="text-xs font-medium text-gray-600">Link destinație</label>
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="https://site-partener.ro"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
        </div>

        {/* Grid compact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Poziție</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            >
              <option value="left">Stânga</option>
              <option value="right">Dreapta</option>
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Device reclamă</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.deviceType}
              onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
            >
              {DEVICE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Ordine</label>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="1, 2, 3…"
              value={form.orderIndex}
              onChange={(e) =>
                setForm({ ...form, orderIndex: parseInt(e.target.value || "1", 10) })
              }
            />
          </div>
        </div>

        {/* Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Start</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Sfârșit</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white shadow-sm bg-gradient-to-r ${blueGrad} hover:opacity-95`}
          >
            {form.id ? "Actualizează" : "Adaugă"}
          </button>
          {form.id && (
            <button type="button" onClick={resetForm} className="text-sm text-gray-700 underline">
              Renunță la editare
            </button>
          )}
        </div>
      </form>

      {/* LIST GRID */}
      <div className="rounded-2xl border border-gray-200 bg-white/60 backdrop-blur p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Reclame existente</h3>
          {loading && <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-dashed animate-spin" />}
        </div>

        {ads.length === 0 && !loading ? (
          <div className="text-sm text-gray-500">Nu există reclame pentru acest device.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {ads
              .slice()
              .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
              .map((ad) => (
                <div key={ad.id} className="rounded-xl overflow-hidden ring-1 ring-gray-200 bg-white shadow-sm">
                  <div className="relative aspect-[16/9] bg-gray-50">
                    {ad.imageUrl ? (
                      <img
                        src={ad.imageUrl}
                        alt={ad.title || ""}
                        className="absolute inset-0 h-full w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-xs text-gray-400">Fără imagine</div>
                    )}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2">
                      <div className="flex flex-wrap gap-1">
                        <Chip>{labelForDeviceType(ad.deviceType)}</Chip>
                        <Chip>Poziție: {ad.position}</Chip>
                        <Chip>Ordine: {ad.orderIndex ?? "-"}</Chip>
                      </div>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="text-sm font-medium line-clamp-1">{ad.title || "Reclamă"}</div>
                    {(ad.startDate || ad.endDate) && (
                      <div className="mt-1 text-[11px] text-gray-500">
                        {ad.startDate || "—"} → {ad.endDate || "—"}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                        onClick={() => handleEdit(ad)}
                        title="Editează"
                      >
                        ✎ Editează
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-60"
                        onClick={() => handleDelete(ad.id)}
                        disabled={deletingId === ad.id}
                        title="Șterge"
                      >
                        🗑 {deletingId === ad.id ? "Se șterge…" : "Șterge"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsManager;
