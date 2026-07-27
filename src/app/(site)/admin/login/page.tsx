"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@rechargenation.in");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Session cookie is set server-side (HttpOnly) by the API route
        router.push("/admin");
      } else {
        setError(data.error || "Login failed. Check your credentials.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(99,102,241,0.25)",
    borderRadius: "12px",
    color: "#E2E8F0",
    outline: "none",
    padding: "12px 16px 12px 44px",
    fontSize: "14px",
    width: "100%",
    transition: "border-color 0.2s",
    fontFamily: "var(--font-primary)",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "radial-gradient(ellipse at 30% 20%, rgba(79,70,229,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(219,39,119,0.1) 0%, transparent 60%), #0B0F1A",
        fontFamily: "var(--font-primary)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #4F46E5, #DB2777)", boxShadow: "0 8px 32px rgba(79,70,229,0.4)" }}
          >
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Portal</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>Recharge Nation Dashboard</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: "rgba(15,23,42,0.7)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(99,102,241,0.2)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-6 text-xs font-semibold"
            style={{ background: "rgba(79,70,229,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#818CF8" }}
          >
            <ShieldCheck size={13} />
            Restricted to administrators only
          </div>

          {error && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#FCA5A5" }}
            >
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(148,163,184,0.4)" }} />
              <input
                type="email"
                required
                style={inputStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                id="admin-email"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(148,163,184,0.4)" }} />
              <input
                type={showPw ? "text" : "password"}
                required
                style={{ ...inputStyle, paddingRight: "44px" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                id="admin-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(148,163,184,0.4)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: loading ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #4F46E5 0%, #DB2777 100%)",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 20px rgba(79,70,229,0.4)",
                fontFamily: "var(--font-primary)",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <ShieldCheck size={15} />
                  Sign In to Admin
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
