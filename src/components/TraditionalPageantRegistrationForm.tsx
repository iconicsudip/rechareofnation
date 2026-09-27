"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, UploadCloud, Check, AlertCircle } from "lucide-react";
import { ApiClient, CompetitionRecord } from "@/lib/api-client";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh", "Chandigarh",
  "Puducherry",
];

const TALENT_CATEGORIES = [
  "Classical / Folk Dance",
  "Vocal / Instrumental Music",
  "Ramp Walk & Styling",
  "Public Speaking / Oratory",
  "Theatre & Mono-Act",
  "Other Performing Talent",
];

const SINGLE_FEE_FALLBACK = 3300;
const COUPLE_FEE = 6000;

type EntryType = "single" | "couple";

// Resolve which real competition category (Mr./Miss track) this contestant
// falls under, based on gender — this pageant's categories are gender-split,
// so there's no separate "division" picker in this bespoke form.
const resolveCategoryForGender = (competition: CompetitionRecord, gender: string): string => {
  if (!competition.categories.length) return "";
  const hint = gender.toLowerCase();
  const match = competition.categories.find((c) => {
    const name = c.name.toLowerCase();
    if (hint === "male" && name.includes("mr")) return true;
    if (hint === "female" && name.includes("miss")) return true;
    return false;
  });
  return (match ?? competition.categories[0]).name;
};

interface TraditionalPageantRegistrationFormProps {
  competition: CompetitionRecord;
}

