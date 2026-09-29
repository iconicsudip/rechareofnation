"use client";

import Link from "next/link";
import { Ticket, ArrowUp, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api-client";

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

interface FooterContent {
  brandName: string;
  brandTagline: string;
  brandDescription: string;
  newsletterHeading: string;
  newsletterPlaceholder: string;
  columns: FooterColumn[];
}

// Literal defaults mirror the current hardcoded copy so there's no visible
// flash while the CMS fetch resolves; the fetch overwrites this if it returns data.
const defaultFooterContent: FooterContent = {
  brandName: "RECHARGE FOR NATION",
  brandTagline: "",
  brandDescription:
    "Recharge Nation is the central portal for premium cultural programs, nationwide dance and singing clashes, style showcases, culinary festivals, and industrial exhibitions across India.",
  newsletterHeading: "JOIN THE ALERT CREW",
  newsletterPlaceholder: "Enter email for secret drop alerts",
  columns: [
    {
      title: "For Audiences",
      links: [
        { label: "All Live Events", href: "/events" },
        { label: "Abhyudaya Mega Fest", href: "/events/recharge-cultural-odyssey-2026" },
        { label: "Exhibitions & Expos", href: "/events?category=Trade%20Expos" },
        { label: "My Ticket Badges", href: "/dashboard" },
      ],
    },
    {
      title: "For Participants",
      links: [
        { label: "Mr/Miss Traditional 2026", href: "/competitions" },
        { label: "Nataraja Dance Clash", href: "/events/national-vibe-rhythm-dance-cup" },
        { label: "Become a Sponsor", href: "/sponsors" },
        { label: "Download Participant ID", href: "/dashboard" },
        { label: "Admin Portal Access", href: "/admin/login" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms & Conditions", href: "/terms" },
      ],
    },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [content, setContent] = useState<FooterContent>(defaultFooterContent);
  // Real entities to link to in place of hardcoded event/competition names —
  // stay null (and the link stays hidden) until real data confirms one exists.
  const [featuredEvent, setFeaturedEvent] = useState<{ name: string; slug: string } | null>(null);
  const [topCompetition, setTopCompetition] = useState<{ name: string; slug: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchContent = async () => {
      const data = await ApiClient.getSiteContent<FooterContent>("footer");
      if (!cancelled && data) setContent(data);
    };
    fetchContent();
    ApiClient.getEvents().then((events) => {
      if (cancelled) return;
      const featured = events.find((e) => e.isFeatured) ?? null;
      setFeaturedEvent(featured ? { name: featured.name, slug: featured.slug } : null);
    }).catch(() => {});
    ApiClient.getCompetitions().then((comps) => {
      if (cancelled) return;
      const top = comps[0] ?? null;
      setTopCompetition(top ? { name: top.name, slug: top.slug } : null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Stale references to specific events/competitions from the original demo
  // content don't survive real data changing — drop any admin-authored link
  // that points at one of those slugs, and let the dynamic entities above
  // (which hide themselves when nothing real exists) take their place.
  const STALE_HREFS = new Set([
    "/events/recharge-cultural-odyssey-2026",
    "/events/national-vibe-rhythm-dance-cup",
  ]);

  const hasAboutOrContact = (content.columns || []).some((col) =>
    col.links?.some((l) => l.href === "/about" || l.href === "/contact")
  );

  const dynamicColumns = (content.columns || []).map((column, colIdx) => {
    const links = (column.links || []).filter((l) => !STALE_HREFS.has(l.href) && l.label !== "Mr/Miss Traditional 2026");
    if (colIdx === 0 && featuredEvent) {
      links.splice(1, 0, { label: featuredEvent.name, href: `/events/${featuredEvent.slug}` });
    }
    if (colIdx === 1 && topCompetition) {
      links.unshift({ label: topCompetition.name, href: "/competitions" });
    }
    return { ...column, links };
  });

  const columnsToRender = [...dynamicColumns];
  if (!hasAboutOrContact) {
    columnsToRender.push({
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms & Conditions", href: "/terms" },
      ],
    });
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      console.log(`[MOCK EMAIL SMTP] Alert Crew joined via footer: ${email}`);
    }
  };

  return (
    <footer className="border-t border-[var(--border-color)] bg-[#0D0603] pt-16 pb-8 text-[var(--text-secondary)] text-sm mt-auto text-left">
      <div className="container">

        {/* Top Footer Section: Info & Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Column 1: Brand Info (2 Columns wide on large screens) */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Brand Logo with Official Emblem */}
            <Link href="/" className="flex items-center gap-3.5 group select-none">
              <img
                src="/images/logo-transparent.png"
                alt="Recharge For Nation"
                className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_4px_16px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-all duration-300"
              />
              <div className="flex flex-col text-left">
                <span className="text-xl font-black tracking-tight text-[var(--text-primary)] font-primary uppercase leading-tight">
                  RECHARGE<span className="text-amber-400"> FOR NATION</span>
                </span>
                <span className="text-[8px] font-primary font-bold tracking-[0.25em] text-amber-500/80 uppercase mt-1">
                  ONE NATION • ONE ENERGY • ONE FUTURE
                </span>
              </div>
            </Link>

            <p className="leading-relaxed text-xs max-w-sm font-secondary">
              {content.brandDescription}
            </p>

            {/* Mini Newsletter form: JOIN THE ALERT CREW */}
            <div className="flex flex-col gap-3 mt-2">
              <span className="text-[10px] font-primary tracking-widest text-[var(--text-muted)] font-bold uppercase">{content.newsletterHeading}</span>
              {subscribed ? (
                <span className="text-xs text-emerald-400 font-medium">Successfully subscribed to presale alerts!</span>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    placeholder={content.newsletterPlaceholder}
                    className="bg-white/5 border border-[var(--border-color)] text-xs px-3.5 py-2.5 rounded-xl text-[var(--text-primary)] outline-none focus:border-amber-400 w-full font-secondary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-[#170D08] text-xs font-black px-4 py-2.5 rounded-xl transition-colors shrink-0 font-primary"
                  >
                    JOIN
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Columns: For Audiences / For Participants / Company (data-driven + guaranteed) */}
          {columnsToRender.map((column, colIdx) => (
            <div key={column.title}>
              <h4 className="text-[var(--text-primary)] font-primary font-semibold text-xs uppercase tracking-wider mb-5">{column.title}</h4>
              <div className="flex flex-col gap-3 text-xs">
                {column.links.map((link) => {
                  const isAdminLink = link.href === "/admin/login";
                  const iconColorClass = isAdminLink ? "text-amber-400" : colIdx === 0 ? "text-amber-400" : "text-[var(--text-muted)]";
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`hover:text-[var(--text-primary)] transition-colors flex items-center gap-1${isAdminLink ? " mt-1 border-t border-[var(--border-color)] pt-1" : ""}`}
                    >
                      <ChevronRight size={12} className={iconColorClass} /> {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

        </div>

        {/* Footer Bottom bar */}
        <div className="border-t border-[var(--border-color)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-primary">
          <p>&copy; {currentYear} Recharge Nation. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-6">
            <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors">Contact Us</Link>
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms & Conditions</Link>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              className="p-2.5 bg-white/[0.03] border border-[var(--border-color)] hover:border-amber-400 rounded-lg text-[var(--text-secondary)] hover:text-amber-400 transition-all flex items-center justify-center shadow"
              title="Back to Top"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
