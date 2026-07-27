"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User, Ticket, Trophy, Settings, LogOut, Download,
  MapPin, Calendar, AlertCircle, CheckCircle, QrCode,
  X, Shield, RefreshCw,
} from "lucide-react";
import { ApiClient } from "@/lib/api-client";

interface PassData {
  type: "ticket" | "registration";
  name: string;
  ref: string;
  ticketType?: string;
  category?: string;
  eventDate?: string;
  venue?: string;
  status: string;
  qrHash: string;
}

type Tab = "tickets" | "registrations" | "settings";

// ── Tiny QR renderer using a public API ─────────────────────────────────────
function QRImage({ value, size = 160 }: { value: string; size?: number }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=000000&margin=2`;
  return (
    <img
      src={url}
      alt="QR Code"
      width={size}
      height={size}
      className="rounded-xl"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// ── Pass Modal ───────────────────────────────────────────────────────────────
function PassModal({ pass, onClose }: { pass: PassData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(11,15,26,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden relative"
        style={{ background: "linear-gradient(180deg, #0F1729 0%, #0B0F1A 100%)", border: "1px solid rgba(99,102,241,0.25)" }}>

        {/* Header stripe */}
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #4F46E5, #DB2777, #0891B2)" }} />

        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg"
          style={{ background: "rgba(255,255,255,0.06)", color: "#94A3B8" }}>
          <X size={15} />
        </button>

        <div className="p-6 flex flex-col items-center gap-4 text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full"
            style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#22D3EE" }}>
            {pass.type === "ticket" ? "🎫 Event Entry Pass" : "🏆 Competitor ID Pass"}
          </span>

          <div>
            <h4 className="text-lg font-extrabold text-white" style={{ fontFamily: "var(--font-primary)" }}>{pass.name}</h4>
            <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.5)" }}>
              {pass.type === "ticket" ? `Ref: ${pass.ref}` : `ID: ${pass.ref}`}
            </p>
          </div>

          {/* Real QR Code */}
          <div className="p-3 bg-white rounded-2xl shadow-xl">
            <QRImage value={pass.qrHash} size={160} />
          </div>

          <div className="w-full text-xs flex flex-col gap-2.5 pt-2 border-t"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {[
              ["Pass Type", pass.ticketType || pass.category || "—"],
              ["Date", pass.eventDate || "—"],
              ["Venue", pass.venue || "—"],
              ["Status", pass.status],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span style={{ color: "rgba(148,163,184,0.5)" }}>{label}</span>
                <span className={`font-bold ${label === "Status" && (val === "confirmed" || val === "approved") ? "text-emerald-400" : "text-white"}`}>
                  {val}
                </span>
              </div>
            ))}
          </div>

          <button onClick={() => window.print()}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #4F46E5, #DB2777)", color: "#fff", border: "none", cursor: "pointer", fontFamily: "var(--font-primary)" }}>
            <Download size={14} /> Download / Print Pass
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("tickets");
  const [loading, setLoading] = useState(true);

  // Settings
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [organization, setOrganization] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Pass modal
  const [selectedPass, setSelectedPass] = useState<PassData | null>(null);

  const loadData = useCallback(async (user: any) => {
    setLoading(true);
    // Try Neon API first, fall back to localStorage mock
    try {
      const [tRes, rRes] = await Promise.all([
        fetch(`/api/user/tickets?userId=${user.id}`),
        fetch(`/api/user/registrations?userId=${user.id}`),
      ]);
      if (tRes.ok && rRes.ok) {
        const tData = await tRes.json();
        const rData = await rRes.json();
        if (tData.tickets) setBookings(tData.tickets);
        else setBookings(ApiClient.getBookings());
        if (rData.registrations) setRegistrations(rData.registrations);
        else setRegistrations(ApiClient.getRegistrations());
      } else {
        setBookings(ApiClient.getBookings());
        setRegistrations(ApiClient.getRegistrations());
      }
    } catch {
      setBookings(ApiClient.getBookings());
      setRegistrations(ApiClient.getRegistrations());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const user = ApiClient.getCurrentUser();
    if (!user) { router.push("/login?redirect=/dashboard"); return; }
    setCurrentUser(user);
    setName(user.name);
    setMobile(user.mobile || "");
    setCity(user.city || "");
    setStateVal(user.state || "");
    setOrganization(user.organization || "");
    loadData(user);
  }, [router, loadData]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    const res = await ApiClient.updateUserProfile(currentUser.id, { name, mobile, city, state: stateVal, organization });
    if (res.success && res.user) { setCurrentUser(res.user); setSettingsSuccess(true); setTimeout(() => setSettingsSuccess(false), 3000); }
    setIsSaving(false);
  };

  const openPass = (item: any, type: "ticket" | "registration") => {
    setSelectedPass({
      type,
      name: type === "ticket" ? (item.event_name || item.eventName) : (item.competition_name || item.competitionName),
      ref: type === "ticket" ? (item.booking_ref || item.bookingRef) : (item.participant_id || item.participantId),
      ticketType: type === "ticket" ? (item.ticket_type || item.ticketType) : undefined,
      category: type === "registration" ? item.category : undefined,
      eventDate: type === "ticket" ? (item.event_date || item.eventDate) : (item.competition_date || item.competitionDate),
      venue: type === "ticket" ? (item.event_venue || item.eventVenue) : (item.competition_venue || item.competitionVenue),
      status: item.status || "confirmed",
      qrHash: item.qr_hash || item.qrCodeValue || `RN-PASS-${item.id}`,
    });
  };

  const handleLogout = () => { ApiClient.logoutUser(); router.push("/"); };

  if (!currentUser) return (
    <div className="container py-20 text-center text-sm" style={{ color: "rgba(148,163,184,0.5)" }}>
      Authenticating...
    </div>
  );

  const TAB_ITEMS: { key: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { key: "tickets", label: "My Tickets", icon: Ticket, count: bookings.length },
    { key: "registrations", label: "Registrations", icon: Trophy, count: registrations.length },
    { key: "settings", label: "Settings", icon: Settings, count: 0 },
  ];

  return (
    <div className="container py-20 md:py-24 flex flex-col lg:flex-row gap-8">
      {selectedPass && <PassModal pass={selectedPass} onClose={() => setSelectedPass(null)} />}

      {/* Left: Profile + tabs */}
      <div className="lg:w-72 flex flex-col gap-4 flex-shrink-0">
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 text-center">
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto font-black text-2xl text-white"
            style={{ background: "linear-gradient(135deg, #4F46E5, #DB2777)", fontFamily: "var(--font-primary)" }}>
            {currentUser.name.charAt(0).toUpperCase()}
            {currentUser.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#10B981" }}>
                <CheckCircle size={11} className="text-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-white" style={{ fontFamily: "var(--font-primary)" }}>{currentUser.name}</h3>
            <span className="text-xs block mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>{currentUser.email}</span>
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34D399" }}>
              <Shield size={9} /> {currentUser.isVerified ? "Verified" : "Unverified"}
            </span>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: "rgba(99,102,241,0.08)" }}>
            <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(79,70,229,0.08)", border: "1px solid rgba(99,102,241,0.12)" }}>
              <div className="text-lg font-black text-white" style={{ fontFamily: "var(--font-primary)" }}>{bookings.length}</div>
              <div className="text-[10px]" style={{ color: "rgba(148,163,184,0.5)" }}>Tickets</div>
            </div>
            <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(219,39,119,0.08)", border: "1px solid rgba(244,114,182,0.12)" }}>
              <div className="text-lg font-black text-white" style={{ fontFamily: "var(--font-primary)" }}>{registrations.length}</div>
              <div className="text-[10px]" style={{ color: "rgba(148,163,184,0.5)" }}>Registered</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="glass-panel rounded-2xl p-2 flex flex-col gap-1">
          {TAB_ITEMS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="flex items-center gap-3 p-3.5 text-sm font-semibold rounded-xl text-left transition-all"
              style={{
                background: activeTab === t.key ? "linear-gradient(135deg, rgba(79,70,229,0.2), rgba(219,39,119,0.1))" : "transparent",
                border: activeTab === t.key ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent",
                color: activeTab === t.key ? "#fff" : "rgba(148,163,184,0.6)",
                fontFamily: "var(--font-primary)",
              }}>
              <t.icon size={16} style={{ color: activeTab === t.key ? "#818CF8" : "rgba(148,163,184,0.4)" }} />
              <span>{t.label}</span>
              {t.count > 0 && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(99,102,241,0.15)", color: "#818CF8" }}>{t.count}</span>
              )}
            </button>
          ))}

          <div className="border-t my-1" style={{ borderColor: "rgba(99,102,241,0.08)" }} />

          <button onClick={loadData.bind(null, currentUser)}
            className="flex items-center gap-3 p-3.5 text-sm font-semibold rounded-xl text-left transition-all"
            style={{ color: "rgba(148,163,184,0.5)", fontFamily: "var(--font-primary)" }}>
            <RefreshCw size={15} style={{ color: "rgba(148,163,184,0.3)" }} />
            Refresh Data
          </button>

          <button onClick={handleLogout}
            className="flex items-center gap-3 p-3.5 text-sm font-semibold rounded-xl text-left transition-all"
            style={{ color: "rgba(248,113,113,0.7)", fontFamily: "var(--font-primary)" }}>
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Right: Content */}
      <div className="flex-1 min-w-0">

        {/* My Tickets */}
        {activeTab === "tickets" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-primary)" }}>
                <Ticket size={20} style={{ color: "#22D3EE" }} /> My Booked Tickets
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.15)", color: "#22D3EE" }}>
                {bookings.length} passes
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "rgba(99,102,241,0.06)" }} />)}
              </div>
            ) : bookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((b) => (
                  <div key={b.id || b.bookingRef} className="glass-panel overflow-hidden flex flex-col">
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="flex justify-between items-start gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: "rgba(148,163,184,0.4)" }}>
                          REF: {b.booking_ref || b.bookingRef}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded uppercase font-bold"
                          style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34D399" }}>
                          {b.status || "confirmed"}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm" style={{ fontFamily: "var(--font-primary)" }}>
                        {b.event_name || b.eventName}
                      </h4>
                      <div className="flex flex-col gap-1.5 text-xs mt-1" style={{ color: "rgba(148,163,184,0.5)" }}>
                        <span className="flex items-center gap-1.5"><Calendar size={11} />{b.event_date || b.eventDate}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={11} />{b.event_venue || b.eventVenue}</span>
                        <span className="font-semibold mt-1" style={{ color: "#22D3EE" }}>
                          {b.ticket_type || b.ticketType} × {b.quantity}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => openPass(b, "ticket")}
                      className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold transition-all border-t"
                      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(6,182,212,0.05)", color: "#22D3EE", cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(6,182,212,0.15)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "rgba(6,182,212,0.05)")}>
                      <QrCode size={13} /> View QR Pass
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel py-16 text-center rounded-2xl">
                <Ticket size={36} className="mx-auto mb-3" style={{ color: "rgba(148,163,184,0.2)" }} />
                <p className="text-sm" style={{ color: "rgba(148,163,184,0.4)" }}>No tickets booked yet.</p>
              </div>
            )}
          </div>
        )}

        {/* My Registrations */}
        {activeTab === "registrations" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-primary)" }}>
                <Trophy size={20} style={{ color: "#F472B6" }} /> Competition Registrations
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                style={{ background: "rgba(219,39,119,0.1)", border: "1px solid rgba(244,114,182,0.15)", color: "#F472B6" }}>
                {registrations.length} entries
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "rgba(219,39,119,0.06)" }} />)}
              </div>
            ) : registrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registrations.map((reg) => {
                  const approved = reg.status === "approved";
                  return (
                    <div key={reg.id || reg.participantId} className="glass-panel overflow-hidden flex flex-col">
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <div className="flex justify-between items-start gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.4)" }}>
                            ID: {reg.participant_id || reg.participantId}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${
                            approved
                              ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                              : "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20"
                          }`}>
                            {reg.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm" style={{ fontFamily: "var(--font-primary)" }}>
                          {reg.competition_name || reg.competitionName}
                        </h4>
                        <div className="flex flex-col gap-1.5 text-xs mt-1" style={{ color: "rgba(148,163,184,0.5)" }}>
                          <span className="flex items-center gap-1.5"><Calendar size={11} />{reg.competition_date || reg.competitionDate}</span>
                          <span className="flex items-center gap-1.5"><MapPin size={11} />{reg.competition_venue || reg.competitionVenue}</span>
                          <span className="font-semibold mt-1" style={{ color: "#F472B6" }}>Category: {reg.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => approved && openPass(reg, "registration")}
                        disabled={!approved}
                        className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold transition-all border-t disabled:opacity-40"
                        style={{
                          borderColor: "rgba(255,255,255,0.06)",
                          background: approved ? "rgba(219,39,119,0.05)" : "transparent",
                          color: approved ? "#F472B6" : "rgba(148,163,184,0.3)",
                          cursor: approved ? "pointer" : "not-allowed",
                        }}>
                        <QrCode size={13} />
                        {approved ? "View Competitor Pass" : "Awaiting Approval"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel py-16 text-center rounded-2xl">
                <Trophy size={36} className="mx-auto mb-3" style={{ color: "rgba(148,163,184,0.2)" }} />
                <p className="text-sm" style={{ color: "rgba(148,163,184,0.4)" }}>No competition registrations yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-primary)" }}>
              <Settings size={20} style={{ color: "#818CF8" }} /> Account Settings
            </h2>

            <form onSubmit={handleProfileUpdate} className="glass-panel p-6 md:p-8 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-5"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(248,250,252,0.9))" }}>
              {settingsSuccess && (
                <div className="md:col-span-2 p-3.5 rounded-xl flex items-center gap-2 text-sm"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#059669" }}>
                  <CheckCircle size={15} /> Profile updated successfully!
                </div>
              )}

              {[
                { label: "Full Name", value: name, set: setName, type: "text", span: true },
                { label: "Mobile Number", value: mobile, set: setMobile, type: "tel" },
                { label: "Organization / College", value: organization, set: setOrganization, type: "text" },
                { label: "City", value: city, set: setCity, type: "text" },
                { label: "State", value: stateVal, set: setStateVal, type: "text" },
              ].map(f => (
                <div key={f.label} className={f.span ? "md:col-span-2" : ""}>
                  <label className="form-label">{f.label}</label>
                  <input type={f.type} className="form-input" value={f.value} onChange={e => f.set(e.target.value)} />
                </div>
              ))}

              <div className="md:col-span-2 pt-2">
                <button type="submit" disabled={isSaving} className="btn btn-primary px-8 py-3.5 text-sm font-bold">
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>

            {/* Admin quick-link if admin */}
            <div className="glass-panel p-4 rounded-xl flex items-center gap-3"
              style={{ background: "rgba(79,70,229,0.04)", border: "1px solid rgba(99,102,241,0.1)" }}>
              <AlertCircle size={16} style={{ color: "#818CF8" }} />
              <p className="text-xs" style={{ color: "rgba(100,116,139,0.8)" }}>
                If you have admin access, visit{" "}
                <a href="/admin" className="font-bold underline" style={{ color: "#4F46E5" }}>/admin</a>{" "}
                to manage the platform.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
