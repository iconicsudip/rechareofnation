"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays, Users, Ticket, ClipboardList, TrendingUp,
  CheckCircle, Clock, Activity, ArrowUpRight, IndianRupee,
} from "lucide-react";

interface Stats {
  events: number;
  ticketsSold: number;
  ticketBookings: number;
  registrations: number;
  approvedRegistrations: number;
  pendingRegistrations: number;
  users: number;
  revenue: number;
  recentActivity: { type: string; name: string; event_name: string; created_at: string; status: string }[];
}

const KPI_CONFIG = [
  { key: "events", label: "Active Events", icon: CalendarDays, color: "#818CF8", bg: "rgba(79,70,229,0.12)", border: "rgba(99,102,241,0.2)" },
  { key: "ticketsSold", label: "Tickets Sold", icon: Ticket, color: "#34D399", bg: "rgba(16,185,129,0.1)", border: "rgba(52,211,153,0.2)" },
  { key: "registrations", label: "Registrations", icon: ClipboardList, color: "#F472B6", bg: "rgba(219,39,119,0.1)", border: "rgba(244,114,182,0.2)" },
  { key: "users", label: "Registered Users", icon: Users, color: "#60A5FA", bg: "rgba(37,99,235,0.1)", border: "rgba(96,165,250,0.2)" },
];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const cardStyle = {
    background: "rgba(15,23,42,0.6)",
    border: "1px solid rgba(99,102,241,0.12)",
    borderRadius: "16px",
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-8" style={{ color: "#E2E8F0" }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>
          Live data from Recharge Nation events
        </p>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CONFIG.map((kpi) => {
            const value = stats ? (stats as unknown as Record<string, number>)[kpi.key] : 0;
            return (
              <div key={kpi.key} className="p-5 flex flex-col gap-3 relative overflow-hidden" style={{ ...cardStyle, border: `1px solid ${kpi.border}` }}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"
                  style={{ background: kpi.color, opacity: 0.06 }} />
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: kpi.bg, border: `1px solid ${kpi.border}` }}>
                  <kpi.icon size={18} style={{ color: kpi.color }} />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{value.toLocaleString()}</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.6)" }}>{kpi.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Revenue + Registration Status Row */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Card */}
          <div className="p-6 flex flex-col gap-2" style={cardStyle}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.5)" }}>
              <IndianRupee size={12} /> Total Revenue
            </div>
            <div className="text-3xl font-black text-white">
              ₹{stats.revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: "#34D399" }}>
              <TrendingUp size={12} /> From confirmed ticket bookings
            </div>
          </div>

          {/* Registration breakdown */}
          <div className="p-6 flex flex-col gap-4" style={cardStyle}>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.5)" }}>
              Registrations
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(148,163,184,0.8)" }}>
                  <CheckCircle size={14} style={{ color: "#34D399" }} /> Approved
                </div>
                <span className="font-bold text-white">{stats.approvedRegistrations}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(148,163,184,0.8)" }}>
                  <Clock size={14} style={{ color: "#FBBF24" }} /> Pending
                </div>
                <span className="font-bold text-white">{stats.pendingRegistrations}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(148,163,184,0.8)" }}>
                  <Activity size={14} style={{ color: "#818CF8" }} /> Total
                </div>
                <span className="font-bold text-white">{stats.registrations}</span>
              </div>
            </div>
          </div>

          {/* Ticket bookings */}
          <div className="p-6 flex flex-col gap-4" style={cardStyle}>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.5)" }}>
              Ticket Bookings
            </div>
            <div className="text-4xl font-black text-white">{stats.ticketBookings}</div>
            <div className="text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
              {stats.ticketsSold} total seats booked
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats && stats.recentActivity.length > 0 && (
        <div style={cardStyle} className="overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "rgba(99,102,241,0.1)" }}>
            <h2 className="font-bold text-white text-sm">Recent Activity</h2>
            <Activity size={14} style={{ color: "rgba(148,163,184,0.4)" }} />
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(99,102,241,0.08)" }}>
            {stats.recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: item.type === "ticket" ? "rgba(79,70,229,0.15)" : "rgba(219,39,119,0.15)",
                    border: `1px solid ${item.type === "ticket" ? "rgba(99,102,241,0.25)" : "rgba(244,114,182,0.25)"}`,
                  }}>
                  {item.type === "ticket"
                    ? <Ticket size={12} style={{ color: "#818CF8" }} />
                    : <ClipboardList size={12} style={{ color: "#F472B6" }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{item.name}</div>
                  <div className="text-xs truncate" style={{ color: "rgba(148,163,184,0.5)" }}>{item.event_name}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    item.status === "confirmed" || item.status === "approved"
                      ? "text-emerald-400 bg-emerald-400/10"
                      : "text-yellow-400 bg-yellow-400/10"
                  }`}>
                    {item.status}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "rgba(148,163,184,0.4)" }}>
                    {new Date(item.created_at).toLocaleDateString("en-IN")}
                  </div>
                </div>
                <ArrowUpRight size={12} style={{ color: "rgba(148,163,184,0.3)" }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats && stats.recentActivity.length === 0 && (
        <div className="text-center py-16 rounded-2xl" style={cardStyle}>
          <Activity size={32} className="mx-auto mb-3" style={{ color: "rgba(148,163,184,0.2)" }} />
          <p className="text-sm" style={{ color: "rgba(148,163,184,0.4)" }}>
            No activity yet. Data will appear once users register or book tickets.
          </p>
        </div>
      )}
    </div>
  );
}
