"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Calculator, 
  Check, 
  Shield, 
  Building, 
  User, 
  Mail, 
  CheckCircle,
  ExternalLink,
  ArrowUpRight,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { ApiClient } from "@/lib/api-client";

interface TierData {
  name: string;
  price: number;
  baseImpressions: number;
  space: string;
  allotments: string;
  entitlements: string[];
  placements: string;
}

const TIERS: Record<string, TierData> = {
  TITLE: {
    name: "Title Sponsor",
    price: 2500000,
    baseImpressions: 5200000,
    space: "300 sq.ft Premium Front-Center Trackside Pavilion",
    allotments: "40 Full Pass Badges",
    entitlements: [
      "Exclusive category rights (No competitor brands allowed)",
      "Live onstage representative keynote greeting (2 mins)",
      "Push notifications to all 2,00,000+ app users during event"
    ],
    placements: "All Main Stage banners, Official App Splash Screen, Co-branded National PR & Media coverage"
  },
  PLATINUM: {
    name: "Platinum Partner",
    price: 1500000,
    baseImpressions: 3000000,
    space: "200 sq.ft Premium Trackside Pavilion",
    allotments: "25 Full Pass Badges",
    entitlements: [
      "Co-branding on official credentials and lanyards",
      "15-second promo video broadcast during main stage transitions",
      "Dedicated sponsor booth in high-traffic exhibition hall"
    ],
    placements: "Premium App Banner, Main Stage Side Banners, Co-branded PR & Media coverage"
  },
  GOLD: {
    name: "Gold Partner",
    price: 800000,
    baseImpressions: 1500000,
    space: "100 sq.ft Trackside Pavilion",
    allotments: "12 Full Pass Badges",
    entitlements: [
      "Logo on general ticketing page and email confirmations",
      "Social media shout-out and dedicated brand story coverage",
      "Standard expo booth with electric & Wi-Fi support"
    ],
    placements: "General Category Banners, App Partner Section, Standard PR & Media coverage"
  },
  ASSOCIATE: {
    name: "Associate Partner",
    price: 400000,
    baseImpressions: 700000,
    space: "50 sq.ft Shared Pavilion",
    allotments: "6 Full Pass Badges",
    entitlements: [
      "Logo on all official co-branded marketing materials",
      "In-app sponsor directory inclusion",
      "Distribution of corporate flyers in visitor goodie bags"
    ],
    placements: "App Partner Section, Shared Banners, Standard PR & Media coverage"
  }
};

