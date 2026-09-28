import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { communityRpc, type Answer, type Approval } from "@/lib/community";
import { useGuests } from "@/lib/use-site-content";
const input = "w-full border border-border rounded-lg bg-background p-3 text-sm";
const button = "rounded-full border border-border px-4 py-2 text-xs disabled:opacity-40";
export function AdminAnswerDesk() {
  const qc = useQueryClient(),
    guests = useGuests();
  const query = useQuery({
    queryKey: ["admin-answer-desk"],
    queryFn: async () => {
      const [desk, questions] = await Promise.all([
        communityRpc<{ answers: Answer[]; approvals: Approval[] }>("room_qa_admin", "list"),
        supabase.rpc("admin_list_qa_questions"),
      ]);
      if (questions.error) throw questions.error;
      return { ...desk, questions: questions.data || [] };
    },
  });
  const [editing, setEditing] = useState<Partial<Answer> | null>(null),
    [body, setBody] = useState(""),
    [guest, setGuest] = useState(""),
    [type, setType] = useState("guest"),
    [busy, setBusy] = useState(false),
    [link, setLink] = useState("");
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-answer-desk"] });
    qc.invalidateQueries({ queryKey: ["public-qa"] });
    qc.invalidateQueries({ queryKey: ["guest-answers"] });
  };
  const act = async (action: string, id: string) => {
    setBusy(true);
    try {
      const r = await communityRpc<{ token?: string }>("room_qa_admin", action, { id });
      if (r.token) setLink(`${window.location.origin}/guest-review#token=${r.token}`);
      else setLink("");
      refresh();
      toast.success(
        action === "invite"
          ? "Private review link created. Share it with the named guest."
          : "Answer updated",
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const edit = (answer: Partial<Answer>) => {
    setEditing(answer);
    setBody(answer.body || "");
    setGuest(answer.guest_id || "");
    setType(answer.responder_type || "guest");
    setLink("");
  };
  return (
    <section className="space-y-5">
      <h2 className="text-xl">Q&amp;A / Answer desk</h2>
      <p className="text-sm text-muted-foreground">
        Guest answers need approval of the exact version. Links last seven days. Share them only
        with the named guest; creating a link does not send a message.
      </p>
      {query.isLoading ? (
        <p>Loading…</p>
      ) : query.error ? (
        <p role="alert">{query.error.message}</p>
      ) : (
        query.data?.questions.map((q) => (
          <article key={q.id} className="border-t border-border py-5 space-y-4">
            <small>
              {q.author_email} · {q.status} · visible to administrators only
            </small>
            <h3 className="text-xl">{q.body}</h3>
            <div className="flex gap-3">
              <button className={button} onClick={() => edit({ question_id: q.id })}>
                Draft answer
              </button>
              {q.status !== "deleted" && (
                <button
                  className={button}
                  onClick={async () => {
                    if (!confirm("Hide this question and its answers from public view?")) return;
                    const { error } = await supabase
                      .from("qa_questions")
                      .update({ status: "deleted" })
                      .eq("id", q.id);
                    if (error) toast.error(error.message);
                    else refresh();
                  }}
                >
                  Hide question
                </button>
              )}
            </div>
            {query.data.answers
              .filter((a) => a.question_id === q.id)
              .map((a) => {
                const approvals = query.data.approvals.filter(
                  (p) => p.answer_id === a.id && p.version === a.version,
                );
                const approved = approvals.some((p) => p.status === "approved");
                return (
                  <div key={a.id} className="ml-4 border-l border-border pl-4 space-y-3">
                    <small>
                      {a.responder_name} · v{a.version} · {a.status}
                    </small>
                    <p className="whitespace-pre-wrap">{a.body}</p>
                    {approvals.map((p) => (
                      <p key={p.id} className="text-xs">
                        {p.status} ·{" "}
                        {p.decided_at
                          ? new Date(p.decided_at).toLocaleString()
                          : `Expires ${new Date(p.expires_at).toLocaleString()}`}
                      </p>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      <button className={button} onClick={() => edit(a)}>
                        Edit draft
                      </button>
                      {a.responder_type === "guest" && (
                        <>
                          <button
                            className={button}
                            disabled={busy || !a.guest_id}
                            onClick={() => act("invite", a.id)}
                          >
                            Create review link
                          </button>
                          <button
                            className={button}
                            disabled={busy}
                            onClick={() => act("revoke", a.id)}
                          >
                            Revoke approval / unpublish
                          </button>
                        </>
                      )}
                      <button
                        className={button}
                        disabled={
                          busy ||
                          a.status === "published" ||
                          (a.responder_type === "guest" && !approved)
                        }
                        onClick={() => act("publish", a.id)}
                      >
                        Publish approved answer
                      </button>
                      <button
                        className={button}
                        disabled={busy}
                        onClick={() => act("delete", a.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
          </article>
        ))
      )}
      {editing && (
        <form
          className="border border-border p-5 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await communityRpc("room_qa_admin", "save", {
                ...(editing.id ? { id: editing.id } : {}),
                question_id: editing.question_id!,
                body,
                responder_type: type,
                guest_id: type === "guest" ? guest : null,
              });
              setEditing(null);
              refresh();
              toast.success("Draft saved. Guest changes require a new approval.");
            } catch (e) {
              toast.error((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h3>Answer draft</h3>
          <label>
            Answer as
            <select className={input} value={type} onChange={(e) => setType(e.target.value)}>
              <option value="guest">Invited guest</option>
              <option value="admin">The Room team</option>
            </select>
          </label>
          {type === "guest" && (
            <label>
              Guest profile
              <select
                required
                className={input}
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
              >
                <option value="">Choose a guest</option>
                {guests.data?.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Exact answer
            <textarea
              required
              maxLength={4000}
              className={`${input} min-h-40`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <button className={button} disabled={busy}>
            Save draft
          </button>{" "}
          <button type="button" className={button} onClick={() => setEditing(null)}>
            Cancel
          </button>
        </form>
      )}
      {link && (
        <div className="border border-border p-4 space-y-2">
          <label>
            Private review link
            <input className={input} readOnly value={link} onFocus={(e) => e.target.select()} />
          </label>
          <button
            className={button}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                toast.success("Copied");
              } catch {
                toast.error("Select and copy the link above.");
              }
            }}
          >
            Copy private link
          </button>
        </div>
      )}
    </section>
  );
}
export function AdminCommunitySafety() {
  const qc = useQueryClient();
  type Report = {
    id: string;
    reporter_id: string;
    target_type: string;
    target_id: string;
    reason: string;
    status: string;
  };
  type Notice = {
    id: string;
    kind: string;
    status: string;
    error: string | null;
    attempts: number;
  };
  const query = useQuery({
    queryKey: ["community-safety"],
    queryFn: () =>
      communityRpc<{ reports: Report[]; notifications: Notice[] }>("room_moderation_admin", "list"),
  });
  const [busy, setBusy] = useState("");
  return (
    <section className="mt-12 space-y-4">
      <h2 className="text-xl">Reports &amp; email delivery</h2>
      {query.error && <p role="alert">{query.error.message}</p>}
      {query.data?.reports.map((r) => (
        <article key={r.id} className="border-t border-border py-4 space-y-2">
          <small>
            {r.target_type} · {r.status}
          </small>
          <p>{r.reason}</p>
          <a href={r.target_type === "member" ? `/member/${r.target_id}` : "/qa"}>
            Review content ↗
          </a>
          <p className="text-xs">Target: {r.target_id}</p>
          {r.status === "open" && (
            <div className="flex gap-2">
              {["resolved", "dismissed"].map((status) => (
                <button
                  key={status}
                  className={button}
                  disabled={busy === r.id}
                  onClick={async () => {
                    setBusy(r.id);
                    try {
                      await communityRpc("room_moderation_admin", "resolve", { id: r.id, status });
                      qc.invalidateQueries({ queryKey: ["community-safety"] });
                    } catch (e) {
                      toast.error((e as Error).message);
                    } finally {
                      setBusy("");
                    }
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </article>
      ))}
      {query.data?.notifications.map((n) => (
        <article key={n.id} className="border-t border-border py-4">
          <p>
            {n.kind} · {n.status} · attempts {n.attempts}
          </p>
          <small>{n.error}</small>
          <button
            className={button}
            disabled={busy === n.id}
            onClick={async () => {
              setBusy(n.id);
              try {
                const { data, error } = await supabase.functions.invoke("community-notify", {
                  body: { id: n.id },
                });
                if (error) throw error;
                if (data?.error) throw new Error(data.error);
                toast.success("Delivery checked");
              } catch (e) {
                toast.error((e as Error).message);
              } finally {
                setBusy("");
                qc.invalidateQueries({ queryKey: ["community-safety"] });
              }
            }}
          >
            Retry email
          </button>
        </article>
      ))}
    </section>
  );
}
