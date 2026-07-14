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
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl glass-panel p-8 md:p-10 relative overflow-hidden rounded-2xl border-indigo-500/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-cyan-500"></div>

        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Join Recharge Nation</span>
          <h2 className="text-3xl font-extrabold font-primary text-white">Create Account</h2>
          <p className="text-gray-400 text-xs">Enter your details to manage tickets, register for competitions, and update profiles</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-pink-500/10 border border-pink-500/30 text-pink-400 rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="form-group md:col-span-2">
            <label className="form-label">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="John Doe" 
                className="form-input w-full pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-500" size={16} />
              <input 
                type="email" 
                placeholder="you@example.com" 
                className="form-input w-full pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-500" size={16} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="form-input w-full pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-gray-500" size={16} />
              <input 
                type="tel" 
                placeholder="+91 99999 88888" 
                className="form-input w-full pl-10"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">School / College / Organization</label>
            <div className="relative">
              <Building className="absolute left-3 top-3.5 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="IIT Bangalore / XYZ Corp" 
                className="form-input w-full pl-10"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Mumbai" 
                className="form-input w-full pl-10"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">State</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Maharashtra" 
                className="form-input w-full pl-10"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
          </div>

          <div className="md:col-span-2 pt-2">
            <button 
              type="submit" 
              className="btn btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-bold"
              disabled={isLoading}
            >
              <UserPlus size={18} />
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          Already have an account?{" "}
          <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-cyan-400 hover:text-white font-semibold underline">
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
