"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, Calendar, MapPin, Trophy, ArrowRight, Star, Heart, 
  Flame, Compass, ChevronRight, Music, Sparkles, Paintbrush, 
  HelpCircle, Eye, Mail, Award, CheckCircle, Ticket, Layers, 
  Laptop, Briefcase, GraduationCap, Globe, Shield, RefreshCw, ChevronLeft, BookOpen, Send
} from "lucide-react";
import { ApiClient, Sponsor, GalleryItem } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import EventCard from "@/components/EventCard";
import CompetitionCard from "@/components/CompetitionCard";

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

const HOMEPAGE_EVENTS = [
  {
    id: "ev-1",
    slug: "recharge-cultural-odyssey-2026",
    name: "ABHYUDAYA - NATIONAL CULTURAL MEGA FESTIVAL",
    category: "Festivals",
    city: "New Delhi",
    price: 499,
    date: "2026-10-14",
    rating: 4.9,
    reviews: 1420,
    bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    desc: "A grand celebration of Indian heritage, featuring classical dances, folk music, and theatrical displays.",
    tag: "SELLING FAST"
  },
  {
    id: "ev-6",
    slug: "india-smart-city-tech-trade-expo-2026",
    name: "INDIA SMART-CITY & TECH TRADE EXPO 2026",
    category: "Expos",
    city: "Mumbai",
    price: 199,
    date: "2026-11-04",
    rating: 4.7,
    reviews: 840,
    bannerUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80",
    desc: "Exhibiting smart infrastructure, next-generation IoT hardware, clean energy, and mobility techs.",
    tag: "SELLING FAST"
  },
  {
    id: "ev-4",
    slug: "deccan-founders-vcs-summit",
    name: "DECCAN FOUNDERS & VCS SUMMIT",
    category: "Business Networking",
    city: "Bengaluru",
    price: 1299,
    date: "2026-09-22",
    rating: 4.8,
    reviews: 310,
    bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
    desc: "Connecting high-growth startups, venture capitalists, corporate sponsors, and tech leaders."
  },
  {
    id: "ev-2",
    slug: "advanced-aero-modeling-uav-workshop",
    name: "ADVANCED AERO-MODELING & UAV WORKSHOP",
    category: "Workshops",
    city: "Chennai",
    price: 2499,
    date: "2026-12-05",
    rating: 4.9,
    reviews: 195,
    bannerUrl: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=600&q=80",
    desc: "Master the design, construction and flying of unmanned aerial vehicles and modern RC aero-models."
  }
];

const ARENAS = [
  {
    id: "ar-1",
    name: "MISS & MR. TRADITIONAL INDIA 2026",
    city: "BENGALURU",
    prizePool: "25,00,000",
    registrationFee: 1500,
    bannerUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80",
    desc: "National grand finale showcasing handloom couture, traditional attire audits, and multi-state cultural representation."
  },
  {
    id: "ar-2",
    name: "NATARAJA INDIAN CLASSICAL & CONTEMPORARY DANCE CLASH",
    city: "NEW DELHI",
    prizePool: "5,00,000",
    registrationFee: 750,
    bannerUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
    desc: "High-octane classical and modern fusion solo/group battle with top-tier choreographer panels and media coverage."
  },
  {
    id: "ar-3",
    name: "SWARANJALI NATIONAL VOCAL TALENT HUNT",
    city: "KOLKATA",
    prizePool: "3,50,000",
    registrationFee: 500,
    bannerUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    desc: "A search for India's finest voices, featuring classical thumri, light music, and contemporary vocal face-offs."
  }
];

const CARNIVALS = [
  {
    id: "fest-1",
    slug: "recharge-cultural-odyssey-2026",
    name: "ABHYUDAYA - NATIONAL CULTURAL MEGA FESTIVAL",
    city: "New Delhi",
    date: "2026-10-14",
    bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "fest-2",
    slug: "grand-dandiya-utsav-navratri-2026",
    name: "GRAND DANDIYA UTSAV - NAVRATRI CELEBRATIONS 2026",
    city: "Mumbai",
    date: "2026-10-18",
    bannerUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "fest-3",
    slug: "recharge-cultural-odyssey-2026", // link to existing details or lists
    name: "BENGALURU SUNBURN FUSION & FOOD CARNIVAL 2026",
    city: "Bengaluru",
    date: "2026-11-05",
    bannerUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "fest-4",
    slug: "recharge-cultural-odyssey-2026", // link to existing details or lists
    name: "SUNBURN GOA FESTIVAL & BEACH CARNIVAL 2026",
    city: "Goa",
    date: "2026-12-28",
    bannerUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80"
  }
];

