import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import type { Member } from "@/lib/community-data";

function memberNo(value?: number | null) {
  return value == null ? "—" : String(value).padStart(3, "0");
}

function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function groupOf(name: string) {
  const value = name.trim().charAt(0).toUpperCase();
  return /^[A-Z]$/.test(value) ? value : "#";
}

function originFrom(element: HTMLElement | SVGElement) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 - window.innerWidth / 2,
    y: rect.top + rect.height / 2 - window.innerHeight / 2,
    scale: Math.max(0.18, Math.min(0.55, rect.width / 760)),
  };
}

type Origin = { x: number; y: number; scale: number };

export function LightMemberDossier({
  member,
  open,
  origin,
  onClose,
  returnFocus,
}: {
  member: Member | null;
  open: boolean;
  origin: Origin;
  onClose: () => void;
  returnFocus: HTMLElement | SVGElement | null;
}) {
  const [mounted, setMounted] = useState(open);
  const [entered, setEntered] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const first = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEntered(true);
          dialogRef.current?.focus();
        });
      });
      return () => {
        cancelAnimationFrame(first);
        document.body.style.overflow = previousOverflow;
      };
    }
    setEntered(false);
    const timeout = window.setTimeout(() => {
      setMounted(false);
      returnFocus?.focus();
    }, 620);
    return () => window.clearTimeout(timeout);
  }, [open, returnFocus]);

  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const controls = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose]);

  if (!mounted || !member) return null;

  return createPortal(
    <div
      className={`light-dossier-overlay ${entered ? "light-dossier-overlay--open" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="light-dossier"
        role="dialog"
        aria-modal="true"
        aria-label={`${member.name} member file`}
        tabIndex={-1}
        style={
          {
            "--dossier-from-x": `${origin.x}px`,
            "--dossier-from-y": `${origin.y}px`,
            "--dossier-from-scale": origin.scale,
          } as CSSProperties
        }
      >
        <svg className="light-dossier__folder-tab" viewBox="0 0 820 56" aria-hidden="true">
          <path d="M 0 56 L 0 44 L 286 44 Q 300 44 306 32 L 318 9 Q 323 0 337 0 L 650 0 Q 664 0 669 9 L 681 32 Q 687 44 701 44 L 820 44 L 820 56 Z" />
          <text x="340" y="29">
            {memberNo(member.memberNo)}
          </text>
          <text x="646" y="29" textAnchor="end">
            {member.name}
          </text>
        </svg>
        <div className="light-dossier__sheet">
          <button type="button" className="light-dossier__close" onClick={onClose}>
            Close <span>×</span>
          </button>
          <div className="light-dossier__mast">
            <span>The Room / Member file</span>
            <span>Extracted from archive</span>
          </div>
          <div className="light-dossier__identity">
            <div className="light-dossier__portrait">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt={member.name} />
              ) : (
                <span>{member.initials}</span>
              )}
            </div>
            <div>
              <p className="light-dossier__annotation">Verified member / Boston archive</p>
              <h2>{member.name}</h2>
              <p className="light-dossier__role">{member.role}</p>
              {member.city ? <p className="light-dossier__school">{member.city}</p> : null}
            </div>
          </div>
          <div className="light-dossier__body">
            <div>
              <span>About</span>
              <p>{member.bio || "This member is still writing their note for the archive."}</p>
            </div>
            <div>
              <span>Working on</span>
              <div className="light-dossier__tags">
                {member.tags.length ? (
                  member.tags.map((tag) => <b key={tag}>{tag}</b>)
                ) : (
                  <b>In progress</b>
                )}
              </div>
            </div>
          </div>
          <div className="light-dossier__foot">
            <span>Filed / {new Date().getFullYear()}</span>
            {member.website ? (
              <a href={normalizeUrl(member.website)} target="_blank" rel="noreferrer">
                Visit member site ↗
              </a>
            ) : (
              <span>Private contact</span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function useDossier() {
  const [member, setMember] = useState<Member | null>(null);
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<Origin>({ x: 0, y: 80, scale: 0.4 });
  const [returnFocus, setReturnFocus] = useState<HTMLElement | SVGElement | null>(null);

  const show = (selected: Member, event: MouseEvent<HTMLElement | SVGElement>) => {
    setOrigin(originFrom(event.currentTarget));
    setReturnFocus(event.currentTarget);
    setMember(selected);
    setOpen(true);
  };

  return { member, open, origin, returnFocus, show, close: () => setOpen(false) };
}

const archiveConfig = {
  width: 980,
  height: 651,
  stackTop: 38,
  folderGap: 32,
  folderHeight: 64,
  baseLeft: 132,
  baseRight: 848,
  perspective: 1.45,
  tabHeight: 31,
  tabWidth: 210,
  tabRadius: 10,
  strokeWidth: 1.25,
  hoverOffset: 112,
  previewCeiling: 118,
  activeFolderHeight: 178,
} as const;

type ArchiveFolder = {
  key: string;
  number: string;
  title: string;
  tabX: number;
  tabWidth: number;
  member?: Member;
  category?: { label: string; count: string };
};

function previewLine(value: string, max = 38) {
  const clean = value.trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

function archiveFolderPath(
  leftX: number,
  rightX: number,
  tabX: number,
  tabWidth: number,
  folderHeight: number,
) {
  const { tabHeight, tabRadius } = archiveConfig;
  const tabRight = tabX + tabWidth;
  return [
    `M ${leftX} ${tabHeight}`,
    `L ${tabX - tabRadius} ${tabHeight}`,
    `Q ${tabX - 3} ${tabHeight} ${tabX + 1} ${tabHeight - 9}`,
    `L ${tabX + 7} ${tabRadius}`,
    `Q ${tabX + 10} 0 ${tabX + 20} 0`,
    `L ${tabRight - 20} 0`,
    `Q ${tabRight - 10} 0 ${tabRight - 7} ${tabRadius}`,
    `L ${tabRight - 1} ${tabHeight - 9}`,
    `Q ${tabRight + 3} ${tabHeight} ${tabRight + tabRadius} ${tabHeight}`,
    `L ${rightX} ${tabHeight}`,
    `Q ${rightX + 6} ${tabHeight} ${rightX + 6} ${tabHeight + 7}`,
    `L ${rightX + 3} ${folderHeight}`,
    `L ${leftX - 3} ${folderHeight}`,
    `L ${leftX - 6} ${tabHeight + 7}`,
    `Q ${leftX - 6} ${tabHeight} ${leftX} ${tabHeight}`,
    "Z",
  ].join(" ");
}

function ArchiveFolderDetails({
  folder,
  leftX,
  rightX,
}: {
  folder: ArchiveFolder;
  leftX: number;
  rightX: number;
}) {
  const member = folder.member;
  if (!member) return null;

  const portraitX = leftX + 62;
  const portraitY = 91;
  const copyX = leftX + 116;
  const clipId = `archive-paper-${member.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const workingOn = member.tags.length
    ? member.tags.slice(0, 2).join(" / ")
    : member.bio || "In progress";

  return (
    <g className="light-archive-folder__details" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <circle cx={portraitX} cy={portraitY} r="36" />
        </clipPath>
      </defs>
      <path className="light-archive-folder__details-rule" d={`M ${copyX} 48 H ${rightX - 28}`} />
      <circle
        className="light-archive-folder__details-portrait-base"
        cx={portraitX}
        cy={portraitY}
        r="36"
      />
      {member.avatarUrl ? (
        <image
          href={member.avatarUrl}
          x={portraitX - 36}
          y={portraitY - 36}
          width="72"
          height="72"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      ) : (
        <text
          className="light-archive-folder__details-initials"
          x={portraitX}
          y={portraitY + 9}
          textAnchor="middle"
        >
          {member.initials}
        </text>
      )}
      <circle
        className="light-archive-folder__details-portrait-line"
        cx={portraitX}
        cy={portraitY}
        r="36"
      />
      <text className="light-archive-folder__details-name" x={copyX} y="82">
        {previewLine(member.name, 27)}
      </text>
      <text className="light-archive-folder__details-role" x={copyX} y="104">
        {previewLine([member.role, member.city].filter(Boolean).join(" · "), 46)}
      </text>
      <text className="light-archive-folder__details-label" x={copyX} y="130">
        WORKING / {previewLine(workingOn, 41)}
      </text>
      <text className="light-archive-folder__details-hint" x={rightX - 28} y="151" textAnchor="end">
        CLICK TO OPEN ↗
      </text>
    </g>
  );
}

function ArchiveFolderShape({
  folder,
  index,
  onOpen,
}: {
  folder: ArchiveFolder;
  index: number;
  onOpen?: (event: MouseEvent<SVGGElement>) => void;
}) {
  const leftX = archiveConfig.baseLeft - index * archiveConfig.perspective;
  const rightX = archiveConfig.baseRight + index * archiveConfig.perspective;
  const y = archiveConfig.stackTop + index * archiveConfig.folderGap;
  const path = archiveFolderPath(
    leftX,
    rightX,
    folder.tabX,
    folder.tabWidth,
    folder.member ? archiveConfig.activeFolderHeight : archiveConfig.folderHeight,
  );
  const restingHitPath = archiveFolderPath(
    leftX,
    rightX,
    folder.tabX,
    folder.tabWidth,
    archiveConfig.folderHeight,
  );

  return (
    <g
      className={`light-archive-folder ${folder.member ? "light-archive-folder--active" : ""}`}
      style={{ "--archive-y": `${y}px` } as CSSProperties}
      tabIndex={folder.member ? 0 : undefined}
      role={folder.member ? "button" : undefined}
      aria-label={folder.member ? `Open file for ${folder.member.name}` : undefined}
      onClick={onOpen}
      onKeyDown={
        folder.member
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.currentTarget.dispatchEvent(new MouseEvent("click", { bubbles: true }));
              }
            }
          : undefined
      }
    >
      <g className="light-archive-folder__paper">
        <path className="light-archive-folder__shape" d={path} />
        <text className="light-archive-folder__number" x={folder.tabX + 18} y={21}>
          {folder.number}
        </text>
        <text
          className="light-archive-folder__title"
          x={folder.tabX + folder.tabWidth - 18}
          y={21}
          textAnchor="end"
        >
          {folder.title}
        </text>
        <ArchiveFolderDetails folder={folder} leftX={leftX} rightX={rightX} />
      </g>
      {folder.member ? <path className="light-archive-folder__hit" d={restingHitPath} /> : null}
    </g>
  );
}

