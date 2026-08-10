import { Link } from "@tanstack/react-router";
import { DoorSignal } from "@/components/BrandMark";
import type { GuestRow } from "@/lib/use-site-content";

export function ConversationsSection({ guests }: { guests: GuestRow[] }) {
  const realGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase() !== "coming soon" && !guest.title.toLowerCase().includes("tba"),
  );
  const guest = realGuests[0];
  return (
    <section className="conversations-section page-section" aria-labelledby="conversation-title">
      <div className="page-shell conversation-frame reveal-in">
        <div className="conversation-frame__copy">
          <div className="eyebrow">06 / Conversations</div>
          <div>
            <h2 id="conversation-title" className="editorial-title">
              {guest ? guest.name : "People walk through the door."}
            </h2>
            <p>
              {guest
                ? `${guest.title}. Invited for ${guest.event}.`
                : "Guests are invited into The Room for a specific conversation. Member and guest identities remain distinct; verified conversations will appear here after they happen."}
            </p>
            <Link to="/guests" className="text-link mt-8">
              Conversations ↗
            </Link>
          </div>
        </div>
        <div className="conversation-frame__door">
          <DoorSignal />
        </div>
      </div>
    </section>
  );
}
