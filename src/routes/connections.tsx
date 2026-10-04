import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MemberPortalShell } from "@/components/light/LightMemberPortal";
import { ConnectionEmail, ReportButton } from "@/components/light/CommunityControls";
import { useAuth } from "@/lib/use-auth";
import {
  useConnections,
  useConnectionAction,
  communityRpc,
  type Connection,
} from "@/lib/community";
export const Route = createFileRoute("/connections")({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Manage private member introductions and mutual connections in The Room.",
      },
      { property: "og:title", content: "Connections · The Room" },
      {
        property: "og:description",
        content: "Manage private member introductions and mutual connections in The Room.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Connections · The Room" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConnectionsPage,
});
function ConnectionsPage() {
  const { userId, isMember, isSignedIn, loading } = useAuth();
  const query = useConnections();
  const act = useConnectionAction();
  const [tab, setTab] = useState<"received" | "sent" | "connected" | "blocked">("received"),
    [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  const blocks = useQuery({
    queryKey: ["member-blocks", userId],
    enabled: isMember,
    queryFn: () => communityRpc<{ id: string; name: string }[]>("room_connections", "blocks"),
  });
  const perform = async (
    action: string,
    payload: { id?: string; target?: string; consent?: boolean },
  ) => {
    setBusy(payload.id || payload.target || "");
    setError("");
    try {
      await act(action, payload);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  const rows = (query.data || []).filter((c) =>
    tab === "connected"
      ? c.status === "accepted"
      : tab === "received"
        ? c.recipient_id === userId && c.status !== "accepted"
        : c.sender_id === userId && c.status !== "accepted",
  );
  return (
    <MemberPortalShell className="room-community">
      <main className="room-workspace">
        <header className="room-workspace-head">
          <span className="room-kicker">Member space / Introductions</span>
          <h1>A reason to meet.</h1>
          <p>Your conversations start with a mutual introduction.</p>
        </header>
        {loading ? (
          <p>Loading…</p>
        ) : !isSignedIn ? (
          <Link to="/auth" search={{ mode: "signin", next: "/connections" }}>
            Sign in to view connections ↗
          </Link>
        ) : !isMember ? (
          <Link to="/waitlist">Connections are for members. Apply to join ↗</Link>
        ) : (
          <>
            <nav className="room-tabs" aria-label="Connection folders">
              {(["received", "sent", "connected", "blocked"] as const).map((t) => (
                <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
                  {t}
                  {t === "received"
                    ? ` (${(query.data || []).filter((c) => c.recipient_id === userId && c.status === "pending").length})`
                    : ""}
                </button>
              ))}
            </nav>
            {error && <p role="alert">{error}</p>}
            {query.error || blocks.error ? (
              <p role="alert">
                Connections could not be loaded.{" "}
                <button
                  onClick={() => {
                    query.refetch();
                    blocks.refetch();
                  }}
                >
                  Try again
                </button>
              </p>
            ) : query.isLoading ? (
              <p>Opening your connections…</p>
            ) : tab === "blocked" ? (
              <>
                {blocks.data?.length ? (
                  blocks.data.map((b) => (
                    <article className="room-connection" key={b.id}>
                      <h2>{b.name}</h2>
                      <button
                        disabled={busy === b.id}
                        onClick={() => perform("unblock", { target: b.id })}
                      >
                        Unblock
                      </button>
                      <small>Unblocking does not restore an earlier connection.</small>
                    </article>
                  ))
                ) : (
                  <p className="room-empty">No blocked members.</p>
                )}
              </>
            ) : rows.length ? (
              rows.map((c) => (
                <ConnectionRow
                  key={c.id}
                  connection={c}
                  userId={userId!}
                  busy={busy === c.id}
                  perform={perform}
                />
              ))
            ) : (
              <div className="room-empty">
                <p>
                  {tab === "connected"
                    ? "No connections yet. Start with someone’s story."
                    : "Nothing in this folder yet."}
                </p>
                <Link to="/members">Explore the directory ↗</Link>
              </div>
            )}
          </>
        )}
      </main>
    </MemberPortalShell>
  );
}
function ConnectionRow({
  connection: c,
  userId,
  busy,
  perform,
}: {
  connection: Connection;
  userId: string;
  busy: boolean;
  perform: (
    action: string,
    payload: { id?: string; target?: string; consent?: boolean },
  ) => Promise<void>;
}) {
  const [consent, setConsent] = useState(false);
  const other = c.sender_id === userId ? c.recipient_id : c.sender_id;
  return (
    <article className="room-connection">
      <div>
        <span className="room-kicker">
          {c.status} ·{" "}
          {new Date(c.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
        </span>
        <Link to="/member/$memberId" params={{ memberId: other }}>
          <h2>{c.name} ↗</h2>
        </Link>
        <p>{[c.position, c.startup].filter(Boolean).join(" · ")}</p>
        <blockquote>{c.reason}</blockquote>
        {c.status === "accepted" && <ConnectionEmail memberId={other} />}
      </div>
      <div className="room-connection-actions">
        {c.status === "pending" && c.recipient_id === userId && (
          <>
            <label className="room-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              Accept and exchange our chosen contact emails.
            </label>
            <Link to="/onboarding">Review my contact email ↗</Link>
            <button
              disabled={busy || !consent}
              onClick={() => perform("accept", { id: c.id, consent })}
            >
              Accept introduction
            </button>
            <button disabled={busy} onClick={() => perform("decline", { id: c.id })}>
              Decline
            </button>
          </>
        )}
        {c.status === "pending" && c.sender_id === userId && (
          <button disabled={busy} onClick={() => perform("withdraw", { id: c.id })}>
            Withdraw request
          </button>
        )}
        {c.status === "accepted" && (
          <button
            disabled={busy}
            onClick={() => {
              if (
                confirm(
                  "Disconnect? Email access in The Room will end. Copies already saved by either person cannot be recalled.",
                )
              )
                perform("disconnect", { id: c.id });
            }}
          >
            Disconnect
          </button>
        )}
        {c.status !== "blocked" && (
          <button
            disabled={busy}
            onClick={() => {
              if (confirm("Block this member and end any pending request or connection?"))
                perform("block", { target: other });
            }}
          >
            Block member
          </button>
        )}
        <ReportButton type="member" id={other} />
      </div>
    </article>
  );
}
