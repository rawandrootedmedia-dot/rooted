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
    <textarea
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => onSave({ text: val })}
      onKeyDown={(e) => { if (e.key === "Escape") onSave({ text: val }); }}
      className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border-2 border-sage-400 dark:border-sage-600 resize-none text-sm text-charcoal-700 dark:text-charcoal-300 focus:outline-none"
      autoFocus
    />
  );
  return (
    <div onClick={onStartEdit} className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 overflow-auto cursor-text group-hover:border-sage-300 dark:group-hover:border-charcoal-600 transition">
      <p className="text-sm text-charcoal-700 dark:text-charcoal-300 whitespace-pre-wrap">{card.content?.text || <span className="text-charcoal-300 dark:text-charcoal-500 italic">Click to type...</span>}</p>
    </div>
  );
}

function EditableHeading({ card, editing, onStartEdit, onSave }: EditableCardProps) {
  const [val, setVal] = useState(card.content?.text || "");
  useEffect(() => { setVal(card.content?.text || ""); }, [card.content?.text]);
  if (editing) return (
    <input
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={() => onSave({ text: val })}
      onKeyDown={(e) => { if (e.key === "Enter") onSave({ text: val }); if (e.key === "Escape") onSave({ text: val }); }}
      className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border-2 border-sage-400 dark:border-sage-600 font-serif text-lg text-clay-800 dark:text-clay-200 focus:outline-none"
      autoFocus
    />
  );
  return (
    <div onClick={onStartEdit} className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border-l-4 border-clay-400 cursor-text group-hover:border-l-clay-500 transition">
      <h3 className="font-serif text-lg text-clay-800 dark:text-clay-200">{card.content?.text || <span className="text-charcoal-300 dark:text-charcoal-500 italic">Click to type...</span>}</h3>
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
    <div className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border-2 border-sage-400 dark:border-sage-600 overflow-auto" onBlur={commit}>
      <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider mb-2">To-Do</p>
      <div className="space-y-1.5">
        {localItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-charcoal-300 dark:text-charcoal-600 text-sm">&#9744;</span>
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
              className="flex-1 bg-transparent border-none text-sm text-charcoal-700 dark:text-charcoal-300 focus:outline-none placeholder:text-charcoal-300 dark:placeholder:text-charcoal-600"
              autoFocus={i === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div onClick={onStartEdit} className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 overflow-auto cursor-text group-hover:border-sage-300 dark:group-hover:border-charcoal-600 transition">
      <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider mb-2">To-Do</p>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 text-charcoal-300 dark:text-charcoal-600 text-sm select-none">&#9744;</span>
              <span className="text-sm text-charcoal-700 dark:text-charcoal-300">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-charcoal-400 italic">Click to add items...</p>
      )}
    </div>
  );
}

function EditableLink({ card, editing, onStartEdit, onSave }: EditableCardProps) {
  const [label, setLabel] = useState(card.content?.label || "");
  const [url, setUrl] = useState(card.content?.url || "");
  useEffect(() => { setLabel(card.content?.label || ""); setUrl(card.content?.url || ""); }, [card.content?.label, card.content?.url]);
  if (editing) return (
    <div className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border-2 border-sage-400 dark:border-sage-600 flex flex-col justify-center gap-2" onBlur={() => onSave({ label, url })}>
      <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="px-2 py-1 text-sm rounded border border-sage-200 dark:border-charcoal-700 bg-bone-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-bone-100 focus:outline-none" autoFocus />
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="px-2 py-1 text-sm rounded border border-sage-200 dark:border-charcoal-700 bg-bone-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-bone-100 focus:outline-none" onKeyDown={(e) => { if (e.key === "Enter") onSave({ label, url }); }} />
    </div>
  );
  return (
    <div onClick={onStartEdit} className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 flex flex-col justify-center overflow-hidden cursor-text group-hover:border-sage-300 dark:group-hover:border-charcoal-600 transition">
      <p className="text-xs text-charcoal-400 mb-1 truncate">Link</p>
      <a href={card.content?.url || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-sage-600 dark:text-sage-400 hover:underline truncate" onClick={(e) => e.stopPropagation()}>
        {card.content?.label || card.content?.url || <span className="text-charcoal-300 dark:text-charcoal-500 italic">Click to add...</span>}
      </a>
    </div>
  );
}

function DraggableCard({ card, onDelete, editingId, onStartEdit, onSave }: {
  card: CardData;
  onDelete: (id: string) => void;
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onSave: (id: string, content: any) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: card.id });

  const style: React.CSSProperties = {
    position: "absolute",
    left: card.x,
    top: card.y,
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
          <div className="w-full h-full rounded-xl overflow-hidden bg-bone-100 dark:bg-charcoal-800">
            {card.content?.url ? (
              <SignedImg s3Key={card.content.url} alt={card.content.name || "Uploaded image"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-xs">No image</div>
            )}
          </div>
        );
      case "video":
        return (
          <div className="w-full h-full rounded-xl overflow-hidden bg-black">
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
              <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-xs">No video</div>
            )}
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
      case "color":
        return (
          <div className="w-full h-full rounded-xl overflow-hidden border border-sage-200 dark:border-charcoal-700">
            <div className="h-3/4" style={{ backgroundColor: card.content?.color || "#e8dfd3" }} />
            <div className="h-1/4 bg-white dark:bg-charcoal-900 flex items-center px-4">
              <span className="text-xs font-mono text-charcoal-600 dark:text-charcoal-400">{card.content?.color || "#e8dfd3"}</span>
            </div>
          </div>
        );
      default:
        return <div className="text-xs text-charcoal-400 p-4">Unknown</div>;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`group ${isEditing ? "z-50" : ""}`} {...(isEditing ? {} : attributes)}>
      {!isEditing && (
        <div {...listeners} className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition cursor-grab active:cursor-grabbing">
          <div className="px-3 py-0.5 rounded-full bg-clay-700 text-white text-[10px] font-medium shadow-lg">drag</div>
        </div>
      )}
      <button
        onClick={() => onDelete(card.id)}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-600 shadow-lg flex items-center justify-center z-10"
      >
        &times;
      </button>
      {cardVisual()}
    </div>
  );
}

