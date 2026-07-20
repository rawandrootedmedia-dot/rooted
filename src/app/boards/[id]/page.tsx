"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DndContext, useDraggable, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";

type CardData = {
  id: string;
  type: string;
  content: any;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  parentId: string | null;
};

type Template = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

function SignedImg({ s3Key, alt, className }: { s3Key: string; alt: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/files/signed?key=${encodeURIComponent(s3Key)}`)
      .then((r) => r.json())
      .then((d) => { if (d.url) setUrl(d.url); })
      .catch(() => {});
  }, [s3Key]);

  if (!url) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-bone-100 dark:bg-charcoal-800 ${className || ""}`}>
        <div className="w-6 h-6 rounded-full border-2 border-clay-300 border-t-transparent animate-spin" />
      </div>
    );
  }

  return <img src={url} alt={alt} className={className || "w-full h-full object-cover"} />;
}

function getVideoEmbedUrl(url: string): string | null {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  document: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  image: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>,
  camera: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>,
  calendar: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
  film: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m0 0V5.625c0-.621.504-1.125 1.125-1.125h7.5c.621 0 1.125.504 1.125 1.125v12.75c0 .621-.504 1.125-1.125 1.125" /></svg>,
  pin: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>,
  style: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>,
  clock: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  eye: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  clipboard: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
};

type EditableCardProps = {
  card: CardData;
  editing: boolean;
  onStartEdit: () => void;
  onSave: (content: any) => void;
};

function EditableNote({ card, editing, onStartEdit, onSave }: EditableCardProps) {
  const [val, setVal] = useState(card.content?.text || "");
  useEffect(() => { setVal(card.content?.text || ""); }, [card.content?.text]);
  if (editing) return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}>
      <div className="mcard-head">
        <span>note</span>
        <span style={{ color: "var(--accent)" }}>editing</span>
      </div>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onSave({ text: val })}
        onKeyDown={(e) => { if (e.key === "Escape") onSave({ text: val }); }}
        className="flex-1 p-3 resize-none text-sm focus:outline-none"
        style={{ color: "var(--text-primary)", background: "transparent" }}
        autoFocus
      />
    </div>
  );
  return (
    <div onClick={onStartEdit} className="w-full h-full flex flex-col rounded-lg overflow-hidden cursor-text" style={{ background: "var(--card-bg)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}>
      <div className="mcard-head">
        <span>note</span>
      </div>
      <div className="p-3 flex-1 overflow-auto">
        <p className="text-sm" style={{ color: "var(--text-primary)", lineHeight: 1.55 }}>{card.content?.text || <span style={{ color: "var(--text-secondary)" }} className="italic">Click to type...</span>}</p>
      </div>
    </div>
  );
}

function EditableHeading({ card, editing, onStartEdit, onSave }: EditableCardProps) {
  const [val, setVal] = useState(card.content?.text || "");
  useEffect(() => { setVal(card.content?.text || ""); }, [card.content?.text]);
  if (editing) return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden" style={{ background: "var(--card-bg)", borderLeft: "3px solid var(--green)" }}>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onSave({ text: val })}
        onKeyDown={(e) => { if (e.key === "Enter") onSave({ text: val }); if (e.key === "Escape") onSave({ text: val }); }}
        className="w-full h-full px-4 py-3 font-display text-lg focus:outline-none"
        style={{ color: "var(--text-primary)", background: "transparent", borderLeft: "none" }}
        autoFocus
      />
    </div>
  );
  return (
    <div onClick={onStartEdit} className="w-full h-full flex flex-col rounded-lg overflow-hidden cursor-text" style={{ background: "var(--card-bg)", borderLeft: "3px solid var(--green)", boxShadow: "var(--card-shadow)" }}>
      <div className="px-4 py-3 flex items-center">
        <h3 className="font-display text-lg" style={{ color: "var(--text-primary)" }}>{card.content?.text || <span style={{ color: "var(--text-secondary)" }} className="italic">Click to type...</span>}</h3>
      </div>
    </div>
  );
}

