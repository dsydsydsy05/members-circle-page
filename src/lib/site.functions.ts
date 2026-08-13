import { createServerFn } from "@tanstack/react-start";

type PublicDirectoryCounts = {
  familyBusinesses: number;
  vettedFactories: number;
};

async function readPublicDirectoryCounts(): Promise<PublicDirectoryCounts> {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data, error } = await supabase.rpc("get_public_directory_counts").single();

  if (!error && data) {
    return {
      familyBusinesses: Number(data.family_businesses),
      vettedFactories: Number(data.vetted_factories),
    };
  }

  // Compatibility fallback while an older environment is waiting for the RPC
  // migration. Production should normally use the public aggregate function.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [businessResult, factoryResult] = await Promise.all([
    supabaseAdmin.from("family_businesses").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("factories").select("id", { count: "exact", head: true }),
  ]);

  if (businessResult.error) throw businessResult.error;
  if (factoryResult.error) throw factoryResult.error;

  return {
    familyBusinesses: businessResult.count ?? 0,
    vettedFactories: factoryResult.count ?? 0,
  };
}

export const getFamilyBusinessCount = createServerFn({ method: "GET" }).handler(async () => {
  const counts = await readPublicDirectoryCounts();
  return counts.familyBusinesses;
});

export const getFactoryCount = createServerFn({ method: "GET" }).handler(async () => {
  const counts = await readPublicDirectoryCounts();
  return counts.vettedFactories;
});
