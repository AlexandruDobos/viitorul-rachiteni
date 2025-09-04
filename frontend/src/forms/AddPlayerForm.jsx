import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../utils/constants';

const AddPlayerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    shirtNumber: '',
    profileImageUrl: '',
  });
  const [players, setPlayers] = useState([]);
  const [editId, setEditId] = useState(null);

  // upload state + hidden file input
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef(null);

  // preview control
  const [preview, setPreview] = useState(null);      // local blob: URL
  const [showImg, setShowImg] = useState(false);     // controls rendering of <img>

  // keep showImg in sync with available source
  useEffect(() => {
    setShowImg(Boolean(preview || formData.profileImageUrl));
  }, [preview, formData.profileImageUrl]);

  // revoke blob URLs to avoid leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ---- helpers pentru R2 (identice ca la anunțuri, dar cu folder=players)
  async function presignForR2(file, folder = 'players') {
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
    const uploadUrl = data.uploadUrl;
    const publicUrl = data.publicUrl;
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

  const fetchPlayers = async () => {
    const res = await fetch(`${BASE_URL}/app/players`);
    if (!res.ok) {
      alert('Eroare la listare jucători');
      return;
    }
    const data = await res.json();
    setPlayers(data);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `${BASE_URL}/app/players/${editId}`
      : `${BASE_URL}/app/players`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      await fetchPlayers();
      setFormData({ name: '', position: '', shirtNumber: '', profileImageUrl: '' });
      setEditId(null);
      // curăță preview-ul
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
    } else {
      alert('Eroare la salvare');
    }
  };

  const handleEdit = (player) => {
    setFormData({
      name: player.name || '',
      position: player.position || '',
      shirtNumber: player.shirtNumber || '',
      profileImageUrl: player.profileImageUrl || '',
    });
    setEditId(player.id);
    // când edităm, nu avem fișier local -> fără preview local
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Sigur vrei să ștergi acest jucător?')) {
      const res = await fetch(`${BASE_URL}/app/players/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchPlayers();
      else alert('Eroare la ștergere');
    }
  };

  // ---- upload imagine
  const onChooseImage = () => fileRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset input
    if (!file) return;

    // arată imediat preview local
    if (preview) URL.revokeObjectURL(preview);
    const local = URL.createObjectURL(file);
    setPreview(local);

    try {
      setUploadingImg(true);
      const { uploadUrl, publicUrl } = await presignForR2(file, 'players');
      await putFileToR2(uploadUrl, file);
      // setăm URL-ul public în formular (se va salva în DB)
      setFormData((p) => ({ ...p, profileImageUrl: publicUrl }));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Încărcarea imaginii a eșuat.');
      // dacă a eșuat, ascundem preview-ul local
      setPreview(null);
    } finally {
      setUploadingImg(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* input ascuns pentru fișier */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* FORMULAR */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          {editId ? 'Editează Jucător' : 'Adaugă Jucător'}
        </h2>

        <input
          name="name"
          placeholder="Nume"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <select
          name="position"
          value={formData.position}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Selectează poziția</option>
          <option value="portar">Portar</option>
          <option value="fundas">Fundaș</option>
          <option value="mijlocas">Mijlocaș</option>
          <option value="atacant">Atacant</option>
        </select>

        <input
          name="shirtNumber"
          type="number"
          placeholder="Număr tricou"
          value={formData.shirtNumber}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          min={0}
        />

        {/* Poză profil: URL + Upload în R2 */}
        <div className="grid gap-2">
          <label className="text-sm font-medium">Poză profil</label>
          <div className="flex gap-2">
            <input
              name="profileImageUrl"
              placeholder="Link poză (sau încarcă mai jos)"
              value={formData.profileImageUrl}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
            <button
              type="button"
              onClick={onChooseImage}
              disabled={uploadingImg}
              className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
              title="Încarcă imagine în R2"
            >
              {uploadingImg ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-dashed" />
                  Upload…
                </>
              ) : (
                <>Upload</>
              )}
            </button>
          </div>

          {formData.profileImageUrl && (
            <div className="mt-1 text-xs text-gray-600 truncate">
              Salvat:&nbsp;
              <a
                href={formData.profileImageUrl}
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                {formData.profileImageUrl}
              </a>
            </div>
          )}

          {/* Preview sigur: arătăm img doar dacă avem src valid; alt="" ca să nu apară text */}
          <div className="mt-2">
            {showImg ? (
              <img
                src={preview || formData.profileImageUrl}
                alt=""
                className="w-16 h-16 rounded-full object-cover border"
                onError={() => setShowImg(false)}
              />
            ) : (
              <div className="w-16 h-16 rounded-full border grid place-items-center text-[11px] text-gray-500">
                {/* placeholder simplu, fără imagine ruptă */}
                —
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editId ? 'Salvează modificările' : 'Adaugă'}
        </button>
      </form>

      {/* LISTĂ */}
      <div className="bg-white shadow rounded p-4">
        <h3 className="text-lg font-semibold mb-2">Jucători existenți</h3>
        <ul className="space-y-2">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between border p-2 rounded"
            >
              <div className="flex items-center gap-3">
                <img
                  src={player.profileImageUrl || '/unknown-player.png'}
                  alt={player.name || ''}
                  className="w-10 h-10 rounded-full object-cover border"
                  onError={(e) => {
                    // ascunde dacă și fallback-ul e invalid
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div>
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-sm text-gray-600">
                    {player.position} #{player.shirtNumber}
                  </div>
                </div>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(player)}
                  className="text-blue-600 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(player.id)}
                  className="text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddPlayerForm;