function ArchiveCategoryTab({
  index,
  label,
  count,
  x,
}: {
  index: number;
  label: string;
  count: string;
  x: number;
}) {
  const y = archiveConfig.stackTop + index * archiveConfig.folderGap;
  return (
    <g className="light-archive-category" transform={`translate(${x} ${y})`} aria-hidden="true">
      <path d="M 0 29 L 12 4 Q 14 0 21 0 L 143 0 Q 150 0 153 6 L 165 29 Z" />
      <text x="23" y="20">
        {label}
      </text>
      <text x="143" y="20" textAnchor="end">
        {count}
      </text>
    </g>
  );
}

function ArchiveFrontPanel({
  variant,
  memberCount,
}: {
  variant: "public" | "directory";
  memberCount: number;
}) {
  return (
    <g className="light-archive-front" transform="translate(70 510)">
      <path aria-hidden="true" d="M 0 0 L 840 0 L 826 18 L 14 18 Z" />
      <path aria-hidden="true" d="M 14 18 L 826 18 L 792 91 L 48 91 Z" />
      <path
        aria-hidden="true"
        className="light-archive-front__label"
        d="M 306 44 L 534 44 L 520 76 L 320 76 Z"
      />
      {variant === "public" ? (
        <Link
          className="light-archive-front__link"
          to="/light/members"
          aria-label="View more members"
        >
          <text x="419.5" y="66" textAnchor="middle">
            VIEW MORE MEMBERS
          </text>
        </Link>
      ) : (
        <text className="light-archive-front__directory-label" x="419.5" y="65" textAnchor="middle">
          MEMBER DIRECTORY / {String(memberCount).padStart(3, "0")} FILES
        </text>
      )}
    </g>
  );
}

