"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Calendar, MapPin, Phone, Mail, User, Shield, Share2, 
  ArrowLeft, Check, Ticket, Trophy, Upload, ShieldCheck, 
  AlertCircle, DollarSign, ExternalLink, Printer, X 
} from "lucide-react";
import { ApiClient, Event, TicketType, TicketPriceInfo, TicketBooking, CompetitionRegistration } from "@/lib/api-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id: eventId } = use(params);

  const [event, setEvent] = useState<Event | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals visibility
  const [activeWizard, setActiveWizard] = useState<"booking" | "registration" | null>(null);

  // Share Event state
  const [copiedLink, setCopiedLink] = useState(false);

  // Unified Fetch
  useEffect(() => {
    const fetchEventData = async () => {
      // Find event by slug or ID
      const allEvents = await ApiClient.getEvents();
      const found = allEvents.find(e => e.slug === eventId || e.id === eventId);
      
      if (found) {
        setEvent(found);
      }
      setCurrentUser(ApiClient.getCurrentUser());
      setIsLoading(false);
    };
    fetchEventData();
  }, [eventId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-20 text-center text-gray-400 text-sm">
        Loading Event Specifications...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-20 text-center flex flex-col items-center gap-4">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-xl font-bold text-white">Event Not Found</h3>
        <p className="text-gray-400 text-sm">The event you are looking for does not exist or has been removed.</p>
        <Link href="/events" className="btn btn-primary py-2 px-6 text-xs rounded-full">
          Back to Events Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Dynamic Wizard Overlays */}
      {activeWizard === "booking" && (
        <TicketBookingWizard 
          event={event} 
          user={currentUser} 
          onClose={() => setActiveWizard(null)} 
        />
      )}
      
      {activeWizard === "registration" && (
        <CompetitionRegistrationWizard 
          event={event} 
          user={currentUser} 
          onClose={() => setActiveWizard(null)} 
        />
      )}

      {/* Hero Banner Area */}
      <section className="relative h-[45vh] lg:h-[55vh] overflow-hidden">
        <img 
          src={event.bannerUrl} 
          alt={event.name} 
          className="w-full h-full object-cover filter brightness-[0.4]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent"></div>
        
        {/* Back Link */}
        <div className="absolute top-6 left-6 z-10">
          <Link href="/events" className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white font-semibold bg-gray-950/40 backdrop-blur px-4 py-2 rounded-full border border-white/5 transition-all">
            <ArrowLeft size={14} /> Back to Events
          </Link>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="container -mt-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          {/* Main Headline card */}
          <div className="glass-panel p-8 rounded-2xl border-indigo-500/10">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">{event.category}</span>
            <h1 className="text-3xl md:text-5xl font-black mt-2 leading-tight text-white font-primary">{event.name}</h1>
            
            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-[rgba(255,255,255,0.06)] text-sm text-gray-400">
              <span className="flex items-center gap-2"><Calendar size={18} className="text-cyan-400" /> {event.date} at {event.time}</span>
              <span className="flex items-center gap-2"><MapPin size={18} className="text-cyan-400" /> {event.venue}, {event.city}</span>
            </div>
          </div>

          {/* Description */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4">
            <h3 className="text-xl font-bold font-primary text-white">About the Event</h3>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line font-secondary">{event.description}</p>
          </div>

          {/* Guidelines / Rules */}
          {event.rules && event.rules.length > 0 && (
            <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4">
              <h3 className="text-xl font-bold font-primary text-white">Guidelines & Rules</h3>
              <ul className="flex flex-col gap-3">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-gray-400 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5"></span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Map & Venue Area */}
          {event.googleMapEmbedUrl && (
            <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4">
              <h3 className="text-xl font-bold font-primary text-white">Event Venue Map</h3>
              <div className="h-72 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)]">
                <iframe 
                  src={event.googleMapEmbedUrl}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          )}

          {/* Photo Gallery Grid */}
          {event.galleryUrls && event.galleryUrls.length > 0 && (
            <div className="glass-panel p-8 rounded-2xl flex flex-col gap-4">
              <h3 className="text-xl font-bold font-primary text-white">Past Event Gallery</h3>
              <div className="grid grid-cols-2 gap-4">
                {event.galleryUrls.map((url, idx) => (
                  <div key={idx} className="h-44 rounded-xl overflow-hidden">
                    <img src={url} alt="Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: CTA Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Action Card */}
          <div className="glass-panel p-6 rounded-2xl border-indigo-500/15 sticky top-24 flex flex-col gap-6 bg-gradient-to-b from-gray-900 to-indigo-950/40">
            <div>
              <span className="text-xs text-gray-500 uppercase block font-semibold">TICKETS & REGISTRATION</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">
                  {event.ticketPrices.length > 0 ? `₹${event.ticketPrices[0].price}` : "Free"}
                </span>
                <span className="text-xs text-gray-400">Starting Price</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              {event.isUpcoming ? (
                <>
                  <button 
                    onClick={() => setActiveWizard("booking")}
                    className="btn btn-primary w-full py-3.5 font-bold flex items-center justify-center gap-2"
                  >
                    <Ticket size={18} /> Book Audience Tickets
                  </button>
                  
                  {event.category.includes("Competitions") || event.registrationFee ? (
                    <button 
                      onClick={() => setActiveWizard("registration")}
                      className="btn btn-secondary w-full py-3.5 font-bold border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/5 hover:text-white"
                    >
                      <Trophy size={18} /> Register as Participant
                    </button>
                  ) : null}
                </>
              ) : (
                <button className="btn btn-disabled w-full py-3.5 font-bold" disabled>
                  Event Concluded
                </button>
              )}

              <button 
                onClick={handleShare}
                className="btn btn-secondary w-full py-3 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Share2 size={14} /> 
                {copiedLink ? "Copied Link!" : "Share Event Link"}
              </button>
            </div>

            {/* Organizer Info */}
            <div className="border-t border-[rgba(255,255,255,0.06)] pt-5 flex flex-col gap-3 text-xs text-gray-400">
              <span className="font-semibold text-white uppercase text-[10px]">Managed By</span>
              <div className="flex flex-col gap-2">
                <span className="font-bold text-gray-300">{event.organizer.name}</span>
                <span className="flex items-center gap-1.5"><Mail size={12} className="text-cyan-400" /> {event.organizer.email}</span>
                <span className="flex items-center gap-1.5"><Phone size={12} className="text-cyan-400" /> {event.organizer.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ----------------------------------------------------
// TICKET BOOKING WIZARD COMPONENT
// ----------------------------------------------------
interface WizardProps {
  event: Event;
  user: any;
  onClose: () => void;
}

function TicketBookingWizard({ event, user, onClose }: WizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Booking details form
  const [selectedTicket, setSelectedTicket] = useState<TicketPriceInfo | null>(event.ticketPrices[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [visitorName, setVisitorName] = useState(user?.name || "");
  const [visitorEmail, setVisitorEmail] = useState(user?.email || "");
  const [visitorMobile, setVisitorMobile] = useState(user?.mobile || "");
  const [visitorCity, setVisitorCity] = useState(user?.city || "");
  const [specialRequests, setSpecialRequests] = useState("");

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<TicketBooking | null>(null);

  // Price calculations
  const pricePerTicket = selectedTicket ? selectedTicket.price : 0;
  const totalAmount = pricePerTicket * quantity;

  // Razorpay simulator trigger
  const handlePayment = async () => {
    if (!visitorName || !visitorEmail || !visitorMobile || !visitorCity) {
      setError("Please fill in all mandatory visitor details.");
      return;
    }
    setError(null);
    setIsProcessing(true);

    // Simulate Payment delay (3 seconds)
    setTimeout(async () => {
      try {
        const mockPayId = "pay_rzp_" + Math.random().toString(36).substr(2, 9);
        const booking = await ApiClient.createBooking({
          eventId: event.id,
          eventName: event.name,
          eventDate: event.date,
          eventVenue: event.venue,
          eventBanner: event.bannerUrl,
          visitorName,
          visitorEmail,
          visitorMobile,
          visitorCity,
          ticketType: selectedTicket?.type as TicketType,
          quantity,
          totalAmount,
          specialRequests,
          paymentId: mockPayId,
          paymentMethod
        });
        
        setCompletedBooking(booking);
        setStep(5); // Go to final confirmation screen
      } catch (err) {
        setError("Booking failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    }, 2500);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg glass-panel relative rounded-2xl border-indigo-500/25 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <h3 className="font-bold text-white font-primary text-base">Book Audience Pass</h3>
          <button onClick={onClose} className="p-1 hover:bg-[rgba(255,255,255,0.05)] rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-grow">
          {error && (
            <div className="mb-4 p-4 bg-pink-500/10 border border-pink-500/30 text-pink-400 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Select Ticket Tier */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-gray-300">1. Select Ticket Tier</h4>
              <div className="flex flex-col gap-3">
                {event.ticketPrices.map((ticket) => (
                  <div 
                    key={ticket.type} 
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-start gap-4 ${
                      selectedTicket?.type === ticket.type 
                        ? "border-cyan-500 bg-cyan-500/5" 
                        : "border-[rgba(255,255,255,0.06)] bg-gray-900/20 hover:border-gray-700"
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-sm text-white">{ticket.type}</h5>
                      <p className="text-gray-400 text-xs mt-1 leading-normal">{ticket.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-white text-base">₹{ticket.price}</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">{ticket.available} left</span>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setStep(2)}
                className="btn btn-primary w-full py-3.5 font-bold mt-4"
              >
                Proceed to Quantity
              </button>
            </div>
          )}

          {/* STEP 2: Choose Quantity */}
          {step === 2 && (
            <div className="flex flex-col gap-4 text-center py-6">
              <h4 className="text-sm font-semibold text-gray-300 text-left">2. Choose Quantity</h4>
              
              <div className="glass-panel p-6 max-w-xs mx-auto w-full flex items-center justify-between border-[rgba(255,255,255,0.06)] rounded-xl mt-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-gray-700 hover:border-white text-white flex items-center justify-center font-bold text-lg"
                >
                  -
                </button>
                <span className="text-3xl font-black text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-10 h-10 rounded-full border border-gray-700 hover:border-white text-white flex items-center justify-center font-bold text-lg"
                >
                  +
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">Maximum of 10 tickets allowed per transaction.</p>
              
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn btn-secondary py-3 px-6 text-sm font-semibold">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="btn btn-primary py-3 flex-grow text-sm font-bold">
                  Enter Visitor Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Enter Visitor Details */}
          {step === 3 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-gray-300">3. Visitor Information</h4>
              
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  placeholder="Visitor name" 
                  className="form-input"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input 
                  type="email" 
                  placeholder="visitor@example.com" 
                  className="form-input"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input 
                    type="tel" 
                    placeholder="99999 88888" 
                    className="form-input"
                    value={visitorMobile}
                    onChange={(e) => setVisitorMobile(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input 
                    type="text" 
                    placeholder="Bangalore" 
                    className="form-input"
                    value={visitorCity}
                    onChange={(e) => setVisitorCity(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Special Requests (Optional)</label>
                <textarea 
                  placeholder="Wheelchair assistance, front rows for elderly etc." 
                  className="form-input h-20 resize-none"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary py-3 px-6 text-sm font-semibold">
                  Back
                </button>
                <button type="submit" className="btn btn-primary py-3 flex-grow text-sm font-bold">
                  Review & Pay
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Review & Payment Simulator */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <h4 className="text-sm font-semibold text-gray-300">4. Review & Payment</h4>
              
              {/* Order breakdown */}
              <div className="glass-panel p-5 rounded-xl border-[rgba(255,255,255,0.06)] bg-gray-900/10 flex flex-col gap-3">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Event</span>
                  <span className="font-bold text-white">{event.name}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Ticket Type</span>
                  <span className="font-bold text-white">{selectedTicket?.type}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Quantity</span>
                  <span className="font-bold text-white">{quantity}</span>
                </div>
                <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 flex justify-between text-sm">
                  <span className="font-bold text-white">Total Amount</span>
                  <span className="font-black text-cyan-400 text-base">₹{totalAmount}</span>
                </div>
              </div>

              {/* Razorpay Interface Simulator */}
              <div className="border border-indigo-500/20 rounded-xl overflow-hidden bg-slate-900/90 relative p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <span className="text-xs font-bold tracking-widest text-gray-400">RAZORPAY CHECKOUT</span>
                  <div className="w-12 h-4 bg-gray-700/50 rounded flex items-center justify-center text-[7px] text-gray-300 font-bold">SECURE</div>
                </div>

                {isProcessing ? (
                  <div className="py-10 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-gray-400 font-semibold animate-pulse">Processing secure payment overlay...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-gray-500 font-bold uppercase">Select Payment Channel</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["UPI", "Credit/Debit Card", "Net Banking", "Wallets"].map(method => (
                          <div 
                            key={method} 
                            onClick={() => setPaymentMethod(method)}
                            className={`p-3 rounded-lg border text-center text-xs font-bold cursor-pointer transition-all ${
                              paymentMethod === method 
                                ? "border-cyan-400 bg-cyan-400/5 text-white" 
                                : "border-gray-800 text-gray-400 hover:border-gray-700"
                            }`}
                          >
                            {method}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={handlePayment}
                      className="btn btn-primary w-full py-3.5 text-xs font-black shadow-neon-pink"
                    >
                      PAY ₹{totalAmount} WITH RAZORPAY
                    </button>
                  </>
                )}
              </div>

              {!isProcessing && (
                <button onClick={() => setStep(3)} className="btn btn-secondary py-3 text-xs font-semibold">
                  Go Back
                </button>
              )}
            </div>
          )}

          {/* STEP 5: Success Pass */}
          {step === 5 && completedBooking && (
            <div className="flex flex-col items-center gap-6 text-center py-4 print-area">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl animate-bounce">
                ✓
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-white font-primary">Booking Confirmed!</h4>
                <p className="text-gray-400 text-xs mt-1">A simulated ticket confirmation mail has been triggered via SMTP.</p>
              </div>

              {/* Printable Ticket Pass Layout */}
              <div className="w-full border border-dashed border-gray-700 rounded-xl bg-gray-900/50 p-6 flex flex-col gap-4 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-bl-full"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold">RECHARGE NATION ENTRY PASS</span>
                    <h5 className="font-extrabold text-white text-base leading-snug font-primary mt-1 line-clamp-1">{completedBooking.eventName}</h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-gray-500 block uppercase font-bold">REF NUMBER</span>
                    <span className="font-mono text-xs font-bold text-white">{completedBooking.bookingRef}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs py-2 border-y border-[rgba(255,255,255,0.06)]">
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Attendee</span>
                    <span className="font-bold text-white line-clamp-1">{completedBooking.visitorName}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Ticket Tier</span>
                    <span className="font-bold text-cyan-400">{completedBooking.ticketType} x {completedBooking.quantity}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Date & Venue</span>
                    <span className="font-bold text-gray-300">{completedBooking.eventDate}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Gate Location</span>
                    <span className="font-bold text-gray-300">{completedBooking.eventVenue}</span>
                  </div>
                </div>

                {/* Simulated QR Code */}
                <div className="flex items-center justify-between gap-4 mt-2">
                  <div className="flex flex-col gap-1 text-[10px] text-gray-400">
                    <span>* Bring this pass with you for scan-in.</span>
                    <span>* Food/Beverage is subject to pass terms.</span>
                  </div>
                  {/* Styled Mock SVG QR Code */}
                  <div className="w-16 h-16 bg-white p-1.5 rounded flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                      <rect width="25" height="25" fill="black"/>
                      <rect x="75" width="25" height="25" fill="black"/>
                      <rect y="75" width="25" height="25" fill="black"/>
                      <rect x="35" y="35" width="30" height="30" fill="black"/>
                      <rect x="10" y="45" width="15" height="15" fill="black"/>
                      <rect x="45" y="10" width="15" height="15" fill="black"/>
                      <rect x="75" y="75" width="20" height="20" fill="black"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full mt-4">
                <button 
                  onClick={handlePrint}
                  className="btn btn-secondary py-3 flex-grow text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} /> Download PDF Ticket
                </button>
                <button 
                  onClick={() => {
                    onClose();
                    router.push("/dashboard");
                  }}
                  className="btn btn-primary py-3 px-6 text-xs font-bold"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// COMPETITION REGISTRATION WIZARD COMPONENT
// ----------------------------------------------------
function CompetitionRegistrationWizard({ event, user, onClose }: WizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Registration form states
  const [category, setCategory] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState<number>(18);
  const [gender, setGender] = useState("Male");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [city, setCity] = useState(user?.city || "");
  const [state, setState] = useState(user?.state || "");
  const [address, setAddress] = useState(user?.address || "");
  const [organization, setOrganization] = useState(user?.organization || "");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Upload simulation states (store filenames)
  const [photograph, setPhotograph] = useState<string | null>(null);
  const [govId, setGovId] = useState<string | null>(null);
  const [performanceVideo, setPerformanceVideo] = useState("");

  // Verification code simulator
  const [verificationCode, setVerificationCode] = useState("");
  const [userEnteredCode, setUserEnteredCode] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  // Payment simulator state
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedReg, setCompletedReg] = useState<CompetitionRegistration | null>(null);

  const registrationFee = event.registrationFee || 0;

  // Age group configurations mock categories
  const categories = [
    { name: "Junior (Age 8 - 14)", fee: registrationFee },
    { name: "Senior (Age 15 - 22)", fee: registrationFee },
    { name: "Open Category (Age 23+)", fee: registrationFee }
  ];

  // Set default category
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0].name);
    }
  }, [categories]);

  // Simulate file upload
  const handleFileUpload = (type: "photo" | "id", filename: string) => {
    if (type === "photo") setPhotograph(filename);
    if (type === "id") setGovId(filename);
  };

  // Step 3 submission trigger - launches email verification step
  const handleProceedToVerify = () => {
    if (!fullName || !email || !mobile || !dob || !city || !state || !emergencyContact) {
      setError("Please fill in all mandatory participant details.");
      return;
    }
    setError(null);
    setIsVerifyingEmail(true);

    // Simulate sending email verification code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(generatedCode);
    console.log(`[MOCK EMAIL SMTP] Competition registration code for ${email} is ${generatedCode}`);
    setStep(4);
    setIsVerifyingEmail(false);
  };

  const handleVerifyCodeSubmit = () => {
    if (userEnteredCode !== verificationCode) {
      setError("Incorrect email verification code. Check your simulated log/console.");
      return;
    }
    setError(null);
    if (registrationFee > 0) {
      setStep(5); // Go to payment
    } else {
      handleFinalizeRegistration("waived", "free_direct");
    }
  };

  // Final submit registration saving
  const handleFinalizeRegistration = async (paymentStatus: 'paid' | 'waived', paymentId = "") => {
    setIsProcessing(true);
    try {
      const reg = await ApiClient.createRegistration({
        competitionId: event.id,
        competitionName: event.name,
        competitionDate: event.date,
        competitionVenue: event.venue,
        competitionBanner: event.bannerUrl,
        fullName,
        dob,
        age,
        gender,
        email,
        mobile,
        city,
        state,
        address,
        organization,
        category,
        emergencyContact,
        uploads: {
          photograph: photograph || undefined,
          govId: govId || undefined,
          performanceVideo: performanceVideo || undefined
        },
        paymentId: paymentId || undefined,
        paymentStatus,
        status: "pending" // Pending approval from admin later
      });

      setCompletedReg(reg);
      setStep(6); // Success Pass
    } catch (err) {
      setError("Failed to submit registration. Please check your inputs.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg glass-panel relative rounded-2xl border-indigo-500/25 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
          <h3 className="font-bold text-white font-primary text-base">Competition Registration</h3>
          <button onClick={onClose} className="p-1 hover:bg-[rgba(255,255,255,0.05)] rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-grow">
          {error && (
            <div className="mb-4 p-4 bg-pink-500/10 border border-pink-500/30 text-pink-400 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Select Category */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-gray-300">1. Select Competition Class</h4>
              <div className="flex flex-col gap-3">
                {categories.map((cat) => (
                  <div 
                    key={cat.name} 
                    onClick={() => setCategory(cat.name)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                      category === cat.name 
                        ? "border-cyan-500 bg-cyan-500/5" 
                        : "border-[rgba(255,255,255,0.06)] bg-gray-900/20 hover:border-gray-700"
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-sm text-white">{cat.name}</h5>
                      <span className="text-[10px] text-gray-500 uppercase block mt-1">Registration Charge</span>
                    </div>
                    <span className="font-bold text-white text-base">₹{cat.fee}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setStep(2)}
                className="btn btn-primary w-full py-3.5 font-bold mt-4"
              >
                Enter Personal Information
              </button>
            </div>
          )}

          {/* STEP 2: Participant Info */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-gray-300">2. Participant Details</h4>
              
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  placeholder="Participant full name" 
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={dob}
                    onChange={(e) => {
                      setDob(e.target.value);
                      // Calculate mock age
                      const birthYear = new Date(e.target.value).getFullYear();
                      const currentYear = new Date().getFullYear();
                      if (birthYear) setAge(currentYear - birthYear);
                    }}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    placeholder="name@college.edu" 
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <input 
                    type="tel" 
                    placeholder="99999 88888" 
                    className="form-input"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input 
                    type="text" 
                    placeholder="Pune" 
                    className="form-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input 
                    type="text" 
                    placeholder="Maharashtra" 
                    className="form-input"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input 
                  type="text" 
                  placeholder="Street name, landmark..." 
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">School/College/Org</label>
                  <input 
                    type="text" 
                    placeholder="DY Patil Pune" 
                    className="form-input"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact *</label>
                  <input 
                    type="tel" 
                    placeholder="Parent mobile number" 
                    className="form-input"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary py-3 px-6 text-sm font-semibold">
                  Back
                </button>
                <button type="submit" className="btn btn-primary py-3 flex-grow text-sm font-bold">
                  Document Uploads
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Document Uploads Simulator */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h4 className="text-sm font-semibold text-gray-300">3. Upload Supporting Credentials</h4>
              
              <div className="flex flex-col gap-4">
                {/* Photograph */}
                <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-gray-900/10 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">Photograph *</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">JPEG or PNG. Max 2MB.</p>
                  </div>
                  <button 
                    onClick={() => handleFileUpload("photo", "passport_photo.png")}
                    className="btn btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Upload size={12} /> {photograph ? "Uploaded" : "Upload file"}
                  </button>
                </div>
                {photograph && <p className="text-[10px] text-emerald-400 -mt-2 ml-1">✓ File: {photograph}</p>}

                {/* Government ID */}
                <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-gray-900/10 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">Aadhaar / Passport ID *</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">PDF or JPG. Max 5MB.</p>
                  </div>
                  <button 
                    onClick={() => handleFileUpload("id", "aadhar_card.pdf")}
                    className="btn btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Upload size={12} /> {govId ? "Uploaded" : "Upload file"}
                  </button>
                </div>
                {govId && <p className="text-[10px] text-emerald-400 -mt-2 ml-1">✓ File: {govId}</p>}

                {/* Video Links */}
                <div className="form-group">
                  <label className="form-label">Performance Video Link (Optional)</label>
                  <input 
                    type="url" 
                    placeholder="YouTube, Drive or Vimeo link" 
                    className="form-input"
                    value={performanceVideo}
                    onChange={(e) => setPerformanceVideo(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-500 leading-normal">Required for initial pre-selection screen evaluation rounds.</p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary py-3 px-6 text-sm font-semibold">
                  Back
                </button>
                <button 
                  onClick={handleProceedToVerify}
                  className="btn btn-primary py-3 flex-grow text-sm font-bold"
                >
                  Verify Contact
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Email Verification Step */}
          {step === 4 && (
            <div className="flex flex-col gap-4 text-center py-4">
              <ShieldCheck size={36} className="text-cyan-400 mx-auto" />
              <h4 className="text-sm font-semibold text-gray-300">4. Email Authentication</h4>
              <p className="text-xs text-gray-500">A verification code has been dispatched to {email}.</p>

              {/* Log Code for Testing */}
              {verificationCode && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-lg text-[10px] font-mono">
                  DEV MODE - Code generated is: <strong>{verificationCode}</strong>
                </div>
              )}

              <div className="form-group text-left max-w-[200px] mx-auto mt-4">
                <label className="form-label text-center">Verify 6-digit Code</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="123456" 
                  className="form-input text-center tracking-widest font-bold"
                  value={userEnteredCode}
                  onChange={(e) => setUserEnteredCode(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(3)} className="btn btn-secondary py-3 px-6 text-sm font-semibold">
                  Back
                </button>
                <button 
                  onClick={handleVerifyCodeSubmit}
                  className="btn btn-primary py-3 flex-grow text-sm font-bold"
                >
                  Verify Code
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Payment Step */}
          {step === 5 && (
            <div className="flex flex-col gap-5">
              <h4 className="text-sm font-semibold text-gray-300">5. Registration Fee Payment</h4>
              
              <div className="glass-panel p-5 rounded-xl border-[rgba(255,255,255,0.06)] bg-gray-900/10 flex flex-col gap-3">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Competition</span>
                  <span className="font-bold text-white">{event.name}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Class Category</span>
                  <span className="font-bold text-white">{category}</span>
                </div>
                <div className="border-t border-[rgba(255,255,255,0.06)] pt-3 flex justify-between text-sm">
                  <span className="font-bold text-white">Fee Amount</span>
                  <span className="font-black text-cyan-400 text-base">₹{registrationFee}</span>
                </div>
              </div>

              {/* Razorpay Integration */}
              <div className="border border-indigo-500/20 rounded-xl overflow-hidden bg-slate-900/90 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <span className="text-xs font-bold text-gray-400 tracking-wider">SECURE RAZORPAY PLATFORM</span>
                </div>

                {isProcessing ? (
                  <div className="py-8 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-gray-500">Completing secure checkout...</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleFinalizeRegistration("paid", "pay_rzp_comp_" + Math.random().toString(36).substr(2, 9))}
                    className="btn btn-primary w-full py-3.5 text-xs font-bold"
                  >
                    PAY ₹{registrationFee} & COMPLETE REGISTRATION
                  </button>
                )}
              </div>

              {!isProcessing && (
                <button onClick={() => setStep(4)} className="btn btn-secondary py-3 text-xs font-semibold">
                  Go Back
                </button>
              )}
            </div>
          )}

          {/* STEP 6: Success Screen */}
          {step === 6 && completedReg && (
            <div className="flex flex-col items-center gap-6 text-center py-4 print-area">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl">
                ✓
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-white font-primary">Registration Pending Approval!</h4>
                <p className="text-gray-400 text-xs mt-1">An SMTP notification email has been triggered. The admin will verify uploads shortly.</p>
              </div>

              {/* Printable Pass */}
              <div className="w-full border border-dashed border-gray-700 rounded-xl bg-gray-900/50 p-6 flex flex-col gap-4 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/5 rounded-bl-full"></div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-pink-400 font-bold">RECHARGE PARTICIPANT ID PASS</span>
                    <h5 className="font-extrabold text-white text-base leading-snug font-primary mt-1 line-clamp-1">{completedReg.competitionName}</h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] text-gray-500 block uppercase font-bold">PARTICIPANT ID</span>
                    <span className="font-mono text-xs font-bold text-white">{completedReg.participantId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs py-2 border-y border-[rgba(255,255,255,0.06)]">
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Name</span>
                    <span className="font-bold text-white line-clamp-1">{completedReg.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Competition Class</span>
                    <span className="font-bold text-pink-400">{completedReg.category}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Date & Venue</span>
                    <span className="font-bold text-gray-300">{completedReg.competitionDate}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-500 uppercase block">Verify Status</span>
                    <span className="font-bold text-yellow-500 uppercase text-[9px]">{completedReg.status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-2">
                  <div className="flex flex-col gap-1 text-[10px] text-gray-400">
                    <span>* Status approval update notification will arrive via SMS.</span>
                    <span>* Auditions timeline details are in Dashboard.</span>
                  </div>
                  {/* Styled Mock SVG QR Code */}
                  <div className="w-16 h-16 bg-white p-1.5 rounded flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                      <rect width="25" height="25" fill="black"/>
                      <rect x="75" width="25" height="25" fill="black"/>
                      <rect y="75" width="25" height="25" fill="black"/>
                      <rect x="35" y="35" width="30" height="30" fill="black"/>
                      <rect x="10" y="45" width="15" height="15" fill="black"/>
                      <rect x="45" y="10" width="15" height="15" fill="black"/>
                      <rect x="75" y="75" width="20" height="20" fill="black"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full mt-4">
                <button 
                  onClick={() => {
                    onClose();
                    router.push("/dashboard");
                  }}
                  className="btn btn-primary w-full py-3 text-xs font-bold"
                >
                  View in My Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
