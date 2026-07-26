"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, Mail, Lock, User, Phone, MapPin, Building, AlertCircle } from "lucide-react";
import { ApiClient } from "@/lib/api-client";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [organization, setOrganization] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await ApiClient.registerUser(name, email, password, {
        mobile,
        city,
        state,
        organization
      });

      if (res.success && res.user) {
        // Redirect to verification screen
        router.push(`/login/verify?userId=${res.user.id}&redirect=${encodeURIComponent(redirect)}`);
      } else {
        setError(res.error || "Registration failed. Email might already exist.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 bg-[#f8fafc]">
      <div className="w-full max-w-2xl bg-white border border-slate-200/90 shadow-[0_12px_45px_rgba(0,0,0,0.06)] rounded-[32px] p-8 md:p-10 relative overflow-hidden text-slate-800 text-left">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-cyan-500"></div>

        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <span className="text-[10px] font-primary font-bold tracking-widest text-indigo-600 uppercase">Join Recharge Nation</span>
          <h2 className="text-2xl sm:text-3xl font-black font-primary text-slate-900 uppercase tracking-tight">Create Account</h2>
          <p className="text-slate-500 text-[11px] sm:text-xs font-secondary leading-relaxed max-w-md mx-auto mt-0.5">Enter your details to manage tickets, register for competitions, and update profiles</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs flex items-start gap-2.5 text-left">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2 flex flex-col">
            <label className="text-[10px] font-primary tracking-wider font-bold text-slate-400 uppercase mb-1.5 block">Full Name *</label>
            <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-350 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600/25 transition-all">
              <User className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent pl-10 pr-4 py-3 outline-none font-secondary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-primary tracking-wider font-bold text-slate-400 uppercase mb-1.5 block">Email Address *</label>
            <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-350 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600/25 transition-all">
              <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input 
                type="email" 
                placeholder="you@example.com" 
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent pl-10 pr-4 py-3 outline-none font-secondary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-primary tracking-wider font-bold text-slate-400 uppercase mb-1.5 block">Password *</label>
            <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-350 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600/25 transition-all">
              <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent pl-10 pr-4 py-3 outline-none font-secondary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-primary tracking-wider font-bold text-slate-400 uppercase mb-1.5 block">Mobile Number</label>
            <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-350 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600/25 transition-all">
              <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input 
                type="tel" 
                placeholder="+91 99999 88888" 
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent pl-10 pr-4 py-3 outline-none font-secondary"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-primary tracking-wider font-bold text-slate-400 uppercase mb-1.5 block">School / College / Organization</label>
            <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-350 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600/25 transition-all">
              <Building className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="IIT Bangalore / XYZ Corp" 
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent pl-10 pr-4 py-3 outline-none font-secondary"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-primary tracking-wider font-bold text-slate-400 uppercase mb-1.5 block">City</label>
            <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-350 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600/25 transition-all">
              <MapPin className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Mumbai" 
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent pl-10 pr-4 py-3 outline-none font-secondary"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-primary tracking-wider font-bold text-slate-400 uppercase mb-1.5 block">State</label>
            <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-350 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600/25 transition-all">
              <MapPin className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Maharashtra" 
                className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent pl-10 pr-4 py-3 outline-none font-secondary"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>

          <div className="md:col-span-2 pt-2">
            <button 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-pink-600 to-rose-500 hover:from-indigo-700 hover:to-rose-600 text-white font-primary font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              disabled={isLoading}
            >
              <UserPlus size={16} />
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500 font-secondary">
          Already have an account?{" "}
          <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-indigo-600 hover:text-indigo-750 font-bold underline font-primary transition-colors">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center text-gray-400 text-sm">
        Loading Registration Module...
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
