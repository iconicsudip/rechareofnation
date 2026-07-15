"use client";

import Link from "next/link";
import { Ticket, ArrowUp, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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
              Recharge Nation is the central portal for premium cultural programs, nationwide dance and singing clashes, style showcases, culinary festivals, and industrial exhibitions across India.
            </p>

            {/* Mini Newsletter form: JOIN THE ALERT CREW */}
            <div className="flex flex-col gap-3 mt-2">
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">JOIN THE ALERT CREW</span>
              {subscribed ? (
                <span className="text-xs text-emerald-400 font-medium">Successfully subscribed to presale alerts!</span>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    placeholder="Enter email for secret drop alerts"
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

          {/* Column 2: For Audiences */}
          <div>
            <h4 className="text-white font-primary font-semibold text-xs uppercase tracking-wider mb-5">For Audiences</h4>
            <div className="flex flex-col gap-3 text-xs">
              <Link href="/events" className="hover:text-white transition-colors flex items-center gap-1">
                <ChevronRight size={12} className="text-pink-500" /> All Live Events
              </Link>
              <Link href="/events/recharge-cultural-odyssey-2026" className="hover:text-white transition-colors flex items-center gap-1">
                <ChevronRight size={12} className="text-pink-500" /> Abhyudaya Mega Fest
              </Link>
              <Link href="/events?category=Trade%20Expos" className="hover:text-white transition-colors flex items-center gap-1">
                <ChevronRight size={12} className="text-pink-500" /> Exhibitions & Expos
              </Link>
              <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
                <ChevronRight size={12} className="text-pink-500" /> My Ticket Badges
              </Link>
            </div>
          </div>

          {/* Column 3: For Participants */}
          <div>
            <h4 className="text-white font-primary font-semibold text-xs uppercase tracking-wider mb-5">For Participants</h4>
            <div className="flex flex-col gap-3 text-xs">
              <Link href="/competitions" className="hover:text-white transition-colors flex items-center gap-1">
                <ChevronRight size={12} className="text-purple-400" /> Mr/Miss Traditional 2026
              </Link>
              <Link href="/events/national-vibe-rhythm-dance-cup" className="hover:text-white transition-colors flex items-center gap-1">
                <ChevronRight size={12} className="text-purple-400" /> Nataraja Dance Clash
              </Link>
              <Link href="/sponsors" className="hover:text-white transition-colors flex items-center gap-1">
                <ChevronRight size={12} className="text-purple-400" /> Become a Sponsor
              </Link>
              <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
                <ChevronRight size={12} className="text-purple-400" /> Download Participant ID
              </Link>
              <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1 mt-1 border-t border-white/5 pt-1">
                <ChevronRight size={12} className="text-amber-500" /> Admin Portal Access
              </Link>
            </div>
          </div>

        </div>

        {/* Footer Bottom bar */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
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
