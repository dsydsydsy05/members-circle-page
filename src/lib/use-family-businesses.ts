import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FamilyBusinessRow = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  website: string | null;
  owner_name: string | null;
  location: string | null;
  description: string | null;
};

export function useFamilyBusinesses(scope: "all" | "mine" = "all") {
  const [items, setItems] = useState<FamilyBusinessRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("family_businesses")
      .select("id,user_id,name,category,website,owner_name,location,description")
      .order("created_at", { ascending: true });

    if (scope === "mine") {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        setItems([]);
        setLoading(false);
        return;
      }
      query = query.eq("user_id", uid);
    }

    const { data } = await query;
    setItems((data as FamilyBusinessRow[]) ?? []);
    setLoading(false);
  }, [scope]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, loading, refresh: load };
}

export function normalizeUrl(url: string | null | undefined) {
  if (!url) return null;
  const t = url.trim();
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export function hostOf(url: string | null | undefined) {
  const n = normalizeUrl(url);
  if (!n) return null;
  try {
    return new URL(n).hostname.replace("www.", "");
  } catch {
    return null;
  }
}
