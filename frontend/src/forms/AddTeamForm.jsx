import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../utils/constants';

const AddTeamForm = () => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [teams, setTeams] = useState([]);
  const [message, setMessage] = useState('');
  const [editId, setEditId] = useState(null);

  // upload state + input ascuns pentru fișier
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileRef = useRef(null);

  // control pentru preview sigur (fără icon rupt + text)
  const [preview, setPreview] = useState(null);   // blob URL local
  const [showImg, setShowImg] = useState(false);  // dacă randăm <img> sau placeholder

  // sincronizează randarea imaginii în funcție de sursele disponibile
  useEffect(() => {
    setShowImg(Boolean(preview || logo));
  }, [preview, logo]);

  // curăță blob URL-urile ca să nu avem scurgeri de memorie
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${BASE_URL}/app/teams`);
      if (!res.ok) throw new Error('Eroare la listare echipe');
      const data = await res.json();
      setTeams(data);
    } catch (e) {
      console.error(e);
      setMessage('❌ Eroare la încărcarea listelor de echipe.');
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // ---- helpers R2 (ca în celelalte formulare)
  async function presignForR2(file, folder = 'teams') {
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

  const onChooseLogo = () => fileRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset input
    if (!file) return;

    // arată instant preview local
    if (preview) URL.revokeObjectURL(preview);
    const local = URL.createObjectURL(file);
    setPreview(local);

    try {
      setUploadingLogo(true);
      const { uploadUrl, publicUrl } = await presignForR2(file, 'teams');
      await putFileToR2(uploadUrl, file);
      setLogo(publicUrl); // URL-ul public (se salvează în DB)
      setMessage('✅ Logo încărcat cu succes.');
    } catch (err) {
      console.error(err);
      setMessage(err.message || '❌ Încărcarea logo-ului a eșuat.');
      setPreview(null); // ascunde preview dacă a eșuat
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${BASE_URL}/app/teams${editId ? '/' + editId : ''}`, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, logo }),
      });

      if (!res.ok) throw new Error('Failed to save team');

      const data = await res.json();
      setMessage(`✅ Echipa "${data.name}" a fost ${editId ? 'modificată' : 'adăugată'} cu succes.`);
      setName('');
      setLogo('');
      setEditId(null);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
      fetchTeams();
    } catch (err) {
      setMessage('❌ Eroare la salvare echipă.');
      console.error(err);
    }
  };

  const handleEdit = (team) => {
    setName(team.name);
    setLogo(team.logo || '');
    setEditId(team.id);
    setMessage('');
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
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
    <div className="space-y-6">
      {/* input ascuns pentru upload logo */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4 text-center">
          {editId ? 'Editează Echipă' : 'Adaugă Echipă'}
        </h2>

        {message && <p className="mb-4 text-sm text-center">{message}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nume echipă</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Logo: URL + buton de upload în R2 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Logo</label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Link logo (sau încarcă)"
              value={logo}
              onChange={e => setLogo(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
            <button
              type="button"
              onClick={onChooseLogo}
              disabled={uploadingLogo}
              className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
              title="Încarcă logo în R2"
            >
              {uploadingLogo ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-dashed" />
                  Upload…
                </>
              ) : (
                <>Upload</>
              )}
            </button>
          </div>

          {/* preview sigur */}
          <div className="mt-2 flex items-center gap-3">
            {showImg ? (
              <img
                src={preview || logo}
                alt=""                                        
                className="w-10 h-10 object-contain rounded border bg-white"
                onError={() => setShowImg(false)}            
              />
            ) : (
              <div className="w-10 h-10 rounded border bg-white grid place-items-center text-[11px] text-gray-500">
                —
              </div>
            )}
            {logo && (
              <a
                href={logo}
                target="_blank"
                rel="noreferrer"
                className="text-xs underline text-gray-600 truncate"
                title={logo}
              >
                {logo}
              </a>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
        >
          {editId ? 'Salvează modificările' : 'Salvează echipa'}
        </button>
      </form>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Echipe existente</h3>
        <ul className="space-y-2">
          {teams.map((team) => (
            <li key={team.id} className="flex justify-between items-center border p-2 rounded">
              <div className="flex items-center gap-2">
                <img
                  src={team.logo || '/unknown-team-logo.png'}
                  alt={team.name || ''}
                  className="w-6 h-6 object-contain rounded bg-white border"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}  
                />
                <strong>{team.name}</strong>
              </div>
              <div className="space-x-2">
                <button onClick={() => handleEdit(team)} className="text-blue-600 text-sm">Edit</button>
                <button onClick={() => handleDelete(team.id)} className="text-red-600 text-sm">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AddTeamForm;
