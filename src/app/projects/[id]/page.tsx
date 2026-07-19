"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type ProjectData = {
  id: string;
  title: string;
  type: string;
  status: string;
  shootDate: string | null;
  brief: string | null;
  client: { id: string; name: string };
  boards: { id: string; title: string; _count: { cards: number } }[];
  shots: { id: string; label: string; status: string; shotType: string | null; order: number }[];
  callSheets: { id: string; date: string; location: string | null }[];
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newBoardTitle, setNewBoardTitle] = useState("");

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
            <input
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="New board name..."
              className="px-3 py-1.5 text-sm rounded-lg border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-bone-100 focus:outline-none focus:ring-2 focus:ring-sage-400 w-40"
              onKeyDown={(e) => e.key === "Enter" && addBoard()}
            />
            <button onClick={addBoard} className="px-3 py-1.5 rounded-lg bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium transition">Add</button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {project.boards.map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.id}`}
              className="block p-6 rounded-xl border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 hover:border-sage-300 dark:hover:border-charcoal-600 transition group min-h-[140px] flex flex-col justify-end"
            >
              <h3 className="font-serif text-lg text-clay-800 dark:text-clay-200 group-hover:text-clay-700 dark:group-hover:text-clay-300 transition">{board.title}</h3>
              <p className="text-xs text-charcoal-400 mt-1">{board._count.cards} card{board._count.cards !== 1 ? "s" : ""}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
