import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LightSiteFooter, LightSiteNav } from "@/components/light/LightSite";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/challenge")({
  head: () => ({
    meta: [
      { title: "The Ultimate Entrepreneurial Challenge · The Room" },
      {
        name: "description",
        content: "Apply to play The Ultimate Entrepreneurial Challenge, hosted by The Room in Boston.",
      },
      { property: "og:title", content: "The Ultimate Entrepreneurial Challenge" },
      { property: "og:description", content: "One challenge. The boldest founders. Apply to play." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChallengePage,
});

const STAGES = [
  { n: "01", title: "Apply", body: "Tell us who you are and why you want in." },
  { n: "02", title: "Get selected", body: "We pick a small, sharp field of players." },
  { n: "03", title: "Play", body: "Compete live. Build, pitch, survive the rounds." },
];

function ChallengePage() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = root.current?.querySelectorAll("[data-reveal]") ?? [];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.2 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const onMove = (event: React.PointerEvent<HTMLElement>) => {
    const r = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${((event.clientX - r.left) / r.width) * 100}%`);
    event.currentTarget.style.setProperty("--my", `${((event.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <div className="theme-light">
      <div className="uec" ref={root}>
        <LightSiteNav />
        <section className="uec-hero" onPointerMove={onMove}>
          <div className="uec-hero__glow" aria-hidden="true" />
          <p className="uec-kicker">The Room presents · Boston 2026</p>
          <h1 className="uec-title">
            {["The Ultimate", "Entrepreneurial", "Challenge"].map((line, i) => (
              <span key={line} className="uec-line" style={{ "--i": i } as React.CSSProperties}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
          <div className="uec-hero__row">
            <p>One stage. The boldest founders. Only a few get to play.</p>
            <a href="#apply" className="uec-badge" aria-label="Apply to play">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <defs>
                  <path id="uec-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                </defs>
                <text>
                  <textPath href="#uec-circle">APPLY TO PLAY · APPLY TO PLAY · </textPath>
                </text>
              </svg>
              <span>↓</span>
            </a>
          </div>
        </section>

        <div className="uec-marquee" aria-hidden="true">
          <div>
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                BUILD ✦ PITCH ✦ COMPETE ✦ WIN ✦ BUILD ✦ PITCH ✦ COMPETE ✦ WIN ✦{" "}
              </span>
            ))}
          </div>
        </div>

        <section className="uec-stages">
          {STAGES.map((s, i) => (
            <article
              key={s.n}
              data-reveal
              className="uec-stage"
              style={{ "--i": i } as React.CSSProperties}
            >
              <span>{s.n}</span>
              <h2>{s.title}</h2>
              <p>{s.body}</p>
            </article>
          ))}
        </section>

        <section id="apply" className="uec-apply" data-reveal>
          <p className="uec-kicker">Application</p>
          <h2>Think you’ve got what it takes?</h2>
          <ChallengeApply />
        </section>
        <LightSiteFooter />
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  full_name: "",
  school: "",
  grade: "",
  linkedin_url: "",
  email: "",
  phone: "",
  current_work: "",
  why_deserve: "",
  money_plan: "",
  crazy_thing: "",
  on_camera: "",
};

const QUESTIONS: {
  key: keyof typeof EMPTY_FORM;
  label: string;
  textarea?: boolean;
  placeholder?: string;
  optional?: boolean;
  type?: string;
}[] = [
  { key: "full_name", label: "What’s your name?", placeholder: "Your full name" },
  { key: "school", label: "What school do you go to?", placeholder: "e.g. Harvard, MIT, BU" },
  { key: "grade", label: "What’s your grade / year?", placeholder: "e.g. Junior, Class of 2027" },
  {
    key: "linkedin_url",
    label: "Your LinkedIn",
    placeholder: "linkedin.com/in/yourname",
  },
  {
    key: "email",
    label: "Your email",
    type: "email",
    placeholder: "you@school.edu",
  },
  {
    key: "phone",
    label: "Your phone number (optional)",
    type: "tel",
    placeholder: "+1 (555) 000-0000",
    optional: true,
  },
  {
    key: "current_work",
    label: "What are you working on right now?",
    textarea: true,
    placeholder: "Your startup, project, or hustle",
  },
  {
    key: "why_deserve",
    label: "Why will you win the Challenge?",
    textarea: true,
  },
  {
    key: "money_plan",
    label: "How would you make money during the Challenge?",
    textarea: true,
  },
  { key: "crazy_thing", label: "Tell us one crazy thing about you.", textarea: true },
  {
    key: "on_camera",
    label: "Have you been on camera or made content before?",
    textarea: true,
    placeholder: "Interviews, TikTok, YouTube, podcasts — tell us",
  },
];

function ChallengeApply() {
  const { loading, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const { data: application, isLoading } = useQuery({
    queryKey: ["challenge-application"],
    enabled: isSignedIn,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;
      const { data, error } = await supabase
        .from("challenge_applications")
        .select(
          "id, status, full_name, school, grade, linkedin_url, email, phone, current_work, why_deserve, money_plan, crazy_thing, on_camera",
        )
        .eq("user_id", uid)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    retry: false,
  });

  useEffect(() => {
    if (!application) return;
    setForm({
      full_name: application.full_name ?? "",
      school: application.school ?? "",
      grade: application.grade ?? "",
      linkedin_url: application.linkedin_url ?? "",
      email: application.email ?? "",
      phone: application.phone ?? "",
      current_work: application.current_work ?? "",
      why_deserve: application.why_deserve ?? "",
      money_plan: application.money_plan ?? "",
      crazy_thing: application.crazy_thing ?? "",
      on_camera: application.on_camera ?? "",
    });
  }, [application]);

  if (loading || (isSignedIn && isLoading)) {
    return <p className="uec-form-status">Loading…</p>;
  }

  if (!isSignedIn) {
    return (
      <>
        <p>Create an account first — then answer 10 quick questions to apply.</p>
        <div className="uec-apply__actions">
          <span className="uec-pill">
            <i aria-hidden="true" /> Applications open
          </span>
          <Link to="/auth" search={{ mode: "signup", next: "/challenge" }} className="uec-cta">
            Create account ↗
          </Link>
        </div>
      </>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const requiredKeys = QUESTIONS.filter((q) => !q.optional).map((q) => q.key);
    if (requiredKeys.some((k) => !form[k].trim())) {
      setMessage("Please answer every question.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setMessage("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.rpc("submit_challenge_application", {
      _full_name: form.full_name,
      _school: form.school,
      _grade: form.grade,
      _linkedin_url: form.linkedin_url,
      _current_work: form.current_work,
      _why_deserve: form.why_deserve,
      _crazy_thing: form.crazy_thing,
      _on_camera: form.on_camera,
      _email: form.email,
      _phone: form.phone,
    });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setEditing(false);
    setMessage("Application received. We’ll be in touch.");
    queryClient.invalidateQueries({ queryKey: ["challenge-application"] });
  };

  if (application && !editing) {
    return (
      <div className="uec-form-state">
        <span className="uec-pill">
          <i aria-hidden="true" />
          {application.status === "accepted"
            ? "Accepted"
            : application.status === "rejected"
              ? "Not selected"
              : "Under review"}
        </span>
        <p>
          {application.status === "pending"
            ? "Your application is with The Room team."
            : application.status === "accepted"
              ? "You’re in. We’ll email you with next steps."
              : "Thanks for applying — this round wasn’t the one."}
        </p>
        {application.status === "pending" ? (
          <button type="button" className="uec-form-edit" onClick={() => setEditing(true)}>
            Edit application →
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <form className="uec-form" onSubmit={submit}>
      {QUESTIONS.map((q, i) => (
        <div key={q.key} className="uec-field">
          <label htmlFor={`uec-${q.key}`}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {q.label}
          </label>
          {q.textarea ? (
            <textarea
              id={`uec-${q.key}`}
              rows={4}
              value={form[q.key]}
              placeholder={q.placeholder}
              onChange={(e) => setForm((f) => ({ ...f, [q.key]: e.target.value.slice(0, 2000) }))}
              required={!q.optional}
            />
          ) : (
            <input
              id={`uec-${q.key}`}
              type={q.type}
              value={form[q.key]}
              placeholder={q.placeholder}
              onChange={(e) => setForm((f) => ({ ...f, [q.key]: e.target.value.slice(0, 300) }))}
              required={!q.optional}
            />
          )}
        </div>
      ))}
      <div className="uec-apply__actions">
        <button type="submit" className="uec-cta" disabled={busy}>
          {busy ? "Submitting…" : "Submit application ↗"}
        </button>
      </div>
      {message ? (
        <p className="uec-form-status" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
