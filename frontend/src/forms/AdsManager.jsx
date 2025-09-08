import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../utils/constants';

const DEVICE_OPTIONS = [
  { value: 'desktop', label: 'Laptop' },
  { value: 'mobile',  label: 'Telefon' },
];

const AdsManager = () => {
  const [selectedDevice, setSelectedDevice] = useState('desktop');
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState({
    id: null,
    title: '',
    imageUrl: '',
    link: '',
    position: 'left',
    device: 'desktop',
    orderIndex: 1,
    startDate: '',
    endDate: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // upload state + input ascuns
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef(null);

  // preview sigur
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

  const fetchAds = async () => {
    const res = await fetch(`${BASE_URL}/app/ads?device=${selectedDevice}`);
    const data = await res.json();
    setAds(data);
  };

  useEffect(() => {
    fetchAds();
    // resetăm device-ul din formular la tabul curent
    setForm(f => ({ ...f, device: selectedDevice, id: null, orderIndex: 1 }));
    if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDevice]);

  // ---- upload to R2
  async function presignForR2(file, folder = 'ads') {
    const q = new URLSearchParams({
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      folder,
    });
    const res = await fetch(`${BASE_URL}/app/uploads/sign?${q.toString()}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Nu s-a putut obține URL-ul de încărcare.');
    const data = await res.json();
    const { uploadUrl, publicUrl } = data;
    if (!uploadUrl || !publicUrl) throw new Error('Răspuns invalid la presign.');
    return { uploadUrl, publicUrl };
  }

  async function putFileToR2(uploadUrl, file) {
    const res = await fetch(uploadUrl, { method: 'PUT', body: file });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`Încărcarea către R2 a eșuat (${res.status}). ${t.slice(0, 200)}`);
    }
  }

  const onChooseImage = () => fileRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);
    const local = URL.createObjectURL(file);
    setPreview(local);

    try {
      setUploadingImage(true);
      const { uploadUrl, publicUrl } = await presignForR2(file, 'ads');
      await putFileToR2(uploadUrl, file);
      setForm((prev) => ({ ...prev, imageUrl: publicUrl }));
      setSuccessMessage('✅ Imagine încărcată cu succes.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setSuccessMessage(err.message || '❌ Încărcarea imaginii a eșuat.');
      setTimeout(() => setSuccessMessage(''), 4000);
      setPreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id
      ? `${BASE_URL}/app/ads/${form.id}`
      : `${BASE_URL}/app/ads`;

    const payload = {
      ...form,
      device: form.device || selectedDevice,
      orderIndex: parseInt(form.orderIndex, 10) || 1,
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => '');
      alert(t || 'Eroare la salvare.');
      return;
    }

    setForm({
      id: null,
      title: '',
      imageUrl: '',
      link: '',
      position: 'left',
      device: selectedDevice,
      orderIndex: 1,
      startDate: '',
      endDate: '',
    });

    if (preview) { URL.revokeObjectURL(preview); setPreview(null); }

    setSuccessMessage(form.id ? 'Reclamă actualizată cu succes!' : 'Reclamă adăugată cu succes!');
    setTimeout(() => setSuccessMessage(''), 3000);
    fetchAds();
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Sigur vrei să ștergi această reclamă?');
    if (!confirmDelete) return;
    setDeletingId(id);
    await fetch(`${BASE_URL}/app/ads/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    fetchAds();
  };

  const handleEdit = (ad) => {
    setForm({
      ...ad,
      device: ad.device || selectedDevice,
    });
    if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
  };

  const resetForm = () => {
    setForm({
      id: null,
      title: '',
      imageUrl: '',
      link: '',
      position: 'left',
      device: selectedDevice,
      orderIndex: 1,
      startDate: '',
      endDate: '',
    });
    if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
  };

  return (
    <div>
      {/* input ascuns pentru upload imagine */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Administrare Reclame</h2>

        {/* tabs device */}
        <div className="inline-flex rounded-lg border overflow-hidden">
          {DEVICE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedDevice(opt.value)}
              className={`px-3 py-1.5 text-sm ${
                selectedDevice === opt.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-white hover:bg-gray-50 text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 text-green-600 font-medium">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2 mb-6">
        <input
          className="w-full border p-2 rounded"
          placeholder="Titlu"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        {/* Imagine: URL + buton Upload + preview */}
        <div className="flex items-center gap-2">
          <input
            className="w-full border p-2 rounded"
            placeholder="Link imagine (sau încarcă)"
            value={form.imageUrl}
            onChange={e => setForm({ ...form, imageUrl: e.target.value })}
          />
          <button
            type="button"
            onClick={onChooseImage}
            disabled={uploadingImage}
            className="whitespace-nowrap border rounded px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
            title="Încarcă imagine în R2"
          >
            {uploadingImage ? 'Upload…' : 'Upload'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {showImg ? (
            <img
              src={preview || form.imageUrl}
              alt=""
              className="w-16 h-16 object-contain rounded border bg-white"
              onError={() => setShowImg(false)}
            />
          ) : (
            <div className="w-16 h-16 grid place-items-center rounded border bg-white text-[11px] text-gray-500">
              —
            </div>
          )}
          {form.imageUrl && (
            <a
              href={form.imageUrl}
              className="text-xs underline text-gray-600 truncate"
              target="_blank"
              rel="noreferrer"
              title={form.imageUrl}
            >
              {form.imageUrl}
            </a>
          )}
        </div>

        <input
          className="w-full border p-2 rounded"
          placeholder="Link destinație"
          value={form.link}
          onChange={e => setForm({ ...form, link: e.target.value })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <select
            className="w-full border p-2 rounded"
            value={form.position}
            onChange={e => setForm({ ...form, position: e.target.value })}
          >
            <option value="left">Stânga</option>
            <option value="right">Dreapta</option>
          </select>

          <select
            className="w-full border p-2 rounded"
            value={form.device}
            onChange={e => setForm({ ...form, device: e.target.value })}
          >
            {DEVICE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <input
            className="w-full border p-2 rounded"
            type="number"
            min={1}
            placeholder="Ordine afișare (1, 2, 3...)"
            value={form.orderIndex}
            onChange={e => setForm({ ...form, orderIndex: parseInt(e.target.value) || 1 })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            className="w-full border p-2 rounded"
            type="date"
            value={form.startDate}
            onChange={e => setForm({ ...form, startDate: e.target.value })}
          />
          <input
            className="w-full border p-2 rounded"
            type="date"
            value={form.endDate}
            onChange={e => setForm({ ...form, endDate: e.target.value })}
          />
        </div>

        <div className="flex gap-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {form.id ? 'Actualizează reclama' : 'Adaugă reclamă'}
          </button>
          {form.id && (
            <button type="button" className="text-gray-600 underline" onClick={resetForm}>
              Renunță la editare
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-2">
        {ads.map(ad => (
          <li key={ad.id} className="flex justify-between items-center border p-2 rounded">
            <div className="flex items-center gap-3">
              <img
                src={ad.imageUrl}
                alt={ad.title || ''}
                className="w-12 h-12 object-contain rounded border bg-white"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div>
                <strong>{ad.title}</strong>
                {' — '}{ad.position}
                {' — '}{ad.device}
                {' — '}Ordine: {ad.orderIndex}
                <br />
                <small>{ad.startDate} → {ad.endDate}</small>
              </div>
            </div>
            <div className="flex space-x-4">
              <button className="text-blue-600" onClick={() => handleEdit(ad)}>Editează</button>
              <button
                className="text-red-600"
                onClick={() => handleDelete(ad.id)}
                disabled={deletingId === ad.id}
              >
                {deletingId === ad.id ? 'Se șterge...' : 'Șterge'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdsManager;