function EditableTodo({ card, editing, onStartEdit, onSave }: EditableCardProps) {
  const items: string[] = card.content?.items || [];
  const [localItems, setLocalItems] = useState<string[]>([...items, ""]);
  useEffect(() => {
    setLocalItems([...(card.content?.items || []), ""]);
  }, [card.content?.items]);

  function commit() {
    const filtered = localItems.map((s) => s.trim()).filter(Boolean);
    onSave({ items: filtered });
  }

  if (editing) return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--green)" }} onBlur={commit}>
      <div className="mcard-head">
        <span>to-do</span>
        <span className="text-tally">{localItems.filter(Boolean).length} items</span>
      </div>
      <div className="p-3 flex-1 overflow-auto space-y-1.5">
        {localItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span style={{ color: "var(--text-secondary)" }} className="text-sm">&#9744;</span>
            <input
              value={item}
              onChange={(e) => {
                const next = [...localItems];
                next[i] = e.target.value;
                if (i === next.length - 1 && e.target.value) next.push("");
                setLocalItems(next);
              }}
              onBlur={commit}
              onKeyDown={(e) => { if (e.key === "Escape") commit(); }}
              placeholder={i === localItems.length - 1 ? "Add item..." : ""}
              className="flex-1 bg-transparent border-none text-sm focus:outline-none"
              style={{ color: "var(--text-primary)" }}
              autoFocus={i === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div onClick={onStartEdit} className="w-full h-full flex flex-col rounded-lg overflow-hidden cursor-text" style={{ background: "var(--card-bg)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}>
      <div className="mcard-head">
        <span>to-do</span>
        {items.length > 0 && <span>{items.length} items</span>}
      </div>
      <div className="p-3 flex-1 overflow-auto">
        {items.length > 0 ? (
          <ul className="space-y-1.5">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>&#9744;</span>
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Click to add items...</p>
        )}
      </div>
    </div>
  );
}

function EditableLink({ card, editing, onStartEdit, onSave }: EditableCardProps) {
  const [label, setLabel] = useState(card.content?.label || "");
  const [url, setUrl] = useState(card.content?.url || "");
  useEffect(() => { setLabel(card.content?.label || ""); setUrl(card.content?.url || ""); }, [card.content?.label, card.content?.url]);
  if (editing) return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--green)" }} onBlur={() => onSave({ label, url })}>
      <div className="mcard-head">
        <span>link</span>
      </div>
      <div className="p-3 flex flex-col justify-center gap-2">
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="px-2 py-1 text-sm rounded border focus:outline-none" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} autoFocus />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="px-2 py-1 text-sm rounded border focus:outline-none" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} onKeyDown={(e) => { if (e.key === "Enter") onSave({ label, url }); }} />
      </div>
    </div>
  );
  return (
    <div onClick={onStartEdit} className="w-full h-full flex flex-col rounded-lg overflow-hidden cursor-text" style={{ background: "var(--card-bg)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}>
      <div className="mcard-head">
        <span>link</span>
      </div>
      <div className="p-3 flex flex-col justify-center overflow-hidden">
        <a href={card.content?.url || "#"} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline truncate" style={{ color: "var(--accent)" }} onClick={(e) => e.stopPropagation()}>
          {card.content?.label || card.content?.url || <span style={{ color: "var(--text-secondary)" }} className="italic">Click to add...</span>}
        </a>
      </div>
    </div>
  );
}

function EditableColumn({ card, editing, onStartEdit, onSave }: EditableCardProps) {
  const [val, setVal] = useState(card.content?.text || "");
  useEffect(() => { setVal(card.content?.text || ""); }, [card.content?.text]);
  if (editing) return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden" style={{ background: "transparent", border: "1px dashed var(--green)" }}>
      <div className="mcard-head" style={{ borderBottom: "1px dashed var(--border)" }}>
        <span>column</span>
        <span style={{ color: "var(--green)" }}>editing</span>
      </div>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onSave({ text: val })}
        onKeyDown={(e) => { if (e.key === "Enter") onSave({ text: val }); if (e.key === "Escape") onSave({ text: val }); }}
        className="w-full px-3 py-2 font-display text-base focus:outline-none bg-transparent"
        style={{ color: "var(--text-primary)" }}
        autoFocus
        placeholder="Column title..."
      />
    </div>
  );
  return (
    <div onClick={onStartEdit} className="w-full h-full flex flex-col rounded-lg overflow-hidden cursor-text" style={{ background: "transparent", border: "1px dashed var(--border)" }}>
      <div className="mcard-head" style={{ borderBottom: "1px dashed var(--border)" }}>
        <span>column</span>
      </div>
      <div className="px-3 py-2 flex-1">
        <h3 className="font-display text-base" style={{ color: "var(--text-primary)" }}>{card.content?.text || <span style={{ color: "var(--text-secondary)" }} className="italic">Click to title...</span>}</h3>
      </div>
    </div>
  );
}

