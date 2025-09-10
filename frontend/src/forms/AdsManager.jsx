// src/pages/AdsManager.jsx
import React, { useState, useEffect, useRef } from "react";
import { BASE_URL } from "../utils/constants";
import {
  Monitor,
  Smartphone,
  Image as ImageIcon,
  UploadCloud,
  Link2,
  CalendarDays,
  Hash,
  Wand2,
  LayoutPanelLeft,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

/* ----------------- constants / helpers ----------------- */
const DEVICE_OPTIONS = [
  { value: "LAPTOP", label: "Laptop" },
  { value: "MOBILE", label: "Telefon" },
];

const inputBase =
  "h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-gray-900 placeholder-gray-400 outline-none ring-indigo-600/20 transition focus:border-indigo-600 focus:ring-2";

const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-4 py-2.5 text-white shadow-sm transition hover:opacity-95 disabled:opacity-60";

const btnSoft =
  "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-gray-800 hover:bg-gray-50";

const btnDanger =
  "inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-white shadow-sm hover:bg-red-700 disabled:opacity-60";

const card = "rounded-2xl border border-gray-200 bg-white shadow-sm";

const labelCls = "text-sm font-medium text-gray-800 flex items-center gap-2";

function labelForDeviceType(v) {
  return DEVICE_OPTIONS.find((d) => d.value === v)?.label || v || "—";
}

/* ----------------- component ----------------- */
const AdsManager = () => {
  // Filtru device pentru listă (LAPTOP/MOBILE)
  const [filterDevice, setFilterDevice] = useState("LAPTOP");

  const [ads, setAds] = useState([]);
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

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // upload state + input ascuns
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef(null);

  // preview sigur (fără icon rupt + text)
  const [preview, setPreview] = useState(null);
  const [showImg, setShowImg] = useState(false);

  useEffect(() => {
    setShowImg(Boolean(preview || form.imageUrl));
  }, [preview, form.imageUrl]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // încarcă reclamele filtrat după deviceType
  const fetchAds = async () => {
    try {
      const q = new URLSearchParams({ device: filterDevice });
      const res = await fetch(`${BASE_URL}/app/ads?${q.toString()}`);
      const data = await res.json();
      setAds(Array.isArray(data) ? data : []);
    } catch {
      setAds([]);
    }
  };

  useEffect(() => {
    fetchAds();
    // când schimb tabul de device, sincronizez și formularul
    setForm((f) => ({ ...f, deviceType: filterDevice, id: null, orderIndex: 1 }));
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDevice]);

  // ---- helpers upload în R2 (folder "ads")
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
      throw new Error(
        `Încărcarea către R2 a eșuat (${res.status}). ${t.slice(0, 200)}`
      );
    }
  }

  const onChooseImage = () => fileRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    // arătăm instant preview local
    if (preview) URL.revokeObjectURL(preview);
    const local = URL.createObjectURL(file);
    setPreview(local);

    try {
      setUploadingImage(true);
      const { uploadUrl, publicUrl } = await presignForR2(file, "ads");
      await putFileToR2(uploadUrl, file);
      setForm((prev) => ({ ...prev, imageUrl: publicUrl }));
      setSuccessMessage("Imagine încărcată cu succes.");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err) {
      setErrorMessage(err.message || "Încărcarea imaginii a eșuat.");
      setTimeout(() => setErrorMessage(""), 3500);
      setPreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = form.id ? "PUT" : "POST";
    const url = form.id ? `${BASE_URL}/app/ads/${form.id}` : `${BASE_URL}/app/ads`;

    const payload = {
      ...form,
      orderIndex: parseInt(form.orderIndex, 10) || 1,
      deviceType: form.deviceType,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Eroare la salvare.");
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
    } catch (err) {
      setErrorMessage(err.message || "Eroare la salvare.");
      setTimeout(() => setErrorMessage(""), 3500);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Sigur vrei să ștergi această reclamă?");
    if (!ok) return;
    setDeletingId(id);
    try {
      await fetch(`${BASE_URL}/app/ads/${id}`, { method: "DELETE" });
      fetchAds();
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (ad) => {
    setForm({
      ...ad,
      deviceType: ad.deviceType || "LAPTOP",
    });
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    // mic scroll pe mobil ca să nu fie acoperit de top bar
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
    <div className="space-y-6 pt-2 lg:pt-0">
      {/* input ascuns pentru upload imagine */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ---------- Header + Tabs device ---------- */}
      <div className={`${card} p-4 sm:p-5`}>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Administrare Reclame</h2>

          <div className="inline-flex overflow-hidden rounded-xl border">
            <button
              type="button"
              onClick={() => setFilterDevice("LAPTOP")}
              className={`flex items-center gap-2 px-3 py-2 text-sm ${
                filterDevice === "LAPTOP"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Monitor className="h-4 w-4" />
              Laptop
            </button>
            <button
              type="button"
              onClick={() => setFilterDevice("MOBILE")}
              className={`flex items-center gap-2 px-3 py-2 text-sm ${
                filterDevice === "MOBILE"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              Telefon
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Alerts ---------- */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}

      {/* ---------- Form card ---------- */}
      <form onSubmit={handleSubmit} className={`${card} p-6 md:p-8`}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {form.id ? "Editează reclamă" : "Adaugă reclamă"}
          </h3>
          <span className="text-xs text-gray-500">
            Device curent: <strong>{labelForDeviceType(filterDevice)}</strong>
          </span>
        </div>

        {/* Titlu */}
        <div className="mb-4">
          <label className={labelCls}>
            <Wand2 className="h-4 w-4 text-indigo-600" />
            Titlu
          </label>
          <input
            className={inputBase}
            placeholder="Ex: Sponsor Principal"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Imagine: URL + Upload + Preview */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
          <div>
            <label className={labelCls}>
              <ImageIcon className="h-4 w-4 text-indigo-600" />
              Imagine (URL sau upload)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                className={inputBase}
                placeholder="https://…"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
              <button
                type="button"
                onClick={onChooseImage}
                disabled={uploadingImage}
                className={btnSoft}
                title="Încarcă în R2"
              >
                <UploadCloud className="h-4 w-4" />
                {uploadingImage ? "Se încarcă…" : "Upload"}
              </button>
            </div>
            {form.imageUrl && (
              <a
                href={form.imageUrl}
                className="mt-2 block truncate text-xs text-gray-600 underline"
                target="_blank"
                rel="noreferrer"
                title={form.imageUrl}
              >
                {form.imageUrl}
              </a>
            )}
          </div>

          <div className="rounded-xl border bg-white p-2">
            <div className="mb-1 text-xs text-gray-500">Preview</div>
            <div className="grid h-36 place-items-center overflow-hidden rounded-lg border bg-gray-50">
              {showImg ? (
                <img
                  src={preview || form.imageUrl}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                  onError={() => setShowImg(false)}
                />
              ) : (
                <div className="text-xs text-gray-400">—</div>
              )}
            </div>
          </div>
        </div>

        {/* Link */}
        <div className="mb-4">
          <label className={labelCls}>
            <Link2 className="h-4 w-4 text-indigo-600" />
            Link destinație
          </label>
          <input
            className={inputBase}
            placeholder="https://exemplu.ro"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
        </div>

        {/* Position / Device / Order */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>
              <LayoutPanelLeft className="h-4 w-4 text-indigo-600" />
              Poziție
            </label>
            <select
              className={inputBase}
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            >
              <option value="left">Stânga</option>
              <option value="right">Dreapta</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>
              <Monitor className="h-4 w-4 text-indigo-600" />
              Device
            </label>
            <select
              className={inputBase}
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

          <div>
            <label className={labelCls}>
              <Hash className="h-4 w-4 text-indigo-600" />
              Ordine afișare
            </label>
            <input
              className={inputBase}
              type="number"
              min={1}
              placeholder="1, 2, 3…"
              value={form.orderIndex}
              onChange={(e) =>
                setForm({
                  ...form,
                  orderIndex: parseInt(e.target.value || "1", 10),
                })
              }
            />
          </div>
        </div>

        {/* Interval date */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>
              <CalendarDays className="h-4 w-4 text-indigo-600" />
              Data început
            </label>
            <input
              className={inputBase}
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>
              <CalendarDays className="h-4 w-4 rotate-180 text-indigo-600" />
              Data sfârșit
            </label>
            <input
              className={inputBase}
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="submit" className={btnPrimary}>
            {form.id ? (
              <>
                <Pencil className="h-4 w-4" />
                Actualizează
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Adaugă reclamă
              </>
            )}
          </button>
          {form.id && (
            <button type="button" className={btnSoft} onClick={resetForm}>
              Renunță la editare
            </button>
          )}
        </div>
      </form>

      {/* ---------- Listă reclame ---------- */}
      <div className={`${card} p-4 sm:p-6`}>
        {ads.length === 0 ? (
          <div className="grid place-items-center py-10 text-sm text-gray-500">
            Nu există reclame pentru {labelForDeviceType(filterDevice)}.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ads.map((ad) => (
              <li key={ad.id} className="overflow-hidden rounded-xl border">
                <div className="grid h-36 place-items-center bg-white">
                  <img
                    src={ad.imageUrl}
                    alt={ad.title || ""}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="space-y-2 border-t p-4">
                  <div className="font-semibold">{ad.title || "—"}</div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700">
                      {labelForDeviceType(ad.deviceType)}
                    </span>
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-indigo-700">
                      Poziție: {ad.position}
                    </span>
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-sky-700">
                      Ordine: {ad.orderIndex}
                    </span>
                  </div>

                  {(ad.startDate || ad.endDate) && (
                    <div className="text-xs text-gray-500">
                      {ad.startDate || "—"} → {ad.endDate || "—"}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button className={btnSoft} onClick={() => handleEdit(ad)}>
                      <Pencil className="h-4 w-4" />
                      Editează
                    </button>
                    <button
                      className={btnDanger}
                      onClick={() => handleDelete(ad.id)}
                      disabled={deletingId === ad.id}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === ad.id ? "Se șterge…" : "Șterge"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdsManager;
