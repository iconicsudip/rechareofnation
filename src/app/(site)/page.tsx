"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, Calendar, MapPin, Trophy, ArrowRight, Star, Heart, 
  Flame, Compass, ChevronRight, Music, Sparkles, Paintbrush, 
  HelpCircle, Eye, Mail, Award, CheckCircle, Ticket, Layers, 
  Laptop, Briefcase, GraduationCap, Globe, Shield, RefreshCw, ChevronLeft 
} from "lucide-react";
import { ApiClient, Event, Sponsor, GalleryItem } from "@/lib/api-client";
import { Form, Input, Select, ConfigProvider } from "antd";
import { useRouter } from "next/navigation";

// Carousel slides seed with high-end digital styling specs
const HERO_SLIDES = [
  {
    badge: "✦ ELITE AUTOMOTIVE CLASH",
    titleLine1: "REV UP THE",
    titleLine2: "CYBER ENGINE",
    accent: "CYBERPUNK SPEED EXPO",
    desc: "Witness India's most aggressive tuning clash, custom supercars, drift spec showcases, and hypercar networking setups.",
    bgGradient: "from-slate-950 via-[#0a0e1e] to-cyan-950/20",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80",
    tier: "PADDOCK EXHIBITOR VIP",
    multipass: "MULTIPASS 2.4GHZ",
    eventDate: "OCT 12-14, 2026",
    venue: "BIC Arena, Greater Noida",
    gate: "GATE 03 / PITS",
    price: "₹1,499",
    code: "PASS-AUTO-992",
    slug: "recharge-cultural-odyssey-2026"
  },
  {
    badge: "✦ NATARAJA DANCE CLASH",
    titleLine1: "FEEL THE VIBE",
    titleLine2: "AND RHYTHM",
    accent: "NATIONAL CHOREO BATTLE",
    desc: "Compete or witness the ultimate choreography battle where elite street, classical, and contemporary crews clash for the national shield.",
    bgGradient: "from-slate-950 via-[#0a0e1e] to-purple-950/20",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80",
    tier: "STAGE SIDE CONTESTANT VIP",
    multipass: "STAGEPASS 5.8GHZ",
    eventDate: "NOV 08, 2026",
    venue: "Ravindra Bharathi, Hyderabad",
    gate: "STAGE DOOR BACKSTAGE",
    price: "₹500",
    code: "PASS-DNC-4214",
    slug: "national-vibe-rhythm-dance-cup"
  },
  {
    badge: "✦ ABHYUDAYA MEGA FEST",
    titleLine1: "CELEBRATE THE",
    titleLine2: "CULTURAL ODYSSEY",
    accent: "INDIAN HERITAGE CARNIVAL",
    desc: "A massive celebration of folk dances, local street foods, multi-state music ensembles, and handmade artisan craft markets.",
    bgGradient: "from-slate-950 via-[#0a0e1e] to-pink-950/20",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    tier: "GENERAL ENTRY BADGE",
    multipass: "ADMIT 4 FAMILY",
    eventDate: "OCT 15, 2026",
    venue: "Jawaharlal Nehru Stadium, Delhi",
    gate: "GATE 06 / GROUND",
    price: "₹299",
    code: "PASS-ODY-5524",
    slug: "recharge-cultural-odyssey-2026"
  }
];

