"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Calculator,
  Check,
  Shield,
  Building,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  Trophy,
  Star,
  Maximize2,
  ExternalLink,
  X
} from "lucide-react";
import { ApiClient, Sponsor } from "@/lib/api-client";

interface TierData {
  name: string;
  price: number;
  baseImpressions: number;
  space: string;
  allotments: string;
  entitlements: string[];
  placements: string;
}

interface PartnerLogo { category: string; name: string; logoUrl?: string }

interface FoodExpoSponsorTier {
  no: number;
  rank?: string;
  name: string;
  price: string;
  tag: string;
  desc?: string;
  bg: string;
}

interface FoodExpoConfig {
  exhibitors: string[];
  visitors: string[];
  sponsorshipTiers: FoodExpoSponsorTier[];
  benefits: string[];
  portals: { name: string; url: string }[];
  slogans: { primary: string; motto: string };
  images: { chartPoster: string; sponsorshipPoster: string };
}

interface SponsorsPageContent {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  stats: { label: string; value: string }[];
  enlistEyebrow: string;
  enlistHeading: string;
  enlistDescription: string;
  enlistBullets: string[];
  partners: PartnerLogo[];
}

// Renders a stylized text lockup in place of a broken <img> when a sponsor
// has no logoUrl (e.g. Paytm Checkout) or its logoUrl fails to load. Fully
// self-contained (own background + centering) so it looks right regardless
// of what the parent image-slot container is styled as.
const renderLogoFallback = (name: string) => {
  const words = name.trim().split(/\s+/);
  const firstWord = words[0] || name;
  const restWords = words.slice(1).join(" ");
  return (
    <div className="w-full h-full bg-black/20 flex flex-col items-center justify-center text-center p-4">
      <span className="font-black text-[var(--text-muted)] font-primary tracking-tighter text-md">{firstWord}</span>
      {restWords && (
        <span className="text-[10px] text-[var(--text-muted)] tracking-wider font-secondary font-primary">
          {restWords}
        </span>
      )}
    </div>
  );
};

