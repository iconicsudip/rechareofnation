"use client";

import Link from "next/link";
import { MapPin, Trophy } from "lucide-react";

export interface CompetitionCardProps {
  id: string;
  name: string;
  city: string;
  prizePool: string;
  registrationFee: number;
  bannerUrl: string;
  desc: string;
}

export default function CompetitionCard(arena: CompetitionCardProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.012)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.035)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col group relative h-full justify-between">
      
      {/* Image Section */}
      <div className="h-56 relative overflow-hidden bg-slate-100 shrink-0">
        <img 
          src={arena.bannerUrl} 
          alt={arena.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none"></div>
        
        {/* Prize Pool Badge Overlay */}
        <span className="absolute top-4 left-4 bg-indigo-600 text-white font-mono text-[8px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-md shadow-indigo-600/10 flex items-center gap-1">
          <Trophy size={10} className="shrink-0" /> PRIZE POOL: ₹{arena.prizePool}
        </span>

        {/* Audition Spot Badge Overlay */}
        <div className="absolute bottom-3.5 left-3.5 bg-slate-950/70 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[8px] text-white font-bold font-mono tracking-wider uppercase z-10">
          📍 {arena.city} AUDITION SPOT
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col justify-between flex-grow gap-4 text-left">
        <div>
          {/* Title */}
          <Link href="/competitions">
            <h3 className="text-[13.5px] font-extrabold text-slate-800 font-primary uppercase tracking-tight line-clamp-2 leading-snug hover:text-pink-500 transition-colors">
              {arena.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-slate-500 text-[10.5px] leading-relaxed font-secondary mt-2 line-clamp-2">
            {arena.desc}
          </p>
        </div>

        {/* Footer Billing Row */}
        <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[8px] text-slate-400 font-mono uppercase block tracking-wider">BOARDING FEE</span>
            <span className="text-slate-800 font-extrabold text-[13.5px] font-primary mt-0.5 block">₹{arena.registrationFee}</span>
          </div>
          <Link 
            href="/competitions" 
            className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-mono text-[9px] font-bold px-4.5 py-2.5 rounded-lg tracking-widest uppercase transition-all duration-300 shadow-md shadow-indigo-500/10"
          >
            Register Contestant
          </Link>
        </div>
      </div>

    </div>
  );
}