function TemplatePicker({ onSelect, onClose, boardId }: { onSelect: (templateId: string) => void; onClose: () => void; boardId: string }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then((d) => setTemplates(d.templates || []));
  }, []);

  async function applyTemplate(t: Template) {
    setApplying(t.id);
    const res = await fetch("/api/templates/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId, templateId: t.id }),
    });
    if (res.ok) onSelect(t.id);
    setApplying(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-charcoal-900 rounded-2xl border border-sage-200 dark:border-charcoal-700 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-auto m-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-sage-200 dark:border-charcoal-700 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-clay-800 dark:text-clay-200">Board Templates</h2>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">Start with a pre-built layout or keep it blank</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-sage-100 dark:hover:bg-charcoal-800 text-charcoal-500 transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 grid gap-4 sm:grid-cols-2">
          {templates.map((t) => (
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
          <button onClick={onClose} className="text-left p-4 rounded-xl border-2 border-dashed border-sage-300 dark:border-charcoal-600 hover:border-sage-400 dark:hover:border-sage-500 bg-transparent transition group">
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
  { type: "note", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", label: "Note", color: "bg-bone-200 dark:bg-charcoal-800 text-clay-600" },
  { type: "heading", icon: "M4 6h16M4 12h16M4 18h7", label: "Heading", color: "bg-sage-100 dark:bg-sage-900/30 text-sage-600" },
  { type: "todo", icon: "M9 5l7 7-7 7", label: "To-Do", color: "bg-clay-100 dark:bg-clay-900/30 text-clay-600" },
  { type: "link", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1", label: "Link", color: "bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-600" },
  { type: "color", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Color", color: "bg-sage-100 dark:bg-sage-900/30 text-sage-600" },
  { type: "image", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Image", color: "bg-sage-100 dark:bg-sage-900/30 text-sage-600" },
  { type: "video", icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM15.75 16.5a12.015 12.015 0 00-7.5 0m11.25-1.5a12.015 12.015 0 00-7.5-2.25m-7.5 9.75h15a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003.75 6v12a1.5 1.5 0 001.5 1.5z", label: "Video", color: "bg-sage-100 dark:bg-sage-900/30 text-sage-600" },
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

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const cardId = event.active.id;
    const delta = event.delta || { x: 0, y: 0 };
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const newX = Math.max(0, card.x + delta.x);
    const newY = Math.max(0, card.y + delta.y);

    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, x: newX, y: newY } : c)));
    await updateCard(cardId as string, { x: newX, y: newY });
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
    const w = type === "image" ? 320 : type === "video" ? 400 : type === "color" ? 200 : 260;
    const h = type === "image" ? 320 : type === "video" ? 260 : type === "color" ? 200 : type === "heading" ? 80 : 200;

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

  if (loading) return <div className="h-screen flex items-center justify-center text-charcoal-400">Loading board...</div>;
  if (!board) return null;

  return (
    <div className="h-screen flex flex-col">
      {showTemplates && (
        <TemplatePicker boardId={id as string} onSelect={handleTemplateApplied} onClose={() => setShowTemplates(false)} />
      )}

      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-sage-200 dark:border-charcoal-700 bg-white/80 dark:bg-charcoal-950/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/projects/${board.project?.id}`} className="text-sm text-sage-600 dark:text-sage-400 hover:underline">&larr;</Link>
          <span className="font-serif text-lg text-clay-800 dark:text-clay-200">{board.title}</span>
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
          <button
            onClick={() => setShowTemplates(true)}
            className="px-3 py-1.5 rounded-lg border border-sage-300 dark:border-charcoal-600 text-charcoal-600 dark:text-charcoal-300 text-sm hover:bg-sage-50 dark:hover:bg-charcoal-800 transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
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
        className="flex-1 overflow-auto bg-bone-50 dark:bg-charcoal-950 relative"
        onDragOver={(e) => { if (dragType) e.preventDefault(); }}
        onDrop={handleCanvasDrop}
        onClick={() => { setEditingId(null); setShowVideoInput(false); }}
      >
        {cards.length === 0 && !showTemplates ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-2xl bg-bone-200 dark:bg-charcoal-800 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-clay-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <h2 className="font-serif text-2xl text-clay-800 dark:text-clay-200 mb-2">This board is empty</h2>
            <p className="text-charcoal-500 dark:text-charcoal-400 text-sm mb-8 max-w-sm">Click a tool from the sidebar to add cards, or start with a template.</p>
            <button onClick={() => setShowTemplates(true)} className="px-5 py-2.5 rounded-lg bg-clay-700 hover:bg-clay-800 text-white font-medium transition">Browse Templates</button>
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
                    className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-md border border-sage-200 dark:border-charcoal-700 hover:scale-110 transition-transform cursor-grab active:cursor-grabbing`}
                    title={item.label}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                  </button>
                  <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-charcoal-900 text-bone-100 text-[10px] font-medium whitespace-nowrap opacity-0 group-hover/tool:opacity-100 transition pointer-events-none">
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
