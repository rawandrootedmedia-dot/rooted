"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

type CardData = {
  id: string;
  type: string;
  content: any;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
};

type ShareData = {
  id: string;
  token: string;
  clientName: string | null;
  clientEmail: string | null;
  status: string;
  board: {
    title: string;
    cards: CardData[];
    project: { title: string; client: { name: string } | null };
  };
  reviews: { id: string; action: string; comment: string | null; createdAt: string }[];
};

function SignedImg({ s3Key, alt, className }: { s3Key: string; alt: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/files/signed?key=${encodeURIComponent(s3Key)}`)
      .then((r) => r.json())
      .then((d) => { if (d.url) setUrl(d.url); })
      .catch(() => {});
  }, [s3Key]);
  if (!url) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-bone-100 dark:bg-charcoal-800 ${className || ""}`}>
        <div className="w-6 h-6 rounded-full border-2 border-clay-300 border-t-transparent animate-spin" />
      </div>
    );
  }
  return <img src={url} alt={alt} className={className || "w-full h-full object-cover"} />;
}

function getVideoEmbedUrl(url: string): string | null {
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

function RenderCard({ card }: { card: CardData }) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: card.x,
    top: card.y,
    width: card.width,
    height: card.height,
    zIndex: card.zIndex,
  };

  const cardVisual = () => {
    switch (card.type) {
      case "image":
        return (
          <div className="w-full h-full rounded-xl overflow-hidden bg-bone-100 dark:bg-charcoal-800">
            {card.content?.url ? (
              <SignedImg s3Key={card.content.url} alt={card.content.name || "Image"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-xs">No image</div>
            )}
          </div>
        );
      case "video":
        return (
          <div className="w-full h-full rounded-xl overflow-hidden bg-black">
            {card.content?.embedUrl ? (
              <iframe src={card.content.embedUrl} className="w-full h-full" allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
            ) : card.content?.url ? (
              <video src={card.content.url} className="w-full h-full object-contain" controls playsInline preload="metadata" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-charcoal-400 text-xs">No video</div>
            )}
          </div>
        );
      case "note":
        return (
          <div className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 overflow-auto">
            <p className="text-sm text-charcoal-700 dark:text-charcoal-300 whitespace-pre-wrap">{card.content?.text}</p>
          </div>
        );
      case "heading":
        return (
          <div className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border-l-4 border-clay-400 flex items-center">
            <h3 className="font-serif text-lg text-clay-800 dark:text-clay-200">{card.content?.text}</h3>
          </div>
        );
      case "todo":
        const items: string[] = card.content?.items || [];
        return (
          <div className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 overflow-auto">
            <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider mb-2">To-Do</p>
            <ul className="space-y-1.5">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-charcoal-300 dark:text-charcoal-600 text-sm">&#9744;</span>
                  <span className="text-sm text-charcoal-700 dark:text-charcoal-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      case "link":
        return (
          <div className="w-full h-full p-4 rounded-xl bg-white dark:bg-charcoal-900 border border-sage-200 dark:border-charcoal-700 flex flex-col justify-center overflow-hidden">
            <p className="text-xs text-charcoal-400 mb-1">Link</p>
            <a href={card.content?.url || "#"} target="_blank" rel="noopener noreferrer" className="text-sm text-sage-600 dark:text-sage-400 hover:underline truncate">
              {card.content?.label || card.content?.url}
            </a>
          </div>
        );
      case "color":
        return (
          <div className="w-full h-full rounded-xl overflow-hidden border border-sage-200 dark:border-charcoal-700">
            <div className="h-3/4" style={{ backgroundColor: card.content?.color || "#e8dfd3" }} />
            <div className="h-1/4 bg-white dark:bg-charcoal-900 flex items-center px-4">
              <span className="text-xs font-mono text-charcoal-600 dark:text-charcoal-400">{card.content?.color}</span>
            </div>
          </div>
        );
      default:
        return <div className="text-xs text-charcoal-400 p-4">Unknown</div>;
    }
  };

  return <div style={style}>{cardVisual()}</div>;
}

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [share, setShare] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    fetch(`/api/shared/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else {
          setShare(d.share);
          if (d.share.status === "approved" || d.share.status === "rejected") setReviewed(true);
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [token]);

  async function submitReview(action: "approved" | "rejected") {
    setSubmitting(true);
    const res = await fetch(`/api/shared/${token}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, comment: comment.trim() || undefined }),
    });
    if (res.ok) {
      setReviewed(true);
      setShare((s) => s ? { ...s, status: action } : s);
    }
    setSubmitting(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-bone-50 dark:bg-charcoal-950 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-clay-300 border-t-transparent animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-bone-50 dark:bg-charcoal-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-2xl text-clay-800 dark:text-clay-200 mb-2">Board not found</h1>
        <p className="text-charcoal-500 dark:text-charcoal-400 text-sm">This link may have expired or been revoked.</p>
      </div>
    </div>
  );

  if (!share) return null;

  const latestReview = share.reviews[0];

  return (
    <div className="min-h-screen bg-bone-50 dark:bg-charcoal-950">
      <header className="border-b border-sage-200 dark:border-charcoal-700 bg-white/80 dark:bg-charcoal-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-lg text-clay-800 dark:text-clay-200">{share.board.project.title}</h1>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{share.board.title} &middot; {share.board.project.client?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {share.clientName && (
              <span className="text-xs text-charcoal-400 hidden sm:inline">Viewing as {share.clientName}</span>
            )}
            {share.status === "approved" && (
              <span className="px-3 py-1 rounded-full bg-sage-100 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400 text-xs font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Approved
              </span>
            )}
            {share.status === "rejected" && (
              <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Rejected
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="relative overflow-auto" style={{ height: "calc(100vh - 56px)" }}>
        <div className="relative min-w-[200%] min-h-[200%] w-[4000px] h-[4000px]">
          {share.board.cards.map((card) => (
            <RenderCard key={card.id} card={card} />
          ))}
        </div>
      </div>

      {!reviewed && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-charcoal-900 border-t border-sage-200 dark:border-charcoal-700 shadow-lg">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
            <div className="mb-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (optional)..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-sage-200 dark:border-charcoal-700 bg-bone-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-bone-100 focus:outline-none focus:ring-1 focus:ring-sage-400 resize-none"
                rows={2}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => submitReview("approved")}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-sage-600 hover:bg-sage-700 text-white font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Approve
              </button>
              <button
                onClick={() => submitReview("rejected")}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewed && latestReview && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-charcoal-900 border-t border-sage-200 dark:border-charcoal-700 shadow-lg">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${latestReview.action === "approved" ? "bg-sage-100 text-sage-700 dark:bg-sage-900/30 dark:text-sage-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
              {latestReview.action === "approved" ? "Approved" : "Rejected"}
            </span>
            {latestReview.comment && (
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400 truncate">&quot;{latestReview.comment}&quot;</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
