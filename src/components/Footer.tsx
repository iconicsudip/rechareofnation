"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, ArrowUpRight, Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api-client";
import { useWhatsAppConfig } from "@/lib/useWhatsAppConfig";
import { buildWhatsAppUrl, findWhatsAppNumber, getWhatsAppCities } from "@/lib/whatsapp";

interface FooterContact {
  phone?: string;
  salesEmail?: string;
  supportEmail?: string;
  address?: string;
}

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
  const isHome = usePathname() === "/";
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [content, setContent] = useState<FooterContent>(defaultFooterContent);
  // Real entities to link to in place of hardcoded event/competition names —
  // stay null (and the link stays hidden) until real data confirms one exists.
  const [featuredEvent, setFeaturedEvent] = useState<{ name: string; slug: string } | null>(null);
  const [contact, setContact] = useState<FooterContact | null>(null);
  const whatsapp = useWhatsAppConfig();
  const whatsappCities = getWhatsAppCities(whatsapp);
  const [topCompetition, setTopCompetition] = useState<{ name: string; slug: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchContent = async () => {
      const data = await ApiClient.getSiteContent<FooterContent>("footer");
      if (!cancelled && data) setContent(data);
    };
    fetchContent();
    ApiClient.getSiteContent<FooterContact>("contact_info").then((c) => {
      if (!cancelled && c) setContact(c);
    });
    ApiClient.getEvents().then((events) => {
      if (cancelled) return;
      const featured = events.find((e) => e.isFeatured) ?? null;
      setFeaturedEvent(featured ? { name: featured.name, slug: featured.slug } : null);
    }).catch(() => { });
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

  const contactEmail = contact?.salesEmail || contact?.supportEmail;

  return (
    <footer className="relative z-[2] mt-auto pt-20 sm:pt-24 pb-8 text-left overflow-hidden bg-gradient-to-b from-[#2E050C] via-[#260409] to-[#160206] text-white/75">
      {/* Gold crest divider */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C59B27]/70 to-[#C59B27]/70" />
        <div className="w-2.5 h-2.5 rotate-45 border border-[#E5C05B] bg-[#2E050C] mx-3" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#C59B27]/70 to-[#C59B27]/70" />
      </div>

      {/* Atmosphere: lattice, glow and outlined wordmark */}
      <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#E5C05B_1px,transparent_1px)] [background-size:26px_26px]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-[radial-gradient(ellipse_at_center,rgba(197,155,39,0.2),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative max-w-[1520px] mx-auto px-4 sm:px-8">

        {/* Invitation card (home already has its own newsletter section) */}
        {!isHome && (
        <div className="relative rounded-3xl p-px bg-gradient-to-br from-[#E5C05B]/70 via-[#C59B27]/20 to-[#7B1123]/60 mb-16">
          <div className="rounded-[calc(1.5rem-1px)] bg-[#2A050B]/95 backdrop-blur-xl px-6 py-9 sm:px-12 sm:py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-secondary font-semibold tracking-[0.3em] text-[#C59B27] uppercase">By Invitation</span>
              <h3 className="font-primary text-3xl sm:text-4xl font-medium text-white leading-tight">
                {content.newsletterHeading && content.newsletterHeading === content.newsletterHeading.toUpperCase()
                  ? "Join the circle"
                  : content.newsletterHeading || "Join the circle"}
              </h3>
              <p className="text-sm text-white/60 max-w-md leading-relaxed">First access to presales, new editions and private announcements — never more than you need.</p>
            </div>
            <div>
              {subscribed ? (
                <p className="text-[#E5C05B] font-primary text-lg">Welcome to the circle — your first invitation is on its way.</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    aria-label="Email address"
                    placeholder={content.newsletterPlaceholder || "Your email address"}
                    className="w-full rounded-full bg-white/[0.06] border border-[#C59B27]/30 focus:border-[#E5C05B] focus:bg-white/10 px-6 py-4 text-sm text-white placeholder-white/40 outline-none transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 bg-gradient-to-r from-[#C59B27] via-[#E5C05B] to-[#C59B27] bg-[length:200%_100%] hover:bg-[position:100%_0] text-[#2E050C] text-[13px] font-bold uppercase tracking-[0.18em] transition-all duration-500 cursor-pointer shadow-[0_10px_30px_-10px_rgba(229,192,91,0.6)]"
                  >
                    Join <Send size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-14">

          {/* Brand & contact */}
          <div className="sm:col-span-2 lg:col-span-5 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-4 group select-none w-fit">
              <img
                loading="lazy"
                decoding="async"
                src="/images/logo-transparent.png"
                alt="Recharge For Nation"
                className="h-16 w-auto object-contain drop-shadow-[0_4px_20px_rgba(229,192,91,0.35)] group-hover:scale-105 transition-transform duration-500"
              />
              <span className="flex flex-col leading-none">
                <span className="font-primary text-2xl font-medium text-white">
                  Recharge <span className="italic text-[#E5C05B]">for</span> Nation
                </span>
                <span className="text-[9px] font-secondary font-semibold tracking-[0.3em] text-[#C59B27] uppercase mt-2">
                  One Nation • One Energy • One Future
                </span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed max-w-md text-white/60">{content.brandDescription}</p>

            {(contact?.phone || contactEmail || contact?.address) && (
              <ul className="flex flex-col gap-3 text-sm">
                {contact?.phone && (
                  <li>
                    <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-3 text-white/80 hover:text-[#E5C05B] transition-colors">
                      <span className="w-8 h-8 rounded-full border border-[#C59B27]/40 flex items-center justify-center"><Phone size={14} className="text-[#C59B27]" /></span>
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contactEmail && (
                  <li>
                    <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-3 text-white/80 hover:text-[#E5C05B] transition-colors">
                      <span className="w-8 h-8 rounded-full border border-[#C59B27]/40 flex items-center justify-center"><Mail size={14} className="text-[#C59B27]" /></span>
                      {contactEmail}
                    </a>
                  </li>
                )}
                {contact?.address && (
                  <li className="inline-flex items-start gap-3 text-white/60">
                    <span className="w-8 h-8 shrink-0 rounded-full border border-[#C59B27]/40 flex items-center justify-center"><MapPin size={14} className="text-[#C59B27]" /></span>
                    <span className="max-w-xs leading-relaxed pt-1">{contact.address}</span>
                  </li>
                )}
              </ul>
            )}

            {whatsappCities.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-[11px] font-secondary font-semibold tracking-[0.25em] text-[#C59B27] uppercase">Chat with your city team</span>
                <div className="flex flex-wrap gap-2">
                  {whatsappCities.map((city) => (
                    <a
                      key={city}
                      href={buildWhatsAppUrl(findWhatsAppNumber(whatsapp, city), `Hello Recharge Nation team (${city}),`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[#C59B27]/40 hover:border-[#25D366] hover:bg-[#25D366]/10 px-4 py-2 text-[13px] text-white/85 hover:text-white transition-all"
                    >
                      <MessageCircle size={14} className="text-[#25D366]" /> {city}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Link columns */}
          <div className="sm:col-span-2 lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10 lg:pl-8">
            {columnsToRender.map((column) => (
              <div key={column.title}>
                <h4 className="font-primary text-lg font-medium text-white mb-1">{column.title}</h4>
                <div className="h-px w-10 bg-gradient-to-r from-[#C59B27] to-transparent mb-5" />
                <div className="flex flex-col gap-3.5 text-sm">
                  {column.links.map((link) => (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      className="group relative w-fit text-white/65 hover:text-[#E5C05B] transition-all duration-300 hover:translate-x-1"
                    >
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#C59B27] group-hover:w-full transition-all duration-500" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#C59B27]/25 pt-7 grid grid-cols-1 sm:grid-cols-3 items-center gap-5 text-xs text-white/55 text-center sm:text-left">
          <p>&copy; {currentYear} Recharge Nation. All rights reserved.</p>
          <p className="font-secondary font-semibold tracking-[0.3em] uppercase text-[10px] text-[#C59B27] sm:text-center">
            One Nation <span className="mx-1.5 text-[#E5C05B]/60">◆</span> One Energy <span className="mx-1.5 text-[#E5C05B]/60">◆</span> One Future
          </p>
          <div className="flex items-center justify-center sm:justify-end gap-5">
            <Link href="/privacy" className="hover:text-[#E5C05B] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#E5C05B] transition-colors">Terms</Link>
            <button
              onClick={scrollToTop}
              aria-label="Back to top"
              className="group w-11 h-11 rounded-full border border-[#C59B27]/50 hover:border-[#E5C05B] hover:bg-[#C59B27] text-[#E5C05B] hover:text-[#2E050C] flex items-center justify-center transition-all duration-300 cursor-pointer"
            >
              <ArrowUp size={16} className="transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
