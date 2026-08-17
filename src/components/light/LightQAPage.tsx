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
            "id, question_id, body, responder_name, responder_title, responder_type, created_at",
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
          copy="Questions are anonymous in public. Answers come from guests and The Room team."
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
                <Link className="light-button light-button--small" to="/auth">
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
              <span>Open questions</span>
              <strong>{String(data?.questions.length ?? 0).padStart(3, "0")}</strong>
            </header>
            {isLoading ? (
              <p className="light-qa-empty">Opening the archive…</p>
            ) : error ? (
              <p className="light-qa-empty">
                Q&amp;A is prepared locally and will open after its database migration is applied.
              </p>
            ) : !data?.questions.length ? (
              <p className="light-qa-empty">No questions yet. The first one can be yours.</p>
            ) : (
              <ol className="light-qa-list">
                {data.questions.map((question, index) => {
                  const answers = answersByQuestion.get(question.id) ?? [];
                  return (
                    <li key={question.id}>
                      <article className="light-qa-question">
                        <div className="light-qa-question__meta">
                          <span>Q / {String(index + 1).padStart(2, "0")}</span>
                          <time>{friendlyDate(question.created_at)}</time>
                        </div>
                        <h3>{question.body}</h3>
                        <span className="light-qa-question__author">Anonymous member</span>
                      </article>
                      {answers.length ? (
                        <div className="light-qa-answers">
                          {answers.map((answer) => (
                            <article key={answer.id}>
                              <div className="light-qa-answer__byline">
                                <span>A / {answer.responder_type}</span>
                                <strong>{answer.responder_name}</strong>
                                {answer.responder_title ? <em>{answer.responder_title}</em> : null}
                              </div>
                              <p>{answer.body}</p>
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
