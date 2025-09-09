import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../utils/constants';
import defaultAvatar from '../assets/anonymous-profile-photo.jpg';

const AddPlayerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    shirtNumber: '',
    profileImageUrl: defaultAvatar,
    isActive: true, // nou: implicit activ
  });
  const [players, setPlayers] = useState([]);
  const [editId, setEditId] = useState(null);

  // upload state + hidden file input
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef(null);

  // preview control
  const [preview, setPreview] = useState(null); // local blob: URL
  const [showImg, setShowImg] = useState(true); // randăm <img> by default

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

  // ---- helpers pentru R2 (folder=players)
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
    // aducem TOȚI jucătorii (inclusiv inactivi), ca să putem reactiva din UI
    const res = await fetch(`${BASE_URL}/app/players?activeOnly=false`);
    if (!res.ok) {
      alert('Eroare la listare jucători');
      return;
    }
    const data = await res.json();
    // asigurăm fallback pentru isActive (în caz că vechile înregistrări nu au coloana populată)
    setPlayers((Array.isArray(data) ? data : []).map(p => ({ ...p, isActive: p.isActive ?? true })));
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // suportă și checkbox (isActive)
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
      // resetare: păstrăm implicit avatarul anonim + activ
      setFormData({
        name: '',
        position: '',
        shirtNumber: '',
        profileImageUrl: defaultAvatar,
        isActive: true,
      });
      setEditId(null);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
      setShowImg(true);
    } else {
      alert('Eroare la salvare');
    }
  };

  const handleEdit = (player) => {
    setFormData({
      name: player.name || '',
      position: player.position || '',
      shirtNumber: player.shirtNumber || '',
      profileImageUrl: player.profileImageUrl || defaultAvatar,
      isActive: player.isActive ?? true, // nou
    });
    setEditId(player.id);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setShowImg(true);
  };

  // În loc de ștergere: toggle activ/inactiv
  const toggleActive = async (player) => {
    const toActivate = !player.isActive;
    const ok = confirm(
      toActivate
        ? `Activezi jucătorul "${player.name}"?`
        : `Dezactivezi jucătorul "${player.name}"?`
    );
    if (!ok) return;

    const endpoint = toActivate ? 'activate' : 'deactivate';
    const res = await fetch(`${BASE_URL}/app/players/${player.id}/${endpoint}`, {
      method: 'PATCH',
    });
    if (res.ok) {
      await fetchPlayers();
      // dacă edităm fix acest jucător, sincronizăm și formularul
      if (editId === player.id) {
        setFormData((p) => ({ ...p, isActive: toActivate }));
      }
    } else {
      alert('Operația a eșuat');
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
    setShowImg(true);

    try {
      setUploadingImg(true);
      const { uploadUrl, publicUrl } = await presignForR2(file, 'players');
      await putFileToR2(uploadUrl, file);
      // setăm URL-ul public în formular (se va salva în DB)
      setFormData((p) => ({ ...p, profileImageUrl: publicUrl }));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Încărcarea imaginii a eșuat.');
      // revenim la avatarul implicit
      setPreview(null);
      setFormData((p) => ({ ...p, profileImageUrl: defaultAvatar }));
      setShowImg(true);
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

          {/* Preview sigur */}
          <div className="mt-2">
            {showImg ? (
              <img
                src={preview || formData.profileImageUrl || defaultAvatar}
                alt=""
                className="w-16 h-16 rounded-full object-cover border"
                onError={() => {
                  setPreview(null);
                  setFormData((p) => ({ ...p, profileImageUrl: defaultAvatar }));
                  setShowImg(true);
                }}
              />
            ) : (
              <img
                src={defaultAvatar}
                alt=""
                className="w-16 h-16 rounded-full object-cover border"
              />
            )}
          </div>
        </div>

        {/* Nou: status activ/inactiv */}
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            checked={!!formData.isActive}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <span>Jucător activ</span>
        </label>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editId ? 'Salvează modificările' : 'Adaugă'}
        </button>
      </form>

      {/* LISTĂ */}
      <div className="bg-white shadow rounded p-4">
        <h3 className="text-lg font-semibold mb-2">Jucători existenți</h3>
        <ul className="space-y-2">
          {players.map((player) => {
            const inactive = player.isActive === false;
            return (
              <li
                key={player.id}
                className={`flex items-center justify-between border p-2 rounded ${
                  inactive ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={player.profileImageUrl || defaultAvatar}
                    alt={player.name || ''}
                    className="w-10 h-10 rounded-full object-cover border"
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatar;
                    }}
                  />
                  <div>
                    <div className={`font-semibold ${inactive ? 'line-through text-gray-500' : ''}`}>
                      {player.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {player.position} #{player.shirtNumber}
                    </div>
                    {!inactive ? (
                      <span className="mt-0.5 inline-block text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Activ
                      </span>
                    ) : (
                      <span className="mt-0.5 inline-block text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                        Inactiv
                      </span>
                    )}
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
                    onClick={() => toggleActive(player)}
                    className={`text-sm ${inactive ? 'text-emerald-700' : 'text-red-600'}`}
                    title={inactive ? 'Activează jucător' : 'Dezactivează jucător'}
                  >
                    {inactive ? 'Activează' : 'Dezactivează'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AddPlayerForm;
