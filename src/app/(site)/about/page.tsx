export default function AboutPage() {
  return (
    <div className="container py-20 md:py-24 flex flex-col gap-12 max-w-4xl">
      {/* Header */}
      <div className="text-center flex flex-col gap-3">
        <span className="text-sm font-semibold uppercase tracking-widest text-cyan-400">Recharge Nation</span>
        <h1 className="text-4xl md:text-5xl font-black font-primary text-white">About Our Platform</h1>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto">
          Providing a premium digital gateway for discovering high-energy cultural, business, and entertainment events across metropolitan India.
        </p>
      </div>

      {/* Intro Block */}
      <div className="glass-panel p-8 md:p-10 rounded-2xl border-indigo-500/10 flex flex-col gap-6 leading-relaxed text-sm text-gray-300">
        <p>
          Founded in 2024, <strong>Recharge Nation</strong> has grown to become India's leading event integration platform. We connect student bodies, professional artists, corporate sponsors, and local communities through customized, premium-tier event management interfaces.
        </p>
        <p>
          Whether you are a college student looking to battle in nationwide dance cups, a startup founder pitching to venture capitalists at trade expos, or a family seeking weekends at street food festivals, Recharge Nation delivers a premium, secure user experience.
        </p>
      </div>

      {/* Milestones grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        {[
          { title: "50+", desc: "Premium Events Hosted" },
          { title: "250K+", desc: "Tickets Booked Successfully" },
          { title: "10K+", desc: "Registered Competitors" }
        ].map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-xl border-[rgba(255,255,255,0.06)] flex flex-col gap-2">
            <span className="text-3xl font-black text-cyan-400 font-primary">{stat.title}</span>
            <span className="text-xs text-gray-500 font-semibold uppercase">{stat.desc}</span>
          </div>
        ))}
      </div>

      {/* Core Values */}
      <div className="flex flex-col gap-6 mt-4">
        <h3 className="text-2xl font-bold text-white font-primary">Our Core Values</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {[
            { title: "Premium Visual Experience", desc: "Every component is crafted to provide a premium modern aesthetic, ensuring a seamless user flow." },
            { title: "Secure Transactions", desc: "Integrate trusted gateways like Razorpay to support cards, UPI, net banking, and wallets." },
            { title: "Verification Standards", desc: "Verify registrations, credentials, and uploads to keep auditions and expos high quality." },
            { title: "SMTP Automation", desc: "Instant automated receipt deliveries, QR pass generation, and SMS notifications." }
          ].map((val, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-xl border-[rgba(255,255,255,0.04)] flex flex-col gap-2 bg-slate-900/10">
              <h4 className="font-bold text-white text-sm font-primary">{val.title}</h4>
              <p className="text-gray-400 text-xs leading-normal">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
