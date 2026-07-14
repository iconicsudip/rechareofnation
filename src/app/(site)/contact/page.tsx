"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, ShieldCheck } from "lucide-react";
import { ApiClient } from "@/lib/api-client";

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
    <div className="container py-12 flex flex-col gap-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Communication</span>
        <h1 className="text-4xl md:text-5xl font-black font-primary text-white">Get in Touch</h1>
        <p className="text-gray-400 text-sm mt-2">Have a question or request? Submit your message and we'll reply shortly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Details (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-xl border-[rgba(255,255,255,0.06)] flex items-start gap-4">
            <MapPin className="text-cyan-400 shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-bold text-white text-sm font-primary">Office Address</h4>
              <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                Level 4, Corporate Towers, MG Road, Bengaluru, Karnataka - 560001
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl border-[rgba(255,255,255,0.06)] flex items-start gap-4">
            <Phone className="text-cyan-400 shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-bold text-white text-sm font-primary">Calling Helpline</h4>
              <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                +91 98765 43210 <br />
                Mon - Sat: 9:00 AM to 6:00 PM
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl border-[rgba(255,255,255,0.06)] flex items-start gap-4">
            <Mail className="text-cyan-400 shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-bold text-white text-sm font-primary">Email Support</h4>
              <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
                info@rechargenation.in <br />
                support@rechargenation.in
              </p>
            </div>
          </div>

          {/* Map Embed */}
          <div className="h-60 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)] glass-panel">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9734335503835!2d77.6083818!3d12.9735417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1684c30c8ef3%3A0xe5413346cd6848e4!2sMG%20Road%20Bengaluru!5e0!3m2!1sen!2sin!4v1689250000004!5m2!1sen!2sin"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy"
            ></iframe>
          </div>
        </div>

        {/* Right Column: Form (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-8 md:p-10 rounded-2xl border-indigo-500/15 bg-gradient-to-b from-gray-900 to-indigo-950/20">
          <h3 className="text-xl font-bold text-white font-primary mb-2">Send Enquiry Message</h3>
          <p className="text-gray-400 text-xs mb-8">Fill the fields and pass the captcha validation check to trigger submission.</p>

          {isSubmitted ? (
            <div className="py-10 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-center flex flex-col items-center gap-3">
              <CheckCircle size={36} />
              <h4 className="font-bold font-primary text-base">Message Sent Successfully!</h4>
              <p className="text-xs max-w-sm">A simulated auto-acknowledgement response notification email has been triggered via SMTP.</p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="btn btn-secondary py-2 px-6 text-xs font-semibold rounded-full mt-4"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91 99999 88888" 
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input 
                    type="text" 
                    placeholder="Sponsorship, Booking question..." 
                    className="form-input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Message Content *</label>
                <textarea 
                  placeholder="Outline your question or request details here..." 
                  className="form-input h-32 resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              {/* Spam Protection Simulator Box */}
              <div className="p-4 rounded-xl border border-dashed border-gray-800 bg-slate-900/30 flex items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="captcha-check" 
                    className="w-4 h-4 cursor-pointer accent-cyan-500 rounded border-gray-700 bg-gray-900 focus:ring-0 focus:ring-offset-0"
                    checked={isCaptchaVerified}
                    onChange={(e) => setIsCaptchaVerified(e.target.checked)}
                  />
                  <label htmlFor="captcha-check" className="text-xs font-semibold text-gray-400 cursor-pointer select-none">
                    I am not a robot (reCAPTCHA Verification Check)
                  </label>
                </div>
                <ShieldCheck size={20} className={isCaptchaVerified ? "text-emerald-400" : "text-gray-600"} />
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary w-full py-3.5 mt-2 font-bold flex items-center justify-center gap-2 ${
                  !isCaptchaVerified ? "btn-disabled" : ""
                }`}
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
