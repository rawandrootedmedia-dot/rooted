"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type BoardItem = { id: string; title: string; deletedAt: string | null; _count: { cards: number } };

type TemplateItem = { id: string; name: string; description?: string; icon?: string };

type ProjectData = {
  id: string;
  title: string;
  type: string;
  status: string;
  shootDate: string | null;
  brief: string | null;
  client: { id: string; name: string };
  boards: BoardItem[];
  trashedBoards: BoardItem[];
  shots: { id: string; label: string; status: string; shotType: string | null; order: number }[];
  callSheets: { id: string; date: string; location: string | null }[];
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [builtInTemplates, setBuiltInTemplates] = useState<TemplateItem[]>([]);
  const [customTemplates, setCustomTemplates] = useState<TemplateItem[]>([]);

  useEffect(() => {
    fetch("/api/templates").then(r => r.json()).then(d => {
      setBuiltInTemplates(d.builtIn || []);
      setCustomTemplates(d.custom || []);
    });
  }, []);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) router.push("/dashboard");
        else setProject(data.project);
        setLoading(false);
      });
  }, [id, router]);

  async function addBoard() {
    if (!newBoardTitle.trim()) return;
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newBoardTitle, projectId: id }),
    });
    if (res.ok) {
      const data = await res.json();
      setProject((p) => p ? { ...p, boards: [...p.boards, data.board] } : p);
      setNewBoardTitle("");
    }
  }

  async function restoreBoard(boardId: string) {
    await fetch(`/api/boards/${boardId}`, { method: "POST" });
    setProject((p) => {
      if (!p) return p;
      const board = p.trashedBoards.find((b) => b.id === boardId);
      if (!board) return p;
      return {
        ...p,
        boards: [...p.boards, { ...board, deletedAt: null }],
        trashedBoards: p.trashedBoards.filter((b) => b.id !== boardId),
      };
    });
  }

  async function addBoardWithTemplate(templateId: string, isCustom?: boolean) {
    const tpl = isCustom
      ? customTemplates.find(t => t.id === templateId)
      : builtInTemplates.find(t => t.id === templateId);
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: tpl?.name || "New Board", projectId: id }),
    });
    if (!res.ok) return;
    const { board: newBoard } = await res.json();

    await fetch("/api/templates/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId: newBoard.id, templateId, isCustom }),
    });

    setProject((p) => p ? { ...p, boards: [...p.boards, { ...newBoard, _count: { cards: 0 } }] } : p);
    setShowTemplatePicker(false);
  }

  async function addBlankBoard() {
    const title = newBoardTitle.trim() || "New Board";
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, projectId: id }),
    });
    if (res.ok) {
      const data = await res.json();
      setProject((p) => p ? { ...p, boards: [...p.boards, { ...data.board, _count: { cards: 0 } }] } : p);
      setNewBoardTitle("");
      setShowTemplatePicker(false);
    }
  }

  const statusColors: Record<string, string> = {
    idea: "bg-bone-200 text-clay-700 dark:bg-charcoal-800 dark:text-bone-300",
    booked: "bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300",
    in_progress: "bg-clay-100 text-clay-700 dark:bg-clay-900/30 dark:text-clay-300",
    delivered: "bg-charcoal-100 text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-300",
  };
  const statusLabels: Record<string, string> = {
    idea: "Idea", booked: "Booked", in_progress: "In Progress", delivered: "Delivered",
  };

  if (loading) return <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8"><div className="text-center py-12 text-charcoal-400">Loading...</div></div>;
  if (!project) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {showTemplatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowTemplatePicker(false)}>
          <div className="bg-white dark:bg-charcoal-900 rounded-2xl border border-sage-200 dark:border-charcoal-700 shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-sage-200 dark:border-charcoal-700 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-clay-800 dark:text-clay-200">New Board</h2>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">Start blank or use a template</p>
              </div>
              <button onClick={() => setShowTemplatePicker(false)} className="p-2 rounded-lg hover:bg-sage-100 dark:hover:bg-charcoal-800 text-charcoal-500 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-charcoal-600 dark:text-charcoal-400 mb-3">Blank Board</h3>
                <div className="flex gap-2">
                  <input
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder="Board name..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-sage-200 dark:border-charcoal-700 bg-bone-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-bone-100 focus:outline-none focus:ring-1 focus:ring-sage-400"
                    onKeyDown={(e) => e.key === "Enter" && addBlankBoard()}
                  />
                  <button onClick={addBlankBoard} className="px-4 py-2 rounded-lg bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium transition">Create</button>
                </div>
              </div>

              {customTemplates.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-charcoal-600 dark:text-charcoal-400 mb-3">My Templates</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {customTemplates.map((t) => (
                      <button key={t.id} onClick={() => addBoardWithTemplate(t.id, true)}
                        className="text-left p-4 rounded-xl border border-sage-200 dark:border-charcoal-700 hover:border-sage-400 dark:hover:border-sage-600 bg-bone-50 dark:bg-charcoal-800 transition group">
                        <h3 className="font-medium text-charcoal-900 dark:text-bone-100 text-sm">{t.name}</h3>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-charcoal-600 dark:text-charcoal-400 mb-3">Built-in Templates</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {builtInTemplates.map((t) => (
                    <button key={t.id} onClick={() => addBoardWithTemplate(t.id)}
                      className="text-left p-4 rounded-xl border border-sage-200 dark:border-charcoal-700 hover:border-sage-400 dark:hover:border-sage-600 bg-bone-50 dark:bg-charcoal-800 transition group">
                      <h3 className="font-medium text-charcoal-900 dark:text-bone-100 text-sm">{t.name}</h3>
                      {t.description && <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-1">{t.description}</p>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    
      <Link href="/dashboard" className="text-sm text-sage-600 dark:text-sage-400 hover:underline mb-4 inline-block">&larr; Dashboard</Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-serif text-3xl text-clay-800 dark:text-clay-200">{project.title}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[project.status]}`}>
              {statusLabels[project.status]}
            </span>
          </div>
          <p className="text-charcoal-500 dark:text-charcoal-400">
            <Link href={`/clients/${project.client.id}`} className="text-sage-600 dark:text-sage-400 hover:underline">{project.client.name}</Link>
            <span className="mx-2">&middot;</span>
            <span className="capitalize">{project.type}</span>
            {project.shootDate && <><span className="mx-2">&middot;</span>{new Date(project.shootDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>}
          </p>
        </div>
      </div>

      {project.brief && (
        <div className="mb-8 p-4 rounded-xl bg-bone-100 dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700">
          <p className="text-sm text-charcoal-600 dark:text-charcoal-400 whitespace-pre-wrap">{project.brief}</p>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-charcoal-600 dark:text-charcoal-400 uppercase tracking-wider">Boards</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowTemplatePicker(true)} className="px-3 py-1.5 rounded-lg bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium transition flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Board
            </button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {project.boards.map((board) => (
            <div key={board.id} className="relative group">
              <Link
                href={`/boards/${board.id}`}
                className="block p-4 rounded-lg border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 hover:border-sage-300 dark:hover:border-charcoal-600 transition min-h-[90px] flex flex-col justify-end"
              >
                <h3 className="font-serif text-sm text-clay-800 dark:text-clay-200 group-hover:text-clay-700 dark:group-hover:text-clay-300 transition">{board.title}</h3>
                <p className="text-[10px] text-charcoal-400 mt-0.5">{board._count.cards} card{board._count.cards !== 1 ? "s" : ""}</p>
              </Link>
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  if (!confirm(`Delete board "${board.title}"? This cannot be undone.`)) return;
                  await fetch(`/api/boards/${board.id}`, { method: "DELETE" });
                  setProject((p) => p ? { ...p, boards: p.boards.filter((b) => b.id !== board.id) } : p);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-lg text-charcoal-300 dark:text-charcoal-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition opacity-0 group-hover:opacity-100"
                title="Delete board"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {project.trashedBoards?.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className="flex items-center gap-2 text-sm text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 transition"
          >
            <svg className={`w-3 h-3 transition-transform ${showTrash ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            <span className="font-medium uppercase tracking-wider">Recently Deleted</span>
            <span className="px-1.5 py-0.5 rounded-full bg-charcoal-200 dark:bg-charcoal-700 text-[10px] font-semibold text-charcoal-500 dark:text-charcoal-400">{project.trashedBoards.length}</span>
          </button>
          {showTrash && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {project.trashedBoards.map((board) => (
                <div key={board.id} className="p-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 flex items-center justify-between min-h-[80px]">
                  <div>
                    <h3 className="font-serif text-base text-charcoal-500 dark:text-charcoal-400 line-through">{board.title}</h3>
                    <p className="text-xs text-charcoal-400 mt-0.5">{board._count.cards} card{board._count.cards !== 1 ? "s" : ""}</p>
                  </div>
                  <button
                    onClick={() => restoreBoard(board.id)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-charcoal-800 border border-sage-300 dark:border-charcoal-600 text-sm text-sage-700 dark:text-sage-400 hover:bg-sage-50 dark:hover:bg-charcoal-700 transition flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
