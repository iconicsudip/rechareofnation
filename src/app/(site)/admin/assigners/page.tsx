"use client";

import { useEffect, useState, useCallback } from "react";
import {
  UserCog, Plus, Trash2, RefreshCw, Search, X, ChevronDown,
} from "lucide-react";

interface Assigner {
  id: string;
  event_id: string;
  event_name: string;
  user_id: string;
  user_name: string;
  user_email: string;
  assigner_role: string;
  created_at: string;
}

interface Event {
  id: string;
  name: string;
  event_date: string;
  city: string;
}

const ASSIGNER_ROLES = ["Scanner", "Coordinator", "Security", "Hospitality", "Stage Manager", "Technical"];

const ROLE_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  Scanner:       { color: "#818CF8", bg: "rgba(79,70,229,0.12)",   border: "rgba(99,102,241,0.25)" },
  Coordinator:   { color: "#34D399", bg: "rgba(16,185,129,0.1)",   border: "rgba(52,211,153,0.2)" },
  Security:      { color: "#F87171", bg: "rgba(239,68,68,0.1)",    border: "rgba(248,113,113,0.2)" },
  Hospitality:   { color: "#F472B6", bg: "rgba(219,39,119,0.1)",   border: "rgba(244,114,182,0.2)" },
  "Stage Manager":{ color: "#FBBF24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.2)" },
  Technical:     { color: "#60A5FA", bg: "rgba(37,99,235,0.1)",    border: "rgba(96,165,250,0.2)" },
};

const S = {
  card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "16px" },
  input: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: "10px", color: "#E2E8F0", outline: "none", padding: "9px 12px",
    fontSize: "13px", width: "100%", fontFamily: "var(--font-primary)",
  },
  btn: {
    display: "inline-flex" as const, alignItems: "center", gap: "6px", padding: "9px 16px",
    borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none",
  },
};

