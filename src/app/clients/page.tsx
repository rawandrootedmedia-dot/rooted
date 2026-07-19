"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Client = {
  id: string;
  name: string;
  contactInfo: string | null;
  notes: string | null;
  _count: { projects: number };
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(data.clients || []);
        setLoading(false);
      });
  }, []);

  async function createClient(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contactInfo, notes }),
    });
    if (res.ok) {
      const data = await res.json();
      setClients([data.client, ...clients]);
      setName("");
      setContactInfo("");
      setNotes("");
      setShowNew(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-clay-800 dark:text-clay-200">Clients</h1>
          <p className="text-charcoal-500 dark:text-charcoal-400 mt-1 text-sm">{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowNew(!showNew)}
          className="px-4 py-2 rounded-lg bg-clay-700 hover:bg-clay-800 text-white text-sm font-medium transition"
        >
          {showNew ? "Cancel" : "New Client"}
        </button>
      </div>

      {showNew && (
        <form onSubmit={createClient} className="mb-8 p-6 rounded-xl border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-sage-200 dark:border-charcoal-700 bg-bone-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-bone-100 focus:outline-none focus:ring-2 focus:ring-sage-400"
              placeholder="Client name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Contact Info</label>
            <input
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-sage-200 dark:border-charcoal-700 bg-bone-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-bone-100 focus:outline-none focus:ring-2 focus:ring-sage-400"
              placeholder="email, phone, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-sage-200 dark:border-charcoal-700 bg-bone-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-bone-100 focus:outline-none focus:ring-2 focus:ring-sage-400"
            />
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium transition">Create Client</button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-charcoal-400">Loading...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bone-200 dark:bg-charcoal-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-clay-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
          </div>
          <h3 className="font-serif text-xl text-clay-700 dark:text-clay-300 mb-2">No clients yet</h3>
          <p className="text-charcoal-500 dark:text-charcoal-400 text-sm">Add your first client to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="block p-5 rounded-xl border border-sage-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 hover:border-sage-300 dark:hover:border-charcoal-600 transition group"
            >
              <h3 className="font-serif text-lg text-clay-800 dark:text-clay-200 group-hover:text-clay-700 dark:group-hover:text-clay-300 transition">
                {client.name}
              </h3>
              {client.contactInfo && (
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">{client.contactInfo}</p>
              )}
              <p className="text-xs text-charcoal-400 dark:text-charcoal-500 mt-2">
                {client._count.projects} project{client._count.projects !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
