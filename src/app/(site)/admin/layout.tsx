"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  QrCode,
  UserCog,
  Users,
  ChevronRight,
  Zap,
  LogOut,
  Menu,
  X,
  Image,
  FileText,
  Star,
  BookOpen,
  Trophy,
  Tags,
  Ticket,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/calendar", label: "Event Calendar", icon: CalendarRange },
  { href: "/admin/bookings", label: "Ticket Bookings", icon: Ticket },
  { href: "/admin/competitions", label: "Competitions", icon: Trophy },
  { href: "/admin/registrations", label: "Registrations", icon: ClipboardList },
  { href: "/admin/scanner", label: "QR Scanner", icon: QrCode },
  { href: "/admin/assigners", label: "Event Assigners", icon: UserCog },
  { href: "/admin/users", label: "Users", icon: Users },
];

const CONTENT_NAV_ITEMS = [
  { href: "/admin/sponsors", label: "Sponsors", icon: Star },
  { href: "/admin/blogs", label: "Blogs", icon: BookOpen },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/content", label: "Site Content", icon: FileText },
  { href: "/admin/taxonomies", label: "Categories & Cities", icon: Tags },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await fetch("/api/auth/admin-logout", { method: "POST" });
    router.push("/admin/login");
  };

  // Render children directly for full-width login page
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Auth is enforced server-side by src/proxy.ts (redirects unauthenticated
  // requests before this component ever renders) — no client-side gate needed here.

  return (
    <div className="min-h-screen flex" style={{ background: "#170D08", fontFamily: "var(--font-primary)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "linear-gradient(180deg, #2A1510 0%, #170D08 100%)",
          borderRight: "1px solid rgba(201, 162, 39, 0.15)",
        }}
      >
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: "rgba(201, 162, 39, 0.12)" }}>
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <img
              src="/images/logo-icon-transparent.png"
              alt="RFN Admin"
              className="w-9 h-9 rounded-xl object-contain border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-all shrink-0"
            />
            <div>
              <div className="text-[#F5EEE2] font-extrabold text-sm tracking-tight leading-none">Admin Portal</div>
              <div className="text-[10px] uppercase font-bold tracking-wider mt-0.5" style={{ color: "rgba(203,185,160,0.7)" }}>Recharge For Nation</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest font-bold mb-2 px-1" style={{ color: "rgba(143,122,102,0.7)" }}>
            Operations
          </div>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group relative"
                style={{
                  color: active ? "#F5EEE2" : "rgba(203,185,160,0.7)",
                  background: active
                    ? "linear-gradient(135deg, rgba(156,122,29,0.25), rgba(201,162,39,0.12))"
                    : "transparent",
                  border: active ? "1px solid rgba(201,162,39,0.25)" : "1px solid transparent",
                }}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: "linear-gradient(to bottom, #E4C465, #9C7A1D)" }} />
                )}
                <item.icon size={16} style={{ color: active ? "#E4C465" : "rgba(203,185,160,0.5)" }} />
                <span>{item.label}</span>
                {active && <ChevronRight size={12} className="ml-auto" style={{ color: "#E4C465" }} />}
              </Link>
            );
          })}

          {/* Content Management */}
          <div className="text-[10px] uppercase tracking-widest font-bold mt-4 mb-2 px-1" style={{ color: "rgba(143,122,102,0.7)" }}>
            Content
          </div>
          {CONTENT_NAV_ITEMS.map((item) => {
            const active = isActive(item.href, false);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group relative"
                style={{
                  color: active ? "#F5EEE2" : "rgba(203,185,160,0.7)",
                  background: active
                    ? "linear-gradient(135deg, rgba(156,122,29,0.25), rgba(201,162,39,0.12))"
                    : "transparent",
                  border: active ? "1px solid rgba(201,162,39,0.25)" : "1px solid transparent",
                }}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: "linear-gradient(to bottom, #E4C465, #9C7A1D)" }} />
                )}
                <item.icon size={16} style={{ color: active ? "#E4C465" : "rgba(203,185,160,0.5)" }} />
                <span>{item.label}</span>
                {active && <ChevronRight size={12} className="ml-auto" style={{ color: "#E4C465" }} />}
              </Link>
            );
          })}
        </nav>


        {/* Bottom */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(201,162,39,0.12)" }}>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left bg-transparent border-0 cursor-pointer"
            style={{ color: "rgba(248,113,113,0.8)" }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex items-center gap-4 px-6 py-3"
          style={{
            background: "rgba(23,13,8,0.85)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(201,162,39,0.12)",
          }}
        >
          <button
            className="lg:hidden p-2 rounded-lg"
            style={{ background: "rgba(201,162,39,0.1)", color: "#E4C465" }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
            style={{ background: "rgba(156,122,29,0.15)", border: "1px solid rgba(201,162,39,0.25)", color: "#E4C465" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Admin Panel</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