export function LightArchiveIndex({
  members,
  variant = "public",
  preserveOrder = false,
}: {
  members: Member[];
  variant?: "public" | "directory";
  preserveOrder?: boolean;
}) {
  const dossier = useDossier();
  const folders = useMemo<ArchiveFolder[]>(() => {
    const sorted = preserveOrder
      ? [...members]
      : [...members].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
    const count = 13;
    return Array.from({ length: count }, (_, index) => {
      const member = index < sorted.length ? sorted[index] : undefined;
      const placeholderIndex = index - sorted.length;
      const category =
        placeholderIndex === 1
          ? { label: "M", count: String(members.length).padStart(3, "0") }
          : placeholderIndex === 4
            ? { label: "X", count: String(count - sorted.length).padStart(3, "0") }
            : undefined;
      const title = member?.name || "XXX";
      const tabWidth = 188 + (index % 3) * 16;
      const lanes = [430, 598, 304, 516, 382, 626];
      const tabX = Math.min(lanes[index % lanes.length], archiveConfig.baseRight - tabWidth - 16);
      return {
        key: member?.id || `archive-placeholder-${index}`,
        member,
        title,
        tabX,
        tabWidth,
        category,
        number: member ? memberNo(member.memberNo) : "000",
      };
    });
  }, [members, preserveOrder]);

  return (
    <>
      <div
        className={`light-archive-index ${variant === "directory" ? "light-archive-index--directory" : ""}`}
      >
        <svg
          viewBox={`0 -${archiveConfig.previewCeiling} ${archiveConfig.width} ${archiveConfig.height + archiveConfig.previewCeiling}`}
          role="group"
          aria-label={`${members.length} member files in ${variant === "directory" ? "the private member directory" : "The Room public archive"}`}
          style={
            {
              "--archive-hover-offset": `${archiveConfig.hoverOffset}px`,
              "--archive-stroke-width": archiveConfig.strokeWidth,
            } as CSSProperties
          }
        >
          <path className="light-archive-index__back" d="M 126 57 L 854 57 L 874 506 L 106 506 Z" />
          {folders.map((folder, index) => {
            return (
              <g key={folder.key}>
                <ArchiveFolderShape
                  folder={folder}
                  index={index}
                  onOpen={
                    folder.member ? (event) => dossier.show(folder.member!, event) : undefined
                  }
                />
                {folder.category ? (
                  <ArchiveCategoryTab
                    index={index}
                    label={folder.category.label}
                    count={folder.category.count}
                    x={155}
                  />
                ) : null}
              </g>
            );
          })}
          <ArchiveFrontPanel variant={variant} memberCount={members.length} />
        </svg>
      </div>
      <LightMemberDossier
        member={dossier.member}
        open={dossier.open}
        origin={dossier.origin}
        onClose={dossier.close}
        returnFocus={dossier.returnFocus}
      />
    </>
  );
}

