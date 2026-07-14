"use client";

import { useState, useEffect } from "react";
import { Calendar, User, Clock, ArrowRight, X, ChevronRight } from "lucide-react";
import { ApiClient, Blog } from "@/lib/api-client";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      const data = await ApiClient.getBlogs();
      setBlogs(data);
    };
    fetchBlogs();
  }, []);

  return (
    <div className="container py-20 md:py-24 flex flex-col gap-10">
      {/* Blog Details Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 bg-[#0B0F19]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full glass-panel relative rounded-2xl border-indigo-500/20 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-widest">{selectedBlog.category}</span>
              <button 
                onClick={() => setSelectedBlog(null)} 
                className="text-gray-400 hover:text-white p-1 hover:bg-[rgba(255,255,255,0.05)] rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-6 text-left">
              <div className="h-60 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)]">
                <img src={selectedBlog.imageUrl} alt={selectedBlog.title} className="w-full h-full object-cover" />
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-extrabold text-white leading-tight font-primary">{selectedBlog.title}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><User size={12} /> By {selectedBlog.author}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {selectedBlog.publishedAt}</span>
                </div>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line font-secondary border-t border-[rgba(255,255,255,0.06)] pt-5">
                {selectedBlog.content}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Updates & Media</span>
        <h1 className="text-4xl md:text-5xl font-black mt-1 font-primary text-white">Blogs & News Hub</h1>
        <p className="text-gray-400 text-sm mt-2">Stay updated with event schedules, announcement updates, and guides from Recharge Nation.</p>
      </div>

      {/* Blogs Grid */}
      {blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.map((blog) => (
            <div 
              key={blog.id} 
              className="glass-panel overflow-hidden flex flex-col justify-between hover:border-cyan-500/20 group"
            >
              <div>
                <div className="h-60 relative overflow-hidden">
                  <img 
                    src={blog.imageUrl} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-gray-900/85 backdrop-blur-sm text-cyan-400 text-xs font-semibold px-3 py-1 rounded">
                    {blog.category}
                  </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col gap-3">
                  <div className="flex items-center gap-4 text-[10px] text-gray-500 font-semibold uppercase">
                    <span className="flex items-center gap-1"><User size={10} /> {blog.author}</span>
                    <span className="flex items-center gap-1"><Calendar size={10} /> {blog.publishedAt}</span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white group-hover:text-cyan-400 transition-colors font-primary line-clamp-2 mt-1">
                    {blog.title}
                  </h3>

                  <p className="text-gray-400 text-xs leading-relaxed font-secondary line-clamp-3">
                    {blog.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-8 pt-0 border-t border-[rgba(255,255,255,0.05)] flex justify-end">
                <button 
                  onClick={() => setSelectedBlog(blog)}
                  className="btn btn-secondary py-2 px-5 text-xs font-bold flex items-center gap-1"
                >
                  Read Full Article <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-panel rounded-2xl border-[rgba(255,255,255,0.06)]">
          <p className="text-gray-400 text-sm">No blogs or announcements available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
