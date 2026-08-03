"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, Calendar, MapPin, Trophy, ArrowRight, Star, Heart, 
  Flame, Compass, ChevronRight, Music, Sparkles, Paintbrush, 
  HelpCircle, Eye, Mail, Award, CheckCircle, Ticket, Layers, 
  Laptop, Briefcase, GraduationCap, Globe, Shield, RefreshCw, ChevronLeft, BookOpen, Send
} from "lucide-react";
import { ApiClient, Sponsor, GalleryItem, Event, CompetitionRecord, Blog } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import EventCard from "@/components/EventCard";
import CompetitionCard from "@/components/CompetitionCard";
import BlogCard from "@/components/BlogCard";

interface HeroSlide {
  badge: string; titleLine1: string; titleLine2: string; accent: string; desc: string;
  image: string; tier: string; multipass: string; eventDate: string; venue: string;
  gate: string; price: string; code: string; slug: string;
}

interface Testimonial { quote: string; author: string; role: string }
interface HubItem { category: string; desc: string }
interface StatItem { value: string; label: string }
interface NewsletterContent { eyebrow: string; heading: string; description: string; ctaLabel: string; successMessage: string }

const DEFAULT_NEWSLETTER: NewsletterContent = {
  eyebrow: "VIP GATEWAY",
  heading: "GET SECRET PRE-SALE ACCESS ALERTS",
  description: "Enter your corporate or student email to secure discount codes and early-bird notifications before tickets sell out.",
  ctaLabel: "JOIN CREW",
  successMessage: "Secret alert pass activated. Welcome to the crew!",
};