export function LightFeaturedMembers({ members }: { members: Member[] }) {
  const dossier = useDossier();

  return (
    <>
      <div className="light-featured-members">
        {members.map((member, index) => (
          <button
            key={member.id}
            type="button"
            className="light-member-study"
            style={{ "--member-delay": `${index * 90}ms` } as CSSProperties}
            onClick={(event) => dossier.show(member, event)}
          >
            <span className="light-member-study__index">/{String(index + 1).padStart(2, "0")}</span>
            <span className="light-member-study__portrait">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt="" />
              ) : (
                <span>{member.initials}</span>
              )}
            </span>
            <span className="light-member-study__notes" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="light-member-study__copy">
              <strong>{member.name}</strong>
              <small>{member.role}</small>
              <em>No. {memberNo(member.memberNo)}</em>
            </span>
          </button>
        ))}
      </div>
      <LightMemberDossier
        member={dossier.member}
        open={dossier.open}
        origin={dossier.origin}
        onClose={dossier.close}
        returnFocus={dossier.returnFocus}
      />
    </>
  );
}

export function LightFeaturedFolders({ members }: { members: Member[] }) {
  const dossier = useDossier();

  return (
    <>
      <div className="light-home-files">
        <div className="light-home-files__rail" aria-hidden="true" />
        {members.map((member, index) => (
          <button
            key={member.id}
            type="button"
            className="light-home-file"
            style={
              {
                "--folder-tab": `${tabOffsets[index % tabOffsets.length]}%`,
                "--home-file-index": index,
              } as CSSProperties
            }
            onClick={(event) => dossier.show(member, event)}
          >
            <span className="light-home-file__tab">
              <strong>{member.name}</strong>
              <small>{memberNo(member.memberNo)}</small>
            </span>
            <span className="light-home-file__body">
              <span>{member.role}</span>
              <span>{member.city || "The Room"}</span>
              <b>Open file ↗</b>
            </span>
          </button>
        ))}
        <div className="light-home-files__base">
          <span>The Room / Selected members</span>
          <span>{String(members.length).padStart(2, "0")} files</span>
        </div>
      </div>
      <LightMemberDossier
        member={dossier.member}
        open={dossier.open}
        origin={dossier.origin}
        onClose={dossier.close}
        returnFocus={dossier.returnFocus}
      />
    </>
  );
}

