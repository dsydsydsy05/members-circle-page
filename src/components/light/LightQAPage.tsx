import { ReportButton } from "./CommunityControls";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { LightPage, LightPageHero } from "@/components/light/LightSite";

type QuestionRow = {
  id: string;
  body: string;
  created_at: string;
};

type AnswerRow = {
  id: string;
  question_id: string;
  body: string;
  responder_name: string;
  responder_title: string | null;
  responder_avatar_url: string | null;
  guest_id: string | null;
  responder_type: "admin" | "guest";
  created_at: string;
};

function friendlyDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function LightQAPage() {
  const queryClient = useQueryClient();
  const { isSignedIn, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState<"all" | "answered" | "waiting">("all");
  const [body, setBody] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-qa"],
    queryFn: async () => {
      const [questionResult, answerResult] = await Promise.all([
        supabase
          .from("qa_questions")
          .select("id, body, created_at")
          .eq("status", "published")
          .eq("moderation_state", "passed")
          .order("created_at", { ascending: false }),
        supabase
          .from("qa_answers")
          .select(
            "id, question_id, body, responder_name, responder_title, responder_type, responder_avatar_url, guest_id, created_at",
          )
          .eq("status", "published")
          .order("created_at", { ascending: true }),
      ]);
      if (questionResult.error) throw questionResult.error;
      if (answerResult.error) throw answerResult.error;
      return {
        questions: (questionResult.data ?? []) as QuestionRow[],
        answers: (answerResult.data ?? []) as AnswerRow[],
      };
    },
    retry: false,
  });

  const answersByQuestion = useMemo(() => {
    const grouped = new Map<string, AnswerRow[]>();
    for (const answer of data?.answers ?? []) {
      grouped.set(answer.question_id, [...(grouped.get(answer.question_id) ?? []), answer]);
    }
    return grouped;
  }, [data?.answers]);

  const visibleQuestions = (data?.questions ?? []).filter(
    (question) =>
      filter === "all" ||
      (filter === "answered"
        ? !!answersByQuestion.get(question.id)?.length
        : !answersByQuestion.get(question.id)?.length),
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSignedIn || busy) return;
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.functions.invoke("submit-question", { body: { body } });
    setBusy(false);
    if (error) {
      const detail = await error.context?.json?.().catch(() => null);
      setMessage(detail?.error ?? error.message ?? "The question could not be sent.");
      return;
    }
    setBody("");
    setComposerOpen(false);
    setMessage("Your anonymous question is now in the room.");
    await queryClient.invalidateQueries({ queryKey: ["public-qa"] });
  };

  return (
    <LightPage className="light-public-page light-qa-page">
      <main>
        <LightPageHero
          index="05"
          eyebrow="Questions / Answers"
          title="Ask what matters."
          copy="Anonymous questions. Thoughtful answers, shared with permission."
          tools={
            <div className="light-qa-hero-action">
              {authLoading ? (
                <button className="light-button light-button--small" type="button" disabled>
                  Checking…
                </button>
              ) : isSignedIn ? (
                <button
                  className="light-button light-button--small"
                  type="button"
                  aria-expanded={composerOpen}
                  aria-controls="qa-composer"
                  onClick={() => setComposerOpen((open) => !open)}
                >
                  {composerOpen ? "Close question" : "Ask a question ↗"}
                </button>
              ) : (
                <Link
                  className="light-button light-button--small"
                  to="/auth"
                  search={{ mode: "signin", next: "/qa" }}
                >
                  Sign in to ask ↗
                </Link>
              )}
              {message ? (
                <span className="light-qa-hero-message" role="status">
                  {message}
                </span>
              ) : null}
            </div>
          }
        />

        {isSignedIn && composerOpen ? (
          <section id="qa-composer" className="light-qa-composer is-open">
            <div className="light-shell light-qa-composer__grid">
              <div>
                <span className="light-qa-label">Anonymous line / Open</span>
                <h2>What do you need to know?</h2>
              </div>
              <form onSubmit={submit}>
                <p>
                  Your name is hidden from the public. The Room team can access your account for
                  moderation.
                </p>
                <label htmlFor="qa-question">Your question</label>
                <textarea
                  id="qa-question"
                  value={body}
                  onChange={(event) => setBody(event.target.value.slice(0, 1000))}
                  minLength={8}
                  maxLength={1000}
                  required
                  placeholder="Ask anonymously…"
                />
                <div className="light-qa-composer__foot">
                  <span>{body.length} / 1000</span>
                  <button type="submit" disabled={busy || body.trim().length < 8}>
                    {busy ? "Checking…" : "Send anonymously ↗"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        ) : null}

        <section className="light-qa-index">
          <div className="light-shell">
            <header className="light-qa-index__head">
              <nav className="room-tabs" aria-label="Question filters">
                {(["all", "waiting", "answered"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                  >
                    {value === "waiting"
                      ? "Awaiting answers"
                      : value === "answered"
                        ? "Answered"
                        : "All questions"}
                  </button>
                ))}
              </nav>
              <strong>{String(data?.questions.length ?? 0).padStart(3, "0")}</strong>
            </header>
            {isLoading ? (
              <p className="light-qa-empty">Opening the archive…</p>
            ) : error ? (
              <p className="light-qa-empty">
                Q&amp;A is prepared locally and will open after its database migration is applied.
              </p>
            ) : !visibleQuestions.length ? (
              <p className="light-qa-empty">
                {filter === "all"
                  ? "No questions yet. The first one can be yours."
                  : "No questions in this view yet."}
              </p>
            ) : (
              <ol className="light-qa-list">
                {visibleQuestions.map((question, index) => {
                  const answers = answersByQuestion.get(question.id) ?? [];
                  return (
                    <li key={question.id} id={`question-${question.id}`}>
                      <article className="light-qa-question">
                        <div className="light-qa-question__meta">
                          <span>Q / {String(index + 1).padStart(2, "0")}</span>
                          <time>{friendlyDate(question.created_at)}</time>
                        </div>
                        <h3>{question.body}</h3>
                        <span className="light-qa-question__author">Anonymous participant</span>
                        <ReportButton type="question" id={question.id} />
                      </article>
                      {answers.length ? (
                        <div className="light-qa-answers">
                          {answers.map((answer) => (
                            <article key={answer.id}>
                              <div className="light-qa-answer__byline">
                                <span>A / {answer.responder_type}</span>
                                {answer.guest_id ? (
                                  <Link
                                    to="/guest/$guestId"
                                    params={{ guestId: answer.guest_id }}
                                    className="room-answer-person"
                                  >
                                    {answer.responder_avatar_url ? (
                                      <img src={answer.responder_avatar_url} alt="" />
                                    ) : (
                                      <span className="room-avatar">
                                        {answer.responder_name.slice(0, 1)}
                                      </span>
                                    )}
                                    <strong>{answer.responder_name} ↗</strong>
                                  </Link>
                                ) : (
                                  <strong>{answer.responder_name}</strong>
                                )}
                                {answer.responder_title ? <em>{answer.responder_title}</em> : null}
                              </div>
                              <p>{answer.body}</p>
                              <ReportButton type="answer" id={answer.id} />
                            </article>
                          ))}
                        </div>
                      ) : (
                        <p className="light-qa-awaiting">Awaiting an answer.</p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </section>
      </main>
    </LightPage>
  );
}
