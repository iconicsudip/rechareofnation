"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User, LogOut, Trophy, Home, Info, Calendar, Image, FileText, Phone, Award, Sparkles, ChevronRight, Zap, Target, BookOpen, Layers, Laptop } from "lucide-react";
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

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Competitions", href: "/competitions", icon: Trophy },
    { name: "Gallery", href: "/gallery", icon: Image },
    { name: "Sponsors", href: "/sponsors", icon: Award },
    { name: "Blogs", href: "/blogs", icon: FileText },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800/80 bg-[#070b13]/90 backdrop-blur-md">
      <div className="container">
        <div className="flex h-16 items-center justify-between relative">
          
          {/* Logo */}
          <Link href="/" className="flex items-center select-none">
            <span className="text-[19px] font-black tracking-tighter text-white font-primary uppercase">
              RECHARGE NATION
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const hasEventsMega = link.name === "Events";
              const hasCompsMega = link.name === "Competitions";

              return (
                <div key={link.name} className="relative group/nav py-5">
                  <Link
                    href={link.href}
                    className={`text-[12.5px] font-bold transition-all duration-300 hover:text-white relative pb-1.5 group/item font-secondary uppercase tracking-wider ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {link.name}
                    {/* Underline Slide Effect */}
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-white rounded-full transition-all duration-300 group-hover/item:w-3/4 ${
                      isActive ? "w-2/3 bg-white" : ""
                    }`}></span>
                  </Link>

                  {/* Events Mega Menu */}
                  {hasEventsMega && (
                    <div className="absolute top-[48px] left-1/2 -translate-x-1/2 mt-0 w-[580px] bg-[#070b13]/98 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] transition-all duration-300 opacity-0 translate-y-3 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto z-50 grid grid-cols-3 gap-6">
                      
                      {/* Column 1: By Category */}
                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-mono tracking-widest text-gray-500 font-bold uppercase border-b border-gray-850 pb-2">By Category</span>
                        <div className="flex flex-col gap-2">
                          <Link href="/events?search=Cultural" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <Sparkles size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Cultural Programs</span>
                          </Link>
                          <Link href="/events?search=Dance" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <Trophy size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Dance Cup Battles</span>
                          </Link>
                          <Link href="/events?search=Trade" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <Laptop size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Trade & Tech Expos</span>
                          </Link>
                          <Link href="/events?search=Food" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <Zap size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Food Festivals</span>
                          </Link>
                        </div>
                      </div>

                      {/* Column 2: By Location */}
                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-mono tracking-widest text-gray-500 font-bold uppercase border-b border-gray-850 pb-2">By Location</span>
                        <div className="flex flex-col gap-2">
                          <Link href="/events?location=New%20Delhi" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <Info size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Delhi JNS Arena</span>
                          </Link>
                          <Link href="/events?location=Mumbai" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <Info size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Mumbai Corridor</span>
                          </Link>
                          <Link href="/events?location=Bengaluru" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <Info size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Bengaluru Hub</span>
                          </Link>
                          <Link href="/events?location=Chennai" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <Info size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Chennai Zone</span>
                          </Link>
                        </div>
                      </div>

                      {/* Column 3: Promo Card */}
                      <div className="bg-[#0b0f19] border border-gray-800/80 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group/promo">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-xl"></div>
                        <div className="flex flex-col gap-2">
                          <span className="bg-gray-850 border border-gray-800 text-gray-400 text-[8px] font-mono font-bold px-2 py-0.5 rounded tracking-widest uppercase w-fit">Featured Pass</span>
                          <h4 className="text-[11px] font-black text-white leading-tight font-primary uppercase tracking-tight">Elite Automotive Expo</h4>
                          <p className="text-[9.5px] text-gray-500 leading-normal font-secondary">Get VIP pit gate access to India's tuning show clash.</p>
                          
                          {/* Structured Meta Grid */}
                          <div className="grid grid-cols-2 gap-1.5 border-t border-gray-900 pt-2.5 mt-1 font-mono text-[8px] text-gray-500">
                            <div>
                              <span className="block text-[7px] uppercase tracking-wider text-gray-600 font-bold">DATE</span>
                              <span className="text-white font-bold">OCT 24-26</span>
                            </div>
                            <div>
                              <span className="block text-[7px] uppercase tracking-wider text-gray-600 font-bold">PASS TYPE</span>
                              <span className="text-white font-bold">VIP ACCESS</span>
                            </div>
                          </div>
                        </div>
                        <Link href="/events/recharge-cultural-odyssey-2026" className="text-[9.5px] font-bold text-white hover:text-gray-300 transition-colors uppercase tracking-wider mt-4 flex items-center gap-1 group-hover/promo:translate-x-0.5 duration-300">
                          <span>Book VIP pass</span>
                          <ChevronRight size={10} />
                        </Link>
                      </div>

                    </div>
                  )}

                  {/* Competitions Mega Menu */}
                  {hasCompsMega && (
                    <div className="absolute top-[48px] left-1/2 -translate-x-1/2 mt-0 w-[580px] bg-[#070b13]/98 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] transition-all duration-300 opacity-0 translate-y-3 pointer-events-none group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:pointer-events-auto z-50 grid grid-cols-3 gap-6">
                      
                      {/* Column 1: Active Arenas */}
                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-mono tracking-widest text-gray-500 font-bold uppercase border-b border-gray-850 pb-2">Active Arenas</span>
                        <div className="flex flex-col gap-2">
                          <Link href="/competitions" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <Trophy size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Choreo Battle Chime</span>
                          </Link>
                          <Link href="/competitions" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <Sparkles size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Singer Solo Cup</span>
                          </Link>
                          <Link href="/competitions" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <Target size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Cyber Coding Clash</span>
                          </Link>
                          <Link href="/competitions" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <Zap size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Art Fusion Elite</span>
                          </Link>
                        </div>
                      </div>

                      {/* Column 2: Resources */}
                      <div className="flex flex-col gap-3">
                        <span className="text-[9px] font-mono tracking-widest text-gray-500 font-bold uppercase border-b border-gray-850 pb-2">Resources</span>
                        <div className="flex flex-col gap-2">
                          <Link href="/blogs" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <BookOpen size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Rules & Regulations</span>
                          </Link>
                          <Link href="/sponsors" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <Award size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Prize Pool Details</span>
                          </Link>
                          <Link href="/about" className="flex items-center gap-3 text-[11.5px] text-gray-400 hover:text-white transition-all duration-200 group/sub hover:translate-x-1">
                            <div className="w-6 h-6 rounded-md bg-gray-900 border border-gray-850 flex items-center justify-center group-hover/sub:border-white transition-colors">
                              <Layers size={11} className="text-gray-400 group-hover/sub:text-white transition-colors" />
                            </div>
                            <span>Jury Panel</span>
                          </Link>
                        </div>
                      </div>

                      {/* Column 3: Promo Card */}
                      <div className="bg-[#0b0f19] border border-gray-800/80 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group/promo">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full blur-xl"></div>
                        <div className="flex flex-col gap-2">
                          <span className="bg-gray-850 border border-gray-800 text-gray-400 text-[8px] font-mono font-bold px-2 py-0.5 rounded tracking-widest uppercase w-fit">Prize Shield</span>
                          <h4 className="text-[11px] font-black text-white leading-tight font-primary uppercase tracking-tight">Choreo Cup 2026</h4>
                          <p className="text-[9.5px] text-gray-500 leading-normal font-secondary">Register your dance crew for the national final battle.</p>
                          
                          {/* Structured Meta Grid */}
                          <div className="grid grid-cols-2 gap-1.5 border-t border-gray-900 pt-2.5 mt-1 font-mono text-[8px] text-gray-500">
                            <div>
                              <span className="block text-[7px] uppercase tracking-wider text-gray-600 font-bold">DATE</span>
                              <span className="text-white font-bold">OCT 24-26</span>
                            </div>
                            <div>
                              <span className="block text-[7px] uppercase tracking-wider text-gray-600 font-bold">REWARD</span>
                              <span className="text-white font-bold">₹10,00,000</span>
                            </div>
                          </div>
                        </div>
                        <Link href="/competitions" className="text-[9.5px] font-bold text-white hover:text-gray-300 transition-colors uppercase tracking-wider mt-4 flex items-center gap-1 group-hover/promo:translate-x-0.5 duration-300">
                          <span>Register crew</span>
                          <ChevronRight size={10} />
                        </Link>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-xs font-semibold text-gray-300 hover:text-white transition-colors bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-4 py-2 rounded-full"
                >
                  <User size={14} className="text-gray-400" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-pink-400 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="py-2.5 px-6 rounded-full border border-gray-700 bg-transparent text-white font-extrabold text-[11px] tracking-wider uppercase hover:bg-white hover:text-black hover:border-white transition-all duration-300"
              >
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex lg:hidden items-center justify-center p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-[#070b13] border-b border-gray-800/80 py-6 px-5 flex flex-col gap-5 shadow-2xl animate-fade-in z-50">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              const LinkIcon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 text-lg font-medium py-2 border-b border-[rgba(255,255,255,0.03)] hover:text-white ${
                    isActive ? "text-white font-semibold" : "text-gray-400"
                  }`}
                >
                  <LinkIcon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full text-white text-center text-sm font-semibold"
                >
                  <User size={16} />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-pink-900/20 border border-pink-900/30 text-pink-400 rounded-full text-center text-sm font-semibold hover:bg-pink-900/30 cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full py-3 text-center text-sm font-semibold rounded-full border border-gray-700 bg-transparent text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
