"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldAlert, KeyRound, AlertCircle, ArrowRight } from "lucide-react";
import { ApiClient } from "@/lib/api-client";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mockConsoleCode, setMockConsoleCode] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      router.push("/login");
      return;
    }
    // Fetch mock code from localStorage to help the user test it directly in the UI!
    if (typeof window !== "undefined") {
      const savedCode = localStorage.getItem(`rn_verification_code_${userId}`);
      if (savedCode) {
        setMockConsoleCode(savedCode);
      }
    }
  }, [userId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await ApiClient.verifyEmailCode(userId, code);
      if (res.success) {
        router.push(redirect);
      } else {
        setError(res.error || "Incorrect verification code.");
      }
    } catch (err) {
      setError("An error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 bg-[#f8fafc]">
      <div className="w-full max-w-md bg-white border border-slate-200/90 shadow-[0_12px_45px_rgba(0,0,0,0.06)] rounded-[32px] p-8 md:p-10 relative overflow-hidden text-slate-800 text-left">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-cyan-500"></div>

        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <ShieldAlert size={36} className="text-indigo-600 mb-2 animate-pulse" />
          <h2 className="text-2xl font-black font-primary text-slate-900 uppercase tracking-tight">Verify Your Email</h2>
          <p className="text-slate-500 text-[11px] sm:text-xs font-secondary leading-relaxed">
            We have sent a simulated email containing a 6-digit verification code to your registered email address.
          </p>
        </div>

        {/* Mock Helper Box */}
        {mockConsoleCode && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-2xl text-xs flex flex-col gap-1.5 text-center">
            <span className="font-bold text-[9px] font-primary tracking-wider uppercase">🖥️ Mock SMTP Developer Logs</span>
            <span className="font-secondary">The generated verification code is: <strong className="font-primary text-indigo-600">{mockConsoleCode}</strong></span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs flex items-start gap-2.5 text-left">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col text-center">
            <label className="text-[10px] font-primary tracking-wider font-bold text-slate-450 uppercase mb-2 block text-center">Enter Verification Code</label>
            <div className="relative rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-350 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600/25 transition-all max-w-[240px] mx-auto w-full">
              <KeyRound className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              <input 
                type="text" 
                maxLength={6}
                placeholder="123456" 
                className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent pl-10 pr-4 py-3 outline-none font-primary text-center tracking-widest font-bold"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-pink-600 to-rose-500 hover:from-indigo-700 hover:to-rose-600 text-white font-primary font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify & Log In"}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center text-gray-400 text-sm">
        Loading Verification Module...
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
