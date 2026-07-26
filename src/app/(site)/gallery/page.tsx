"use client";

import { useState, useEffect } from "react";
import { Play, Eye, X, Image as ImageIcon, Video, ChevronDown, ChevronUp } from "lucide-react";

interface GalleryItem {
  id: string;
  category: "Abhyudaya" | "Miss Traditional" | "Expos" | "Competitions" | "Conferences";
  description: string;
  imageUrl: string;
  type: "photo" | "video";
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    category: "Abhyudaya",
    description: "Stellar live concert crowd at Abhyudaya 2025 opening night.",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-2",
    category: "Miss Traditional",
    description: "The stunning ethnic couture runway designs during Miss Traditional India.",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-3",
    category: "Conferences",
    description: "Full house panel briefing on critical internet security infrastructure at INDO-SEC.",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-4",
    category: "Expos",
    description: "Exhibitors demoing automated smart city transit pods at Mumbai Convention Hall.",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-5",
    category: "Competitions",
    description: "Nataraja Dance fusion classical performers on the Sir Shankarlal stage.",
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-6",
    category: "Abhyudaya",
    description: "Crowd dancing under heavy lasers at Nucleya Bass EDM Day 2.",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    type: "video"
  },
  {
    id: "gal-7",
    category: "Abhyudaya",
    description: "Euphoric fans cheering at the open-air festival main stage.",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-8",
    category: "Miss Traditional",
    description: "Detailed closeup of heritage brocade silk textures on the runway.",
    imageUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-9",
    category: "Expos",
    description: "Interactive brand display pavilion at the National Trade Expo.",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-10",
    category: "Competitions",
    description: "Core innovation teams collaborating in the final hours of the hackathon.",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-11",
    category: "Conferences",
    description: "Keynote presentation discussing global clean tech infrastructure.",
    imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-12",
    category: "Abhyudaya",
    description: "Sunset acoustic session overlooking the main arena crowd.",
    imageUrl: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-13",
    category: "Miss Traditional",
    description: "Traditional bridal collection showcase in handloom silk.",
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-14",
    category: "Expos",
    description: "Demonstrating augmented reality design tools at the tech hub.",
    imageUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-15",
    category: "Competitions",
    description: "Classical instrumentalist delivering a solo performance.",
    imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-16",
    category: "Conferences",
    description: "Interactive Q&A session with a panel of clean energy delegates.",
    imageUrl: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-17",
    category: "Abhyudaya",
    description: "Live vocal performance under dramatic stadium stage lasers.",
    imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80",
    type: "video"
  },
  {
    id: "gal-18",
    category: "Miss Traditional",
    description: "Folk embroidery collection displaying authentic regional textiles.",
    imageUrl: "https://images.unsplash.com/photo-1583391265517-35bbdad01209?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-19",
    category: "Expos",
    description: "Electric transit concept pods display at the future mobility arena.",
    imageUrl: "https://images.unsplash.com/photo-1558441719-ff34b0524a24?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-20",
    category: "Competitions",
    description: "Awarding ceremony for the national handloom championship.",
    imageUrl: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-21",
    category: "Conferences",
    description: "Active business networking session inside the convention hall.",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-22",
    category: "Abhyudaya",
    description: "Grand finale confetti shower across the full concert field.",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-23",
    category: "Miss Traditional",
    description: "Classic hand-block printing showcase during runway design review.",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  },
  {
    id: "gal-24",
    category: "Competitions",
    description: "Technical innovators hacking custom smart city software prototypes.",
    imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    type: "photo"
  }
];

const CATEGORIES = ["All", "Abhyudaya", "Miss Traditional", "Expos", "Competitions", "Conferences"] as const;

type CategoryFilter = typeof CATEGORIES[number];