export default function SponsorsPage() {
  // Forecaster state
  const [selectedTier, setSelectedTier] = useState<"TITLE" | "PLATINUM" | "GOLD" | "ASSOCIATE">("TITLE");
  const [footfallMultiplier, setFootfallMultiplier] = useState<number>(1.0); // ranges from 0.5 to 2.5

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [tierInterest, setTierInterest] = useState("Gold Sponsor Package");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Formatting helper for currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Call API client with pre-defined requirements
    await ApiClient.submitSponsorForm({
      companyName,
      contactPerson,
      email,
      phone: "+91 00000 00000", // Dummy fallback for required schema field
      tierInterest,
      message: `B2B Request Custom Proposal Pitch for ${tierInterest}.`
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
    setCompanyName("");
    setContactPerson("");
    setEmail("");
  };

  const currentTierInfo = TIERS[selectedTier];
  const calculatedImpressions = Math.round(currentTierInfo.baseImpressions * footfallMultiplier);
  const calculatedCPM = (currentTierInfo.price / calculatedImpressions) * 1000;

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] py-12">
      <div className="container max-w-7xl mx-auto px-4 flex flex-col gap-12">
        
        {/* HERO SECTION */}
        <div className="relative w-full rounded-3xl bg-gradient-to-br from-[#070b19] via-[#0b1026] to-[#050711] border border-slate-800 p-8 md:p-12 text-white overflow-hidden shadow-2xl">
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col gap-6 max-w-4xl">
            {/* Sparkle badge */}
            <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-4 py-1.5 rounded-full w-fit">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-[10px] md:text-xs font-semibold tracking-wider text-pink-500 uppercase">
                Brand Alignment & Ecosystem Expansion
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-primary leading-tight tracking-tight">
              CATALYZING INDIA&apos;S{" "}
              <span className="text-pink-500">LIVE &</span>{" "}
              <span className="bg-gradient-to-r from-pink-500 via-indigo-400 to-transparent bg-clip-text text-transparent opacity-80">
                EXPERIENTIAL
              </span>{" "}
              MARKETS
            </h1>

            {/* Description */}
            <p className="text-slate-400 text-sm md:text-base leading-relaxed font-secondary max-w-3xl">
              Recharge Nation is proud to collaborate with industry-leading corporate brands driving 
              technological development, sustainability, and cultural preservation. Together, we power 
              secure smart admissions, high-speed regional networking, and luxury handloom revival 
              across South Asia.
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-slate-800 my-4" />

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-secondary">Total Audience Reach</p>
                <p className="text-lg md:text-2xl font-black font-primary mt-1 text-white">15 Lakhs+</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-secondary">Allied Brands</p>
                <p className="text-lg md:text-2xl font-black font-primary mt-1 text-white">50+ Active</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-secondary">Weaver Payouts</p>
                <p className="text-lg md:text-2xl font-black font-primary mt-1 text-white">₹85,00,000+</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-secondary">Gate Transits</p>
                <p className="text-lg md:text-2xl font-black font-primary mt-1 text-white">99.98% Smooth</p>
              </div>
            </div>
          </div>
        </div>

        {/* ROI FORECASTER SECTION */}
        <div className="w-full bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 md:p-10 relative overflow-hidden bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] [background-size:24px_24px]">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-pink-500" />
                <span className="text-[10px] md:text-xs font-bold tracking-widest text-pink-500 uppercase">
                  Sponsor ROI Forecaster
                </span>
              </div>
              <h2 className="text-xl md:text-3xl font-black font-primary text-slate-900 uppercase">
                Estimate Your Brand Value
              </h2>
              <p className="text-slate-500 text-xs md:text-sm">
                Select a category tier below to preview exact physical, digital, and media marketing entitlements.
              </p>
            </div>

            {/* Selector Pills */}
            <div className="flex flex-wrap gap-2">
              {(["TITLE", "PLATINUM", "GOLD", "ASSOCIATE"] as const).map((tierKey) => (
                <button
                  key={tierKey}
                  onClick={() => setSelectedTier(tierKey)}
                  className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${
                    selectedTier === tierKey
                      ? "bg-[#0c1222] text-white shadow-md relative overflow-hidden after:absolute after:inset-0 after:bg-[radial-gradient(#ffffff_1px,transparent_1px)] after:[background-size:8px_8px] after:opacity-10"
                      : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {tierKey}
                </button>
              ))}
            </div>
          </div>

          {/* Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
            {/* Left Content (Slider + Metric Cards) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Slider Container */}
              <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs md:text-sm font-bold text-slate-700">
                    Projected Crowd Footfall Multiplier
                  </span>
                  <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                    {Math.round(footfallMultiplier * 100)}% Capacity
                  </span>
                </div>
                
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={footfallMultiplier}
                  onChange={(e) => setFootfallMultiplier(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500 mb-2 focus:outline-none"
                />
                
                <p className="text-[11px] text-slate-400">
                  Simulate maximum brand exposure based on surge capacities during grand finale weekends.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Impressions */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-secondary">Estimated Brand Impressions</p>
                  <p className="text-xl md:text-2xl font-black font-primary text-slate-800">
                    {formatCurrency(calculatedImpressions)} +
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2 font-secondary">
                    Guaranteed digital, ticket PDF, app, and trackside views.
                  </p>
                </div>

                {/* CPM */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-secondary">Implied Cost Per Thousand (CPM)</p>
                  <p className="text-xl md:text-2xl font-black font-primary text-pink-500">
                    ₹{calculatedCPM.toFixed(1)} CPM
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2 font-secondary">
                    Extremely low acquisition cost compared to traditional media.
                  </p>
                </div>

                {/* Space */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-secondary">Physical Experience Space</p>
                  <p className="text-sm md:text-base font-black font-primary text-slate-800 line-clamp-2">
                    {currentTierInfo.space}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2 font-secondary">
                    Complimentary electrical, Wi-Fi, and brand banner backdrops.
                  </p>
                </div>

                {/* Allotments */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-secondary">VVIP / Delegate Allotments</p>
                  <p className="text-sm md:text-base font-black font-primary text-slate-800">
                    {currentTierInfo.allotments}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2 font-secondary">
                    Includes complete catering, direct forward lounge access & Pit access.
                  </p>
                </div>

              </div>

            </div>

            {/* Right Card: Tier Summary */}
            <div className="bg-slate-50 border border-slate-105 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-secondary">Tier Value Envelope</p>
                  <h3 className="text-xl md:text-2xl font-black font-primary text-slate-800 mt-1 uppercase">
                    {currentTierInfo.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl md:text-3xl font-black font-primary text-pink-500">
                      ₹{formatCurrency(currentTierInfo.price)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-secondary">INR + GST</span>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-200" />

                <div className="flex flex-col gap-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-secondary">Premium Activation Entitlements</p>
                  <ul className="flex flex-col gap-3">
                    {currentTierInfo.entitlements.map((ent, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-slate-600 items-start font-secondary">
                        <div className="w-4 h-4 rounded-full bg-pink-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-pink-500" />
                        </div>
                        <span className="leading-snug">{ent}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <a
                  href="#enlist"
                  className="w-full bg-[#0c1222] text-white py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 font-primary font-bold text-xs tracking-wider uppercase hover:bg-slate-800 transition-colors shadow-md relative overflow-hidden after:absolute after:inset-0 after:bg-[radial-gradient(#ffffff_1px,transparent_1px)] after:[background-size:8px_8px] after:opacity-10"
                >
                  Enquire for {selectedTier.toLowerCase()} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Placement Alert */}
          <div className="w-full mt-8 bg-[#0c1222] text-white rounded-2xl p-4 flex items-center gap-3 border border-slate-800 shadow-lg relative overflow-hidden after:absolute after:inset-0 after:bg-[radial-gradient(#ffffff_1px,transparent_1px)] after:[background-size:12px_12px] after:opacity-5">
            <div className="w-8 h-8 bg-pink-500/10 rounded-full flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-pink-500" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
              <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest font-primary">
                Major Placements & Media Coverage
              </span>
              <span className="hidden md:inline text-slate-700">|</span>
              <span className="text-xs text-slate-300 font-secondary leading-snug">
                {currentTierInfo.placements}
              </span>
            </div>
          </div>

        </div>

        {/* SHOWCASE SECTION */}
        <div className="flex flex-col gap-12 py-6 font-secondary">
          
          {/* Section Title block */}
          <div className="text-left pb-4 border-b border-slate-200/60 w-full">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 font-primary uppercase tracking-tight">
              Allied Brand Patrons
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Connect with our title sponsors, strategic brand partners, and commercial alliances.
            </p>
          </div>
               {/* Title Sponsor Showcase */}
          <div className="flex flex-col items-start gap-4">
            <div className="text-left w-full max-w-7xl">
              <h3 className="text-[10.5px] font-primary font-bold uppercase tracking-widest text-slate-400">
                Grand Title Sponsor
              </h3>
            </div>
                   {/* Tata Motors EV Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl flex flex-col sm:flex-row overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 max-w-7xl w-full">
              <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0 bg-slate-50">
                <img 
                  src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80" 
                  alt="Tata Motors EV"
                  className="w-full h-full object-cover"
                />
                {/* Badge overlay inside image */}
                <span className="bg-indigo-600 text-white px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded-md absolute top-3 left-3">
                  TITLE SPONSOR
                </span>
                {/* Active Indicator dot */}
                <div className="absolute top-3 right-3 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-md" />
              </div>
              
              <div className="p-5 flex flex-col justify-between flex-1 text-center sm:text-left gap-2.5">
                <div className="flex flex-col gap-1">
                  <span className="text-pink-500 font-primary text-[9px] tracking-wider uppercase font-bold flex items-center justify-center sm:justify-start gap-1">
                    <span>⌖</span> Automotive
                  </span>
                  <h4 className="text-base font-black text-slate-900 font-primary uppercase leading-snug">
                    TATA MOTORS EV
                  </h4>
                  <p className="text-slate-555 text-xs leading-relaxed font-secondary">
                    Driving India&apos;s green transit with cutting-edge clean electric mobility solutions.
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100/60">
                  <div className="flex flex-col text-left">
                    <span className="text-[8px] font-primary font-bold tracking-widest text-slate-400 uppercase">Sponsor Tier</span>
                    <span className="text-xs font-black text-slate-900 font-primary mt-0.5">Grand Title</span>
                  </div>
                  <a 
                    href="https://tatamotors.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#0c1222] hover:bg-slate-850 text-white font-primary font-bold text-[10px] tracking-wider uppercase px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    VISIT SITE
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Platinum Showcase */}
          <div className="flex flex-col items-start gap-4 w-full">
            <div className="text-left w-full max-w-7xl mx-auto">
              <h3 className="text-[10.5px] font-primary font-bold uppercase tracking-widest text-slate-400">
                Platinum Alliance Patrons
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-7xl mx-auto">
              {/* Airtel Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl flex flex-col sm:flex-row overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full">
                <div className="relative w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-slate-50">
                  <img 
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80" 
                    alt="Airtel 5G Plus"
                    className="w-full h-full object-cover"
                  />
                  <span className="bg-indigo-600 text-white px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded-md absolute top-3 left-3">
                    PLATINUM
                  </span>
                </div>
                
                <div className="p-5 flex flex-col justify-between flex-1 text-center sm:text-left gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-pink-500 font-primary text-[9px] tracking-wider uppercase font-bold flex items-center justify-center sm:justify-start gap-1">
                      <span>⌖</span> Telecom
                    </span>
                    <h4 className="text-base font-black text-slate-900 font-primary uppercase leading-snug">
                      AIRTEL 5G PLUS
                    </h4>
                    <p className="text-slate-550 text-xs leading-relaxed font-secondary line-clamp-2">
                      Supercharging experiential connectivity, high-fidelity live streaming, & smart paddock telemetry.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100/60">
                    <div className="flex flex-col text-left">
                      <span className="text-[8px] font-primary font-bold tracking-widest text-slate-400 uppercase">Sponsor Tier</span>
                      <span className="text-xs font-black text-slate-900 font-primary mt-0.5">Platinum</span>
                    </div>
                    <a 
                      href="https://airtel.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#0c1222] hover:bg-slate-855 text-white font-primary font-bold text-[10px] tracking-wider uppercase px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      VISIT SITE
                    </a>
                  </div>
                </div>
              </div>

              {/* Paytm Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl flex flex-col sm:flex-row overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full">
                <div className="relative w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-[#F2F5FB] flex flex-col items-center justify-center text-center p-4">
                  <div className="font-black text-slate-450 font-primary tracking-tighter text-md flex flex-col">
                    <span>Paytm</span>
                    <span className="text-[10px] text-slate-350 tracking-wider font-secondary font-primary">Checkout</span>
                  </div>
                  <span className="bg-indigo-600 text-white px-2.5 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded-md absolute top-3 left-3">
                    PLATINUM
                  </span>
                </div>
                
                <div className="p-5 flex flex-col justify-between flex-1 text-center sm:text-left gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-pink-500 font-primary text-[9px] tracking-wider uppercase font-bold flex items-center justify-center sm:justify-start gap-1">
                      <span>⌖</span> FinTech
                    </span>
                    <h4 className="text-base font-black text-slate-900 font-primary uppercase leading-snug">
                      PAYTM CHECKOUT
                    </h4>
                    <p className="text-slate-555 text-xs leading-relaxed font-secondary line-clamp-2">
                      Securing millions of instant ledger transfers for frictionless track and gate checkouts.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100/60">
                    <div className="flex flex-col text-left">
                      <span className="text-[8px] font-primary font-bold tracking-widest text-slate-400 uppercase">Sponsor Tier</span>
                      <span className="text-xs font-black text-slate-900 font-primary mt-0.5">Platinum</span>
                    </div>
                    <a 
                      href="https://paytm.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#0c1222] hover:bg-slate-855 text-white font-primary font-bold text-[10px] tracking-wider uppercase px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      VISIT SITE
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gold and Associate Side-by-Side Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl mx-auto">
            {/* Gold Sponsor Block */}
            <div className="flex flex-col items-start gap-4 w-full">
              <div className="text-left w-full">
                <h3 className="text-[10.5px] font-primary font-bold uppercase tracking-widest text-slate-400">
                  Gold Event Sponsors
                </h3>
              </div>
              
              <div className="bg-white border border-slate-200/80 rounded-3xl flex flex-col sm:flex-row overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full h-fit">
                <div className="relative w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-slate-50">
                  <img 
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80" 
                    alt="Reliance Trends"
                    className="w-full h-full object-cover"
                  />
                  <span className="bg-indigo-600 text-white px-2.5 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded-md absolute top-3 left-3">
                    GOLD
                  </span>
                </div>
                
                <div className="p-5 flex flex-col justify-between flex-1 text-center sm:text-left gap-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-pink-500 font-primary text-[9px] tracking-wider uppercase font-bold flex items-center justify-center sm:justify-start gap-1">
                      <span>⌖</span> Retail
                    </span>
                    <h4 className="text-base font-black text-slate-900 font-primary leading-tight">
                      Reliance Trends
                    </h4>
                    <p className="text-slate-550 text-xs leading-relaxed font-secondary line-clamp-2">
                      Connecting modern demographics with premium fashion collections across India&apos;s cities.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100/60">
                    <div className="flex flex-col text-left">
                      <span className="text-[8px] font-primary font-bold tracking-widest text-slate-400 uppercase">Sponsor Tier</span>
                      <span className="text-xs font-black text-slate-900 font-primary mt-0.5">Gold</span>
                    </div>
                    <a 
                      href="https://trends.ajio.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#0c1222] hover:bg-slate-855 text-white font-primary font-bold text-[10px] tracking-wider uppercase px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      VISIT SITE
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Associate Sponsor Block */}
            <div className="flex flex-col items-start gap-4 w-full">
              <div className="text-left w-full">
                <h3 className="text-[10.5px] font-primary font-bold uppercase tracking-widest text-slate-400">
                  Associate Event Patrons
                </h3>
              </div>

              <div className="flex flex-col gap-4 w-full">
                {/* Bisleri Card */}
                <div className="bg-white border border-slate-200/80 rounded-3xl flex flex-col sm:flex-row overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full">
                  <div className="relative w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-slate-50">
                    <img 
                      src="https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80" 
                      alt="Bisleri Vedica"
                      className="w-full h-full object-cover"
                    />
                    <span className="bg-indigo-600 text-white px-2.5 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded-md absolute top-3 left-3">
                      ASSOCIATE
                    </span>
                  </div>
                  
                  <div className="p-5 flex flex-col justify-between flex-1 text-center sm:text-left gap-2.5">
                    <div className="flex flex-col gap-1">
                      <span className="text-pink-500 font-primary text-[9px] tracking-wider uppercase font-bold flex items-center justify-center sm:justify-start gap-1">
                        <span>⌖</span> F&B
                      </span>
                      <h4 className="text-base font-black text-slate-900 font-primary leading-tight">
                        BISLERI VEDICA
                      </h4>
                      <p className="text-slate-555 text-xs leading-normal line-clamp-1">
                        Premium natural mountain water.
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100/60">
                      <div className="flex flex-col text-left">
                        <span className="text-[8px] font-primary font-bold tracking-widest text-slate-400 uppercase">Sponsor Tier</span>
                        <span className="text-xs font-black text-slate-900 font-primary mt-0.5">Associate</span>
                      </div>
                      <a 
                        href="https://bisleri.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#0c1222] hover:bg-slate-855 text-white font-primary font-bold text-[10px] tracking-wider uppercase px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        VISIT SITE
                      </a>
                    </div>
                  </div>
                </div>

                {/* BookMyShow Card */}
                <div className="bg-white border border-slate-200/80 rounded-3xl flex flex-col sm:flex-row overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full">
                  <div className="relative w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-slate-50">
                    <img 
                      src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80" 
                      alt="BookMyShow"
                      className="w-full h-full object-cover"
                    />
                    <span className="bg-indigo-600 text-white px-2.5 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded-md absolute top-3 left-3">
                      ASSOCIATE
                    </span>
                  </div>
                  
                  <div className="p-5 flex flex-col justify-between flex-1 text-center sm:text-left gap-2.5">
                    <div className="flex flex-col gap-1">
                      <span className="text-pink-500 font-primary text-[9px] tracking-wider uppercase font-bold flex items-center justify-center sm:justify-start gap-1">
                        <span>⌖</span> Entertainment
                      </span>
                      <h4 className="text-base font-black text-slate-900 font-primary leading-tight">
                        BOOKMYSHOW
                      </h4>
                      <p className="text-slate-555 text-xs leading-normal line-clamp-1">
                        Online movie and event tickets.
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100/60">
                      <div className="flex flex-col text-left">
                        <span className="text-[8px] font-primary font-bold tracking-widest text-slate-400 uppercase">Sponsor Tier</span>
                        <span className="text-xs font-black text-slate-900 font-primary mt-0.5">Associate</span>
                      </div>
                      <a 
                        href="https://bookmyshow.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#0c1222] hover:bg-slate-855 text-white font-primary font-bold text-[10px] tracking-wider uppercase px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        VISIT SITE
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ENLIST YOUR BRAND FORM SECTION */}
        <div id="enlist" className="w-full rounded-3xl bg-gradient-to-br from-[#0c1328] via-[#090d1f] to-[#04060d] border border-slate-800 p-8 md:p-12 text-white overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/5 rounded-full blur-[100px]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            {/* Left Side: Information */}
            <div className="flex flex-col gap-6 text-left font-secondary">
              <span className="text-[10px] md:text-xs font-bold tracking-widest text-[#FF0055] uppercase font-secondary">
                B2B Co-Creation & Media
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-primary tracking-tight">
                ENLIST YOUR BRAND
              </h2>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-md">
                Gain premier brand recall and highly localized exposure to massive energetic audiences. We offer physical experiential stalls, interactive app integrations, visual custom stage banners, and direct category sponsorships.
              </p>
              
              <ul className="flex flex-col gap-4 mt-2 font-primary text-xs text-slate-350">
                <li className="flex gap-2 items-center">
                  <span>✓</span>
                  <span>Access over 2,00,000+ highly active demographics</span>
                </li>
                <li className="flex gap-2 items-center">
                  <span>✓</span>
                  <span>Custom physical experiential display zones</span>
                </li>
                <li className="flex gap-2 items-center">
                  <span>✓</span>
                  <span>Live app telemetry-integrated promotional badges</span>
                </li>
              </ul>
            </div>

            {/* Right Side: Form */}
            <div className="bg-[#070b14] border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-inner relative overflow-hidden">
              
              {isSubmitted ? (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold font-primary text-lg text-white">Proposal Pitch Requested!</h4>
                  <p className="text-slate-400 text-xs max-w-sm font-secondary">
                    A simulated confirmation mail has been triggered. Our brand alliances team will contact you with a customized proposal deck.
                  </p>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs text-pink-500 hover:text-pink-400 underline font-bold mt-2 cursor-pointer font-primary"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSponsorSubmit} className="flex flex-col gap-5 text-left font-secondary">
                  {/* Company Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-primary tracking-widest text-slate-400 uppercase font-bold">
                      Company / Brand Entity
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Jio Infocomm Ltd"
                      className="w-full bg-[#0d1324] border border-slate-800 rounded-lg py-3 px-4 text-slate-200 text-xs outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Contact Person & Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-primary tracking-widest text-slate-400 uppercase font-bold">
                        Representative Name
                      </label>
                      <input 
                        type="text" 
                        placeholder="Full Name"
                        className="w-full bg-[#0d1324] border border-slate-800 rounded-lg py-3 px-4 text-slate-200 text-xs outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-primary tracking-widest text-slate-400 uppercase font-bold">
                        Official Corporate Email
                      </label>
                      <input 
                        type="email" 
                        placeholder="name@company.com"
                        className="w-full bg-[#0d1324] border border-slate-800 rounded-lg py-3 px-4 text-slate-200 text-xs outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                  </div>

                  {/* Tier interest */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-primary tracking-widest text-slate-400 uppercase font-bold">
                      Tier Level of Interest
                    </label>
                    <div className="relative">
                      <select 
                        className="w-full bg-[#0d1324] border border-slate-800 rounded-lg py-3 pl-4 pr-10 text-slate-300 text-xs outline-none focus:border-pink-500 transition-all appearance-none cursor-pointer"
                        value={tierInterest}
                        onChange={(e) => setTierInterest(e.target.value)}
                      >
                        <option value="Title Sponsor Package">Title Sponsor Package</option>
                        <option value="Platinum Alliance Partner">Platinum Alliance Partner</option>
                        <option value="Gold Sponsor Package">Gold Sponsor Package</option>
                        <option value="Associate Event Patron">Associate Event Patron</option>
                      </select>
                      <div className="absolute right-3 top-3.5 pointer-events-none text-slate-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#FF0055] hover:bg-[#E6004C] text-white font-primary font-bold text-xs tracking-wider uppercase py-3.5 rounded-lg shadow-lg hover:shadow-pink-500/20 active:scale-[0.98] transition-all text-center mt-2 cursor-pointer"
                  >
                    {isSubmitting ? "Sending..." : "Request Custom Proposal Pitch"}
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