const EXPOS = [
  {
    id: "exp-1",
    slug: "india-smart-city-tech-trade-expo-2026",
    name: "INDIA SMART-CITY & TECH TRADE EXPO 2026",
    city: "Mumbai",
    bannerUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "exp-2",
    slug: "ev-future-mobility-india-expo-2026",
    name: "EV & FUTURE MOBILITY INDIA EXPO 2026",
    city: "Chennai",
    bannerUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "exp-3",
    slug: "india-smart-city-tech-trade-expo-2026", // link to existing details or lists
    name: "INDIA DEFENSE & AEROSPACE TECH EXPO 2026",
    city: "New Delhi",
    bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "exp-4",
    slug: "india-smart-city-tech-trade-expo-2026", // link to existing details or lists
    name: "SUSTAINABLE ENERGY & GREEN GRID EXPO 2026",
    city: "Hyderabad",
    bannerUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80"
  }
];

const ESSAYS = [
  {
    title: "THE REVIVAL OF TRADITIONAL HANDLOOM IN MODERN INDIAN PAGEANTRY",
    author: "SUNITA MEHRA",
    role: "FASHION LEAD",
    date: "Jun 28, 2026",
    excerpt: "How Miss & Mr. Traditional India 2026 is redirecting global runway attention to local weaving clusters in Benaras, Pochampally, and Kanjeevaram.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80"
  },
  {
    title: "DESIGNING HIGHLY FRICTIONLESS EVENT TICKETING SYSTEMS FOR SCALE",
    author: "RAJIV MALHOTRA",
    role: "LEAD ARCHITECT",
    date: "May 14, 2026",
    excerpt: "Inside the engineering patterns that handle high-concurrency ticket surges during multi-city festival announcements in India.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80"
  }
];

const TESTIMONIALS = [
  { quote: "Booking the VIP tickets for Abhyudaya was incredibly smooth on Recharge Nation. The Smart QR wristband scanned immediately at Gates 1 and 3 without any check-in friction. Best ticketing experience in India.", author: "Rajesh Malhotra", role: "Auto Expo Sponsor" },
  { quote: "I registered as a participant for Mr. Traditional India. The Participant ID Badge looked beautiful with my headshot, and security scanned me straight backstage in seconds. Extremely organized platform.", author: "Divya Nair", role: "Contestant Dancer" },
  { quote: "We booked visitor passes for our college coding club to visit the Mumbai Tech Trade Expo. Scanning was extremely rapid. The interactive floor plan links inside our dashboard saved us so much time.", author: "Karthik Subramaniam", role: "General Badge Holder" },
  { quote: "The runway coordinators at Miss & Mr. Traditional India 2026 were top-tier. My designer dress was handled with premium care, and our profile was broadcasted to major fashion agency sponsors.", author: "Ananya Sharma", role: "Fashion Designer" },
  { quote: "Managing a corporate panel at Pragati Maidan can be chaotic, but the real-time registration desk dashboard let us track attendee metrics and check-in speeds with absolute accuracy.", author: "Vikram Seth", role: "Summit Convener" },
  { quote: "Sunburn Goa beach carnival was unmatched! Getting my pass verified digitally via the WhatsApp ticket bot took less than 15 seconds. No queues, no hassle, just pure music vibes.", author: "Priya Patel", role: "Festival Visitor" },
  { quote: "I love the clean interface of the national events portal. Filtering events by category (Expos, Carnivals, Arenas) is fast, and the layout looks so beautiful in both light and dark backgrounds.", author: "Rohan Gupta", role: "Tech Enthusiast" },
  { quote: "Our college cultural committee partnered with Recharge of Nation to host our regional zonal qualifiers. The platform helped us sell 3,000 passes in less than 48 hours without any downtime.", author: "Sneha Reddy", role: "College Ambassador" },
  { quote: "Highly recommend getting the Premium VIP pass! The exclusive lounge access, early check-in at the stadium, and complimentary delegate kit made the entire event feel extremely high-end.", author: "Amit Verma", role: "VIP Pass Holder" }
];