// Fixed icon/color palette cycled by index for taxonomy-driven category chips & hub cards
// (taxonomy values are arbitrary strings with no natural icon mapping)
const CATEGORY_STYLE_PALETTE = [
  { icon: Flame, chipBg: "bg-red-50/65", chipBorder: "border-red-100", chipText: "text-red-600", hubBg: "bg-red-50/80", hubText: "text-red-500", hubBorder: "border-red-100/50" },
  { icon: Trophy, chipBg: "bg-amber-50/65", chipBorder: "border-amber-100", chipText: "text-amber-600", hubBg: "bg-amber-50/80", hubText: "text-amber-500", hubBorder: "border-amber-100/50" },
  { icon: Laptop, chipBg: "bg-cyan-50/65", chipBorder: "border-cyan-100", chipText: "text-cyan-600", hubBg: "bg-cyan-50/80", hubText: "text-cyan-500", hubBorder: "border-cyan-100/50" },
  { icon: BookOpen, chipBg: "bg-purple-50/65", chipBorder: "border-purple-100", chipText: "text-purple-600", hubBg: "bg-purple-50/80", hubText: "text-purple-500", hubBorder: "border-purple-100/50" },
  { icon: Briefcase, chipBg: "bg-indigo-50/65", chipBorder: "border-indigo-100", chipText: "text-indigo-600", hubBg: "bg-indigo-50/80", hubText: "text-indigo-500", hubBorder: "border-indigo-100/50" },
  { icon: GraduationCap, chipBg: "bg-emerald-50/65", chipBorder: "border-emerald-100", chipText: "text-emerald-600", hubBg: "bg-emerald-50/80", hubText: "text-emerald-500", hubBorder: "border-emerald-100/50" },
  { icon: Globe, chipBg: "bg-orange-50/65", chipBorder: "border-orange-100", chipText: "text-orange-600", hubBg: "bg-orange-50/80", hubText: "text-orange-500", hubBorder: "border-orange-100/50" },
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
  const [isLoading, setIsLoading] = useState(true);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Dynamic content
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [partnerLogos, setPartnerLogos] = useState<string[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [arenas, setArenas] = useState<CompetitionRecord[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [eventCategories, setEventCategories] = useState<string[]>([]);
  const [hubs, setHubs] = useState<HubItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [newsletterContent, setNewsletterContent] = useState<NewsletterContent>(DEFAULT_NEWSLETTER);

  // Next slide automation
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Fetch list data
  useEffect(() => {
    const fetchData = async () => {
      const [
        allSponsors, allGallery, hero, testimonialContent, partnerContent,
        events, competitions, blogList, cityList, categoryList,
        hubsContent, statsContent, newsletterData,
      ] = await Promise.all([
        ApiClient.getSponsors(),
        ApiClient.getGalleryItems(),
        ApiClient.getSiteContent<{ slides: HeroSlide[] }>('homepage_hero'),
        ApiClient.getSiteContent<{ testimonials: Testimonial[] }>('homepage_testimonials'),
        ApiClient.getSiteContent<{ logos: string[] }>('homepage_partner_logos'),
        ApiClient.getEvents(),
        ApiClient.getCompetitions(),
        ApiClient.getBlogs(),
        ApiClient.getTaxonomy('city'),
        ApiClient.getTaxonomy('event_category'),
        ApiClient.getSiteContent<{ hubs: HubItem[] }>('homepage_hubs'),
        ApiClient.getSiteContent<{ stats: StatItem[] }>('homepage_stats'),
        ApiClient.getSiteContent<NewsletterContent>('homepage_newsletter'),
      ]);
      setSponsors(allSponsors);
      setGallery(allGallery);
      setHeroSlides(hero?.slides ?? []);
      setTestimonials(testimonialContent?.testimonials ?? []);
      setPartnerLogos(partnerContent?.logos ?? []);
      setAllEvents(events);
      setArenas(competitions);
      setBlogs(blogList);
      setCities(cityList);
      setEventCategories(categoryList);
      setHubs(hubsContent?.hubs ?? []);
      setStats(statsContent?.stats ?? []);
      setNewsletterContent(newsletterData ?? DEFAULT_NEWSLETTER);
      const cityListWithEvents = cityList.filter((c) => events.some((e) => e.city === c));
      if (cityListWithEvents.length > 0) setTrendingCity(cityListWithEvents[0]);
      else if (cityList.length > 0) setTrendingCity(cityList[0]);
      setIsLoading(false);
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

  const activeHero = heroSlides[currentSlide];

  // Derived curated sections from real event data
  const spotlightEvents = allEvents.filter(e => e.isFeatured).slice(0, 4);
  const carnivals = allEvents.filter(e => e.category === "Cultural Programs").slice(0, 4);
  const expos = allEvents.filter(e => e.category === "Trade Expos").slice(0, 4);
  const trendingEventsForCity = allEvents.filter(e => e.city === trendingCity).slice(0, 3);
  const citiesWithEvents = cities.filter(city => allEvents.some(e => e.city === city));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#ec4899] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#ec4899] font-primary font-bold tracking-widest text-[10px] uppercase animate-pulse">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col text-left">
      
      {/* 1. HERO BANNER (CAROUSEL) */}
      <section className="relative min-h-[80vh] lg:min-h-[85vh] flex items-center justify-center pt-24 pb-20 overflow-hidden dark-bg">
        {activeHero && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-102"
              style={{ backgroundImage: `url('${activeHero.image}')` }}
            ></div>

            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/50 backdrop-blur-xs"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:30px_30px] opacity-35"></div>

            <div className="container relative z-10">
              <div className="max-w-4xl text-left flex flex-col gap-6">
                <span className="text-pink-500 font-primary text-xs font-black tracking-widest uppercase">
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
          </>
        )}
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
              {eventCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
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
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
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

      {/* 2B. TRUST / STATS BAR */}
      {stats.length > 0 && (
        <section className="pt-10 pb-2 bg-[#fbfcfd]">
          <div className="container">
            <div className="bg-white border border-slate-200/80 shadow-[0_15px_50px_rgba(0,0,0,0.04)] rounded-[22px] px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center px-2">
                  <p className="text-2xl sm:text-3xl font-black font-primary text-slate-900 tracking-tight">{stat.value}</p>
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 font-primary mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. BROWSE SEGMENT FAST-TRACKS */}
      <section className="py-12 bg-[#fbfcfd]">
        <div className="container">
          <span className="text-[9px] font-primary tracking-widest text-slate-400 font-bold uppercase">Browse Segment Fast-Tracks</span>
          <div className="flex flex-wrap gap-2.5 mt-3">
            {eventCategories.map((cat, idx) => {
              const style = CATEGORY_STYLE_PALETTE[idx % CATEGORY_STYLE_PALETTE.length];
              const Icon = style.icon;
              return (
                <Link
                  key={cat}
                  href={`/events?category=${cat}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border ${style.chipBg} ${style.chipBorder} ${style.chipText} text-xs font-bold hover:scale-102 transition-transform duration-200`}
                >
                  <Icon size={12} />
                  <span>{cat}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. DISCOVER NATIONAL HUBS */}
      {hubs.length > 0 && (
        <section className="py-16 bg-[#fbfcfd] border-t border-slate-100">
          <div className="container">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 mb-8">
              <div>
                <h2 className="text-[20px] font-black tracking-tight text-slate-900 font-primary uppercase">DISCOVER NATIONAL HUBS</h2>
                <p className="text-slate-500 text-xs mt-1 font-secondary">Explore specialized arenas across the country. Tap a card to enter.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {hubs.map((hub, idx) => {
                const style = CATEGORY_STYLE_PALETTE[idx % CATEGORY_STYLE_PALETTE.length];
                const Icon = style.icon;
                return (
                  <Link
                    key={hub.category}
                    href={`/events?category=${hub.category}`}
                    className="bg-white p-5 rounded-[22px] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[210px] group"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${style.hubBg} border ${style.hubBorder} group-hover:scale-105 transition-transform duration-300`}>
                      <Icon size={18} className={style.hubText} />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-[12.5px] font-primary uppercase tracking-wider mt-4">{hub.category}</h4>
                    <p className="text-slate-500 text-[10.5px] leading-relaxed font-secondary mt-2.5 max-w-[130px] mx-auto">{hub.desc}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

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
            {spotlightEvents.map((evt) => (
              <EventCard
                key={evt.id}
                id={evt.id}
                name={evt.name}
                category={evt.category}
                city={evt.city}
                rating={evt.rating}
                reviews={evt.reviewCount}
                price={evt.ticketPrices?.[0]?.price ?? 0}
                bannerUrl={evt.bannerUrl}
                desc={evt.summary || evt.description}
              />
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
            <Link href="/competitions" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-wider flex items-center gap-1">
              <span>See All Competitions</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {arenas.map((arena) => (
              <CompetitionCard
                key={arena.id}
                id={arena.id}
                name={arena.name}
                city={arena.city}
                prizePool={arena.prizePool.replace(/^₹/, "")}
                registrationFee={arena.registrationFee}
                bannerUrl={arena.bannerUrl}
                desc={arena.summary || arena.description}
              />
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
            {carnivals.map((fest) => (
              <div key={fest.id} className="bg-white border border-slate-200 rounded-[20px] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.012)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.035)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row relative group min-h-[11.5rem]">
                <div className="w-full h-44 sm:h-full sm:w-52 sm:absolute sm:left-0 sm:top-0 overflow-hidden shrink-0">
                  <img src={fest.bannerUrl} alt={fest.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                  <span className="absolute top-3 left-3 bg-rose-500 text-white font-primary text-[7px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider z-10">MEGA FEST</span>
                </div>

                <div className="p-5 flex flex-col justify-between flex-grow sm:pl-[228px]">
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center gap-2 text-[9px] text-slate-400 font-primary tracking-wider">
                      <span className="flex items-center gap-1 text-pink-500 font-bold"><MapPin size={9} /> {fest.city}</span>
                      <span>|</span>
                      <span className="font-semibold">{fest.date}</span>
                    </div>
                    <Link href={`/events/${fest.slug}`}>
                      <h3 className="font-extrabold text-slate-800 text-[13.5px] font-primary uppercase tracking-tight line-clamp-1 hover:text-pink-500 transition-colors mt-0.5">{fest.name}</h3>
                    </Link>
                    <p className="text-slate-500 text-[10.5px] leading-relaxed line-clamp-2 font-secondary mt-1.5">{fest.summary || fest.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                    <div className="text-left">
                      <span className="text-[8px] text-slate-400 font-primary uppercase block tracking-wider">Starts</span>
                      <span className="text-slate-800 font-extrabold text-[12.5px] font-primary block mt-0.5">₹{fest.ticketPrices?.[0]?.price ?? 0}</span>
                    </div>
                    <Link href={`/events/${fest.slug}`} className="bg-slate-900 text-white font-primary text-[9.5px] font-bold px-4 py-2.5 rounded-lg tracking-widest uppercase hover:bg-pink-500 transition-colors duration-300">
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
            {expos.map((expo) => (
              <div key={expo.id} className="bg-white border border-slate-200 rounded-[20px] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.012)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.035)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row relative group min-h-[11.5rem]">
                <div className="w-full h-44 sm:h-full sm:w-52 sm:absolute sm:left-0 sm:top-0 overflow-hidden shrink-0">
                  <img src={expo.bannerUrl} alt={expo.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                  <span className="absolute top-3 left-3 bg-indigo-600 text-white font-primary text-[7px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider z-10">TRADE EXPO</span>
                </div>

                <div className="p-5 flex flex-col justify-between flex-grow sm:pl-[228px]">
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center gap-2 text-[9px] text-slate-400 font-primary tracking-wider">
                      <span className="flex items-center gap-1 text-pink-500 font-bold"><MapPin size={9} /> {expo.city}</span>
                    </div>
                    <Link href={`/events/${expo.slug}`}>
                      <h3 className="font-extrabold text-slate-800 text-[13.5px] font-primary uppercase tracking-tight line-clamp-1 hover:text-pink-500 transition-colors mt-0.5">{expo.name}</h3>
                    </Link>
                    <p className="text-slate-500 text-[10.5px] leading-relaxed line-clamp-2 font-secondary mt-1.5">{expo.summary || expo.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                    <div className="text-left">
                      <span className="text-[8px] text-slate-400 font-primary uppercase block tracking-wider">Admission</span>
                      <span className="text-slate-800 font-extrabold text-[12.5px] font-primary block mt-0.5">₹{expo.ticketPrices?.[0]?.price ?? 0}</span>
                    </div>
                    <Link href={`/events/${expo.slug}`} className="bg-slate-900 text-white font-primary text-[9.5px] font-bold px-4.5 py-2.5 rounded-lg tracking-widest uppercase hover:bg-pink-500 transition-colors duration-300">
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
      {citiesWithEvents.length > 0 && (
      <section className="bg-[#0b0f19] dark-bg py-16 px-4">
        <div className="container flex flex-col gap-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-left">
              <span className="text-[9px] font-primary tracking-widest text-pink-500 font-bold uppercase">🔥 TRENDING NEAR YOU</span>
              <h2 className="text-[22px] font-black text-white font-primary uppercase mt-1">
                WHAT'S HOT IN <span className="text-pink-500">{trendingCity.toUpperCase()}</span>
              </h2>
            </div>

            {/* City Selector Tabs */}
            <div className="flex bg-[#0f172a] border border-gray-800 p-1 rounded-xl overflow-x-auto max-w-full shrink-0">
              {citiesWithEvents.map((city) => (
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
            {trendingEventsForCity.map((evt) => (
              <div
                key={evt.id}
                className="bg-[#0f172a] dark-bg border border-gray-800 rounded-3xl overflow-hidden flex flex-col h-full hover:border-pink-500/40 transition-colors duration-300 group"
              >
                <div className="h-44 relative overflow-hidden">
                  <img src={evt.bannerUrl} alt={evt.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />

                  {/* Rating Badge Overlay */}
                  <div className="absolute top-3.5 left-3.5 bg-gray-950/80 backdrop-blur-sm px-2.5 py-1 rounded flex items-center gap-1.5 text-[10px] text-amber-400 font-bold font-primary">
                    <Star size={11} fill="currentColor" />
                    <span>{evt.rating}</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between flex-grow gap-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[8px] text-pink-500 font-primary font-bold uppercase tracking-wider">{evt.category}</span>
                    <Link href={`/events/${evt.slug}`}>
                      <h3 className="font-extrabold text-white text-[13.5px] font-primary line-clamp-1 hover:text-pink-500 transition-colors cursor-pointer mt-0.5">{evt.name}</h3>
                    </Link>
                    <p className="text-gray-400 text-xs font-secondary line-clamp-2 leading-relaxed">{evt.summary || evt.description}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-800/60 flex justify-between items-center mt-1">
                    <div>
                      <span className="text-[8px] text-gray-500 block uppercase leading-none font-primary">VENUE PRICE</span>
                      <span className="font-bold text-white text-xs">₹{evt.ticketPrices?.[0]?.price ?? 0}</span>
                    </div>
                    <Link
                      href={`/events/${evt.slug}`}
                      className="bg-pink-500 hover:bg-pink-600 text-slate-950 text-[9.5px] font-primary font-black px-4.5 py-2.5 rounded-lg transition-colors duration-200"
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
      )}

      {/* 10. SEASON SNAPSHOTS (GALLERY PREVIEW) */}
      <section className="py-16 bg-[#fbfcfd] border-t border-slate-100">
        <div className="container">
          <div className="flex items-end justify-between border-b border-slate-200/80 pb-4 mb-8">
            <div className="text-left">
              <h2 className="text-[20px] font-black text-slate-900 font-primary uppercase">SEASON SNAPSHOTS</h2>
              <p className="text-slate-500 text-xs mt-1 font-secondary">Archived passholder snapshots captured across metropolitan arenas.</p>
            </div>
            <Link href="/gallery" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-wider">
              View Full Gallery →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {gallery.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="relative h-44 rounded-xl overflow-hidden group border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.01)] hover:-translate-y-0.5 transition-transform duration-350"
              >
                <img src={item.thumbnailUrl || item.url} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-transparent"></div>

                <div className="absolute bottom-3 left-3 flex flex-col gap-0.5 text-left z-10">
                  <span className="text-[7px] text-pink-400 font-primary font-bold tracking-widest uppercase">{item.event}</span>
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
          <p className="text-center text-[10px] font-primary tracking-widest text-slate-400 font-bold uppercase mb-8">
            TRUSTED BRAND PARTNERS & ALLIANCE PATRONS
          </p>
          <div className="overflow-hidden w-full flex">
            <div className="flex gap-16 items-center animate-marquee whitespace-nowrap">
              {[...partnerLogos, ...partnerLogos].map((logo, idx) => (
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
            <span className="text-[10px] font-primary tracking-widest text-slate-400 font-bold uppercase">VERIFIED BADGE HOLDERS</span>
            <h2 className="text-2xl font-black text-slate-900 font-primary uppercase">TRUSTED BY THOUSANDS</h2>
          </div>

          <div className="h-[480px] overflow-hidden relative grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

            {/* Column 1 (Scroll Up) */}
            <div className="flex flex-col gap-6 animate-scroll-vertical">
              {[...testimonials.slice(0, 3), ...testimonials.slice(0, 3)].map((t, idx) => (
                <div key={idx} className="bg-[#fbfcfd] border border-slate-200/80 rounded-[20px] p-6 flex flex-col justify-between gap-5 shadow-[0_4px_15px_rgba(0,0,0,0.01)] text-left shrink-0">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" className="text-amber-500" />)}
                    </div>
                    <p className="text-slate-600 italic text-[10.5px] leading-relaxed font-secondary">"{t.quote}"</p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex flex-col gap-0.5">
                    <h4 className="font-bold text-slate-800 text-[11px] font-primary uppercase tracking-tight">{t.author}</h4>
                    <p className="text-slate-400 text-[8.5px] uppercase font-primary font-medium">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 (Scroll Down) */}
            <div className="flex flex-col gap-6 animate-scroll-vertical-down">
              {[...testimonials.slice(3, 6), ...testimonials.slice(3, 6)].map((t, idx) => (
                <div key={idx} className="bg-[#fbfcfd] border border-slate-200/80 rounded-[20px] p-6 flex flex-col justify-between gap-5 shadow-[0_4px_15px_rgba(0,0,0,0.01)] text-left shrink-0">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" className="text-amber-500" />)}
                    </div>
                    <p className="text-slate-600 italic text-[10.5px] leading-relaxed font-secondary">"{t.quote}"</p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex flex-col gap-0.5">
                    <h4 className="font-bold text-slate-800 text-[11px] font-primary uppercase tracking-tight">{t.author}</h4>
                    <p className="text-slate-400 text-[8.5px] uppercase font-primary font-medium">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 3 (Scroll Up) */}
            <div className="flex flex-col gap-6 animate-scroll-vertical">
              {[...testimonials.slice(6, 9), ...testimonials.slice(6, 9)].map((t, idx) => (
                <div key={idx} className="bg-[#fbfcfd] border border-slate-200/80 rounded-[20px] p-6 flex flex-col justify-between gap-5 shadow-[0_4px_15px_rgba(0,0,0,0.01)] text-left shrink-0">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" className="text-amber-500" />)}
                    </div>
                    <p className="text-slate-600 italic text-[10.5px] leading-relaxed font-secondary">"{t.quote}"</p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex flex-col gap-0.5">
                    <h4 className="font-bold text-slate-800 text-[11px] font-primary uppercase tracking-tight">{t.author}</h4>
                    <p className="text-slate-400 text-[8.5px] uppercase font-primary font-medium">{t.role}</p>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {blogs.slice(0, 4).map((blog) => (
              <BlogCard
                key={blog.id}
                title={blog.title}
                slug={blog.slug}
                summary={blog.summary}
                imageUrl={blog.imageUrl}
                category={blog.category}
                publishedAt={blog.publishedAt}
                aspectRatio="aspect-[16/9]"
              />
            ))}
          </div>
        </div>
      </section>

      {/* 14. VIP GATEWAY NEWSLETTER BANNER */}
      <section className="py-16 bg-[#fbfcfd] border-t border-slate-100">
        <div className="container">
          <div className="p-8 md:p-12 text-center rounded-[24px] bg-[#0f172a] dark-bg border border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-bl-full filter blur-xl"></div>
            
            <span className="text-[9px] font-primary tracking-widest text-pink-500 font-bold uppercase">{newsletterContent.eyebrow}</span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-primary uppercase tracking-tight max-w-md leading-tight">
              {newsletterContent.heading}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm max-w-sm font-secondary leading-relaxed">
              {newsletterContent.description}
            </p>

            {newsletterSubscribed ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-4 text-xs max-w-sm flex items-center gap-2">
                <CheckCircle size={16} />
                <span>{newsletterContent.successMessage}</span>
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
                  {newsletterContent.ctaLabel}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