const tabOffsets = [4, 30, 56, 16, 44, 68, 8, 36];

export function LightMemberDirectory({ members }: { members: Member[] }) {
  const dossier = useDossier();
  const sorted = useMemo(
    () => [...members].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" })),
    [members],
  );
  let previousGroup = "";

  return (
    <>
      <div className="light-file-cabinet">
        <div className="light-file-cabinet__rail" aria-hidden="true" />
        {sorted.map((member, index) => {
          const group = groupOf(member.name);
          const showGroup = group !== previousGroup;
          previousGroup = group;
          return (
            <div key={member.id} className="light-folder-wrap">
              {showGroup ? (
                <div className="light-folder-group">
                  {group}
                  <span>Index</span>
                </div>
              ) : null}
              <button
                type="button"
                className="light-folder"
                style={
                  { "--folder-tab": `${tabOffsets[index % tabOffsets.length]}%` } as CSSProperties
                }
                onClick={(event) => dossier.show(member, event)}
              >
                <span className="light-folder__tab">
                  <strong>{member.name}</strong>
                  <small>{memberNo(member.memberNo)}</small>
                </span>
                <span className="light-folder__line" />
                <span className="light-folder__meta">
                  <span>{member.role}</span>
                  <span>{member.city || "The Room"}</span>
                  <b>Open file ↗</b>
                </span>
              </button>
            </div>
          );
        })}
        <div className="light-file-cabinet__base">
          <span>The Room / Members</span>
          <span>{String(sorted.length).padStart(3, "0")} files</span>
        </div>
      </div>
      <LightMemberDossier
        member={dossier.member}
        open={dossier.open}
        origin={dossier.origin}
        onClose={dossier.close}
        returnFocus={dossier.returnFocus}
      />
    </>
  );
}
