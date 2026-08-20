import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  school: string | null;
  startup: string | null;
  position: string | null;
  website: string | null;
  tags: string[];
  about: string | null;
  member_no: number | null;
  is_member: boolean;
  onboarded: boolean;
  home_featured?: boolean;
  home_featured_order?: number;
};

export const AUTH_QUERY_KEY = ["auth-session-profile"] as const;

async function fetchAuthState(): Promise<{
  userId: string | null;
  email: string | null;
  profile: Profile | null;
}> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { userId: null, email: null, profile: null };

  // Public waitlist applications start without an account. Once the applicant
  // signs in with the same email, this idempotent claim attaches the row and
  // activates membership only when an admin has already approved it.
  await supabase.rpc("claim_waitlist_for_current_user");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: (profile as Profile | null) ?? null,
  };
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchAuthState,
    staleTime: 30_000,
  });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });

  return {
    loading: isLoading,
    userId: data?.userId ?? null,
    email: data?.email ?? null,
    profile: data?.profile ?? null,
    isSignedIn: Boolean(data?.userId),
    isMember: Boolean(data?.profile?.is_member),
    refresh,
  };
}

export async function signOut() {
  await supabase.auth.signOut();
}
