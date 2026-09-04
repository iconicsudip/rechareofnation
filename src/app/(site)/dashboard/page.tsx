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
  scanHistory?: any[];
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
  const accent = pass.type === "ticket" ? "pink" : "indigo";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[28px] overflow-hidden relative bg-white border border-slate-200/80 shadow-2xl">

        {/* Header stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-pink-500 to-cyan-500" />

        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
          <X size={15} />
        </button>

        <div className="p-6 flex flex-col items-center gap-4 text-center">
          <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${
            accent === "pink"
              ? "bg-pink-50 border-pink-200 text-pink-600"
              : "bg-indigo-50 border-indigo-200 text-indigo-600"
          }`}>
            {pass.type === "ticket" ? "🎫 Event Entry Pass" : "🏆 Competitor ID Pass"}
          </span>

          <div>
            <h4 className="text-lg font-extrabold text-slate-900 font-primary">{pass.name}</h4>
            <p className="text-xs mt-1 text-slate-400">
              {pass.type === "ticket" ? `Ref: ${pass.ref}` : `ID: ${pass.ref}`}
            </p>
          </div>

          {/* Real QR Code */}
          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <QRImage value={pass.qrHash} size={160} />
          </div>

          <div className="w-full text-xs flex flex-col gap-2.5 pt-2 border-t border-slate-100">
            {[
              ["Pass Type", pass.ticketType || pass.category || "—"],
              ["Date", pass.eventDate || "—"],
              ["Venue", pass.venue || "—"],
              ["Status", pass.status],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-slate-400">{label}</span>
                <span className={`font-bold ${label === "Status" && (val === "confirmed" || val === "approved") ? "text-emerald-600" : "text-slate-900"}`}>
                  {val}
                </span>
              </div>
            ))}
          </div>

          {pass.scanHistory && pass.scanHistory.length > 0 && (
            <div className="w-full mt-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 text-left">Completed Stages</span>
              <div className="flex flex-col gap-1.5 text-xs text-emerald-700 text-left">
                {pass.scanHistory.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle size={12} />
                    <span>{s.stageName || s.stageId} ({new Date(s.timestamp).toLocaleTimeString()})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => window.print()}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-primary cursor-pointer transition-all shadow-md">
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
      scanHistory: item.scan_history || [],
    });
  };

  const handleLogout = () => { ApiClient.logoutUser(); router.push("/"); };

  if (!currentUser) return (
    <div className="min-h-screen bg-[#f8fafc] container py-20 text-center text-sm text-slate-400">
      Authenticating...
    </div>
  );

  const TAB_ITEMS: { key: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { key: "tickets", label: "My Tickets", icon: Ticket, count: bookings.length },
    { key: "registrations", label: "Registrations", icon: Trophy, count: registrations.length },
    { key: "settings", label: "Settings", icon: Settings, count: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-secondary text-slate-800 container py-20 md:py-24 flex flex-col lg:flex-row gap-8">
      {selectedPass && <PassModal pass={selectedPass} onClose={() => setSelectedPass(null)} />}

      {/* Left: Profile + tabs */}
      <div className="lg:w-72 flex flex-col gap-4 flex-shrink-0">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6 flex flex-col gap-4 text-center">
          <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto font-black text-2xl text-white bg-gradient-to-br from-indigo-600 to-pink-600 font-primary">
            {currentUser.name.charAt(0).toUpperCase()}
            {currentUser.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500">
                <CheckCircle size={11} className="text-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-primary">{currentUser.name}</h3>
            <span className="text-xs block mt-0.5 text-slate-400">{currentUser.email}</span>
            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
              <Shield size={9} /> {currentUser.isVerified ? "Verified" : "Unverified"}
            </span>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div className="rounded-xl p-2.5 text-center bg-pink-50 border border-pink-100">
              <div className="text-lg font-black text-slate-900 font-primary">{bookings.length}</div>
              <div className="text-[10px] text-slate-400">Tickets</div>
            </div>
            <div className="rounded-xl p-2.5 text-center bg-indigo-50 border border-indigo-100">
              <div className="text-lg font-black text-slate-900 font-primary">{registrations.length}</div>
              <div className="text-[10px] text-slate-400">Registered</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-2 flex flex-col gap-1">
          {TAB_ITEMS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-3 p-3.5 text-sm font-semibold rounded-xl text-left transition-all font-primary cursor-pointer border ${
                activeTab === t.key
                  ? "bg-indigo-50 border-indigo-200 text-slate-900"
                  : "bg-transparent border-transparent text-slate-500 hover:bg-slate-50"
              }`}>
              <t.icon size={16} className={activeTab === t.key ? "text-indigo-600" : "text-slate-400"} />
              <span>{t.label}</span>
              {t.count > 0 && (
                <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600">{t.count}</span>
              )}
            </button>
          ))}

          <div className="border-t border-slate-100 my-1" />

          <button onClick={loadData.bind(null, currentUser)}
            className="flex items-center gap-3 p-3.5 text-sm font-semibold rounded-xl text-left transition-all font-primary cursor-pointer text-slate-500 hover:bg-slate-50">
            <RefreshCw size={15} className="text-slate-400" />
            Refresh Data
          </button>

          <button onClick={handleLogout}
            className="flex items-center gap-3 p-3.5 text-sm font-semibold rounded-xl text-left transition-all font-primary cursor-pointer text-rose-500 hover:bg-rose-50">
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
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-primary">
                <Ticket size={20} className="text-pink-600" /> My Booked Tickets
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-pink-50 border border-pink-200 text-pink-600">
                {bookings.length} passes
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => <div key={i} className="h-48 rounded-2xl animate-pulse bg-slate-100" />)}
              </div>
            ) : bookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((b) => (
                  <div key={b.id || b.bookingRef} className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div className="flex justify-between items-start gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          REF: {b.booking_ref || b.bookingRef}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded uppercase font-bold bg-emerald-50 border border-emerald-200 text-emerald-600">
                          {b.status || "confirmed"}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm font-primary">
                        {b.event_name || b.eventName}
                      </h4>
                      <div className="flex flex-col gap-1.5 text-xs mt-1 text-slate-500">
                        <span className="flex items-center gap-1.5"><Calendar size={11} />{b.event_date || b.eventDate}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={11} />{b.event_venue || b.eventVenue}</span>
                        <span className="font-semibold mt-1 text-pink-600">
                          {b.ticket_type || b.ticketType} × {b.quantity}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => openPass(b, "ticket")}
                      className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold transition-colors border-t border-slate-100 bg-pink-50 hover:bg-pink-100 text-pink-600 cursor-pointer">
                      <QrCode size={13} /> View QR Pass
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm py-16 text-center">
                <Ticket size={36} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-400">No tickets booked yet.</p>
              </div>
            )}
          </div>
        )}

        {/* My Registrations */}
        {activeTab === "registrations" && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-primary">
                <Trophy size={20} className="text-indigo-600" /> Competition Registrations
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-indigo-50 border border-indigo-200 text-indigo-600">
                {registrations.length} entries
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => <div key={i} className="h-48 rounded-2xl animate-pulse bg-slate-100" />)}
              </div>
            ) : registrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registrations.map((reg) => {
                  const approved = reg.status === "approved";
                  return (
                    <div key={reg.id || reg.participantId} className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <div className="flex justify-between items-start gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            ID: {reg.participant_id || reg.participantId}
                          </span>
                          <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold border ${
                            approved
                              ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                              : "text-amber-600 bg-amber-50 border-amber-200"
                          }`}>
                            {reg.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm font-primary">
                          {reg.competition_name || reg.competitionName}
                        </h4>
                        <div className="flex flex-col gap-1.5 text-xs mt-1 text-slate-500">
                          <span className="flex items-center gap-1.5"><Calendar size={11} />{reg.competition_date || reg.competitionDate}</span>
                          <span className="flex items-center gap-1.5"><MapPin size={11} />{reg.competition_venue || reg.competitionVenue}</span>
                          <span className="font-semibold mt-1 text-indigo-600">Category: {reg.category}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => approved && openPass(reg, "registration")}
                        disabled={!approved}
                        className={`w-full py-3 flex items-center justify-center gap-2 text-xs font-bold transition-colors border-t border-slate-100 disabled:opacity-40 ${
                          approved
                            ? "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 cursor-pointer"
                            : "bg-transparent text-slate-400 cursor-not-allowed"
                        }`}>
                        <QrCode size={13} />
                        {approved ? "View Competitor Pass" : "Awaiting Approval"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm py-16 text-center">
                <Trophy size={36} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm text-slate-400">No competition registrations yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-primary">
              <Settings size={20} className="text-indigo-600" /> Account Settings
            </h2>

            <form onSubmit={handleProfileUpdate} className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              {settingsSuccess && (
                <div className="md:col-span-2 p-3.5 rounded-xl flex items-center gap-2 text-sm bg-emerald-50 border border-emerald-200 text-emerald-600">
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
                <div key={f.label} className={`flex flex-col gap-1.5 ${f.span ? "md:col-span-2" : ""}`}>
                  <label className="text-xs font-bold text-slate-600">{f.label}</label>
                  <input
                    type={f.type}
                    className="w-full text-sm rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:ring-1 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                  />
                </div>
              ))}

              <div className="md:col-span-2 pt-2">
                <button type="submit" disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-8 py-3.5 text-sm font-bold font-primary cursor-pointer transition-colors">
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>

            {/* Admin quick-link if admin */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={16} className="text-indigo-600" />
              <p className="text-xs text-slate-600">
                If you have admin access, visit{" "}
                <a href="/admin" className="font-bold underline text-indigo-600 hover:text-indigo-700">/admin</a>{" "}
                to manage the platform.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
