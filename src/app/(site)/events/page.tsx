"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Search, Calendar, MapPin, Sliders, Star, X, Check } from "lucide-react";

interface UIEvent {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  price: number;
  date: string;
  rating: number;
  reviews: number;
  bannerUrl: string;
  desc: string;
  tag?: string; // e.g. "SELLING FAST"
}

const MOCK_EVENTS_UI: UIEvent[] = [
  {
    id: "ev-1",
    slug: "recharge-cultural-odyssey-2026",
    name: "RECHARGE CULTURAL ODYSSEY 2026",
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
    id: "ev-2",
    slug: "national-vibe-rhythm-dance-cup",
    name: "NATIONAL VIBE & RHYTHM DANCE CUP 2026",
    category: "Workshops",
    city: "Chennai",
    price: 2499,
    date: "2026-12-05",
    rating: 4.9,
    reviews: 195,
    bannerUrl: "https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?auto=format&fit=crop&w=600&q=80",
    desc: "Master the design, construction and flying of unmanned aerial vehicles and modern RC aero-models."
  },
  {
    id: "ev-3",
    slug: "india-tech-startup-trade-expo-2026",
    name: "INDIA TECH & STARTUP TRADE EXPO 2026",
    category: "Festivals",
    city: "Mumbai",
    price: 350,
    date: "2026-10-18",
    rating: 4.9,
    reviews: 980,
    bannerUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80",
    desc: "Dance to traditional beats with India's top Garba artists, premium catering, and grand awards.",
    tag: "SELLING FAST"
  },
  {
    id: "ev-4",
    slug: "india-culinary-food-festival-2026",
    name: "INDIA CULINARY & FOOD FESTIVAL 2026",
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
    id: "ev-5",
    slug: "glow-music-fusion-carnival-2025",
    name: "GLOW MUSIC & FUSION CARNIVAL 2025",
    category: "School & College",
    city: "Bengaluru",
    price: 250,
    date: "2026-11-12",
    rating: 4.8,
    reviews: 740,
    bannerUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80",
    desc: "The mega collegiate showcase featuring rock battles, quizzes, couture shows, and classical arts.",
    tag: "SELLING FAST"
  },
  {
    id: "ev-6",
    slug: "national-quiz-talent-hunt-2025",
    name: "NATIONAL QUIZ & TALENT HUNT 2025",
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
    id: "ev-7",
    slug: "recharge-voice-of-india-2026",
    name: "RECHARGE VOICE OF INDIA 2026",
    category: "Corporate",
    city: "New Delhi",
    price: 1500,
    date: "2026-09-18",
    rating: 4.6,
    reviews: 220,
    bannerUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    desc: "Strategic corporate leadership forums, panel discussions, team building audits, and CEO mixers."
  },
  {
    id: "ev-8",
    slug: "india-youth-haute-couture-fashion-week-2026",
    name: "INDIA YOUTH HAUTE COUTURE FASHION WEEK 2026",
    category: "Conferences",
    city: "New Delhi",
    price: 799,
    date: "2026-10-02",
    rating: 4.6,
    reviews: 450,
    bannerUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
    desc: "National security panel debates, threat matrix modules, white-hat workshops, and digital assets audit."
  },
  {
    id: "ev-9",
    slug: "artisanal-craft-art-expressions-exhibition-2026",
    name: "ARTISANAL CRAFT & ART EXPRESSIONS EXHIBITION 2026",
    category: "Expos",
    city: "Chennai",
    price: 150,
    date: "2026-12-15",
    rating: 4.5,
    reviews: 280,
    bannerUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80",
    desc: "Showcasing next-generation electric scooters, autonomous battery pods, solar grids, and smart charging hubs."
  }
];

