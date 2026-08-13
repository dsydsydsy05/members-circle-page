import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { FACTORY_SUPPLIER_IMPORT } from "@/lib/factory-supplier-import";

/**
 * Keeps the member list usable before Lovable has applied the matching SQL
 * migration. The supplier contacts are returned only to an authenticated user.
 */
export const getFactoryImportFallback = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () =>
    FACTORY_SUPPLIER_IMPORT.map((factory) => ({
      ...factory,
      id: `workbook-${String(factory.sort_order).padStart(2, "0")}`,
      location: "",
    })),
  );
