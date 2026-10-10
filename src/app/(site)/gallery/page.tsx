"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Play, Eye, X, ChevronLeft, ChevronRight,
  Sparkles, Camera, Film, Layers, ArrowRight
} from "lucide-react";
import { ApiClient, GalleryItem } from "@/lib/api-client";

interface GalleryPageContent {
  eyebrow: string;
  heading: string;
  description: string;
}

function getGalleryEmbedUrl(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const ytMatch = clean.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  }
  const vimeoMatch = clean.match(
    /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/
  );
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }
  return null;
}

const ITEMS_PER_PAGE = 12;

function getPaginationRange(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [selectedMediaType, setSelectedMediaType] = useState<"all" | "photo" | "video">("all");
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Lightbox Modal
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageContent, setPageContent] = useState<GalleryPageContent>({ eyebrow: "", heading: "", description: "" });

  const gridTopRef = useRef<HTMLDivElement>(null);

  // Initial Taxonomies and Page Copy
  useEffect(() => {
    let cancelled = false;
    const fetchMetadata = async () => {
      const [taxonomy, galleryPageData] = await Promise.all([
        ApiClient.getTaxonomy("gallery_category"),
        ApiClient.getSiteContent<GalleryPageContent>("gallery_page"),
      ]);
      if (!cancelled) {
        setCategories(["All", ...taxonomy]);
        if (galleryPageData) setPageContent(galleryPageData);
      }
    };
    fetchMetadata();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch paginated gallery items whenever filter, type, or page changes
  const loadPageItems = useCallback(async (page: number, cat: string, type: "all" | "photo" | "video") => {
    setIsLoading(true);
    try {
      const data = await ApiClient.getPaginatedGalleryItems(page, ITEMS_PER_PAGE, cat, type);
      setGalleryItems(data.items);
      setTotalItems(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to load paginated gallery items:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPageItems(currentPage, selectedFilter, selectedMediaType);
  }, [currentPage, selectedFilter, selectedMediaType, loadPageItems]);

  // Handle Filter Change (Resets to page 1)
  const handleCategorySelect = (cat: string) => {
    if (cat === selectedFilter) return;
    setSelectedFilter(cat);
    setCurrentPage(1);
    setLightboxIndex(null);
  };

  const handleMediaTypeSelect = (type: "all" | "photo" | "video") => {
    if (type === selectedMediaType) return;
    setSelectedMediaType(type);
    setCurrentPage(1);
    setLightboxIndex(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    setLightboxIndex(null);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryItems.length - 1));
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null && prev < galleryItems.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, galleryItems.length]);

  const activeLightboxItem = lightboxIndex !== null ? galleryItems[lightboxIndex] : null;

  return (
    <div className="w-full min-h-screen py-16 md:py-24 relative overflow-hidden bg-[radial-gradient(rgba(201,162,39,0.08)_1.2px,transparent_1.2px)] [background-size:24px_24px]">

      {/* Lightbox Modal */}
      {activeLightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Top Bar with Counter and Close Button */}
          <div
            className="fixed top-5 left-6 right-6 flex items-center justify-between z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full font-primary">
                {activeLightboxItem.event}
              </span>
              <span className="text-xs text-stone-400 font-mono hidden sm:inline">
                {String((lightboxIndex ?? 0) + 1).padStart(2, "0")} / {String(galleryItems.length).padStart(2, "0")}
              </span>
            </div>

            <button
              onClick={() => setLightboxIndex(null)}
              className="text-stone-300 hover:text-white p-2.5 bg-white/10 hover:bg-white/20 rounded-full border border-white/15 transition-all cursor-pointer outline-none focus:outline-none"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Controls */}
          {galleryItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryItems.length - 1));
                }}
                className="fixed left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/90 text-stone-300 hover:text-amber-400 rounded-full border border-white/15 transition-all cursor-pointer z-20 outline-none focus:outline-none"
                title="Previous (Left Arrow)"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev !== null && prev < galleryItems.length - 1 ? prev + 1 : 0));
                }}
                className="fixed right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/90 text-stone-300 hover:text-amber-400 rounded-full border border-white/15 transition-all cursor-pointer z-20 outline-none focus:outline-none"
                title="Next (Right Arrow)"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Main Media Preview Box */}
          <div
            className="max-w-5xl w-full flex flex-col gap-4 text-center my-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {activeLightboxItem.type === "video" ? (
              <div className="w-full aspect-video max-h-[75vh] relative rounded-3xl overflow-hidden border border-white/15 bg-black flex items-center justify-center shadow-2xl">
                {(() => {
                  const embed = getGalleryEmbedUrl(activeLightboxItem.url);
                  return embed ? (
                    <iframe
                      src={embed || undefined}
                      title={activeLightboxItem.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={activeLightboxItem.url || undefined}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  );
                })()}
              </div>
            ) : (
              <div className="w-full max-h-[75vh] relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl flex items-center justify-center bg-black/60">
                <img loading="lazy" decoding="async"
                  src={activeLightboxItem.url || undefined}
                  alt={activeLightboxItem.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/logo.png";
                  }}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />
              </div>
            )}

            <div className="flex flex-col items-center gap-1.5 px-4">
              <h3 className="text-base sm:text-xl font-black text-white font-primary uppercase tracking-tight">
                {activeLightboxItem.title}
              </h3>
              <p className="text-xs text-stone-400 font-secondary">
                Official Festival Archive • {activeLightboxItem.event}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="container max-w-[1520px] mx-auto px-4 sm:px-6 flex flex-col gap-10 text-center">

        {/* Header Section */}
        <div className="flex flex-col items-center gap-3 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7B1123]/10 border border-[#C59B27]/40 text-[#7B1123] text-[10px] font-bold tracking-[0.2em] uppercase font-primary shadow-sm">
            <Sparkles size={11} className="text-[#C59B27]" />
            {pageContent.eyebrow}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-primary text-[var(--text-primary)] tracking-tight uppercase">
            {pageContent.heading}
          </h1>
          <p className="text-[var(--text-secondary)] text-xs sm:text-sm md:text-base leading-relaxed font-secondary max-w-2xl font-medium">
            {pageContent.description}
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div ref={gridTopRef} className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-b border-[var(--border-color)] pb-6">

          {/* Categories Pill List */}
          <div className="flex flex-nowrap sm:flex-wrap items-center justify-start gap-1.5 sm:gap-2 overflow-x-auto sm:overflow-x-visible pb-1 sm:pb-0 no-scrollbar max-w-full w-full">
            {categories.map((category) => {
              const isSelected = selectedFilter === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={`shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer outline-none focus:outline-none ${
                    isSelected
                      ? "text-[#F3BA2F] bg-gradient-to-r from-[#7B1123] to-[#961E34] border border-[#C59B27]/50 shadow-[0_0_12px_rgba(123,17,35,0.25)]"
                      : "text-stone-700 hover:text-[#7B1123] bg-stone-100 hover:bg-stone-200/70 border border-stone-200"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Media Type Toggle Pills */}
          <div className="flex items-center bg-stone-100 p-1 rounded-full border border-stone-200 shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => handleMediaTypeSelect("all")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedMediaType === "all"
                  ? "bg-gradient-to-r from-[#7B1123] to-[#961E34] text-[#F3BA2F] border border-[#C59B27]/40 font-black shadow-sm"
                  : "text-stone-600 hover:text-[#7B1123] font-bold"
              }`}
            >
              <Layers size={11} />
              <span>All</span>
            </button>
            <button
              type="button"
              onClick={() => handleMediaTypeSelect("photo")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedMediaType === "photo"
                  ? "bg-gradient-to-r from-[#7B1123] to-[#961E34] text-[#F3BA2F] border border-[#C59B27]/40 font-black shadow-sm"
                  : "text-stone-600 hover:text-[#7B1123] font-bold"
              }`}
            >
              <Camera size={11} />
              <span>Photos</span>
            </button>
            <button
              type="button"
              onClick={() => handleMediaTypeSelect("video")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedMediaType === "video"
                  ? "bg-gradient-to-r from-[#7B1123] to-[#961E34] text-[#F3BA2F] border border-[#C59B27]/40 font-black shadow-sm"
                  : "text-stone-600 hover:text-[#7B1123] font-bold"
              }`}
            >
              <Film size={11} />
              <span>Videos</span>
            </button>
          </div>

        </div>

        {/* Media Grid - Configured to Clean 12 Items Page (3 cols on tablet, 4 on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [...Array(ITEMS_PER_PAGE)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-3xl animate-pulse border border-white/[0.06] bg-white/[0.03]"
              />
            ))
          ) : galleryItems.length === 0 ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-md border border-amber-500/20 rounded-3xl p-8 shadow-sm">
              <span className="text-amber-700 font-primary text-sm font-bold uppercase tracking-wider">
                No Visual Highlights Found
              </span>
              <p className="text-xs text-stone-600 font-secondary max-w-sm">
                There are currently no media assets matching the selected category or format.
              </p>
            </div>
          ) : (
            galleryItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setLightboxIndex(idx)}
                className="group cursor-pointer relative aspect-[4/3] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(180,130,30,0.08)] hover:shadow-[0_16px_40px_rgba(245,158,11,0.15)] border border-amber-500/20 hover:border-amber-500/40 bg-white transition-all duration-500"
              >
                {/* Image / Thumbnail */}
                <img
                  src={item.thumbnailUrl || item.url || undefined}
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/logo.png";
                  }}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                {/* Top Badge: Type Indicator */}
                <div className="absolute top-3.5 right-3.5 z-10">
                  {item.type === "video" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-[#170D08] font-black text-[9px] uppercase tracking-wider shadow-lg shadow-amber-500/30">
                      <Play size={10} fill="currentColor" />
                      <span>Video</span>
                    </span>
                  ) : (
                    <span className="p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-stone-300 group-hover:text-amber-400 transition-colors inline-flex items-center justify-center">
                      <Eye size={12} />
                    </span>
                  )}
                </div>

                {/* Bottom Information */}
                <div className="absolute bottom-4 left-4 right-4 text-left flex flex-col gap-1.5 z-10">
                  <span className="bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[8.5px] uppercase tracking-widest font-black w-fit font-primary">
                    {item.event}
                  </span>

                  <h4 className="text-white text-xs sm:text-sm font-bold font-primary leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Section */}
        {!isLoading && totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--border-color)]">

            {/* Range Counter */}
            <span className="text-xs text-stone-600 font-secondary font-medium">
              Showing{" "}
              <strong className="text-stone-900 font-mono font-bold">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </strong>{" "}
              -{" "}
              <strong className="text-stone-900 font-mono font-bold">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
              </strong>{" "}
              of <strong className="text-[#7B1123] font-mono font-bold">{totalItems}</strong> Moments
            </span>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    currentPage <= 1
                      ? "opacity-30 cursor-not-allowed text-stone-400 border border-transparent"
                      : "text-stone-700 hover:text-[#7B1123] bg-stone-100 hover:bg-stone-200 border border-stone-200"
                  }`}
                >
                  <ChevronLeft size={13} />
                  <span>Prev</span>
                </button>

                {/* Page Number Buttons / Ellipses */}
                {getPaginationRange(currentPage, totalPages).map((item, idx) => {
                  if (item === "...") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-7 h-7 flex items-center justify-center text-xs text-stone-500 font-bold select-none"
                      >
                        …
                      </span>
                    );
                  }
                  const pageNum = Number(item);
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isActive
                          ? "bg-gradient-to-r from-[#7B1123] to-[#961E34] text-[#F3BA2F] border border-[#C59B27]/40 font-black shadow-md"
                          : "text-stone-700 hover:text-[#7B1123] bg-stone-100 hover:bg-stone-200 border border-stone-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    currentPage >= totalPages
                      ? "opacity-30 cursor-not-allowed text-stone-400 border border-transparent"
                      : "text-stone-700 hover:text-[#7B1123] bg-stone-100 hover:bg-stone-200 border border-stone-200"
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
