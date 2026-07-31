"use client";

import React, { useState, useMemo } from "react";

type CalendarEntry = {
  id: string;
  title: string;
  platform: string;
  time: string;
  notes: string;
  status: "Draft" | "Scheduled" | "Published";
};

type ContentCalendarProps = {
  initialEntries?: CalendarEntry[];
  onChange?: (entries: CalendarEntry[]) => void;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Facebook", "Pinterest", "Blog", "Email", "Other"];
const STATUSES: CalendarEntry["status"][] = ["Draft", "Scheduled", "Published"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ContentCalendar({ initialEntries, onChange }: ContentCalendarProps) {
  const [entries, setEntries] = useState<CalendarEntry[]>(initialEntries || []);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState("");

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const prevMonthDays = getDaysInMonth(year, month - 1);

  const entriesByDate = useMemo(() => {
    const map: Record<string, CalendarEntry[]> = {};
    entries.forEach((e) => {
      if (!map[e.id]) map[e.id] = [];
    });
    entries.forEach((e) => {
      const key = e.id;
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [entries]);

  function getEntriesForDay(day: number) {
    return entries.filter((e) => {
      if (!e.id) return false;
      return true;
    }).filter((e) => {
      if (filterPlatform && e.platform !== filterPlatform) return false;
      return true;
    });
  }

  function openNewEntry(day: number) {
    const entry: CalendarEntry = {
      id: uid(),
      title: "",
      platform: "Instagram",
      time: "",
      notes: "",
      status: "Draft",
    };
    setEditingEntry(entry);
    setShowPanel(true);
  }

  function saveEntry(entry: CalendarEntry) {
    setEntries((prev) => {
      const exists = prev.find((e) => e.id === entry.id);
      const next = exists ? prev.map((e) => (e.id === entry.id ? entry : e)) : [...prev, entry];
      onChange?.(next);
      return next;
    });
    setShowPanel(false);
    setEditingEntry(null);
  }

  function deleteEntry(id: string) {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      onChange?.(next);
      return next;
    });
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const calendarCells: { day: number; outside: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarCells.push({ day: prevMonthDays - i, outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, outside: false });
  }
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push({ day: calendarCells.length - firstDay - daysInMonth + 1, outside: true });
  }

  const today = new Date();
  const isToday = (day: number) => !calendarCells.find((c) => c.day === day && c.outside) && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div>
      <div className="cal-toolbar">
        <div className="cal-nav">
          <button onClick={prevMonth} className="ghost">&larr;</button>
          <h2>{MONTH_NAMES[month]} {year}</h2>
          <button onClick={nextMonth} className="ghost">&rarr;</button>
        </div>
        <div className="cal-filter">
          <span>Filter:</span>
          <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
            <option value="">All Platforms</option>
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="brand-key">
        <span><span className="swatch" style={{ background: "var(--amber)" }}></span>Draft</span>
        <span><span className="swatch" style={{ background: "var(--cyan)" }}></span>Scheduled</span>
        <span><span className="swatch" style={{ background: "#6b8a60" }}></span>Published</span>
      </div>

      <div className="cal-grid">
        {DOW.map((d) => <div key={d} className="cal-dow">{d}</div>)}
        {calendarCells.map((cell, idx) => (
          <div key={idx} className={`cal-cell ${cell.outside ? "outside" : ""} ${isToday(cell.day) ? "today" : ""}`}>
            <div className="cal-cell-head">
              <span className="cal-daynum">{cell.day}</span>
              {!cell.outside && <button className="cal-add" onClick={() => openNewEntry(cell.day)}>+</button>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-dim)", marginBottom: 10 }}>
          All Content ({entries.length})
        </h3>
        {entries.length === 0 && <p className="empty-state">No content entries yet. Click + on a day to add one.</p>}
        {entries.map((entry) => (
          <div key={entry.id} className="cal-entry" style={{ marginBottom: 6, cursor: "pointer" }} onClick={() => { setEditingEntry(entry); setShowPanel(true); }}>
            <div className="cal-entry-title">{entry.title || "Untitled"}</div>
            <div className="cal-entry-meta">{entry.platform} &middot; {entry.status}</div>
          </div>
        ))}
      </div>

      {showPanel && editingEntry && (
        <div className="cal-panel-backdrop" onClick={() => setShowPanel(false)}>
          <div className="cal-panel" onClick={(e) => e.stopPropagation()}>
            <h3>{entries.find((e) => e.id === editingEntry.id) ? "Edit Entry" : "New Entry"}</h3>

            <label>Title</label>
            <input type="text" value={editingEntry.title} onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })} placeholder="Content title" autoFocus />

            <label>Platform</label>
            <select value={editingEntry.platform} onChange={(e) => setEditingEntry({ ...editingEntry, platform: e.target.value })}>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <label>Time</label>
            <input type="text" value={editingEntry.time} onChange={(e) => setEditingEntry({ ...editingEntry, time: e.target.value })} placeholder="e.g. 2:00 PM" />

            <label>Status</label>
            <select value={editingEntry.status} onChange={(e) => setEditingEntry({ ...editingEntry, status: e.target.value as CalendarEntry["status"] })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <label>Notes</label>
            <textarea value={editingEntry.notes} onChange={(e) => setEditingEntry({ ...editingEntry, notes: e.target.value })} placeholder="Caption, hashtags, etc." />

            <div className="cal-panel-actions">
              <div>
                <button onClick={() => saveEntry(editingEntry)} className="primary">Save</button>
                <button onClick={() => setShowPanel(false)} style={{ marginLeft: 8 }}>Cancel</button>
              </div>
              <button onClick={() => { deleteEntry(editingEntry.id); setShowPanel(false); }} className="ghost" style={{ color: "var(--red-pencil)" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
