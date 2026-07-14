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
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md glass-panel p-8 md:p-10 relative overflow-hidden rounded-2xl border-indigo-500/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-cyan-500"></div>

        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <ShieldAlert size={36} className="text-cyan-400 mb-2" />
          <h2 className="text-2xl font-extrabold font-primary text-white">Verify Your Email</h2>
          <p className="text-gray-400 text-xs">
            We have sent a simulated email containing a 6-digit verification code to your registered email address.
          </p>
        </div>

        {/* Mock Helper Box */}
        {mockConsoleCode && (
          <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs flex flex-col gap-1.5 text-center">
            <span className="font-bold">🖥️ Mock SMTP Developer Logs</span>
            <span>The generated verification code is: <strong>{mockConsoleCode}</strong></span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-pink-500/10 border border-pink-500/30 text-pink-400 rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-group text-center">
            <label className="form-label block text-center mb-1">Enter Verification Code</label>
            <div className="relative max-w-[240px] mx-auto">
              <KeyRound className="absolute left-3 top-3.5 text-gray-500" size={16} />
              <input 
                type="text" 
                maxLength={6}
                placeholder="123456" 
                className="form-input w-full pl-10 text-center tracking-widest font-bold text-lg"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2 font-bold"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify & Log In"}
            <ArrowRight size={18} />
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
