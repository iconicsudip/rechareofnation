"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, Calendar, MapPin, Trophy, ArrowRight, Star, Heart, 
  Flame, Compass, ChevronRight, Music, Sparkles, Paintbrush, 
  HelpCircle, Eye, Mail, Award, CheckCircle, Ticket, Layers, 
  Laptop, Briefcase, GraduationCap, Globe, Shield, RefreshCw, ChevronLeft, BookOpen, Send, ImageIcon
} from "lucide-react";
import { ApiClient, GalleryItem, Event, CompetitionRecord, Blog, Sponsor } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import EventCard from "@/components/EventCard";
import BlogCard from "@/components/BlogCard";

function isVideoUrl(url: string): boolean {
  const clean = url.trim().toLowerCase().split("?")[0];
  return clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov") || clean.endsWith(".ogg");
}

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

// Fixed icon palette cycled by index for taxonomy-driven hub cards (taxonomy
// values are arbitrary strings with no natural icon mapping). Every hub now
// shares the same gold accent treatment, so only the icon varies.
const CATEGORY_ICONS = [Flame, Trophy, Laptop, BookOpen, Briefcase, GraduationCap, Globe];

export default function HomePage() {
  const router = useRouter();

  const [currentSlide, setCurrentSlide] = useState(0);

  
  // Custom API seeded lists states
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  
interface HeroContent {
  edition?: string;
  watermark?: string;
  title?: string;
  dateText?: string;
  bgImage?: string;
  slug?: string;
  upcomingLinks?: { label: string; href: string }[];
}

const DEFAULT_HOMEPAGE_HERO: HeroContent = {
  edition: "3rd Edition",
  watermark: "AANYA GROUP",
  title: "Hospitality, Catering, Tourism & Food Festival 2025",
  dateText: "| Dec 17–19, 2025 |",
  bgImage: "/images/hospitality-bg.jpg",
  slug: "udaipur-hospitality-catering-tourism-food-festival-2025",
  upcomingLinks: [
    { label: "Campaigns", href: "/events" },
    { label: "International Kathak Festival", href: "/events/international-kathak-festival-udaipur-2025" },
    { label: "Rajneeti Ke Stambh", href: "/events/rajneeti-ke-stambh" },
    { label: "Rajasthan Festival", href: "/events" },
    { label: "Udaipur Hospitality Catering Tourism", href: "/events/udaipur-hospitality-catering-tourism-food-festival-2025" },
    { label: "Global Education", href: "/events/global-educational-edutech-conclave" },
  ],
};

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Dynamic content
  const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HOMEPAGE_HERO);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [arenas, setArenas] = useState<CompetitionRecord[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [eventCategories, setEventCategories] = useState<string[]>([]);
  const [hubs, setHubs] = useState<HubItem[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [aboutContent, setAboutContent] = useState<{ eyebrow: string; heading: string; description: string; image?: string }>({
    eyebrow: "Who We Are", heading: "About Recharge Nation", description: "",
  });
  const [newsletterContent, setNewsletterContent] = useState<NewsletterContent>(DEFAULT_NEWSLETTER);

  // Next slide automation
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Fetch every section's data independently — the page renders instantly with
  // its static shell, and each section pops in on its own as soon as ITS call
  // resolves, instead of the whole page waiting on the slowest one.
  useEffect(() => {
    // One request for all 6 site_content keys this page needs, instead of 6
    // separate round-trips to the same table.
    ApiClient.getAllSiteContent().then((all) => {
      const rawHero = all.homepage_hero as any;
      if (rawHero) {
        if (Array.isArray(rawHero.slides) && rawHero.slides.length > 0) {
          setHeroSlides(rawHero.slides);
        }
        if (rawHero.title || rawHero.edition || rawHero.upcomingLinks) {
          setHeroContent((prev) => ({ ...prev, ...rawHero }));
        }
      }
      const statsContent = all.homepage_stats as { eyebrow?: string; heading?: string; description?: string; image?: string; stats: StatItem[] } | undefined;
      setStats(statsContent?.stats ?? []);
      if (statsContent) {
        setAboutContent({
          eyebrow: statsContent.eyebrow || "Who We Are",
          heading: statsContent.heading || "About Recharge Nation",
          description: statsContent.description || "",
          image: statsContent.image || "",
        });
      }
      setHubs((all.homepage_hubs as { hubs: HubItem[] } | undefined)?.hubs ?? []);
      setTestimonials((all.homepage_testimonials as { testimonials: Testimonial[] } | undefined)?.testimonials ?? []);
      setNewsletterContent((all.homepage_newsletter as NewsletterContent | undefined) ?? DEFAULT_NEWSLETTER);
    });
    ApiClient.getTaxonomy('event_category').then(setEventCategories);
    ApiClient.getTaxonomy('city').then(setCities);
    ApiClient.getEvents().then(setAllEvents).catch(() => setAllEvents([]));
    ApiClient.getCompetitions().then(setArenas);
    ApiClient.getGalleryItems().then(setGallery);
    ApiClient.getSponsors().then(setSponsors);
    ApiClient.getBlogs().then(setBlogs);
  }, []);




  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail("");
      console.log(`[MOCK EMAIL SMTP] Alert Crew joined: ${newsletterEmail}`);
    }
  };

  const activeHero = heroSlides[currentSlide];

  // Derived curated sections from real event data. Categories are free-text
  // admin/taxonomy values, not a fixed enum — matching on one exact category
  // name left these sections empty whenever real inventory used a different
  // (but thematically equivalent) category. Match broader theme buckets
  // instead so these sections actually populate from whatever categories
  // real events are currently using.
  const CARNIVAL_CATEGORIES = new Set([
    "Cultural Programs", "Dance Competitions", "Singing Competitions",
    "Fashion Shows", "Food Festivals", "Art & Craft", "Talent Hunt", "Sports",
  ]);
  const EXPO_CATEGORIES = new Set(["Trade Expos", "Business Expo", "Startup Conference", "Educational Events"]);

  // Only events marked "Featured Event" in the admin appear in this homepage showcase.
  const zigzagEvents = allEvents.filter(e => e.isFeatured);
  const carnivals = allEvents.filter(e => CARNIVAL_CATEGORIES.has(e.category)).slice(0, 4);
  const expos = allEvents.filter(e => EXPO_CATEGORIES.has(e.category)).slice(0, 4);

  return (
    <div className="flex flex-col text-left">
      
      {/* 1. CINEMATIC HERO BANNER */}
      <section className="relative min-h-[580px] sm:min-h-[640px] md:min-h-[720px] flex flex-col justify-between pt-16 sm:pt-20 pb-8 sm:pb-10 overflow-hidden border-b border-[var(--border-color)]">
        {/* Background Image/Video & Cinematic Dark Overlay */}
        {heroContent.bgImage && isVideoUrl(heroContent.bgImage) ? (
          <video
            key={heroContent.bgImage}
            src={heroContent.bgImage}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 transform scale-102"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-102"
            style={{ backgroundImage: `url('${heroContent.bgImage || "/images/hospitality-bg.jpg"}')` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/60 to-black/90 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-black/75 pointer-events-none" />

        {/* Top spacer for balanced vertical alignment */}
        <div className="hidden sm:block" />

        {/* Center Content Showcase */}
        <div className="container max-w-5xl mx-auto px-4 relative z-10 text-center flex flex-col items-center justify-center my-auto">
          {/* Watermark Text Behind Heading */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
            <span className="text-white/[0.08] font-black text-6xl sm:text-8xl md:text-9xl lg:text-[135px] font-primary tracking-[0.18em] uppercase whitespace-nowrap">
              {heroContent.watermark || "AANYA GROUP"}
            </span>
          </div>

          {/* Eyebrow / Edition */}
          <div className="relative z-10 inline-flex items-center gap-2 mb-2 sm:mb-3">
            <span className="text-amber-300 font-primary text-xs sm:text-sm md:text-base font-bold tracking-[0.2em] uppercase drop-shadow-md">
              {heroContent.edition || "3rd Edition"}
            </span>
          </div>

          {/* Main Event Title */}
          <h1 className="relative z-10 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-primary text-white tracking-tight uppercase leading-[1.14] max-w-4xl mx-auto drop-shadow-xl">
            {heroContent.title || "Hospitality, Catering, Tourism & Food Festival 2025"}
          </h1>

          {/* Date Tag */}
          <div className="relative z-10 text-amber-200/90 font-mono text-xs sm:text-sm md:text-base font-bold tracking-widest uppercase mt-3 sm:mt-4 drop-shadow">
            {heroContent.dateText || "| Dec 17–19, 2025 |"}
          </div>

          {/* Action CTAs */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Link
              href={heroContent.slug ? `/events/${heroContent.slug}` : "/events"}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#170D08] font-black text-xs font-primary uppercase tracking-wider px-8 py-3.5 rounded-full shadow-[0_8px_30px_rgba(245,158,11,0.3)] transition-all hover:scale-105"
            >
              Explore Festival
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs font-primary uppercase tracking-wider px-6 py-3.5 rounded-full backdrop-blur-sm transition-all"
            >
              All Events
            </Link>
          </div>
        </div>

        {/* Bottom Bar: "Upcoming Events" Strip */}
        <div className="relative z-10 w-full mt-auto pt-8">
          <div className="text-center mb-2.5 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-primary tracking-[0.25em] text-white/90 font-bold uppercase drop-shadow">
              Upcoming Events
            </span>
          </div>

          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2 sm:gap-5 overflow-x-auto py-2 scrollbar-none text-center">
              {(heroContent.upcomingLinks || DEFAULT_HOMEPAGE_HERO.upcomingLinks!).map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="text-white/80 hover:text-amber-300 text-xs sm:text-sm font-primary font-bold tracking-wide transition-colors whitespace-nowrap px-2.5 py-1 rounded-lg hover:bg-white/5 shrink-0"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT RECHARGE NATION (COVER SECTION) + TRUST STATS */}
      {(aboutContent.description || stats.length > 0) && (
        <section className="py-12 sm:py-16">
          <div className="container max-w-6xl">
            <div className="bg-[#160E09]/80 backdrop-blur-xl border border-amber-500/15 shadow-[0_15px_50px_rgba(0,0,0,0.35)] rounded-[32px] px-6 py-12 md:px-12 lg:px-16 md:py-16 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className={`relative z-10 flex flex-col ${aboutContent.image ? "lg:flex-row lg:items-center" : ""} gap-10 lg:gap-14`}>
                <div className={`flex flex-col gap-6 ${aboutContent.image ? "lg:w-1/2 text-left" : "items-center text-center mx-auto max-w-3xl"}`}>
                  {aboutContent.description && (
                    <div className={`flex flex-col gap-3.5 ${aboutContent.image ? "" : "items-center"}`}>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-bold tracking-[0.2em] uppercase font-primary w-fit">
                        <Sparkles size={11} className="text-amber-400" />
                        {aboutContent.eyebrow || "Who We Are"}
                      </span>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-primary text-white tracking-tight uppercase">
                        {aboutContent.heading}
                      </h2>
                      <p className="text-stone-300 text-sm md:text-base leading-relaxed font-secondary max-w-2xl">
                        {aboutContent.description}
                      </p>
                    </div>
                  )}
                  {stats.length > 0 && (
                    <div className={`flex flex-wrap gap-x-12 sm:gap-x-16 gap-y-8 pt-4 border-t border-white/[0.06] ${aboutContent.image ? "" : "justify-center"}`}>
                      {stats.map((stat, idx) => (
                        <div key={idx} className="text-center px-2 w-28 sm:w-36">
                          <p className="text-3xl sm:text-4xl font-black font-primary text-amber-400 tracking-tight">
                            {stat.value}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 font-primary mt-2">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {aboutContent.image && (
                  <div className="lg:w-1/2 shrink-0">
                    <div className="rounded-[24px] overflow-hidden border border-amber-500/20 shadow-[0_15px_40px_rgba(0,0,0,0.4)] aspect-[4/3]">
                      <img
                        src={aboutContent.image}
                        alt={aboutContent.heading || "About Recharge Nation"}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2C. ALL EVENTS (ZIGZAG SHOWCASE) */}
      {zigzagEvents.length > 0 && (
        <section className="py-16 md:py-24 border-t border-[var(--border-color)]">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-2.5 mb-14 md:mb-20">
              <span className="text-[11px] font-primary tracking-[0.25em] text-amber-400 font-bold uppercase">
                Mark Your Calendar
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] font-primary uppercase tracking-tight">
                All Events
              </h2>
              <p className="text-[var(--text-secondary)] text-sm md:text-base font-secondary max-w-xl mx-auto">
                Explore our landmark festivals, conclaves, cultural summits, and national gatherings.
              </p>
            </div>

            <div className="flex flex-col gap-16 md:gap-24">
              {zigzagEvents.map((evt, idx) => {
                const [y, m, d] = (evt.date || "").split("-");
                const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const prettyDate = m ? `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}` : evt.date;
                const isReversed = idx % 2 === 1;

                return (
                  <div
                    key={evt.id}
                    className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-8 md:gap-14 group`}
                  >
                    {/* Media Column */}
                    <div className="w-full lg:w-1/2 aspect-[16/10] sm:aspect-[4/3] rounded-[28px] overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.35)] border border-[var(--border-color)] bg-black/40 shrink-0 relative">
                      {evt.bannerUrl ? (
                        <img
                          src={evt.bannerUrl}
                          alt={evt.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 to-black text-amber-500/40 p-6 text-center">
                          <ImageIcon size={44} className="mb-2" />
                          <span className="text-xs uppercase font-primary tracking-widest text-stone-400">Recharge Nation</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 pointer-events-none" />

                      {evt.ticketPrices?.[0]?.price !== undefined && (
                        <span className="absolute top-4 left-4 bg-black/75 backdrop-blur-md border border-white/10 text-amber-300 text-xs font-primary font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                          {evt.ticketPrices[0].price === 0 ? "Free Entry" : `Starts ₹${evt.ticketPrices[0].price}`}
                        </span>
                      )}
                    </div>

                    {/* Content Column */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-4 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs px-3.5 py-1 rounded-full font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25 font-primary">
                          {evt.category || "Featured Event"}
                        </span>
                        {evt.isFeatured && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest bg-amber-500 text-[#170D08] font-primary">
                            Featured
                          </span>
                        )}
                      </div>

                      <Link href={`/events/${evt.slug}`}>
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] font-primary uppercase tracking-tight leading-tight hover:text-amber-400 transition-colors">
                          {evt.name}
                        </h3>
                      </Link>

                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-primary font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                        {prettyDate && (
                          <span className="flex items-center gap-1.5">
                            <Calendar size={15} className="text-amber-400 shrink-0" /> {prettyDate}
                          </span>
                        )}
                        {(evt.venue || evt.city) && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={15} className="text-amber-400 shrink-0" /> {[evt.venue, evt.city].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </div>

                      <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-secondary line-clamp-3">
                        {evt.summary || evt.description?.replace(/<[^>]+>/g, " ")}
                      </p>

                      <div className="flex items-center gap-4 mt-2">
                        <Link
                          href={`/events/${evt.slug}`}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 transition-all text-[#170D08] text-xs font-primary font-bold uppercase tracking-wider rounded-xl px-7 py-3.5 shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:scale-102"
                        >
                          View Details <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. DISCOVER NATIONAL HUBS */}
      {hubs.length > 0 && (
        <section className="py-16 border-t border-[var(--border-color)]">
          <div className="container">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 mb-8">
              <div>
                <h2 className="text-[20px] font-black tracking-tight text-[var(--text-primary)] font-primary uppercase">DISCOVER NATIONAL HUBS</h2>
                <p className="text-[var(--text-secondary)] text-xs mt-1 font-secondary">Explore specialized arenas across the country. Tap a card to enter.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {hubs.map((hub, idx) => (
                <Link
                  key={hub.category}
                  href={`/events?category=${hub.category}`}
                  className="bg-[var(--bg-card)] p-5 rounded-[22px] border border-[var(--border-color)] shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:border-amber-500/40 hover:shadow-[0_15px_40px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[210px] group"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20 group-hover:scale-105 transition-transform duration-300">
                    {(() => { const Icon = CATEGORY_ICONS[idx % CATEGORY_ICONS.length]; return <Icon size={18} className="text-amber-400" />; })()}
                  </div>
                  <h4 className="font-extrabold text-[var(--text-primary)] text-[12.5px] font-primary uppercase tracking-wider mt-4">{hub.category}</h4>
                  <p className="text-[var(--text-secondary)] text-[10.5px] leading-relaxed font-secondary mt-2.5 max-w-[130px] mx-auto">{hub.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. NATIONAL ARENAS (ZIGZAG SHOWCASE) */}
      {arenas.length > 0 && (
      <section className="py-16 md:py-24 border-t border-[var(--border-color)]">
        <div className="container">
          <div className="flex items-end justify-between border-b border-[var(--border-color)] pb-4 mb-14 md:mb-20">
            <div>
              <h2 className="text-[20px] font-black text-[var(--text-primary)] font-primary uppercase">NATIONAL ARENAS</h2>
              <p className="text-[var(--text-secondary)] text-xs mt-1 font-secondary">Claim your crown. Register as a participant to win major prize pools.</p>
            </div>
            <Link href="/competitions" className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider flex items-center gap-1">
              <span>See All Competitions</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="flex flex-col gap-16 md:gap-24">
            {arenas.map((arena, idx) => {
              const isReversed = idx % 2 === 1;
              return (
                <div
                  key={arena.id}
                  className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-8 md:gap-14 group`}
                >
                  {/* Media Column */}
                  <div className="w-full lg:w-1/2 aspect-[16/10] sm:aspect-[4/3] rounded-[28px] overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.35)] border border-[var(--border-color)] bg-black/40 shrink-0 relative">
                    {arena.bannerUrl ? (
                      <img
                        src={arena.bannerUrl}
                        alt={arena.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 to-black text-amber-500/40 p-6 text-center">
                        <Trophy size={44} className="mb-2" />
                        <span className="text-xs uppercase font-primary tracking-widest text-stone-400">Recharge Nation</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 pointer-events-none" />

                    {arena.prizePool && (
                      <span className="absolute top-4 left-4 bg-black/75 backdrop-blur-md border border-white/10 text-amber-300 text-xs font-primary font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                        <Trophy size={12} /> Prize Pool: {arena.prizePool}
                      </span>
                    )}
                    {arena.city && (
                      <span className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs font-primary font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={12} className="text-amber-400" /> {arena.city}
                      </span>
                    )}
                  </div>

                  {/* Content Column */}
                  <div className="w-full lg:w-1/2 flex flex-col gap-4 text-left">
                    <span className="w-fit text-[10px] sm:text-xs px-3.5 py-1 rounded-full font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25 font-primary">
                      National Arena
                    </span>

                    <Link href={`/competitions/${arena.slug}`}>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] font-primary uppercase tracking-tight leading-tight hover:text-amber-400 transition-colors">
                        {arena.name}
                      </h3>
                    </Link>

                    <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed font-secondary line-clamp-3">
                      {arena.summary || arena.description?.replace(/<[^>]+>/g, " ")}
                    </p>

                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex flex-col">
                        <span className="text-[10px] font-primary font-bold uppercase tracking-widest text-[var(--text-muted)]">Boarding Fee</span>
                        <span className="text-lg font-black font-primary text-[var(--text-primary)]">
                          {arena.registrationFee === 0 ? "Free" : `₹${arena.registrationFee}`}
                        </span>
                      </span>
                      <Link
                        href={`/competitions/${arena.slug}`}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 transition-all text-[#170D08] text-xs font-primary font-bold uppercase tracking-wider rounded-xl px-7 py-3.5 shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:scale-102"
                      >
                        Register Contestant <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* 7. MEGA CARNIVALS */}
      {carnivals.length > 0 && (
      <section className="py-16 border-t border-[var(--border-color)]">
        <div className="container">
          <div className="flex items-end justify-between border-b border-[var(--border-color)] pb-4 mb-8">
            <div>
              <h2 className="text-[20px] font-black text-[var(--text-primary)] font-primary uppercase">MEGA CARNIVALS</h2>
              <p className="text-[var(--text-secondary)] text-xs mt-1 font-secondary">Elite cultural spectacles, heavy concert setups, and Navratri dance arenas.</p>
            </div>
            <Link href="/events" className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider flex items-center gap-1">
              <span>Explore Festivals</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {carnivals.map((fest) => (
              <div key={fest.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.25)] hover:border-amber-500/40 hover:shadow-[0_12px_35px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col sm:flex-row relative group min-h-[11.5rem]">
                <div className="w-full h-44 sm:h-full sm:w-52 sm:absolute sm:left-0 sm:top-0 overflow-hidden shrink-0 bg-black/20">
                  {fest.bannerUrl ? (
                    <img src={fest.bannerUrl} alt={fest.name} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} className="text-[var(--text-muted)]" /></div>
                  )}
                  <span className="absolute top-3 left-3 bg-amber-500 text-[#170D08] font-primary text-[7px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider z-10">MEGA FEST</span>
                </div>

                <div className="p-5 flex flex-col justify-between flex-grow sm:pl-[228px]">
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center gap-2 text-[9px] text-[var(--text-muted)] font-primary tracking-wider">
                      <span className="flex items-center gap-1 text-amber-400 font-bold"><MapPin size={9} /> {fest.city}</span>
                      <span>|</span>
                      <span className="font-semibold">{fest.date}</span>
                    </div>
                    <Link href={`/events/${fest.slug}`}>
                      <h3 className="font-extrabold text-[var(--text-primary)] text-[13.5px] font-primary uppercase tracking-tight line-clamp-1 hover:text-amber-400 transition-colors mt-0.5">{fest.name}</h3>
                    </Link>
                    <p className="text-[var(--text-secondary)] text-[10.5px] leading-relaxed line-clamp-2 font-secondary mt-1.5">{fest.summary || fest.description}</p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between gap-2 mt-4">
                    <div className="text-left">
                      <span className="text-[8px] text-[var(--text-muted)] font-primary uppercase block tracking-wider">Starts</span>
                      <span className="text-[var(--text-primary)] font-extrabold text-[12.5px] font-primary block mt-0.5">₹{fest.ticketPrices?.[0]?.price ?? 0}</span>
                    </div>
                    <Link href={`/events/${fest.slug}`} className="bg-[var(--bg-panel)] text-[var(--text-primary)] font-primary text-[9.5px] font-bold px-4 py-2.5 rounded-lg tracking-widest uppercase hover:bg-amber-500 hover:text-[#170D08] transition-colors duration-300">
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

      {/* 8. INNOVATION TRADE EXPOS */}
      {expos.length > 0 && (
      <section className="py-16 border-t border-[var(--border-color)]">
        <div className="container">
          <div className="flex items-end justify-between border-b border-[var(--border-color)] pb-4 mb-8">
            <div>
              <h2 className="text-[20px] font-black text-[var(--text-primary)] font-primary uppercase">INNOVATION TRADE EXPOS</h2>
              <p className="text-[var(--text-secondary)] text-xs mt-1 font-secondary">Trade exhibits, engineering summits, future clean mobility galleries.</p>
            </div>
            <Link href="/events" className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider flex items-center gap-1">
              <span>See All Expos</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {expos.map((expo) => (
              <div key={expo.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.25)] hover:border-amber-500/40 hover:shadow-[0_12px_35px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col sm:flex-row relative group min-h-[11.5rem]">
                <div className="w-full h-44 sm:h-full sm:w-52 sm:absolute sm:left-0 sm:top-0 overflow-hidden shrink-0 bg-black/20">
                  {expo.bannerUrl ? (
                    <img src={expo.bannerUrl} alt={expo.name} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} className="text-[var(--text-muted)]" /></div>
                  )}
                  <span className="absolute top-3 left-3 bg-[var(--bg-panel)] border border-amber-500/30 text-amber-400 font-primary text-[7px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider z-10">TRADE EXPO</span>
                </div>

                <div className="p-5 flex flex-col justify-between flex-grow sm:pl-[228px]">
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center gap-2 text-[9px] text-[var(--text-muted)] font-primary tracking-wider">
                      <span className="flex items-center gap-1 text-amber-400 font-bold"><MapPin size={9} /> {expo.city}</span>
                    </div>
                    <Link href={`/events/${expo.slug}`}>
                      <h3 className="font-extrabold text-[var(--text-primary)] text-[13.5px] font-primary uppercase tracking-tight line-clamp-1 hover:text-amber-400 transition-colors mt-0.5">{expo.name}</h3>
                    </Link>
                    <p className="text-[var(--text-secondary)] text-[10.5px] leading-relaxed line-clamp-2 font-secondary mt-1.5">{expo.summary || expo.description}</p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between gap-2 mt-4">
                    <div className="text-left">
                      <span className="text-[8px] text-[var(--text-muted)] font-primary uppercase block tracking-wider">Admission</span>
                      <span className="text-[var(--text-primary)] font-extrabold text-[12.5px] font-primary block mt-0.5">₹{expo.ticketPrices?.[0]?.price ?? 0}</span>
                    </div>
                    <Link href={`/events/${expo.slug}`} className="bg-[var(--bg-panel)] text-[var(--text-primary)] font-primary text-[9.5px] font-bold px-4.5 py-2.5 rounded-lg tracking-widest uppercase hover:bg-amber-500 hover:text-[#170D08] transition-colors duration-300">
                      Register
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}



      {/* 10. SEASON SNAPSHOTS (EDITORIAL GALLERY MOSAIC) */}
      {gallery.length > 0 && (
      <section className="py-16 border-t border-[var(--border-color)]">
        <div className="container">
          <div className="flex items-end justify-between border-b border-[var(--border-color)] pb-4 mb-8">
            <div className="text-left">
              <h2 className="text-[20px] font-black text-[var(--text-primary)] font-primary uppercase">SEASON SNAPSHOTS</h2>
              <p className="text-[var(--text-secondary)] text-xs mt-1 font-secondary">Archived passholder snapshots captured across metropolitan arenas.</p>
            </div>
            <Link href="/gallery" className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider shrink-0">
              View Full Gallery →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 sm:grid-rows-2 gap-4 sm:h-[460px]">
            {gallery.slice(0, 5).map((item, idx) => (
              <div
                key={item.id}
                className={`relative rounded-2xl overflow-hidden group border border-[var(--border-color)] shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:border-amber-500/40 transition-all duration-350 bg-black/20 ${
                  idx === 0 ? "col-span-2 row-span-2 h-72 sm:h-full" : "h-44 sm:h-full"
                }`}
              >
                {(item.thumbnailUrl || item.url) ? (
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} className="text-[var(--text-muted)]" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent"></div>

                <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-0.5 text-left z-10">
                  <span className="text-[7px] text-amber-400 font-primary font-bold tracking-widest uppercase">{item.event}</span>
                  <span className={`text-[var(--text-primary)] font-bold line-clamp-2 ${idx === 0 ? "text-sm sm:text-base" : "text-[9px]"}`}>
                    {item.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* 11. TRUSTED BRAND PARTNERS & ALLIANCE PATRONS (sourced from the Sponsors/Partners page) */}
      {sponsors.length > 0 && (
        <section className="border-y border-[var(--border-color)] py-14 overflow-hidden relative bg-[var(--bg-panel)]/40">
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[var(--bg-main)] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[var(--bg-main)] to-transparent z-10 pointer-events-none"></div>

          <div className="container relative flex flex-col items-center gap-8">
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-2.5">
              <span className="text-[11px] font-primary tracking-[0.25em] text-amber-400 font-bold uppercase">
                Our Network
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] font-primary uppercase tracking-tight">
                Brand Partners &amp; Alliance Patrons
              </h2>
              <p className="text-[var(--text-secondary)] text-sm md:text-base font-secondary max-w-xl mx-auto">
                Trusted by leading brands powering our events, competitions, and national campaigns.
              </p>
            </div>

            <div className="overflow-hidden w-full flex">
              <div className="flex gap-4 sm:gap-5 items-center animate-marquee">
                {[...sponsors, ...sponsors].map((sponsor, idx) => (
                  <Link
                    key={idx}
                    href="/sponsors"
                    title={sponsor.name}
                    className="shrink-0 select-none flex items-center justify-center h-20 w-[150px] sm:w-[170px] rounded-2xl bg-white border border-[var(--border-color)] hover:border-amber-500/30 hover:shadow-md px-5 py-4 transition-all duration-300"
                  >
                    {sponsor.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sponsor.logoUrl}
                        alt={sponsor.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="font-black text-xs sm:text-sm text-slate-700 font-primary tracking-tight text-center leading-tight hover:text-amber-600 transition-colors duration-300">
                        {sponsor.name.toUpperCase()}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 12. TRUSTED BY THOUSANDS (TESTIMONIALS) */}
      <section className="py-20 border-t border-[var(--border-color)] overflow-hidden">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-2">
            <span className="text-[10px] font-primary tracking-widest text-[var(--text-muted)] font-bold uppercase">VERIFIED BADGE HOLDERS</span>
            <h2 className="text-2xl font-black text-[var(--text-primary)] font-primary uppercase">TRUSTED BY THOUSANDS</h2>
          </div>

          {/* Mobile: a plain stacked list — the 3-column auto-scroll marquee below
              is a desktop-only effect (each column self-animates via a CSS
              transform loop, clipped by this container's fixed height; on a
              single mobile column the other two columns would just be cut off
              by that same clip, so we swap to a normal list instead). */}
          <div className="flex md:hidden flex-col gap-4">
            {testimonials.slice(0, 4).map((t, idx) => (
              <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 flex flex-col gap-5 shadow-[0_4px_15px_rgba(0,0,0,0.2)] text-left">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" className="text-amber-400" />)}
                  </div>
                  <p className="text-[var(--text-secondary)] italic text-[10.5px] leading-relaxed font-secondary">&quot;{t.quote}&quot;</p>
                </div>
                <div className="border-t border-[var(--border-color)] pt-3 flex flex-col gap-0.5">
                  <h4 className="font-bold text-[var(--text-primary)] text-[11px] font-primary uppercase tracking-tight">{t.author}</h4>
                  <p className="text-[var(--text-muted)] text-[8.5px] uppercase font-primary font-medium">{t.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:grid h-[480px] overflow-hidden relative grid-cols-1 md:grid-cols-3 gap-6 select-none">
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--bg-main)] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--bg-main)] to-transparent z-10 pointer-events-none"></div>

            {/* Column 1 (Scroll Up) */}
            <div className="flex flex-col gap-6 animate-scroll-vertical">
              {[...testimonials.slice(0, 3), ...testimonials.slice(0, 3)].map((t, idx) => (
                <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 flex flex-col justify-between gap-5 shadow-[0_4px_15px_rgba(0,0,0,0.2)] text-left shrink-0">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" className="text-amber-400" />)}
                    </div>
                    <p className="text-[var(--text-secondary)] italic text-[10.5px] leading-relaxed font-secondary">"{t.quote}"</p>
                  </div>
                  <div className="border-t border-[var(--border-color)] pt-3 flex flex-col gap-0.5">
                    <h4 className="font-bold text-[var(--text-primary)] text-[11px] font-primary uppercase tracking-tight">{t.author}</h4>
                    <p className="text-[var(--text-muted)] text-[8.5px] uppercase font-primary font-medium">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 (Scroll Down) */}
            <div className="flex flex-col gap-6 animate-scroll-vertical-down">
              {[...testimonials.slice(3, 6), ...testimonials.slice(3, 6)].map((t, idx) => (
                <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 flex flex-col justify-between gap-5 shadow-[0_4px_15px_rgba(0,0,0,0.2)] text-left shrink-0">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" className="text-amber-400" />)}
                    </div>
                    <p className="text-[var(--text-secondary)] italic text-[10.5px] leading-relaxed font-secondary">"{t.quote}"</p>
                  </div>
                  <div className="border-t border-[var(--border-color)] pt-3 flex flex-col gap-0.5">
                    <h4 className="font-bold text-[var(--text-primary)] text-[11px] font-primary uppercase tracking-tight">{t.author}</h4>
                    <p className="text-[var(--text-muted)] text-[8.5px] uppercase font-primary font-medium">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 3 (Scroll Up) */}
            <div className="flex flex-col gap-6 animate-scroll-vertical">
              {[...testimonials.slice(6, 9), ...testimonials.slice(6, 9)].map((t, idx) => (
                <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[20px] p-6 flex flex-col justify-between gap-5 shadow-[0_4px_15px_rgba(0,0,0,0.2)] text-left shrink-0">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" className="text-amber-400" />)}
                    </div>
                    <p className="text-[var(--text-secondary)] italic text-[10.5px] leading-relaxed font-secondary">"{t.quote}"</p>
                  </div>
                  <div className="border-t border-[var(--border-color)] pt-3 flex flex-col gap-0.5">
                    <h4 className="font-bold text-[var(--text-primary)] text-[11px] font-primary uppercase tracking-tight">{t.author}</h4>
                    <p className="text-[var(--text-muted)] text-[8.5px] uppercase font-primary font-medium">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 13. RECHARGE CHRONICLE (BLOG PREVIEW) */}
      <section className="py-16 border-t border-[var(--border-color)]">
        <div className="container">
          <div className="flex items-end justify-between border-b border-[var(--border-color)] pb-4 mb-8">
            <div className="text-left">
              <h2 className="text-[20px] font-black text-[var(--text-primary)] font-primary uppercase">RECHARGE CHRONICLE</h2>
              <p className="text-[var(--text-secondary)] text-xs mt-1 font-secondary">Editorial briefings on handloom couture, event tech scaling, and crowd design.</p>
            </div>
            <Link href="/blogs" className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider">
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
      <section className="py-16 border-t border-[var(--border-color)]">
        <div className="container">
          <div className="p-8 md:p-12 text-center rounded-[24px] bg-[var(--bg-panel)] border border-amber-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.35)] flex flex-col items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full filter blur-xl"></div>

            <span className="text-[9px] font-primary tracking-widest text-amber-400 font-bold uppercase flex items-center gap-1.5"><span className="text-amber-500/70">✦</span>{newsletterContent.eyebrow}</span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-primary uppercase tracking-tight max-w-md leading-tight">
              {newsletterContent.heading}
            </h2>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm max-w-sm font-secondary leading-relaxed">
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
                  className="flex-grow text-xs rounded-xl bg-black/20 border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none px-4 py-3 focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="py-3.5 px-8 rounded-xl font-bold text-xs shadow-lg transition-all font-primary uppercase tracking-wide cursor-pointer text-[#170D08] bg-amber-500 hover:bg-amber-400 flex items-center justify-center shrink-0"
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
