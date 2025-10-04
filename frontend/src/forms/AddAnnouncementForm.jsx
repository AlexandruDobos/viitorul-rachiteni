/* eslint-disable no-unused-vars */
// src/forms/AddAnnouncementForm.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import {
  useEditor,
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import BaseImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import { NodeSelection } from "prosemirror-state";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  ImagePlus,
  Undo,
  Redo,
  Eraser,
  PaintBucket,
  UploadCloud,
  Calendar,
  Link2,
  Edit3,
  Trash2,
  ZoomIn,
  ZoomOut,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { BASE_URL } from "../utils/constants";

/* ======================= Inline image + drag-resize ======================= */
const ResizableInlineImage = BaseImage.extend({
  name: "image",
  inline: true,
  group: "inline",
  draggable: false,
  selectable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const style = el.getAttribute("style") || "";
          const m = style.match(/width\s*:\s*(\d+)px/i);
          if (m) return parseInt(m[1], 10);
          const wAttr = el.getAttribute("width");
          return wAttr ? parseInt(wAttr, 10) : null;
        },
        renderHTML: (attrs) => {
          const out = {};
          const styles = [];
          if (attrs.width) styles.push(`width:${attrs.width}px;`);
          if (attrs.align === "center") {
            styles.push("display:block;margin-left:auto;margin-right:auto;");
          } else if (attrs.align === "right") {
            styles.push("display:block;margin-left:auto;");
          }
          if (styles.length) out.style = styles.join("");
          return out;
        },
      },
      height: { default: null },
      align: {
        default: null,
        parseHTML: (el) => {
          const style = (el.getAttribute("style") || "").toLowerCase();
          const hasCenter =
            style.includes("margin-left:auto") && style.includes("margin-right:auto");
          const hasRight = style.includes("margin-left:auto") && !hasCenter;
          if (hasCenter) return "center";
          if (hasRight) return "right";
          return null;
        },
        renderHTML: () => ({}),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineImageView);
  },
});

function InlineImageView({ node, updateAttributes, selected, editor, getPos }) {
  const imgRef = useRef(null);
  const wrapRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const start = useRef({ x: 0, width: 0, pointerId: null });

  const clampToParent = (w) => {
    const parentWidth =
      wrapRef.current?.closest(".tiptap-editor-root")?.clientWidth ||
      wrapRef.current?.parentElement?.getBoundingClientRect()?.width ||
      window.innerWidth;
    return Math.max(80, Math.min(Math.floor(parentWidth), Math.floor(w)));
  };

  const selectThisNode = () => {
    const pos = typeof getPos === "function" ? getPos() : null;
    if (typeof pos !== "number" || !editor?.view) return;
    requestAnimationFrame(() => {
      const { state, dispatch } = editor.view;
      if (pos < 0 || pos > state.doc.content.size) return;
      try {
        const tr = state.tr.setSelection(NodeSelection.create(state.doc, pos));
        dispatch(tr);
        editor.view.focus();
      } catch {}
    });
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    selectThisNode();
    if (!imgRef.current) return;
    start.current = {
      x: e.clientX,
      width: imgRef.current.getBoundingClientRect().width,
      pointerId: e.pointerId,
    };
    setIsResizing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isResizing || start.current.pointerId !== e.pointerId) return;
    const deltaX = e.clientX - start.current.x;
    const newWidth = clampToParent(start.current.width + deltaX);
    updateAttributes({ width: newWidth });
  };

  const onPointerUp = (e) => {
    if (start.current.pointerId === e.pointerId) {
      setIsResizing(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <NodeViewWrapper
      as="span"
      ref={wrapRef}
      className={`relative inline-block align-middle my-1 ${
        selected ? "ring-2 ring-blue-400 rounded-md" : ""
      }`}
      contentEditable={false}
      onMouseDown={(e) => {
        if (e.target === imgRef.current) selectThisNode();
      }}
      style={{ userSelect: isResizing ? "none" : undefined }}
    >
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt={node.attrs.alt || "image"}
        title={node.attrs.title}
        draggable={false}
        className="rounded-md border bg-white"
        style={{
          maxWidth: "100%",
          height: "auto",
          width: node.attrs.width ? `${node.attrs.width}px` : undefined,
          transition: isResizing ? "none" : "width 80ms linear",
          verticalAlign: "middle",
        }}
        onLoad={(e) => {
          if (!node.attrs.width && e.currentTarget) {
            const naturalW = e.currentTarget.naturalWidth || 0;
            const initial = clampToParent(naturalW || 600);
            updateAttributes({ width: initial });
          }
        }}
        onClick={() => selectThisNode()}
      />
      <div
        role="button"
        aria-label="Redimensionează imagine"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`absolute -bottom-2 -right-2 h-4 w-4 rounded-full border bg-white shadow transition ${
          (selected || isResizing) ? "opacity-100 cursor-nwse-resize" : "opacity-0"
        }`}
        style={{ touchAction: "none" }}
      />
      {(selected || isResizing) && (
        <span className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-blue-300" />
      )}
    </NodeViewWrapper>
  );
}

