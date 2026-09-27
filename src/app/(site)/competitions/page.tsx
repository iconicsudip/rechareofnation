"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import CompetitionCard from "@/components/CompetitionCard";
import { ApiClient, CompetitionRecord } from "@/lib/api-client";

export default function CompetitionsListingPage() {
  const [competitions, setCompetitions] = useState<CompetitionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    ApiClient.getCompetitions()
      .then(setCompetitions)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-20 md:py-24 font-secondary">
      <div className="container mx-auto px-4 flex flex-col gap-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2.5">
          <span className="inline-flex items-center gap-1.5 mx-auto px-3 py-1 rounded-full text-[10px] font-primary font-extrabold tracking-widest uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Trophy size={11} /> National Arenas
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] font-primary uppercase tracking-tight">
            All Competitions
          </h1>
          <p className="text-[var(--text-secondary)] text-sm md:text-base font-secondary">
            Claim your crown. Register as a participant to win major prize pools.
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-white/[0.03] border border-[var(--border-color)] animate-pulse" />
            ))}
          </div>
        ) : competitions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <Trophy size={36} className="text-amber-500/40" />
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-primary">No competitions yet</h3>
            <p className="text-[var(--text-secondary)] text-sm">Check back soon for upcoming national arenas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((c) => (
              <CompetitionCard
                key={c.id}
                id={c.id}
                slug={c.slug}
                name={c.name}
                city={c.city}
                prizePool={c.prizePool.replace(/^₹/, "")}
                registrationFee={c.registrationFee}
                bannerUrl={c.bannerUrl}
                desc={c.summary || c.description}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
