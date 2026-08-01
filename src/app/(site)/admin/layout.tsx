"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
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
    <div className="min-h-screen flex" style={{ background: "#0B0F1A", fontFamily: "var(--font-primary)" }}>
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
          background: "linear-gradient(180deg, #0F1729 0%, #0B0F1A 100%)",
          borderRight: "1px solid rgba(99, 102, 241, 0.12)",
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: "rgba(99, 102, 241, 0.1)" }}>
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4F46E5, #DB2777)" }}>
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-extrabold text-sm tracking-tight leading-none">Admin</div>
              <div className="text-[10px]" style={{ color: "rgba(148,163,184,0.6)" }}>Recharge Nation</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest font-bold mb-2 px-1" style={{ color: "rgba(148,163,184,0.35)" }}>
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
                  color: active ? "#fff" : "rgba(148,163,184,0.7)",
                  background: active
                    ? "linear-gradient(135deg, rgba(79,70,229,0.25), rgba(219,39,119,0.12))"
                    : "transparent",
                  border: active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                }}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: "linear-gradient(to bottom, #4F46E5, #DB2777)" }} />
                )}
                <item.icon size={16} style={{ color: active ? "#818CF8" : "rgba(148,163,184,0.5)" }} />
                <span>{item.label}</span>
                {active && <ChevronRight size={12} className="ml-auto" style={{ color: "#818CF8" }} />}
              </Link>
            );
          })}

          {/* Content Management */}
          <div className="text-[10px] uppercase tracking-widest font-bold mt-4 mb-2 px-1" style={{ color: "rgba(148,163,184,0.35)" }}>
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
                  color: active ? "#fff" : "rgba(148,163,184,0.7)",
                  background: active
                    ? "linear-gradient(135deg, rgba(79,70,229,0.25), rgba(219,39,119,0.12))"
                    : "transparent",
                  border: active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                }}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: "linear-gradient(to bottom, #4F46E5, #DB2777)" }} />
                )}
                <item.icon size={16} style={{ color: active ? "#818CF8" : "rgba(148,163,184,0.5)" }} />
                <span>{item.label}</span>
                {active && <ChevronRight size={12} className="ml-auto" style={{ color: "#818CF8" }} />}
              </Link>
            );
          })}
        </nav>


        {/* Bottom */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(99,102,241,0.1)" }}>
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
            background: "rgba(11,15,26,0.85)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(99,102,241,0.1)",
          }}
        >
          <button
            className="lg:hidden p-2 rounded-lg"
            style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
            style={{ background: "rgba(79,70,229,0.12)", border: "1px solid rgba(99,102,241,0.2)", color: "#818CF8" }}>
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
