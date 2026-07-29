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
            "radial-gradient(58% 46% at 50% 6%, rgba(255,214,178,0.42), transparent 70%)," +
            "radial-gradient(52% 40% at 18% 30%, rgba(214,132,92,0.30), transparent 72%)",
          filter: "blur(60px)",
        }}
      />

      {/* Drifting blooms */}
      <div
        className="animate-drift-a absolute left-[8%] top-[-14%] h-[46rem] w-[46rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(247,186,142,0.34) 0%, rgba(200,120,80,0.16) 44%, transparent 74%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="animate-drift-b absolute right-[-8%] top-[6%] h-[38rem] w-[38rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(223,146,104,0.28) 0%, rgba(150,90,64,0.14) 48%, transparent 76%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="animate-drift-c absolute bottom-[-18%] left-[26%] h-[42rem] w-[42rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(180,108,78,0.22) 0%, rgba(90,58,44,0.12) 50%, transparent 78%)",
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
