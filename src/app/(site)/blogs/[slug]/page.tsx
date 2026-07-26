"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Calendar, User, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { ApiClient, Blog } from "@/lib/api-client";
import BlogCard from "@/components/BlogCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogData = async () => {
      const data = await ApiClient.getBlogs();
      setAllBlogs(data);
      const found = data.find(b => b.slug === slug || b.id === slug);
      if (found) {
        setBlog(found);
      }
      setIsLoading(false);
    };
    fetchBlogData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] py-20 text-center text-slate-550 text-sm font-secondary">
        Loading Article Details...
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] py-20 text-center flex flex-col items-center gap-4 font-secondary">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-xl font-bold text-slate-900 font-primary">Article Not Found</h3>
        <p className="text-slate-500 text-sm">The blog post you are looking for does not exist or has been removed.</p>
        <Link href="/blogs" className="bg-slate-900 hover:bg-slate-800 text-white font-primary font-bold text-xs uppercase px-6 py-3 rounded-full transition-colors">
          Back to Blogs Listing
        </Link>
      </div>
    );
  }

  // Filter recommendations & popular lists
  const similarBlogs = allBlogs.filter(b => b.id !== blog.id).slice(0, 3);
  const popularBlogs = allBlogs.filter(b => b.id !== blog.id).slice(3, 5);

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] py-12 text-slate-850 font-secondary text-left">
      <div className="container max-w-7xl mx-auto px-4 flex flex-col">
        
        {/* Breadcrumb navigation */}
        <div className="text-slate-400 text-xs font-primary mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-slate-600">Home</Link>
          <span>/</span>
          <Link href="/blogs" className="hover:text-slate-600">Blogs</Link>
          <span>/</span>
          <span className="text-slate-600 font-semibold truncate">{blog.title}</span>
        </div>

        {/* Large Rounded Cover Image Banner with Text Overlay */}
        <div className="relative rounded-[32px] overflow-hidden shadow-sm border border-slate-200/80 aspect-[16/9] md:aspect-[21/9] bg-[#070b19]">
          <img 
            src={blog.imageUrl} 
            alt={blog.title} 
            className="w-full h-full object-cover opacity-75"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full text-left">
            <h1 className="text-xl md:text-3xl lg:text-4xl font-black font-primary text-white uppercase tracking-tight leading-tight max-w-4xl">
              {blog.title}
            </h1>
          </div>
        </div>

        {/* Metadata Details Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-slate-200/60 mt-2 font-primary text-xs">
          
          {/* Date info */}
          <div className="flex flex-col text-left font-primary">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] leading-none">Published On</span>
            <span className="font-bold text-slate-700 text-[11px] mt-1.5">{blog.publishedAt}</span>
          </div>

          {/* Category & read time */}
          <div className="flex items-center gap-3">
            <span className="bg-emerald-50 text-emerald-800 px-3.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
              {blog.category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-bold flex items-center gap-1">
              <Clock size={12} className="text-slate-450" /> {blog.readTime || "2 min read"}
            </span>
          </div>

          {/* Share links */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase font-bold text-[9px] tracking-wider mr-1">Share:</span>
            <button className="px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 hover:text-pink-500 hover:border-pink-200 transition-colors bg-white font-bold tracking-wider text-[9px] cursor-pointer">
              FB
            </button>
            <button className="px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 hover:text-pink-500 hover:border-pink-200 transition-colors bg-white font-bold tracking-wider text-[9px] cursor-pointer">
              TW
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }}
              className="px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 hover:text-pink-500 hover:border-pink-200 transition-colors bg-white font-bold tracking-wider text-[9px] cursor-pointer"
            >
              COPY
            </button>
          </div>

        </div>

        {/* Dynamic Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-10">
          
          {/* Left Column: Content */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Introductory Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl md:text-2xl font-black font-primary text-slate-900 uppercase tracking-tight leading-snug">
                {blog.subheading || "WHAT ARE THE KEY HIGHLIGHTS?"}
              </h2>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line font-secondary">
                {blog.content}
              </p>
            </div>

            {/* Bullets represented as subsections */}
            {blog.bullets && blog.bullets.length > 0 && (
              <div className="flex flex-col gap-6 pt-2">
                {blog.bullets.map((bullet, idx) => {
                  const colonIndex = bullet.indexOf(":");
                  const title = colonIndex !== -1 ? bullet.substring(0, colonIndex) : "";
                  const desc = colonIndex !== -1 ? bullet.substring(colonIndex + 1) : bullet;
                  return (
                    <div key={idx} className="flex flex-col gap-2">
                      <h3 className="text-base md:text-lg font-black font-primary text-slate-800 uppercase tracking-tight">
                        {idx + 1}. {title || `Section ${idx + 1}`}
                      </h3>
                      <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-secondary">
                        {desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inline Article Secondary Image */}
            <div className="rounded-[24px] overflow-hidden border border-slate-200/80 aspect-[16/9] w-full bg-slate-50 mt-4 shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80" 
                alt="Secondary article scene" 
                className="w-full h-full object-cover" 
              />
            </div>


          </div>

          {/* Right Column: Side panels */}
          <div className="lg:col-span-1 flex flex-col gap-8">
            
            <h3 className="text-base font-black font-primary text-slate-900 uppercase tracking-tight border-b border-slate-200/60 pb-3">
              Popular Post
            </h3>
            
            <div className="flex flex-col gap-6">
              {popularBlogs.map((popBlog) => (
                <Link 
                  key={popBlog.id}
                  href={`/blogs/${popBlog.slug}`}
                  className="group flex gap-4 items-start cursor-pointer text-left"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200/85 bg-slate-50 shadow-sm">
                    <img 
                      src={popBlog.imageUrl} 
                      alt={popBlog.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[8px] font-bold text-pink-500 uppercase tracking-wider font-primary">
                      {popBlog.category}
                    </span>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight line-clamp-2 leading-snug group-hover:text-pink-500 transition-colors">
                      {popBlog.title}
                    </h4>
                    <span className="text-[9px] text-slate-400 font-primary mt-0.5">
                      {popBlog.publishedAt}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

          </div>

        </div>

        {/* Similar Articles Grid */}
        <div className="border-t border-slate-200/65 pt-16 mt-16 flex flex-col gap-8">
          
          <h3 className="text-xl md:text-2xl font-black font-primary text-slate-900 uppercase tracking-tight text-left">
            Similar articles for you
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarBlogs.map((simBlog) => (
              <BlogCard 
                key={simBlog.id}
                title={simBlog.title}
                slug={simBlog.slug}
                summary={simBlog.summary}
                imageUrl={simBlog.imageUrl}
                category={simBlog.category}
                publishedAt={simBlog.publishedAt}
                bordered={false}
                aspectRatio="aspect-[4/3]"
              />
            ))}
          </div>

        </div>


      </div>
    </div>
  );
}
