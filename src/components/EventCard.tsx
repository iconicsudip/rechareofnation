"use client";

import Link from "next/link";
import { Star, MapPin } from "lucide-react";

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
    <div className="bg-white border border-slate-200 rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.012)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.035)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full group">
      
      {/* Image Container */}
      <div className="h-44 relative overflow-hidden bg-slate-100 shrink-0">
        <img 
          src={evt.bannerUrl} 
          alt={evt.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" 
        />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none z-0"></div>
        
        {/* Category & Status Badges */}
        <div className="absolute top-3.5 left-3.5 flex gap-1.5 z-10">
          <span className="bg-pink-600/90 text-white font-mono text-[7.5px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
            {evt.category}
          </span>
          {evt.tag && (
            <span className="bg-amber-500 text-slate-950 font-mono text-[7.5px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
              {evt.tag}
            </span>
          )}
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-3 left-3 bg-slate-950/70 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1.5 text-[8.5px] font-extrabold text-white tracking-widest font-mono uppercase z-10">
          <MapPin size={10} className="text-pink-500 shrink-0" />
          <span>{evt.city}</span>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-5 flex flex-col justify-between flex-grow gap-4 text-left">
        <div>
          {/* Ratings */}
          <div className="flex items-center gap-1 text-[10.5px] font-bold text-amber-500">
            <Star size={11} fill="#f59e0b" className="text-amber-500" />
            <span>{evt.rating}</span>
            <span className="text-slate-400 font-medium">({evt.reviews} reviews)</span>
          </div>

          {/* Title */}
          <Link href={`/events/${evt.id}`}>
            <h3 className="font-extrabold text-slate-800 text-[13.5px] font-primary tracking-tight mt-2.5 uppercase line-clamp-2 leading-snug hover:text-pink-500 transition-colors">
              {evt.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-slate-500 text-[10.5px] leading-relaxed font-secondary mt-2 line-clamp-2">
            {evt.desc}
          </p>
        </div>

        {/* Footer Pricing & Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[8px] text-slate-400 font-mono uppercase block tracking-wider">STARTING FROM</span>
            <span className="text-slate-800 font-extrabold text-[13.5px] font-primary mt-0.5 block">₹{evt.price}</span>
          </div>
          <Link 
            href={`/events/${evt.id}`} 
            className="bg-slate-950 hover:bg-pink-500 text-white font-mono text-[9px] font-bold px-4 py-2.5 rounded-lg tracking-widest uppercase transition-colors duration-300"
          >
            Book Ticket
          </Link>
        </div>
      </div>

    </div>
  );
}
