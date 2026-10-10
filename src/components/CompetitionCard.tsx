"use client";

import Link from "next/link";
import { MapPin, Trophy, ImageIcon } from "lucide-react";


export interface CompetitionCardProps {
  id: string;
  slug: string;
  name: string;
  city: string;
  prizePool: string;
  registrationFee: number;
  bannerUrl: string;
  desc: string;
}

export default function CompetitionCard(arena: CompetitionCardProps) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.25)] hover:border-[var(--border-hover)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col group relative h-full justify-between">

      {/* Image Section */}
      <div className="h-56 relative overflow-hidden bg-black/20 shrink-0">
        {arena.bannerUrl ? (
          <img
            src={arena.bannerUrl || undefined}
            alt={arena.name}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/logo.png";
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={28} className="text-[var(--text-muted)]" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>

        {/* Prize Pool Badge Overlay */}
        <span className="absolute top-4 left-4 bg-[#7B1123] text-[#F3BA2F] border border-[#C59B27]/40 font-primary text-[8px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-md shadow-[#7B1123]/25 flex items-center gap-1">
          <Trophy size={10} className="shrink-0 text-[#C59B27]" /> PRIZE POOL: ₹{arena.prizePool}
        </span>

        {/* Audition Spot Badge Overlay */}
        <div className="absolute bottom-3.5 left-3.5 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[8px] text-white font-bold font-primary tracking-wider uppercase z-10 shadow-md">
          <MapPin size={10} className="text-[#C59B27] shrink-0" /> {arena.city} AUDITION SPOT
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col justify-between flex-grow gap-4 text-left">
        <div>
          {/* Title */}
          <Link href={`/competitions/${arena.slug}`}>
            <h3 className="text-[13.5px] font-extrabold text-[var(--text-primary)] font-primary uppercase tracking-tight line-clamp-2 leading-snug hover:text-[#7B1123] transition-colors">
              {arena.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-stone-700 text-[10.5px] leading-relaxed font-secondary mt-2 line-clamp-2">
            {arena.desc}
          </p>
        </div>

        {/* Footer Billing Row */}
        <div className="pt-4 mt-auto border-t border-[var(--border-color)] flex items-center justify-between gap-2">
          <div>
            <span className="text-[8px] text-stone-600 font-primary uppercase block tracking-wider font-semibold">BOARDING FEE</span>
            <span className="text-[#7B1123] font-extrabold text-[13.5px] font-primary mt-0.5 block">₹{arena.registrationFee}</span>
          </div>
          <Link
            href={`/competitions/${arena.slug}`}
            className="bg-gradient-to-r from-[#7B1123] via-[#961E34] to-[#7B1123] hover:from-[#580B17] hover:to-[#7B1123] text-[#F3BA2F] font-primary text-[9px] font-bold px-4.5 py-2.5 rounded-lg tracking-widest uppercase transition-all duration-300 shadow-md shadow-[#7B1123]/25 border border-[#C59B27]/40"
          >
            Register Contestant
          </Link>
        </div>
      </div>

    </div>
  );
}
