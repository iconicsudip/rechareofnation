"use client";

import Link from "next/link";
import { Star, MapPin, ImageIcon, ArrowUpRight } from "lucide-react";

export interface EventCardProps {
  id: string;
  name: string;
  category: string;
  tag?: string;
  city: string;
  rating: number;
  reviews: number;
  price: number;
  bannerUrl: string;
  desc: string;
}

export default function EventCard(evt: EventCardProps) {
  return (
    <div className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:border-amber-500/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-500 flex flex-col h-full group">

      {/* Gold corner flourish */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-amber-400/50 rounded-tl-md z-20 pointer-events-none" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-amber-400/50 rounded-tr-md z-20 pointer-events-none" />

      {/* Image Container — framed with a thin gold hairline inset */}
      <div className="p-2.5 pb-0 shrink-0">
        <div className="h-44 relative overflow-hidden bg-black/20 rounded-xl border border-[var(--border-color)]">
          {evt.bannerUrl ? (
            <img
              src={evt.bannerUrl}
              alt={evt.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={28} className="text-[var(--text-muted)]" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-0" />

          {evt.tag && (
            <span className="absolute top-2.5 right-2.5 bg-amber-500 text-[#170D08] font-primary text-[7.5px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider z-10">
              {evt.tag}
            </span>
          )}

          {/* Location Badge */}
          <div className="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[8.5px] font-extrabold text-[var(--text-primary)] tracking-widest font-primary uppercase z-10">
            <MapPin size={10} className="text-amber-400 shrink-0" />
            <span>{evt.city}</span>
          </div>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-5 flex flex-col justify-between flex-grow gap-4 text-left">
        <div>
          {/* Eyebrow: category label + rating */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-primary font-bold text-amber-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
              <span className="text-amber-500/70">✦</span> {evt.category}
            </span>
            <div className="flex items-center gap-1 text-[10.5px] font-bold text-amber-400 shrink-0">
              <Star size={11} fill="#C9A227" className="text-amber-400" />
              <span>{evt.rating}</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/events/${evt.id}`}>
            <h3 className="font-extrabold text-[var(--text-primary)] text-[14px] font-primary tracking-tight mt-2.5 uppercase line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
              {evt.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-[var(--text-secondary)] text-[10.5px] leading-relaxed font-secondary mt-2 line-clamp-2">
            {evt.desc}
          </p>
          <span className="text-[var(--text-muted)] text-[9.5px] font-secondary italic block mt-1">
            ({evt.reviews} reviews)
          </span>
        </div>

        {/* Footer Pricing & Button */}
        <div className="pt-4 border-t border-dotted border-[var(--border-color)] flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[8px] text-[var(--text-muted)] font-primary uppercase block tracking-wider">Starting From</span>
            <span className="text-amber-400 font-primary italic font-semibold text-[17px] mt-0.5 block">₹{evt.price}</span>
          </div>
          <Link
            href={`/events/${evt.id}`}
            className="border border-amber-500/40 hover:bg-amber-500 text-amber-400 hover:text-[#170D08] font-primary text-[9px] font-bold px-4 py-2.5 rounded-lg tracking-widest uppercase transition-all duration-300 flex items-center gap-1.5"
          >
            Book
            <ArrowUpRight size={11} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
