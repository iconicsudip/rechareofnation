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
    <div className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(74,8,20,0.05),0_12px_32px_rgba(74,8,20,0.07)] hover:border-[#C59B27]/60 hover:shadow-[0_4px_12px_rgba(74,8,20,0.08),0_24px_48px_rgba(74,8,20,0.14)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col h-full group">

      {/* Gold corner flourish */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-amber-400/50 rounded-tl-md z-20 pointer-events-none" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-amber-400/50 rounded-tr-md z-20 pointer-events-none" />

      {/* Image Container — framed with a thin gold hairline inset */}
      <div className="p-2.5 pb-0 shrink-0">
        <div className="h-44 relative overflow-hidden bg-black/20 rounded-xl border border-[var(--border-color)]">
          {evt.bannerUrl ? (
            <img
              src={evt.bannerUrl || undefined}
              alt={evt.name}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/logo.png";
              }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon size={28} className="text-[var(--text-muted)]" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 to-transparent pointer-events-none z-0" />

          {evt.tag && (
            <span className="absolute top-2.5 right-2.5 bg-[#7B1123] text-[#F3BA2F] border border-[#C59B27]/40 font-primary text-[9px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider z-10 shadow-md">
              {evt.tag}
            </span>
          )}

          {/* Location Badge */}
          <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[10px] font-extrabold text-white tracking-widest font-primary uppercase z-10 shadow-md">
            <MapPin size={10} className="text-[#C59B27] shrink-0" />
            <span>{evt.city}</span>
          </div>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-5 flex flex-col justify-between flex-grow gap-4 text-left">
        <div>
          {/* Eyebrow: category label + rating */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-primary font-bold text-[#7B1123] uppercase tracking-[0.12em] flex items-center gap-1.5">
              <span className="text-[#C59B27]">✦</span> {evt.category}
            </span>
            {evt.rating > 0 && (
              <div className="flex items-center gap-1 text-xs font-bold text-[#997316] shrink-0">
                <Star size={12} fill="#C59B27" className="text-[#C59B27]" />
                <span>{evt.rating}</span>
                {evt.reviews > 0 && <span className="font-normal text-stone-500">({evt.reviews})</span>}
              </div>
            )}
          </div>

          {/* Title */}
          <Link href={`/events/${evt.id}`}>
            <h3 className="font-extrabold text-[var(--text-primary)] text-[17px] font-primary tracking-tight mt-2.5 line-clamp-2 leading-snug group-hover:text-[#7B1123] transition-colors">
              {evt.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-stone-700 text-[13px] leading-relaxed font-secondary mt-2 line-clamp-2">
            {evt.desc}
          </p>
        </div>

        {/* Footer Pricing & Button */}
        <div className="pt-4 border-t border-dotted border-[var(--border-color)] flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] text-stone-600 font-primary uppercase block tracking-wider font-semibold">Starting from</span>
            <span className="text-[#7B1123] font-primary font-bold text-xl mt-0.5 block">{evt.price > 0 ? `₹${evt.price}` : "Free"}</span>
          </div>
          <Link
            href={`/events/${evt.id}`}
            className="bg-[#7B1123] hover:bg-[#580B17] text-[#F3BA2F] border border-[#C59B27]/50 font-primary text-[11px] font-bold px-5 py-3 rounded-lg tracking-widest uppercase transition-all duration-300 flex items-center gap-1.5 shadow-sm"
          >
            Book
            <ArrowUpRight size={11} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
