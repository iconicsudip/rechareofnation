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
  brandName: "RECHARGENATION",
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
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [content, setContent] = useState<FooterContent>(defaultFooterContent);

  useEffect(() => {
    let cancelled = false;
    const fetchContent = async () => {
      const data = await ApiClient.getSiteContent<FooterContent>("footer");
      if (!cancelled && data) setContent(data);
    };
    fetchContent();
    return () => {
      cancelled = true;
    };
  }, []);

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
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[#070a13] pt-16 pb-8 text-gray-400 text-sm mt-auto text-left">
      <div className="container">

        {/* Top Footer Section: Info & Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Column 1: Brand Info (2 Columns wide on large screens) */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Two-tone logo with ticket icon */}
            <Link href="/" className="flex items-center gap-2">
              <Ticket className="text-pink-500 w-6 h-6 shrink-0" />
              <span className="text-xl font-black tracking-tighter text-white font-primary">
                RECHARGE<span className="text-pink-500">NATION</span>
              </span>
            </Link>

            <p className="leading-relaxed text-xs max-w-sm font-secondary">
              {content.brandDescription}
            </p>

            {/* Mini Newsletter form: JOIN THE ALERT CREW */}
            <div className="flex flex-col gap-3 mt-2">
              <span className="text-[10px] font-primary tracking-widest text-cyan-400 font-bold uppercase">{content.newsletterHeading}</span>
              {subscribed ? (
                <span className="text-xs text-emerald-400 font-medium">Successfully subscribed to presale alerts!</span>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    placeholder={content.newsletterPlaceholder}
                    className="bg-gray-900 border border-gray-800 text-xs px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-pink-500 w-full font-secondary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="bg-pink-500 hover:bg-pink-600 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl transition-colors shrink-0 font-primary"
                  >
                    JOIN
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Columns 2 & 3: For Audiences / For Participants (data-driven) */}
          {content.columns.map((column, colIdx) => (
            <div key={column.title}>
              <h4 className="text-white font-primary font-semibold text-xs uppercase tracking-wider mb-5">{column.title}</h4>
              <div className="flex flex-col gap-3 text-xs">
                {column.links.map((link) => {
                  // Preserve the existing per-column bullet color (pink for the
                  // first column, purple for the second) and the special
                  // divider/amber styling on the Admin Portal Access link.
                  const isAdminLink = link.href === "/admin/login";
                  const iconColorClass = isAdminLink ? "text-amber-500" : colIdx === 0 ? "text-pink-500" : "text-purple-400";
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`hover:text-white transition-colors flex items-center gap-1${isAdminLink ? " mt-1 border-t border-white/5 pt-1" : ""}`}
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
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-primary">
          <p>&copy; {currentYear} Recharge Nation. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              className="p-2.5 bg-[rgba(255,255,255,0.03)] border border-gray-800 hover:border-white rounded-lg text-gray-400 hover:text-white transition-all flex items-center justify-center shadow"
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
