"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// One loader for every action: a top progress bar while any /api request or page
// navigation is in flight, plus a "Working…" pill with a spinner for mutations
// (POST/PUT/PATCH/DELETE). It wraps window.fetch once, so individual pages don't
// each need their own wiring.
export default function GlobalLoader() {
  const pathname = usePathname();
  const [pending, setPending] = useState(0);
  const [mutating, setMutating] = useState(0);
  const [navigating, setNavigating] = useState(false);
  const [pillReady, setPillReady] = useState(false);
  const patched = useRef(false);

  useEffect(() => {
    if (patched.current) return;
    patched.current = true;
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const method = (init?.method || (typeof input === "object" && "method" in input ? input.method : "GET")).toUpperCase();
      const tracked = url.startsWith("/api/") || url.startsWith(window.location.origin + "/api/");
      if (!tracked) return originalFetch(input, init);
      const isMutation = method !== "GET" && method !== "HEAD";
      setPending((n) => n + 1);
      if (isMutation) setMutating((n) => n + 1);
      try {
        return await originalFetch(input, init);
      } finally {
        setPending((n) => Math.max(0, n - 1));
        if (isMutation) setMutating((n) => Math.max(0, n - 1));
      }
    };
  }, []);

  // Navigation: start on internal link clicks, finish when the pathname changes.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const dest = new URL(a.href, window.location.href);
      if (dest.origin !== window.location.origin) return;
      if (dest.pathname === window.location.pathname && dest.search === window.location.search) return;
      setNavigating(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setNavigating(false);
  }

  // Safety net so the bar can never get stuck (e.g. navigation cancelled).
  useEffect(() => {
    if (!navigating) return;
    const t = setTimeout(() => setNavigating(false), 10000);
    return () => clearTimeout(t);
  }, [navigating]);

  // Delay the pill so quick actions don't flicker.
  useEffect(() => {
    if (mutating === 0) return;
    const t = setTimeout(() => setPillReady(true), 250);
    return () => {
      clearTimeout(t);
      setPillReady(false);
    };
  }, [mutating]);
  const showPill = mutating > 0 && pillReady;

  const active = pending > 0 || navigating;

  return (
    <>
      <div
        aria-hidden
        className={`fixed top-0 left-0 right-0 h-[3px] z-[9999] overflow-hidden pointer-events-none transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0"}`}
      >
        <div className="h-full w-1/3 bg-gradient-to-r from-[#7B1123] via-[#C59B27] to-[#7B1123] global-loader-bar" />
      </div>
      {showPill && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 rounded-full bg-[#2E050C] text-white text-xs font-bold tracking-wide px-4 py-2.5 shadow-xl border border-[#C59B27]/40"
        >
          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-[#C59B27] animate-spin" />
          Working…
        </div>
      )}
    </>
  );
}
