// Decorative, non-interactive backdrop for every public page: slow-turning mandala
// rings, a jali lattice, drifting aurora glows and floating gold dust. It sits on a
// fixed layer *behind* the page content (main/footer sit above it), so it shows in
// open page space while cards and text stay crisp. A radial mask fades it behind the
// central reading column, keeping the ornaments to the page edges. Motion is transform-only (compositor friendly) and is switched
// off globally for visitors who prefer reduced motion.

function Mandala({ stroke }: { stroke: string }) {
  const petals = Array.from({ length: 24 }, (_, i) => i * 15);
  const diamonds = Array.from({ length: 12 }, (_, i) => i * 30);
  const beads = Array.from({ length: 48 }, (_, i) => i * 7.5);
  return (
    <svg viewBox="0 0 400 400" fill="none" stroke={stroke} strokeWidth="1.25" className="w-full h-full">
      {[190, 172, 122, 84, 44].map((r) => (
        <circle key={r} cx="200" cy="200" r={r} />
      ))}
      {petals.map((a) => (
        <path key={a} d="M200 30 Q214 82 200 124 Q186 82 200 30Z" transform={`rotate(${a} 200 200)`} />
      ))}
      {diamonds.map((a) => (
        <path key={a} d="M200 132 L211 152 L200 172 L189 152Z" transform={`rotate(${a} 200 200)`} />
      ))}
      {beads.map((a) => (
        <circle key={a} cx="200" cy="22" r="1.6" fill={stroke} stroke="none" transform={`rotate(${a} 200 200)`} />
      ))}
    </svg>
  );
}

// Deterministic positions so server and client markup always match.
const DUST = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  size: 3 + (i % 4),
  delay: `${(i * 1.3) % 9}s`,
  duration: `${14 + (i % 5) * 4}s`,
}));

export default function LuxeBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none [mask-image:radial-gradient(ellipse_58%_92%_at_50%_50%,rgba(0,0,0,0.42),black_80%)]"
    >
      {/* Aurora glows */}
      <div className="luxe-aurora absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] bg-[radial-gradient(circle,rgba(197,155,39,0.42),transparent_65%)]" />
      <div className="luxe-aurora-b absolute -bottom-1/3 -right-1/4 w-[75vw] h-[75vw] max-w-[1000px] max-h-[1000px] bg-[radial-gradient(circle,rgba(123,17,35,0.26),transparent_65%)]" />

      {/* Mandala rings (partly off-screen, turning in opposite directions) */}
      <div className="luxe-spin absolute -top-44 -right-44 w-[560px] h-[560px] opacity-[0.8]">
        <Mandala stroke="#C59B27" />
      </div>
      <div className="luxe-spin-rev absolute -bottom-56 -left-56 w-[700px] h-[700px] opacity-[0.55]">
        <Mandala stroke="#7B1123" />
      </div>

      <div className="luxe-spin-rev absolute top-[48%] -right-40 w-[380px] h-[380px] opacity-[0.6]">
        <Mandala stroke="#B8892A" />
      </div>

      {/* Jali lattice wash fading in from the left edge */}
      <div className="absolute inset-y-0 left-0 w-[34vw] opacity-[0.3] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22 viewBox=%220 0 48 48%22><path d=%22M24 2 L46 24 L24 46 L2 24Z M24 12 L36 24 L24 36 L12 24Z%22 fill=%22none%22 stroke=%22%23C59B27%22 stroke-width=%220.8%22/></svg>')] [mask-image:linear-gradient(to_right,black,transparent)]" />

      {/* Floating gold dust */}
      {DUST.map((d, i) => (
        <span
          key={i}
          className="luxe-dust absolute rounded-full bg-[#B8892A] shadow-[0_0_8px_2px_rgba(229,192,91,0.7)]"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size, animationDelay: d.delay, animationDuration: d.duration }}
        />
      ))}
    </div>
  );
}
