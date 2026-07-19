"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type ClientData = {
  id: string;
  name: string;
  contactInfo: string | null;
  notes: string | null;
  projects: {
    id: string;
    title: string;
    type: string;
    status: string;
    shootDate: string | null;
    _count: { boards: number; shots: number };
    createdAt: string;
  }[];
};

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) router.push("/clients");
        else setClient(data.client);
        setLoading(false);
      });
  }, [id, router]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8"><div className="text-center py-12 text-charcoal-400">Loading...</div></div>;
  if (!client) return null;

  const statusColors: Record<string, string> = {
    idea: "bg-bone-200 text-clay-700 dark:bg-charcoal-800 dark:text-bone-300",
    booked: "bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-300",
    in_progress: "bg-clay-100 text-clay-700 dark:bg-clay-900/30 dark:text-clay-300",
    delivered: "bg-charcoal-100 text-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-300",
  };
  const statusLabels: Record<string, string> = {
    idea: "Idea", booked: "Booked", in_progress: "In Progress", delivered: "Delivered",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/clients" className="text-sm text-sage-600 dark:text-sage-400 hover:underline mb-4 inline-block">&larr; All Clients</Link>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-clay-800 dark:text-clay-200">{client.name}</h1>
          {client.contactInfo && <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">{client.contactInfo}</p>}
          {client.notes && <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-2">{client.notes}</p>}
        </div>
        <Link
          href={`/projects/new?client=${client.id}`}
          className="px-4 py-2 rounded-lg bg-clay-700 hover:bg-clay-800 text-white text-sm font-medium transition"
        >
          New Project
        </Link>
      </div>

      <h2 className="text-sm font-semibold text-charcoal-600 dark:text-charcoal-400 uppercase tracking-wider mb-3">Projects</h2>
      {client.projects.length === 0 ? (
        <p className="text-charcoal-400 text-sm py-8">No projects yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {client.projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block p-4 rounded-xl border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 hover:border-sage-300 dark:hover:border-charcoal-600 transition group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[project.status] || ""}`}>
                  {statusLabels[project.status] || project.status}
                </span>
                <span className="text-xs text-charcoal-400 capitalize">{project.type}</span>
              </div>
              <h3 className="font-medium text-charcoal-900 dark:text-bone-100">{project.title}</h3>
              <div className="flex gap-3 mt-2 text-xs text-charcoal-400">
                <span>{project._count.boards} board{project._count.boards !== 1 ? "s" : ""}</span>
                <span>{project._count.shots} shot{project._count.shots !== 1 ? "s" : ""}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
