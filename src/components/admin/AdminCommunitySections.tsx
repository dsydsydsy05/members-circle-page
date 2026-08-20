import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/use-auth";

type WaitlistRow = Database["public"]["Tables"]["waitlist_entries"]["Row"];
type ModerationTerm = Database["public"]["Tables"]["moderation_terms"]["Row"];
type AdminQuestion = Database["public"]["Functions"]["admin_list_qa_questions"]["Returns"][number];
type Answer = Pick<
  Database["public"]["Tables"]["qa_answers"]["Row"],
  | "id"
  | "question_id"
  | "body"
  | "responder_type"
  | "responder_name"
  | "responder_title"
  | "responder_avatar_url"
  | "status"
  | "created_at"
  | "updated_at"
>;

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";
const buttonClass =
  "rounded-full border border-border px-4 py-2 text-xs transition-colors hover:bg-secondary disabled:opacity-40";

export function AdminQASection() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const [answering, setAnswering] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [responderType, setResponderType] = useState<"admin" | "guest">("guest");
  const [responderName, setResponderName] = useState("");
  const [responderTitle, setResponderTitle] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-qa"],
    queryFn: async () => {
      const [questionResult, answerResult] = await Promise.all([
        supabase.rpc("admin_list_qa_questions"),
        supabase
          .from("qa_answers")
          .select(
            "id, question_id, body, responder_type, responder_name, responder_title, responder_avatar_url, status, created_at, updated_at",
          )
          .order("created_at", { ascending: true }),
      ]);
      if (questionResult.error) throw questionResult.error;
      if (answerResult.error) throw answerResult.error;
      return {
        questions: (questionResult.data ?? []) as AdminQuestion[],
        answers: (answerResult.data ?? []) as Answer[],
      };
    },
    retry: false,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-qa"] });

  const softDeleteQuestion = async (question: AdminQuestion) => {
    if (!userId || !confirm("Remove this question from the public Q&A?")) return;
    const { error } = await supabase
      .from("qa_questions")
      .update({ status: "deleted", deleted_at: new Date().toISOString(), deleted_by: userId })
      .eq("id", question.id);
    if (error) return toast.error(error.message);
    toast.success("Question removed");
    refresh();
    queryClient.invalidateQueries({ queryKey: ["public-qa"] });
  };

  const softDeleteAnswer = async (answerId: string) => {
    if (!userId || !confirm("Remove this answer?")) return;
    const { error } = await supabase
      .from("qa_answers")
      .update({ status: "deleted", deleted_at: new Date().toISOString(), deleted_by: userId })
      .eq("id", answerId);
    if (error) return toast.error(error.message);
    toast.success("Answer removed");
    refresh();
    queryClient.invalidateQueries({ queryKey: ["public-qa"] });
  };

  const publishAnswer = async (questionId: string) => {
    if (!userId || !answer.trim() || !responderName.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("qa_answers").insert({
      question_id: questionId,
      body: answer.trim().slice(0, 4000),
      responder_type: responderType,
      responder_name: responderName.trim().slice(0, 120),
      responder_title: responderTitle.trim().slice(0, 160) || null,
      published_by: userId,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setAnswering(null);
    setAnswer("");
    setResponderName("");
    setResponderTitle("");
    toast.success("Answer published");
    refresh();
    queryClient.invalidateQueries({ queryKey: ["public-qa"] });
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Q&amp;A</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Authors are anonymous publicly. Their account email is visible only here for safety.
        </p>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
      {error ? (
        <p className="text-sm text-amber-700">
          Apply the local Q&amp;A migration before using this panel.
        </p>
      ) : null}
      <div className="divide-y divide-border border-y border-border">
        {data?.questions.map((question) => {
          const answers = data.answers.filter((item) => item.question_id === question.id);
          return (
            <article key={question.id} className="py-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {question.author_email ?? question.author_id} · {question.status}
                  </div>
                  <h3 className="mt-3 text-xl leading-snug">{question.body}</h3>
                </div>
                <div className="flex gap-2">
                  <button className={buttonClass} onClick={() => setAnswering(question.id)}>
                    Answer
                  </button>
                  {question.status !== "deleted" ? (
                    <button
                      className={`${buttonClass} text-destructive`}
                      onClick={() => softDeleteQuestion(question)}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>

              {answers.map((item) => (
                <div key={item.id} className="ml-auto mt-5 max-w-2xl border-l border-border pl-5">
                  <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>
                      {item.responder_type} / {item.responder_name}
                    </span>
                    {item.status !== "deleted" ? (
                      <button
                        onClick={() => softDeleteAnswer(item.id)}
                        className="text-destructive"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}

              {answering === question.id ? (
                <div className="ml-auto mt-6 grid max-w-2xl gap-3 border-t border-border pt-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      value={responderType}
                      onChange={(event) =>
                        setResponderType(event.target.value as "admin" | "guest")
                      }
                      className={inputClass}
                    >
                      <option value="guest">Guest answer</option>
                      <option value="admin">Admin answer</option>
                    </select>
                    <input
                      className={inputClass}
                      value={responderName}
                      onChange={(event) => setResponderName(event.target.value)}
                      placeholder={responderType === "guest" ? "Guest name" : "The Room"}
                    />
                  </div>
                  <input
                    className={inputClass}
                    value={responderTitle}
                    onChange={(event) => setResponderTitle(event.target.value)}
                    placeholder="Guest role / context (optional)"
                  />
                  <textarea
                    className={`${inputClass} min-h-32`}
                    value={answer}
                    onChange={(event) => setAnswer(event.target.value)}
                    maxLength={4000}
                    placeholder="Answer"
                  />
                  <div className="flex justify-end gap-2">
                    <button className={buttonClass} onClick={() => setAnswering(null)}>
                      Cancel
                    </button>
                    <button
                      className="rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground disabled:opacity-40"
                      disabled={busy || !answer.trim() || !responderName.trim()}
                      onClick={() => publishAnswer(question.id)}
                    >
                      {busy ? "Publishing…" : "Publish answer"}
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function AdminWaitlistSection() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"all" | WaitlistRow["status"]>("pending");
  const [busy, setBusy] = useState<string | null>(null);
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-waitlist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waitlist_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WaitlistRow[];
    },
    retry: false,
  });
  const rows = status === "all" ? data : data.filter((entry) => entry.status === status);

  const review = async (id: string, next: WaitlistRow["status"]) => {
    setBusy(id);
    const { data, error } = await supabase.functions.invoke("review-waitlist", {
      body: { entryId: id, status: next },
    });
    setBusy(null);
    if (error) return toast.error(error.message);
    if (data?.notificationSent === false) {
      toast.warning(
        `${next === "approved" ? "Application approved" : "Application rejected"}; applicant email failed.`,
      );
    } else {
      toast.success(
        `${next === "approved" ? "Application approved" : "Application rejected"}; applicant emailed.`,
      );
    }
    queryClient.invalidateQueries({ queryKey: ["admin-waitlist"] });
    queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Waitlist</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Approved applicants receive Member access now or when they later sign in with the same
            email.
          </p>
        </div>
        <select
          className={`${inputClass} w-auto`}
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
      {error ? (
        <p className="text-sm text-amber-700">Apply the local waitlist migration first.</p>
      ) : null}
      <div className="overflow-x-auto border-y border-border">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-3 text-left">Name</th>
              <th className="px-3 py-3 text-left">Email</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Admin notice</th>
              <th className="px-3 py-3 text-left">Decision email</th>
              <th className="px-3 py-3 text-left">Requested</th>
              <th className="px-3 py-3 text-right">Review</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((entry) => (
              <tr key={entry.id}>
                <td className="px-3 py-4 font-medium">{entry.full_name}</td>
                <td className="px-3 py-4 text-muted-foreground">{entry.email}</td>
                <td className="px-3 py-4 uppercase">{entry.status}</td>
                <td className="px-3 py-4">
                  <span
                    className={
                      entry.admin_notification_status === "failed"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }
                    title={entry.admin_notification_error ?? undefined}
                  >
                    {(entry.admin_notification_status ?? "pending").toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <span
                    className={
                      entry.decision_notification_status === "failed"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }
                    title={entry.decision_notification_error ?? undefined}
                  >
                    {(entry.decision_notification_status ?? "pending").toUpperCase()}
                    {entry.decision_notified_for
                      ? ` / ${entry.decision_notified_for.toUpperCase()}`
                      : ""}
                  </span>
                </td>
                <td className="px-3 py-4 text-muted-foreground">
                  {new Date(entry.created_at).toLocaleDateString()}
                </td>
                <td className="px-3 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      disabled={busy === entry.id}
                      className={buttonClass}
                      onClick={() => review(entry.id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      disabled={busy === entry.id}
                      className={buttonClass}
                      onClick={() => review(entry.id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AdminModerationSection() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const [term, setTerm] = useState("");
  const [language, setLanguage] = useState<ModerationTerm["language"]>("en");
  const [category, setCategory] = useState<ModerationTerm["category"]>("gambling");
  const [effect, setEffect] = useState<ModerationTerm["effect"]>("block");
  const [syncing, setSyncing] = useState(false);
  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-moderation-terms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("moderation_terms")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ModerationTerm[];
    },
    retry: false,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-moderation-terms"] });

  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!term.trim()) return;
    const { error } = await supabase.from("moderation_terms").insert({
      term: term.trim(),
      language,
      category,
      effect,
      match_mode: language === "en" && !term.includes(" ") ? "word" : "phrase",
      severity: effect === "block" ? 4 : 1,
      source: "The Room custom",
      created_by: userId,
    });
    if (error) return toast.error(error.message);
    setTerm("");
    toast.success("Moderation rule added");
    refresh();
  };

  const toggle = async (row: ModerationTerm) => {
    const { error } = await supabase
      .from("moderation_terms")
      .update({ active: !row.active })
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this moderation rule?")) return;
    const { error } = await supabase.from("moderation_terms").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const syncDomains = async () => {
    setSyncing(true);
    const { data, error } = await supabase.functions.invoke("sync-moderation-domains");
    setSyncing(false);
    if (error) return toast.error(error.message);
    const counts = data?.counts as Record<string, number> | undefined;
    toast.success(
      counts
        ? `Domain snapshot synced: ${counts.gambling ?? 0} gambling, ${counts.sexual ?? 0} sexual`
        : "Domain snapshot synchronized",
    );
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Moderation</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Add project-specific block or allow rules. The licensed English sexual list stays in the
            server function.
          </p>
        </div>
        <button type="button" className={buttonClass} disabled={syncing} onClick={syncDomains}>
          {syncing ? "Syncing domain snapshot…" : "Sync domain snapshot"}
        </button>
      </div>
      <form
        onSubmit={add}
        className="grid gap-3 border-y border-border py-5 sm:grid-cols-[1fr_auto_auto_auto_auto]"
      >
        <input
          className={inputClass}
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Term or phrase"
        />
        <select
          className={inputClass}
          value={language}
          onChange={(event) => setLanguage(event.target.value as typeof language)}
        >
          <option value="en">English</option>
          <option value="zh">Chinese</option>
          <option value="any">Any</option>
        </select>
        <select
          className={inputClass}
          value={category}
          onChange={(event) => setCategory(event.target.value as typeof category)}
        >
          <option value="gambling">Gambling</option>
          <option value="sexual">Sexual</option>
          <option value="other">Other</option>
        </select>
        <select
          className={inputClass}
          value={effect}
          onChange={(event) => setEffect(event.target.value as typeof effect)}
        >
          <option value="block">Block</option>
          <option value="allow">Allow</option>
        </select>
        <button className="rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground">
          Add rule
        </button>
      </form>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
      {error ? (
        <p className="text-sm text-amber-700">Apply the local moderation migration first.</p>
      ) : null}
      <div className="divide-y divide-border border-b border-border">
        {data.map((row) => (
          <div
            key={row.id}
            className="grid items-center gap-3 py-3 text-sm sm:grid-cols-[1fr_90px_100px_90px_auto]"
          >
            <span className="font-medium">{row.term}</span>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">
              {row.language}
            </span>
            <span className="font-mono text-[10px] uppercase text-muted-foreground">
              {row.category}
            </span>
            <span className="font-mono text-[10px] uppercase">{row.effect}</span>
            <div className="flex justify-end gap-2">
              <button className={buttonClass} onClick={() => toggle(row)}>
                {row.active ? "Active" : "Paused"}
              </button>
              <button className={`${buttonClass} text-destructive`} onClick={() => remove(row.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
