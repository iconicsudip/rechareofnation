"use client";

import { useState, useEffect } from "react";
import { Award, Mail, Building, Phone, User, CheckCircle, HelpCircle } from "lucide-react";
import { ApiClient, Sponsor } from "@/lib/api-client";

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  // Sponsor Form States
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tierInterest, setTierInterest] = useState("Gold Tier Partner");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchSponsors = async () => {
      const data = await ApiClient.getSponsors();
      setSponsors(data);
    };
    fetchSponsors();
  }, []);

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await ApiClient.submitSponsorForm({
      companyName,
      contactPerson,
      email,
      phone,
      tierInterest,
      message
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
    setCompanyName("");
    setContactPerson("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  const sponsorTiers = ["Title", "Platinum", "Gold", "Partner", "Media"];

  return (
    <div className="container py-20 md:py-24 flex flex-col gap-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-3">
        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Collaboration</span>
        <h1 className="text-4xl md:text-5xl font-black font-primary text-white">Our Sponsors & Partners</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Recharge Nation events connect brands with thousands of students, artists, professionals, and corporate leaders across metropolitan cities.
        </p>
      </div>

      {/* Tiers Grid */}
      <div className="flex flex-col gap-10">
        {sponsorTiers.map((tier) => {
          const tierSponsors = sponsors.filter(s => s.tier === tier);
          if (tierSponsors.length === 0) return null;
          
          return (
            <div key={tier} className="flex flex-col items-center gap-6 border-b border-[rgba(255,255,255,0.04)] pb-10 last:border-0">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 font-primary">
                {tier} Sponsors
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-8">
                {tierSponsors.map((sp) => (
                  <a 
                    key={sp.id} 
                    href={sp.websiteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="glass-panel px-8 py-5 border-[rgba(255,255,255,0.06)] hover:border-cyan-400/40 text-center font-bold text-sm text-white font-primary min-w-[160px] bg-slate-950/20"
                  >
                    {sp.name}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sponsor Benefits & Enquiry Form Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
        {/* Left Column: Benefits */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-primary">Why Sponsor Us?</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Gain unmatched brand placement across digital channels and dynamic on-ground spaces. Our demographic scale ensures direct target engagement.
          </p>

          <div className="flex flex-col gap-4 mt-2">
            {[
              { title: "Brand Placement", desc: "Display logo on national banners, website listing, schedules, and official entry passes." },
              { title: "Lead Generation", desc: "Setup dedicated expo stalls, interact with visitors, collect registrations, and pitch products." },
              { title: "Corporate Networking", desc: "Access the VIP conference lounges and attend invite-only corporate dinner panels." },
              { title: "Student Outreach", desc: "Connect with thousands of students, fresh developers, artists, and creators from top colleges." }
            ].map((b, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-xl border-[rgba(255,255,255,0.06)] flex items-start gap-4">
                <span className="text-cyan-400 font-bold text-sm shrink-0">0{idx + 1}.</span>
                <div>
                  <h4 className="font-bold text-white text-sm font-primary">{b.title}</h4>
                  <p className="text-gray-500 text-xs mt-1 leading-normal">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl border-indigo-500/15 bg-gradient-to-b from-gray-900 to-indigo-950/20">
          <h3 className="text-xl font-bold text-white font-primary mb-2">Become a Partner</h3>
          <p className="text-gray-400 text-xs mb-6">Submit an enquiry and our corporate alliances team will connect with a pitch proposal deck.</p>

          {isSubmitted ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-center flex flex-col items-center gap-3">
              <CheckCircle size={32} />
              <h4 className="font-bold font-primary text-sm">Enquiry Submitted!</h4>
              <p className="text-xs">A simulated confirmation mail has been triggered via SMTP. Our representative will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSponsorSubmit} className="flex flex-col gap-4 text-left">
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3.5 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Enter company name" 
                    className="form-input w-full pl-10"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Contact Person *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Representative name" 
                    className="form-input w-full pl-10"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Corporate Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-gray-500" size={16} />
                    <input 
                      type="email" 
                      placeholder="corporate@company.com" 
                      className="form-input w-full pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-gray-500" size={16} />
                    <input 
                      type="tel" 
                      placeholder="99999 88888" 
                      className="form-input w-full pl-10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Sponsorship tier of Interest</label>
                <select 
                  className="form-select"
                  value={tierInterest}
                  onChange={(e) => setTierInterest(e.target.value)}
                >
                  <option value="Title Sponsor">Title Sponsor Pass</option>
                  <option value="Platinum Tier Partner">Platinum Tier Partner</option>
                  <option value="Gold Tier Partner">Gold Tier Partner</option>
                  <option value="Associate Partner">Associate Partner</option>
                  <option value="Exhibition Stall Vendor">Exhibition Stall Vendor</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Message / Details</label>
                <textarea 
                  placeholder="Outline your sponsorship goals or specific event interest..." 
                  className="form-input h-24 resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full py-3.5 mt-2 font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Send Sponsor Request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
