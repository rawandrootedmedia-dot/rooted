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
    <nav className="border-b border-sage-200 dark:border-charcoal-700 bg-white/80 dark:bg-charcoal-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-semibold text-clay-800 dark:text-clay-200">Rooted</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition ${
                isActive("/dashboard")
                  ? "text-clay-700 dark:text-clay-300"
                  : "text-charcoal-500 dark:text-charcoal-400 hover:text-charcoal-800 dark:hover:text-bone-200"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/clients"
              className={`text-sm font-medium transition ${
                isActive("/clients")
                  ? "text-clay-700 dark:text-clay-300"
                  : "text-charcoal-500 dark:text-charcoal-400 hover:text-charcoal-800 dark:hover:text-bone-200"
              }`}
            >
              Clients
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-charcoal-500 dark:text-charcoal-400 hover:bg-sage-100 dark:hover:bg-charcoal-800 transition"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-charcoal-500 dark:text-charcoal-400">{userName || "User"}</span>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-lg text-charcoal-600 dark:text-charcoal-300 hover:bg-sage-100 dark:hover:bg-charcoal-800 transition"
              >
                Sign Out
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-charcoal-500 dark:text-charcoal-400 hover:bg-sage-100 dark:hover:bg-charcoal-800 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-sage-200 dark:border-charcoal-700 pt-3 space-y-2">
            <Link href="/dashboard" className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link href="/clients" className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 py-2" onClick={() => setMenuOpen(false)}>Clients</Link>
            <div className="pt-2 border-t border-sage-200 dark:border-charcoal-700">
              <button onClick={handleLogout} className="text-sm text-charcoal-500 dark:text-charcoal-400 py-2 w-full text-left">Sign Out</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
