"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Calendar, MapPin, Award, ShieldAlert, ArrowRight } from "lucide-react";
import { ApiClient, Event } from "@/lib/api-client";

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Event[]>([]);

  useEffect(() => {
    const fetchCompetitions = async () => {
      const allEvents = await ApiClient.getEvents();
      // Filter events that have competition characteristics or category names
      const filtered = allEvents.filter(e => 
        e.category.includes("Competitions") || 
        e.registrationFee !== undefined
      );
      setCompetitions(filtered);
    };
    fetchCompetitions();
  }, []);

  return (
    <div className="container py-20 md:py-24 flex flex-col gap-10">
      {/* Header */}
      <div>
        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Battlefield of Talent</span>
        <h1 className="text-4xl md:text-5xl font-black mt-1 font-primary text-white">Live Competitions</h1>
        <p className="text-gray-400 text-sm mt-2">
          Showcase your skills, represent your institution, and compete for cash awards, trophies, and national recognition.
        </p>
      </div>

      {/* Info notice */}
      <div className="glass-panel p-6 rounded-xl border-indigo-500/10 flex items-start gap-4 bg-indigo-500/5">
        <ShieldAlert className="text-indigo-400 shrink-0 mt-0.5" size={20} />
        <div className="flex flex-col gap-1 text-xs text-gray-400">
          <span className="font-bold text-white uppercase text-[10px] tracking-wider">PLEASE NOTE</span>
          <p>
            Competition registration is strictly for active participants. It does NOT generate audience entry tickets. Audience passes must be booked separately on the event specs page.
          </p>
        </div>
      </div>

      {/* Competitions Grid */}
      {competitions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {competitions.map((comp) => (
            <div 
              key={comp.id} 
              className="glass-panel overflow-hidden flex flex-col justify-between hover:border-cyan-500/30 group"
            >
              <div>
                <div className="h-56 relative overflow-hidden">
                  <img 
                    src={comp.bannerUrl} 
                    alt={comp.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded">
                    ₹{comp.registrationFee} Registration Fee
                  </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col gap-4">
                  <h3 className="text-2xl font-extrabold text-white group-hover:text-cyan-400 transition-colors font-primary line-clamp-1">
                    {comp.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><Calendar size={13} /> {comp.date}</span>
                    <span className="flex items-center gap-1.5"><MapPin size={13} /> {comp.city}</span>
                  </div>

                  <p className="text-gray-400 text-xs leading-relaxed font-secondary line-clamp-3 mt-1">
                    {comp.summary}
                  </p>

                  {/* Highlights rules info snippet */}
                  <div className="bg-gray-900/30 rounded-xl p-4 border border-[rgba(255,255,255,0.04)] mt-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold flex items-center gap-1">
                      <Award size={12} className="text-pink-500" /> Key Guidelines
                    </span>
                    <ul className="flex flex-col gap-1.5 mt-2">
                      {comp.rules?.slice(0, 2).map((rule, idx) => (
                        <li key={idx} className="text-[11px] text-gray-500 line-clamp-1 leading-normal">
                          • {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 pt-0 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between gap-4">
                <Link 
                  href={`/events/${comp.slug}`}
                  className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  View Full Details
                </Link>
                
                <Link 
                  href={`/events/${comp.slug}`} // Details page handles launching of the specific wizard directly
                  className="btn btn-primary py-2.5 px-6 text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  Register Now <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-panel rounded-2xl border-[rgba(255,255,255,0.06)]">
          <p className="text-gray-400 text-sm">No live competitions listed at the moment. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
