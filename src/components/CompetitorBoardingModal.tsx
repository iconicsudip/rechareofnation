"use client";

import { useState } from "react";
import { Form, Input, Upload, message } from "antd";
import { X, Upload as UploadIcon, Video, FileText, CreditCard, Check, User, ArrowRight } from "lucide-react";

const STEPS = ["Track", "Profile", "Uploads", "Fee", "ID Card"];
const REGISTRATION_FEE = 1500;
const FINALS_DATE = "2026-11-28";

interface CompetitorBoardingModalProps {
  onClose: () => void;
  initialName?: string;
  initialTrack?: string;
}

interface ProfileFormValues {
  fullName: string;
  email: string;
  phone: string;
  idProof: string;
}

interface UploadsFormValues {
  videoLink?: string;
  portfolioLink?: string;
}

export default function CompetitorBoardingModal({ onClose, initialName = "", initialTrack }: CompetitorBoardingModalProps) {
  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [uploadsForm] = Form.useForm<UploadsFormValues>();
  const [step, setStep] = useState(0);
  const [track, setTrack] = useState<"female" | "male">(initialTrack === "Mr Traditional India" ? "male" : "female");
  const [fullName, setFullName] = useState(initialName);
  const [headshotFile, setHeadshotFile] = useState<File | null>(null);
  const [headshotPreview, setHeadshotPreview] = useState("");
  const [participantId, setParticipantId] = useState("");

  const trackLabel = track === "female" ? "Miss Traditional India (Female)" : "Mr. Traditional India (Male)";

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleContinue = async () => {
    if (step === 1) {
      try {
        const values = await profileForm.validateFields();
        setFullName(values.fullName);
      } catch {
        return;
      }
    } else if (step === 2) {
      try {
        await uploadsForm.validateFields();
      } catch {
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSettlePayment = () => {
    const randDigits = Math.floor(100000 + Math.random() * 900000);
    setParticipantId(`RN-P-${randDigits}`);
    setStep(4);
  };

  const labelClass = "text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500";

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[92vh] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 pt-7 pb-5 border-b border-slate-100 shrink-0">
          <div>
            <span className="text-indigo-600 font-mono text-[11px] font-bold tracking-widest uppercase">Competitor Boarding</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-primary mt-1">Miss & Mr. Traditional India 2026</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="flex px-6 sm:px-8 border-b border-slate-100 overflow-x-auto shrink-0">
          {STEPS.map((label, idx) => (
            <div
              key={label}
              className={`px-3 sm:px-4 py-3.5 text-xs sm:text-sm font-mono font-bold whitespace-nowrap border-b-2 -mb-px transition-colors ${
                idx === step ? "text-indigo-600 border-indigo-600" : idx < step ? "text-slate-500 border-transparent" : "text-slate-300 border-transparent"
              }`}
            >
              {idx + 1}. {label}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-7">
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <h3 className="font-bold text-slate-900 text-base">Select Audition or Category Track:</h3>
              <div className="flex flex-col gap-3">
                {([
                  { key: "female", label: "Miss Traditional India (Female)" },
                  { key: "male", label: "Mr. Traditional India (Male)" },
                ] as const).map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex items-center justify-between gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${
                      track === opt.key ? "border-indigo-600 bg-indigo-50/50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${track === opt.key ? "border-indigo-600" : "border-slate-300"}`}>
                        {track === opt.key && <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                      </span>
                      <span className="font-bold text-slate-800 text-[15px]">{opt.label}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg shrink-0">Audition Open</span>
                    <input type="radio" name="track" className="sr-only" checked={track === opt.key} onChange={() => setTrack(opt.key)} />
                  </label>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-1.5">
                <span className="text-indigo-600 font-mono text-[11px] font-bold tracking-widest uppercase">Prize Pool Valuation</span>
                <span className="text-xl font-black text-slate-900">₹25,00,000 + Modelling Contracts</span>
                <p className="text-slate-500 text-xs">Includes modeling contracts, live stage exposure, performance certificates, and mentorship fellowships.</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <Form form={profileForm} layout="vertical" requiredMark={false} initialValues={{ fullName }} className="flex flex-col gap-1">
              <h3 className="font-bold text-slate-900 text-base mb-4">Competitor Personal Information:</h3>

              <Form.Item
                name="fullName"
                label={<span className={labelClass}>Full Legal Name</span>}
                rules={[
                  { required: true, message: "Full legal name is required." },
                  { min: 3, message: "Name must be at least 3 characters." },
                  { pattern: /^[A-Za-z\s.'-]+$/, message: "Name can only contain letters, spaces, and . ' -" },
                ]}
              >
                <Input className="antd-cyber-input" placeholder="Enter full name for participant ID badge" />
              </Form.Item>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                <Form.Item
                  name="email"
                  label={<span className={labelClass}>Email Address</span>}
                  rules={[
                    { required: true, message: "Email address is required." },
                    { type: "email", message: "Enter a valid email address." },
                  ]}
                >
                  <Input className="antd-cyber-input" placeholder="e.g. name@domain.com" />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label={<span className={labelClass}>Phone Number</span>}
                  rules={[
                    { required: true, message: "Phone number is required." },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const digits = String(value).replace(/[\s-]/g, "");
                        return /^(\+91)?[6-9]\d{9}$/.test(digits)
                          ? Promise.resolve()
                          : Promise.reject(new Error("Enter a valid 10-digit Indian mobile number."));
                      },
                    },
                  ]}
                >
                  <Input className="antd-cyber-input" placeholder="e.g. +91 99887 XXXXX" />
                </Form.Item>
              </div>

              <Form.Item
                name="idProof"
                label={<span className={labelClass}>Verification ID Proof (College ID / Aadhaar / Passport)</span>}
                extra={<span className="text-slate-400 text-[11px]">Your ID number is strictly encrypted and used solely for gate identity verification matching.</span>}
                rules={[
                  { required: true, message: "ID proof number is required." },
                  { min: 4, message: "ID number looks too short." },
                ]}
              >
                <Input className="antd-cyber-input" placeholder="Enter ID Number for entry gate identity checks" />
              </Form.Item>
            </Form>
          )}

          {step === 2 && (
            <Form form={uploadsForm} layout="vertical" requiredMark={false} className="flex flex-col gap-5">
              <h3 className="font-bold text-slate-900 text-base">Upload Portfolios & Audition Audios:</h3>

              <Upload.Dragger
                accept="image/jpeg,image/png"
                maxCount={1}
                showUploadList={false}
                className="!bg-transparent !border-2 !border-dashed !border-slate-200 hover:!border-indigo-300 !rounded-2xl transition-colors"
                beforeUpload={(file) => {
                  const isValidType = file.type === "image/jpeg" || file.type === "image/png";
                  const isValidSize = file.size / 1024 / 1024 < 5;
                  if (!isValidType) {
                    message.error("Only JPG or PNG files are supported.");
                    return Upload.LIST_IGNORE;
                  }
                  if (!isValidSize) {
                    message.error("Headshot must be smaller than 5MB.");
                    return Upload.LIST_IGNORE;
                  }
                  setHeadshotFile(file);
                  setHeadshotPreview(URL.createObjectURL(file));
                  return false;
                }}
              >
                <div className="flex flex-col items-center gap-3 py-6">
                  <span className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto">
                    <UploadIcon size={20} />
                  </span>
                  <span className="font-bold text-slate-800 text-sm block">
                    {headshotFile ? headshotFile.name : "Drag & Drop Portrait Headshot or Click to Browse"}
                  </span>
                  <span className="text-slate-400 text-xs block">JPG, PNG up to 5MB. Must clearly show face for ID Badge integration.</span>
                </div>
              </Upload.Dragger>

              <Form.Item
                name="videoLink"
                label={
                  <span className={`${labelClass} flex items-center gap-1.5`}>
                    <Video size={12} /> Audition Performance Video Link (YouTube / Drive)
                  </span>
                }
                rules={[{ type: "url", message: "Enter a valid URL." }]}
                className="!mb-0"
              >
                <Input className="antd-cyber-input" placeholder="https://youtube.com/watch?v=..." />
              </Form.Item>

              <Form.Item
                name="portfolioLink"
                label={
                  <span className={`${labelClass} flex items-center gap-1.5`}>
                    <FileText size={12} /> Digital Portfolio / Certificates Folder Link (Optional)
                  </span>
                }
                rules={[{ type: "url", message: "Enter a valid URL." }]}
                className="!mb-0"
              >
                <Input className="antd-cyber-input" placeholder="https://drive.google.com/drive/..." />
              </Form.Item>
            </Form>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col gap-4">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">Participant Settlement Details</span>
                <div className="flex justify-between text-sm text-slate-800">
                  <span className="font-normal text-slate-600">Competition Boarding Registration Fee</span>
                  <span className="font-bold">₹{REGISTRATION_FEE}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Processing & Jury Evaluation Fee</span>
                  <span className="text-slate-800 font-semibold">₹0 (Waived)</span>
                </div>
                <div className="border-t border-slate-200 pt-4 flex justify-between text-base font-black text-slate-900">
                  <span>Payable Amount</span>
                  <span className="text-indigo-600">₹{REGISTRATION_FEE}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl p-6 flex flex-col gap-4">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <CreditCard size={16} className="text-indigo-600" /> Secure Gateway Payment Integration
                </span>
                <div className="border-t border-slate-100" />
                <button
                  type="button"
                  onClick={handleSettlePayment}
                  className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  ✨ Settle Registration of ₹{REGISTRATION_FEE}
                </button>
                <span className="text-slate-400 text-[11px] text-center">By registering, you accept jury procedures, dress code parameters, and background screening codes of conduct.</span>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center gap-5 text-center">
              <span className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Check size={26} />
              </span>
              <div>
                <h3 className="text-xl font-black text-slate-900">Contestant Onboarded Successfully!</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Your Participant Badge ID is verified and active. Download or print the credentials below.</p>
              </div>

              {/* ID Card */}
              <div className="w-full max-w-xs bg-[#0c1222] border border-indigo-500/30 rounded-3xl overflow-hidden shadow-xl">
                <div className="flex justify-center pt-3">
                  <span className="w-12 h-1.5 rounded-full bg-slate-700" />
                </div>
                <div className="px-6 pb-6 pt-2 flex flex-col items-center gap-3">
                  <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                    ★ Competitor Badge ★
                  </span>
                  <span className="text-white font-bold text-xs uppercase tracking-wide text-center">Miss & Mr. Traditional India 2026</span>

                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-indigo-500/50 bg-slate-800 flex items-center justify-center relative mt-2">
                    {headshotPreview ? (
                      <img src={headshotPreview} alt="Contestant headshot" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="text-slate-500" />
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-indigo-600/90 text-white text-[7px] font-bold uppercase text-center py-0.5">Verified ID</span>
                  </div>

                  <span className="text-white font-black text-lg uppercase tracking-tight mt-1 break-words max-w-full">{fullName}</span>
                  <span className="text-indigo-400 font-bold text-[11px] uppercase tracking-wide -mt-2">{trackLabel}</span>
                  <span className="text-slate-500 text-[10px] font-mono">REG ID: {participantId}</span>

                  {/* Mock QR */}
                  <div className="w-24 h-24 bg-white p-2 rounded-lg mt-1">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                      <rect width="25" height="25" fill="black" />
                      <rect x="75" width="25" height="25" fill="black" />
                      <rect y="75" width="25" height="25" fill="black" />
                      <rect x="35" y="35" width="30" height="30" fill="black" />
                      <rect x="10" y="45" width="15" height="15" fill="black" />
                      <rect x="45" y="10" width="15" height="15" fill="black" />
                      <rect x="75" y="75" width="20" height="20" fill="black" />
                    </svg>
                  </div>

                  <div className="w-full border-t border-slate-700 mt-2 pt-3 flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500 font-mono uppercase">Audit Date:</span>
                      <span className="text-white font-bold">{FINALS_DATE}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500 font-mono uppercase">ID Verified:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check size={10} /> Yes
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-950/60 border-t border-slate-800 py-2.5 text-center">
                  <span className="text-indigo-400 text-[9px] font-mono font-bold uppercase tracking-widest">Recharge Nation Official Talent Register</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-t border-slate-100 shrink-0">
          {step === 4 ? (
            <>
              <span />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => typeof window !== "undefined" && window.print()}
                  className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 0}
                className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:text-slate-600 transition-colors cursor-pointer"
              >
                Back
              </button>
              {step !== 3 && (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="bg-[#0c1222] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  Continue <ArrowRight size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
