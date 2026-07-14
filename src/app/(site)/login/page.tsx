"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Key, Mail, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { ApiClient } from "@/lib/api-client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await ApiClient.loginUser(email, password);
      if (res.success && res.user) {
        if (!res.user.isVerified) {
          router.push(`/login/verify?userId=${res.user.id}&redirect=${encodeURIComponent(redirect)}`);
        } else {
          router.push(redirect);
        }
      } else {
        setError(res.error || "Something went wrong. Please check your credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage(null);
    if (!forgotEmail) return;
    
    // Simulate SMTP dispatch
    console.log(`[MOCK EMAIL SMTP] Dispatching Password Reset link to ${forgotEmail}`);
    setForgotMessage("📬 If that email is registered, we have sent a simulated password reset instructions link.");
    setForgotEmail("");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md glass-panel p-8 md:p-10 relative overflow-hidden rounded-2xl border-indigo-500/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-cyan-500"></div>

        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Join Us</span>
          <h2 className="text-3xl font-extrabold font-primary text-white">Welcome Back</h2>
          <p className="text-gray-400 text-xs">Enter your credentials to access your tickets and registrations</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-pink-500/10 border border-pink-500/30 text-pink-400 rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-group">
            <label className="form-label">Email Address</label>
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
            <div className="flex items-center justify-between">
              <label className="form-label">Password</label>
              <button 
                type="button" 
                onClick={() => setIsForgotModalOpen(true)}
                className="text-xs text-indigo-400 hover:text-white transition-colors"
              >
                Forgot Password?
              </button>
            </div>
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

          <button 
            type="submit" 
            className="btn btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2 font-bold"
            disabled={isLoading}
          >
            <LogIn size={18} />
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          Don't have an account?{" "}
          <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-cyan-400 hover:text-white font-semibold underline">
            Register Here
          </Link>
        </div>

        {/* Forgot Password Modal */}
        {isForgotModalOpen && (
          <div className="absolute inset-0 bg-[#0B0F19]/95 z-20 p-8 flex flex-col justify-center animate-fade-in">
            <div className="flex flex-col items-center text-center gap-2 mb-6">
              <Key size={32} className="text-indigo-400 mb-2" />
              <h3 className="text-xl font-bold text-white">Reset Password</h3>
              <p className="text-gray-400 text-xs">Enter your email and we'll send reset instructions</p>
            </div>

            {forgotMessage ? (
              <div className="flex flex-col gap-4 items-center text-center">
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs">
                  {forgotMessage}
                </div>
                <button 
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotMessage(null);
                  }}
                  className="btn btn-secondary py-2 px-6 text-xs font-semibold rounded-full mt-2"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                <div className="form-group text-left">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    className="form-input"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary py-3 flex-grow text-xs font-bold"
                  >
                    Send Reset Link
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsForgotModalOpen(false)}
                    className="btn btn-secondary py-3 px-6 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center text-gray-400 text-sm">
        Loading Login Module...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
