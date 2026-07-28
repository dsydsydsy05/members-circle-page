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
          className="h-auto w-full object-contain drop-shadow-[0_28px_42px_rgb(0_0_0/0.34)]"
        />
      </div>
    </div>
  );
}