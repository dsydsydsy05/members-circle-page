import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BrandMark } from "@/components/BrandMark";
import { LightPage } from "@/components/light/LightSite";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/nfc/$token")({
  head: () => ({
    meta: [
      { title: "Activate your pass · The Room" },
      {
        name: "description",
        content: "Activate or open a The Room NFC member pass.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NfcPassPage,
});

type NfcState = "invalid" | "inactive" | "claimable" | "claimed" | "disabled";

function claimErrorMessage(message: string) {
  if (message.includes("NFC_ALREADY_CLAIMED")) return "This pass has already been activated.";
  if (message.includes("NFC_ACCOUNT_ALREADY_HAS_CARD")) {
    return "Your account already has an active pass. Ask The Room team before replacing it.";
  }
  if (message.includes("NFC_NOT_ACTIVE")) return "This pass is not open for activation right now.";
  if (message.includes("NFC_DISABLED")) return "This pass has been disabled.";
  if (message.includes("NFC_NOT_FOUND")) return "We could not verify this pass.";
  return "Activation could not be completed. Please ask The Room team for help.";
}

function NfcPassPage() {
  const { token } = Route.useParams();
  const returnPath = `/nfc/${token}`;
  const { loading: authLoading, isSignedIn, userId, email, profile, refresh } = useAuth();
  const queryClient = useQueryClient();
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const {
    data: pass,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["nfc-pass", token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("resolve_nfc_tag", { _token: token });
      if (error) throw error;
      return (
        data?.[0] ?? {
          state: "invalid",
          member_id: null,
          member_no: null,
          profile_ready: false,
        }
      );
    },
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (pass?.state !== "claimed" || !pass.profile_ready || !pass.member_id) return;
    const publicId = pass.member_no ? String(pass.member_no) : pass.member_id;
    window.location.replace(`/member/${publicId}`);
  }, [pass]);

  const claim = async () => {
    setClaiming(true);
    setClaimError(null);
    const { data, error } = await supabase.rpc("claim_nfc_tag", { _token: token });
    if (error) {
      setClaimError(claimErrorMessage(error.message));
      setClaiming(false);
      await queryClient.invalidateQueries({ queryKey: ["nfc-pass", token] });
      return;
    }

    const result = data?.[0];
    await refresh();
    await queryClient.invalidateQueries({ queryKey: ["nfc-pass", token] });
    if (result?.profile_ready && result.member_id) {
      window.location.replace(`/member/${result.member_id}`);
      return;
    }
    window.location.assign(`/onboarding?next=${encodeURIComponent(returnPath)}`);
  };

  const state = (pass?.state ?? "invalid") as NfcState;
  const pending = isLoading || authLoading;
  const isOwner = Boolean(userId && pass?.member_id === userId);

  let index = "00";
  let eyebrow = "Checking pass";
  let title = "Hold near the card.";
  let body = "We are reading this NFC pass and checking its event status.";
  let action: ReactNode = null;

  if (!pending && error) {
    index = "E1";
    eyebrow = "Connection unavailable";
    title = "Try the pass again.";
    body = "The pass could not reach The Room. Check your connection or ask the event team.";
  } else if (!pending && state === "invalid") {
    index = "E2";
    eyebrow = "Pass not recognised";
    title = "This link is not in our inventory.";
    body = "Use the NFC pass handed to you by The Room team. Do not copy or shorten its address.";
  } else if (!pending && state === "inactive") {
    index = "01";
    eyebrow = "Inventory / inactive";
    title = "This pass is waiting for the event.";
    body =
      "The Room team has not opened this batch for activation yet. Keep the pass with you and try again at check-in.";
  } else if (!pending && state === "disabled") {
    index = "04";
    eyebrow = "Pass inactive";
    title = "This pass is no longer active.";
    body = "If this is your pass, contact The Room team for a replacement.";
  } else if (!pending && state === "claimable") {
    index = "02";
    eyebrow = "Event activation";
    title = isSignedIn ? "Make this pass yours." : "Enter the room.";
    body = isSignedIn
      ? `You are activating this physical pass for ${email ?? "your signed-in account"}. This can only be completed once.`
      : "Create an account or sign in. You will return to this exact pass after authentication.";
    action = isSignedIn ? (
      <button type="button" className="light-nfc-action" disabled={claiming} onClick={claim}>
        {claiming ? "Activating…" : "Activate my pass"} <span>↗</span>
      </button>
    ) : (
      <div className="light-nfc-actions">
        <Link to="/auth" search={{ mode: "signup", next: returnPath }} className="light-nfc-action">
          Create account <span>↗</span>
        </Link>
        <Link
          to="/auth"
          search={{ mode: "signin", next: returnPath }}
          className="light-nfc-secondary"
        >
          Already registered? Sign in
        </Link>
      </div>
    );
  } else if (!pending && state === "claimed" && !pass?.profile_ready) {
    index = "03";
    eyebrow = "Pass claimed";
    title = isOwner ? "Finish your member file." : "This profile is being prepared.";
    body = isOwner
      ? "Your pass is secure. Add the information people should see when they tap it."
      : "The member has activated this pass but has not published their profile yet.";
    action = isOwner ? (
      <Link to="/onboarding" search={{ next: returnPath }} className="light-nfc-action">
        Complete my profile <span>↗</span>
      </Link>
    ) : null;
  } else if (!pending && state === "claimed") {
    index = "03";
    eyebrow = "Member pass";
    title = "Opening the member file.";
    body = "This pass is active and linked to a verified The Room profile.";
  }

  return (
    <LightPage className="light-public-page light-nfc-page">
      <main className="light-nfc-main">
        <section className="light-nfc-sheet" aria-live="polite">
          <header className="light-nfc-head">
            <span>The Room / NFC Member Pass</span>
            <BrandMark />
          </header>

          <div className="light-nfc-door" aria-hidden="true">
            <BrandMark compact />
            <i />
          </div>

          <div className="light-nfc-copy">
            <span className="light-nfc-index">{index} / NFC</span>
            <span className="light-nfc-eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{body}</p>
            {claimError ? <p className="light-nfc-error">{claimError}</p> : null}
            {action}
          </div>

          <footer className="light-nfc-foot">
            <span>{pending ? "Resolving secure token" : `Status / ${state}`}</span>
            <span>Boston · 2026</span>
          </footer>
        </section>
      </main>
    </LightPage>
  );
}
