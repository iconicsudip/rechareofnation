"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, ShieldCheck, MessageCircle } from "lucide-react";
import { ApiClient } from "@/lib/api-client";

interface ContactInfoContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  address: string;
  phone: string;
  phoneHours: string;
  supportEmail: string;
  salesEmail: string;
  mapEmbedUrl: string;
  formHeading: string;
  formHelperText: string;
  successHeading: string;
  successBody: string;
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Spam verification (reCAPTCHA simulator)
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [content, setContent] = useState<ContactInfoContent | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await ApiClient.getSiteContent<ContactInfoContent>("contact_info");
      setContent(data);
    };
    fetchContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCaptchaVerified) return;
    setIsSubmitting(true);

    await ApiClient.submitContactForm({
      name,
      email,
      phone,
      subject,
      message
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
    setIsCaptchaVerified(false);
  };

  return (
    <div className="container py-16 md:py-20 flex flex-col gap-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-4">
        <span className="inline-flex items-center gap-2 bg-pink-50 border border-pink-100 text-pink-600 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full font-primary">
          <MessageCircle size={12} /> {content?.eyebrow}
        </span>
        <h1 className="text-4xl md:text-5xl font-black font-primary text-slate-900 tracking-tight">{content?.heading}</h1>
        <p className="text-slate-500 text-sm max-w-lg">{content?.subheading}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left Column: Details (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center bg-indigo-50 border border-indigo-100">
              <MapPin className="text-indigo-600" size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-primary">Office Address</h4>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                {content?.address}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center bg-pink-50 border border-pink-100">
              <Phone className="text-pink-600" size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-primary">Calling Helpline</h4>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                {content?.phone} <br />
                {content?.phoneHours}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center bg-emerald-50 border border-emerald-100">
              <Mail className="text-emerald-600" size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-primary">Email Support</h4>
              <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                {content?.salesEmail} <br />
                {content?.supportEmail}
              </p>
            </div>
          </div>

          {/* Map Embed */}
          <div className="h-60 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <iframe
              src={content?.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
            ></iframe>
          </div>
        </div>

        {/* Right Column: Form (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-[28px] shadow-sm p-8 md:p-10">
          <h3 className="text-xl font-bold text-slate-900 font-primary mb-2">{content?.formHeading}</h3>
          <p className="text-slate-500 text-xs mb-8">{content?.formHelperText}</p>

          {isSubmitted ? (
            <div className="py-10 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl text-center flex flex-col items-center gap-3">
              <CheckCircle size={36} />
              <h4 className="font-bold font-primary text-base">{content?.successHeading}</h4>
              <p className="text-xs max-w-sm">{content?.successBody}</p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="border border-slate-200 text-slate-700 hover:bg-slate-50 py-2 px-6 text-xs font-semibold rounded-full mt-4 transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Full Name *</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full text-sm rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Email Address *</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full text-sm rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 99999 88888"
                    className="w-full text-sm rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Subject *</label>
                  <input
                    type="text"
                    placeholder="Sponsorship, Booking question..."
                    className="w-full text-sm rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">Message Content *</label>
                <textarea
                  placeholder="Outline your question or request details here..."
                  className="w-full text-sm rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-indigo-200 focus:border-indigo-400 transition-colors h-32 resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              {/* Spam Protection Simulator Box */}
              <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="captcha-check"
                    className="w-4 h-4 cursor-pointer accent-indigo-600 rounded border-slate-300 bg-white focus:ring-0 focus:ring-offset-0"
                    checked={isCaptchaVerified}
                    onChange={(e) => setIsCaptchaVerified(e.target.checked)}
                  />
                  <label htmlFor="captcha-check" className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
                    I am not a robot (reCAPTCHA Verification Check)
                  </label>
                </div>
                <ShieldCheck size={20} className={isCaptchaVerified ? "text-emerald-500" : "text-slate-300"} />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 text-white rounded-xl py-3.5 mt-2 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                disabled={isSubmitting || !isCaptchaVerified}
              >
                <Send size={18} />
                {isSubmitting ? "Submitting..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
