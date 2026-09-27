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
        router.push(redirect);
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
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] shadow-[0_12px_45px_rgba(0,0,0,0.3)] rounded-[32px] p-8 md:p-10 relative overflow-hidden text-[var(--text-primary)] text-left">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400"></div>

        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <span className="text-[10px] font-primary font-bold tracking-widest text-amber-400 uppercase">Join Us</span>
          <h2 className="text-2xl sm:text-3xl font-black font-primary text-[var(--text-primary)] uppercase tracking-tight">Welcome Back</h2>
          <p className="text-[var(--text-secondary)] text-[11px] sm:text-xs font-secondary leading-relaxed max-w-md mx-auto mt-0.5">Enter your credentials to access your tickets and registrations</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl text-xs flex items-start gap-2.5 text-left">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-[10px] font-primary tracking-wider font-bold text-[var(--text-muted)] uppercase mb-1.5 block">Email Address</label>
            <div className="relative rounded-xl border border-[var(--border-color)] bg-white/5 hover:border-amber-500/30 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/20 transition-all">
              <Mail className="absolute left-3.5 top-3.5 text-[var(--text-muted)]" size={16} />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] bg-transparent pl-10 pr-4 py-3 outline-none font-secondary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-primary tracking-wider font-bold text-[var(--text-muted)] uppercase block">Password</label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-[9.5px] font-primary font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative rounded-xl border border-[var(--border-color)] bg-white/5 hover:border-amber-500/30 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/20 transition-all">
              <Lock className="absolute left-3.5 top-3.5 text-[var(--text-muted)]" size={16} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] bg-transparent pl-10 pr-4 py-3 outline-none font-secondary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-[#170D08] font-primary font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            disabled={isLoading}
          >
            <LogIn size={16} />
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[var(--text-secondary)] font-secondary">
          Don't have an account?{" "}
          <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} className="text-amber-400 hover:text-amber-300 font-bold underline font-primary transition-colors">
            Register Here
          </Link>
        </div>

        {/* Forgot Password Modal */}
        {isForgotModalOpen && (
          <div className="absolute inset-0 bg-[#170D08]/98 z-20 p-8 flex flex-col justify-center animate-fade-in text-[var(--text-primary)] text-left">
            <div className="flex flex-col items-center text-center gap-2 mb-6">
              <Key size={32} className="text-amber-400 mb-2 animate-bounce" />
              <h3 className="text-xl font-black font-primary text-[var(--text-primary)] uppercase tracking-tight">Reset Password</h3>
              <p className="text-[var(--text-secondary)] text-[11px] font-secondary leading-relaxed">Enter your email and we'll send reset instructions</p>
            </div>

            {forgotMessage ? (
              <div className="flex flex-col gap-4 items-center text-center">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-2xl text-xs font-secondary leading-relaxed">
                  {forgotMessage}
                </div>
                <button
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotMessage(null);
                  }}
                  className="bg-[var(--bg-panel)] text-[var(--text-primary)] text-[10px] font-primary font-bold tracking-widest py-3 px-8 rounded-2xl uppercase hover:bg-amber-500 hover:text-[#170D08] transition-all cursor-pointer shadow-sm mt-2"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-primary tracking-wider font-bold text-[var(--text-muted)] uppercase mb-1.5 block">Email Address</label>
                  <div className="relative rounded-xl border border-[var(--border-color)] bg-white/5 hover:border-amber-500/30 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/20 transition-all">
                    <Mail className="absolute left-3.5 top-3.5 text-[var(--text-muted)]" size={16} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] bg-transparent pl-10 pr-4 py-3 outline-none font-secondary"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3.5 mt-2">
                  <button
                    type="submit"
                    className="py-3 bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-[#170D08] font-primary font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md flex-grow cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="py-3 px-6 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] font-primary font-bold text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
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
      <div className="min-h-[80vh] flex items-center justify-center text-[var(--text-muted)] text-sm">
        Loading Login Module...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