function DraggableCard({ card, allCards, onDelete, editingId, onStartEdit, onSave }: {
  card: CardData;
  allCards: CardData[];
  onDelete: (id: string) => void;
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onSave: (id: string, content: any) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: card.id });

  const parent = card.parentId ? allCards.find((c) => c.id === card.parentId) : null;
  const renderX = parent ? parent.x + card.x : card.x;
  const renderY = parent ? parent.y + card.y : card.y;

  const style: React.CSSProperties = {
    position: "absolute",
    left: renderX,
    top: renderY,
    width: card.width,
    height: card.height,
    zIndex: editingId === card.id ? 999 : card.zIndex,
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    transition: transform ? undefined : "box-shadow 0.15s ease",
  };

  const isEditing = editingId === card.id;

  const cardVisual = () => {
    switch (card.type) {
      case "image":
        return (
          <div className="w-full h-full flex flex-col rounded-lg overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}>
            <div className="mcard-head">
              <span><span className="rec-dot"></span>image</span>
            </div>
            <div className="flex-1 relative" style={{ background: "linear-gradient(135deg, var(--green-soft), var(--accent-soft))" }}>
              {card.content?.url ? (
                <SignedImg s3Key={card.content.url} alt={card.content.name || "Uploaded image"} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>No image</div>
              )}
            </div>
          </div>
        );
      case "video":
        return (
          <div className="w-full h-full flex flex-col rounded-lg overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}>
            <div className="mcard-head">
              <span><span className="rec-dot"></span>video</span>
            </div>
            <div className="flex-1 bg-black relative">
              {card.content?.embedUrl ? (
                <iframe
                  src={card.content.embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              ) : card.content?.url ? (
                <video src={card.content.url} className="w-full h-full object-contain" controls playsInline preload="metadata" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>No video</div>
              )}
            </div>
          </div>
        );
      case "note":
        return <EditableNote card={card} editing={isEditing} onStartEdit={() => onStartEdit(card.id)} onSave={(content) => onSave(card.id, content)} />;
      case "heading":
        return <EditableHeading card={card} editing={isEditing} onStartEdit={() => onStartEdit(card.id)} onSave={(content) => onSave(card.id, content)} />;
      case "todo":
        return <EditableTodo card={card} editing={isEditing} onStartEdit={() => onStartEdit(card.id)} onSave={(content) => onSave(card.id, content)} />;
      case "link":
        return <EditableLink card={card} editing={isEditing} onStartEdit={() => onStartEdit(card.id)} onSave={(content) => onSave(card.id, content)} />;
      case "column":
        return <EditableColumn card={card} editing={isEditing} onStartEdit={() => onStartEdit(card.id)} onSave={(content) => onSave(card.id, content)} />;
      case "color":
        return (
          <div className="w-full h-full flex flex-col rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}>
            <div className="mcard-head">
              <span>color</span>
              <span className="font-mono">{card.content?.color || "#e8dfd3"}</span>
            </div>
            <div className="flex-1" style={{ backgroundColor: card.content?.color || "#e8dfd3" }} />
          </div>
        );
      default:
        return <div className="text-xs p-4" style={{ color: "var(--text-secondary)" }}>Unknown</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group ${isEditing ? "z-50" : ""} ${transform ? "z-50" : ""}`}
      {...(isEditing ? {} : attributes)}
      onClick={(e) => e.stopPropagation()}
    >
      {cardVisual()}
      {!isEditing && (
        <>
          <div {...listeners} className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition cursor-grab active:cursor-grabbing z-20">
            <div className="px-3 py-0.5 rounded-full text-[10px] font-medium shadow-lg" style={{ background: "var(--green)", color: "#fff" }}>drag</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition shadow-lg flex items-center justify-center z-20"
            style={{ background: "var(--accent)" }}
          >
            &times;
          </button>
        </>
      )}
    </div>
  );
}

function TemplatePicker({ onSelect, onClose, boardId }: { onSelect: (templateId: string) => void; onClose: () => void; boardId: string }) {
  const [builtIn, setBuiltIn] = useState<Template[]>([]);
  const [custom, setCustom] = useState<Template[]>([]);
  const [applying, setApplying] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then((d) => {
      setBuiltIn(d.builtIn || []);
      setCustom(d.custom || []);
    });
  }, []);

  async function applyTemplate(t: Template, isCustom?: boolean) {
    setApplying(t.id);
    const res = await fetch("/api/templates/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId, templateId: t.id, isCustom }),
    });
    if (res.ok) onSelect(t.id);
    setApplying(null);
  }

  async function deleteCustomTemplate(t: Template) {
    if (!confirm(`Delete "${t.name}"?`)) return;
    setDeleting(t.id);
    await fetch(`/api/templates/${t.id}`, { method: "DELETE" });
    setCustom((prev) => prev.filter((c) => c.id !== t.id));
    setDeleting(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-charcoal-900 rounded-2xl border border-sage-200 dark:border-charcoal-700 shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-auto m-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-sage-200 dark:border-charcoal-700 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-clay-800 dark:text-clay-200">Board Templates</h2>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">Start with a pre-built layout or keep it blank</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-sage-100 dark:hover:bg-charcoal-800 text-charcoal-500 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          {custom.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-charcoal-600 dark:text-charcoal-400 mb-3">My Templates</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {custom.map((t) => (
                  <div key={t.id} className="text-left p-4 rounded-xl border border-sage-200 dark:border-charcoal-700 hover:border-sage-400 dark:hover:border-sage-600 bg-bone-50 dark:bg-charcoal-800 transition group relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCustomTemplate(t); }}
                      disabled={deleting === t.id}
                      className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-charcoal-400 hover:text-red-600 transition"
                      title="Delete template"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <button onClick={() => applyTemplate(t, true)} disabled={applying === t.id} className="w-full">
                      <div className="w-10 h-10 rounded-lg bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center text-sage-600 dark:text-sage-400 mb-3">
                        {TEMPLATE_ICONS[t.icon] || TEMPLATE_ICONS.clipboard}
                      </div>
                      <h3 className="font-medium text-charcoal-900 dark:text-bone-100 text-sm">{t.name}</h3>
                      {applying === t.id && <p className="text-xs text-sage-600 mt-2">Applying...</p>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-charcoal-600 dark:text-charcoal-400 mb-3">Built-in Templates</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {builtIn.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyTemplate(t)}
                  disabled={applying === t.id}
                  className="text-left p-4 rounded-xl border border-sage-200 dark:border-charcoal-700 hover:border-sage-400 dark:hover:border-sage-600 bg-bone-50 dark:bg-charcoal-800 transition group disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-clay-100 dark:bg-clay-900/30 flex items-center justify-center text-clay-600 dark:text-clay-400 mb-3 group-hover:scale-105 transition">
                    {TEMPLATE_ICONS[t.icon] || TEMPLATE_ICONS.document}
                  </div>
                  <h3 className="font-medium text-charcoal-900 dark:text-bone-100 text-sm">{t.name}</h3>
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">{t.description}</p>
                  {applying === t.id && <p className="text-xs text-sage-600 mt-2">Applying...</p>}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-full text-left p-4 rounded-xl border-2 border-dashed border-sage-300 dark:border-charcoal-600 hover:border-sage-400 dark:hover:border-sage-500 bg-transparent transition group">
            <div className="w-10 h-10 rounded-lg bg-bone-200 dark:bg-charcoal-700 flex items-center justify-center text-charcoal-400 mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
            </div>
            <h3 className="font-medium text-charcoal-700 dark:text-bone-300 text-sm">Blank Board</h3>
            <p className="text-xs text-charcoal-400 mt-1">Start with an empty canvas</p>
          </button>
        </div>
      </div>
    </div>
  );
}

const TOOLBAR_ITEMS = [
  { type: "note", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", label: "Note" },
  { type: "heading", icon: "M4 6h16M4 12h16M4 18h7", label: "Heading" },
  { type: "todo", icon: "M9 5l7 7-7 7", label: "To-Do" },
  { type: "link", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", label: "Link" },
  { type: "color", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Color" },
  { type: "image", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Image" },
  { type: "video", icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM15.75 16.5a12.015 12.015 0 00-7.5 0m11.25-1.5a12.015 12.015 0 00-7.5-2.25m-7.5 9.75h15a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003.75 6v12a1.5 1.5 0 001.5 1.5z", label: "Video" },
  { type: "column", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z", label: "Column" },
];

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [board, setBoard] = useState<any>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [colorValue, setColorValue] = useState("#e8dfd3");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<string | null>(null);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shares, setShares] = useState<any[]>([]);
  const [shareName, setShareName] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [creatingShare, setCreatingShare] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    fetch(`/api/boards/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) router.push("/dashboard");
        else {
          setBoard(data.board);
          setCards(data.board.cards || []);
        }
        setLoading(false);
      });
  }, [id, router]);

  const updateCard = useCallback(async (cardId: string, data: Partial<CardData>) => {
    await fetch(`/api/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }, []);

  async function saveAsTemplate() {
    if (!templateName.trim()) return;
    setSavingTemplate(true);
    const res = await fetch("/api/templates/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId: id, name: templateName.trim(), icon: "clipboard" }),
    });
    if (res.ok) {
      setShowSaveTemplate(false);
      setTemplateName("");
      alert("Template saved!");
    }
    setSavingTemplate(false);
  }

  async function loadShares() {
    const res = await fetch(`/api/boards/${id}/shares`);
    if (res.ok) {
      const data = await res.json();
      setShares(data.shares || []);
    }
  }

  async function createShare() {
    setCreatingShare(true);
    const res = await fetch(`/api/boards/${id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName: shareName.trim() || undefined, clientEmail: shareEmail.trim() || undefined }),
    });
    if (res.ok) {
      setShareName("");
      setShareEmail("");
      loadShares();
    }
    setCreatingShare(false);
  }

  async function revokeShare(shareId: string) {
    if (!confirm("Revoke this share link?")) return;
    await fetch(`/api/shares/${shareId}`, { method: "DELETE" });
    setShares((prev) => prev.filter((s) => s.id !== shareId));
  }

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const cardId = event.active.id as string;
    const delta = event.delta || { x: 0, y: 0 };
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const updates: { id: string; x: number; y: number; parentId?: string | null }[] = [];

    if (card.type === "column") {
      const parent = card.parentId ? cards.find((c) => c.id === card.parentId) : null;
      const curAbsX = parent ? parent.x + card.x : card.x;
      const curAbsY = parent ? parent.y + card.y : card.y;
      const newAbsX = Math.max(0, curAbsX + delta.x);
      const newAbsY = Math.max(0, curAbsY + delta.y);
      const dx = newAbsX - curAbsX;
      const dy = newAbsY - curAbsY;
      setCards((prev) => prev.map((c) => {
        if (c.id === cardId) return { ...c, x: parent ? newAbsX - parent.x : newAbsX, y: parent ? newAbsY - parent.y : newAbsY };
        if (c.parentId === cardId) {
          const childNewX = Math.max(0, c.x + dx);
          const childNewY = Math.max(0, c.y + dy);
          updates.push({ id: c.id, x: childNewX, y: childNewY });
          return { ...c, x: childNewX, y: childNewY };
        }
        return c;
      }));
      updates.push({ id: cardId, x: parent ? newAbsX - parent.x : newAbsX, y: parent ? newAbsY - parent.y : newAbsY });
    } else {
      const curParent = card.parentId ? cards.find((c) => c.id === card.parentId) : null;
      const curAbsX = curParent ? curParent.x + card.x : card.x;
      const curAbsY = curParent ? curParent.y + card.y : card.y;
      const newAbsX = Math.max(0, curAbsX + delta.x);
      const newAbsY = Math.max(0, curAbsY + delta.y);

      let targetColumnId: string | null = null;
      for (const c of cards) {
        if (c.type !== "column" || c.id === cardId) continue;
        if (newAbsX >= c.x && newAbsX <= c.x + c.width && newAbsY >= c.y && newAbsY <= c.y + c.height) {
          targetColumnId = c.id;
          break;
        }
      }

      let storeX = newAbsX;
      let storeY = newAbsY;
      if (targetColumnId) {
        const col = cards.find((c) => c.id === targetColumnId)!;
        storeX = newAbsX - col.x;
        storeY = newAbsY - col.y;
      }

      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, x: storeX, y: storeY, parentId: targetColumnId } : c)));
      updates.push({ id: cardId, x: storeX, y: storeY, parentId: targetColumnId });
    }

    for (const u of updates) {
      await updateCard(u.id, { x: u.x, y: u.y, ...(u.parentId !== undefined ? { parentId: u.parentId } : {}) });
    }
  }, [cards, updateCard]);

  async function createCard(type: string, content: any, x?: number, y?: number) {
    const canvas = canvasRef.current;
    let cx = 40 + cards.length * 20;
    let cy = 40 + cards.length * 20;
    if (x !== undefined && y !== undefined) {
      cx = Math.max(0, x - 130);
      cy = Math.max(0, y - 50);
    } else if (canvas) {
      const rect = canvas.getBoundingClientRect();
      cx = Math.max(0, canvas.scrollLeft + rect.width / 2 - 130);
      cy = Math.max(0, canvas.scrollTop + rect.height / 2 - 100);
    }
    const w = type === "image" ? 320 : type === "video" ? 400 : type === "color" ? 200 : type === "column" ? 240 : 260;
    const h = type === "image" ? 320 : type === "video" ? 260 : type === "color" ? 200 : type === "heading" ? 80 : type === "column" ? 480 : 200;

    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, content, x: cx, y: cy, width: w, height: h, boardId: id }),
    });

    if (res.ok) {
      const data = await res.json();
      setCards((prev) => [...prev, data.card]);
    }
  }

  async function deleteCard(cardId: string) {
    await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, cardType: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      createCard(cardType, { url: data.key, name: data.name });
    }
  }

  function handleVideoEmbed() {
    const trimmed = videoUrl.trim();
    if (!trimmed) return;
    const embedUrl = getVideoEmbedUrl(trimmed);
    createCard("video", { url: trimmed, embedUrl, label: trimmed });
    setVideoUrl("");
    setShowVideoInput(false);
  }

  function handleToolbarClick(type: string) {
    if (type === "image") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => handleFileUpload(e as any, "image");
      input.click();
      return;
    }
    if (type === "video") {
      setShowVideoInput(!showVideoInput);
      return;
    }
    if (type === "color") {
      createCard("color", { color: colorValue });
      return;
    }
    if (type === "column") {
      createCard("column", { text: "" }, undefined, undefined);
      return;
    }
    createCard(type, type === "note" ? { text: "" } : type === "heading" ? { text: "" } : type === "todo" ? { items: [] } : type === "link" ? { url: "", label: "" } : {});
  }

  function handleSaveCard(cardId: string, content: any) {
    setEditingId(null);
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, content } : c)));
    updateCard(cardId, { content });
  }

  function handleCanvasDrop(e: React.DragEvent) {
    e.preventDefault();
    const type = e.dataTransfer.getData("text/plain");
    if (!type || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + canvasRef.current.scrollLeft;
    const y = e.clientY - rect.top + canvasRef.current.scrollTop;
    if (type === "image" || type === "video") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = type === "image" ? "image/*" : "video/*";
      input.onchange = (ev) => {
        const file = (ev.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        fetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json()).then((d) => {
          if (d.key) createCard(type, { url: d.key, name: d.name }, x, y);
        });
      };
      input.click();
      return;
    }
    if (type === "color") {
      createCard("color", { color: colorValue }, x, y);
      return;
    }
    if (type === "column") {
      createCard("column", { text: "" }, x, y);
      return;
    }
    createCard(type, type === "note" ? { text: "" } : type === "heading" ? { text: "" } : type === "todo" ? { items: [] } : type === "link" ? { url: "", label: "" } : {}, x, y);
  }

  async function deleteBoard() {
    await fetch(`/api/boards/${id}`, { method: "DELETE" });
    const projectId = board?.project?.id;
    router.push(projectId ? `/projects/${projectId}` : "/dashboard");
  }

  function handleTemplateApplied() {
    setShowTemplates(false);
    fetch(`/api/boards/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.board) setCards(data.board.cards || []);
      });
  }

  if (loading) return <div className="h-screen flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>Loading board...</div>;
  if (!board) return null;

  return (
    <div className="h-screen flex flex-col">
      {showTemplates && (
        <TemplatePicker boardId={id as string} onSelect={handleTemplateApplied} onClose={() => setShowTemplates(false)} />
      )}

      {showSaveTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowSaveTemplate(false)}>
          <div className="rounded-2xl shadow-2xl w-full max-w-sm m-4 p-6" style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl mb-1" style={{ color: "var(--text-primary)" }}>Save as Template</h2>
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Save this board&apos;s layout for reuse</p>
            <input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
              className="w-full px-3 py-2 text-sm rounded-lg mb-4 focus:outline-none focus:ring-1"
              style={{ border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", "--tw-ring-color": "var(--green)" } as any}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && saveAsTemplate()}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowSaveTemplate(false); setTemplateName(""); }} className="px-3 py-1.5 rounded-lg text-sm transition" style={{ color: "var(--text-secondary)" }}>Cancel</button>
              <button
                onClick={saveAsTemplate}
                disabled={!templateName.trim() || savingTemplate}
                className="px-4 py-1.5 rounded-lg text-white text-sm font-medium transition disabled:opacity-50"
                style={{ background: "var(--green)" }}
              >
                {savingTemplate ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowShare(false)}>
          <div className="rounded-2xl shadow-2xl w-full max-w-lg m-4 max-h-[80vh] overflow-auto" style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <div>
                <h2 className="font-display text-xl" style={{ color: "var(--text-primary)" }}>Share with Client</h2>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Generate a link for client approval</p>
              </div>
              <button onClick={() => setShowShare(false)} className="p-2 rounded-lg transition" style={{ color: "var(--text-secondary)" }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={shareName}
                  onChange={(e) => setShareName(e.target.value)}
                  placeholder="Client name (optional)"
                  className="px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                />
                <input
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Client email (optional)"
                  className="px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1"
                  style={{ border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                />
              </div>
              <button
                onClick={createShare}
                disabled={creatingShare}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm font-medium transition disabled:opacity-50"
                style={{ background: "var(--green)" }}
              >
                {creatingShare ? "Creating..." : "Generate Share Link"}
              </button>

              {shares.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>Shared Links</h3>
                  <div className="space-y-2">
                    {shares.map((share) => {
                      const url = `${typeof window !== "undefined" ? window.location.origin : ""}/share/${share.token}`;
                      const latestReview = share.reviews?.[0];
                      return (
                        <div key={share.id} className="p-3 rounded-lg" style={{ border: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              {share.clientName && <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{share.clientName}</span>}
                              {share.clientEmail && <span className="text-xs ml-2" style={{ color: "var(--text-secondary)" }}>{share.clientEmail}</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              {share.status !== "pending" && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: share.status === "approved" ? "var(--green-soft)" : "var(--accent-soft)", color: share.status === "approved" ? "var(--green)" : "var(--accent)" }}>
                                  {share.status}
                                </span>
                              )}
                              <button onClick={() => revokeShare(share.id)} className="transition" style={{ color: "var(--text-secondary)" }} title="Revoke">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input readOnly value={url} className="flex-1 px-2 py-1 text-xs rounded font-mono" style={{ background: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--text-secondary)" }} />
                            <button onClick={() => { navigator.clipboard.writeText(url); }} className="px-2 py-1 text-xs rounded transition" style={{ background: "var(--green-soft)", color: "var(--green)" }}>Copy</button>
                          </div>
                          {latestReview?.comment && (
                            <p className="text-xs mt-2 italic" style={{ color: "var(--text-secondary)" }}>&quot;{latestReview.comment}&quot;</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b" style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
        <div className="flex items-center gap-3">
          <Link href={`/projects/${board.project?.id}`} className="text-sm hover:underline" style={{ color: "var(--green)" }}>&larr;</Link>
          <span className="font-display text-lg" style={{ color: "var(--text-primary)" }}>{board.title}</span>
          {confirmDelete ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-red-600 font-medium">Delete this board?</span>
              <button onClick={deleteBoard} className="px-2 py-1 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition">Yes, delete</button>
              <button onClick={() => setConfirmDelete(false)} className="px-2 py-1 rounded border border-sage-300 dark:border-charcoal-600 text-xs text-charcoal-600 dark:text-charcoal-400 hover:bg-sage-50 dark:hover:bg-charcoal-800 transition">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Delete board"
              className="p-1.5 rounded-lg text-charcoal-300 dark:text-charcoal-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
          {board.project && (
            <span className="text-xs text-charcoal-400 hidden sm:inline">
              {board.project.title} &middot; {board.project.client?.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {cards.length > 0 && (
            <button
              onClick={() => setShowSaveTemplate(true)}
              className="px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1.5 font-medium"
              style={{ border: "1px solid var(--border)", color: "var(--text-primary)", background: "var(--card-bg)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              Save as Template
            </button>
          )}
          <button
            onClick={() => { setShowShare(true); loadShares(); }}
            className="px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1.5 font-medium"
            style={{ border: "1px solid var(--border)", color: "var(--text-primary)", background: "var(--card-bg)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Share
          </button>
          <button
            onClick={() => setShowTemplates(true)}
            className="px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1.5 font-medium"
            style={{ border: "1px solid var(--border)", color: "var(--text-primary)", background: "var(--card-bg)" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Templates
          </button>
        </div>
      </div>

      {showVideoInput && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-sage-200 dark:border-charcoal-700 bg-bone-50 dark:bg-charcoal-900">
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="YouTube or Vimeo URL"
            className="flex-1 max-w-md px-3 py-1.5 text-sm rounded-lg border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-bone-100 focus:outline-none focus:ring-1 focus:ring-sage-400"
            onKeyDown={(e) => e.key === "Enter" && handleVideoEmbed()}
          />
          <button onClick={handleVideoEmbed} className="px-3 py-1.5 rounded-lg bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium transition">Embed</button>
          <button onClick={() => { setShowVideoInput(false); setVideoUrl(""); }} className="px-3 py-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-600 text-sm">Cancel</button>
        </div>
      )}

      <div
        ref={canvasRef}
        className="flex-1 overflow-auto relative"
        style={{ background: "var(--bg-primary)" }}
        onDragOver={(e) => { if (dragType) e.preventDefault(); }}
        onDrop={handleCanvasDrop}
        onClick={() => { setEditingId(null); setShowVideoInput(false); }}
      >
        {cards.length === 0 && !showTemplates ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: "var(--green-soft)" }}>
              <svg className="w-10 h-10" style={{ color: "var(--green)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <h2 className="font-display text-2xl mb-2" style={{ color: "var(--text-primary)" }}>This board is empty</h2>
            <p className="text-sm mb-8 max-w-sm" style={{ color: "var(--text-secondary)" }}>Click a tool from the sidebar to add cards, or start with a template.</p>
            <button onClick={() => setShowTemplates(true)} className="px-5 py-2.5 rounded-lg text-white font-medium transition" style={{ background: "var(--green)" }}>Browse Templates</button>
          </div>
        ) : (
          <>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <div
                className="board-canvas relative min-w-[200%] min-h-[200%] w-[4000px] h-[4000px]"
                onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
              >
                {cards.map((card) => (
                  <DraggableCard
                    key={card.id}
                    card={card}
                    allCards={cards}
                    onDelete={deleteCard}
                    editingId={editingId}
                    onStartEdit={setEditingId}
                    onSave={handleSaveCard}
                  />
                ))}
              </div>
            </DndContext>

            <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1.5">
              {TOOLBAR_ITEMS.map((item) => (
                <div key={item.type} className="relative group/tool">
                  <button
                    draggable
                    onDragStart={(e) => { setDragType(item.type); e.dataTransfer.setData("text/plain", item.type); }}
                    onDragEnd={() => setDragType(null)}
                    onClick={(e) => { e.stopPropagation(); handleToolbarClick(item.type); }}
                    className="toolbar-btn"
                    title={item.label}
                  >
                    <svg className="w-5 h-5" style={{ color: "var(--text-primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} /></svg>
                  </button>
                  <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition pointer-events-none font-mono" style={{ background: "var(--green)", color: "#fff" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
