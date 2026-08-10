import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Member } from "@/lib/community-data";

const memberNo = (value?: number | null) => (value ? String(value).padStart(3, "0") : "—");

function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function MemberFlipCard({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="directory-card"
        onClick={() => setOpen(true)}
        aria-label={`View ${member.name}'s member profile`}
      >
        <div className="directory-card__top">
          <span>Member / {memberNo(member.memberNo)}</span>
          <span>Access file ↗</span>
        </div>
        <div className="directory-card__portrait">
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt="" loading="lazy" decoding="async" />
          ) : (
            <div className="directory-card__initials" aria-hidden="true">
              {member.initials}
            </div>
          )}
        </div>
        <div className="directory-card__identity">
          <strong>{member.name}</strong>
          <span>
            {member.role || "Member"}
            {member.city ? ` / ${member.city}` : ""}
          </span>
        </div>
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] grid place-items-center bg-black/90 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`member-${member.id}`}
            onMouseDown={(event) => event.currentTarget === event.target && setOpen(false)}
          >
            <article className="relative max-h-[90svh] w-full max-w-2xl overflow-y-auto bg-[var(--paper-bright)] p-6 text-[var(--ink)] shadow-2xl sm:p-10">
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-5 top-5 grid h-11 w-11 place-items-center border border-black/20 text-lg transition-colors hover:bg-black hover:text-white"
                aria-label="Close member profile"
              >
                ×
              </button>
              <div className="flex items-center justify-between border-b border-black/20 pb-4 pr-16 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/50">
                <span>The Room / Member file</span>
                <span>No. {memberNo(member.memberNo)}</span>
              </div>
              <div className="mt-8 grid gap-8 sm:grid-cols-[160px_1fr]">
                <div className="aspect-square overflow-hidden bg-black/5">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="h-full w-full object-cover grayscale"
                    />
                  ) : (
                    <div className="grid h-full place-items-center font-editorial text-6xl text-black/35">
                      {member.initials}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--signal)]">
                    Member identity
                  </div>
                  <h2
                    id={`member-${member.id}`}
                    className="mt-3 text-5xl font-medium leading-[.9] tracking-[-.06em] sm:text-6xl"
                  >
                    {member.name}
                  </h2>
                  <p className="mt-4 text-sm uppercase tracking-[.1em] text-black/55">
                    {member.role || "Member"}
                    {member.city ? ` / ${member.city}` : ""}
                  </p>
                </div>
              </div>
              <div className="mt-10 grid gap-8 border-t border-black/20 pt-6 sm:grid-cols-[1fr_2fr]">
                <div className="text-[10px] font-semibold uppercase tracking-[.18em] text-black/45">
                  What they're building
                </div>
                <div>
                  {member.bio ? (
                    <p className="font-editorial text-2xl leading-snug">{member.bio}</p>
                  ) : (
                    <p className="text-sm text-black/45">
                      Profile details have not been added yet.
                    </p>
                  )}
                  {member.tags.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[.14em] text-black/55">
                      {member.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-8 flex flex-wrap gap-6">
                    <a
                      href={`/member/${member.id}`}
                      className="inline-flex border-b border-black pb-1 text-xs font-semibold uppercase tracking-[.12em] hover:text-[var(--signal)]"
                    >
                      Permanent profile ↗
                    </a>
                    {member.website && (
                      <a
                        href={normalizeUrl(member.website)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex border-b border-black pb-1 text-xs font-semibold uppercase tracking-[.12em] hover:text-[var(--signal)]"
                      >
                        Visit website ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </div>,
          document.body,
        )}
    </>
  );
}
