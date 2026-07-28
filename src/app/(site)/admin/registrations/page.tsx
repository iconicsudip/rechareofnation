"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, Filter, CheckCircle, XCircle, Clock, RefreshCw,
  ChevronLeft, ChevronRight, Eye, X,
} from "lucide-react";

interface Registration {
  id: string;
  participant_id: string;
  competition_name: string;
  full_name: string;
  email: string;
  mobile: string;
  category: string;
  city: string;
  state: string;
  organization: string;
  status: "pending" | "approved" | "rejected";
  payment_status: string;
  created_at: string;
}

const S = {
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "16px" },
  input: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "10px", color: "#E2E8F0", outline: "none", padding: "9px 12px", fontSize: "13px",
  },
  btn: {
    display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px",
    borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none",
  },
};

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  approved: { color: "#34D399", bg: "rgba(16,185,129,0.1)", border: "rgba(52,211,153,0.2)" },
  pending: { color: "#FBBF24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
  rejected: { color: "#F87171", bg: "rgba(239,68,68,0.1)", border: "rgba(248,113,113,0.2)" },
};

export default function AdminRegistrationsPage() {
  const [regs, setRegs] = useState<Registration[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewReg, setViewReg] = useState<Registration | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/registrations?search=${encodeURIComponent(search)}&status=${statusFilter}&page=${page}`
    );
    const data = await res.json();
    setRegs(data.registrations || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [search, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (status: string, ids?: string[]) => {
    setActionLoading(true);
    const body = ids ? { ids, status } : { id: Array.from(selected)[0], status };
    await fetch("/api/admin/registrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSelected(new Set());
    setActionLoading(false);
    load();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#E2E8F0" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Registrations</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>{total} total registrations</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} style={{ ...S.btn, background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          {selected.size > 0 && (
            <>
              <button
                onClick={() => updateStatus("approved", Array.from(selected))}
                disabled={actionLoading}
                style={{ ...S.btn, background: "rgba(16,185,129,0.15)", color: "#34D399", border: "1px solid rgba(52,211,153,0.25)" }}>
                <CheckCircle size={14} /> Approve ({selected.size})
              </button>
              <button
                onClick={() => updateStatus("rejected", Array.from(selected))}
                disabled={actionLoading}
                style={{ ...S.btn, background: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                <XCircle size={14} /> Reject ({selected.size})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(148,163,184,0.4)" }} />
          <input
            style={{ ...S.input, paddingLeft: "32px", width: "100%" }}
            placeholder="Search by name, email or competition..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(148,163,184,0.4)" }} />
          <select
            style={{ ...S.input, paddingLeft: "32px", paddingRight: "12px" }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={S.card} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(99,102,241,0.1)", background: "rgba(99,102,241,0.05)" }}>
                <th className="px-5 py-3 w-8">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) setSelected(new Set(regs.map(r => r.id)));
                      else setSelected(new Set());
                    }}
                    checked={selected.size === regs.length && regs.length > 0}
                    style={{ accentColor: "#4F46E5" }}
                  />
                </th>
                {["Participant", "Competition", "Category", "Status", "Payment", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: "rgba(148,163,184,0.5)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(99,102,241,0.06)]">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-5 py-4">
                    <div className="h-4 rounded animate-pulse w-2/3" style={{ background: "rgba(99,102,241,0.08)" }} />
                  </td></tr>
                ))
              ) : regs.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm" style={{ color: "rgba(148,163,184,0.4)" }}>
                  No registrations found.
                </td></tr>
              ) : regs.map((reg) => {
                const st = STATUS_STYLES[reg.status] || STATUS_STYLES.pending;
                return (
                  <tr key={reg.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <input type="checkbox" checked={selected.has(reg.id)} onChange={() => toggleSelect(reg.id)}
                        style={{ accentColor: "#4F46E5" }} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white text-sm">{reg.full_name}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: "rgba(148,163,184,0.4)" }}>{reg.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold" style={{ color: "rgba(148,163,184,0.7)" }}>{reg.competition_name}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "rgba(148,163,184,0.4)" }}>ID: {reg.participant_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}>
                        {reg.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize"
                        style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${
                        reg.payment_status === "paid"
                          ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                          : "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20"
                      }`}>
                        {reg.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
                      {new Date(reg.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewReg(reg)}
                          className="p-1.5 rounded-lg" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }} title="View">
                          <Eye size={13} />
                        </button>
                        {reg.status === "pending" && (
                          <>
                            <button onClick={() => updateStatus("approved", [reg.id])}
                              className="p-1.5 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", color: "#34D399" }} title="Approve">
                              <CheckCircle size={13} />
                            </button>
                            <button onClick={() => updateStatus("rejected", [reg.id])}
                              className="p-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#F87171" }} title="Reject">
                              <XCircle size={13} />
                            </button>
                          </>
                        )}
                      </div>
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

      {/* Detail Modal */}
      {viewReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setViewReg(null)} />
          <div className="relative w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ background: "#0F1729", border: "1px solid rgba(99,102,241,0.25)" }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(99,102,241,0.15)" }}>
              <h3 className="font-bold text-white">Registration Details</h3>
              <button onClick={() => setViewReg(null)} className="p-1.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8" }}>
                <X size={15} />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 text-sm">
              {[
                ["Name", viewReg.full_name],
                ["Participant ID", viewReg.participant_id],
                ["Email", viewReg.email],
                ["Mobile", viewReg.mobile],
                ["Competition", viewReg.competition_name],
                ["Category", viewReg.category],
                ["City", viewReg.city],
                ["State", viewReg.state],
                ["Organization", viewReg.organization],
                ["Payment", viewReg.payment_status],
              ].map(([label, val]) => (
                <div key={label}>
                  <div className="text-[10px] uppercase font-bold tracking-wider mb-0.5"
                    style={{ color: "rgba(148,163,184,0.4)" }}>{label}</div>
                  <div className="text-white font-semibold">{val || "—"}</div>
                </div>
              ))}
            </div>
            <div className="p-5 pt-0 flex gap-3">
              {viewReg.status !== "approved" && (
                <button onClick={() => { updateStatus("approved", [viewReg.id]); setViewReg(null); }}
                  style={{ ...S.btn, background: "rgba(16,185,129,0.15)", color: "#34D399", border: "1px solid rgba(52,211,153,0.25)", flex: 1, justifyContent: "center" }}>
                  <CheckCircle size={14} /> Approve
                </button>
              )}
              {viewReg.status !== "rejected" && (
                <button onClick={() => { updateStatus("rejected", [viewReg.id]); setViewReg(null); }}
                  style={{ ...S.btn, background: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(248,113,113,0.2)", flex: 1, justifyContent: "center" }}>
                  <XCircle size={14} /> Reject
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
