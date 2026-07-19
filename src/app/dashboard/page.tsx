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
    idea: "bg-bone-200 text-clay-700 dark:bg-charcoal-800 dark:text-bone-300",
    booked: "bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300",
    in_progress: "bg-clay-100 text-clay-700 dark:bg-clay-900/30 dark:text-clay-300",
    delivered: "bg-charcoal-100 text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-300",
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
          <h1 className="font-serif text-3xl text-clay-800 dark:text-clay-200">
            Welcome{userName ? `, ${userName}` : ""}
          </h1>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1 text-sm">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="px-4 py-2 rounded-lg bg-clay-700 hover:bg-clay-800 text-white text-sm font-medium transition"
        >
          New Project
        </Link>
      </div>

      {upcomingShoots.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-charcoal-600 dark:text-charcoal-400 uppercase tracking-wider mb-3">
            Upcoming Shoots
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingShoots.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block p-4 rounded-xl border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 hover:border-sage-300 dark:hover:border-charcoal-600 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-charcoal-900 dark:text-bone-100">{project.title}</p>
                    <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-0.5">{project.client.name}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status] || ""}`}>
                    {statusLabels[project.status] || project.status}
                  </span>
                </div>
                <p className="text-sm text-sage-600 dark:text-sage-400 mt-2">
                  {project.shootDate ? new Date(project.shootDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Date TBD"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-charcoal-600 dark:text-charcoal-400 uppercase tracking-wider mb-3">
          All Projects
        </h2>
        {loading ? (
          <div className="text-center py-12 text-charcoal-400">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bone-200 dark:bg-charcoal-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-clay-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            </div>
            <h3 className="font-serif text-xl text-clay-700 dark:text-clay-300 mb-2">No projects yet</h3>
            <p className="text-charcoal-500 dark:text-charcoal-400 text-sm mb-6">Create your first project to get started</p>
            <Link
              href="/projects/new"
              className="inline-block px-5 py-2.5 rounded-lg bg-clay-700 hover:bg-clay-800 text-white text-sm font-medium transition"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block p-4 rounded-xl border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 hover:border-sage-300 dark:hover:border-charcoal-600 transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status] || ""}`}>
                    {statusLabels[project.status] || project.status}
                  </span>
                  <span className="text-xs text-charcoal-400 capitalize">{project.type}</span>
                </div>
                <h3 className="font-medium text-charcoal-900 dark:text-bone-100 group-hover:text-clay-700 dark:group-hover:text-clay-300 transition">
                  {project.title}
                </h3>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-0.5">{project.client.name}</p>
                <div className="flex gap-3 mt-3 text-xs text-charcoal-400 dark:text-charcoal-500">
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