export default function HomePage() {
  const router = useRouter();

  const handleSearchSubmit = () => {
    const searchParam = searchQuery === "" && searchCategory !== "All Segments" ? searchCategory : searchQuery;
    const locationParam = searchCity !== "All Cities" ? searchCity : "All";
    router.push(`/events?search=${encodeURIComponent(searchParam)}&location=${locationParam}`);
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSegment, setActiveSegment] = useState("Festivals");
  const [trendingCity, setTrendingCity] = useState("New Delhi");
  
  // Custom API seeded lists states
  const [events, setEvents] = useState<Event[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("All Segments");
  const [searchCity, setSearchCity] = useState("All Cities");
  const [searchDate, setSearchDate] = useState("Any Date");

  // NFC Card flip state
  const [isNfcFlipped, setIsNfcFlipped] = useState(false);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Next slide automation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch list data from LocalStorage Mock REST engine
  useEffect(() => {
    const fetchData = async () => {
      const allEvents = await ApiClient.getEvents();
      const allSponsors = await ApiClient.getSponsors();
      const allGallery = await ApiClient.getGalleryItems();
      
      setEvents(allEvents);
      setSponsors(allSponsors);
      setGallery(allGallery);
    };
    fetchData();
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const activeHero = HERO_SLIDES[currentSlide];

  // Map segments to categories in our mockup
  const getCategoryFilter = (segment: string) => {
    switch (segment) {
      case "Festivals":
        return ["Cultural Programs", "Food Festivals"];
      case "Competitions":
        return ["Dance Competitions", "Educational Events"];
      case "Expos":
        return ["Trade Expos", "Art & Craft"];
      case "Workshops":
        return ["Educational Events", "Art & Craft"];
      case "Corporate":
        return ["Trade Expos"];
      case "School & College":
        return ["Educational Events"];
      case "Business Networking":
        return ["Trade Expos"];
      default:
        return [];
    }
  };

  const activeCategoryFilter = getCategoryFilter(activeSegment);
  const matchingEvents = events.filter(e => activeCategoryFilter.includes(e.category));
  const featuredHeadliners = matchingEvents.length > 0 ? matchingEvents.slice(0, 6) : events.filter(e => e.isUpcoming).slice(0, 6);
  const nationalArenas = events.filter(e => e.registrationFee && e.isUpcoming).slice(0, 4);
  const megaCarnivals = events.filter(e => e.category === "Cultural Programs" || e.category === "Food Festivals").slice(0, 3);
  const innovationExpos = events.filter(e => e.category === "Trade Expos" || e.category === "Art & Craft").slice(0, 3);

  // Dynamic Trending Events List Based on City selection
  const trendingEvents = {
    "New Delhi": [
      { id: "tr-1", title: "Recharge Cultural Odyssey", category: "Cultural Programs", rating: 4.9, reviews: 120, venue: "Jawaharlal Nehru Stadium", price: 299, image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80", desc: "India's largest multi-state heritage festival celebrating folk, cuisine, and design." },
      { id: "tr-2", title: "Elite Supercar Automotive Clash", category: "Trade Expos", rating: 4.8, reviews: 90, venue: "BIC Arena, Noida", price: 499, image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80", desc: "Tuned supercars, drift tracks, and hypercar networking corridors." },
      { id: "tr-3", title: "Cyber-Security Seminars", category: "Educational Events", rating: 4.7, reviews: 55, venue: "Pragati Maidan", price: 199, image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80", desc: "Keynotes on zero-trust architectures and networking with security leaders." }
    ],
    "Mumbai": [
      { id: "tr-4", title: "Youth Couture Fashion Week", category: "Fashion Shows", rating: 4.9, reviews: 140, venue: "Taj Lands End Ballroom", price: 499, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80", desc: "Sustainable handloom weaves and modern streetwear designed by top youth minds." },
      { id: "tr-5", title: "India Tech Trade Expo 2026", category: "Trade Expos", rating: 4.8, reviews: 110, venue: "Jio Convention Centre", price: 499, image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80", desc: "Exhibiting AI, FinTech, and Green energy solutions to global VC firms." },
      { id: "tr-6", title: "Indie Rock Jam Fest", category: "Cultural Programs", rating: 4.6, reviews: 80, venue: "NESCO, Goregaon", price: 699, image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80", desc: "High-energy live rock ensembles from college bands across Maharashtra." }
    ],
    "Bengaluru": [
      { id: "tr-7", title: "India Culinary & Food Festival", category: "Food Festivals", rating: 4.8, reviews: 200, venue: "Palace Grounds", price: 150, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80", desc: "Live cooking masterclasses and native street eats from 20 Indian states." },
      { id: "tr-8", title: "Art Expressions Exhibition", category: "Art & Craft", rating: 4.7, reviews: 75, venue: "Chitrakala Parishath", price: 99, image: "https://images.unsplash.com/photo-1459908272638-55f467b2f7a9?auto=format&fit=crop&w=600&q=80", desc: "Hand-spun textiles, clay pottery workshops, and heritage painting galleries." },
      { id: "tr-9", title: "FinTech Hackathon & Expo", category: "Trade Expos", rating: 4.9, reviews: 95, venue: "KTPO, Whitefield", price: 250, image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80", desc: "Connecting developers, tech creators, and fintech startup sponsors." }
    ],
    "Chennai": [
      { id: "tr-10", title: "Nataraja Classical Dance Arena", category: "Dance Competitions", rating: 4.9, reviews: 105, venue: "Kalakshetra Foundation", price: 199, image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80", desc: "Classical Bharatnatyam and semi-classical fusion group showdowns." },
      { id: "tr-11", title: "National Brainiac Quiz", category: "Quiz Competitions", rating: 4.6, reviews: 40, venue: "IIT Madras Hall", price: 99, image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80", desc: "High-octane science, general knowledge, and history quiz showdowns." },
      { id: "tr-12", title: "Carnatic Vocal Symphony", category: "Singing Competitions", rating: 4.8, reviews: 65, venue: "Music Academy Hall", price: 300, image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80", desc: "Elite vocal recitals and violin orchestra accompaniments." }
    ]
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      console.log(`[MOCK EMAIL SMTP] Alert Crew joined: ${newsletterEmail}`);
    }
  };

  return (
    <div className="flex flex-col text-left">
      
      {/* 1. HERO BANNER (CAROUSEL) */}
      <section className="relative min-h-[90vh] lg:min-h-[95vh] flex items-center justify-center pt-24 pb-20 overflow-hidden">
        {/* Background Image of active slide */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-102"
          style={{ backgroundImage: `url('${activeHero.image}')` }}
        ></div>
        
        {/* Dark Overlay gradient for copy visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/50 backdrop-blur-xs"></div>
        
        {/* Tech grid texture overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:30px_30px] opacity-35"></div>

        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content (7 Columns) - Auto-slideable */}
          <div key={currentSlide} className="lg:col-span-7 flex flex-col gap-6 select-none animate-fade-in-up">
            <span className="inline-flex w-fit items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-mono font-bold tracking-widest uppercase shadow-sm animate-pulse">
              {activeHero.badge}
            </span>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-tight font-primary text-white shadow-text-glow">
              {activeHero.titleLine1} <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">{activeHero.titleLine2}</span>
            </h1>
            
            <p className="text-gray-400 text-sm sm:text-base max-w-xl leading-relaxed font-secondary">
              {activeHero.desc}
            </p>

            <div className="flex flex-wrap gap-4 mt-2">
              <Link href={`/events/${activeHero.slug}`} className="btn btn-primary bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold text-sm tracking-wide rounded-lg px-8 py-4 shadow-neon-pink">
                Register / Book Pass →
              </Link>
              <Link href="/events" className="btn btn-secondary bg-gray-900/50 hover:bg-gray-900 border border-gray-800 text-white font-semibold text-sm rounded-lg px-6 py-4">
                Browse All Events
              </Link>
            </div>

            {/* Carousel Dot Indicators */}
            <div className="flex items-center gap-2.5 mt-6">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? "w-8 bg-pink-500" : "w-2 bg-gray-700 hover:bg-gray-500"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <div className="glass-panel p-6 rounded-3xl border-[rgba(255,255,255,0.08)] bg-slate-950/80 shadow-2xl flex flex-col gap-5 w-full max-w-[430px]">
              
              {/* Header inside Search Widget */}
              <div className="flex flex-col gap-1 text-left border-b border-[rgba(255,255,255,0.06)] pb-3">
                <span className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase">QUICK ACCESS PORTAL</span>
                <h3 className="text-base font-black text-white font-primary uppercase">Find Your Pass</h3>
              </div>

              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: '#ec4899', // Pink
                    colorBgContainer: 'rgba(9, 13, 26, 0.6)',
                    colorBorder: 'rgba(255, 255, 255, 0.08)',
                    colorText: '#ffffff',
                    colorTextPlaceholder: '#6b7280',
                    borderRadius: 12,
                    controlHeight: 42,
                  },
                }}
              >
                <Form 
                  layout="vertical" 
                  onFinish={handleSearchSubmit} 
                  className="flex flex-col gap-1 text-left w-full mt-1"
                >
                  
                  {/* Keyword Field */}
                  <Form.Item 
                    label={<span className="text-[9.5px] text-gray-500 font-mono font-bold uppercase tracking-wider leading-none">Keyword Search</span>}
                    className="mb-0 flex flex-col gap-1.5"
                  >
                    <Input 
                      prefix={<Search className="text-gray-500 mr-1.5" size={14} />}
                      placeholder="Events, venues, artists..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="antd-cyber-input w-full"
                    />
                  </Form.Item>

                  {/* Category Field */}
                  <Form.Item 
                    label={<span className="text-[9.5px] text-gray-500 font-mono font-bold uppercase tracking-wider leading-none">Category</span>}
                    className="mb-0 flex flex-col gap-1.5"
                  >
                    <Select
                      value={searchCategory}
                      onChange={(val) => setSearchCategory(val)}
                      suffixIcon={<Layers className="text-gray-500" size={14} />}
                      className="antd-cyber-select w-full"
                      options={[
                        { value: "All Segments", label: "All Categories" },
                        { value: "Cultural Programs", label: "Cultural Programs" },
                        { value: "Dance Competitions", label: "Dance Competitions" },
                        { value: "Trade Expos", label: "Trade Expos" },
                        { value: "Food Festivals", label: "Food Festivals" }
                      ]}
                      classNames={{ popup: { root: "antd-cyber-popup" } }}
                    />
                  </Form.Item>

                  {/* City/Location Field */}
                  <Form.Item 
                    label={<span className="text-[9.5px] text-gray-500 font-mono font-bold uppercase tracking-wider leading-none">City / Location</span>}
                    className="mb-0 flex flex-col gap-1.5"
                  >
                    <Select
                      value={searchCity}
                      onChange={(val) => setSearchCity(val)}
                      suffixIcon={<MapPin className="text-gray-500" size={14} />}
                      className="antd-cyber-select w-full"
                      options={[
                        { value: "All Cities", label: "All Cities" },
                        { value: "New Delhi", label: "New Delhi" },
                        { value: "Mumbai", label: "Mumbai" },
                        { value: "Bengaluru", label: "Bengaluru" },
                        { value: "Chennai", label: "Chennai" }
                      ]}
                      classNames={{ popup: { root: "antd-cyber-popup" } }}
                    />
                  </Form.Item>

                  {/* Date Field */}
                  <Form.Item 
                    label={<span className="text-[9.5px] text-gray-500 font-mono font-bold uppercase tracking-wider leading-none">Select Date</span>}
                    className="mb-0 flex flex-col gap-1.5"
                  >
                    <Select
                      value={searchDate}
                      onChange={(val) => setSearchDate(val)}
                      suffixIcon={<Calendar className="text-gray-500" size={14} />}
                      className="antd-cyber-select w-full"
                      options={[
                        { value: "Any Date", label: "Any Date" },
                        { value: "2026-10-15", label: "Oct 15, 2026" },
                        { value: "2026-11-08", label: "Nov 08, 2026" },
                        { value: "2026-12-05", label: "Dec 05, 2026" }
                      ]}
                      classNames={{ popup: { root: "antd-cyber-popup" } }}
                    />
                  </Form.Item>

                  {/* Submit Button */}
                  <button 
                    type="submit"
                    className="w-full py-3 rounded-xl text-white flex items-center justify-center gap-2 font-bold text-xs shadow-lg transition-all font-primary uppercase tracking-wide mt-3 cursor-pointer"
                    style={{ backgroundColor: '#ec4899', color: '#ffffff' }}
                  >
                    <Search size={14} />
                    Search Passes / Badges
                  </button>

                </Form>
              </ConfigProvider>
            </div>
          </div>

        </div>
      </section>

      {/* 3. BROWSE SEGMENT FAST-TRACKS */}
      <section className="section-dark-1 section-padding-medium border-t border-[rgba(255,255,255,0.02)]">
        <div className="container">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5 mb-6 text-left">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span>
                <span className="text-[10px] font-mono tracking-widest text-pink-400 font-bold uppercase">EXPLORE CATEGORIES</span>
              </div>
              <h2 className="text-2xl font-black text-white font-primary uppercase tracking-tight">BROWSE EVENT CHANNELS</h2>
              <p className="text-gray-500 text-xs font-secondary leading-relaxed">Navigate through specialized thematic programs, fast-track networks, and arenas.</p>
            </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { name: "Festivals", icon: Flame, color: "text-red-400 border-red-500/20 hover:border-red-500/50 hover:bg-red-950/20 hover-neon-pink", count: "05", label: "CARNIVALS" },
              { name: "Competitions", icon: Trophy, color: "text-amber-400 border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-950/20 hover-neon-pink", count: "08", label: "ARENAS" },
              { name: "Expos", icon: Laptop, color: "text-cyan-400 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-950/20 hover-neon-pink", count: "03", label: "STALLS" },
              { name: "Workshops", icon: Paintbrush, color: "text-purple-400 border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-950/20 hover-neon-pink", count: "06", label: "ACADEMY" },
              { name: "Corporate", icon: Briefcase, color: "text-indigo-400 border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-950/20 hover-neon-pink", count: "04", label: "SUMMITS" },
              { name: "School & College", icon: GraduationCap, color: "text-green-400 border-green-500/20 hover:border-green-500/50 hover:bg-green-950/20 hover-neon-pink", count: "07", label: "CAMPUS" },
              { name: "Business Networking", icon: Globe, color: "text-orange-400 border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-950/20 hover-neon-pink", count: "05", label: "NETWORKS" }
            ].map((seg) => {
              const Icon = seg.icon;
              const isSelected = activeSegment === seg.name;
              return (
                <button
                  key={seg.name}
                  onClick={() => {
                    setActiveSegment(seg.name);
                    setTimeout(() => {
                      document.getElementById("spotlight-section")?.scrollIntoView({ behavior: "smooth" });
                    }, 50);
                  }}
                  className={`glass-panel p-4 rounded-2xl flex items-center gap-3 border transition-all duration-300 text-left group relative min-h-[84px] overflow-hidden cursor-pointer ${seg.color} ${
                    isSelected ? "ring-2 ring-pink-500 ring-offset-2 ring-offset-slate-950 border-pink-500/60 bg-[#0e1424]" : "bg-[#070b13]/60"
                  }`}
                >
                  {/* Neon Left Accent Indicator */}
                  <div 
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r transition-all duration-300 ${
                      isSelected ? "h-12 bg-pink-500" : "h-0 bg-cyan-400 group-hover:h-8"
                    }`}
                  ></div>

                  {/* Left Column: Styled Icon Wrapper */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-900/80 border border-gray-800 shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <Icon size={16} />
                  </div>

                  {/* Right Column: Stacked text details */}
                  <div className="flex flex-col gap-0.5 text-left pr-4">
                    <span className="text-[11px] text-white font-extrabold font-primary uppercase tracking-tight leading-tight group-hover:text-cyan-400 transition-colors">
                      {seg.name}
                    </span>
                    <span className="text-[7px] text-gray-500 font-mono tracking-widest font-bold uppercase leading-none">
                      {seg.label}
                    </span>
                  </div>

                  {/* Absolute Top Right Count Badge - Highly Visible Neon Style */}
                  <span className="absolute top-2.5 right-2.5 text-[9.5px] font-mono font-black text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20 shadow-[0_0_8px_rgba(236,72,153,0.15)] group-hover:text-cyan-400 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-all duration-300">
                    {seg.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>

      {/* 4. DISCOVER NATIONAL HUBS */}
      <section className="section-dark-2 section-padding-medium border-t border-[rgba(255,255,255,0.02)]">
        <div className="container">
          <div className="border-b border-gray-800 pb-5 mb-10 text-left">
            <h2 className="text-2xl font-black tracking-tight text-white font-primary uppercase">DISCOVER NATIONAL HUBS</h2>
            <p className="text-gray-500 text-xs mt-1.5">Nationwide physical infrastructures housing Recharge audits & trade expo spaces.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "North Hub (Delhi)", icon: MapPin, desc: "Managing national events at Pragati Maidan and JNS arenas." },
              { title: "West Corridor (Mumbai)", icon: Briefcase, desc: "Focusing on corporate conventions and youth couture shows." },
              { title: "South Axis (Bengaluru)", icon: Laptop, desc: "The tech startup trade corridors and food carnivals core." },
              { title: "Cultural Hub (Kolkata)", icon: Music, desc: "Core base for music talent hunts and theater programs." },
              { title: "Central Hub (Hyderabad)", icon: Trophy, desc: "Houses the premier classical and modern dance battle arenas." },
              { title: "Coastal Axis (Goa)", icon: Flame, desc: "Directing summer fusion music carnivals and beach networks." },
              { title: "Educational Hub (Chennai)", icon: GraduationCap, desc: "Directing school & college national brainiac quiz contests." }
            ].map((hub, idx) => {
              const Icon = hub.icon;
              return (
                <div key={idx} className="glass-panel p-6 rounded-2xl border-[rgba(255,255,255,0.06)] hover-neon-violet flex flex-col gap-3 bg-gray-900/10">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Icon size={18} />
                  </div>
                  <h4 className="font-bold text-white text-sm font-primary uppercase tracking-tight">{hub.title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed font-secondary">{hub.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. SPOTLIGHT HEADLINERS */}
      <section id="spotlight-section" className="section-dark-1 section-padding-medium border-t border-[rgba(255,255,255,0.02)]">
        <div className="container">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-black text-white font-primary uppercase">SPOTLIGHT HEADLINERS</h2>
              <p className="text-gray-500 text-xs mt-1.5">High-demand trending programs with limited VIP availability.</p>
            </div>
            <Link href="/events" className="text-xs font-bold text-pink-400 hover:text-white transition-colors uppercase tracking-wider">
              See All →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredHeadliners.map((slide) => (
              <div 
                key={slide.id}
                className="glass-panel overflow-hidden flex flex-col justify-between border-[rgba(255,255,255,0.06)] bg-[#0c1222]/80 rounded-2xl hover-neon-pink group"
              >
                {/* Image banner with tags */}
                <div className="h-48 relative overflow-hidden">
                  <img src={slide.bannerUrl} alt={slide.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                  {/* Dual Tags top-left */}
                  <div className="absolute top-3.5 left-3.5 flex gap-2">
                    <span className="bg-pink-600/90 text-white font-mono text-[8px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                      SELLING FAST
                    </span>
                    <span className="bg-gray-950/80 backdrop-blur-sm text-cyan-400 font-mono text-[8px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                      {slide.category.toUpperCase().split(" ")[0]}
                    </span>
                  </div>
                  {/* Location Overlay bottom-left */}
                  <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1.5 bg-gray-950/70 backdrop-blur-xs px-2.5 py-1 rounded text-[9px] text-gray-300 font-medium">
                    <MapPin size={10} className="text-cyan-400" />
                    <span>{slide.venue.split(",")[0]}</span>
                  </div>
                </div>

                {/* Below Image details */}
                <div className="p-6 flex flex-col gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold font-mono">(95 reviews)</span>
                  </div>

                  <h3 className="font-extrabold text-white text-base font-primary line-clamp-1 group-hover:text-cyan-400 transition-colors">
                    {slide.name}
                  </h3>
                  <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed font-secondary">
                    {slide.summary}
                  </p>

                  <div className="pt-4 border-t border-gray-800 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[8px] text-gray-500 block font-mono">ADMISSION FROM</span>
                      <span className="text-white font-black text-sm font-primary">
                        ₹{slide.ticketPrices.length > 0 ? slide.ticketPrices[0].price : "Free"}
                      </span>
                    </div>
                    <Link href={`/events/${slide.slug}`} className="text-xs font-bold text-pink-400 hover:text-white transition-colors flex items-center gap-1.5">
                      Book Now <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. NATIONAL ARENAS (COMPETITIONS) */}
      <section className="section-dark-2 section-padding-medium border-t border-[rgba(255,255,255,0.02)]">
        <div className="container">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-black text-white font-primary uppercase">NATIONAL ARENAS</h2>
              <p className="text-gray-500 text-xs mt-1.5">Claim your crown. Register as a participant to win major prize pools.</p>
            </div>
            <Link href="/competitions" className="text-xs font-bold text-purple-400 hover:text-white transition-colors uppercase tracking-wider">
              See All Competitions →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nationalArenas.map((arena) => (
              <div key={arena.id} className="glass-panel overflow-hidden relative h-72 rounded-3xl group border-[rgba(255,255,255,0.06)] hover-neon-violet">
                <img src={arena.bannerUrl} alt={arena.name} className="w-full h-full object-cover filter brightness-[0.35] group-hover:scale-102 transition-transform duration-700" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                
                {/* Badges top-left */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="bg-purple-900/80 border border-purple-500/30 text-purple-300 font-mono text-[9px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                    PRIZE POOL: ₹1,50,000+
                  </span>
                  <span className="text-pink-400 font-mono text-[8px] font-bold tracking-widest uppercase text-left">
                    {arena.city.toUpperCase()} AUDITIONS
                  </span>
                </div>

                {/* Bottom details content */}
                <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end gap-6">
                  <div className="max-w-[200px] sm:max-w-xs text-left">
                    <span className="text-[9px] text-gray-500 font-mono font-bold uppercase tracking-wider">{arena.category}</span>
                    <h3 className="text-lg sm:text-xl font-bold text-white font-primary mt-1 line-clamp-1">{arena.name}</h3>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[8px] text-gray-500 block uppercase leading-none font-mono">ENTRY FEE</span>
                      <span className="font-bold text-white text-sm">₹{arena.registrationFee}</span>
                    </div>
                    <Link 
                      href={`/events/${arena.slug}`}
                      className="btn bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg hover:shadow-neon-violet transition-all"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. MEGA CARNIVALS */}
      <section className="section-dark-1 section-padding-medium border-t border-[rgba(255,255,255,0.02)]">
        <div className="container">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-black text-white font-primary uppercase">MEGA CARNIVALS</h2>
              <p className="text-gray-500 text-xs mt-1.5">Massive weekend food and heritage festivals open for families and visitors.</p>
            </div>
            <Link href="/events" className="text-xs font-bold text-cyan-400 hover:text-white transition-colors uppercase tracking-wider">
              Explore Festivals →
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            {megaCarnivals.map((fest) => (
              <div 
                key={fest.id}
                className="glass-panel overflow-hidden grid grid-cols-1 md:grid-cols-12 rounded-2xl hover:border-gray-800 hover-neon-cyan md:h-[220px] bg-slate-950/20"
              >
                {/* Image Left */}
                <div className="md:col-span-4 h-48 md:h-full relative overflow-hidden">
                  <img src={fest.bannerUrl} alt={fest.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3.5 left-3.5 bg-red-600 text-white font-mono text-[8px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                    MEGA FEST
                  </div>
                </div>

                {/* Content Right */}
                <div className="md:col-span-8 p-6 md:p-8 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-semibold uppercase">
                      <span className="flex items-center gap-1"><MapPin size={10} className="text-cyan-400" /> {fest.venue.split(",")[0]}, {fest.city}</span>
                      <span>•</span>
                      <span>{fest.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white font-primary">{fest.name}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed font-secondary">
                      {fest.summary}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-900 mt-2">
                    <div>
                      <span className="text-[8px] text-gray-500 block uppercase leading-none font-mono">TICKET FROM</span>
                      <span className="font-bold text-white text-sm">₹{fest.ticketPrices[0]?.price || 150}</span>
                    </div>
                    <Link 
                      href={`/events/${fest.slug}`}
                      className="btn bg-gray-900 border border-gray-800 hover:bg-slate-950 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all"
                    >
                      Get Badge
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. INNOVATION TRADE EXPOS */}
      <section className="section-dark-2 section-padding-medium border-t border-[rgba(255,255,255,0.02)]">
        <div className="container">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-black text-white font-primary uppercase">INNOVATION TRADE EXPOS</h2>
              <p className="text-gray-500 text-xs mt-1.5">Setting platforms for corporate business networking, pitch arenas, and product exhibitions.</p>
            </div>
            <Link href="/events" className="text-xs font-bold text-cyan-400 hover:text-white transition-colors uppercase tracking-wider">
              See All Expos →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {innovationExpos.map((expo) => (
              <div 
                key={expo.id}
                className="glass-panel p-6 rounded-2xl border-[rgba(255,255,255,0.06)] hover-neon-pink grid grid-cols-1 sm:grid-cols-12 gap-5 bg-gray-900/10"
              >
                <div className="sm:col-span-4 h-32 rounded-xl overflow-hidden shrink-0">
                  <img src={expo.bannerUrl} alt={expo.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="sm:col-span-8 flex flex-col justify-between gap-3 text-left">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-2 text-[8px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                      <span>{expo.category.toUpperCase()}</span>
                      <span>•</span>
                      <span>{expo.city.toUpperCase()}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm font-primary line-clamp-1">{expo.name}</h4>
                    <p className="text-gray-400 text-[11px] leading-relaxed font-secondary line-clamp-2">{expo.summary}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-950 pt-3 mt-1">
                    <div>
                      <span className="text-[8px] text-gray-500 block uppercase leading-none font-mono">ADMISSION</span>
                      <span className="font-bold text-white text-xs">₹{expo.ticketPrices[0]?.price || "Free"}</span>
                    </div>
                    <Link 
                      href={`/events/${expo.slug}`}
                      className="btn bg-gray-950 hover:bg-slate-900 border border-gray-800 text-white text-[10px] font-bold px-4.5 py-2.5 rounded-xl"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. TRENDING NEAR YOU (WHAT'S HOT IN CITY) */}
      <section className="section-dark-1 section-padding-large border-y border-[rgba(255,255,255,0.04)] px-4">
        <div className="container flex flex-col gap-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-mono tracking-widest text-pink-500 font-bold uppercase">🔥 TRENDING NEAR YOU</span>
              <h2 className="text-3xl md:text-4xl font-black text-white font-primary uppercase mt-1">
                WHAT'S HOT IN <span className="text-pink-500">{trendingCity.toUpperCase()}</span>
              </h2>
            </div>

            {/* City Selector Tabs */}
            <div className="flex bg-gray-900/60 border border-gray-800 p-1.5 rounded-xl overflow-x-auto max-w-full shrink-0">
              {["New Delhi", "Mumbai", "Bengaluru", "Chennai"].map((city) => (
                <button 
                  key={city}
                  onClick={() => setTrendingCity(city)}
                  className={`px-4.5 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
                    trendingCity === city ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* City Specific Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingEvents[trendingCity as keyof typeof trendingEvents].map((evt) => (
              <div 
                key={evt.id} 
                className="glass-panel overflow-hidden flex flex-col h-full bg-[#0a0f1e]/60 hover-neon-pink group"
              >
                <div className="h-44 relative overflow-hidden">
                  <img src={evt.image} alt={evt.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                  
                  {/* Rating Badge Overlay */}
                  <div className="absolute top-3.5 left-3.5 bg-gray-950/80 backdrop-blur-sm px-2.5 py-1 rounded flex items-center gap-1.5 text-[10px] text-amber-400 font-bold font-mono">
                    <Star size={11} fill="currentColor" />
                    <span>{evt.rating}</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-grow gap-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] text-cyan-400 font-mono font-bold uppercase tracking-wider">{evt.category}</span>
                    <h3 className="font-bold text-white text-base font-primary line-clamp-1">{evt.title}</h3>
                    <p className="text-gray-400 text-xs font-secondary line-clamp-2 leading-relaxed">{evt.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-900 flex justify-between items-center mt-1">
                    <div>
                      <span className="text-[8px] text-gray-500 block uppercase leading-none font-mono">VENUE PRICE</span>
                      <span className="font-bold text-white text-xs">₹{evt.price}</span>
                    </div>
                    <Link 
                      href={`/events`}
                      className="btn bg-pink-500 hover:bg-pink-600 text-slate-950 text-[10px] font-black px-4.5 py-2.5 rounded-lg shadow-md hover:shadow-neon-pink"
                    >
                      Get Badge
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 10. SEASON SNAPSHOTS (GALLERY PREVIEW) */}
      <section className="section-dark-2 section-padding-medium border-t border-[rgba(255,255,255,0.02)]">
        <div className="container">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-white font-primary uppercase">SEASON SNAPSHOTS</h2>
              <p className="text-gray-500 text-xs mt-1.5">Archived passholder snapshots captured across metropolitan arenas.</p>
            </div>
            <Link href="/gallery" className="text-xs font-bold text-indigo-400 hover:text-white transition-colors uppercase tracking-wider">
              View Full Gallery →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { title: "Odyssey Arena", category: "CULTURAL", image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80" },
              { title: "Sufi Symphony", category: "MUSIC", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=400&q=80" },
              { title: "Dance Solo", category: "DANCE CLASH", image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80" },
              { title: "Startup Expo", category: "TRADE STALL", image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=400&q=80" },
              { title: "Couture Walk", category: "FASHION SHOW", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80" },
              { title: "Street Eats", category: "FOOD FEST", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80" }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="relative h-44 rounded-xl overflow-hidden group glass-panel border-[rgba(255,255,255,0.06)] hover-neon-violet"
              >
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 to-transparent"></div>
                
                {/* Category label overlay bottom-left */}
                <div className="absolute bottom-3 left-3 flex flex-col gap-0.5 text-left">
                  <span className="text-[7px] text-cyan-400 font-mono font-bold tracking-widest uppercase">{item.category}</span>
                  <span className="text-white font-bold text-[9px] line-clamp-1">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. TRUSTED BRAND PARTNERS & ALLIANCE PATRONS */}
      <section className="border-y border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] py-12">
        <div className="container">
          <p className="text-center text-[10px] font-mono tracking-widest text-gray-500 font-bold uppercase mb-8">
            TRUSTED BRAND PARTNERS & ALLIANCE PATRONS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-35 hover:opacity-75 transition-opacity duration-300">
            {["TATA", "Airtel", "Paytm", "Reliance", "Bisleri", "BookMyShow"].map((logo) => (
              <div 
                key={logo} 
                className="font-black text-lg sm:text-2xl text-white font-primary tracking-tight"
              >
                {logo.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. TRUSTED BY THOUSANDS (TESTIMONIALS) */}
      <section className="section-dark-1 section-padding-medium border-t border-[rgba(255,255,255,0.02)]">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-2">
            <span className="text-[10px] font-mono tracking-widest text-gray-500 font-bold uppercase">VERIFIED BADGE HOLDERS</span>
            <h2 className="text-3xl font-black text-white font-primary uppercase">TRUSTED BY THOUSANDS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "Securing my Paddock Exhibitor VIP pass was incredibly simple. The Razorpay checkout was fast and scanning the NFC chip at BIC Noida turnstiles worked instantly.", author: "Rajesh Malhotra", role: "Auto Expo Sponsor" },
              { quote: "Registering for Nataraja Dance Battle was seamless. The verification code simulation cleared email doubts and generating my participant ID pass took under 3 minutes.", author: "Divya Nair", role: "Contestant Dancer" },
              { quote: "Recharge Nation is the central directory event platform. Booking a food fest ticket in Bengaluru was secure and downloading the printable PDF pass was very convenient.", author: "Karthik Subramaniam", role: "General Badge Holder" }
            ].map((t, idx) => (
              <div key={idx} className="glass-panel p-8 flex flex-col justify-between gap-6 hover-neon-violet bg-gray-900/5">
                <div className="flex flex-col gap-4 text-left">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-400 italic text-xs leading-relaxed font-secondary">"{t.quote}"</p>
                </div>
                <div className="border-t border-gray-800 pt-4 flex flex-col gap-0.5 text-left">
                  <h4 className="font-bold text-white text-xs font-primary uppercase tracking-tight">{t.author}</h4>
                  <p className="text-gray-500 text-[10px] uppercase font-mono font-medium">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. RECHARGE CHRONICLE (BLOG PREVIEW) */}
      <section className="section-dark-2 section-padding-medium border-t border-[rgba(255,255,255,0.02)]">
        <div className="container">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-white font-primary uppercase">RECHARGE CHRONICLE</h2>
              <p className="text-gray-500 text-xs mt-1.5">Exclusives, design guides, and announcement essays from our staff editors.</p>
            </div>
            <Link href="/blogs" className="text-xs font-bold text-pink-400 hover:text-white transition-colors uppercase tracking-wider">
              Read Chronicle →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: "Sustainable Fabric Runways: sustainable fashion week", author: "Rhea Kapoor", role: "Style Bureau lead", date: "July 12, 2026", excerpt: "Analyzing sustainable ethno-weaves, handloom khadi crossovers, and modeling audition timelines for Taj Lands End Ballroom week.", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80" },
              { title: "Mastering Stage Auditions: Choreo battle checklist", author: "Vikram Bose", role: "Jury Coordinator", date: "June 28, 2026", excerpt: "From prop clearances to acoustics sound prep, here is the complete guide for contesting crews ahead of the Hyderabad cup.", image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80" }
            ].map((essay, idx) => (
              <div key={idx} className="glass-panel overflow-hidden flex flex-col justify-between hover-neon-cyan group">
                <div>
                  <div className="h-56 overflow-hidden relative">
                    <img src={essay.image} alt={essay.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col gap-3 text-left">
                    <div className="flex flex-wrap items-center gap-3 text-[9px] font-mono text-gray-500 font-bold uppercase">
                      <span>BY {essay.author} ({essay.role})</span>
                      <span>•</span>
                      <span>{essay.date}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white font-primary line-clamp-1 group-hover:text-cyan-400 transition-colors mt-1">
                      {essay.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed font-secondary line-clamp-2">
                      {essay.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 md:p-8 pt-0 flex justify-end">
                  <Link href="/blogs" className="text-xs font-bold text-cyan-400 hover:text-white transition-colors flex items-center gap-1">
                    Read Essay <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. VIP GATEWAY NEWSLETTER BANNER */}
      <section className="section-dark-1 section-padding-medium border-t border-[rgba(255,255,255,0.02)] bg-[#090e1a]/80">
        <div className="container">
          <div className="p-8 md:p-12 text-center rounded-3xl bg-[#0f1629] border border-gray-800/80 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full filter blur-xl"></div>
            
            <span className="text-[10px] font-mono tracking-widest text-pink-500 font-bold uppercase">VIP GATEWAY</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-primary uppercase tracking-tight max-w-md leading-tight">
              GET SECRET PRE-SALE ACCESS ALERTS
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm max-w-sm font-secondary leading-relaxed">
              Enter your corporate or student email to secure discount codes and early-bird notifications before tickets sell out.
            </p>

            {newsletterSubscribed ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-4 text-xs max-w-sm flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Secret alert pass activated. Welcome to the crew!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row w-full gap-3 max-w-md mt-2 relative z-10">
                <input 
                  type="email" 
                  placeholder="you@company.com" 
                  className="form-input flex-grow text-xs rounded-xl bg-gray-950 border-gray-800 text-white placeholder-gray-500 focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  className="py-3.5 px-8 rounded-xl font-bold text-xs shadow-lg transition-all font-primary uppercase tracking-wide cursor-pointer text-white flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#ec4899' }}
                >
                  JOIN CREW
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
