"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, LogOut, Calendar,
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
  const [brandTagline, setBrandTagline] = useState("Experience India");



  // Fetch CMS-editable nav links / brand tagline
  useEffect(() => {
    let cancelled = false;
    const fetchNavContent = async () => {
      const data = await ApiClient.getSiteContent<NavContent>("nav_links");
      if (!cancelled && data) {
        if (data.brandTagline) setBrandTagline(data.brandTagline);
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

  return (
    <header className="sticky top-0 z-50 w-full bg-[#120B07]/85 backdrop-blur-xl border-b border-amber-500/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
      {/* Top subtle golden ambient beam */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent pointer-events-none" />

      <div className="container max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between relative gap-4">

          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group select-none shrink-0 outline-none focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#170D08] shadow-[0_0_15px_rgba(245,158,11,0.25)] group-hover:shadow-[0_0_22px_rgba(245,158,11,0.4)] transition-all shrink-0">
              <Ticket size={16} className="shrink-0 group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[13.5px] font-black tracking-tight text-white font-primary uppercase leading-tight">
                RECHARGE<span className="text-amber-400">NATION</span>
              </span>
              <span className="text-[7.5px] font-primary font-bold tracking-[0.25em] text-stone-400 uppercase mt-0.5 leading-none">
                {brandTagline}
              </span>
            </div>
          </Link>

          {/* Desktop Minimal Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {primaryLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 outline-none focus:outline-none ${
                    isActive
                      ? "text-amber-400 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.12)]"
                      : "text-stone-300 hover:text-amber-300 hover:bg-white/[0.04]"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">



            {/* Auth States */}
            {user ? (
              <div
                className="relative"
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onMouseEnter={() => setUserMenuOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-amber-500/20 text-stone-200 transition-all cursor-pointer text-xs font-bold outline-none focus:outline-none"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-[#170D08] flex items-center justify-center text-[9px] font-black shrink-0">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <span className="max-w-[90px] truncate text-[11px]">{user.name || "Account"}</span>
                  <ChevronDown
                    size={11}
                    className={`transition-transform text-stone-400 ${
                      userMenuOpen ? "rotate-180 text-amber-400" : ""
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute top-full right-0 mt-2 w-52 bg-[#180E09]/95 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 z-50 animate-fade-in text-left"
                    onMouseEnter={() => setUserMenuOpen(true)}
                  >
                    <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                      <p className="text-[11px] font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Ticket size={13} className="text-amber-400 shrink-0" />
                      <span>My Passes &amp; Wallet</span>
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Layers size={13} className="text-stone-400 shrink-0" />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition-colors"
                    >
                      <Compass size={13} className="text-amber-400 shrink-0" />
                      <span>Gate Scanner</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 mt-1 border-t border-white/[0.06] rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors w-full text-left cursor-pointer"
                    >
                      <LogOut size={13} className="shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-bold uppercase tracking-wider text-stone-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.04] transition-all outline-none focus:outline-none"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#170D08] text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all transform hover:-translate-y-0.5 outline-none focus:outline-none"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Bar */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-stone-300 hover:text-white transition-colors cursor-pointer outline-none focus:outline-none"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden absolute top-[64px] left-0 w-full bg-[#120B07]/98 border-b border-amber-500/10 p-5 flex flex-col gap-4 shadow-2xl animate-fade-in z-50">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between text-xs font-bold py-2.5 px-3 rounded-xl uppercase tracking-wider transition-colors ${
                pathname === "/" ? "bg-amber-500/10 text-amber-400" : "text-stone-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>Home</span>
              <ChevronRight size={14} className="text-stone-500" />
            </Link>

            {primaryLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between text-xs font-bold py-2.5 px-3 rounded-xl uppercase tracking-wider transition-colors ${
                    isActive ? "bg-amber-500/10 text-amber-400" : "text-stone-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{link.name}</span>
                  <ChevronRight size={14} className="text-stone-500" />
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 rounded-xl text-stone-200 text-xs font-bold uppercase"
                >
                  <Ticket size={13} className="text-amber-400" />
                  <span>My Passes &amp; Wallet</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-2.5 text-rose-400 text-xs font-bold uppercase text-center cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 text-center border border-white/10 rounded-xl text-stone-300 text-xs font-bold uppercase hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 text-center bg-gradient-to-r from-amber-500 to-amber-400 text-[#170D08] rounded-xl text-xs font-black uppercase shadow-lg shadow-amber-500/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
