export default function PrivacyPolicyPage() {
  return (
    <div className="container py-20 md:py-24 flex flex-col gap-10 max-w-4xl text-left">
      <div>
        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Legal Documentation</span>
        <h1 className="text-4xl font-black mt-1 font-primary text-white">Privacy Policy</h1>
        <p className="text-gray-500 text-xs mt-2">Last Updated: July 14, 2026</p>
      </div>

      <div className="glass-panel p-8 md:p-10 rounded-2xl border-[rgba(255,255,255,0.06)] flex flex-col gap-6 text-sm text-gray-300 leading-relaxed font-secondary">
        <p>
          Welcome to Recharge Nation. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share information when you visit our website or book tickets and register for competitions.
        </p>

        <h3 className="text-lg font-bold text-white font-primary mt-4">1. Information We Collect</h3>
        <p>
          When you use our services, we may collect:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li><strong>Visitor Details:</strong> Full Name, Email Address, Mobile Number, City, State, Special Requests.</li>
          <li><strong>Participant Details:</strong> Photograph, Government ID, Performance Video, Portfolio, Certificates, Emergency Contact, and Institution Details.</li>
          <li><strong>Payment Details:</strong> Transaction IDs and methods processed via Razorpay. We do not store card credentials directly.</li>
        </ul>

        <h3 className="text-lg font-bold text-white font-primary mt-4">2. How We Use Information</h3>
        <p>
          We use the collected information to:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li>Process ticket bookings and competition registrations.</li>
          <li>Send booking confirmations and QR entry passes via simulated SMTP mail servers.</li>
          <li>Verify participant details and school/college credentials for audition classifications.</li>
          <li>Improve website speed and customize layout aesthetics.</li>
        </ul>

        <h3 className="text-lg font-bold text-white font-primary mt-4">3. Data Security</h3>
        <p>
          We implement SSL certification, protected client endpoints, and secure local storage encryption to shield your user profile and booking history from malicious access.
        </p>

        <h3 className="text-lg font-bold text-white font-primary mt-4">4. Third-Party Integrations</h3>
        <p>
          Our platform integrates third-party services like Razorpay payment widgets, Google Maps embeds, and Google Analytics tracking tags. These services abide by their respective privacy regulations.
        </p>

        <h3 className="text-lg font-bold text-white font-primary mt-4">5. Contact Us</h3>
        <p>
          For privacy inquiries, please mail support@rechargenation.in.
        </p>
      </div>
    </div>
  );
}
