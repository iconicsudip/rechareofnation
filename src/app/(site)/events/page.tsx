"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Search, Calendar, MapPin, Sliders } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ApiClient } from "@/lib/api-client";
import EventCard from "@/components/EventCard";

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

function EventsContent() {
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<UIEvent[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [dateTimeline, setDateTimeline] = useState("all"); // all, today, weekend, next30
  const [priceFilter, setPriceFilter] = useState("all"); // all, free, under500, under1500, premium
  const [sortBy, setSortBy] = useState("rating-desc");

  // Helper to update URL params
  const updateUrlParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "All" && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Sync state with URL params
  useEffect(() => {
    const segmentParam = searchParams.get("segment");
    const cityParam = searchParams.get("city");
    const dateParam = searchParams.get("date");
    const searchParam = searchParams.get("search");
    const priceParam = searchParams.get("price");
    const sortParam = searchParams.get("sort");

    if (segmentParam) setCategory(segmentParam);
    else setCategory("All");

    if (cityParam) setLocation(cityParam);
    else setLocation("All");

    if (dateParam) setDateTimeline(dateParam);
    else setDateTimeline("all");

    if (searchParam) setSearch(searchParam);
    else setSearch("");

    if (priceParam) setPriceFilter(priceParam);
    else setPriceFilter("all");

    if (sortParam) setSortBy(sortParam);
    else setSortBy("rating-desc");
  }, [searchParams]);

  // Load real events + dynamic category/city taxonomies
  const [categoryOptions, setCategoryOptions] = useState<string[]>(["All"]);
  const [cityOptions, setCityOptions] = useState<string[]>(["All"]);

  useEffect(() => {
    const fetchEvents = async () => {
      const [allEvents, categories, cities] = await Promise.all([
        ApiClient.getEvents(),
        ApiClient.getTaxonomy('event_category'),
        ApiClient.getTaxonomy('city'),
      ]);

      const mapped = allEvents.map((e) => {
        const minPrice = e.ticketPrices && e.ticketPrices.length > 0
          ? Math.min(...e.ticketPrices.map(tp => tp.price))
          : (e.registrationFee || 0);

        return {
          id: e.id,
          slug: e.slug,
          name: e.name.toUpperCase(),
          category: e.category,
          city: e.city,
          price: minPrice,
          date: e.date,
          rating: e.rating,
          reviews: e.reviewCount,
          bannerUrl: e.bannerUrl,
          desc: e.summary || e.description || '',
          tag: e.isFeatured ? "MEGA FEST" : undefined
        };
      });

      setEvents(mapped);
      setCategoryOptions(["All", ...categories]);
      setCityOptions(["All", ...cities]);
    };
    fetchEvents();
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
    router.push(pathname, { scroll: false });
  };

  return (
    <div
      className="min-h-screen py-20 md:py-24 font-secondary"
    >
      <div className="container mx-auto px-4">
        {/* 1. Header Section */}
        <div className="border-b border-[var(--border-color)] pb-5 mb-8 text-left">
          <h1 className="text-[25px] font-black text-[var(--text-primary)] font-primary uppercase tracking-tight">
            NATIONAL EVENT DIRECTORY
          </h1>
          <p className="text-[var(--text-muted)] font-primary text-[9px] font-bold tracking-widest uppercase mt-0.5">
            Real-time gate passes & contender registration checkout.
          </p>
        </div>

        {/* 2. Directory Body */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left Panel: Filter Matrix */}
          <div className="w-full lg:w-64 shrink-0 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-5 flex flex-col gap-6 shadow-[0_4px_25px_rgba(0,0,0,0.25)] lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)] overflow-y-auto z-10">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold uppercase text-[11px] tracking-wider">
                <Sliders size={13} className="text-amber-400" />
                <span>Filter Matrix</span>
              </div>
              {(search || category !== "All" || location !== "All" || dateTimeline !== "all" || priceFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="text-[9.5px] font-primary font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-primary tracking-widest text-[var(--text-muted)] font-bold uppercase">Keyword Search</span>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-[var(--text-muted)]" size={13} />
                <input
                  type="text"
                  placeholder="Event name, city, tag..."
                  className="w-full text-xs rounded-xl bg-white/5 border border-[var(--border-color)] pl-9 pr-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); updateUrlParam("search", e.target.value); }}
                />
              </div>
            </div>

            {/* Select Segment */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-primary tracking-widest text-[var(--text-muted)] font-bold uppercase">Select Segment</span>
              <div className="flex flex-col gap-0.5">
                {categoryOptions.map((cat) => {
                  const isActive = category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); updateUrlParam("segment", cat); }}
                      className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "text-amber-400 bg-amber-500/10"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
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
              <span className="text-[9px] font-primary tracking-widest text-[var(--text-muted)] font-bold uppercase">City Location</span>
              <div className="flex flex-wrap gap-1.5">
                {cityOptions.map((cityOpt) => {
                  const isActive = location === cityOpt;
                  return (
                    <button
                      key={cityOpt}
                      onClick={() => { setLocation(cityOpt); updateUrlParam("city", cityOpt); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        isActive
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                          : "text-[var(--text-secondary)] bg-transparent border-[var(--border-color)] hover:border-amber-500/30"
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
              <span className="text-[9px] font-primary tracking-widest text-[var(--text-muted)] font-bold uppercase">Date Timeline</span>
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
                      onClick={() => { setDateTimeline(timeOpt.value); updateUrlParam("date", timeOpt.value); }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        isActive
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
                          : "text-[var(--text-secondary)] bg-transparent border-[var(--border-color)] hover:border-amber-500/30"
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
              <span className="text-[9px] font-primary tracking-widest text-[var(--text-muted)] font-bold uppercase">Price Point</span>
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
                      onClick={() => { setPriceFilter(priceOpt.value); updateUrlParam("price", priceOpt.value); }}
                      className={`w-full text-left py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "text-amber-400 bg-amber-500/10"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
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
              <span className="text-[9px] font-primary tracking-widest text-[var(--text-muted)] font-bold uppercase">Sort Results</span>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); updateUrlParam("sort", e.target.value); }}
                className="w-full text-xs rounded-xl bg-white/5 border border-[var(--border-color)] px-3 py-2.5 text-[var(--text-secondary)] outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
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
            <div className="text-[9.5px] font-primary tracking-widest text-[var(--text-muted)] font-bold uppercase mb-4 text-left">
              SHOWING {filteredEvents.length} EVENTS MATCHING YOUR FILTERS
            </div>

            {/* Events Grid */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((evt) => (
                  <EventCard
                    key={evt.id}
                    id={evt.slug}
                    name={evt.name}
                    category={evt.category}
                    tag={evt.tag}
                    city={evt.city}
                    rating={evt.rating}
                    reviews={evt.reviews}
                    price={evt.price}
                    bannerUrl={evt.bannerUrl}
                    desc={evt.desc}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.25)] max-w-xl mx-auto w-full flex flex-col items-center gap-4">
                <Search size={32} className="text-[var(--text-muted)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-primary uppercase tracking-tight">No Events Matches</h3>
                <p className="text-[var(--text-secondary)] text-xs max-w-xs font-secondary">We couldn't find any events matching your selected filter guidelines. Try clearing your filters.</p>
                <button
                  onClick={clearFilters}
                  className="bg-[var(--bg-panel)] text-[var(--text-primary)] text-[10px] font-primary font-bold tracking-widest px-6 py-3 rounded-xl uppercase hover:bg-amber-500 hover:text-[#170D08] transition-all cursor-pointer"
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
      <div className="container py-20 text-center text-[var(--text-muted)] text-sm">
        Loading Events Directory...
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
}
