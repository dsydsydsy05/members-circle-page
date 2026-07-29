/**
 * Ambient light field — slow drifting warm blooms behind everything,
 * plus a scroll-linked layer so the light shifts as the page moves.
 */
export function AmbientLight() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Scroll-linked wash: light slides and brightens as you travel down */}
      <div
        className="animate-light-scroll absolute -inset-[20%]"
        style={{
          background:
            "radial-gradient(58% 46% at 50% 6%, rgba(255,220,190,0.85), transparent 70%)," +
            "radial-gradient(52% 40% at 18% 30%, rgba(224,146,102,0.55), transparent 72%)",
          filter: "blur(60px)",
        }}
      />

      {/* Drifting blooms */}
      <div
        className="animate-drift-a absolute left-[8%] top-[-14%] h-[46rem] w-[46rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,205,165,0.70) 0%, rgba(214,134,92,0.30) 44%, transparent 74%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="animate-drift-b absolute right-[-8%] top-[6%] h-[38rem] w-[38rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(240,168,124,0.55) 0%, rgba(170,104,74,0.24) 48%, transparent 76%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="animate-drift-c absolute bottom-[-18%] left-[26%] h-[42rem] w-[42rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(205,128,92,0.42) 0%, rgba(110,70,52,0.20) 50%, transparent 78%)",
          filter: "blur(100px)",
        }}
      />

      {/* Fine grain so the gradients never band */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