function EventsContent() {
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<UIEvent[]>([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [dateTimeline, setDateTimeline] = useState("all"); // all, today, weekend, next30
  const [priceFilter, setPriceFilter] = useState("all"); // all, free, under500, under1500, premium
  const [sortBy, setSortBy] = useState("rating-desc");

  // Load events & calculate dynamic filter dates so mock data remains relevant in real-time
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    const getNextSaturday = () => {
      const d = new Date();
      const day = d.getDay();
      const diff = day <= 6 ? 6 - day : 6;
      d.setDate(d.getDate() + diff);
      return formatDate(d);
    };

    const eventsWithDynamicDates = MOCK_EVENTS_UI.map((e) => {
      if (e.id === "ev-4") {
        // Today
        return { ...e, date: todayStr };
      }
      if (e.id === "ev-5") {
        // Weekend (next Saturday)
        return { ...e, date: getNextSaturday() };
      }
      if (e.id === "ev-6") {
        // Next 30 Days (today + 10 days)
        const d = new Date();
        d.setDate(d.getDate() + 10);
        return { ...e, date: formatDate(d) };
      }
      return e;
    });

    setEvents(eventsWithDynamicDates);
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...events];

    // Keyword Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.desc.toLowerCase().includes(q)
      );
    }

    // Segment Category
    if (category !== "All") {
      result = result.filter(
        (e) => e.category.toLowerCase() === category.toLowerCase()
      );
    }

    // City Location
    if (location !== "All") {
      result = result.filter(
        (e) => e.city.toLowerCase() === location.toLowerCase()
      );
    }

    // Date Timeline
    if (dateTimeline !== "all") {
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      if (dateTimeline === "today") {
        result = result.filter((e) => e.date === todayStr);
      } else if (dateTimeline === "weekend") {
        result = result.filter((e) => {
          if (e.id === "ev-5") return true;
          const d = new Date(e.date);
          const day = d.getDay();
          return day === 0 || day === 6; // Sunday or Saturday
        });
      } else if (dateTimeline === "next30") {
        const next30 = new Date();
        next30.setDate(next30.getDate() + 30);
        result = result.filter((e) => {
          const d = new Date(e.date);
          return d >= today && d <= next30;
        });
      }
    }

    // Price Point Filter
    if (priceFilter !== "all") {
      if (priceFilter === "free") {
        result = result.filter((e) => e.price === 0);
      } else if (priceFilter === "under500") {
        result = result.filter((e) => e.price < 500);
      } else if (priceFilter === "under1500") {
        result = result.filter((e) => e.price < 1500);
      } else if (priceFilter === "premium") {
        result = result.filter((e) => e.price >= 1500);
      }
    }

    // Sort Logic
    if (sortBy === "rating-desc") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "date-asc") {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    setFilteredEvents(result);
  }, [events, search, category, location, dateTimeline, priceFilter, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLocation("All");
    setDateTimeline("all");
    setPriceFilter("all");
    setSortBy("rating-desc");
  };

  // Tag color selector helper
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "festivals":
        return "bg-pink-600/90";
      case "competitions":
        return "bg-amber-600/90";
      case "expos":
        return "bg-cyan-600/90";
      case "workshops":
        return "bg-purple-600/90";
      case "corporate":
        return "bg-indigo-600/90";
      case "school & college":
        return "bg-emerald-600/90";
      default:
        return "bg-rose-600/90";
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#fbfcfd] text-slate-800 py-16 font-secondary"
    >
      <div className="container max-w-7xl mx-auto px-4">
        {/* 1. Header Section */}
        <div className="border-b border-slate-200/80 pb-5 mb-8 text-left">
          <h1 className="text-[25px] font-black text-slate-900 font-primary uppercase tracking-tight">
            NATIONAL EVENT DIRECTORY
          </h1>
          <p className="text-slate-400 font-mono text-[9px] font-bold tracking-widest uppercase mt-0.5">
            Real-time gate passes & contender registration checkout.
          </p>
        </div>

        {/* 2. Directory Body */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Panel: Filter Matrix */}
          <div className="w-full lg:w-64 shrink-0 bg-white border border-slate-200/90 rounded-[20px] p-5 flex flex-col gap-6 shadow-[0_4px_25px_rgba(0,0,0,0.015)] lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] overflow-y-auto z-10">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-850 font-bold uppercase text-[11px] tracking-wider">
                <Sliders size={13} className="text-slate-500" />
                <span>Filter Matrix</span>
              </div>
              {(search || category !== "All" || location !== "All" || dateTimeline !== "all" || priceFilter !== "all") && (
                <button 
                  onClick={clearFilters}
                  className="text-[9.5px] font-mono font-bold text-pink-500 hover:text-pink-600 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase">Keyword Search</span>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={13} />
                <input 
                  type="text" 
                  placeholder="Event name, city, tag..." 
                  className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200/80 pl-9 pr-4 py-2.5 text-slate-800 placeholder-slate-400 outline-none focus:border-slate-350 focus:ring-1 focus:ring-slate-300"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Select Segment */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase">Select Segment</span>
              <div className="flex flex-col gap-0.5">
                {[
                  "All",
                  "Festivals",
                  "Competitions",
                  "Expos",
                  "Workshops",
                  "Corporate",
                  "School & College",
                  "Business Networking",
                  "Conferences"
                ].map((cat) => {
                  const isActive = category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive 
                          ? "text-pink-500 bg-pink-500/5" 
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City Location */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase">City Location</span>
              <div className="flex flex-wrap gap-1.5">
                {["All", "New Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata"].map((cityOpt) => {
                  const isActive = location === cityOpt;
                  return (
                    <button
                      key={cityOpt}
                      onClick={() => setLocation(cityOpt)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        isActive 
                          ? "text-indigo-600 bg-indigo-50 border-indigo-200" 
                          : "text-slate-600 bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {cityOpt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Timeline */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase">Date Timeline</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Any Date", value: "all" },
                  { label: "Today", value: "today" },
                  { label: "Weekend", value: "weekend" },
                  { label: "Next 30 Days", value: "next30" }
                ].map((timeOpt) => {
                  const isActive = dateTimeline === timeOpt.value;
                  return (
                    <button
                      key={timeOpt.value}
                      onClick={() => setDateTimeline(timeOpt.value)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        isActive 
                          ? "text-pink-500 bg-pink-50 border-pink-200" 
                          : "text-slate-600 bg-white border-slate-200 hover:border-slate-350"
                      }`}
                    >
                      {timeOpt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Point */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase">Price Point</span>
              <div className="flex flex-col gap-0.5">
                {[
                  { label: "All Price Ranges", value: "all" },
                  { label: "Free Passes", value: "free" },
                  { label: "Under ₹500", value: "under500" },
                  { label: "Under ₹1500", value: "under1500" },
                  { label: "Premium (₹1500+)", value: "premium" }
                ].map((priceOpt) => {
                  const isActive = priceFilter === priceOpt.value;
                  return (
                    <button
                      key={priceOpt.value}
                      onClick={() => setPriceFilter(priceOpt.value)}
                      className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive 
                          ? "text-pink-500 bg-pink-500/5" 
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {priceOpt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort Results */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold uppercase">Sort Results</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200/85 px-3 py-2.5 text-slate-700 outline-none focus:border-slate-350 focus:ring-1 focus:ring-slate-300"
              >
                <option value="rating-desc">Rating: Highest to Lowest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="date-asc">Date: Upcoming first</option>
              </select>
            </div>

          </div>

          {/* Right Panel: Grid View */}
          <div className="flex-grow w-full">
            
            {/* Show results metadata */}
            <div className="text-[9.5px] font-mono tracking-widest text-slate-400 font-bold uppercase mb-4 text-left">
              SHOWING {filteredEvents.length} EVENTS MATCHING YOUR FILTERS
            </div>

            {/* Events Grid */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((evt) => (
                  <div 
                    key={evt.id} 
                    className="bg-white border border-slate-200 rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.012)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.035)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full group"
                  >
                    
                    {/* Header Image with Float Labels */}
                    <div className="h-44 relative overflow-hidden bg-slate-100">
                      <img 
                        src={evt.bannerUrl} 
                        alt={evt.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                      
                      {/* Black bottom overlay for text contrast */}
                      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none z-0"></div>

                      {/* Tag Labels floating */}
                      <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
                        <span className={`${getCategoryColor(evt.category)} text-white font-mono text-[7.5px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider`}>
                          {evt.category}
                        </span>
                        {evt.tag && (
                          <span className="bg-amber-500 text-slate-950 font-mono text-[7.5px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                            {evt.tag}
                          </span>
                        )}
                      </div>

                      {/* Location details */}
                      <div className="absolute bottom-3 left-3.5 flex items-center gap-1 text-[9.5px] font-extrabold text-white tracking-widest font-mono uppercase z-10">
                        <MapPin size={10} className="text-pink-500 shrink-0" />
                        <span>{evt.city}</span>
                      </div>

                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex flex-col justify-between flex-grow">
                      
                      <div>
                        {/* Rating */}
                        <div className="flex items-center gap-1 text-[10.5px] font-bold text-amber-500">
                          <Star size={11} fill="#f59e0b" className="text-amber-500" />
                          <span>{evt.rating}</span>
                          <span className="text-slate-400 font-medium">({evt.reviews} reviews)</span>
                        </div>

                        {/* Title */}
                        <Link href={`/events/${evt.slug}`}>
                          <h3 className="font-extrabold text-slate-800 text-[13.5px] font-primary tracking-tight mt-2.5 uppercase line-clamp-2 leading-snug hover:text-pink-500 transition-colors">
                            {evt.name}
                          </h3>
                        </Link>

                        {/* Description */}
                        <p className="text-slate-500 text-[10.5px] leading-relaxed font-secondary mt-2 line-clamp-2">
                          {evt.desc}
                        </p>

                        {/* Date */}
                        <span className="text-[9.5px] font-mono text-slate-400 font-semibold tracking-wider mt-2.5 block">
                          {evt.date}
                        </span>
                      </div>

                      {/* Footer border with Action */}
                      <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[8px] text-slate-400 font-mono uppercase block tracking-wider">Starting from</span>
                          <span className="text-slate-800 font-extrabold text-[13.5px] font-primary mt-0.5">
                            {evt.price > 0 ? `₹${evt.price}` : "Complimentary"}
                          </span>
                        </div>

                        <Link 
                          href={`/events/${evt.slug}`} 
                          className="bg-[#0c1222] border border-dashed border-[#0c1222]/80 text-white font-mono text-[9px] font-bold px-4 py-2.5 rounded-lg tracking-widest uppercase hover:bg-pink-500 hover:border-pink-500 hover:text-white transition-all duration-300"
                        >
                          Book Badge
                        </Link>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.012)] max-w-xl mx-auto w-full flex flex-col items-center gap-4">
                <span className="text-4xl">🔍</span>
                <h3 className="text-sm font-bold text-slate-800 font-primary uppercase tracking-tight">No Events Matches</h3>
                <p className="text-slate-500 text-xs max-w-xs font-secondary">We couldn't find any events matching your selected filter guidelines. Try clearing your filters.</p>
                <button 
                  onClick={clearFilters} 
                  className="bg-[#0c1222] text-white text-[10px] font-mono font-bold tracking-widest px-6 py-3 rounded-xl uppercase hover:bg-pink-500 hover:text-white transition-all cursor-pointer"
                >
                  Reset Filter Matrix
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="container py-20 text-center text-slate-400 text-sm">
        Loading Events Directory...
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
}