export default function HomePage() {
  const router = useRouter();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [trendingCity, setTrendingCity] = useState("New Delhi");
  
  // Custom API seeded lists states
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("All");
  const [searchCity, setSearchCity] = useState("All");
  const [searchDate, setSearchDate] = useState("All");

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Next slide automation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch list data
  useEffect(() => {
    const fetchData = async () => {
      const allSponsors = await ApiClient.getSponsors();
      const allGallery = await ApiClient.getGalleryItems();
      setSponsors(allSponsors);
      setGallery(allGallery);
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let url = `/events?`;
    if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
    if (searchCategory !== "All") url += `category=${encodeURIComponent(searchCategory)}&`;
    if (searchCity !== "All") url += `location=${encodeURIComponent(searchCity)}&`;
    if (searchDate !== "All") url += `price=${encodeURIComponent(searchDate)}&`; // generic filter mapping
    router.push(url);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      console.log(`[MOCK EMAIL SMTP] Alert Crew joined: ${newsletterEmail}`);
    }
  };

  const activeHero = HERO_SLIDES[currentSlide];

  // Dynamic Trending Events List Based on City selection
  const trendingEvents = {
    "New Delhi": [
      { id: "tr-1", title: "ABHYUDAYA - NATIONAL CULTURAL MEGA FESTIVAL", category: "FESTIVALS", rating: 4.9, reviews: 1420, venue: "Jawaharlal Nehru Stadium", price: 299, image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80", desc: "India's largest multi-state heritage festival celebrating folk, cuisine, and design." },
      { id: "tr-2", title: "INDICORP LEADERSHIP & SPORTS SUMMIT 2026", category: "CORPORATE", rating: 4.6, reviews: 220, venue: "Pragati Maidan", price: 1500, image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80", desc: "Strategic corporate leadership forums, panel discussions, team building audits, and CEO mixers." },
      { id: "tr-3", title: "INDO-SEC: NATIONAL CYBER DEFENCE CONFERENCE", category: "CONFERENCES", rating: 4.6, reviews: 450, venue: "JNS Auditorium", price: 799, image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80", desc: "National security panel debates, threat matrix modules, white-hat workshops, and digital assets audit." }
    ],
    "Mumbai": [
      { id: "tr-4", title: "GRAND DANDIYA UTSAV - NAVRATRI CELEBRATIONS 2026", category: "FESTIVALS", rating: 4.9, reviews: 980, venue: "Jio Convention Centre", price: 350, image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80", desc: "Dance to traditional beats with India's top Garba artists, premium catering, and grand awards." },
      { id: "tr-5", title: "INDIA SMART-CITY & TECH TRADE EXPO 2026", category: "EXPOS", rating: 4.8, reviews: 840, venue: "Jio World Hall", price: 199, image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80", desc: "Exhibiting smart infrastructure, next-generation IoT hardware, clean energy, and mobility techs." }
    ],
    "Bengaluru": [
      { id: "tr-6", title: "DECCAN FOUNDERS & VCS SUMMIT", category: "BUSINESS NETWORKING", rating: 4.8, reviews: 310, venue: "Palace Grounds", price: 1299, image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80", desc: "Connecting high-growth startups, venture capitalists, corporate sponsors, and tech leaders." }
    ],
    "Chennai": [
      { id: "tr-7", title: "ADVANCED AERO-MODELING & UAV WORKSHOP", category: "WORKSHOPS", rating: 4.9, reviews: 195, venue: "IIT Madras Hall", price: 2499, image: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=600&q=80", desc: "Master the design, construction and flying of unmanned aerial vehicles and modern RC aero-models." }
    ]
  };

  return (
    <div className="flex flex-col text-left">
      
      {/* 1. HERO BANNER (CAROUSEL) */}
      <section className="relative min-h-[80vh] lg:min-h-[85vh] flex items-center justify-center pt-24 pb-20 overflow-hidden dark-bg">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-102"
          style={{ backgroundImage: `url('${activeHero.image}')` }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/50 backdrop-blur-xs"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:30px_30px] opacity-35"></div>

        <div className="container relative z-10">
          <div className="max-w-4xl text-left flex flex-col gap-6">
            <span className="text-pink-500 font-mono text-xs font-black tracking-widest uppercase">
              {activeHero.badge}
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl tracking-tighter leading-none font-primary text-white shadow-text-glow uppercase">
              {activeHero.titleLine1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-indigo-400 to-cyan-400 font-primary">
                {activeHero.titleLine2}
              </span>
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base font-secondary leading-relaxed max-w-xl">
              {activeHero.desc}
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link href={`/events/${activeHero.slug}`} className="btn btn-primary bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold text-xs tracking-wide rounded-xl px-8 py-3.5 shadow-neon-pink">
                BOOK PASS
              </Link>
              <Link href="/events" className="btn btn-secondary bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold text-xs rounded-xl px-6 py-3.5">
                EXPLORE ALL
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLOATING SEARCH PORTAL */}
      <div className="container relative z-20">
        <form onSubmit={handleSearchSubmit} className="max-w-5xl mx-auto bg-white border border-slate-200/80 shadow-[0_15px_50px_rgba(0,0,0,0.06)] rounded-[22px] p-4 flex flex-col md:flex-row items-center gap-3 -mt-8">
          <div className="flex-[1.5] w-full relative">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder="Search Events, Artists, Venues..." 
              className="w-full text-xs rounded-xl bg-slate-50 border border-slate-100 pl-10 pr-4 py-3.5 text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 w-full relative">
            <Sparkles className="absolute left-3.5 top-3.5 text-pink-500" size={15} />
            <select 
              className="w-full text-xs rounded-xl bg-slate-50 border border-slate-100 pl-10 pr-4 py-3.5 text-slate-700 outline-none cursor-pointer"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
            >
              <option value="All">All Categories / Segments</option>
              <option value="Festivals">Festivals</option>
              <option value="Competitions">Competitions</option>
              <option value="Expos">Expos</option>
              <option value="Workshops">Workshops</option>
              <option value="Corporate">Corporate</option>
              <option value="School & College">School & College</option>
              <option value="Business Networking">Business Networking</option>
            </select>
          </div>

          <div className="flex-1 w-full relative">
            <MapPin className="absolute left-3.5 top-3.5 text-indigo-500" size={15} />
            <select 
              className="w-full text-xs rounded-xl bg-slate-50 border border-slate-100 pl-10 pr-4 py-3.5 text-slate-700 outline-none cursor-pointer"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            >
              <option value="All">All Cities</option>
              <option value="New Delhi">New Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Chennai">Chennai</option>
              <option value="Kolkata">Kolkata</option>
            </select>
          </div>

          <div className="flex-1 w-full relative">
            <Calendar className="absolute left-3.5 top-3.5 text-cyan-500" size={15} />
            <select 
              className="w-full text-xs rounded-xl bg-slate-50 border border-slate-100 pl-10 pr-4 py-3.5 text-slate-700 outline-none cursor-pointer"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            >
              <option value="All">Any Date</option>
              <option value="Today">Today</option>
              <option value="Weekend">This Weekend</option>
              <option value="Next30">Next 30 Days</option>
            </select>
          </div>

          <button 
            type="submit"
            className="bg-[#ec4899] hover:bg-[#db2777] text-white p-3.5 rounded-xl flex items-center justify-center shrink-0 w-full md:w-auto cursor-pointer transition-colors duration-200"
          >
            <Search size={16} />
          </button>
        </form>
      </div>

      {/* 3. BROWSE SEGMENT FAST-TRACKS */}
      <section className="py-12 bg-[#fbfcfd]">
        <div className="container">
          <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase">Browse Segment Fast-Tracks</span>
          <div className="flex flex-wrap gap-2.5 mt-3">
            {[
              { name: "Festivals", icon: Flame, bg: "bg-red-50/65", border: "border-red-100", text: "text-red-650" },
              { name: "Competitions", icon: Trophy, bg: "bg-amber-50/65", border: "border-amber-100", text: "text-amber-650" },
              { name: "Expos", icon: Laptop, bg: "bg-cyan-50/65", border: "border-cyan-100", text: "text-cyan-650" },
              { name: "Workshops", icon: BookOpen, bg: "bg-purple-50/65", border: "border-purple-100", text: "text-purple-650" },
              { name: "Corporate", icon: Briefcase, bg: "bg-indigo-50/65", border: "border-indigo-100", text: "text-indigo-650" },
              { name: "School & College", icon: GraduationCap, bg: "bg-emerald-50/65", border: "border-emerald-100", text: "text-emerald-650" },
              { name: "Business Networking", icon: Globe, bg: "bg-orange-50/65", border: "border-orange-100", text: "text-orange-650" }
            ].map((seg) => {
              const Icon = seg.icon;
              return (
                <Link
                  key={seg.name}
                  href={`/events?category=${seg.name}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border ${seg.bg} ${seg.border} ${seg.text} text-xs font-bold hover:scale-102 transition-transform duration-200`}
                >
                  <Icon size={12} />
                  <span>{seg.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. DISCOVER NATIONAL HUBS */}
      <section className="py-16 bg-[#fbfcfd] border-t border-slate-100">
        <div className="container">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-8">
            <div>
              <h2 className="text-[20px] font-black tracking-tight text-slate-900 font-primary uppercase">DISCOVER NATIONAL HUBS</h2>
              <p className="text-slate-500 text-xs mt-1 font-secondary">Explore specialized arenas across the country. Tap a card to enter.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { title: "Festivals", icon: Flame, desc: "Grand cultural beats & live stage arts.", bg: "bg-red-50/80", text: "text-red-500", border: "border-red-100/50" },
              { title: "Competitions", icon: Trophy, desc: "National pageants & skill face-offs.", bg: "bg-amber-50/80", text: "text-amber-500", border: "border-amber-100/50" },
              { title: "Expos", icon: Laptop, desc: "Smart city tech, gadgets & showcases.", bg: "bg-cyan-50/80", text: "text-cyan-500", border: "border-cyan-100/50" },
              { title: "Workshops", icon: BookOpen, desc: "Masterclasses & interactive craft jams.", bg: "bg-purple-50/80", text: "text-purple-500", border: "border-purple-100/50" },
              { title: "Corporate", icon: Briefcase, desc: "Strategic leadership summits & panels.", bg: "bg-indigo-50/80", text: "text-indigo-500", border: "border-indigo-100/50" },
              { title: "School & College", icon: GraduationCap, desc: "Inter-collegiate fests & youth talent.", bg: "bg-emerald-50/80", text: "text-emerald-500", border: "border-emerald-100/50" },
              { title: "Business Networking", icon: Globe, desc: "High-tier connections & founder mixers.", bg: "bg-orange-50/80", text: "text-orange-500", border: "border-orange-100/50" }
            ].map((hub, idx) => {
              const Icon = hub.icon;
              return (
                <Link 
                  key={idx} 
                  href={`/events?category=${hub.title}`}
                  className="bg-white p-5 rounded-[22px] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[210px] group"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${hub.bg} border ${hub.border} group-hover:scale-105 transition-transform duration-300`}>
                    <Icon size={18} className={hub.text} />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-[12.5px] font-primary uppercase tracking-wider mt-4">{hub.title}</h4>
                  <p className="text-slate-500 text-[10.5px] leading-relaxed font-secondary mt-2.5 max-w-[130px] mx-auto">{hub.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. SPOTLIGHT HEADLINERS */}
      <section className="py-16 bg-[#fbfcfd] border-t border-slate-100">
        <div className="container">
          <div className="flex items-end justify-between border-b border-slate-200/80 pb-4 mb-8">
            <div>
              <h2 className="text-[20px] font-black text-slate-900 font-primary uppercase">SPOTLIGHT HEADLINERS</h2>
              <p className="text-slate-500 text-xs mt-1 font-secondary">Our highest-rated national highlights. Slide left or right to explore.</p>
            </div>
            <Link href="/events" className="text-xs font-bold text-pink-500 hover:text-pink-650 transition-colors uppercase tracking-wider flex items-center gap-1">
              <span>See All</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOMEPAGE_EVENTS.map((evt) => (
              <EventCard key={evt.id} {...evt} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. NATIONAL ARENAS */}
      <section className="py-16 bg-[#fbfcfd] border-t border-slate-100">
        <div className="container">
          <div className="flex items-end justify-between border-b border-slate-200/80 pb-4 mb-8">
            <div>
              <h2 className="text-[20px] font-black text-slate-900 font-primary uppercase">NATIONAL ARENAS</h2>
              <p className="text-slate-500 text-xs mt-1 font-secondary">Claim your crown. Register as a participant to win major prize pools.</p>
            </div>
            <Link href="/competitions" className="text-xs font-bold text-indigo-500 hover:text-indigo-650 transition-colors uppercase tracking-wider flex items-center gap-1">
              <span>See All Competitions</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARENAS.map((arena) => (
              <CompetitionCard key={arena.id} {...arena} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. MEGA CARNIVALS */}
      <section className="py-16 bg-[#fbfcfd] border-t border-slate-100">
        <div className="container">
          <div className="flex items-end justify-between border-b border-slate-200/80 pb-4 mb-8">
            <div>
              <h2 className="text-[20px] font-black text-slate-900 font-primary uppercase">MEGA CARNIVALS</h2>
              <p className="text-slate-500 text-xs mt-1 font-secondary">Elite cultural spectacles, heavy concert setups, and Navratri dance arenas.</p>
            </div>
            <Link href="/events" className="text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors uppercase tracking-wider flex items-center gap-1">
              <span>Explore Festivals</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {CARNIVALS.map((fest) => (
              <div key={fest.id} className="bg-white border border-slate-200 rounded-[20px] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.012)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.035)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row relative group min-h-[11.5rem]">
                <div className="w-full h-44 sm:h-full sm:w-52 sm:absolute sm:left-0 sm:top-0 overflow-hidden shrink-0">
                  <img src={fest.bannerUrl} alt={fest.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                  <span className="absolute top-3 left-3 bg-red-650 text-white font-mono text-[7px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider z-10">MEGA FEST</span>
                </div>

                <div className="p-5 flex flex-col justify-between flex-grow sm:pl-[228px]">
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono tracking-wider">
                      <span className="flex items-center gap-1 text-pink-500 font-bold"><MapPin size={9} /> {fest.city}</span>
                      <span>|</span>
                      <span className="font-semibold">{fest.date}</span>
                    </div>
                    <Link href={`/events/${fest.slug}`}>
                      <h3 className="font-extrabold text-slate-800 text-[13.5px] font-primary uppercase tracking-tight line-clamp-1 hover:text-pink-500 transition-colors mt-0.5">{fest.name}</h3>
                    </Link>
                    <p className="text-slate-500 text-[10.5px] leading-relaxed line-clamp-2 font-secondary mt-1.5">Immerse yourself in India's most vibrant folk dance celebration. Experience three consecutive nights of live music, awards, and premium catering.</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                    <div className="text-left">
                      <span className="text-[8px] text-slate-400 font-mono uppercase block tracking-wider">Starts</span>
                      <span className="text-slate-800 font-extrabold text-[12.5px] font-primary block mt-0.5">₹350</span>
                    </div>
                    <Link href={`/events/${fest.slug}`} className="bg-slate-900 text-white font-mono text-[9.5px] font-bold px-4 py-2.5 rounded-lg tracking-widest uppercase hover:bg-pink-500 transition-colors duration-300">
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
      <section className="py-16 bg-[#fbfcfd] border-t border-slate-100">
        <div className="container">
          <div className="flex items-end justify-between border-b border-slate-200/80 pb-4 mb-8">
            <div>
              <h2 className="text-[20px] font-black text-slate-900 font-primary uppercase">INNOVATION TRADE EXPOS</h2>
              <p className="text-slate-500 text-xs mt-1 font-secondary">Trade exhibits, engineering summits, future clean mobility galleries.</p>
            </div>
            <Link href="/events" className="text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors uppercase tracking-wider flex items-center gap-1">
              <span>See All Expos</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {EXPOS.map((expo) => (
              <div key={expo.id} className="bg-white border border-slate-200 rounded-[20px] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.012)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.035)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row relative group min-h-[11.5rem]">
                <div className="w-full h-44 sm:h-full sm:w-52 sm:absolute sm:left-0 sm:top-0 overflow-hidden shrink-0">
                  <img src={expo.bannerUrl} alt={expo.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                  <span className="absolute top-3 left-3 bg-indigo-600 text-white font-mono text-[7px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider z-10">TRADE EXPO</span>
                </div>

                <div className="p-5 flex flex-col justify-between flex-grow sm:pl-[228px]">
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono tracking-wider">
                      <span className="flex items-center gap-1 text-pink-500 font-bold"><MapPin size={9} /> {expo.city}</span>
                    </div>
                    <Link href={`/events/${expo.slug}`}>
                      <h3 className="font-extrabold text-slate-800 text-[13.5px] font-primary uppercase tracking-tight line-clamp-1 hover:text-pink-500 transition-colors mt-0.5">{expo.name}</h3>
                    </Link>
                    <p className="text-slate-500 text-[10.5px] leading-relaxed line-clamp-2 font-secondary mt-1.5">The definitive gathering of engineering marvels, IoT, AI integration hubs, sustainable infrastructure models, and next-gen clean mobility.</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                    <div className="text-left">
                      <span className="text-[8px] text-slate-400 font-mono uppercase block tracking-wider">Admission</span>
                      <span className="text-slate-800 font-extrabold text-[12.5px] font-primary block mt-0.5">₹199</span>
                    </div>
                    <Link href={`/events/${expo.slug}`} className="bg-slate-900 text-white font-mono text-[9.5px] font-bold px-4.5 py-2.5 rounded-lg tracking-widest uppercase hover:bg-pink-500 transition-colors duration-300">
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
      <section className="bg-[#0b0f19] dark-bg py-16 px-4">
        <div className="container flex flex-col gap-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-left">
              <span className="text-[9px] font-mono tracking-widest text-pink-500 font-bold uppercase">🔥 TRENDING NEAR YOU</span>
              <h2 className="text-[22px] font-black text-white font-primary uppercase mt-1">
                WHAT'S HOT IN <span className="text-pink-500">{trendingCity.toUpperCase()}</span>
              </h2>
            </div>

            {/* City Selector Tabs */}
            <div className="flex bg-[#0f172a] border border-gray-800 p-1 rounded-xl overflow-x-auto max-w-full shrink-0">
              {["New Delhi", "Mumbai", "Bengaluru", "Chennai"].map((city) => (
                <button 
                  key={city}
                  onClick={() => setTrendingCity(city)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 cursor-pointer ${
                    trendingCity === city ? "bg-[#4f46e5] text-white" : "text-gray-400 hover:text-white"
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
                className="bg-[#0f172a] dark-bg border border-gray-800 rounded-3xl overflow-hidden flex flex-col h-full hover:border-pink-500/40 transition-colors duration-300 group"
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
                    <span className="text-[8px] text-pink-500 font-mono font-bold uppercase tracking-wider">{evt.category}</span>
                    <Link href="/events">
                      <h3 className="font-extrabold text-white text-[13.5px] font-primary line-clamp-1 hover:text-pink-500 transition-colors cursor-pointer mt-0.5">{evt.title}</h3>
                    </Link>
                    <p className="text-gray-400 text-xs font-secondary line-clamp-2 leading-relaxed">{evt.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-800/60 flex justify-between items-center mt-1">
                    <div>
                      <span className="text-[8px] text-gray-500 block uppercase leading-none font-mono">VENUE PRICE</span>
                      <span className="font-bold text-white text-xs">₹{evt.price}</span>
                    </div>
                    <Link 
                      href={`/events`}
                      className="bg-pink-500 hover:bg-pink-600 text-slate-950 text-[9.5px] font-mono font-black px-4.5 py-2.5 rounded-lg transition-colors duration-200"
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
      <section className="py-16 bg-[#fbfcfd] border-t border-slate-100">
        <div className="container">
          <div className="flex items-end justify-between border-b border-slate-200/80 pb-4 mb-8">
            <div className="text-left">
              <h2 className="text-[20px] font-black text-slate-900 font-primary uppercase">SEASON SNAPSHOTS</h2>
              <p className="text-slate-500 text-xs mt-1 font-secondary">Archived passholder snapshots captured across metropolitan arenas.</p>
            </div>
            <Link href="/gallery" className="text-xs font-bold text-indigo-500 hover:text-indigo-650 transition-colors uppercase tracking-wider">
              View Full Gallery →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { title: "ABHYUDAYA Arena", category: "CULTURAL", image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80" },
              { title: "MISS TRADITIONAL Final", category: "MUSIC", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=400&q=80" },
              { title: "CONFERENCES Keynote", category: "DANCE CLASH", image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80" },
              { title: "EXPOS IoT Lab", category: "TRADE STALL", image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=400&q=80" },
              { title: "COMPETITIONS Stage", category: "FASHION SHOW", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80" },
              { title: "ABHYUDAYA Crowd", category: "FOOD FEST", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80" }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="relative h-44 rounded-xl overflow-hidden group border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.01)] hover:-translate-y-0.5 transition-transform duration-350"
              >
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-3 left-3 flex flex-col gap-0.5 text-left z-10">
                  <span className="text-[7px] text-pink-400 font-mono font-bold tracking-widest uppercase">{item.category}</span>
                  <span className="text-white font-bold text-[9px] line-clamp-1">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. TRUSTED BRAND PARTNERS & ALLIANCE PATRONS */}
      <section className="border-y border-slate-100 bg-[#fbfcfd] py-10 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#fbfcfd] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#fbfcfd] to-transparent z-10 pointer-events-none"></div>

        <div className="container relative">
          <p className="text-center text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase mb-8">
            TRUSTED BRAND PARTNERS & ALLIANCE PATRONS
          </p>
          <div className="overflow-hidden w-full flex">
            <div className="flex gap-16 items-center animate-marquee whitespace-nowrap">
              {[
                "TATA", "Airtel", "Paytm", "Reliance", "Bisleri", "BookMyShow",
                "TATA", "Airtel", "Paytm", "Reliance", "Bisleri", "BookMyShow"
              ].map((logo, idx) => (
                <div 
                  key={idx} 
                  className="font-black text-lg sm:text-2xl text-slate-400/60 font-primary tracking-tight hover:text-indigo-600 transition-colors duration-300 select-none shrink-0"
                >
                  {logo.toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 12. TRUSTED BY THOUSANDS (TESTIMONIALS) */}
      <section className="py-20 bg-white border-t border-slate-100 overflow-hidden">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-2">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">VERIFIED BADGE HOLDERS</span>
            <h2 className="text-2xl font-black text-slate-900 font-primary uppercase">TRUSTED BY THOUSANDS</h2>
          </div>

          <div className="h-[480px] overflow-hidden relative grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

            {/* Column 1 (Scroll Up) */}
            <div className="flex flex-col gap-6 animate-scroll-vertical">
              {[...TESTIMONIALS.slice(0, 3), ...TESTIMONIALS.slice(0, 3)].map((t, idx) => (
                <div key={idx} className="bg-[#fbfcfd] border border-slate-200/80 rounded-[20px] p-6 flex flex-col justify-between gap-5 shadow-[0_4px_15px_rgba(0,0,0,0.01)] text-left shrink-0">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" className="text-amber-500" />)}
                    </div>
                    <p className="text-slate-600 italic text-[10.5px] leading-relaxed font-secondary">"{t.quote}"</p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex flex-col gap-0.5">
                    <h4 className="font-bold text-slate-800 text-[11px] font-primary uppercase tracking-tight">{t.author}</h4>
                    <p className="text-slate-400 text-[8.5px] uppercase font-mono font-medium">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 (Scroll Down) */}
            <div className="flex flex-col gap-6 animate-scroll-vertical-down">
              {[...TESTIMONIALS.slice(3, 6), ...TESTIMONIALS.slice(3, 6)].map((t, idx) => (
                <div key={idx} className="bg-[#fbfcfd] border border-slate-200/80 rounded-[20px] p-6 flex flex-col justify-between gap-5 shadow-[0_4px_15px_rgba(0,0,0,0.01)] text-left shrink-0">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" className="text-amber-500" />)}
                    </div>
                    <p className="text-slate-600 italic text-[10.5px] leading-relaxed font-secondary">"{t.quote}"</p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex flex-col gap-0.5">
                    <h4 className="font-bold text-slate-800 text-[11px] font-primary uppercase tracking-tight">{t.author}</h4>
                    <p className="text-slate-400 text-[8.5px] uppercase font-mono font-medium">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 3 (Scroll Up) */}
            <div className="flex flex-col gap-6 animate-scroll-vertical">
              {[...TESTIMONIALS.slice(6, 9), ...TESTIMONIALS.slice(6, 9)].map((t, idx) => (
                <div key={idx} className="bg-[#fbfcfd] border border-slate-200/80 rounded-[20px] p-6 flex flex-col justify-between gap-5 shadow-[0_4px_15px_rgba(0,0,0,0.01)] text-left shrink-0">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" className="text-amber-500" />)}
                    </div>
                    <p className="text-slate-600 italic text-[10.5px] leading-relaxed font-secondary">"{t.quote}"</p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex flex-col gap-0.5">
                    <h4 className="font-bold text-slate-800 text-[11px] font-primary uppercase tracking-tight">{t.author}</h4>
                    <p className="text-slate-400 text-[8.5px] uppercase font-mono font-medium">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 13. RECHARGE CHRONICLE (BLOG PREVIEW) */}
      <section className="py-16 bg-[#fbfcfd] border-t border-slate-100">
        <div className="container">
          <div className="flex items-end justify-between border-b border-slate-200/80 pb-4 mb-8">
            <div className="text-left">
              <h2 className="text-[20px] font-black text-slate-900 font-primary uppercase">RECHARGE CHRONICLE</h2>
              <p className="text-slate-500 text-xs mt-1 font-secondary">Editorial briefings on handloom couture, event tech scaling, and crowd design.</p>
            </div>
            <Link href="/blogs" className="text-xs font-bold text-pink-500 hover:text-pink-650 transition-colors uppercase tracking-wider">
              Read Chronicle &gt;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {ESSAYS.map((essay, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-[20px] p-5 flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.012)] hover:-translate-y-0.5 transition-transform duration-350 group">
                <div className="flex flex-col gap-4 text-left">
                  <div className="h-48 overflow-hidden rounded-xl bg-slate-100">
                    <img src={essay.image} alt={essay.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2">
                      <span>BY {essay.author} ({essay.role})</span>
                      <span>{essay.date}</span>
                    </div>
                    <h3 className="text-sm md:text-base font-black text-slate-800 font-primary uppercase mt-1 leading-snug line-clamp-2 group-hover:text-pink-500 transition-colors">
                      {essay.title}
                    </h3>
                    <p className="text-slate-450 text-[10.5px] leading-relaxed font-secondary line-clamp-2">
                      {essay.excerpt}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex justify-start">
                  <Link href="/blogs" className="text-[10px] font-bold text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <span>Read Essay</span>
                    <BookOpen size={11} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. VIP GATEWAY NEWSLETTER BANNER */}
      <section className="py-16 bg-[#fbfcfd] border-t border-slate-100">
        <div className="container">
          <div className="p-8 md:p-12 text-center rounded-[24px] bg-[#0f172a] dark-bg border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-bl-full filter blur-xl"></div>
            
            <span className="text-[9px] font-mono tracking-widest text-pink-500 font-bold uppercase">VIP GATEWAY</span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-primary uppercase tracking-tight max-w-md leading-tight">
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
