import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { reportContent, useConnections, useConnectionAction } from "@/lib/community";

export function ReportButton({ type, id }: { type: "question" | "answer" | "member"; id: string }) {
  const { isSignedIn } = useAuth();
  const [open, setOpen] = useState(false),
    [reason, setReason] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  if (!isSignedIn) return null;
  return (
    <div className="room-report">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        Report
      </button>
      {open && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await reportContent(type, id, reason);
              setMessage("Report received. The Room team will review it.");
              setOpen(false);
              setReason("");
            } catch (e) {
              setMessage((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            What should we review?
            <textarea
              required
              minLength={8}
              maxLength={1000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button disabled={busy}>{busy ? "Sending…" : "Send report"}</button>
        </form>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  );
}
export function ConnectionEmail({ memberId }: { memberId: string }) {
  const { userId } = useAuth();
  const [show, setShow] = useState(false),
    [copied, setCopied] = useState(false);
  const { data, error, isFetching } = useQuery({
    queryKey: ["connection-email", userId, memberId],
    enabled: show,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("reveal_member_contact_email", {
        _profile_id: memberId,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 0,
    refetchInterval: 15_000,
    retry: false,
  });
  return (
    <div className="room-email">
      {!show ? (
        <button onClick={() => setShow(true)}>View contact email ↗</button>
      ) : error ? (
        <p role="status">Contact access is unavailable. Refresh your connections.</p>
      ) : data ? (
        <>
          <a href={`mailto:${data}`}>Write email ↗</a>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(data);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? "Copied" : "Copy email"}
          </button>
          <span>{data}</span>
          <small>Opens your email app. No email has been sent by The Room.</small>
        </>
      ) : (
        <p>{isFetching ? "Loading…" : "No contact email is available."}</p>
      )}
    </div>
  );
}
export function ConnectControl({ memberId }: { memberId: string }) {
  const { userId, isSignedIn, isMember } = useAuth();
  const { data: connections = [], isLoading, error } = useConnections();
  const action = useConnectionAction();
  const [open, setOpen] = useState(false),
    [reason, setReason] = useState(""),
    [consent, setConsent] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  if (userId === memberId) return <Link to="/onboarding">Edit my pass ↗</Link>;
  if (!isSignedIn)
    return (
      <a href={`/auth?mode=signin&next=${encodeURIComponent(`/member/${memberId}`)}`}>
        Sign in to connect ↗
      </a>
    );
  if (!isMember) return <Link to="/waitlist">Become a member to connect ↗</Link>;
  const current = connections.find(
    (c) =>
      [c.sender_id, c.recipient_id].includes(memberId) &&
      ["pending", "accepted"].includes(c.status),
  );
  if (error)
    return <p role="status">Connections are temporarily unavailable. Please try again later.</p>;
  if (isLoading) return <p>Checking connection…</p>;
  if (current?.status === "accepted")
    return (
      <>
        <span>Connected</span>
        <ConnectionEmail memberId={memberId} />
        <Link to="/connections">Manage connection ↗</Link>
      </>
    );
  if (current)
    return (
      <Link to="/connections">
        {current.sender_id === userId
          ? "Request sent · view status"
          : "Connection request received · review"}{" "}
        ↗
      </Link>
    );
  return (
    <div className="room-connect">
      <button onClick={() => setOpen(!open)} aria-expanded={open}>
        Connect ↗
      </button>
      {open && (
        <form
          className="room-paper-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMessage("");
            try {
              await action("request", { target: memberId, reason, consent });
              setOpen(false);
              setReason("");
              setConsent(false);
            } catch (e) {
              setMessage((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            A reason to meet
            <textarea
              required
              minLength={8}
              maxLength={500}
              placeholder="What would you like to talk about?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <label className="room-consent">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            If accepted, we will both see the contact emails we have chosen to share.
          </label>
          <p>
            Use a contact email you are comfortable sharing.{" "}
            <Link to="/onboarding">Manage it in My pass ↗</Link>
          </p>
          <button disabled={busy || !consent}>
            {busy ? "Sending…" : "Send connection request ↗"}
          </button>
        </form>
      )}
      {message && <p role="alert">{message}</p>}
    </div>
  );
}
