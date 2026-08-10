import { Link } from "@tanstack/react-router";
import { MemberFlipCard } from "@/components/MemberFlipCard";
import type { Member } from "@/lib/community-data";

export function PeopleSection({ members }: { members: Member[] }) {
  if (!members.length) return null;
  return (
    <section className="people-section page-section" aria-labelledby="people-title">
      <div className="page-shell">
        <div className="people-head">
          <div>
            <div className="eyebrow">05 / Members</div>
            <h2 id="people-title" className="section-title mt-8">
              People in the room.
            </h2>
          </div>
          <Link to="/members" className="text-link">
            Meet the members ↗
          </Link>
        </div>
        <div className="member-grid reveal-in">
          {members.slice(0, 3).map((member) => (
            <MemberFlipCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
