"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  title: string;
  type: string;
  status: string;
  shootDate: string | null;
  client: { id: string; name: string };
  _count: { boards: number; shots: number };
  createdAt: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) router.push("/sign-in");
        else setUserName(data.user.name || data.user.email);
      });

    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data.projects || []);
        setLoading(false);
      });
  }, [router]);

  const statusColors: Record<string, string> = {
    idea: "var(--accent-soft)",
    booked: "var(--green-soft)",
    in_progress: "var(--accent-soft)",
    delivered: "var(--bg-secondary)",
  };
  const statusTextColors: Record<string, string> = {
    idea: "var(--accent)",
    booked: "var(--green)",
    in_progress: "var(--accent)",
    delivered: "var(--text-secondary)",
  };

  const statusLabels: Record<string, string> = {
    idea: "Idea",
    booked: "Booked",
    in_progress: "In Progress",
    delivered: "Delivered",
  };

  const upcomingShoots = projects
    .filter((p) => p.shootDate && new Date(p.shootDate) >= new Date())
    .sort((a, b) => new Date(a.shootDate!).getTime() - new Date(b.shootDate!).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl" style={{ color: "var(--text-primary)" }}>
            Welcome{userName ? `, ${userName}` : ""}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition"
          style={{ background: "var(--green)" }}
        >
          New Project
        </Link>
      </div>

      {upcomingShoots.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>
            Upcoming Shoots
          </h2>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {upcomingShoots.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block p-3 rounded-lg transition"
                style={{ border: "1px solid var(--border)", background: "var(--card-bg)" }}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{project.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{project.client.name}</p>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ml-2" style={{ background: statusColors[project.status] || "var(--bg-secondary)", color: statusTextColors[project.status] || "var(--text-secondary)" }}>
                    {statusLabels[project.status] || project.status}
                  </span>
                </div>
                <p className="text-xs mt-1.5" style={{ color: "var(--green)" }}>
                  {project.shootDate ? new Date(project.shootDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "TBD"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>
          All Projects
        </h2>
        {loading ? (
          <div className="text-center py-12" style={{ color: "var(--text-secondary)" }}>Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--bg-secondary)" }}>
              <svg className="w-8 h-8" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            </div>
            <h3 className="font-display text-xl mb-2" style={{ color: "var(--text-primary)" }}>No projects yet</h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>Create your first project to get started</p>
            <Link
              href="/projects/new"
              className="inline-block px-5 py-2.5 rounded-lg text-white text-sm font-medium transition"
              style={{ background: "var(--green)" }}
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block p-3 rounded-lg transition group"
                style={{ border: "1px solid var(--border)", background: "var(--card-bg)" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: statusColors[project.status] || "var(--bg-secondary)", color: statusTextColors[project.status] || "var(--text-secondary)" }}>
                    {statusLabels[project.status] || project.status}
                  </span>
                  <span className="text-[10px] capitalize" style={{ color: "var(--text-secondary)" }}>{project.type}</span>
                </div>
                <h3 className="font-medium text-sm truncate transition" style={{ color: "var(--text-primary)" }}>
                  {project.title}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{project.client.name}</p>
                <div className="flex gap-2 mt-2 text-[10px]" style={{ color: "var(--text-secondary)" }}>
                  <span>{project._count.boards} board{project._count.boards !== 1 ? "s" : ""}</span>
                  <span>{project._count.shots} shot{project._count.shots !== 1 ? "s" : ""}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
