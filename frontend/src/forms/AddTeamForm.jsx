// AddTeamForm.jsx — refined professional UI, blue gradient accents only (with mobile-only top offset)
import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../utils/constants';
import defaultLogo from '../assets/unknown-team-logo.png';

/** ------------------ Small UI helpers (blue-only) ------------------ */
const SectionCard = React.forwardRef(({ title, subtitle, children, footer }, ref) => (
  <div ref={ref} className="bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl ring-1 ring-gray-100 overflow-hidden">
    <div className="p-5 border-b bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white">
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

const ButtonPrimary = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-5 py-2.5 text-sm text-white shadow-sm transition hover:opacity-95 disabled:opacity-60 ${className}`}
  >
    {children}
  </button>
);

const ButtonGhost = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`inline-flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-60 ${className}`}
  >
    {children}
  </button>
);

const Message = ({ text }) => (
  <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-2 text-sm text-blue-900">
    {text}
  </div>
);

/** ------------------ Component ------------------ */
const AddTeamForm = () => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState(defaultLogo);
  const [teams, setTeams] = useState([]);
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);

  // upload state + input ascuns pentru fișier
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileRef = useRef(null);

  // preview sigur
  const [preview, setPreview] = useState(null);
  const [showImg, setShowImg] = useState(true);

  // 👇 ref pentru cardul formularului (pt scroll la edit)
  const formCardRef = useRef(null);

  useEffect(() => {
    setShowImg(Boolean(preview || logo || defaultLogo));
  }, [preview, logo]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${BASE_URL}/app/teams`);
      if (!res.ok) throw new Error('Eroare la listare echipe');
      const data = await res.json();
      setTeams(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMessage('❌ Eroare la încărcarea listelor de echipe.');
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  // ---- helpers R2
  async function presignForR2(file, folder = 'teams') {
    const q = new URLSearchParams({ filename: file.name, contentType: file.type || 'application/octet-stream', folder });
    const res = await fetch(`${BASE_URL}/app/uploads/sign?${q.toString()}`, { method: 'GET', credentials: 'include' });
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

  const onChooseLogo = () => fileRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);
    const local = URL.createObjectURL(file);
    setPreview(local);

    try {
      setUploadingLogo(true);
      const { uploadUrl, publicUrl } = await presignForR2(file, 'teams');
      await putFileToR2(uploadUrl, file);
      setLogo(publicUrl);
      setMessage('✅ Logo încărcat cu succes.');
    } catch (err) {
      console.error(err);
      setMessage(err.message || '❌ Încărcarea logo-ului a eșuat.');
      setPreview(null);
      setLogo(defaultLogo);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payloadLogo = logo || defaultLogo;
      const res = await fetch(`${BASE_URL}/app/teams${editId ? '/' + editId : ''}`, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, logo: payloadLogo }),
      });

      if (!res.ok) throw new Error('Failed to save team');
      const data = await res.json();
      setMessage(`✅ Echipa "${data.name}" a fost ${editId ? 'modificată' : 'adăugată'} cu succes.`);
      setName('');
      setLogo(defaultLogo);
      setEditId(null);
      if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
      setShowImg(true);
      fetchTeams();
    } catch (err) {
      setMessage('❌ Eroare la salvare echipă.');
      console.error(err);
    }
  };

  const handleEdit = (team) => {
    setName(team.name);
    setLogo(team.logo || defaultLogo);
    setEditId(team.id);
    setMessage('');
    if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
    setShowImg(true);

    // 👇 Scroll la formular (ca la announcements)
    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDelete = async (id) => {
    if (confirm('Sigur vrei să ștergi această echipă?')) {
      try {
        const res = await fetch(`${BASE_URL}/app/teams/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        fetchTeams();
      } catch (e) {
        console.error(e);
        alert('❌ Eroare la ștergere echipă.');
      }
    }
  };

  return (
    <div
      className="space-y-8"
      style={{
        // ✅ Padding sus doar pe mobil (sub meniul fix); 0 pe ≥1024px
        paddingTop:
          'clamp(0px, calc((1024px - 100vw) * 9999), calc(env(safe-area-inset-top, 0px) + 56px))',
      }}
    >
      {/* input ascuns pentru upload logo */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* FORM */}
      <SectionCard
        ref={formCardRef}
        title={editId ? 'Editează Echipă' : 'Adaugă Echipă'}
        subtitle="Completează detaliile și salvează."
      >
        {message && <Message text={message} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="team-name">Nume echipă</Label>
            <Input id="team-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          {/* Logo: URL + upload în R2 */}
          <div>
            <Label htmlFor="team-logo">Logo</Label>
            <div className="flex gap-2">
              <Input
                id="team-logo"
                type="url"
                placeholder="Link logo (sau încarcă)"
                value={logo}
                onChange={(e) => setLogo(e.target.value || defaultLogo)}
              />
              <ButtonGhost type="button" onClick={onChooseLogo} disabled={uploadingLogo} title="Încarcă logo în R2">
                {uploadingLogo ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    Upload…
                  </>
                ) : (
                  <>Upload</>
                )}
              </ButtonGhost>
            </div>

            {/* preview */}
            <div className="mt-3 flex items-center gap-3">
              {showImg ? (
                <img
                  src={preview || logo || defaultLogo}
                  alt=""
                  className="w-12 h-12 object-contain rounded border bg-white"
                  onError={(e) => { e.currentTarget.src = defaultLogo; setShowImg(true); }}
                />
              ) : (
                <img src={defaultLogo} alt="" className="w-12 h-12 object-contain rounded border bg-white" />
              )}
              {logo && logo !== defaultLogo && (
                <a href={logo} target="_blank" rel="noreferrer" className="text-xs underline text-blue-700 hover:text-blue-900 truncate max-w-[60%]" title={logo}>
                  {logo}
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonPrimary type="submit" className="w-full sm:w-auto">
              {editId ? 'Salvează modificările' : 'Salvează echipa'}
            </ButtonPrimary>
            {editId && (
              <ButtonGhost type="button" onClick={() => { setName(''); setLogo(defaultLogo); setEditId(null); }}>
                Anulează editarea
              </ButtonGhost>
            )}
          </div>
        </form>
      </SectionCard>

      {/* LISTĂ */}
      <SectionCard title="Echipe existente" subtitle="Editează sau elimină echipe.">
        <ul className="space-y-3">
          {teams.map((team) => (
            <li key={team.id} className="flex items-center justify-between border rounded-2xl p-3 md:p-4 hover:bg-gray-50 transition">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={team.logo || defaultLogo}
                  alt={team.name || ''}
                  className="w-10 h-10 object-contain rounded bg-white border"
                  onError={(e) => { e.currentTarget.src = defaultLogo; }}
                />
                <div className="truncate">
                  <div className="font-semibold text-gray-900 truncate">{team.name}</div>
                  {team.logo && team.logo !== defaultLogo && (
                    <a href={team.logo} target="_blank" rel="noreferrer" className="text-xs text-blue-700 underline truncate max-w-[320px]">
                      {team.logo}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(team)} className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  Edit
                </button>
                <button onClick={() => handleDelete(team.id)} className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 text-gray-800 hover:bg-gray-100">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
};

export default AddTeamForm;
