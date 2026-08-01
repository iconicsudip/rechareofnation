"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { ApiClient, Blog } from "@/lib/api-client";
import BlogCard from "@/components/BlogCard";

interface BlogsPageContent {
  heading: string;
  description: string;
}

// Mirrors the copy currently seeded in `site_content` (key: blogs_page) so
// the header renders identically before the fetch below resolves — no flash.
const FALLBACK_BLOGS_CONTENT: BlogsPageContent = {
  heading: "Blog",
  description:
    "Curated road trip itineraries, expert driving guides, and premium destination logs across Mewar and Rajasthan.",
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageContent, setPageContent] = useState<BlogsPageContent>(FALLBACK_BLOGS_CONTENT);

  useEffect(() => {
    const fetchBlogs = async () => {
      const [data, taxonomy, blogsPageData] = await Promise.all([
        ApiClient.getBlogs(),
        ApiClient.getTaxonomy('blog_category'),
        ApiClient.getSiteContent<BlogsPageContent>('blogs_page'),
      ]);
      setBlogs(data);
      setCategories(["All", ...taxonomy]);
      if (blogsPageData) setPageContent(blogsPageData);
    };
    fetchBlogs();
  }, []);

  // Filter and search logic
  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] py-16 text-slate-800">
      
      {/* Main Page Layout */}
      <div className="container max-w-7xl mx-auto px-4 flex flex-col gap-12 font-secondary">
        
        {/* HERO GRID SECTION (Only visible when all items are loaded) */}
        {blogs.length >= 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Featured Card (Left, Spans 2 columns) */}
            <Link 
              href={`/blogs/${blogs[0].slug}`}
              className="lg:col-span-2 group cursor-pointer relative rounded-[32px] overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 min-h-[350px] lg:min-h-[450px] flex flex-col justify-end"
            >
              {/* Background Image */}
              <img 
                src={blogs[0].imageUrl} 
                alt={blogs[0].title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-95" />
              
              {/* Content */}
              <div className="relative z-10 p-6 md:p-10 flex flex-col justify-end items-start text-left h-full w-full">
                <span className="text-[9px] font-primary font-bold tracking-widest text-white/75 uppercase">
                  PUBLISHED ON {blogs[0].publishedAt}
                </span>
                <h2 className="text-xl md:text-3xl font-black font-primary uppercase text-white leading-tight mt-2 max-w-2xl group-hover:text-pink-450 transition-colors">
                  {blogs[0].title}
                </h2>
                <span className="mt-4 bg-white/10 border border-white/20 text-white rounded-full px-4 py-1 text-[9px] font-primary font-bold uppercase tracking-wider">
                  {blogs[0].category}
                </span>
              </div>
            </Link>

            {/* Stacked Cards (Right, Spans 1 column) */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              {blogs.slice(1, 3).map((blog) => (
                <Link 
                  key={blog.id}
                  href={`/blogs/${blog.slug}`}
                  className="group cursor-pointer relative rounded-[32px] overflow-hidden border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex-1 min-h-[180px] lg:min-h-[212px] flex flex-col justify-end"
                >
                  {/* Background Image */}
                  <img 
                    src={blog.imageUrl} 
                    alt={blog.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent opacity-95" />
                  
                  {/* Content */}
                  <div className="relative z-10 p-6 flex flex-col justify-end items-start text-left h-full w-full">
                    <span className="bg-white/10 border border-white/20 text-white rounded-full px-3 py-0.5 text-[8px] font-primary font-bold uppercase tracking-wider">
                      {blog.category}
                    </span>
                    <h3 className="text-sm md:text-base font-black font-primary uppercase text-white leading-snug mt-2 group-hover:text-pink-450 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        )}

        {/* LOWER SECTION: Filter Bar & Dynamic Grid */}
        <div className="flex flex-col gap-8 mt-4">
          
          {/* Header */}
          <div className="flex flex-col gap-2 text-left">
            <h1 className="text-3xl md:text-5xl font-black font-primary text-slate-900 tracking-tight uppercase">
              {pageContent.heading}
            </h1>
            <p className="text-slate-550 text-xs md:text-sm max-w-2xl leading-relaxed font-secondary">
              {pageContent.description}
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase transition-all cursor-pointer border ${
                    selectedCategory === category
                      ? "bg-slate-900 border-slate-900 text-white"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:border-pink-500 transition-all font-secondary"
              />
            </div>
          </div>

          {/* Grid of articles */}
          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <BlogCard 
                  key={blog.id}
                  title={blog.title}
                  slug={blog.slug}
                  summary={blog.summary}
                  imageUrl={blog.imageUrl}
                  category={blog.category}
                  publishedAt={blog.publishedAt}
                  bordered={false}
                  aspectRatio="aspect-[4/3]"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-slate-200/80 rounded-[32px]">
              <p className="text-slate-400 text-sm font-secondary">No articles match your search or category selection.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
