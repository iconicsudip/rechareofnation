export default function TermsConditionsPage() {
  return (
    <div className="container py-20 md:py-24 flex flex-col gap-10 max-w-4xl text-left">
      <div>
        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Legal Documentation</span>
        <h1 className="text-4xl font-black mt-1 font-primary text-white">Terms & Conditions</h1>
        <p className="text-gray-500 text-xs mt-2">Last Updated: July 14, 2026</p>
      </div>

      <div className="glass-panel p-8 md:p-10 rounded-2xl border-[rgba(255,255,255,0.06)] flex flex-col gap-6 text-sm text-gray-300 leading-relaxed font-secondary">
        <p>
          By accessing the Recharge Nation website and booking tickets or registering for competitions, you agree to comply with and be bound by the following Terms & Conditions.
        </p>

        <h3 className="text-lg font-bold text-white font-primary mt-4">1. Ticket Booking Regulations</h3>
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li>Audience passes booked online are non-refundable and non-transferable unless explicitly stated by the event managers.</li>
          <li>Each visitor pass displays a unique reference code and QR symbol which is scanned for validation at the venue gates. Re-entry is subject to wristband checks.</li>
          <li>Student discount passes are only valid upon physical presentation of current school/college identification cards at the verification desk.</li>
        </ul>

        <h3 className="text-lg font-bold text-white font-primary mt-4">2. Competition Registrations</h3>
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li>Participants must supply accurate date of birth, age-classification, and emergency contacts. False information triggers immediate disqualification without fee refunds.</li>
          <li>All uploaded files (photographs, Aadhaar IDs, performance audios, portfolios) are vetted by the jury. Jury decisions are final and binding.</li>
          <li>Submitting a participant form does not provide entrance passes for parents or guardians unless tickets are separately booked.</li>
        </ul>

        <h3 className="text-lg font-bold text-white font-primary mt-4">3. Online Payment Integrity</h3>
        <p>
          Payments are handled via secure integration with Razorpay. Any transaction disputes, refund queries, or wallet failures must be directed to payments@rechargenation.in along with merchant payment reference details.
        </p>

        <h3 className="text-lg font-bold text-white font-primary mt-4">4. Code of Conduct</h3>
        <p>
          Recharge Nation reserves the right to deny entry or revoke passes for individuals behaving disruptively or breaching security protocols at the physical venues.
        </p>

        <h3 className="text-lg font-bold text-white font-primary mt-4">5. Amendments</h3>
        <p>
          We reserve the right to modify schedules, venue locations, pricing tiers, and guidelines at our discretion. Registrants will be notified via email or dashboard announcements.
        </p>
      </div>
    </div>
  );
}
