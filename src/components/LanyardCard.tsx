import badgeRender from "@/assets/the-room-badge.png";

export function LanyardCard() {
  return (
    <div className="pointer-events-none select-none">
      <div className="animate-real-badge-float relative w-[min(64vw,18rem)] sm:w-[min(34vw,22rem)]">
        <img
          src={badgeRender}
          alt="The Room member badge"
          width={561}
          height={1025}
          decoding="async"
          fetchPriority="high"
          className="realistic-badge-shadow h-auto w-full object-contain"
        />
      </div>
    </div>
  );
}
