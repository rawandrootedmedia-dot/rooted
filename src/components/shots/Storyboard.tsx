"use client";

import React, { useState, useRef } from "react";

type Frame = {
  id: string;
  title: string;
  description: string;
  duration: string;
  camera: string;
  movement: string;
  imageUrl: string;
};

type StoryboardProps = {
  initialFrames?: Frame[];
  onChange?: (frames: Frame[]) => void;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const defaultFrame = (): Frame => ({
  id: uid(),
  title: "",
  description: "",
  duration: "",
  camera: "",
  movement: "",
  imageUrl: "",
});

export default function Storyboard({ initialFrames, onChange }: StoryboardProps) {
  const [frames, setFrames] = useState<Frame[]>(initialFrames?.length ? initialFrames : [defaultFrame()]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  function update(id: string, field: keyof Frame, value: string) {
    setFrames((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, [field]: value } : f));
      onChange?.(next);
      return next;
    });
  }

  function remove(id: string) {
    setFrames((prev) => {
      const next = prev.filter((f) => f.id !== id);
      onChange?.(next);
      return next;
    });
  }

  function addFrame() {
    setFrames((prev) => {
      const next = [...prev, defaultFrame()];
      onChange?.(next);
      return next;
    });
  }

  function handleDragStart(e: React.DragEvent, idx: number) {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOverIdx(idx);
  }

  function handleDrop(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    setFrames((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      onChange?.(next);
      return next;
    });
    setDragIdx(null);
    setDragOverIdx(null);
  }

  function handleDragEnd() {
    setDragIdx(null);
    setDragOverIdx(null);
  }

  function uploadImage(id: string) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      fetch("/api/upload", { method: "POST", body: fd })
        .then((r) => r.json())
        .then((d) => {
          if (d.key) update(id, "imageUrl", d.key);
        });
    };
    input.click();
  }

  const totalDuration = frames.reduce((sum, f) => {
    const num = parseFloat(f.duration) || 0;
    return sum + num;
  }, 0);

  return (
    <div>
      <div className="storyboard-grid">
        {frames.map((frame, idx) => (
          <div
            key={frame.id}
            className={`frame-card ${dragIdx === idx ? "dragging" : ""} ${dragOverIdx === idx ? "drag-over" : ""}`}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
          >
            <div className="frame-head">
              <span className="slate-num">F{String(idx + 1).padStart(2, "0")}</span>
              <button className="remove-btn" onClick={() => remove(frame.id)} title="Remove frame">&times;</button>
            </div>

            <div className="frame-thumb" onClick={() => uploadImage(frame.id)}>
              {frame.imageUrl ? (
                <img src={`/api/files/signed?key=${encodeURIComponent(frame.imageUrl)}`} alt={frame.title || "Frame"} />
              ) : (
                <span className="placeholder">Click to add image</span>
              )}
            </div>

            <input type="text" value={frame.title} onChange={(e) => update(frame.id, "title", e.target.value)} placeholder="Frame title" />
            <textarea value={frame.description} onChange={(e) => update(frame.id, "description", e.target.value)} placeholder="Description / action" />

            <div className="frame-row-2">
              <div className="frame-duration">
                <span>s</span>
                <input type="number" value={frame.duration} onChange={(e) => update(frame.id, "duration", e.target.value)} placeholder="0" min="0" step="0.5" />
              </div>
              <input type="text" value={frame.camera} onChange={(e) => update(frame.id, "camera", e.target.value)} placeholder="Lens / Camera" />
            </div>

            <input type="text" value={frame.movement} onChange={(e) => update(frame.id, "movement", e.target.value)} placeholder="Movement" />
          </div>
        ))}
      </div>

      <button onClick={addFrame} style={{ marginTop: 14 }}>+ Add Frame</button>

      <div className="storyboard-summary">
        Frames: <strong>{frames.length}</strong> &middot; Total duration: <strong>{totalDuration.toFixed(1)}s</strong>
      </div>
    </div>
  );
}
