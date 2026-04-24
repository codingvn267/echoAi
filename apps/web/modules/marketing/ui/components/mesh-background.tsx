// Pure-CSS animated mesh background — no JS, SSR-friendly, low cost.
// Renders three large soft "blobs" that drift slowly behind the hero.
export function MeshBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Top grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(125,211,228,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(125,211,228,0.08)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      {/* Soft glowing blobs */}
      <div
        className="absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full opacity-40 blur-3xl animate-blob"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, #7dd3e4 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute top-20 right-[-10rem] h-[36rem] w-[36rem] rounded-full opacity-30 blur-3xl animate-blob"
        style={{
          animationDelay: "-6s",
          background:
            "radial-gradient(circle at 70% 30%, #a78bfa 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute bottom-[-12rem] left-1/3 h-[44rem] w-[44rem] rounded-full opacity-30 blur-3xl animate-blob"
        style={{
          animationDelay: "-12s",
          background:
            "radial-gradient(circle at 50% 50%, #f472b6 0%, transparent 60%)",
        }}
      />

      {/* Subtle vignette to keep text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/0 to-background" />

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%      { transform: translate(40px, -30px) scale(1.05); }
          50%      { transform: translate(-30px, 30px) scale(0.97); }
          75%      { transform: translate(20px, 40px) scale(1.03); }
        }
        .animate-blob {
          animation: blob 24s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-blob { animation: none; }
        }
      `}</style>
    </div>
  );
}
