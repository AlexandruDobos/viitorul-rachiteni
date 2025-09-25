// src/forms/SendEmailForm.jsx
import React, { useRef, useState, useEffect } from "react";
import { BASE_URL } from "../utils/constants";

const SendEmailForm = () => {
  const editorRef = useRef(null);

  const [title, setTitle] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // SINGLE source of truth for the editor content
  const [contentHtml, setContentHtml] = useState("<p><br/></p>");

  // visual vs raw HTML view
  const [viewMode, setViewMode] = useState("visual"); // "visual" | "html"

  // ---------- helpers

  // Rehydrate the visual editor when we switch to it
  useEffect(() => {
    if (viewMode !== "visual") return;
    if (!editorRef.current) return;
    editorRef.current.innerHTML = contentHtml || "<p><br/></p>";
    // place caret at end
    placeCaretAtEnd(editorRef.current);
  }, [viewMode]); // only on mode switch

  const placeCaretAtEnd = (el) => {
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch {}
  };

  const ensureParagraphRoot = () => {
    const ed = editorRef.current;
    if (!ed) return;
    if (ed.innerHTML.trim() === "" || ed.innerHTML.trim() === "<br>") {
      ed.innerHTML = "<p><br/></p>";
      setContentHtml("<p><br/></p>");
    }
  };

  // Update state whenever the user types in visual editor
  const handleVisualInput = () => {
    if (!editorRef.current) return;
    setContentHtml(editorRef.current.innerHTML);
  };

  // Enter handling: Shift+Enter = br, Enter = new <p>
  const handleKeyDown = (e) => {
    if (viewMode !== "visual") return;
    if (e.key !== "Enter") return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    if (e.shiftKey) {
      e.preventDefault();
      document.execCommand("insertLineBreak");
      handleVisualInput();
      return;
    }

    e.preventDefault();
    const range = sel.getRangeAt(0);
    range.collapse(false);

    const p = document.createElement("p");
    p.innerHTML = "<br/>";
    range.insertNode(p);

    sel.removeAllRanges();
    const r = document.createRange();
    r.setStart(p, 0);
    r.collapse(true);
    sel.addRange(r);

    handleVisualInput();
  };

  // Exec formatting commands (visual only)
  const cmd = (command) => {
    if (viewMode !== "visual") return;
    document.execCommand(command, false, null);
    editorRef.current?.focus();
    handleVisualInput();
  };

  // Insert structural tags (H1/H2/H3/P) around selection (visual only)
  const insertTag = (tag) => {
    if (viewMode !== "visual") return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    const el = document.createElement(tag);
    if (range.collapsed) {
      el.innerHTML = "<br/>";
    } else {
      el.appendChild(range.extractContents());
    }
    range.insertNode(el);

    sel.removeAllRanges();
    const r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(true);
    sel.addRange(r);

    editorRef.current?.focus();
    handleVisualInput();
  };

  // Clean empty paragraphs before sending
  const cleanHtml = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    div.querySelectorAll("p").forEach((p) => {
      if (!p.textContent.trim()) p.remove();
    });
    return div.innerHTML.trim();
  };

  // Mode switches: just switch, contentHtml remains the ONLY source of truth
  const switchToVisual = () => setViewMode("visual");
  const switchToHtml = () => setViewMode("html");

  // ---------- submit

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    const html = cleanHtml(contentHtml || "");

    if (!title.trim() || !html) {
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
      setContentHtml("<p><br/></p>");
      setViewMode("visual");
      if (editorRef.current) {
        editorRef.current.innerHTML = "<p><br/></p>";
      }
    } catch (e2) {
      setErr(e2.message || "Eroare la trimitere.");
    } finally {
      setSending(false);
    }
  };

  // ---------- render

  return (
    <div
      className="w-full max-w-none"
      style={{
        // top offset pe mobil (evită overlap cu header-ul fix)
        paddingTop:
          "clamp(0px, calc((1024px - 100vw) * 9999), calc(env(safe-area-inset-top, 0px) + 56px))",
      }}
    >
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 px-6 py-6 text-white shadow mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Trimite email către abonați
        </h1>
        <p className="text-white/85 text-sm mt-1">
          Creează conținutul (H1/H2/H3/B/I/U) și apasă “Trimite”.
        </p>
      </div>

      {msg && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {msg}
        </div>
      )}
      {err && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {err}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-100 bg-white p-5 md:p-6 shadow-sm"
      >
        <div className="grid gap-5">
          {/* Titlu */}
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

          {/* Header editor + toggle Vizual/Text */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-800">Conținut</label>
            <div className="inline-flex rounded-lg overflow-hidden ring-1 ring-gray-200">
              <button
                type="button"
                onClick={switchToVisual}
                className={[
                  "px-3 py-1.5 text-sm",
                  viewMode === "visual"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 hover:bg-gray-50",
                ].join(" ")}
              >
                Vizual
              </button>
              <button
                type="button"
                onClick={switchToHtml}
                className={[
                  "px-3 py-1.5 text-sm",
                  viewMode === "html"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 hover:bg-gray-50",
                ].join(" ")}
              >
                Text
              </button>
            </div>
          </div>

          {/* Toolbar (doar Vizual) */}
          {viewMode === "visual" && (
            <div className="flex flex-wrap gap-2 -mt-1 mb-2">
              <button
                type="button"
                onClick={() => cmd("bold")}
                className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => cmd("italic")}
                className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              >
                <i>I</i>
              </button>
              <button
                type="button"
                onClick={() => cmd("underline")}
                className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              >
                <u>U</u>
              </button>
              <button
                type="button"
                onClick={() => insertTag("h1")}
                className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => insertTag("h2")}
                className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertTag("h3")}
                className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => insertTag("p")}
                className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              >
                P
              </button>
            </div>
          )}

          {/* Corp editor */}
          {viewMode === "visual" ? (
            <div
              ref={editorRef}
              contentEditable
              onFocus={ensureParagraphRoot}
              onKeyDown={handleKeyDown}
              onInput={handleVisualInput}
              className="min-h-[360px] rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25 prose max-w-none"
              style={{ whiteSpace: "normal" }}
              suppressContentEditableWarning
            />
          ) : (
            <textarea
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
              spellCheck={false}
              className="min-h-[360px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-mono text-sm leading-6 shadow-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25"
              placeholder="<p>Scrie HTML-ul aici...</p>"
            />
          )}

          <p className="text-xs text-gray-500">
            Poți formata: <strong>B</strong>, <em>I</em>, <u>U</u>, H1, H2, H3 și paragrafe.
            <br />
            Enter = paragraf nou, Shift+Enter = linie nouă.
          </p>

          <div className="pt-2">
            <button
              type="submit"
              disabled={sending}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-white shadow-sm transition",
                !sending
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:opacity-95"
                  : "bg-gray-400 cursor-not-allowed",
              ].join(" ")}
            >
              {sending ? "Se trimite…" : "Trimite emailul"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SendEmailForm;
