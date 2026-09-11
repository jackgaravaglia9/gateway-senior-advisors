"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#intake-form", label: "Find My Options" },
  { href: "/privacy", label: "Privacy" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-border relative">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="inline-block shrink-0">
          <img
            src="/gsa-logo-wordmark.svg"
            alt="Gateway Senior Advisors"
            className="h-14 sm:h-20 w-auto"
          />
        </Link>

        <nav className="hidden sm:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-forest font-medium hover:text-gold transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="sm:hidden -mr-2 p-2 text-forest"
        >
          {menuOpen ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <nav className="sm:hidden border-t border-border bg-cream px-6 py-5 flex flex-col gap-5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-forest font-medium text-lg"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