export default function GalleryPage() {
  const [selectedFilter, setSelectedFilter] = useState<CategoryFilter>("All");
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Reset showAll when filter changes
  useEffect(() => {
    setShowAll(false);
  }, [selectedFilter]);

  const filteredItems = selectedFilter === "All" 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.category === selectedFilter);

  // Limit items to first 16 (4 columns * 4 rows) unless showAll is active
  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, 16);

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] py-16 relative overflow-hidden bg-[radial-gradient(#e2e8f0_1.2px,transparent_1.2px)] [background-size:24px_24px]">
      
      {/* Lightbox Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-[#070b19]/95 backdrop-blur-md flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedMedia(null)} 
            className="absolute top-6 right-6 text-slate-400 hover:text-white p-2.5 bg-slate-900/60 rounded-full border border-slate-800 transition-all hover:scale-105 cursor-pointer"
          >
            <X size={20} />
          </button>
          
          <div className="max-w-4xl w-full flex flex-col gap-4 text-center">
            {selectedMedia.type === "video" ? (
              // Simulated Player
              <div className="h-[250px] sm:h-[450px] relative rounded-3xl overflow-hidden border border-slate-800 bg-black">
                <img 
                  src={selectedMedia.imageUrl} 
                  alt={selectedMedia.description} 
                  className="w-full h-full object-cover opacity-60 filter blur-sm scale-105"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-pink-500 text-white flex items-center justify-center text-xl shadow-lg shadow-pink-550/20 animate-pulse">
                    ▶
                  </div>
                  <span className="text-[10px] text-pink-500 font-bold uppercase tracking-widest mt-2 font-primary">
                    STREAMING LIVE HIGHLIGHTS
                  </span>
                  <p className="text-slate-400 text-xs px-6 font-secondary">
                    Streaming simulator active. Live CDN link configuration required.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-[250px] sm:h-[450px] relative rounded-3xl overflow-hidden border border-slate-800">
                <img 
                  src={selectedMedia.imageUrl} 
                  alt={selectedMedia.description} 
                  className="w-full h-full object-contain bg-slate-950/40"
                />
              </div>
            )}
            
            <div className="mt-2">
              <span className="text-[10px] text-pink-500 uppercase tracking-widest font-black font-primary">
                {selectedMedia.category}
              </span>
              <h4 className="text-base md:text-lg font-black text-white font-primary mt-1">
                {selectedMedia.description}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Layout */}
      <div className="container max-w-7xl mx-auto px-4 flex flex-col gap-12 text-center">
        
        {/* Header */}
        <div className="flex flex-col gap-3 max-w-2xl mx-auto">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-pink-500 font-primary">
            Moments Captured
          </span>
          <h1 className="text-3xl md:text-5xl font-black font-primary text-slate-900 tracking-tight">
            Experience Highlights
          </h1>
          <p className="text-slate-550 text-xs md:text-sm leading-relaxed font-secondary">
            Witness spectacular frames from our biggest past editions. Concert arenas, traditional runways, and dense technology presentations.
          </p>
        </div>

        {/* Categories / Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedFilter(category)}
              className={`px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase transition-all cursor-pointer border ${
                selectedFilter === category
                  ? "border-pink-500 text-pink-600 bg-pink-50/50"
                  : "border-slate-200 text-slate-500 bg-white hover:bg-slate-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Media Grid - Configured to 4 columns (4x4 layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
          {visibleItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedMedia(item)}
              className="group cursor-pointer relative h-64 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200"
            >
              {/* Image */}
              <img 
                src={item.imageUrl} 
                alt={item.description} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Bottom Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 transition-opacity" />

              {/* Hover indicator icon */}
              <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm p-2 rounded-lg text-white border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {item.type === "video" ? <Play size={14} fill="currentColor" /> : <Eye size={14} />}
              </div>

              {/* Tag and Description Overlay */}
              <div className="absolute bottom-5 left-5 right-5 text-left flex flex-col gap-2 z-10">
                <span className="bg-rose-950/90 text-rose-400 border border-rose-900/30 px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-black w-fit font-primary">
                  {item.category}
                </span>
                
                <h4 className="text-white text-xs md:text-sm font-bold font-primary leading-snug drop-shadow-sm group-hover:text-pink-250 transition-colors">
                  {item.description}
                </h4>
              </div>
            </div>
          ))}
        </div>

        {/* View All / Show Less Toggle Button */}
        {filteredItems.length > 16 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 border border-pink-500 text-[#FF0055] hover:bg-pink-50/50 active:scale-[0.98] transition-all font-primary font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full cursor-pointer"
            >
              {showAll ? (
                <>
                  Show Less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  View All <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