/* ============================= Utils ============================= */
function isoToInputLocal(iso) {
  try {
    if (!iso) return new Date().toISOString().slice(0, 16);
    const d = new Date(iso);
    const pad = (n) => (n < 10 ? "0" + n : "" + n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  } catch {
    return new Date().toISOString().slice(0, 16);
  }
}
function formatDateForList(iso) {
  try {
    return new Date(iso).toLocaleString("ro-RO");
  } catch {
    return iso || "";
  }
}
const htmlToText = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || div.innerText || "";
};

/* ====================== Main component ====================== */
function AddAnnouncementForm({ onSave }) {
  // scroll anchor to jump to on Edit
  const formTopRef = useRef(null);
  const titleInputRef = useRef(null);

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : true
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [title, setTitle] = useState("");
  const [publishedAt, setPublishedAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [coverUrl, setCoverUrl] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [submitting, setSubmitting] = useState(false);

  // ---------- LIST with search + pagination ----------
  const [announcements, setAnnouncements] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // small debounce for query
  const debouncedQuery = useDebounce(query, 350);

  const [editId, setEditId] = useState(null);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);

  const coverFileRef = useRef(null);
  const inlineFileRef = useRef(null);

  // --- NEW: view mode state and raw HTML (for textarea)
  const [viewMode, setViewMode] = useState("visual"); // "visual" | "html"
  const [rawHtml, setRawHtml] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Link.configure({
        autolink: true,
        openOnClick: true,
        protocols: ["http", "https", "mailto", "tel", "sms"],
        linkOnPaste: true,
      }),
      ResizableInlineImage.configure({
        HTMLAttributes: { class: "max-w-full h-auto rounded-md border bg-white" },
      }),
      Placeholder.configure({
        placeholder: "Scrie conținutul anunțului aici…",
      }),
    ],
    content:
      "<p><em>Sfat:</em> selectează textul și folosește bara de instrumente pentru bold, italic, subliniat, culoare, link, imagini etc.</p>",
    editorProps: {
      attributes: {
        class:
          "tiptap-editor-root prose prose-slate max-w-none min-h[280px] min-h-[280px] rounded-2xl border bg-white p-4 focus:outline-none",
      },
    },
  });

  const canUndo = editor?.can().undo() ?? false;
  const canRedo = editor?.can().redo() ?? false;

  /* ===== helpers imagine ===== */
  const setImageAttrs = (patch) => {
    if (!editor) return false;
    const { state } = editor;
    const { selection, doc } = state;
    let pos = null;

    if (selection instanceof NodeSelection && selection.node.type.name === "image") {
      pos = selection.from;
    } else {
      const $from = selection.$from;
      const after = $from.nodeAfter;
      const before = $from.nodeBefore;
      if (after && after.type.name === "image") {
        pos = $from.pos;
      } else if (before && before.type.name === "image") {
        pos = $from.pos - before.nodeSize;
      } else {
        doc.nodesBetween(
          Math.max(0, selection.from - 1),
          Math.min(doc.content.size, selection.to + 1),
          (node, posHere) => {
            if (!pos && node.type.name === "image") {
              pos = posHere;
              return false;
            }
            return true;
          }
        );
      }
    }

    if (pos == null) return false;
    const node = editor.state.doc.nodeAt(pos);
    if (!node || node.type.name !== "image") return false;

    const newAttrs = { ...node.attrs, ...patch };
    const tr = editor.state.tr.setNodeMarkup(pos, undefined, newAttrs);
    editor.view.dispatch(tr);
    editor.view.focus();
    return true;
  };

  const getEditorWidth = () => {
    if (!editor?.view?.dom) return 800;
    return Math.max(200, editor.view.dom.clientWidth - 16);
  };

  const nudgeImageWidth = (delta) => {
    if (!editor) return;
    const attrs = editor.getAttributes("image") || {};
    let w = parseInt(attrs.width, 10);
    if (!w || Number.isNaN(w)) w = Math.round(getEditorWidth() * 0.8);
    w = Math.max(80, w + delta);
    setImageAttrs({ width: w });
  };

  const setImagePercent = (pct) => {
    const px = Math.max(80, Math.round((getEditorWidth() * pct) / 100));
    setImageAttrs({ width: px });
  };

  const resetImageWidth = () => setImageAttrs({ width: null });
  const setImageAlign = (align) => setImageAttrs({ align });

  const isNearImage = () => {
    if (!editor) return false;
    const sel = editor.state.selection;
    return sel instanceof NodeSelection
      ? sel.node.type.name === "image"
      : sel.$from.nodeBefore?.type?.name === "image" ||
          sel.$from.nodeAfter?.type?.name === "image";
  };

  const setBlockAlign = (align) => {
    if (!editor) return;
    const near = isNearImage();
    editor.chain().focus().setTextAlign(align).run();
    if (near) setImageAlign(align === "justify" ? "left" : align);
  };

  const currentBlockAlign = () => {
    if (!editor) return null;
    const { state } = editor;
    const { selection } = state;
    let $pos = selection.$from;
    if (selection instanceof NodeSelection && selection.node.type.name === "image") {
      $pos = state.doc.resolve(selection.from);
    }
    for (let d = $pos.depth; d >= 0; d--) {
      const node = $pos.node(d);
      if (node.type.name === "paragraph" || node.type.name === "heading") {
        return node.attrs.textAlign || null;
      }
    }
    return null;
  };
  const blockAlign = currentBlockAlign();

  /* ---------------- API: Page + Search (DESC by backend) ---------------- */
  const fetchAnnouncementsPage = async (pageIdx, keepPage = false) => {
    try {
      setLoadingList(true);
      const params = new URLSearchParams();
      params.set("page", String(pageIdx ?? page));
      params.set("size", String(size));
      if (debouncedQuery?.trim()) params.set("q", debouncedQuery.trim());

      const res = await fetch(`${BASE_URL}/app/announcements/page?${params.toString()}`);
      if (!res.ok) throw new Error("Eroare la listare");
      const data = await res.json();

      const list = Array.isArray(data?.content) ? data.content : [];
      setAnnouncements(list);
      setTotalPages(data?.totalPages ?? 0);
      setTotalElements(data?.totalElements ?? 0);
      if (!keepPage) setPage(data?.number ?? 0); // backend returns current page index
    } catch (e) {
      console.error(e);
      alert("Nu s-au putut încărca anunțurile.");
      setAnnouncements([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoadingList(false);
    }
  };

  // initial & whenever debounced query / size changes -> reset to page 0
  useEffect(() => {
    fetchAnnouncementsPage(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, size]);

  // when page changes (via controls)
  useEffect(() => {
    fetchAnnouncementsPage(page, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  /* --------------- R2 helpers --------------- */
  async function presignForR2(file, folder = "announcements") {
    const q = new URLSearchParams({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      folder,
    });
    const res = await fetch(`${BASE_URL}/app/uploads/sign?${q}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Nu s-a putut obține URL-ul de încărcare.");
    const data = await res.json();
    const { uploadUrl, publicUrl } = data || {};
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

  /* --------------- Toolbar actions --------------- */
  const addLink = () => {
    if (!editor || viewMode === "html") return;
    const prev = editor.getAttributes("link")?.href || "";
    const url = window.prompt(
      "Introdu URL-ul (poți folosi și o rută internă, ex: /anunturi/123)",
      prev || "https://"
    );
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    if (!editor || viewMode === "html") return;
    const url = window.prompt("Introdu URL-ul imaginii");
    if (!url) return;
    editor.chain().focus().setImage({ src: url, alt: "image" }).run();
  };

  const handleInlineFile = async (e) => {
    if (viewMode === "html") return;
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setUploadingInline(true);
      const { uploadUrl, publicUrl } = await presignForR2(file);
      await putFileToR2(uploadUrl, file);
      editor?.chain().focus().setImage({ src: publicUrl, alt: file.name }).run();
    } catch (err) {
      console.error(err);
      alert(err.message || "Încărcarea imaginii a eșuat.");
    } finally {
      setUploadingInline(false);
    }
  };

  const clearFormatting = () => {
    if (viewMode === "html") return;
    editor?.chain().focus().clearNodes().unsetAllMarks().run();
  };

  const resetForm = () => {
    setTitle("");
    setCoverUrl("");
    setPublishedAt(new Date().toISOString().slice(0, 16));
    setTextColor("#000000");
    setEditId(null);
    editor?.commands.setContent("");
    setRawHtml("");
    setViewMode("visual");
    // focus title
    requestAnimationFrame(() => titleInputRef.current?.focus());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // HTML-ul sursa depinde de modul curent
    const html = viewMode === "html" ? (rawHtml || "") : (editor?.getHTML() || "");
    const payload = {
      title: title.trim(),
      publishedAt: new Date(publishedAt).toISOString(),
      coverUrl: coverUrl.trim() || null,
      contentHtml: html,
      contentText: viewMode === "html" ? htmlToText(html) : (editor?.getText() || htmlToText(html)),
    };

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${BASE_URL}/app/announcements/${editId}`
      : `${BASE_URL}/app/announcements`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Eroare la salvare");

      const saved = await res.json().catch(() => null);
      onSave?.(saved || payload);

      // after save, refresh list from page 0 with current search
      await fetchAnnouncementsPage(0, false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("A apărut o eroare la salvare.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (a) => {
    setEditId(a.id);
    setTitle(a.title || "");
    setCoverUrl(a.coverUrl || "");
    setPublishedAt(isoToInputLocal(a.publishedAt));
    editor?.commands.setContent(a.contentHtml || "");
    setRawHtml(a.contentHtml || "");
    setViewMode("visual");

    // 🔝 scroll to form + focus title
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => titleInputRef.current?.focus(), 250);
  };

  const handleDelete = async (id) => {
    if (!confirm("Sigur vrei să ștergi acest anunț?")) return;
    try {
      const res = await fetch(`${BASE_URL}/app/announcements/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Eroare la ștergere");
      // if deleting last item on page, move back a page if needed
      const newCount = totalElements - 1;
      const lastPage = Math.max(0, Math.ceil(newCount / size) - 1);
      const targetPage = Math.min(page, lastPage);
      setTotalElements(newCount);
      setPage(targetPage);
      await fetchAnnouncementsPage(targetPage, true);
      if (editId === id) resetForm();
    } catch (e) {
      console.error(e);
      alert("Nu s-a putut șterge anunțul.");
    }
  };

  const onChooseCover = () => coverFileRef.current?.click();
  const handleCoverFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setUploadingCover(true);
      const { uploadUrl, publicUrl } = await presignForR2(file);
      await putFileToR2(uploadUrl, file);
      setCoverUrl(publicUrl);
    } catch (err) {
      console.error(err);
      alert(err.message || "Încărcarea imaginii a eșuat.");
    } finally {
      setUploadingCover(false);
    }
  };

  /* ============================ UI ============================ */
  return (
    <div
      className="space-y-6 lg:pt-0"
      style={{ paddingTop: isMobile ? "calc(env(safe-area-inset-top, 0px) + 56px)" : 0 }}
    >
      {/* invisible anchor to scroll to */}
      <span ref={formTopRef} />

      <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
      <input ref={inlineFileRef} type="file" accept="image/*" className="hidden" onChange={handleInlineFile} />

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <h2 className="text-lg font-semibold tracking-tight">
            {editId ? "Editează anunț" : "Adaugă anunț"}
          </h2>
          {editId && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              ID: {editId}
            </span>
          )}
        </div>

        <div className="grid gap-5 p-5">
          {/* Title */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Titlu anunț</label>
            <div className="relative">
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Meci amical sâmbătă, ora 18:00"
                required
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 pr-3 text-gray-900 placeholder-gray-400 outline-none ring-indigo-600/20 transition focus:border-indigo-600 focus:ring-2"
              />
            </div>
          </div>

          {/* Date + Cover */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-3">
              <label className="text-sm font-medium">Data publicării</label>
              <div className="relative mt-2 md:mt-0">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Calendar className="h-4 w-4" />
                </span>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-gray-900 outline-none ring-indigo-600/20 transition focus:border-indigo-600 focus:ring-2"
                />
              </div>
              <p className="mt-1 text-[11px] leading-4 text-gray-500">
                zi/lună/an + oră:minut (se salvează intern ca ISO).
              </p>
            </div>

            <div className="md:col-span-9">
              <label className="text-sm font-medium">Poză de copertă (URL, opțional)</label>
              <div className="mt-2 flex w-full gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Link2 className="h-4 w-4" />
                  </span>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://exemplu.ro/cover.jpg"
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-gray-900 placeholder-gray-400 outline-none ring-indigo-600/20 transition focus:border-indigo-600 focus:ring-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={onChooseCover}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                  title="Încarcă imagine în R2"
                >
                  {uploadingCover ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-dashed" />
                      Upload…
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>

              {coverUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={coverUrl}
                    alt="cover"
                    className="h-14 w-14 rounded-lg border object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <a
                    href={coverUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-xs text-blue-700 underline"
                    title={coverUrl}
                  >
                    {coverUrl}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* --- Mode toggle Vizual/Text --- */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Conținut</span>
            <div className="inline-flex rounded-lg overflow-hidden ring-1 ring-gray-200">
              <button
                type="button"
                onClick={() => {
                  if (viewMode === "html") editor?.commands.setContent(rawHtml || "");
                  setViewMode("visual");
                }}
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
                onClick={() => {
                  setRawHtml(editor?.getHTML() || "");
                  setViewMode("html");
                }}
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

          {/* Toolbar (disabled în “Text”) */}
          <div
            className={`rounded-2xl border border-gray-200 bg-white p-2 ${
              viewMode === "html" ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <ToolButton onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")}>
                <Bold className="h-4 w-4" />
              </ToolButton>
              <ToolButton onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")}>
                <Italic className="h-4 w-4" />
              </ToolButton>
              <ToolButton onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive("underline")}>
                <UnderlineIcon className="h-4 w-4" />
              </ToolButton>
              <ToolButton onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive("strike")}>
                <Strikethrough className="h-4 w-4" />
              </ToolButton>

              <Divider />

              <ToolButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive("heading", { level: 1 })}>
                <Heading1 className="h-4 w-4" />
              </ToolButton>
              <ToolButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })}>
                <Heading2 className="h-4 w-4" />
              </ToolButton>
              <ToolButton onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })}>
                <Heading3 className="h-4 w-4" />
              </ToolButton>

              <Divider />

              <ToolButton onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")}>
                <List className="h-4 w-4" />
              </ToolButton>
              <ToolButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")}>
                <ListOrdered className="h-4 w-4" />
              </ToolButton>
              <ToolButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")}>
                <Quote className="h-4 w-4" />
              </ToolButton>

              <Divider />

              <ToolButton title="Aliniază la stânga" onClick={() => setBlockAlign("left")} active={blockAlign === "left" || (!blockAlign && true)}>
                <AlignLeft className="h-4 w-4" />
              </ToolButton>
              <ToolButton title="Centrează" onClick={() => setBlockAlign("center")} active={blockAlign === "center"}>
                <AlignCenter className="h-4 w-4" />
              </ToolButton>
              <ToolButton title="Aliniază la dreapta" onClick={() => setBlockAlign("right")} active={blockAlign === "right"}>
                <AlignRight className="h-4 w-4" />
              </ToolButton>
              <ToolButton title="Justify" onClick={() => setBlockAlign("justify")} active={blockAlign === "justify"}>
                <AlignJustify className="h-4 w-4" />
              </ToolButton>

              <Divider />

              <ToolButton onClick={addLink} active={editor?.isActive("link")}>
                <LinkIcon className="h-4 w-4" />
              </ToolButton>
              <ToolButton onClick={addImage} title="Inserează imagine din URL">
                <ImageIcon className="h-4 w-4" />
              </ToolButton>
              <ToolButton
                onClick={() => inlineFileRef.current?.click()}
                title="Încarcă imagine și inserează"
                disabled={uploadingInline}
              >
                {uploadingInline ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-dashed" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
              </ToolButton>

              {isNearImage() && (
                <>
                  <Divider />
                  <span className="text-xs text-gray-500 px-1">Imagine:</span>
                  <ToolButton title="Micșorează" onClick={() => nudgeImageWidth(-60)}>
                    <ZoomOut className="h-4 w-4" />
                  </ToolButton>
                  <ToolButton title="Mărește" onClick={() => nudgeImageWidth(60)}>
                    <ZoomIn className="h-4 w-4" />
                  </ToolButton>
                  <ToolButton title="50% lățime" onClick={() => setImagePercent(50)}>
                    <span className="text-[11px] font-medium">50%</span>
                  </ToolButton>
                  <ToolButton title="75% lățime" onClick={() => setImagePercent(75)}>
                    <span className="text-[11px] font-medium">75%</span>
                  </ToolButton>
                  <ToolButton title="100% lățime" onClick={() => setImagePercent(100)}>
                    <span className="text-[11px] font-medium">100%</span>
                  </ToolButton>
                  <ToolButton title="Auto (resetare lățime)" onClick={resetImageWidth}>
                    <Eraser className="h-4 w-4" />
                  </ToolButton>
                </>
              )}

              <Divider />

              <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-2 py-1">
                <PaintBucket className="h-4 w-4" />
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    editor?.chain().focus().setColor(e.target.value).run();
                  }}
                  className="h-6 w-8 cursor-pointer bg-transparent"
                  title="Culoare text"
                />
              </div>

              <Divider />

              <ToolButton disabled={!canUndo} onClick={() => editor?.chain().focus().undo().run()}>
                <Undo className="h-4 w-4" />
              </ToolButton>
              <ToolButton disabled={!canRedo} onClick={() => editor?.chain().focus().redo().run()}>
                <Redo className="h-4 w-4" />
              </ToolButton>
              <ToolButton onClick={clearFormatting} title="Șterge formatarea">
                <Eraser className="h-4 w-4" />
              </ToolButton>
            </div>
          </div>

          {/* Editor / Textarea */}
          {viewMode === "visual" ? (
            <EditorContent editor={editor} />
          ) : (
            <textarea
              value={rawHtml}
              onChange={(e) => setRawHtml(e.target.value)}
              spellCheck={false}
              className="min-h-[280px] w-full rounded-2xl border bg-white p-4 font-mono text-sm leading-6 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/25"
              placeholder="<p>Scrie HTML-ul aici…</p>"
            />
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 px-5 py-2.5 text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Se salvează…" : editId ? "Salvează modificările" : "Adaugă"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-gray-800 transition hover:bg-gray-50"
            >
              Resetează
            </button>
          </div>
        </div>
      </form>

      {/* LISTA CU CĂUTARE + PAGINARE (DESC din backend) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold">Anunțuri existente</h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Caută după titlu…"
                className="h-9 w-64 rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none ring-indigo-600/20 transition focus:border-indigo-600 focus:ring-2"
              />
            </div>

            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value) || 8)}
              className="h-9 rounded-xl border border-gray-300 bg-white px-2 text-sm outline-none focus:border-indigo-600 focus:ring-2 ring-indigo-600/20"
              title="Elemente / pagină"
            >
              {[5, 8, 10, 12].map((n) => (
                <option key={n} value={n}>{n}/pag.</option>
              ))}
            </select>
          </div>
        </div>

        {loadingList ? (
          <div className="py-8 text-center text-sm text-gray-500">Se încarcă…</div>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-gray-500">Nu există anunțuri pentru criteriile curente.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {announcements.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-xl border p-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={a.coverUrl || "/placeholder.png"}
                      alt={a.title}
                      className="h-12 w-12 rounded object-cover ring-1 ring-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />
                    <div>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-gray-600">
                        Publicat: {formatDateForList(a.publishedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="space-x-3 text-sm">
                    <button
                      onClick={() => handleEdit(a)}
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      title="Editează"
                    >
                      <Edit3 className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:underline"
                      title="Șterge"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
              <div className="text-xs text-gray-500">
                Pagina {page + 1} din {Math.max(totalPages, 1)} &middot; {totalElements} rezultate
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page <= 0}
                  className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Înapoi
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Înainte <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

AddAnnouncementForm.propTypes = {
  onSave: PropTypes.func,
};

/* Small UI helpers */
function Divider() {
  return <div className="mx-1 h-6 w-px bg-gray-200" />;
}
function ToolButton({ children, onClick, active, disabled, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex h-9 min-w-9 px-0.5 items-center justify-center rounded-xl border text-gray-700 transition ${
        active ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-gray-50"
      } disabled:opacity-40`}
    >
      {children}
    </button>
  );
}
ToolButton.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  title: PropTypes.string,
};

/* --- tiny debounce hook --- */
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default AddAnnouncementForm;
