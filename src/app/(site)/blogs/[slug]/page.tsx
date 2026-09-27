"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Clock, ImageIcon, AlertCircle, Share2 } from "lucide-react";
import { ApiClient, Blog } from "@/lib/api-client";
import BlogCard from "@/components/BlogCard";
import RichTextContent from "@/components/RichTextContent";

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
      <div className="w-full min-h-screen py-20 text-center text-[var(--text-secondary)] text-sm font-secondary">
        Loading Article Details...
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="w-full min-h-screen py-20 text-center flex flex-col items-center gap-4 font-secondary">
        <AlertCircle size={36} className="text-amber-500/70" />
        <h3 className="text-xl font-bold text-[var(--text-primary)] font-primary">Article Not Found</h3>
        <p className="text-[var(--text-secondary)] text-sm">The blog post you are looking for does not exist or has been removed.</p>
        <Link href="/blogs" className="bg-[var(--bg-panel)] hover:bg-amber-500 hover:text-[#170D08] text-[var(--text-primary)] font-primary font-bold text-xs uppercase px-6 py-3 rounded-full transition-colors">
          Back to Blogs Listing
        </Link>
      </div>
    );
  }

  // Filter recommendations & popular lists
  const similarBlogs = allBlogs.filter(b => b.id !== blog.id).slice(0, 3);
  const popularBlogs = allBlogs.filter(b => b.id !== blog.id).slice(3, 5);

  return (
    <div className="w-full min-h-screen py-20 md:py-24 text-[var(--text-primary)] font-secondary text-left">
      <div className="container mx-auto px-4 flex flex-col">

        {/* Breadcrumb navigation */}
        <div className="text-[var(--text-muted)] text-xs font-primary mb-6 flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-amber-400">Home</Link>
          <span>/</span>
          <Link href="/blogs" className="hover:text-amber-400">Blogs</Link>
          <span>/</span>
          <span className="text-[var(--text-secondary)] font-semibold truncate">{blog.title}</span>
        </div>

        {/* Large Rounded Cover Image Banner with Text Overlay */}
        <div className="relative rounded-[32px] overflow-hidden shadow-sm border border-[var(--border-color)] aspect-[16/9] md:aspect-[21/9] bg-black/30">
          {blog.imageUrl ? (
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-full object-cover opacity-75"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><ImageIcon size={36} className="text-[var(--text-muted)]" /></div>
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full text-left">
            <h1 className="text-xl md:text-3xl lg:text-4xl font-black font-primary text-[var(--text-primary)] uppercase tracking-tight leading-tight max-w-4xl">
              {blog.title}
            </h1>
          </div>
        </div>

        {/* Metadata Details Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-[var(--border-color)] mt-2 font-primary text-xs">

          {/* Date info */}
          <div className="flex flex-col text-left font-primary">
            <span className="text-[var(--text-muted)] font-bold uppercase tracking-wider text-[9px] leading-none">Published On</span>
            <span className="font-bold text-[var(--text-secondary)] text-[11px] mt-1.5">{blog.publishedAt}</span>
          </div>

          {/* Category & read time */}
          <div className="flex items-center gap-3">
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
              {blog.category}
            </span>
            <span className="text-[var(--border-color)]">•</span>
            <span className="text-[var(--text-secondary)] font-bold flex items-center gap-1">
              <Clock size={12} className="text-[var(--text-muted)]" /> {blog.readTime || "2 min read"}
            </span>
          </div>

          {/* Share links */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)] uppercase font-bold text-[9px] tracking-wider mr-1 flex items-center gap-1"><Share2 size={10} /> Share:</span>
            <button className="px-2.5 py-1 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-amber-400 hover:border-amber-500/40 transition-colors bg-white/5 font-bold tracking-wider text-[9px] cursor-pointer">
              FB
            </button>
            <button className="px-2.5 py-1 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-amber-400 hover:border-amber-500/40 transition-colors bg-white/5 font-bold tracking-wider text-[9px] cursor-pointer">
              TW
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }}
              className="px-2.5 py-1 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-amber-400 hover:border-amber-500/40 transition-colors bg-white/5 font-bold tracking-wider text-[9px] cursor-pointer"
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
              <h2 className="text-xl md:text-2xl font-black font-primary text-[var(--text-primary)] uppercase tracking-tight leading-snug">
                {blog.subheading || "WHAT ARE THE KEY HIGHLIGHTS?"}
              </h2>
              {/* blog.content is real HTML from the admin's rich text editor —
                  render it as HTML, not as an escaped text node. */}
              <RichTextContent html={blog.content} className="text-[var(--text-secondary)] text-sm md:text-base font-secondary" />
            </div>

            {/* Key highlight bullets — plain highlight statements, not "title:
                description" pairs, so they render as a straightforward list
                rather than fabricated "Section N" subheadings. */}
            {blog.bullets && blog.bullets.length > 0 && (
              <div className="flex flex-col gap-3 pt-2">
                {blog.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="w-5 h-5 shrink-0 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-[10px] font-black font-primary mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-secondary">{bullet}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Article Secondary Image — reuses this article's real imageUrl
                (previously a fixed stock photo identical on every article).
                Hidden entirely (not a placeholder) when there's no real image,
                since it would just duplicate an already-shown missing-image state. */}
            {blog.imageUrl && (
              <div className="rounded-[24px] overflow-hidden border border-[var(--border-color)] aspect-[16/9] w-full bg-black/20 mt-4 shadow-sm">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}


          </div>

          {/* Right Column: Side panels */}
          <div className="lg:col-span-1 flex flex-col gap-8">

            <h3 className="text-base font-black font-primary text-[var(--text-primary)] uppercase tracking-tight border-b border-[var(--border-color)] pb-3">
              Popular Post
            </h3>

            <div className="flex flex-col gap-6">
              {popularBlogs.map((popBlog) => (
                <Link
                  key={popBlog.id}
                  href={`/blogs/${popBlog.slug}`}
                  className="group flex gap-4 items-start cursor-pointer text-left"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-[var(--border-color)] bg-black/20 shadow-sm flex items-center justify-center">
                    {popBlog.imageUrl ? (
                      <img
                        src={popBlog.imageUrl}
                        alt={popBlog.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <ImageIcon size={18} className="text-[var(--text-muted)]" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[8px] font-bold text-amber-400 uppercase tracking-wider font-primary">
                      {popBlog.category}
                    </span>
                    <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                      {popBlog.title}
                    </h4>
                    <span className="text-[9px] text-[var(--text-muted)] font-primary mt-0.5">
                      {popBlog.publishedAt}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

          </div>

        </div>

        {/* Similar Articles Grid */}
        <div className="border-t border-[var(--border-color)] pt-16 mt-16 flex flex-col gap-8">

          <h3 className="text-xl md:text-2xl font-black font-primary text-[var(--text-primary)] uppercase tracking-tight text-left">
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
