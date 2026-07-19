"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

function DraggableCard({ card, onDelete }: { card: CardData; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: card.id });

  const style: React.CSSProperties = {
    position: "absolute",
    left: card.x,
    top: card.y,
    width: card.width,
    height: card.height,
    zIndex: card.zIndex,
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    transition: transform ? undefined : "box-shadow 0.15s ease",
  };

  const cardVisual = () => {
    switch (card.type) {
      case "image":
        return (
          <div className="w-full h-full rounded-xl overflow-hidden bg-bone-100 dark:bg-charcoal-800">
            {card.content?.url ? (
              <img src={card.content.url} alt={card.content.name || ""} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-xs">No image</div>
            )}
          </div>
        );
      case "note":
        return (
          <div className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 overflow-auto">
            <p className="text-sm text-charcoal-700 dark:text-charcoal-300 whitespace-pre-wrap">{card.content?.text || "Write a note..."}</p>
          </div>
        );
      case "color":
        return (
          <div className="w-full h-full rounded-xl overflow-hidden border border-sage-200 dark:border-charcoal-700">
            <div className="h-3/4" style={{ backgroundColor: card.content?.color || "#e8dfd3" }} />
            <div className="h-1/4 bg-white dark:bg-charcoal-900 flex items-center px-4">
              <span className="text-xs font-mono text-charcoal-600 dark:text-charcoal-400">{card.content?.color || "#e8dfd3"}</span>
            </div>
          </div>
        );
      case "heading":
        return (
          <div className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border-l-4 border-clay-400">
            <h3 className="font-serif text-lg text-clay-800 dark:text-clay-200">{card.content?.text || "Heading"}</h3>
          </div>
        );
      case "todo":
        return (
          <div className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 overflow-auto">
            <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider mb-2">To-Do</p>
            {(card.content?.items as string[])?.length > 0 ? (
              <ul className="space-y-1.5">
                {(card.content?.items as string[]).map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <input type="checkbox" className="mt-0.5 rounded border-sage-300 dark:border-charcoal-600 text-sage-600 focus:ring-sage-500" readOnly />
                    <span className="text-sm text-charcoal-700 dark:text-charcoal-300">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-charcoal-400">Empty list</p>
            )}
          </div>
        );
      case "link":
        return (
          <div className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 flex flex-col justify-center">
            <p className="text-xs text-charcoal-400 mb-1">Link</p>
            <a href={card.content?.url || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-sage-600 dark:text-sage-400 hover:underline truncate">
              {card.content?.label || card.content?.url || "Add a URL"}
            </a>
          </div>
        );
      default:
        return <div className="text-xs text-charcoal-400 p-4">Unknown card type</div>;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="group" {...attributes}>
      <div {...listeners} className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition cursor-grab active:cursor-grabbing">
        <div className="px-3 py-0.5 rounded-full bg-clay-700 text-white text-[10px] font-medium shadow-lg">drag</div>
      </div>
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

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [board, setBoard] = useState<any>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [headingText, setHeadingText] = useState("");
  const [colorValue, setColorValue] = useState("#e8dfd3");
  const [todoItems, setTodoItems] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
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

    const newX = card.x + delta.x;
    const newY = card.y + delta.y;

    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, x: newX, y: newY } : c)));
    await updateCard(cardId as string, { x: newX, y: newY });
  }, [cards, updateCard]);

  async function addCard(type: string, content: any) {
    const offset = 20;
    const newCard = {
      type,
      content,
      x: 40 + cards.length * offset,
      y: 40 + cards.length * offset,
      width: type === "image" ? 320 : type === "color" ? 200 : 260,
      height: type === "image" ? 320 : type === "color" ? 200 : type === "heading" ? 80 : 200,
      boardId: id,
    };

    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCard),
    });

    if (res.ok) {
      const data = await res.json();
      setCards((prev) => [...prev, data.card]);
    }
    setAddMenuOpen(false);
  }

  async function deleteCard(cardId: string) {
    await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      addCard("image", { url: data.url, name: data.name });
    }
  }

  if (loading) return <div className="text-center py-12 text-charcoal-400">Loading board...</div>;
  if (!board) return null;

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-sage-200 dark:border-charcoal-700 bg-white/80 dark:bg-charcoal-950/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/projects/${board.project?.id}`} className="text-sm text-sage-600 dark:text-sage-400 hover:underline">&larr;</Link>
          <span className="font-serif text-lg text-clay-800 dark:text-clay-200">{board.title}</span>
          {board.project && (
            <span className="text-xs text-charcoal-400 hidden sm:inline">
              {board.project.title} &middot; {board.project.client?.name}
            </span>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setAddMenuOpen(!addMenuOpen)}
            className="px-4 py-1.5 rounded-lg bg-clay-700 hover:bg-clay-800 text-white text-sm font-medium transition flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Card
          </button>

          {addMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-charcoal-900 rounded-xl border border-sage-200 dark:border-charcoal-700 shadow-xl z-50 p-3 space-y-2">
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-bone-100 dark:hover:bg-charcoal-800 cursor-pointer transition">
                <div className="w-8 h-8 rounded-lg bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center text-sage-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Image</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>

              <button onClick={() => { setNoteText(""); addCard("note", { text: "" }); }} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-bone-100 dark:hover:bg-charcoal-800 transition">
                <div className="w-8 h-8 rounded-lg bg-bone-200 dark:bg-charcoal-800 flex items-center justify-center text-clay-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Note</span>
              </button>

              <button onClick={() => addCard("heading", { text: "New Heading" })} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-bone-100 dark:hover:bg-charcoal-800 transition">
                <div className="w-8 h-8 rounded-lg bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center text-sage-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                </div>
                <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Heading</span>
              </button>

              <button onClick={() => addCard("color", { color: colorValue })} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-bone-100 dark:hover:bg-charcoal-800 transition">
                <div className="w-8 h-8 rounded-lg border border-sage-200 dark:border-charcoal-700" style={{ backgroundColor: colorValue }} />
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Color</span>
                  <input type="color" value={colorValue} onChange={(e) => setColorValue(e.target.value)} className="w-6 h-6 rounded cursor-pointer" onClick={(e) => e.stopPropagation()} />
                </div>
              </button>

              <button onClick={() => addCard("todo", { items: [] })} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-bone-100 dark:hover:bg-charcoal-800 transition">
                <div className="w-8 h-8 rounded-lg bg-clay-100 dark:bg-clay-900/30 flex items-center justify-center text-clay-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
                <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">To-Do</span>
              </button>

              <button onClick={() => addCard("link", { url: "", label: "" })} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-bone-100 dark:hover:bg-charcoal-800 transition">
                <div className="w-8 h-8 rounded-lg bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center text-charcoal-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </div>
                <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">Link</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={canvasRef} className="flex-1 overflow-auto bg-bone-50 dark:bg-charcoal-950">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div
            className="board-canvas relative min-w-[200%] min-h-[200%] w-[4000px] h-[4000px]"
            onClick={() => setAddMenuOpen(false)}
          >
            {cards.map((card) => (
              <DraggableCard key={card.id} card={card} onDelete={deleteCard} />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
