"use client";

import React, { useState } from "react";

type Shot = {
  id: string;
  slate: string;
  description: string;
  lens: string;
  movement: string;
  notes: string;
  status: "pending" | "got" | "flag";
};

type ShotListProps = {
  initialShots?: Shot[];
  onChange?: (shots: Shot[]) => void;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const defaultShot = (): Shot => ({
  id: uid(),
  slate: "",
  description: "",
  lens: "",
  movement: "",
  notes: "",
  status: "pending",
});

export default function ShotList({ initialShots, onChange }: ShotListProps) {
  const [shots, setShots] = useState<Shot[]>(initialShots?.length ? initialShots : [defaultShot()]);

  function update(id: string, field: keyof Shot, value: string) {
    setShots((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, [field]: value } : s));
      onChange?.(next);
      return next;
    });
  }

  function toggleStatus(id: string) {
    setShots((prev) => {
      const next = prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus: Shot["status"] = s.status === "pending" ? "got" : s.status === "got" ? "flag" : "pending";
        return { ...s, status: nextStatus };
      });
      onChange?.(next);
      return next;
    });
  }

  function remove(id: string) {
    setShots((prev) => {
      const next = prev.filter((s) => s.id !== id);
      onChange?.(next);
      return next;
    });
  }

  function addRow() {
    setShots((prev) => {
      const next = [...prev, defaultShot()];
      onChange?.(next);
      return next;
    });
  }

  const got = shots.filter((s) => s.status === "got").length;
  const flagged = shots.filter((s) => s.status === "flag").length;

  return (
    <div>
      <table className="shot-table">
        <thead>
          <tr>
            <th className="col-narrow">Slate</th>
            <th>Description</th>
            <th>Lens</th>
            <th>Movement</th>
            <th>Notes</th>
            <th className="col-status">Status</th>
            <th className="col-remove"></th>
          </tr>
        </thead>
        <tbody>
          {shots.map((shot) => (
            <tr key={shot.id} className={`shot-row ${shot.status === "got" ? "got" : shot.status === "flag" ? "flagged" : ""}`}>
              <td>
                <input type="text" value={shot.slate} onChange={(e) => update(shot.id, "slate", e.target.value)} placeholder="#" />
              </td>
              <td>
                <input type="text" value={shot.description} onChange={(e) => update(shot.id, "description", e.target.value)} placeholder="Shot description" />
              </td>
              <td>
                <input type="text" value={shot.lens} onChange={(e) => update(shot.id, "lens", e.target.value)} placeholder="e.g. 50mm" />
              </td>
              <td>
                <input type="text" value={shot.movement} onChange={(e) => update(shot.id, "movement", e.target.value)} placeholder="e.g. Pan L-R" />
              </td>
              <td>
                <input type="text" value={shot.notes} onChange={(e) => update(shot.id, "notes", e.target.value)} placeholder="Notes" />
              </td>
              <td>
                <div className="status-toggle">
                  <button className="status-pill" data-active={shot.status === "got"} data-state="got" onClick={() => toggleStatus(shot.id)}>GOT</button>
                  <button className="status-pill" data-active={shot.status === "flag"} data-state="flag" onClick={() => toggleStatus(shot.id)}>FLAG</button>
                </div>
              </td>
              <td>
                <button className="remove-btn" onClick={() => remove(shot.id)} title="Remove shot">&times;</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="add-row" onClick={addRow}>+ Add Shot</button>

      <div className="summary-strip">
        <span>Total: <strong>{shots.length}</strong></span>
        <span>Got: <strong>{got}</strong></span>
        <span>Flagged: <strong>{flagged}</strong></span>
        <span>Pending: <strong>{shots.length - got - flagged}</strong></span>
      </div>
    </div>
  );
}
