"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, Search, Shield, UserCheck, RefreshCw,
  ChevronLeft, ChevronRight, CheckCircle, XCircle,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  organization: string;
  role: string;
  is_verified: boolean;
  created_at: string;
}

const ROLE_OPTS = ["user", "admin", "scanner", "coordinator"];

const ROLE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  admin:       { color: "#F472B6", bg: "rgba(219,39,119,0.12)", border: "rgba(244,114,182,0.25)" },
  scanner:     { color: "#818CF8", bg: "rgba(79,70,229,0.12)",  border: "rgba(99,102,241,0.25)" },
  coordinator: { color: "#34D399", bg: "rgba(16,185,129,0.1)",  border: "rgba(52,211,153,0.2)" },
  user:        { color: "#94A3B8", bg: "rgba(100,116,139,0.1)", border: "rgba(148,163,184,0.2)" },
};

const S = {
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "16px" },
  input: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "10px", color: "#E2E8F0", outline: "none", padding: "9px 12px", fontSize: "13px",
  },
  btn: {
    display: "inline-flex" as const, alignItems: "center", gap: "6px", padding: "8px 14px",
    borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none",
  },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}`);
    const data = await res.json();
    setUsers(data.users || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const updateUser = async (id: string, patch: { role?: string; isVerified?: boolean }) => {
    setUpdatingId(id);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    setUpdatingId(null);
    load();
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#E2E8F0" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white">User Management</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>{total} registered users</p>
        </div>
        <button onClick={load} style={{ ...S.btn, background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ROLE_OPTS.map(role => {
          const count = users.filter(u => u.role === role).length;
          const rs = ROLE_STYLES[role];
          return (
            <div key={role} className="p-4 rounded-xl" style={{ background: rs.bg, border: `1px solid ${rs.border}` }}>
              <div className="text-xl font-black" style={{ color: rs.color }}>{count}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider capitalize mt-0.5" style={{ color: rs.color }}>{role}s</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(148,163,184,0.4)" }} />
        <input
          style={{ ...S.input, paddingLeft: "32px", width: "100%" }}
          placeholder="Search by name or email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      <div style={S.card} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(99,102,241,0.1)", background: "rgba(99,102,241,0.05)" }}>
                {["User", "Contact", "Organization", "Role", "Verified", "Joined", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "rgba(148,163,184,0.5)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "rgba(99,102,241,0.06)" }}>
              {loading ? (
                [...Array(7)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5 py-4">
                    <div className="h-4 rounded animate-pulse w-3/4" style={{ background: "rgba(99,102,241,0.08)" }} />
                  </td></tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: "rgba(148,163,184,0.4)" }}>
                  No users found.
                </td></tr>
              ) : users.map(u => {
                const rs = ROLE_STYLES[u.role] || ROLE_STYLES.user;
                const isUpdating = updatingId === u.id;
                return (
                  <tr key={u.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0"
                          style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{u.name}</div>
                          <div className="text-[11px]" style={{ color: "rgba(148,163,184,0.4)" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "rgba(148,163,184,0.6)" }}>
                      {u.mobile || "—"}<br />
                      <span style={{ color: "rgba(148,163,184,0.4)" }}>{u.city || "—"}</span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "rgba(148,163,184,0.6)" }}>
                      {u.organization || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={u.role}
                        onChange={e => updateUser(u.id, { role: e.target.value })}
                        disabled={isUpdating}
                        className="text-[11px] px-2 py-1 rounded-lg font-bold capitalize cursor-pointer border-0 outline-none"
                        style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`, fontFamily: "var(--font-primary)" }}
                      >
                        {ROLE_OPTS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => updateUser(u.id, { isVerified: !u.is_verified })}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 text-xs font-semibold"
                        style={{ background: "none", border: "none", cursor: "pointer", color: u.is_verified ? "#34D399" : "#94A3B8" }}
                      >
                        {u.is_verified
                          ? <><CheckCircle size={13} /> Verified</>
                          : <><XCircle size={13} /> Unverified</>
                        }
                      </button>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>
                      {new Date(u.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-3">
                      {isUpdating && (
                        <div className="w-4 h-4 border-2 rounded-full animate-spin"
                          style={{ borderColor: "rgba(99,102,241,0.3)", borderTopColor: "#818CF8" }} />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "rgba(99,102,241,0.1)" }}>
            <span className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg disabled:opacity-30" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg disabled:opacity-30" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>
        <div className="flex items-center gap-1.5"><Shield size={12} /> Click role dropdown to change user role</div>
        <div className="flex items-center gap-1.5"><UserCheck size={12} /> Click verified status to toggle</div>
      </div>
    </div>
  );
}
