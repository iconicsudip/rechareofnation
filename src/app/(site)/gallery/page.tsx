"use client";

import { useState, useEffect } from "react";
import { Play, Image, Video, Film, Eye, X } from "lucide-react";
import { ApiClient, GalleryItem } from "@/lib/api-client";

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filterType, setFilterType] = useState<"all" | "photo" | "video">("all");
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      const data = await ApiClient.getGalleryItems();
      setItems(data);
    };
    fetchGallery();
  }, []);

  const filteredItems = filterType === "all" ? items : items.filter(i => i.type === filterType);

  return (
    <div className="container py-20 md:py-24 flex flex-col gap-10">
      {/* Lightbox Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-[#0B0F19]/95 backdrop-blur-md flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedMedia(null)} 
            className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 bg-[rgba(255,255,255,0.05)] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="max-w-4xl w-full flex flex-col gap-4 text-center">
            {selectedMedia.type === "video" ? (
              // Video simulator (using beautiful banner since we don't have live videos, with an simulated player overlay)
              <div className="h-[250px] sm:h-[450px] relative rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)] bg-black">
                <img 
                  src={selectedMedia.url} 
                  alt={selectedMedia.title} 
                  className="w-full h-full object-cover opacity-60 filter blur-sm scale-105"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-cyan-400 text-black flex items-center justify-center text-xl shadow-neon-cyan animate-pulse">
                    ▶
                  </div>
                  <span className="text-xs text-cyan-400 font-semibold uppercase tracking-widest mt-2">STREAMING LIVE HIGHLIGHTS</span>
                  <p className="text-gray-400 text-xs px-6">Mock media player. Streaming services requires active CDN tokens.</p>
                </div>
              </div>
            ) : (
              <div className="h-[250px] sm:h-[450px] relative rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)]">
                <img 
                  src={selectedMedia.url} 
                  alt={selectedMedia.title} 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            <div>
              <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold block">{selectedMedia.event}</span>
              <h4 className="text-lg font-bold text-white font-primary mt-1">{selectedMedia.title}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Archived Media</span>
          <h1 className="text-4xl md:text-5xl font-black mt-1 font-primary text-white">Recharge Gallery</h1>
          <p className="text-gray-400 text-sm mt-2">Explore snapshots and video recordings from our past expos and cultural events.</p>
        </div>

        {/* Filters */}
        <div className="flex bg-[rgba(255,255,255,0.03)] border border-gray-800 p-1 rounded-lg shrink-0 h-fit self-start md:self-end">
          <button 
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              filterType === "all" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            All Media
          </button>
          <button 
            onClick={() => setFilterType("photo")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              filterType === "photo" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Image size={12} /> Photos
          </button>
          <button 
            onClick={() => setFilterType("video")}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              filterType === "video" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Video size={12} /> Videos
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedMedia(item)}
              className="glass-panel overflow-hidden relative h-64 rounded-2xl group cursor-pointer border-[rgba(255,255,255,0.06)] hover:border-cyan-500/30"
            >
              <img 
                src={item.thumbnailUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent"></div>
              
              {/* Media Icon Overlay */}
              <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm p-2 rounded-lg text-white">
                {item.type === "video" ? <Play size={16} fill="currentColor" className="text-cyan-400" /> : <Image size={16} />}
              </div>

              {/* Text Info */}
              <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-1">
                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">{item.event}</span>
                <h4 className="text-white text-sm font-bold font-primary group-hover:text-cyan-400 transition-colors line-clamp-1">{item.title}</h4>
              </div>

              {/* Hover Eye Overlay */}
              <div className="absolute inset-0 bg-[#0B0F19]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-1.5 text-xs text-white font-bold bg-indigo-600 px-4 py-2 rounded-full shadow-neon-violet">
                  <Eye size={14} /> View Media
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-panel rounded-2xl border-[rgba(255,255,255,0.06)]">
          <p className="text-gray-400 text-sm">No media matches this filter. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