// A sponsor.logoUrl being set doesn't guarantee the URL still resolves to an
// image (dead/moved hosting, revoked hotlink, etc.) — a plain `logoUrl ? <img>
// : fallback` ternary only catches an empty value, not a broken one, so a bad
// URL rendered a broken-image icon with the alt text overlapping the tier
// badge. This tracks the actual load result and swaps to the text fallback
// on error.
function SponsorLogo({ logoUrl, name }: { logoUrl?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!logoUrl || failed) return renderLogoFallback(name);
  return (
    <div className="w-full h-full bg-white flex items-center justify-center p-5">
      <img
        src={logoUrl}
        alt={name}
        className="max-w-full max-h-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
};

export default function SponsorsPage() {
  // Forecaster state
  const [selectedTier, setSelectedTier] = useState<"TITLE" | "PLATINUM" | "GOLD" | "ASSOCIATE">("TITLE");
  const [footfallMultiplier, setFootfallMultiplier] = useState<number>(1.0); // ranges from 0.5 to 2.5
  const [tiers, setTiers] = useState<Record<string, TierData>>({});

  // Allied Brand Patrons showcase state
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isShowcaseLoading, setIsShowcaseLoading] = useState(true);

  // CMS-driven page copy (hero + enlist panel)
  const [pageContent, setPageContent] = useState<SponsorsPageContent>({
    heroBadge: "", heroTitle: "", heroDescription: "", stats: [],
    enlistEyebrow: "", enlistHeading: "", enlistDescription: "", enlistBullets: [], partners: [],
  });

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [tierInterest, setTierInterest] = useState("Gold Sponsor Package");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showFoodSponsorModal, setShowFoodSponsorModal] = useState(false);
  const [foodExpoConfig, setFoodExpoConfig] = useState<FoodExpoConfig>({
    exhibitors: [], visitors: [], sponsorshipTiers: [], benefits: [],
    portals: [], slogans: { primary: "", motto: "" }, images: { chartPoster: "", sponsorshipPoster: "" },
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsShowcaseLoading(true);
      const [sponsorsData, tiersData, sponsorsPageData, foodExpoData] = await Promise.all([
        ApiClient.getSponsors(),
        ApiClient.getSiteContent<Record<string, TierData>>("sponsorship_tiers"),
        ApiClient.getSiteContent<SponsorsPageContent>("sponsors_page"),
        ApiClient.getSiteContent<FoodExpoConfig>("food_expo_config"),
      ]);
      setSponsors(sponsorsData);
      if (tiersData) setTiers(tiersData);
      if (sponsorsPageData) setPageContent(sponsorsPageData);
      if (foodExpoData && foodExpoData.sponsorshipTiers) setFoodExpoConfig(foodExpoData);
      setIsShowcaseLoading(false);
    };
    fetchData();
  }, []);

  // Group the fetched sponsors by tier for the "Allied Brand Patrons" showcase.
  // Note: the DB tier value for the lower tier is 'Partner', which maps to
  // this page's "Associate" section.
  const titleSponsors = sponsors.filter((s) => s.tier === "Title");
  const platinumSponsors = sponsors.filter((s) => s.tier === "Platinum");
  const goldSponsors = sponsors.filter((s) => s.tier === "Gold");
  const associateSponsors = sponsors.filter((s) => s.tier === "Partner");

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

  const currentTierInfo = tiers[selectedTier] ?? Object.values(tiers)[0];
  const calculatedImpressions = currentTierInfo ? Math.round(currentTierInfo.baseImpressions * footfallMultiplier) : 0;
  const calculatedCPM = currentTierInfo && calculatedImpressions > 0 ? (currentTierInfo.price / calculatedImpressions) * 1000 : 0;

  // Group the "Our Partners & Associates" logo wall by category (Universities,
  // Brands, Institutions, Hospitality Partners, ...) while preserving the
  // order categories first appear in, so the admin controls section order
  // just by row order.
  const partnerCategories: { category: string; partners: PartnerLogo[] }[] = [];
  for (const partner of pageContent.partners ?? []) {
    let group = partnerCategories.find((g) => g.category === partner.category);
    if (!group) {
      group = { category: partner.category, partners: [] };
      partnerCategories.push(group);
    }
    group.partners.push(partner);
  }

  return (
    <div className="w-full min-h-screen py-20 md:py-24">
      <div className="container mx-auto px-4 flex flex-col gap-12">

        {/* HERO SECTION */}
        <div className="relative w-full rounded-3xl bg-[var(--bg-panel)] border border-amber-500/20 p-8 md:p-12 text-[var(--text-primary)] overflow-hidden shadow-2xl">
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col gap-6 max-w-4xl">
            {/* Sparkle badge */}
            <div className="inline-flex items-center gap-2 bg-black/20 border border-[var(--border-color)] px-4 py-1.5 rounded-full w-fit">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] md:text-xs font-semibold tracking-wider text-amber-400 uppercase">
                {pageContent.heroBadge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-primary leading-tight tracking-tight">
              {pageContent.heroTitle}
            </h1>

            {/* Description */}
            <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed font-secondary max-w-3xl">
              {pageContent.heroDescription}
            </p>

            {/* Divider */}
            <div className="w-full h-px bg-[var(--border-color)] my-4" />

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
              {pageContent.stats.map((stat, idx) => (
                <div key={idx}>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold font-secondary">{stat.label}</p>
                  <p className="text-lg md:text-2xl font-black font-primary mt-1 text-amber-400 italic">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* OUR PARTNERS & ASSOCIATES (categorized logo wall) */}
        {partnerCategories.length > 0 && (
          <div className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-sm p-6 md:p-10 flex flex-col gap-8">
            <div className="text-left">
              <span className="text-[10px] md:text-xs font-bold tracking-widest text-amber-400 uppercase font-secondary">Trusted Collaborations</span>
              <h2 className="text-xl md:text-2xl font-black font-primary text-[var(--text-primary)] uppercase tracking-tight mt-1">
                Our Partners &amp; Associates
              </h2>
              <p className="text-[var(--text-secondary)] text-xs md:text-sm mt-1">
                Universities, brands, institutions, and hospitality partners who collaborate with us to deliver every event.
              </p>
            </div>

            <div className="flex flex-col gap-7">
              {partnerCategories.map((group) => (
                <div key={group.category} className="flex flex-col gap-3">
                  <span className="text-[10px] font-primary font-bold tracking-widest text-[var(--text-muted)] uppercase">
                    {group.category}
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {group.partners.map((partner, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl px-4 py-3"
                      >
                        {partner.logoUrl ? (
                          <img src={partner.logoUrl} alt={partner.name} className="h-6 w-auto object-contain" />
                        ) : (
                          <Building size={14} className="text-[var(--text-muted)] shrink-0" />
                        )}
                        <span className="text-[var(--text-secondary)] font-bold text-xs font-primary">{partner.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROI FORECASTER SECTION */}
        {currentTierInfo && (
        <div className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-sm p-6 md:p-10 relative overflow-hidden bg-[radial-gradient(rgba(201,162,39,0.08)_1.2px,transparent_1.2px)] [background-size:24px_24px]">

          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[var(--border-color)]">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] md:text-xs font-bold tracking-widest text-amber-400 uppercase">
                  Sponsor ROI Forecaster
                </span>
              </div>
              <h2 className="text-xl md:text-3xl font-black font-primary text-[var(--text-primary)] uppercase">
                Estimate Your Brand Value
              </h2>
              <p className="text-[var(--text-secondary)] text-xs md:text-sm">
                Select a category tier below to preview exact physical, digital, and media marketing entitlements.
              </p>
            </div>

            {/* Selector Pills */}
            <div className="flex flex-wrap gap-2">
              {(["TITLE", "PLATINUM", "GOLD", "ASSOCIATE"] as const).map((tierKey) => (
                <button
                  key={tierKey}
                  onClick={() => setSelectedTier(tierKey)}
                  className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all cursor-pointer ${selectedTier === tierKey
                    ? "bg-amber-500 text-[#170D08] shadow-md"
                    : "bg-white/5 border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-white/10"
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
              <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs md:text-sm font-bold text-[var(--text-secondary)]">
                    Projected Crowd Footfall Multiplier
                  </span>
                  <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
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
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-2 focus:outline-none"
                />

                <p className="text-[11px] text-[var(--text-muted)]">
                  Simulate maximum brand exposure based on surge capacities during grand finale weekends.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Impressions */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-amber-500/30 transition-colors">
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 font-secondary">Estimated Brand Impressions</p>
                  <p className="text-xl md:text-2xl font-black font-primary text-[var(--text-primary)]">
                    {formatCurrency(calculatedImpressions)} +
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-2 font-secondary">
                    Guaranteed digital, ticket PDF, app, and trackside views.
                  </p>
                </div>

                {/* CPM */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-amber-500/30 transition-colors">
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 font-secondary">Implied Cost Per Thousand (CPM)</p>
                  <p className="text-xl md:text-2xl font-black font-primary text-amber-400">
                    ₹{calculatedCPM.toFixed(1)} CPM
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-2 font-secondary">
                    Extremely low acquisition cost compared to traditional media.
                  </p>
                </div>

                {/* Space */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-amber-500/30 transition-colors">
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 font-secondary">Physical Experience Space</p>
                  <p className="text-sm md:text-base font-black font-primary text-[var(--text-primary)] line-clamp-2">
                    {currentTierInfo.space}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-2 font-secondary">
                    Complimentary electrical, Wi-Fi, and brand banner backdrops.
                  </p>
                </div>

                {/* Allotments */}
                <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-amber-500/30 transition-colors">
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 font-secondary">VVIP / Delegate Allotments</p>
                  <p className="text-sm md:text-base font-black font-primary text-[var(--text-primary)]">
                    {currentTierInfo.allotments}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-2 font-secondary">
                    Includes complete catering, direct forward lounge access & Pit access.
                  </p>
                </div>

              </div>

            </div>

            {/* Right Card: Tier Summary */}
            <div className="bg-[var(--bg-panel)] border border-amber-500/20 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest font-secondary">Tier Value Envelope</p>
                  <h3 className="text-xl md:text-2xl font-black font-primary text-[var(--text-primary)] mt-1 uppercase">
                    {currentTierInfo.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl md:text-3xl font-black font-primary text-amber-400 italic">
                      ₹{formatCurrency(currentTierInfo.price)}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider font-secondary">INR + GST</span>
                  </div>
                </div>

                <div className="w-full h-px bg-[var(--border-color)]" />

                <div className="flex flex-col gap-4">
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider font-secondary">Premium Activation Entitlements</p>
                  <ul className="flex flex-col gap-3">
                    {currentTierInfo.entitlements.map((ent, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-[var(--text-secondary)] items-start font-secondary">
                        <div className="w-4 h-4 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-amber-400" />
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
                  className="w-full bg-amber-500 hover:bg-amber-400 text-[#170D08] py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 font-primary font-bold text-xs tracking-wider uppercase transition-colors shadow-md"
                >
                  Enquire for {selectedTier.toLowerCase()} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Placement Alert */}
          <div className="w-full mt-8 bg-black/20 text-[var(--text-primary)] rounded-2xl p-4 flex items-center gap-3 border border-[var(--border-color)] shadow-lg relative overflow-hidden">
            <div className="w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest font-primary">
                Major Placements & Media Coverage
              </span>
              <span className="hidden md:inline text-[var(--border-color)]">|</span>
              <span className="text-xs text-[var(--text-secondary)] font-secondary leading-snug">
                {currentTierInfo.placements}
              </span>
            </div>
          </div>

        </div>
        )}

        {/* FOOD EXPO 2026-2027 FEATURED SPONSORSHIP SPOTLIGHT */}
        <div className="w-full bg-[var(--bg-card)] border border-amber-500/25 rounded-3xl shadow-2xl p-6 md:p-10 flex flex-col gap-8 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6 relative z-10">
            <div className="flex flex-col gap-1.5 text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full w-fit">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] md:text-xs font-bold tracking-widest text-amber-400 uppercase">
                  Flagship Festival Deck &bull; 3rd Edition
                </span>
              </div>
              <h2 className="text-xl md:text-3xl font-black font-primary text-[var(--text-primary)] uppercase tracking-tight">
                Udaipur Catering &amp; Food Expo 2026–2027
              </h2>
              <p className="text-[var(--text-secondary)] text-xs md:text-sm font-secondary">
                Jan 6, 7 &amp; 8, 2027 &bull; Organized by AANYA GROUP &bull; Official B2B Hospitality, Catering &amp; Tourism Expo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://www.udaipurfoodexpo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold font-primary uppercase tracking-wider transition-colors"
              >
                <span>udaipurfoodexpo.com</span>
                <ExternalLink size={12} />
              </a>
              <a
                href="https://www.uhcvs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-stone-300 hover:text-white text-xs font-bold font-primary uppercase tracking-wider transition-colors"
              >
                <span>uhcvs.org</span>
                <ExternalLink size={12} />
              </a>
              <button
                type="button"
                onClick={() => setShowFoodSponsorModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#170D08] text-xs font-black font-primary uppercase tracking-wider transition-colors shadow-md cursor-pointer"
              >
                <Maximize2 size={13} />
                <span>View Full Poster</span>
              </button>
            </div>
          </div>

          {/* Slogan Banner */}
          <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/30 text-center shadow-inner relative z-10">
            <h3 className="text-sm md:text-base font-black text-amber-300 font-serif italic tracking-wide">
              &ldquo;{foodExpoConfig.slogans.primary}&rdquo;
            </h3>
          </div>

          {/* 2-Column Deck: 7 Categories & 9 Benefits */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            {/* Left: 7 Sponsorship Categories */}
            <div className="lg:col-span-5 flex flex-col gap-4 text-left">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <span className="text-xs font-black font-primary text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Trophy size={14} /> Sponsorship Categories
                </span>
                <span className="text-[10px] text-stone-400 font-mono bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                  {foodExpoConfig.sponsorshipTiers.length} Tiers Available
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {foodExpoConfig.sponsorshipTiers.map((tier) => (
                  <div
                    key={tier.rank || tier.no}
                    className="flex flex-col gap-2.5 px-3.5 py-3 rounded-2xl bg-[var(--bg-panel)] hover:bg-white/[0.05] border border-[var(--border-color)] hover:border-amber-500/40 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center text-white bg-gradient-to-br ${tier.bg} shadow-md shrink-0`}>
                        {tier.rank || tier.no}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-black text-white font-primary uppercase tracking-tight whitespace-nowrap">
                          {tier.name}
                        </span>
                        <span className="text-[9.5px] text-[var(--text-muted)] font-secondary truncate">
                          {tier.desc || tier.tag}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pl-10">
                      <span className="text-xs sm:text-sm font-black font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                        {tier.price}
                      </span>
                      <a
                        href="#enlist"
                        onClick={() => setTierInterest(`Food Expo: ${tier.name} (${tier.price})`)}
                        className="inline-flex px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-[#170D08] text-[9.5px] font-primary font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Enlist
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 9 Sponsorship Benefits */}
            <div className="lg:col-span-7 flex flex-col gap-4 text-left">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <span className="text-xs font-black font-primary text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Star size={14} /> Sponsorship Deliverables &amp; Benefits
                </span>
                <span className="text-[10px] text-stone-400 font-mono bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                  {foodExpoConfig.benefits.length} Core Privileges
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {foodExpoConfig.benefits.map((benefit, bIdx) => (
                  <div
                    key={bIdx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] leading-relaxed font-secondary hover:border-amber-500/30 transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {bIdx + 1}
                    </span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[var(--border-color)] mt-auto">
                <span className="text-xs text-[var(--text-muted)] italic font-primary">
                  {foodExpoConfig.slogans.motto}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFoodSponsorModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#170D08] font-primary font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                  >
                    <Maximize2 size={13} />
                    <span>View Official Poster</span>
                  </button>
                  <a
                    href="#enlist"
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[var(--text-primary)] text-xs font-primary font-bold uppercase tracking-wider transition-colors"
                  >
                    <span>Enlist Brand</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Clickable Graphic Poster Preview */}
          <div
            onClick={() => setShowFoodSponsorModal(true)}
            className="group relative rounded-2xl overflow-hidden border border-amber-500/30 shadow-xl bg-[#120B07] p-2 sm:p-4 cursor-pointer relative z-10 flex items-center justify-center max-h-[480px] aspect-[16/9] sm:aspect-[16/8]"
          >
            <img
              src={foodExpoConfig.images.sponsorshipPoster}
              alt="Food Expo Sponsorship Categories &amp; Benefits Poster"
              className="w-full h-full max-h-full max-w-full object-contain rounded-xl group-hover:scale-[1.01] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
              <span className="px-5 py-2.5 rounded-xl bg-amber-500 text-[#170D08] font-primary font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2">
                <Maximize2 size={14} /> Click to Enlarge Official Poster
              </span>
            </div>
          </div>
        </div>

        {/* Lightbox modal for Food Expo Sponsorship Chart on Sponsors Page */}
        {showFoodSponsorModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
            <div className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-[#120B07] border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 mb-3">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-primary font-bold text-amber-400 uppercase tracking-widest">
                    Food Expo 2026–2027 Official Blueprint
                  </span>
                  <h3 className="text-sm sm:text-lg font-black font-primary text-white uppercase">
                    Sponsorship Categories &amp; Benefits Poster
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFoodSponsorModal(false)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="overflow-hidden max-h-[78vh] w-full rounded-2xl flex items-center justify-center p-2 bg-black/40">
                <img
                  src={foodExpoConfig.images.sponsorshipPoster}
                  alt="Food Expo Sponsorship Poster"
                  className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* SHOWCASE SECTION */}
        <div className="flex flex-col gap-12 py-6 font-secondary">

          {/* Section Title block */}
          <div className="text-left pb-4 border-b border-[var(--border-color)] w-full">
            <h2 className="text-xl md:text-2xl font-black text-[var(--text-primary)] font-primary uppercase tracking-tight">
              Allied Brand Patrons
            </h2>
            <p className="text-[var(--text-secondary)] text-xs md:text-sm mt-1">
              Connect with our title sponsors, strategic brand partners, and commercial alliances.
            </p>
          </div>

          {isShowcaseLoading ? (
            <>
              {/* Title Sponsor Skeleton */}
              <div className="flex flex-col items-start gap-4">
                <div className="text-left w-full max-w-7xl">
                  <h3 className="text-[10.5px] font-primary font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    Grand Title Sponsor
                  </h3>
                </div>
                <div className="h-40 rounded-3xl animate-pulse border border-[var(--border-color)] bg-white/[0.03] max-w-7xl w-full" />
              </div>

              {/* Platinum Skeleton */}
              <div className="flex flex-col items-start gap-4 w-full">
                <div className="text-left w-full max-w-7xl mx-auto">
                  <h3 className="text-[10.5px] font-primary font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    Platinum Alliance Patrons
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-7xl mx-auto">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-40 rounded-3xl animate-pulse border border-[var(--border-color)] bg-white/[0.03]" />
                  ))}
                </div>
              </div>

              {/* Gold and Associate Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl mx-auto">
                <div className="flex flex-col items-start gap-4 w-full">
                  <div className="text-left w-full">
                    <h3 className="text-[10.5px] font-primary font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      Gold Event Sponsors
                    </h3>
                  </div>
                  <div className="h-40 rounded-3xl animate-pulse border border-[var(--border-color)] bg-white/[0.03] w-full" />
                </div>
                <div className="flex flex-col items-start gap-4 w-full">
                  <div className="text-left w-full">
                    <h3 className="text-[10.5px] font-primary font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      Associate Event Patrons
                    </h3>
                  </div>
                  <div className="flex flex-col gap-4 w-full">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-40 rounded-3xl animate-pulse border border-[var(--border-color)] bg-white/[0.03] w-full" />
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Title Sponsor Showcase */}
              {titleSponsors.length > 0 && (
                <div className={`grid grid-cols-1  gap-8 w-full max-w-8xl mx-auto`}>
                  <div className="flex flex-col items-start gap-4">
                    <div className="text-left w-full max-w-7xl">
                      <h3 className="text-[10.5px] font-primary font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        Grand Title Sponsor
                      </h3>
                    </div>
                    {titleSponsors.map((sponsor) => (
                      <div key={sponsor.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl flex flex-col sm:flex-row overflow-hidden shadow-sm hover:border-amber-500/40 transition-all duration-300 max-w-7xl w-full">
                        <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0 bg-black/20">
                          <SponsorLogo logoUrl={sponsor.logoUrl} name={sponsor.name} />
                          {/* Badge overlay inside image */}
                          <span className="bg-amber-500 text-[#170D08] px-2 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded-md absolute top-3 left-3">
                            TITLE SPONSOR
                          </span>
                          {/* Active Indicator dot */}
                          <div className="absolute top-3 right-3 w-3 h-3 bg-emerald-500 border-2 border-[#170D08] rounded-full shadow-md" />
                        </div>

                        <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 flex-1 text-center sm:text-left">
                          {/* Left: identity — capped width so it doesn't stretch
                            thin across the full card on wide screens. */}
                          <div className="flex flex-col gap-1 md:flex-1 md:max-w-xl min-w-0">
                            {sponsor.industry && (
                              <span className="text-amber-400 font-primary text-[9px] tracking-wider uppercase font-bold flex items-center justify-center sm:justify-start gap-1">
                                <Building size={10} /> {sponsor.industry}
                              </span>
                            )}
                            <h4 className="text-base font-black text-[var(--text-primary)] font-primary uppercase leading-snug">
                              {sponsor.name}
                            </h4>
                            {sponsor.description && (
                              <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-secondary">
                                {sponsor.description}
                              </p>
                            )}
                          </div>

                          {/* Right: tier + CTA, kept together instead of
                            spread to the far edge of a full-width card. */}
                          <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 mt-1 md:mt-0 border-t md:border-t-0 md:border-l border-[var(--border-color)] md:pl-6 shrink-0">
                            <div className="flex flex-col text-left">
                              <span className="text-[8px] font-primary font-bold tracking-widest text-[var(--text-muted)] uppercase">Sponsor Tier</span>
                              <span className="text-xs font-black text-[var(--text-primary)] font-primary mt-0.5">Grand Title</span>
                            </div>
                            <a
                              href={sponsor.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[var(--bg-panel)] hover:bg-amber-500 hover:text-[#170D08] text-[var(--text-primary)] font-primary font-bold text-[10px] tracking-wider uppercase px-4 py-2 rounded-xl transition-colors cursor-pointer"
                            >
                              VISIT SITE
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platinum Showcase */}
              {platinumSponsors.length > 0 && (
                <div className={`grid grid-cols-1  gap-8 w-full max-w-8xl mx-auto`}>
                  <div className="flex flex-col items-start gap-4 w-full">
                    <div className="text-left w-full max-w-7xl mx-auto">
                      <h3 className="text-[10.5px] font-primary font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        Platinum Alliance Patrons
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-7xl mx-auto">
                      {platinumSponsors.map((sponsor) => (
                        <div key={sponsor.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl flex flex-col sm:flex-row overflow-hidden shadow-sm hover:border-amber-500/40 transition-all duration-300 w-full">
                          <div className="relative w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-black/20">
                            <SponsorLogo logoUrl={sponsor.logoUrl} name={sponsor.name} />
                            <span className="bg-amber-500 text-[#170D08] px-2.5 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded-md absolute top-3 left-3">
                              PLATINUM
                            </span>
                          </div>

                          <div className="p-5 flex flex-col justify-between flex-1 text-center sm:text-left gap-2.5">
                            <div className="flex flex-col gap-1">
                              <span className="text-amber-400 font-primary text-[9px] tracking-wider uppercase font-bold flex items-center justify-center sm:justify-start gap-1">
                                <Building size={10} /> {sponsor.industry}
                              </span>
                              <h4 className="text-base font-black text-[var(--text-primary)] font-primary uppercase leading-snug">
                                {sponsor.name}
                              </h4>
                              <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-secondary line-clamp-2">
                                {sponsor.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[var(--border-color)]">
                              <div className="flex flex-col text-left">
                                <span className="text-[8px] font-primary font-bold tracking-widest text-[var(--text-muted)] uppercase">Sponsor Tier</span>
                                <span className="text-xs font-black text-[var(--text-primary)] font-primary mt-0.5">Platinum</span>
                              </div>
                              <a
                                href={sponsor.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[var(--bg-panel)] hover:bg-amber-500 hover:text-[#170D08] text-[var(--text-primary)] font-primary font-bold text-[10px] tracking-wider uppercase px-4 py-2 rounded-xl transition-colors cursor-pointer"
                              >
                                VISIT SITE
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Gold and Associate Side-by-Side Grid — only split into two
                  columns when both tiers actually have sponsors, otherwise
                  the empty tier still reserves its column and leaves a
                  blank half. */}
              {/* Gold Sponsor Block */}
              {goldSponsors.length > 0 && (
                <div className={`grid grid-cols-1  gap-8 w-full max-w-8xl mx-auto`}>
                  <div className="flex flex-col items-start gap-4 w-full">
                    <div className="text-left w-full">
                      <h3 className="text-[10.5px] font-primary font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        Gold Event Sponsors
                      </h3>
                    </div>

                    {goldSponsors.map((sponsor) => (
                      <div key={sponsor.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl flex flex-col sm:flex-row overflow-hidden shadow-sm hover:border-amber-500/40 transition-all duration-300 w-full h-fit">
                        <div className="relative w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-black/20">
                          <SponsorLogo logoUrl={sponsor.logoUrl} name={sponsor.name} />
                          <span className="bg-amber-500 text-[#170D08] px-2.5 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded-md absolute top-3 left-3">
                            GOLD
                          </span>
                        </div>

                        <div className="p-5 flex flex-col justify-between flex-1 text-center sm:text-left gap-2.5">
                          <div className="flex flex-col gap-1">
                            <span className="text-amber-400 font-primary text-[9px] tracking-wider uppercase font-bold flex items-center justify-center sm:justify-start gap-1">
                              <Building size={10} /> {sponsor.industry}
                            </span>
                            <h4 className="text-base font-black text-[var(--text-primary)] font-primary leading-tight">
                              {sponsor.name}
                            </h4>
                            <p className="text-[var(--text-secondary)] text-xs leading-relaxed font-secondary line-clamp-2">
                              {sponsor.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-[var(--border-color)]">
                            <div className="flex flex-col text-left">
                              <span className="text-[8px] font-primary font-bold tracking-widest text-[var(--text-muted)] uppercase">Sponsor Tier</span>
                              <span className="text-xs font-black text-[var(--text-primary)] font-primary mt-0.5">Gold</span>
                            </div>
                            <a
                              href={sponsor.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-[var(--bg-panel)] hover:bg-amber-500 hover:text-[#170D08] text-[var(--text-primary)] font-primary font-bold text-[10px] tracking-wider uppercase px-4 py-2 rounded-xl transition-colors cursor-pointer"
                            >
                              VISIT SITE
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Associate Sponsor Block */}
              {associateSponsors.length > 0 && (
                <div className={`grid grid-cols-1  gap-8 w-full max-w-8xl mx-auto`}>
                  <div className="flex flex-col items-start gap-4 w-full">
                    <div className="text-left w-full">
                      <h3 className="text-[10.5px] font-primary font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        Associate Event Patrons
                      </h3>
                    </div>

                    <div className={`grid grid-cols-2 ${goldSponsors.length > 0 ? "sm:grid-cols-2" : "sm:grid-cols-3 lg:grid-cols-4"} gap-4 w-full`}>
                      {associateSponsors.map((sponsor) => (
                        <div key={sponsor.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm hover:border-amber-500/40 transition-all duration-300 flex flex-col h-full">
                          <div className="relative w-full h-36 shrink-0 bg-black/20">
                            <SponsorLogo logoUrl={sponsor.logoUrl} name={sponsor.name} />
                            <span className="bg-amber-500 text-[#170D08] px-2.5 py-0.5 text-[8px] font-bold tracking-wider uppercase rounded-md absolute top-3 left-3">
                              ASSOCIATE
                            </span>
                          </div>

                          <div className="p-4 flex flex-col justify-between flex-1 text-left gap-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-amber-400 font-primary text-[9px] tracking-wider uppercase font-bold flex items-center gap-1">
                                <Building size={10} /> {sponsor.industry}
                              </span>
                              <h4 className="text-sm font-black text-[var(--text-primary)] font-primary uppercase leading-tight">
                                {sponsor.name}
                              </h4>
                              {sponsor.description && (
                                <p className="text-[var(--text-secondary)] text-[11px] leading-normal line-clamp-2 font-secondary">
                                  {sponsor.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border-color)]">
                              <div className="flex flex-col text-left">
                                <span className="text-[7.5px] font-primary font-bold tracking-widest text-[var(--text-muted)] uppercase">Sponsor Tier</span>
                                <span className="text-[11px] font-black text-[var(--text-primary)] font-primary mt-0.5">Associate</span>
                              </div>
                              <a
                                href={sponsor.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[var(--bg-panel)] hover:bg-amber-500 hover:text-[#170D08] text-[var(--text-primary)] font-primary font-bold text-[9px] tracking-wider uppercase px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
                              >
                                VISIT SITE
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ENLIST YOUR BRAND FORM SECTION */}
        <div id="enlist" className="w-full rounded-3xl bg-[var(--bg-panel)] border border-amber-500/20 p-8 md:p-12 text-[var(--text-primary)] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px]" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            {/* Left Side: Information */}
            <div className="flex flex-col gap-6 text-left font-secondary">
              <span className="text-[10px] md:text-xs font-bold tracking-widest text-amber-400 uppercase font-secondary">
                {pageContent.enlistEyebrow}
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-primary tracking-tight">
                {pageContent.enlistHeading}
              </h2>
              <p className="text-[var(--text-secondary)] text-xs md:text-sm leading-relaxed max-w-md">
                {pageContent.enlistDescription}
              </p>

              <ul className="flex flex-col gap-4 mt-2 font-primary text-xs text-[var(--text-secondary)]">
                {pageContent.enlistBullets.map((bullet, idx) => (
                  <li key={idx} className="flex gap-2 items-center">
                    <Check size={13} className="text-amber-400" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Side: Form */}
            <div className="bg-black/20 border border-[var(--border-color)] rounded-2xl p-6 md:p-8 shadow-inner relative overflow-hidden">

              {isSubmitted ? (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold font-primary text-lg text-[var(--text-primary)]">Proposal Pitch Requested!</h4>
                  <p className="text-[var(--text-secondary)] text-xs max-w-sm font-secondary">
                    A simulated confirmation mail has been triggered. Our brand alliances team will contact you with a customized proposal deck.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs text-amber-400 hover:text-amber-300 underline font-bold mt-2 cursor-pointer font-primary"
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSponsorSubmit} className="flex flex-col gap-5 text-left font-secondary">
                  {/* Company Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-primary tracking-widest text-[var(--text-muted)] uppercase font-bold">
                      Company / Brand Entity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jio Infocomm Ltd"
                      className="w-full bg-black/20 border border-[var(--border-color)] rounded-lg py-3 px-4 text-[var(--text-secondary)] text-xs outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Contact Person & Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-primary tracking-widest text-[var(--text-muted)] uppercase font-bold">
                        Representative Name
                      </label>
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full bg-black/20 border border-[var(--border-color)] rounded-lg py-3 px-4 text-[var(--text-secondary)] text-xs outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-primary tracking-widest text-[var(--text-muted)] uppercase font-bold">
                        Official Corporate Email
                      </label>
                      <input
                        type="email"
                        placeholder="name@company.com"
                        className="w-full bg-black/20 border border-[var(--border-color)] rounded-lg py-3 px-4 text-[var(--text-secondary)] text-xs outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                  </div>

                  {/* Tier interest */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-primary tracking-widest text-[var(--text-muted)] uppercase font-bold">
                      Tier Level of Interest
                    </label>
                    <div className="relative">
                      <select
                        className="w-full bg-black/20 border border-[var(--border-color)] rounded-lg py-3 pl-4 pr-10 text-[var(--text-secondary)] text-xs outline-none focus:border-amber-500/40 transition-all appearance-none cursor-pointer"
                        value={tierInterest}
                        onChange={(e) => setTierInterest(e.target.value)}
                      >
                        <option value="Title Sponsor Package">Title Sponsor Package</option>
                        <option value="Platinum Alliance Partner">Platinum Alliance Partner</option>
                        <option value="Gold Sponsor Package">Gold Sponsor Package</option>
                        <option value="Associate Event Patron">Associate Event Patron</option>
                      </select>
                      <div className="absolute right-3 top-3.5 pointer-events-none text-[var(--text-muted)]">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-[#170D08] font-primary font-bold text-xs tracking-wider uppercase py-3.5 rounded-lg shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] transition-all text-center mt-2 cursor-pointer"
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
