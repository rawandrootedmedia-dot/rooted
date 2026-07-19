"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClient = searchParams.get("client");

  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState(preselectedClient || "");
  const [type, setType] = useState("photo");
  const [status, setStatus] = useState("idea");
  const [shootDate, setShootDate] = useState("");
  const [brief, setBrief] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(data.clients || []);
        if (data.clients?.length === 1) setClientId(data.clients[0].id);
      });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientId) { setError("Please select a client"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, clientId, type, status, shootDate: shootDate || null, brief }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/projects/${data.project.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create project");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/dashboard" className="text-sm text-sage-600 dark:text-sage-400 hover:underline mb-6 inline-block">&larr; Back</Link>
      <h1 className="font-serif text-3xl text-clay-800 dark:text-clay-200 mb-8">New Project</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg border border-red-200 dark:border-red-800">{error}</div>}

        <div>
          <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Project Title *</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-bone-100 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="e.g., Summer Campaign Shoot" />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Client *</label>
          <select required value={clientId} onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-bone-100 focus:outline-none focus:ring-2 focus:ring-sage-400">
            <option value="">Select a client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {clients.length === 0 && <p className="text-xs text-charcoal-400 mt-1">No clients yet. <Link href="/clients" className="text-sage-600 underline">Add one first.</Link></p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-bone-100 focus:outline-none focus:ring-2 focus:ring-sage-400">
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-bone-100 focus:outline-none focus:ring-2 focus:ring-sage-400">
              <option value="idea">Idea</option>
              <option value="booked">Booked</option>
              <option value="in_progress">In Progress</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Shoot Date</label>
          <input type="date" value={shootDate} onChange={(e) => setShootDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-bone-100 focus:outline-none focus:ring-2 focus:ring-sage-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Brief</label>
          <textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={4}
            className="w-full px-3 py-2 rounded-lg border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-bone-100 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="Project brief, goals, notes..." />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-2.5 rounded-lg bg-clay-700 hover:bg-clay-800 text-white font-medium transition disabled:opacity-50">
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>
    </div>
  );
}

export default function NewProject() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-charcoal-400">Loading...</div>}>
      <NewProjectForm />
    </Suspense>
  );
}
