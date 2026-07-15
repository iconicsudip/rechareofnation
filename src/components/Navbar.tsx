"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Menu, X, User, LogOut, Trophy, Home, Info, Calendar, Image, 
  FileText, Phone, Award, Sparkles, ChevronRight, Zap, Target, 
  BookOpen, Layers, Laptop, Search, Ticket, Compass, ArrowRight
} from "lucide-react";
import { ApiClient } from "@/lib/api-client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Sync auth state
  useEffect(() => {
    const checkUser = () => {
      const currentUser = ApiClient.getCurrentUser();
      setUser(currentUser);
    };

    checkUser();
    
    // Set up a simple interval to poll user login state changes
    const interval = setInterval(checkUser, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    ApiClient.logoutUser();
    setUser(null);
    setIsOpen(false);
    router.push("/");
  };

  // Search Modal States
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Fetch all events on load
  useEffect(() => {
    const fetchEvents = async () => {
      const events = await ApiClient.getEvents();
      setAllEvents(events);
    };
    fetchEvents();
  }, []);

  // Filter events in real-time
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = allEvents.filter(e => 
      e.name.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q)
    );
    setSearchResults(matches.slice(0, 5));
  }, [searchQuery, allEvents]);

  // Escape key close handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSearchModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = [
    { name: "Explore Events", href: "/events" },
    { name: "Mr/Miss Traditional", href: "/competitions" },
    { name: "Sponsors", href: "/sponsors" },
    { name: "Gallery", href: "/gallery" },
    { name: "Blogs", href: "/blogs" }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      {/* Top accent gradient stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-pink-500 via-indigo-500 to-cyan-400"></div>

      <div className="container max-w-[1550px] mx-auto px-4">
        <div className="flex h-16 items-center justify-between relative gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 select-none shrink-0">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-pink-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm shadow-pink-500/10">
                <Ticket size={18} className="shrink-0" />
              </div>
              <div className="flex flex-col text-left leading-none">
                <span className="text-[14px] font-black tracking-tight text-slate-800 font-primary uppercase leading-tight">
                  RECHARGE<span className="text-pink-500">NATION</span>
                </span>
                <span className="text-[7.5px] font-mono font-bold tracking-widest text-slate-400 uppercase mt-0.5 leading-none">
                  Experience India
                </span>
              </div>
            </Link>

          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6 shrink-0">
            <Link
              href="/"
              className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap shrink-0 ${
                pathname === "/" 
                  ? "bg-pink-50 text-pink-600 shadow-[0_2px_8px_rgba(236,72,153,0.08)]" 
                  : "text-slate-600 hover:text-pink-500"
              }`}
            >
              Home
            </Link>

            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[10px] font-black transition-all duration-300 hover:text-pink-500 font-secondary uppercase tracking-wider whitespace-nowrap shrink-0 ${
                    isActive ? "text-pink-500" : "text-slate-600"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 shrink-0">
            {/* Search Icon Trigger */}
            <button 
              onClick={() => setShowSearchModal(true)} 
              className="p-2 text-slate-500 hover:text-pink-500 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0 mr-1.5"
              title="Search Events"
            >
              <Search size={14} className="shrink-0" />
            </button>

            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[9.5px] font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5 uppercase transition-all shadow-[0_2px_8px_rgba(0,0,0,0.015)] whitespace-nowrap shrink-0"
                >
                  <Ticket size={11} className="text-red-500 shrink-0" />
                  <span>My Wallet</span>
                </Link>

                <Link 
                  href="/dashboard" 
                  className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[9.5px] font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5 uppercase transition-all shadow-[0_2px_8px_rgba(0,0,0,0.015)] whitespace-nowrap shrink-0"
                >
                  <Layers size={11} className="text-slate-500 shrink-0" />
                  <span>Dashboard</span>
                </Link>

                <Link 
                  href="/dashboard" 
                  className="bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[9.5px] font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-1.5 uppercase transition-all shadow-[0_4px_12px_rgba(79,70,229,0.12)] whitespace-nowrap shrink-0"
                >
                  <Compass size={11} className="text-white shrink-0" />
                  <span>Scanner</span>
                </Link>

                <div className="flex items-center gap-2 pl-1.5 ml-1.5 border-l border-slate-200">
                  <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-750 text-xs font-bold font-mono">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-450 hover:text-pink-500 transition-colors cursor-pointer shrink-0"
                    title="Logout"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[9.5px] font-extrabold px-4.5 py-2 rounded-xl flex items-center gap-1.5 uppercase transition-all shadow-[0_2px_8px_rgba(0,0,0,0.015)] whitespace-nowrap shrink-0"
                >
                  <span>Login</span>
                </Link>

                <Link 
                  href="/register" 
                  className="bg-pink-500 hover:bg-pink-600 text-white text-[9.5px] font-extrabold px-4.5 py-2 rounded-xl flex items-center gap-1.5 uppercase transition-all shadow-[0_4px_12px_rgba(236,72,153,0.12)] whitespace-nowrap shrink-0"
                >
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button & Search */}
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            <button 
              onClick={() => setShowSearchModal(true)} 
              className="p-2 text-slate-650 hover:text-pink-500 transition-colors cursor-pointer"
              title="Search Events"
            >
              <Search size={16} />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center p-2 text-slate-650 hover:text-slate-900 transition-colors cursor-pointer"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden absolute top-[68px] left-0 w-full bg-white border-b border-slate-200 py-6 px-5 flex flex-col gap-5 shadow-2xl animate-fade-in z-50">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 text-[14px] font-extrabold py-2 border-b border-slate-100 hover:text-pink-500 uppercase tracking-wider ${
                pathname === "/" ? "text-pink-500" : "text-slate-650"
              }`}
            >
              <Home size={16} />
              <span>Home</span>
            </Link>
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 text-[14px] font-extrabold py-2 border-b border-slate-100 hover:text-pink-500 uppercase tracking-wider ${
                    isActive ? "text-pink-500" : "text-slate-650"
                  }`}
                >
                  <Calendar size={16} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 flex-grow py-3 border border-slate-200 rounded-xl text-slate-700 text-center text-xs font-extrabold uppercase"
                >
                  <Ticket size={14} className="text-red-500" />
                  <span>My Wallet</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 flex-grow py-3 border border-slate-200 rounded-xl text-slate-700 text-center text-xs font-extrabold uppercase"
                >
                  <Layers size={14} className="text-slate-500" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#4f46e5] rounded-xl text-white text-center text-xs font-extrabold uppercase shadow-lg shadow-indigo-500/10"
                >
                  <Compass size={14} className="text-white" />
                  <span>Scanner</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full mt-2 py-3 bg-slate-900 rounded-xl text-white text-center text-xs font-extrabold uppercase flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 flex-grow py-3 border border-slate-200 rounded-xl text-slate-700 text-center text-xs font-extrabold uppercase"
                >
                  <span>Login</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 flex-grow py-3 bg-pink-500 rounded-xl text-white text-center text-xs font-extrabold uppercase"
                >
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      {/* Search Modal Overlay */}
      {showSearchModal && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-24 md:pt-32 px-4 transition-all duration-300"
          onClick={() => setShowSearchModal(false)}
        >
          <div 
            className="w-full max-w-xl bg-white border border-slate-200/80 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col transition-all transform scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Input */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
              <Search className="text-slate-400 w-4 h-4 shrink-0" />
              <input 
                type="text" 
                placeholder="Search events by name, city, category..." 
                className="w-full bg-transparent text-sm text-slate-800 outline-none border-none py-1 placeholder-slate-400 font-secondary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button 
                onClick={() => setShowSearchModal(false)}
                className="text-[10px] font-mono font-bold text-slate-400 border border-slate-200 hover:border-slate-300 rounded px-1.5 py-0.5 bg-slate-50 transition-colors uppercase cursor-pointer"
              >
                Esc
              </button>
            </div>

            {/* Results body */}
            <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
              {searchQuery ? (
                searchResults.length > 0 ? (
                  searchResults.map((evt) => (
                    <Link
                      key={evt.id}
                      href={`/events/${evt.slug}`}
                      onClick={() => setShowSearchModal(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-mono font-bold text-pink-500 uppercase tracking-wide">{evt.category}</span>
                        <h4 className="text-[13px] font-extrabold text-slate-800 group-hover:text-pink-500 transition-colors font-primary line-clamp-1">{evt.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{evt.city}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs font-secondary">
                    No matching events found for "{searchQuery}"
                  </div>
                )
              ) : (
                <div className="p-3 flex flex-col gap-2.5">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Trending Searches</span>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { name: "Miss & Mr Traditional India 2026", href: "/competitions" },
                      { name: "Abhyudaya Mega Cultural Fest", href: "/events/recharge-cultural-odyssey-2026" },
                      { name: "Nataraja Classical Dance Clash", href: "/events/national-vibe-rhythm-dance-cup" }
                    ].map((item, idx) => (
                      <Link 
                        key={idx}
                        href={item.href}
                        onClick={() => setShowSearchModal(false)}
                        className="text-xs text-indigo-600 hover:text-pink-500 font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Zap size={11} className="text-amber-500 font-bold" /> {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50/80 border-t border-slate-100 py-2.5 px-4 flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              <span>Type query to search</span>
              <Link 
                href={`/events?q=${searchQuery}`} 
                onClick={() => setShowSearchModal(false)}
                className="text-slate-505 hover:text-pink-500 transition-colors flex items-center gap-0.5"
              >
                View Directory <ArrowRight size={10} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
