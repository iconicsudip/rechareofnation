"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, Filter, XCircle, RefreshCw, ScanLine,
  ChevronLeft, ChevronRight, Eye, X, Ban,
} from "lucide-react";

interface Booking {
  id: string;
  booking_ref: string;
  event_name: string;
  event_date: string;
  event_venue: string;
  visitor_name: string;
  visitor_email: string;
  visitor_mobile: string;
  visitor_city: string;
  ticket_type: string;
  quantity: number;
  total_amount: number;
  payment_id: string;
  payment_method: string;
  status: "confirmed" | "cancelled";
  scanned_at: string | null;
  scanned_by: string | null;
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
  confirmed: { color: "#34D399", bg: "rgba(16,185,129,0.1)", border: "rgba(52,211,153,0.2)" },
  cancelled: { color: "#F87171", bg: "rgba(239,68,68,0.1)", border: "rgba(248,113,113,0.2)" },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/bookings?search=${encodeURIComponent(search)}&status=${statusFilter}&page=${page}`
    );
    const data = await res.json();
    setBookings(data.bookings || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [search, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const cancelBooking = async (id: string) => {
    setActionLoading(true);
    await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "cancelled" }),
    });
    setActionLoading(false);
    setViewBooking(null);
    load();
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#E2E8F0" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Ticket Bookings</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>{total} total bookings</p>
        </div>
        <button onClick={load} style={{ ...S.btn, background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(148,163,184,0.4)" }} />
          <input
            style={{ ...S.input, paddingLeft: "32px", width: "100%" }}
            placeholder="Search by name, email, event or booking ref..."
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
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={S.card} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(99,102,241,0.1)", background: "rgba(99,102,241,0.05)" }}>
                {["Visitor", "Event", "Ticket", "Amount", "Status", "Check-in", "Date", "Actions"].map((h) => (
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
              ) : bookings.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm" style={{ color: "rgba(148,163,184,0.4)" }}>
                  No bookings found.
                </td></tr>
              ) : bookings.map((b) => {
                const st = STATUS_STYLES[b.status] || STATUS_STYLES.confirmed;
                return (
                  <tr key={b.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white text-sm">{b.visitor_name}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: "rgba(148,163,184,0.4)" }}>{b.visitor_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold" style={{ color: "rgba(148,163,184,0.7)" }}>{b.event_name}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "rgba(148,163,184,0.4)" }}>Ref: {b.booking_ref}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}>
                        {b.ticket_type} x {b.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-white">₹{Number(b.total_amount).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize"
                        style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.scanned_at ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit"
                          style={{ background: "rgba(6,182,212,0.1)", color: "#22D3EE", border: "1px solid rgba(34,211,238,0.2)" }}>
                          <ScanLine size={10} /> Scanned
                        </span>
                      ) : (
                        <span className="text-[10px]" style={{ color: "rgba(148,163,184,0.35)" }}>Not yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
                      {new Date(b.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewBooking(b)}
                          className="p-1.5 rounded-lg" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }} title="View">
                          <Eye size={13} />
                        </button>
                        {b.status === "confirmed" && (
                          <button onClick={() => cancelBooking(b.id)} disabled={actionLoading}
                            className="p-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "#F87171" }} title="Cancel & restock">
                            <XCircle size={13} />
                          </button>
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
      {viewBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setViewBooking(null)} />
          <div className="relative w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ background: "#0F1729", border: "1px solid rgba(99,102,241,0.25)" }}>
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "rgba(99,102,241,0.15)" }}>
              <h3 className="font-bold text-white">Booking Details</h3>
              <button onClick={() => setViewBooking(null)} className="p-1.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8" }}>
                <X size={15} />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 text-sm">
              {[
                ["Booking Ref", viewBooking.booking_ref],
                ["Status", viewBooking.status],
                ["Visitor", viewBooking.visitor_name],
                ["Email", viewBooking.visitor_email],
                ["Mobile", viewBooking.visitor_mobile],
                ["City", viewBooking.visitor_city],
                ["Event", viewBooking.event_name],
                ["Venue", viewBooking.event_venue],
                ["Ticket Type", viewBooking.ticket_type],
                ["Quantity", String(viewBooking.quantity)],
                ["Amount", `₹${Number(viewBooking.total_amount).toLocaleString()}`],
                ["Payment Method", viewBooking.payment_method],
                ["Payment ID", viewBooking.payment_id],
                ["Check-in", viewBooking.scanned_at ? new Date(viewBooking.scanned_at).toLocaleString("en-IN") : "Not yet scanned"],
              ].map(([label, val]) => (
                <div key={label}>
                  <div className="text-[10px] uppercase font-bold tracking-wider mb-0.5"
                    style={{ color: "rgba(148,163,184,0.4)" }}>{label}</div>
                  <div className="text-white font-semibold capitalize">{val || "—"}</div>
                </div>
              ))}
            </div>
            {viewBooking.status === "confirmed" && (
              <div className="p-5 pt-0">
                <button onClick={() => cancelBooking(viewBooking.id)} disabled={actionLoading}
                  style={{ ...S.btn, background: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(248,113,113,0.2)", width: "100%", justifyContent: "center" }}>
                  <Ban size={14} /> Cancel Booking & Restock Passes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
