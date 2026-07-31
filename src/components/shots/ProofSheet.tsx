"use client";

import React from "react";

type ProofFrame = {
  id: string;
  slate: string;
  title: string;
  description: string;
  lens: string;
  movement: string;
  duration: string;
  status: "pending" | "got" | "flag";
  imageUrl: string;
};

type ProofSheetProps = {
  projectTitle: string;
  clientName?: string;
  frames: ProofFrame[];
  onStatusChange?: (id: string, status: ProofFrame["status"]) => void;
};

export default function ProofSheet({ projectTitle, clientName, frames, onStatusChange }: ProofSheetProps) {
  return (
    <div>
      <div className="proof-header">
        <p className="eyebrow">Client Proof Sheet</p>
        <h2>{projectTitle}</h2>
        {clientName && <p className="meta">{clientName} &middot; {frames.length} frames</p>}
      </div>

      <div className="proof-grid">
        {frames.map((frame) => (
          <div key={frame.id} className={`proof-card ${frame.status === "got" ? "status-got" : frame.status === "flag" ? "status-flag" : ""}`}>
            <div className="frame-num">{frame.slate || "—"}</div>
            {frame.imageUrl && (
              <div style={{ marginBottom: 8, aspectRatio: "16/9", overflow: "hidden", background: "#f0ede6" }}>
                <img src={`/api/files/signed?key=${encodeURIComponent(frame.imageUrl)}`} alt={frame.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <h4 className="frame-title">{frame.title || "Untitled"}</h4>
            {frame.description && <p className="frame-desc">{frame.description}</p>}
            <div className="frame-specs">
              {frame.lens && <span>{frame.lens}</span>}
              {frame.movement && <span>{frame.movement}</span>}
              {frame.duration && <span>{frame.duration}s</span>}
            </div>
            {onStatusChange && (
              <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                <button
                  className="status-pill"
                  data-active={frame.status === "got"}
                  data-state="got"
                  onClick={() => onStatusChange(frame.id, "got")}
                  style={{ fontSize: 9, padding: "3px 6px" }}
                >
                  GOT
                </button>
                <button
                  className="status-pill"
                  data-active={frame.status === "flag"}
                  data-state="flag"
                  onClick={() => onStatusChange(frame.id, "flag")}
                  style={{ fontSize: 9, padding: "3px 6px" }}
                >
                  FLAG
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {frames.length === 0 && (
        <div className="empty-state" style={{ textAlign: "center", padding: 40 }}>
          No frames to display. Add shots to your storyboard to generate a proof sheet.
        </div>
      )}
    </div>
  );
}
