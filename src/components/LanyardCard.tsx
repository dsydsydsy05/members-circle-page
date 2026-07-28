import badgeRender from "@/assets/the-room-realistic-badge.png";

export function LanyardCard() {
  return (
    <div className="pointer-events-none select-none">
      <div className="animate-real-badge-float relative w-[min(72vw,22rem)] sm:w-[min(42vw,28rem)]">
        <img
          src={badgeRender}
          alt="The Room floating neon green member badge"
          width={1024}
          height={1408}
          decoding="async"
          fetchPriority="high"
          className="realistic-badge-shadow h-auto w-full object-contain"
        />
      </div>
    </div>
  );
}