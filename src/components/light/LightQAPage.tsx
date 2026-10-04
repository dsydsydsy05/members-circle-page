import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUp, Reply, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { submitCommunityReply } from "@/lib/qa.functions";
import { LightPage } from "./LightSite";
import { ReportButton } from "./CommunityControls";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";

type Question = { id: string; body: string; created_at: string };
type Answer = {
  id: string;
  question_id: string;
  body: string;
  responder_name: string;
  responder_title: string | null;
  guest_id: string | null;
  created_at: string;
};
type CommunityReply = {
  id: string;
  question_id: string;
  body: string;
  author_name: string;
  created_at: string;
};
const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));

export function LightQAPage() {
  const { isSignedIn, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const sendReply = useServerFn(submitCommunityReply);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<Question | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["public-qa"],
    queryFn: async () => {
      const [questions, answers, replies] = await Promise.all([
        supabase
          .from("qa_questions")
          .select("id, body, created_at")
          .eq("status", "published")
          .eq("moderation_state", "passed")
          .order("created_at", { ascending: true }),
        supabase
          .from("qa_answers")
          .select("id, question_id, body, responder_name, responder_title, guest_id, created_at")
          .eq("status", "published")
          .order("created_at", { ascending: true }),
        supabase
          .from("qa_replies")
          .select("id, question_id, body, author_name, created_at")
          .eq("status", "published")
          .order("created_at", { ascending: true }),
      ]);
      if (questions.error || answers.error || replies.error)
        throw new Error("The conversation could not be loaded.");
      return {
        questions: questions.data as Question[],
        answers: answers.data as Answer[],
        replies: replies.data as CommunityReply[],
      };
    },
    refetchInterval: 15_000,
    retry: false,
  });
  const submit = async () => {
    if (!isSignedIn || busy || !body.trim()) return;
    setBusy(true);
    setErrorMessage(null);
    try {
      if (replyTo) {
        await sendReply({ data: { questionId: replyTo.id, body: body.trim() } });
      } else {
        const { error: sendError } = await supabase.functions.invoke("submit-question", {
          body: { body: body.trim() },
        });
        if (sendError) {
          const details = await sendError.context?.json?.().catch(() => null);
          throw new Error(details?.error || "Your question could not be sent. Please try again.");
        }
      }
      setBody("");
      setReplyTo(null);
      await queryClient.invalidateQueries({ queryKey: ["public-qa"] });
      textareaRef.current?.focus();
    } catch (cause) {
      setErrorMessage(
        cause instanceof Error
          ? cause.message
          : "Your message could not be sent. Please try again.",
      );
      throw cause;
    } finally {
      setBusy(false);
    }
  };
  const chooseReply = (question: Question) => {
    setReplyTo(question);
    setErrorMessage(null);
    textareaRef.current?.focus();
  };
  return (
    <LightPage className="room-chat-page">
      <main className="room-chat">
        <header className="room-chat__heading">
          <span className="room-chat__eyebrow">The Room / Community</span>
          <h1>Q&amp;A</h1>
        </header>
        <Conversation
          className="room-chat__conversation"
          aria-label="Community questions and replies"
        >
          <ConversationContent className="room-chat__feed">
            {isLoading ? (
              <p className="room-chat__empty" role="status">
                Opening the conversation…
              </p>
            ) : error ? (
              <div className="room-chat__empty" role="alert">
                <p>The conversation could not be loaded.</p>
                <Button
                  variant="outline"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["public-qa"] })}
                >
                  Try again
                </Button>
              </div>
            ) : !data?.questions.length ? (
              <p className="room-chat__empty">What’s on your mind?</p>
            ) : (
              data.questions.map((question) => {
                const responses = [
                  ...data.answers
                    .filter((answer) => answer.question_id === question.id)
                    .map((answer) => ({
                      ...answer,
                      name: answer.responder_name,
                      guestId: answer.guest_id,
                      title: answer.responder_title,
                      official: true,
                    })),
                  ...data.replies
                    .filter((reply) => reply.question_id === question.id)
                    .map((reply) => ({
                      ...reply,
                      name: reply.author_name,
                      guestId: null,
                      title: null,
                      official: false,
                    })),
                ].sort((a, b) => a.created_at.localeCompare(b.created_at));
                return (
                  <section
                    className="room-chat__thread"
                    key={question.id}
                    id={`question-${question.id}`}
                  >
                    <Message from="user" className="room-chat__question">
                      <div className="room-chat__meta">
                        <span>Anonymous</span>
                        <time dateTime={question.created_at}>{dateLabel(question.created_at)}</time>
                      </div>
                      <MessageContent className="room-chat__bubble">
                        <p>{question.body}</p>
                      </MessageContent>
                      <div className="room-chat__actions">
                        {isSignedIn ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => chooseReply(question)}
                            aria-label={`Reply to: ${question.body}`}
                          >
                            <Reply />
                            Reply
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" asChild>
                            <Link to="/auth" search={{ mode: "signin", next: "/qa" }}>
                              Sign in to reply
                            </Link>
                          </Button>
                        )}
                        <ReportButton type="question" id={question.id} />
                      </div>
                    </Message>
                    {responses.map((response) => (
                      <Message from="assistant" key={response.id} className="room-chat__reply">
                        <div className="room-chat__meta">
                          {response.guestId ? (
                            <Link to="/guest/$guestId" params={{ guestId: response.guestId }}>
                              {response.name} ↗
                            </Link>
                          ) : (
                            <strong>{response.name}</strong>
                          )}
                          <time dateTime={response.created_at}>
                            {dateLabel(response.created_at)}
                          </time>
                        </div>
                        {response.title ? (
                          <span className="room-chat__reply-title">{response.title}</span>
                        ) : null}
                        <MessageContent>
                          <MessageResponse>{response.body}</MessageResponse>
                        </MessageContent>
                        {response.official ? <ReportButton type="answer" id={response.id} /> : null}
                      </Message>
                    ))}
                  </section>
                );
              })
            )}
          </ConversationContent>
          <ConversationScrollButton aria-label="Latest questions" />
        </Conversation>
        <div className="room-chat__dock">
          {replyTo ? (
            <div className="room-chat__reply-target">
              <Reply className="size-4 shrink-0" />
              <span>{replyTo.body}</span>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Cancel reply"
                onClick={() => {
                  setReplyTo(null);
                  textareaRef.current?.focus();
                }}
              >
                <X />
              </Button>
            </div>
          ) : null}
          <PromptInput onSubmit={submit} className="room-chat__composer">
            <PromptInputTextarea
              ref={textareaRef}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={replyTo ? 2000 : 1000}
              minLength={replyTo ? 1 : 8}
              required
              disabled={!isSignedIn || busy}
              autoFocus={isSignedIn}
              aria-label={replyTo ? "Your reply" : "Your anonymous question"}
              placeholder={
                authLoading
                  ? "Opening…"
                  : !isSignedIn
                    ? "Sign in to join the conversation"
                    : replyTo
                      ? "Write a reply…"
                      : "Ask anonymously…"
              }
            />
            <PromptInputFooter className="room-chat__composer-footer">
              {isSignedIn ? (
                <span>{replyTo ? "Reply" : "Anonymous"}</span>
              ) : (
                <Button asChild variant="link" size="sm">
                  <Link to="/auth" search={{ mode: "signin", next: "/qa" }}>
                    Sign in ↗
                  </Link>
                </Button>
              )}
              <PromptInputSubmit
                status={busy ? "submitted" : "ready"}
                disabled={!isSignedIn || busy || body.trim().length < (replyTo ? 1 : 8)}
                aria-label={replyTo ? "Send reply" : "Send question"}
                title={replyTo ? "Send reply" : "Send question"}
              >
                {busy ? undefined : <ArrowUp />}
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
          {errorMessage ? (
            <p className="room-chat__error" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </main>
    </LightPage>
  );
}
