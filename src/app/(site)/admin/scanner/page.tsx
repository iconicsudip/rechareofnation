"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { QrCode, Camera, CameraOff, CheckCircle, XCircle, RotateCcw, Zap } from "lucide-react";

type ScanResult = {
  result: "allowed" | "denied";
  type?: string;
  reason?: string;
  attendee?: {
    name: string;
    email?: string;
    type: string;
    event: string;
    date?: string;
    venue?: string;
    bookingRef?: string;
    participantId?: string;
    quantity?: number;
  };
};

export default function AdminScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [lastHash, setLastHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualHash, setManualHash] = useState("");
  const [processing, setProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const processQRHash = useCallback(async (hash: string) => {
    if (hash === lastHash || processing) return;
    setLastHash(hash);
    setProcessing(true);
    setScanResult(null);

    try {
      const res = await fetch("/api/admin/qr-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrHash: hash, scannedBy: "admin", scannedByName: "Admin Scanner" }),
      });
      const data: ScanResult = await res.json();
      setScanResult(data);
      setScanCount((c) => c + 1);
    } catch {
      setScanResult({ result: "denied", reason: "Network error — please try again." });
    }
    setProcessing(false);
  }, [lastHash, processing]);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== 4) {
      animRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Use jsQR if available
    if (typeof window !== "undefined" && (window as unknown as { jsQR?: (data: Uint8ClampedArray, w: number, h: number) => { data: string } | null }).jsQR) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const jsQR = (window as unknown as { jsQR: (data: Uint8ClampedArray, w: number, h: number) => { data: string } | null }).jsQR;
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data) {
        processQRHash(code.data);
      }
    }

    animRef.current = requestAnimationFrame(scanFrame);
  }, [processQRHash]);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setScanning(true);
      animRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions and try again.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setCameraActive(false);
    setScanning(false);
  };

  const resetScan = () => {
    setScanResult(null);
    setLastHash(null);
    setManualHash("");
    setProcessing(false);
  };

  useEffect(() => {
    // Load jsQR dynamically
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
    document.head.appendChild(script);
    return () => {
      stopCamera();
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scanning && cameraActive) {
      animRef.current = requestAnimationFrame(scanFrame);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [scanning, cameraActive, scanFrame]);

  const S = {
    card: { background: "rgba(15,23,42,0.6)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "16px" },
    input: {
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(99,102,241,0.2)",
      borderRadius: "10px", color: "#E2E8F0", outline: "none", padding: "10px 14px", fontSize: "14px", width: "100%",
    },
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6" style={{ color: "#E2E8F0" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">QR Scanner</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.6)" }}>
            Scan attendee passes to validate entry · {scanCount} scans this session
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
          style={{ background: scanning ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)", border: `1px solid ${scanning ? "rgba(52,211,153,0.3)" : "rgba(99,102,241,0.2)"}`, color: scanning ? "#34D399" : "#818CF8" }}>
          <div className={`w-1.5 h-1.5 rounded-full ${scanning ? "bg-emerald-400 animate-pulse" : "bg-indigo-400"}`} />
          {scanning ? "Scanning..." : "Camera Off"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera View */}
        <div style={S.card} className="overflow-hidden">
          <div className="relative bg-black" style={{ aspectRatio: "4/3" }}>
            <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.15)", border: "2px dashed rgba(99,102,241,0.3)" }}>
                  <QrCode size={36} style={{ color: "rgba(129,140,248,0.6)" }} />
                </div>
                <p className="text-sm text-center px-6" style={{ color: "rgba(148,163,184,0.5)" }}>
                  Start camera to scan QR codes on attendee passes
                </p>
              </div>
            )}

            {/* Scanning overlay */}
            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 relative">
                    {/* Corner brackets */}
                    {[
                      "top-0 left-0 border-t-2 border-l-2",
                      "top-0 right-0 border-t-2 border-r-2",
                      "bottom-0 left-0 border-b-2 border-l-2",
                      "bottom-0 right-0 border-b-2 border-r-2",
                    ].map((cls, i) => (
                      <div key={i} className={`absolute w-6 h-6 ${cls}`}
                        style={{ borderColor: "#4F46E5", borderRadius: "2px" }} />
                    ))}
                    {/* Scan line */}
                    <div className="absolute left-0 right-0 h-0.5 animate-[scanline_2s_linear_infinite]"
                      style={{
                        background: "linear-gradient(90deg, transparent, #4F46E5, transparent)",
                        top: "50%",
                        animation: "scanline 2s ease-in-out infinite",
                      }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute bottom-0 left-0 right-0 p-3 text-xs text-red-300 text-center"
                style={{ background: "rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}
          </div>

          {/* Camera controls */}
          <div className="p-4 flex gap-3">
            {!cameraActive ? (
              <button onClick={startCamera}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all"
                style={{ background: "linear-gradient(135deg, #4F46E5, #DB2777)", color: "#fff" }}>
                <Camera size={16} /> Start Camera
              </button>
            ) : (
              <>
                <button onClick={stopCamera}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(248,113,113,0.2)" }}>
                  <CameraOff size={15} /> Stop
                </button>
                <button onClick={resetScan}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm flex-1"
                  style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <RotateCcw size={15} /> Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Panel: Result + Manual */}
        <div className="flex flex-col gap-4">
          {/* Scan Result */}
          {processing && (
            <div className="p-6 rounded-2xl flex items-center gap-3" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin flex-shrink-0" />
              <div>
                <div className="font-bold text-white text-sm">Validating pass...</div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>Checking database</div>
              </div>
            </div>
          )}

          {scanResult && !processing && (
            <div className="rounded-2xl overflow-hidden"
              style={{
                border: `1px solid ${scanResult.result === "allowed" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
              }}>
              {/* Result Banner */}
              <div className="p-5 flex items-center gap-4"
                style={{ background: scanResult.result === "allowed" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }}>
                {scanResult.result === "allowed"
                  ? <CheckCircle size={32} className="flex-shrink-0" style={{ color: "#34D399" }} />
                  : <XCircle size={32} className="flex-shrink-0" style={{ color: "#F87171" }} />
                }
                <div>
                  <div className="text-xl font-black" style={{ color: scanResult.result === "allowed" ? "#34D399" : "#F87171" }}>
                    {scanResult.result === "allowed" ? "✓ ACCESS GRANTED" : "✗ ACCESS DENIED"}
                  </div>
                  {scanResult.reason && (
                    <div className="text-xs mt-1" style={{ color: "rgba(148,163,184,0.7)" }}>{scanResult.reason}</div>
                  )}
                </div>
              </div>

              {/* Attendee Details */}
              {scanResult.attendee && (
                <div className="p-5 flex flex-col gap-3" style={{ background: "rgba(15,23,42,0.5)" }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: "rgba(148,163,184,0.4)" }}>Attendee Details</div>
                  {[
                    ["Name", scanResult.attendee.name],
                    ["Pass Type", scanResult.attendee.type],
                    ["Event", scanResult.attendee.event],
                    ["Date", scanResult.attendee.date],
                    ["Venue", scanResult.attendee.venue],
                    ["Ref / ID", scanResult.attendee.bookingRef || scanResult.attendee.participantId],
                    scanResult.attendee.quantity ? ["Seats", String(scanResult.attendee.quantity)] : null,
                  ].filter(Boolean).map((row) => (
                    <div key={row![0]} className="flex justify-between items-start gap-4 text-sm">
                      <span style={{ color: "rgba(148,163,184,0.5)" }}>{row![0]}</span>
                      <span className="text-white font-semibold text-right">{row![1] || "—"}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <button onClick={resetScan}
                  className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <RotateCcw size={14} /> Scan Next
                </button>
              </div>
            </div>
          )}

          {!scanResult && !processing && (
            <div className="p-8 rounded-2xl flex flex-col items-center gap-3 text-center" style={S.card}>
              <Zap size={32} style={{ color: "rgba(99,102,241,0.3)" }} />
              <div className="font-bold text-white text-sm">Ready to Scan</div>
              <div className="text-xs" style={{ color: "rgba(148,163,184,0.4)" }}>
                Point the camera at a QR code on an attendee's pass to validate entry.
              </div>
            </div>
          )}

          {/* Manual Entry */}
          <div className="p-5 rounded-2xl" style={S.card}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "rgba(148,163,184,0.5)" }}>Manual QR Entry</div>
            <div className="flex gap-2">
              <input
                style={S.input}
                placeholder="Paste QR hash / code..."
                value={manualHash}
                onChange={(e) => setManualHash(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && manualHash.trim()) { processQRHash(manualHash.trim()); } }}
              />
              <button
                onClick={() => manualHash.trim() && processQRHash(manualHash.trim())}
                disabled={!manualHash.trim() || processing}
                className="px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #4F46E5, #DB2777)", color: "#fff", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                <Zap size={14} /> Validate
              </button>
            </div>
            <p className="text-[11px] mt-2" style={{ color: "rgba(148,163,184,0.35)" }}>
              For passes where camera scan isn't possible. Enter the unique QR hash and press Enter.
            </p>
          </div>
        </div>
      </div>

      {/* Scanline animation */}
      <style>{`
        @keyframes scanline {
          0% { top: 10%; }
          50% { top: 85%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
}
