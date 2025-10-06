import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../utils/constants';
import defaultAvatar from '../assets/anonymous-profile-photo.jpg';

function getJwt() {
  return localStorage.getItem('jwt') || null;
}
function authHeaders(extra = {}) {
  const jwt = getJwt();
  return jwt ? { Authorization: `Bearer ${jwt}`, ...extra } : { ...extra };
}

const SectionCard = React.forwardRef(({ title, subtitle, children, footer }, ref) => (
  <div ref={ref} className="bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl ring-1 ring-gray-100 overflow-hidden">
    <div className="p-5 border-b bg-gradient-to-r from-blue-700 to-blue-900 text-white">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-white/90 mt-0.5">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
    {footer && <div className="border-t p-4 bg-gray-50">{footer}</div>}
  </div>
));
SectionCard.displayName = 'SectionCard';

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-900 mb-1">{children}</label>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full h-11 px-3 border rounded-xl bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition ${props.className || ''}`}
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className={`w-full h-11 px-3 border rounded-xl bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition ${props.className || ''}`}
  >
    {children}
  </select>
);

const Badge = ({ children, className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ring-black/5 ${className}`}>{children}</span>
);

const AddPlayerForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    shirtNumber: '',
    profileImageUrl: defaultAvatar,
    isActive: true,
  });
  const [players, setPlayers] = useState([]);
  const [editId, setEditId] = useState(null);

  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [showImg, setShowImg] = useState(true);

  const formCardRef = useRef(null);

  useEffect(() => {
    setShowImg(Boolean(preview || formData.profileImageUrl));
  }, [preview, formData.profileImageUrl]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  // ---- helpers pentru R2 (folder=players)
  async function presignForR2(file, folder = 'players') {
    const q = new URLSearchParams({
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      folder
    });
    const res = await fetch(`${BASE_URL}/app/uploads/sign?${q.toString()}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Nu s-a putut obține URL-ul de încărcare.');
    const data = await res.json();
    const { uploadUrl, publicUrl } = data || {};
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
    const res = await fetch(`${BASE_URL}/app/players?activeOnly=false`);
    if (!res.ok) return alert('Eroare la listare jucători');
    const data = await res.json();
    setPlayers((Array.isArray(data) ? data : []).map((p) => ({ ...p, isActive: p.isActive ?? true })));
  };

  useEffect(() => { fetchPlayers(); }, []);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${BASE_URL}/app/players/${editId}` : `${BASE_URL}/app/players`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    if (res.ok) {
      await fetchPlayers();
      setFormData({ name: '', position: '', shirtNumber: '', profileImageUrl: defaultAvatar, isActive: true });
      setEditId(null);
      if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
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
      isActive: player.isActive ?? true,
    });
    setEditId(player.id);
    if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
    setShowImg(true);
    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleActive = async (player) => {
    const toActivate = !player.isActive;
    const ok = confirm(toActivate ? `Activezi jucătorul "${player.name}"?` : `Dezactivezi jucătorul "${player.name}"?`);
    if (!ok) return;

    const endpoint = toActivate ? 'activate' : 'deactivate';
    const res = await fetch(`${BASE_URL}/app/players/${player.id}/${endpoint}`, {
      method: 'PATCH',
      credentials: 'include',
    });
    if (res.ok) {
      await fetchPlayers();
      if (editId === player.id) setFormData((p) => ({ ...p, isActive: toActivate }));
    } else {
      alert('Operația a eșuat');
    }
  };

  // ---- upload imagine
  const onChooseImage = () => fileRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);
    const local = URL.createObjectURL(file);
    setPreview(local);
    setShowImg(true);

    try {
      setUploadingImg(true);
      const { uploadUrl, publicUrl } = await presignForR2(file, 'players');
      await putFileToR2(uploadUrl, file);
      setFormData((p) => ({ ...p, profileImageUrl: publicUrl }));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Încărcarea imaginii a eșuat.');
      setPreview(null);
      setFormData((p) => ({ ...p, profileImageUrl: defaultAvatar }));
      setShowImg(true);
    } finally {
      setUploadingImg(false);
    }
  };

  return (
    <div
      className="space-y-8"
      style={{
        paddingTop:
          'clamp(0px, calc((1024px - 100vw) * 9999), calc(env(safe-area-inset-top, 0px) + 56px))',
      }}
    >
      {/* input ascuns pentru fișier */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* FORMULAR */}
      <SectionCard
        ref={formCardRef}
        title={editId ? 'Editează Jucător' : 'Adaugă Jucător'}
        subtitle="Completează detaliile jucătorului și salvează."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nume</Label>
            <Input id="name" name="name" placeholder="Nume" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="position">Poziție</Label>
              <Select id="position" name="position" value={formData.position} onChange={handleChange} required>
                <option value="">Selectează poziția</option>
                <option value="portar">Portar</option>
                <option value="fundas">Fundaș</option>
                <option value="mijlocas">Mijlocaș</option>
                <option value="atacant">Atacant</option>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="shirtNumber">Număr tricou</Label>
              <Input id="shirtNumber" name="shirtNumber" type="number" min={0} placeholder="0" value={formData.shirtNumber} onChange={handleChange} />
            </div>

            <div className="md:col-span-1">
              <Label>Stare</Label>
              <div className="h-11 flex items-center gap-2">
                <input type="checkbox" id="isActive" name="isActive" checked={!!formData.isActive} onChange={handleChange} className="h-4 w-4" />
                <label htmlFor="isActive" className="text-sm">Jucător activ</label>
              </div>
            </div>
          </div>

          {/* Poză profil: URL + Upload în R2 */}
          <div className="grid gap-2">
            <Label htmlFor="profileImageUrl">Poză profil</Label>
            <div className="flex gap-2">
              <Input id="profileImageUrl" name="profileImageUrl" placeholder="Link poză (sau încarcă mai jos)" value={formData.profileImageUrl} onChange={handleChange} />
              <button
                type="button"
                onClick={onChooseImage}
                disabled={uploadingImg}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-60 whitespace-nowrap"
                title="Încarcă imagine în R2"
              >
                {uploadingImg ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
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
                <a href={formData.profileImageUrl} className="underline text-blue-700 hover:text-blue-900 break-all" target="_blank" rel="noreferrer">
                  {formData.profileImageUrl}
                </a>
              </div>
            )}

            {/* Preview */}
            <div className="mt-2">
              {showImg ? (
                <img
                  src={preview || formData.profileImageUrl || defaultAvatar}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover border"
                  onError={() => {
                    setPreview(null);
                    setFormData((p) => ({ ...p, profileImageUrl: defaultAvatar }));
                    setShowImg(true);
                  }}
                />
              ) : (
                <img src={defaultAvatar} alt="" className="w-20 h-20 rounded-full object-cover border" />
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-sm w-full sm:w-auto whitespace-nowrap">
              {editId ? 'Salvează modificările' : 'Adaugă'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => { setFormData({ name: '', position: '', shirtNumber: '', profileImageUrl: defaultAvatar, isActive: true }); setEditId(null); }}
                className="border px-5 py-2.5 rounded-xl hover:bg-gray-50 w-full sm:w-auto whitespace-nowrap"
              >
                Anulează editarea
              </button>
            )}
          </div>
        </form>
      </SectionCard>

      {/* LISTĂ */}
      <SectionCard title="Jucători existenți" subtitle="Editează sau activează/dezactivează jucători.">
        <ul className="space-y-3">
          {players.map((player) => {
            const inactive = player.isActive === false;
            return (
              <li
                key={player.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-2xl p-3 md:p-4 hover:bg-gray-50 transition ${inactive ? 'opacity-80' : ''}`}
              >
                {/* stânga */}
                <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                  <img
                    src={player.profileImageUrl || defaultAvatar}
                    alt={player.name || ''}
                    className="w-12 h-12 rounded-full object-cover border flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                  />
                  <div className="min-w-0">
                    <div className={`font-semibold truncate ${inactive ? 'line-through text-gray-500' : 'text-gray-900'}`}>{player.name}</div>
                    <div className="text-sm text-gray-600 truncate">{player.position} {player.shirtNumber ? `#${player.shirtNumber}` : ''}</div>
                    {!inactive ? (
                      <Badge className="mt-1 bg-blue-100 text-blue-800">Activ</Badge>
                    ) : (
                      <Badge className="mt-1 bg-gray-200 text-gray-700">Inactiv</Badge>
                    )}
                  </div>
                </div>

                {/* dreapta – pe mobil în coloană, full width */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleEdit(player)}
                    className="px-3 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm w-full sm:w-auto whitespace-nowrap"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActive(player)}
                    className={`px-3 py-2 rounded-lg text-sm shadow-sm w-full sm:w-auto whitespace-nowrap ${
                      inactive ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    title={inactive ? 'Activează jucător' : 'Dezactivează jucător'}
                  >
                    {inactive ? 'Activează' : 'Dezactivează'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </SectionCard>
    </div>
  );
};

export default AddPlayerForm;
