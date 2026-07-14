"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Calendar, MapPin, Filter, X, ArrowUpDown, ChevronRight } from "lucide-react";
import { ApiClient, Event } from "@/lib/api-client";

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  // Filter States
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [location, setLocation] = useState(searchParams.get("location") || "All");
  const [priceType, setPriceType] = useState(searchParams.get("price") || "All"); // All, Free, Paid
  const [timeFilter, setTimeFilter] = useState("upcoming"); // upcoming, past

  useEffect(() => {
    const fetchEvents = async () => {
      const allEvents = await ApiClient.getEvents();
      setEvents(allEvents);
    };
    fetchEvents();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...events];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) || 
        e.category.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category !== "All") {
      result = result.filter(e => e.category === category);
    }

    // Location/City filter
    if (location !== "All") {
      result = result.filter(e => e.city === location);
    }

    // Free/Paid filter
    if (priceType !== "All") {
      if (priceType === "Free") {
        result = result.filter(e => e.ticketPrices.length === 0 || e.ticketPrices.every(p => p.price === 0));
      } else if (priceType === "Paid") {
        result = result.filter(e => e.ticketPrices.some(p => p.price > 0));
      }
    }

    // Upcoming / Past filter
    if (timeFilter === "upcoming") {
      result = result.filter(e => e.isUpcoming);
    } else {
      result = result.filter(e => !e.isUpcoming);
    }

    setFilteredEvents(result);
  }, [events, search, category, location, priceType, timeFilter]);

  const uniqueCities = ["All", ...Array.from(new Set(events.map(e => e.city)))];
  const uniqueCategories = [
    "All",
    "Cultural Programs",
    "Dance Competitions",
    "Trade Expos",
    "Food Festivals",
    "Educational Events"
  ];

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLocation("All");
    setPriceType("All");
    setTimeFilter("upcoming");
    router.replace("/events");
  };

  return (
    <div className="container py-20 md:py-24 flex flex-col gap-10">
      {/* Page Title */}
      <div>
        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Discover</span>
        <h1 className="text-4xl md:text-5xl font-black mt-1 font-primary text-white">Recharge Nation Events</h1>
        <p className="text-gray-400 text-sm mt-2">Filter and explore premium entertainment, cultural programs, corporate expos, and competitions across India.</p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-500/15 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-400 font-semibold uppercase">Keyword Search</span>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search events..." 
                className="form-input w-full pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-400 font-semibold uppercase">Category</span>
            <select 
              className="form-select w-full"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-400 font-semibold uppercase">City / Location</span>
            <select 
              className="form-select w-full"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              {uniqueCities.map(cityOpt => <option key={cityOpt} value={cityOpt}>{cityOpt}</option>)}
            </select>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-400 font-semibold uppercase">Price</span>
            <select 
              className="form-select w-full"
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
            >
              <option value="All">All Entry Types</option>
              <option value="Free">Free / Complimentary</option>
              <option value="Paid">Paid Entry</option>
            </select>
          </div>
        </div>

        {/* Sub-Filters / Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
          {/* Time Filter Toggle */}
          <div className="flex bg-[rgba(255,255,255,0.03)] border border-gray-800 p-1 rounded-lg">
            <button 
              onClick={() => setTimeFilter("upcoming")}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${timeFilter === "upcoming" ? "bg-indigo-600 text-white shadow" : "text-gray-400 hover:text-white"}`}
            >
              Upcoming Events
            </button>
            <button 
              onClick={() => setTimeFilter("past")}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${timeFilter === "past" ? "bg-indigo-600 text-white shadow" : "text-gray-400 hover:text-white"}`}
            >
              Past Showcases
            </button>
          </div>

          {/* Clear Filters CTA */}
          <button 
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white font-semibold transition-colors"
          >
            <X size={14} /> Clear All Filters
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="glass-panel overflow-hidden flex flex-col h-full hover:border-[rgba(255,255,255,0.15)] group">
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={evt.bannerUrl} 
                  alt={evt.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-sm text-cyan-400 text-xs font-semibold px-3 py-1 rounded-md">
                  {evt.category}
                </div>
              </div>
              
              <div className="p-6 flex flex-col justify-between flex-grow gap-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {evt.date}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {evt.city}</span>
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-1 font-primary">{evt.name}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 font-secondary">{evt.summary}</p>
                </div>

                <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase block">Starting from</span>
                    <span className="text-white font-bold text-sm">
                      {evt.ticketPrices.length > 0 ? `₹${evt.ticketPrices[0].price}` : 'Free'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/events/${evt.slug}`} className="btn btn-primary py-2.5 px-4 text-xs font-bold rounded-lg">
                      Book Ticket
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-panel rounded-2xl border-indigo-500/10 max-w-xl mx-auto w-full flex flex-col items-center gap-4">
          <span className="text-4xl">🔍</span>
          <h3 className="text-lg font-bold text-white font-primary">No Events Found</h3>
          <p className="text-gray-400 text-sm max-w-xs">We couldn't find any events matching your selected filter guidelines. Try clearing your filters.</p>
          <button onClick={clearFilters} className="btn btn-secondary py-2 px-5 text-xs font-semibold rounded-full mt-2">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="container py-20 text-center text-gray-400 text-sm">
        Loading Events Directory...
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
}
