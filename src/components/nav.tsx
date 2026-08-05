"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "./theme-provider";

export function Nav({ userName }: { userName?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(path + "/");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/sign-in");
  }

  return (
    <nav className="border-b backdrop-blur-sm sticky top-0 z-50" style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-display text-2xl font-semibold" style={{ color: "var(--accent)" }}>Rooted</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium transition"
              style={{ color: isActive("/dashboard") ? "var(--text-primary)" : "var(--text-secondary)" }}
            >
              Dashboard
            </Link>
            <Link
              href="/clients"
              className="text-sm font-medium transition"
              style={{ color: isActive("/clients") ? "var(--text-primary)" : "var(--text-secondary)" }}
            >
              Clients
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{userName || "User"}</span>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-lg transition"
                style={{ color: "var(--text-secondary)" }}
              >
                Sign Out
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg transition"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t pt-3 space-y-2" style={{ borderColor: "var(--border)" }}>
            <Link href="/dashboard" className="block text-sm font-medium py-2" style={{ color: "var(--text-primary)" }} onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link href="/clients" className="block text-sm font-medium py-2" style={{ color: "var(--text-primary)" }} onClick={() => setMenuOpen(false)}>Clients</Link>
            <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <button onClick={handleLogout} className="text-sm py-2 w-full text-left" style={{ color: "var(--text-secondary)" }}>Sign Out</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
