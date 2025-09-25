import React, { useRef, useState } from "react";
import { BASE_URL } from "../utils/constants";

const SendEmailForm = () => {
  const editorRef = useRef(null);
  const [title, setTitle] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const cmd = (command) => {
    document.execCommand(command, false, null); // simplu și compatibil
    editorRef.current?.focus();
  };

  const insertTag = (tag) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    // Dacă selecția e colapsată, creăm un element gol pentru a nu pierde caretul
    const el = document.createElement(tag);
    if (range.collapsed) {
      el.innerHTML = "<br/>";
    } else {
      el.appendChild(range.extractContents());
    }
    range.insertNode(el);
    // repoziționează caretul în interiorul noului element
    sel.removeAllRanges();
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(true);
    sel.addRange(r);
    editorRef.current?.focus();
  };

  // asigură-te că editorul are măcar un paragraf
  const ensureParagraphRoot = () => {
    const ed = editorRef.current;
    if (!ed) return;
    if (ed.innerHTML.trim() === "" || ed.innerHTML.trim() === "<br>") {
      ed.innerHTML = "<p><br/></p>";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    // Shift+Enter => doar un br (linie nouă în același paragraf)
    if (e.shiftKey) {
      e.preventDefault();
      document.execCommand("insertLineBreak");
      return;
    }

    // Enter normal => paragraf nou
    e.preventDefault();

    const range = sel.getRangeAt(0);
    range.collapse(false); // după selecție

    const p = document.createElement("p");
    p.innerHTML = "<br/>";

    // introdu noul paragraf
    range.insertNode(p);

    // mută caretul în noul paragraf
    sel.removeAllRanges();
    const r = document.createRange();
    r.setStart(p, 0);
    r.collapse(true);
    sel.addRange(r);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    const html = editorRef.current?.innerHTML?.trim() || "";
    if (!title.trim() || !html || html === "<p><br/></p>") {
      setErr("Te rog completează titlul și conținutul.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${BASE_URL}/email/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: title.trim(), html }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Eroare la trimitere.");
      setMsg(text || "Emailul a fost pus în coadă pentru trimitere.");
      setTitle("");
      if (editorRef.current) editorRef.current.innerHTML = "<p><br/></p>";
    } catch (e2) {
      setErr(e2.message || "Eroare la trimitere.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full max-w-none">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 px-6 py-6 text-white shadow mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Trimite email către abonați</h1>
        <p className="text-white/85 text-sm mt-1">Creează conținutul (H1/H2/H3/B/I/U) și apasă “Trimite”.</p>
      </div>

      {msg && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</div>}
      {err && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{err}</div>}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-sm">
        <div className="grid gap-5">
          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-gray-800">Titlu</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Mesaj important pentru abonați"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-gray-800">Conținut</label>

            {/* Toolbar minimal */}
            <div className="flex flex-wrap gap-2 mb-2">
              <button type="button" onClick={() => cmd("bold")} className="px-3 py-1.5 rounded-lg border hover:bg-gray-50">B</button>
              <button type="button" onClick={() => cmd("italic")} className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"><i>I</i></button>
              <button type="button" onClick={() => cmd("underline")} className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"><u>U</u></button>
              <button type="button" onClick={() => insertTag("h1")} className="px-3 py-1.5 rounded-lg border hover:bg-gray-50">H1</button>
              <button type="button" onClick={() => insertTag("h2")} className="px-3 py-1.5 rounded-lg border hover:bg-gray-50">H2</button>
              <button type="button" onClick={() => insertTag("h3")} className="px-3 py-1.5 rounded-lg border hover:bg-gray-50">H3</button>
              <button type="button" onClick={() => insertTag("p")}  className="px-3 py-1.5 rounded-lg border hover:bg-gray-50">P</button>
            </div>

            <div
              ref={editorRef}
              contentEditable
              onFocus={ensureParagraphRoot}
              onKeyDown={handleKeyDown}
              className="min-h-[360px] rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25 prose max-w-none"
              style={{ whiteSpace: "normal" }}  // folosim <p> pentru paragrafe, nu \n
              placeholder="Scrie mesajul aici..."
              suppressContentEditableWarning
            />
            <p className="text-xs text-gray-500">
              Poți formata textul: <strong>B</strong>, <em>I</em>, <u>U</u>, H1, H2, H3 și paragrafe.
              <br />Enter = paragraf nou, Shift+Enter = linie nouă.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={sending}
              className={[
                'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-white shadow-sm transition',
                !sending ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:opacity-95' : 'bg-gray-400 cursor-not-allowed',
              ].join(' ')}
            >
              {sending ? 'Se trimite…' : 'Trimite emailul'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SendEmailForm;
