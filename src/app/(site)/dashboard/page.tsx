"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Ticket, Trophy, Settings, LogOut, Download, MapPin, Building, Calendar, Mail, Phone, AlertCircle, CheckCircle } from "lucide-react";
import { ApiClient, TicketBooking, CompetitionRegistration } from "@/lib/api-client";

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookings, setBookings] = useState<TicketBooking[]>([]);
  const [registrations, setRegistrations] = useState<CompetitionRegistration[]>([]);
  const [activeTab, setActiveTab] = useState<"tickets" | "registrations" | "settings">("tickets");
  
  // Settings Form
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [organization, setOrganization] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Modal Pass states
  const [selectedPass, setSelectedPass] = useState<any>(null);
  const [passType, setPassType] = useState<"ticket" | "registration" | null>(null);

  useEffect(() => {
    const user = ApiClient.getCurrentUser();
    if (!user) {
      router.push("/login?redirect=/dashboard");
      return;
    }
    setCurrentUser(user);
    setName(user.name);
    setMobile(user.mobile || "");
    setCity(user.city || "");
    setState(user.state || "");
    setOrganization(user.organization || "");

    // Fetch lists
    setBookings(ApiClient.getBookings());
    setRegistrations(ApiClient.getRegistrations());
  }, [router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    setSettingsSuccess(false);

    const res = await ApiClient.updateUserProfile(currentUser.id, {
      name,
      mobile,
      city,
      state,
      organization
    });

    if (res.success && res.user) {
      setCurrentUser(res.user);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    }
    setIsSaving(false);
  };

  const handleLogout = () => {
    ApiClient.logoutUser();
    router.push("/");
  };

  if (!currentUser) {
    return (
      <div className="container py-20 text-center text-gray-400 text-sm">
        Authenticating session...
      </div>
    );
  }

  return (
    <div className="container py-20 md:py-24 flex flex-col lg:flex-row gap-8">
      {/* Dynamic Pass Modal Overlay */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 relative rounded-2xl border-indigo-500/20 text-left">
            <button 
              onClick={() => setSelectedPass(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            
            <div className="text-center flex flex-col items-center gap-4 py-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full">
                {passType === "ticket" ? "Event Entry Pass" : "Competition ID Pass"}
              </span>
              
              <h4 className="text-xl font-extrabold text-white font-primary">{selectedPass.eventName || selectedPass.competitionName}</h4>
              <p className="text-gray-400 text-xs -mt-2">
                {passType === "ticket" ? `Ref: ${selectedPass.bookingRef}` : `ID: ${selectedPass.participantId}`}
              </p>

              {/* Mock QR */}
              <div className="w-40 h-40 bg-white p-3 rounded-xl flex items-center justify-center shadow-lg my-2">
                <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                  <rect width="25" height="25" fill="black"/>
                  <rect x="75" width="25" height="25" fill="black"/>
                  <rect y="75" width="25" height="25" fill="black"/>
                  <rect x="35" y="35" width="30" height="30" fill="black"/>
                  <rect x="10" y="45" width="15" height="15" fill="black"/>
                  <rect x="45" y="10" width="15" height="15" fill="black"/>
                  <rect x="75" y="75" width="20" height="20" fill="black"/>
                </svg>
              </div>

              <div className="w-full border-t border-[rgba(255,255,255,0.06)] pt-4 text-xs flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Attendee / Name</span>
                  <span className="text-white font-bold">{selectedPass.visitorName || selectedPass.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tier / Category</span>
                  <span className="text-cyan-400 font-bold">{selectedPass.ticketType || selectedPass.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="text-gray-300 font-bold">{selectedPass.eventDate || selectedPass.competitionDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-bold uppercase ${selectedPass.status === "confirmed" || selectedPass.paymentStatus === "paid" ? "text-emerald-400" : "text-yellow-500"}`}>
                    {selectedPass.status || "Pending Verification"}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => typeof window !== "undefined" && window.print()}
                className="btn btn-primary w-full py-3 mt-4 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download size={14} /> Download PDF Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Column: Profile Card & Tabs */}
      <div className="lg:w-1/3 flex flex-col gap-6">
        <div className="glass-panel p-6 rounded-2xl border-indigo-500/15 flex flex-col gap-6 text-center">
          <div className="relative w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto text-white font-black text-2xl font-primary">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-primary">{currentUser.name}</h3>
            <span className="text-xs text-gray-500 block mt-1">{currentUser.email}</span>
            <div className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold uppercase">
              {currentUser.isVerified ? "Verified Account" : "Unverified Account"}
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="glass-panel rounded-2xl overflow-hidden p-2 border-[rgba(255,255,255,0.06)] flex flex-col">
          <button 
            onClick={() => setActiveTab("tickets")}
            className={`flex items-center gap-3 p-4 text-sm font-semibold rounded-xl text-left transition-all ${
              activeTab === "tickets" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Ticket size={18} />
            <span>My Tickets ({bookings.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab("registrations")}
            className={`flex items-center gap-3 p-4 text-sm font-semibold rounded-xl text-left transition-all ${
              activeTab === "registrations" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Trophy size={18} />
            <span>My Registrations ({registrations.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-3 p-4 text-sm font-semibold rounded-xl text-left transition-all ${
              activeTab === "settings" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Settings size={18} />
            <span>Account Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-4 text-sm font-semibold rounded-xl text-left text-pink-400 hover:bg-pink-900/10 transition-all mt-4"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Right Column: Dynamic Panel Content */}
      <div className="lg:w-2/3">
        {/* Tab 1: My Tickets List */}
        {activeTab === "tickets" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold font-primary text-white flex items-center gap-2">
              <Ticket size={24} className="text-cyan-400" /> My Booked Tickets
            </h2>

            {bookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="glass-panel overflow-hidden flex flex-col justify-between h-full hover:border-[rgba(255,255,255,0.12)]">
                    <div className="p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">REF: {booking.bookingRef}</span>
                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold">
                          {booking.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-base font-primary line-clamp-1">{booking.eventName}</h4>
                      
                      <div className="flex flex-col gap-1.5 text-xs text-gray-400 mt-2">
                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {booking.eventDate}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={12} /> {booking.eventVenue}</span>
                        <span className="font-semibold text-cyan-400 mt-1">{booking.ticketType} x {booking.quantity}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setSelectedPass(booking);
                        setPassType("ticket");
                      }}
                      className="w-full bg-[rgba(255,255,255,0.02)] hover:bg-cyan-500 hover:text-white py-3 border-t border-[rgba(255,255,255,0.06)] text-xs font-bold text-center transition-all flex items-center justify-center gap-1"
                    >
                      <Download size={12} /> View & Download Pass
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 glass-panel rounded-2xl border-[rgba(255,255,255,0.06)]">
                <p className="text-gray-400 text-sm">You haven't booked any audience tickets yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Registrations List */}
        {activeTab === "registrations" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold font-primary text-white flex items-center gap-2">
              <Trophy size={24} className="text-cyan-400" /> My Competition Registrations
            </h2>

            {registrations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registrations.map((reg) => (
                  <div key={reg.id} className="glass-panel overflow-hidden flex flex-col justify-between h-full hover:border-[rgba(255,255,255,0.12)]">
                    <div className="p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">ID: {reg.participantId}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${
                          reg.status === "approved" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-500"
                        }`}>
                          {reg.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-base font-primary line-clamp-1">{reg.competitionName}</h4>
                      
                      <div className="flex flex-col gap-1.5 text-xs text-gray-400 mt-2">
                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {reg.competitionDate}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={12} /> {reg.competitionVenue}</span>
                        <span className="font-semibold text-pink-400 mt-1">Category: {reg.category}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setSelectedPass(reg);
                        setPassType("registration");
                      }}
                      className="w-full bg-[rgba(255,255,255,0.02)] hover:bg-cyan-500 hover:text-white py-3 border-t border-[rgba(255,255,255,0.06)] text-xs font-bold text-center transition-all flex items-center justify-center gap-1"
                    >
                      <Download size={12} /> View Participant Pass
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 glass-panel rounded-2xl border-[rgba(255,255,255,0.06)]">
                <p className="text-gray-400 text-sm">You haven't registered for any competitions yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Account Settings */}
        {activeTab === "settings" && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold font-primary text-white flex items-center gap-2">
              <Settings size={24} className="text-cyan-400" /> Account Settings
            </h2>

            <form onSubmit={handleProfileUpdate} className="glass-panel p-6 md:p-8 rounded-2xl border-indigo-500/10 grid grid-cols-1 md:grid-cols-2 gap-5 bg-gradient-to-b from-gray-900 to-indigo-950/20">
              {settingsSuccess && (
                <div className="md:col-span-2 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>Profile settings updated successfully!</span>
                </div>
              )}

              <div className="form-group md:col-span-2">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  value={mobile} 
                  onChange={(e) => setMobile(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">School / College / Organization</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={organization} 
                  onChange={(e) => setOrganization(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={state} 
                  onChange={(e) => setState(e.target.value)} 
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button 
                  type="submit" 
                  className="btn btn-primary px-8 py-3.5 text-sm font-bold"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving Settings..." : "Save Settings Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
