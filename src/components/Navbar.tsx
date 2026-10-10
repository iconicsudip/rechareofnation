"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, LogOut,
  ChevronRight, Layers, Ticket,
  Compass, ChevronDown
} from "lucide-react";
import { ApiClient } from "@/lib/api-client";

interface NavItem {
  name: string;
  href: string;
}

interface NavContent {
  brandName: string;
  brandTagline: string;
  items: NavItem[];
}

const DEFAULT_PRIMARY_LINKS: NavItem[] = [
  { name: "Events", href: "/events" },
  { name: "Competitions", href: "/competitions" },
  { name: "Gallery", href: "/gallery" },
  { name: "Blogs", href: "/blogs" },
  { name: "Partners", href: "/sponsors" },
];

function normalizeLinkName(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (lower.includes("event")) return "Events";
  if (lower.includes("traditional") || lower.includes("competi")) return "Competitions";
  if (lower.includes("partner") || lower.includes("sponsor")) return "Partners";
  if (lower.includes("gallery")) return "Gallery";
  if (lower.includes("blog")) return "Blogs";
  return raw;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [primaryLinks, setPrimaryLinks] = useState<NavItem[]>(DEFAULT_PRIMARY_LINKS);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const capsuleRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState<{ left: number; width: number } | null>(null);

  // Scroll-aware header: compacts after the first few pixels and draws a gold
  // reading-progress hairline along its bottom edge (written straight to the DOM
  // so scrolling never triggers React re-renders).
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled((prev) => (prev === y > 24 ? prev : y > 24));
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Lock page scroll while the mobile menu is open and close it on navigation.
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setIsOpen(false);
  }



  // Fetch CMS-editable nav links / brand tagline
  useEffect(() => {
    let cancelled = false;
    const fetchNavContent = async () => {
      const data = await ApiClient.getSiteContent<NavContent>("nav_links");
      if (!cancelled && data) {
        if (Array.isArray(data.items) && data.items.length > 0) {
          // Filter out home and secondary items to keep the primary bar minimal
          const curated: NavItem[] = [];
          for (const item of data.items) {
            const lower = item.name.toLowerCase();
            if (item.href === "/" || lower.includes("home")) continue;
            if (lower.includes("about") || lower.includes("contact")) continue;
            curated.push({
              name: normalizeLinkName(item.name),
              href: item.href,
            });
          }
          if (curated.length > 0) {
            setPrimaryLinks(curated.slice(0, 5));
          }
        }
      }
    };
    fetchNavContent();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync auth state
  useEffect(() => {
    const checkUser = () => {
      const currentUser = ApiClient.getCurrentUser();
      setUser(currentUser);
    };
    checkUser();
    const interval = setInterval(checkUser, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    ApiClient.logoutUser();
    setUser(null);
    setIsOpen(false);
    setUserMenuOpen(false);
    router.push("/");
  };

  // Close menus on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const moveSpot = (el: HTMLElement | null) => {
    if (!el) return setSpot(null);
    setSpot({ left: el.offsetLeft, width: el.offsetWidth });
  };
  const resetSpot = () => {
    const nav = navRef.current;
    moveSpot(nav ? nav.querySelector<HTMLElement>('[aria-current="page"]') : null);
  };
  // Park the spotlight on the active link after each navigation / link-list change
  // (deferred a frame so it measures the settled layout).
  useEffect(() => {
    const id = requestAnimationFrame(resetSpot);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, primaryLinks]);

  // Cursor-following glow inside the capsule
  const onCapsuleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = capsuleRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  };

  const navLinks: NavItem[] = [
    { name: "Home", href: "/" },
    ...primaryLinks.filter((link) => link.href !== "/" && !link.name.toLowerCase().includes("home")),
  ];
  const isLinkActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 w-full pointer-events-none px-3 sm:px-6 py-2.5 bg-gradient-to-b from-[#FBF3E3] via-[#FFFDF9] to-[#FFFDF9]/95 border-b border-[#C59B27]/35 shadow-[0_1px_0_rgba(255,255,255,0.8),0_10px_30px_-18px_rgba(74,8,20,0.45)]">
      {/* Floating capsule: logo · navigation · actions in one slim bar */}
      <div
        ref={capsuleRef}
        onMouseMove={onCapsuleMove}
        className={`luxe-capsule pointer-events-auto relative z-[60] mx-auto max-w-[1240px] rounded-full overflow-hidden border transition-all duration-500 bg-gradient-to-b from-[#3D0B16] via-[#2E050C] to-[#220409] ${
          scrolled
            ? "border-[#C59B27]/60 shadow-[0_18px_44px_-14px_rgba(46,5,12,0.75)]"
            : "border-[#C59B27]/40 shadow-[0_10px_30px_-14px_rgba(46,5,12,0.6)]"
        }`}
      >
        {/* Inner gold hairline, cursor glow and periodic sheen */}
        <span aria-hidden className="pointer-events-none absolute inset-[3px] rounded-full border border-[#E5C05B]/20" />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(180px_circle_at_var(--mx,50%)_50%,rgba(229,192,91,0.18),transparent_70%)]" />
        <span aria-hidden className="capsule-sheen pointer-events-none absolute inset-y-0 w-24 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="flex items-center justify-between gap-3 h-[56px] pl-2.5 pr-2.5">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group select-none shrink-0" aria-label="Recharge For Nation — home">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFFDF9] p-1 ring-1 ring-[#E5C05B] shadow-[0_0_0_3px_rgba(197,155,39,0.18),0_4px_14px_-4px_rgba(0,0,0,0.6)] transition-all duration-500 group-hover:ring-2 group-hover:shadow-[0_0_0_4px_rgba(229,192,91,0.3),0_6px_18px_-4px_rgba(0,0,0,0.6)]">
              <img
                src="/images/logo-transparent.png"
                alt=""
                className="h-full w-full object-contain"
              />
            </span>
            <span className="font-primary font-semibold text-[15px] leading-none tracking-[0.01em] text-white hidden sm:block whitespace-nowrap">
              Recharge <span className="italic font-medium text-[#E5C05B]">for</span> Nation
            </span>
          </Link>

          {/* Desktop navigation: segmented, active item is a filled maroon chip */}
          <nav
            ref={navRef}
            className="hidden lg:flex items-center gap-0.5 relative"
            aria-label="Primary"
            onMouseLeave={resetSpot}
          >
            {/* Gliding gold spotlight */}
            <span
              aria-hidden
              className="absolute top-0 bottom-0 rounded-full bg-gradient-to-b from-[#E5C05B] to-[#C59B27] shadow-[0_4px_16px_-4px_rgba(229,192,91,0.7)] transition-[left,width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ left: spot?.left ?? 0, width: spot?.width ?? 0, opacity: spot ? 1 : 0 }}
            />
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={(e) => moveSpot(e.currentTarget)}
                  onFocus={(e) => moveSpot(e.currentTarget)}
                  className="relative px-3.5 py-1.5 rounded-full text-[11.5px] font-secondary font-semibold tracking-[0.14em] uppercase text-white/80 transition-colors duration-300 hover:text-[#2E050C] aria-[current=page]:text-[#2E050C]"
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {user ? (
              <div className="relative" onMouseLeave={() => setUserMenuOpen(false)}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onMouseEnter={() => setUserMenuOpen(true)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-[#C59B27]/40 hover:border-[#C59B27] bg-white/10 text-white transition-all cursor-pointer text-xs font-semibold"
                >
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7B1123] to-[#4A0814] text-[#E5C05B] flex items-center justify-center text-[11px] font-bold shrink-0">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </span>
                  <span className="max-w-[80px] truncate">{user.name || "Account"}</span>
                  <ChevronDown size={12} className={`transition-transform text-[#997316] ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute top-full right-0 pt-3 w-60 z-50 animate-fade-in text-left"
                    onMouseEnter={() => setUserMenuOpen(true)}
                  >
                    <div className="bg-[#FFFDF9] border border-[#C59B27]/30 rounded-2xl p-2 shadow-[0_24px_60px_-12px_rgba(74,8,20,0.35)] flex flex-col gap-0.5">
                      <div className="px-3.5 py-3 mb-1 rounded-xl bg-gradient-to-br from-[#4A0814] to-[#2E050C]">
                        <p className="text-[13px] font-primary font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-[#E5C05B]/80 truncate">{user.email}</p>
                      </div>
                      <Link href="/dashboard" role="menuitem" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-[#581825] hover:bg-[#C59B27]/10 hover:text-[#7B1123] transition-colors">
                        <Ticket size={15} className="text-[#C59B27] shrink-0" />
                        <span>My Passes &amp; Wallet</span>
                      </Link>
                      <Link href="/dashboard" role="menuitem" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-[#581825] hover:bg-[#C59B27]/10 hover:text-[#7B1123] transition-colors">
                        <Layers size={15} className="text-[#997316] shrink-0" />
                        <span>Dashboard</span>
                      </Link>
                      <Link href="/dashboard" role="menuitem" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-[#581825] hover:bg-[#C59B27]/10 hover:text-[#7B1123] transition-colors">
                        <Compass size={15} className="text-[#997316] shrink-0" />
                        <span>Gate Scanner</span>
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3.5 py-2.5 mt-1 border-t border-[#C59B27]/20 rounded-xl text-[13px] font-medium text-rose-700 hover:bg-rose-500/10 transition-colors w-full text-left cursor-pointer"
                      >
                        <LogOut size={15} className="shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="px-3 py-1.5 text-[11.5px] font-secondary font-semibold uppercase tracking-[0.14em] text-white/85 hover:text-[#E5C05B] transition-colors">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full px-5 py-2 border border-[#E5C05B]/70 text-[#E5C05B] hover:bg-[#E5C05B] hover:text-[#2E050C] text-[11.5px] font-secondary font-bold uppercase tracking-[0.14em] transition-all duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-b from-[#E5C05B] to-[#C59B27] text-[#2E050C] cursor-pointer"
          >
            {isOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>

        {/* Reading-progress hairline */}
        <div className="absolute bottom-0 left-6 right-6 h-[2px] pointer-events-none">
          <div ref={progressRef} className="h-full w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#7B1123] via-[#C59B27] to-[#E5C05B]" />
        </div>
      </div>

      {/* Full-screen mobile menu */}
      <div
        className={`lg:hidden fixed inset-0 z-[55] bg-gradient-to-b from-[#2E050C] via-[#3A0A14] to-[#1C0509] transition-all duration-500 ${
          isOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#C59B27_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(197,155,39,0.28),transparent_70%)] blur-2xl" />

        <div className="relative h-full flex flex-col px-7 pt-24 pb-10 overflow-y-auto">
          <nav className="flex flex-col" aria-label="Mobile">
            {navLinks.map((link, i) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  style={{ transitionDelay: isOpen ? `${120 + i * 60}ms` : "0ms" }}
                  className={`flex items-center justify-between py-4 border-b border-[#C59B27]/20 font-primary text-[28px] font-medium tracking-tight transition-all duration-500 ${
                    isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  } ${active ? "text-[#E5C05B]" : "text-white/90 hover:text-[#E5C05B]"}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-[11px] font-secondary tracking-[0.2em] text-[#C59B27]/70">{String(i + 1).padStart(2, "0")}</span>
                    {link.name}
                  </span>
                  <ChevronRight size={18} className="text-[#C59B27]" />
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-10 flex flex-col gap-3">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 py-3.5 rounded-full border border-[#C59B27]/50 text-[#E5C05B] text-sm font-semibold uppercase tracking-[0.15em]">
                  <Ticket size={15} /> My Passes &amp; Wallet
                </Link>
                <button type="button" onClick={handleLogout} className="py-3 text-white/70 hover:text-white text-sm uppercase tracking-[0.15em] cursor-pointer">
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" onClick={() => setIsOpen(false)} className="py-3.5 text-center rounded-full border border-[#C59B27]/50 text-[#E5C05B] text-sm font-semibold uppercase tracking-[0.15em]">
                  Login
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className="py-3.5 text-center rounded-full bg-gradient-to-r from-[#C59B27] via-[#E5C05B] to-[#C59B27] text-[#2E050C] text-sm font-bold uppercase tracking-[0.15em]">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