export default function AdminAssignersPage() {
  const [assigners, setAssigners] = useState<Assigner[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEvent, setFilterEvent] = useState("");
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    eventId: "", userId: "", assignerRole: "Scanner",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [aRes, eRes, uRes] = await Promise.all([
      fetch(`/api/admin/assigners?eventId=${filterEvent}`),
      fetch("/api/admin/events?page=1&search="),
      fetch("/api/admin/users?all=true")
    ]);
    const aData = await aRes.json();
    const eData = await eRes.json();
    const uData = await uRes.json();
    setAssigners(aData.assigners || []);
    setEvents(eData.events || []);
    setUsers(uData.users || []);
    setLoading(false);
  }, [filterEvent]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.eventId) { setFormError("Please select an event."); return; }
    if (!form.userId) { setFormError("Please select a user."); return; }

    setSaving(true);
    const selectedEvent = events.find(ev => ev.id === form.eventId);
    const selectedUser = users.find(u => u.id === form.userId);
    const res = await fetch("/api/admin/assigners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: form.eventId,
        eventName: selectedEvent?.name || "",
        userId: form.userId,
        userName: selectedUser?.name || "Unknown",
        userEmail: selectedUser?.email || "unknown@example.com",
        assignerRole: form.assignerRole,
        assignedBy: "admin",
      }),
    });
    const data = await res.json();
    if (!res.ok) { setFormError(data.error || "Failed to assign."); }
    else { setPanelOpen(false); setForm({ eventId: "", userId: "", assignerRole: "Scanner" }); load(); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/assigners?id=${id}`, { method: "DELETE" });
    setDeleteId(null);
    load();
  };

  const filtered = assigners.filter(
    a => a.user_name.toLowerCase().includes(search.toLowerCase()) ||
         a.user_email.toLowerCase().includes(search.toLowerCase()) ||
         a.event_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#E2E8F0" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Event Assigners</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>
            Assign staff & volunteers to events
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} style={{ ...S.btn, background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setPanelOpen(true)} style={{ ...S.btn, background: "linear-gradient(135deg, #4F46E5, #DB2777)", color: "#fff" }}>
            <Plus size={14} /> Assign Staff
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-44">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(148,163,184,0.4)" }} />
          <input style={{ ...S.input, paddingLeft: "32px" }} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(148,163,184,0.4)" }} />
          <select style={{ ...S.input, paddingRight: "32px", minWidth: "200px" }} value={filterEvent} onChange={e => setFilterEvent(e.target.value)}>
            <option value="">All Events</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {ASSIGNER_ROLES.map(role => {
          const count = assigners.filter(a => a.assigner_role === role).length;
          const rc = ROLE_COLORS[role];
          return (
            <div key={role} className="p-3 rounded-xl flex flex-col gap-1 text-center" style={{ background: rc.bg, border: `1px solid ${rc.border}` }}>
              <div className="text-lg font-black" style={{ color: rc.color }}>{count}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: rc.color }}>{role}</div>
            </div>
          );
        })}
      </div>

      {/* Assigners Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-3 rounded-2xl" style={S.card}>
          <UserCog size={36} style={{ color: "rgba(99,102,241,0.25)" }} />
          <p className="text-sm" style={{ color: "rgba(148,163,184,0.4)" }}>No staff assigned yet. Click &apos;Assign Staff&apos; to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => {
            const rc = ROLE_COLORS[a.assigner_role] || ROLE_COLORS.Scanner;
            return (
              <div key={a.id} className="p-5 rounded-2xl flex flex-col gap-3 relative group" style={S.card}>
                {/* Role badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                    style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}>
                    {a.assigner_role}
                  </span>
                  {deleteId === a.id ? (
                    <div className="flex gap-1.5">
                      <button onClick={() => handleDelete(a.id)} className="text-[11px] font-bold px-2 py-1 rounded-lg"
                        style={{ background: "rgba(239,68,68,0.15)", color: "#F87171" }}>Confirm</button>
                      <button onClick={() => setDeleteId(null)} className="text-[11px] font-bold px-2 py-1 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8" }}>Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteId(a.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-opacity"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#F87171" }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                {/* Person */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{ background: rc.bg, border: `1px solid ${rc.border}`, color: rc.color }}>
                    {a.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-sm truncate">{a.user_name}</div>
                    <div className="text-[11px] truncate" style={{ color: "rgba(148,163,184,0.5)" }}>{a.user_email}</div>
                  </div>
                </div>

                {/* Event */}
                <div className="text-xs px-3 py-2 rounded-xl truncate"
                  style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.12)", color: "rgba(148,163,184,0.7)" }}>
                  📅 {a.event_name}
                </div>

                <div className="text-[10px]" style={{ color: "rgba(148,163,184,0.3)" }}>
                  Assigned {new Date(a.created_at).toLocaleDateString("en-IN")}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />
          <div className="relative w-full max-w-md h-full overflow-y-auto flex flex-col"
            style={{ background: "#0F1729", borderLeft: "1px solid rgba(99,102,241,0.2)" }}>
            <div className="flex items-center justify-between p-6 border-b sticky top-0 z-10"
              style={{ borderColor: "rgba(99,102,241,0.15)", background: "#0F1729" }}>
              <h2 className="font-extrabold text-white text-lg">Assign Staff</h2>
              <button onClick={() => setPanelOpen(false)} className="p-2 rounded-lg"
                style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8" }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="p-6 flex flex-col gap-5">
              {formError && (
                <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#FCA5A5" }}>
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>Select Event *</label>
                <select style={S.input} value={form.eventId} onChange={e => setForm(p => ({ ...p, eventId: e.target.value }))} required>
                  <option value="">— Choose Event —</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name} ({ev.city})</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1.5" style={{ color: "rgba(148,163,184,0.5)" }}>Select Staff Member *</label>
                <select style={S.input} value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} required>
                  <option value="">— Choose User —</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: "rgba(148,163,184,0.5)" }}>Assigner Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  {ASSIGNER_ROLES.map(role => {
                    const rc = ROLE_COLORS[role];
                    const selected = form.assignerRole === role;
                    return (
                      <button type="button" key={role}
                        onClick={() => setForm(p => ({ ...p, assignerRole: role }))}
                        className="py-2.5 px-3 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: selected ? rc.bg : "rgba(255,255,255,0.03)",
                          border: `1px solid ${selected ? rc.border : "rgba(255,255,255,0.06)"}`,
                          color: selected ? rc.color : "rgba(148,163,184,0.5)",
                        }}>
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setPanelOpen(false)}
                  style={{ ...S.btn, flex: 1, justifyContent: "center", background: "rgba(255,255,255,0.05)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.08)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ ...S.btn, flex: 2, justifyContent: "center", background: saving ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #4F46E5, #DB2777)", color: "#fff" }}>
                  {saving ? "Assigning..." : "Assign Staff Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