export default function TraditionalPageantRegistrationForm({ competition }: TraditionalPageantRegistrationFormProps) {
  const router = useRouter();

  const [entryType, setEntryType] = useState<EntryType>("single");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [height, setHeight] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [talentCategory, setTalentCategory] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [traditionalWearFile, setTraditionalWearFile] = useState<File | null>(null);
  const [auditionVideoFile, setAuditionVideoFile] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ participantId: string; qrCodeValue: string } | null>(null);

  const singleFee = competition.registrationFee || SINGLE_FEE_FALLBACK;
  const fee = entryType === "couple" ? COUPLE_FEE : singleFee;

  const inputClass =
    "w-full text-xs font-secondary text-[var(--text-primary)] bg-black/20 border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 placeholder:text-[var(--text-muted)]";
  const labelClass = "text-[8px] font-primary tracking-wider text-[var(--text-muted)] font-bold uppercase";
  const fileLabelClass =
    "flex items-center gap-2 text-[10px] font-secondary text-[var(--text-muted)] bg-black/20 border border-dashed border-[var(--border-color)] hover:border-amber-500/40 rounded-xl px-3 py-2.5 cursor-pointer transition-colors";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAuthRequired(false);

    if (!portraitFile || !traditionalWearFile) {
      setError("Portrait Photo and Traditional Wear Photo are both required.");
      return;
    }
    if (!confirmed) {
      setError("Please confirm your details are true and you agree to the event rules.");
      return;
    }

    const user = ApiClient.getCurrentUser();
    if (!user) {
      setAuthRequired(true);
      setError("You need to be logged in to complete your registration.");
      return;
    }

    setIsSubmitting(true);
    try {
      const category = resolveCategoryForGender(competition, gender);
      const paymentId = `pay_rzp_comp_${Math.random().toString(36).substr(2, 9)}`;

      const registration = await ApiClient.createRegistration({
        competitionId: competition.id,
        competitionName: competition.name,
        competitionDate: competition.eventDate,
        competitionVenue: competition.venue,
        competitionBanner: competition.bannerUrl,
        fullName,
        dob: "",
        age: Number(age),
        gender,
        email,
        mobile,
        city,
        state,
        address: "",
        organization: "",
        category,
        emergencyContact: mobile,
        uploads: {
          photograph: portraitFile.name,
          performanceVideo: auditionVideoFile?.name || undefined,
        },
        paymentId,
        paymentStatus: "paid",
        status: "pending",
      });

      setResult({ participantId: registration.participantId, qrCodeValue: registration.qrCodeValue });
    } catch {
      setError("We couldn't process your registration right now. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-2">
        <span className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Check size={22} />
        </span>
        <div>
          <h3 className="font-extrabold text-[var(--text-primary)] text-sm font-primary uppercase tracking-tight">
            Registration Confirmed
          </h3>
          <p className="text-[var(--text-muted)] text-[10.5px] font-secondary mt-1">
            Your contender profile is submitted. Approval confirmation follows within 48-72 hours.
          </p>
        </div>
        <div className="w-full bg-black/20 border border-[var(--border-color)] rounded-xl p-4 flex flex-col gap-1.5">
          <span className="text-[7.5px] font-primary text-[var(--text-muted)] font-bold uppercase">Participant ID</span>
          <span className="text-amber-400 font-primary font-black text-sm tracking-wide">{result.participantId}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles size={11} className="text-amber-400" />
        <span className="text-amber-400 font-primary text-[8px] font-extrabold tracking-widest uppercase">Official Registration</span>
      </div>
      <h3 className="font-black text-[var(--text-primary)] text-lg font-primary uppercase tracking-tight -mt-1">
        Claim Your Seat Now
      </h3>
      <p className="text-[var(--text-muted)] text-[10.5px] font-secondary -mt-1.5">
        Open for Male, Female &amp; Couple contestants aged 16-45 from all states.
      </p>

      {error && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-[11px] flex flex-col gap-2.5 items-start">
          <span className="flex items-start gap-2">
            <AlertCircle size={13} className="shrink-0 mt-0.5" /> {error}
          </span>
          {authRequired && (
            <button
              type="button"
              onClick={() => router.push(`/login?redirect=/competitions/${competition.slug}`)}
              className="bg-amber-500 hover:bg-amber-400 text-[#170D08] text-[9.5px] font-primary font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Log In to Continue
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Entry Type Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          {([
            { type: "single" as const, label: "Single Entry", price: singleFee },
            { type: "couple" as const, label: "Couple Entry", price: COUPLE_FEE },
          ]).map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => setEntryType(opt.type)}
              className={`rounded-xl border py-3 px-2 text-center transition-colors cursor-pointer ${
                entryType === opt.type
                  ? "border-amber-500/50 bg-amber-500/10"
                  : "border-[var(--border-color)] bg-black/20 hover:border-amber-500/25"
              }`}
            >
              <span className="block text-[8px] font-primary font-bold uppercase tracking-widest text-[var(--text-muted)]">{opt.label}</span>
              <span className="block text-sm font-black text-amber-400 font-primary mt-1">₹{opt.price.toLocaleString("en-IN")}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Entry Category</label>
          <select value={entryType} onChange={(e) => setEntryType(e.target.value as EntryType)} className={inputClass}>
            <option value="single">Single Registration — ₹{singleFee.toLocaleString("en-IN")}</option>
            <option value="couple">Couple Registration — ₹{COUPLE_FEE.toLocaleString("en-IN")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Full Name</label>
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Your full name" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Age</label>
            <input required type="number" min={16} max={45} value={age} onChange={(e) => setAge(e.target.value)} className={inputClass} placeholder="16 - 45" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Gender</label>
            <select required value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass}>
              <option value="" disabled>Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>State</label>
            <select required value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
              <option value="" disabled>Select state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>City</label>
            <input required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="City name" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Height (cm)</label>
            <input required type="number" min={100} max={250} value={height} onChange={(e) => setHeight(e.target.value)} className={inputClass} placeholder="e.g. 172" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Mobile Number</label>
            <input
              required
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              pattern="^(\+91)?[6-9]\d{9}$"
              title="Enter a valid 10-digit Indian mobile number"
              className={inputClass}
              placeholder="10-digit number"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Email ID</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="your@email.com" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Talent Category</label>
          <select required value={talentCategory} onChange={(e) => setTalentCategory(e.target.value)} className={inputClass}>
            <option value="" disabled>Select talent</option>
            {TALENT_CATEGORIES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Instagram Handle / Profile Link</label>
          <input value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} className={inputClass} placeholder="@yourhandle" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Portrait Photo</label>
            <label className={fileLabelClass}>
              <UploadCloud size={13} className="shrink-0 text-amber-400" />
              <span className="truncate">{portraitFile ? portraitFile.name : "Choose file"}</span>
              <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => setPortraitFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Traditional Wear Photo</label>
            <label className={fileLabelClass}>
              <UploadCloud size={13} className="shrink-0 text-amber-400" />
              <span className="truncate">{traditionalWearFile ? traditionalWearFile.name : "Choose file"}</span>
              <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => setTraditionalWearFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Audition Video (Optional)</label>
          <label className={fileLabelClass}>
            <UploadCloud size={13} className="shrink-0 text-amber-400" />
            <span className="truncate">{auditionVideoFile ? auditionVideoFile.name : "Choose file"}</span>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => setAuditionVideoFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 accent-amber-500 shrink-0"
          />
          <span className="text-[10.5px] font-secondary text-[var(--text-muted)] leading-snug">
            I confirm that the details provided are true and agree to event rules.
          </span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-[#170D08] font-primary uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Processing..." : `Submit & Register — ₹${fee.toLocaleString("en-IN")}`}
        </button>

        <a
          href={`mailto:${competition.organizer.email}?subject=Registration Inquiry — ${competition.name}`}
          className="text-[9px] text-center text-[var(--text-muted)] hover:text-amber-400 font-primary font-bold uppercase tracking-widest transition-colors"
        >
          ✦ If any inquiry? Direct Helpdesk
        </a>
      </form>
    </>
  );
}
