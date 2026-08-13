import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ContentTable } from "@/lib/use-site-content";

type ContentValue = string | number | null;
type ContentValues = Record<string, ContentValue>;
type ContentAction = "create" | "update" | "delete";

export type AdminContentMutation = {
  action: ContentAction;
  table: ContentTable;
  id?: string;
  values?: ContentValues;
};

type FieldRule =
  | { kind: "text"; max: number; required?: boolean; nullable?: boolean }
  | { kind: "number"; min: number; max: number }
  | { kind: "status" };

const tableRules: Record<ContentTable, Record<string, FieldRule>> = {
  events: {
    slug: { kind: "text", max: 120, nullable: true },
    title: { kind: "text", max: 160, required: true },
    date_label: { kind: "text", max: 80 },
    city: { kind: "text", max: 120 },
    status: { kind: "status" },
    cover_url: { kind: "text", max: 2_000, nullable: true },
    detail_image_url: { kind: "text", max: 2_000, nullable: true },
    summary: { kind: "text", max: 500, nullable: true },
    body: { kind: "text", max: 12_000, nullable: true },
    sort_order: { kind: "number", min: -10_000, max: 10_000 },
  },
  guests: {
    name: { kind: "text", max: 160, required: true },
    title: { kind: "text", max: 200 },
    event: { kind: "text", max: 200 },
    date_label: { kind: "text", max: 80 },
    sort_order: { kind: "number", min: -10_000, max: 10_000 },
  },
  event_photos: {
    src: { kind: "text", max: 2_000 },
    caption: { kind: "text", max: 300 },
    sort_order: { kind: "number", min: -10_000, max: 10_000 },
  },
  factories: {
    name: { kind: "text", max: 160, required: true },
    category: { kind: "text", max: 120 },
    location: { kind: "text", max: 160 },
    moq: { kind: "text", max: 120 },
    sample_time: { kind: "text", max: 200 },
    contact: { kind: "text", max: 500 },
    notes: { kind: "text", max: 2_000 },
    website: { kind: "text", max: 2_000, nullable: true },
    sort_order: { kind: "number", min: -10_000, max: 10_000 },
  },
  partners: {
    name: { kind: "text", max: 160, required: true },
    tier: { kind: "text", max: 80 },
    blurb: { kind: "text", max: 1_000 },
    url: { kind: "text", max: 2_000, nullable: true },
    logo_url: { kind: "text", max: 2_000, nullable: true },
    sort_order: { kind: "number", min: -10_000, max: 10_000 },
  },
};

const createDefaults: Record<ContentTable, ContentValues> = {
  events: {
    slug: null,
    title: "New event",
    date_label: "",
    city: "",
    status: "upcoming",
    cover_url: null,
    detail_image_url: null,
    summary: null,
    body: null,
    sort_order: 99,
  },
  guests: {
    name: "Coming Soon",
    title: "Guest speaker TBA",
    event: "",
    date_label: "",
    sort_order: 99,
  },
  event_photos: { src: "", caption: "", sort_order: 99 },
  factories: {
    name: "New factory",
    category: "",
    location: "",
    moq: "",
    sample_time: "",
    contact: "",
    notes: "",
    website: null,
    sort_order: 99,
  },
  partners: {
    name: "New partner",
    tier: "silver",
    blurb: "",
    url: null,
    logo_url: null,
    sort_order: 99,
  },
};

function validateInput(input: AdminContentMutation): AdminContentMutation {
  if (!input || !["create", "update", "delete"].includes(input.action)) {
    throw new Error("Invalid content action");
  }
  if (!Object.prototype.hasOwnProperty.call(tableRules, input.table)) {
    throw new Error("Invalid content table");
  }
  if (input.action !== "create" && (!input.id || typeof input.id !== "string")) {
    throw new Error("Record ID is required");
  }
  if (input.action !== "delete" && input.values != null && typeof input.values !== "object") {
    throw new Error("Content values must be an object");
  }
  return input;
}

function sanitizeValues(table: ContentTable, values: ContentValues): ContentValues {
  const rules = tableRules[table];
  const result: ContentValues = {};

  for (const [key, value] of Object.entries(values)) {
    const rule = rules[key];
    if (!rule) throw new Error(`Field “${key}” cannot be changed on ${table}`);

    if (rule.kind === "number") {
      const parsed = Number(value);
      if (!Number.isInteger(parsed) || parsed < rule.min || parsed > rule.max) {
        throw new Error(`${key} must be a whole number between ${rule.min} and ${rule.max}`);
      }
      result[key] = parsed;
      continue;
    }

    if (rule.kind === "status") {
      const status = String(value ?? "")
        .trim()
        .toLowerCase();
      if (status !== "upcoming" && status !== "past") {
        throw new Error("Event status must be upcoming or past");
      }
      result[key] = status;
      continue;
    }

    const text = String(value ?? "").trim();
    if (rule.required && !text) throw new Error(`${key} is required`);
    if (text.length > rule.max) throw new Error(`${key} must be ${rule.max} characters or fewer`);
    result[key] = rule.nullable && !text ? null : text;
  }

  return result;
}

type MutationError = { message: string };
type MutationRow = Record<string, string | number | boolean | null>;
type MutationResult = PromiseLike<{
  data: MutationRow | null;
  error: MutationError | null;
}>;
type SingleBuilder = { single: () => MutationResult };
type FilterBuilder = { select: (columns?: string) => SingleBuilder };
type AdminTableClient = {
  insert: (values: ContentValues) => FilterBuilder;
  update: (values: ContentValues) => { eq: (column: string, value: string) => FilterBuilder };
  delete: () => { eq: (column: string, value: string) => FilterBuilder };
};

/**
 * Canonical persistence API for the editable admin lists. Every mutation is
 * authenticated, admin-authorized, allow-listed, validated, and returns the
 * database row that was actually written.
 */
export const mutateAdminContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(validateInput)
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) throw new Error("Forbidden: administrator access required");

    const client = context.supabase.from(data.table) as unknown as AdminTableClient;
    let result: Awaited<MutationResult>;

    if (data.action === "create") {
      const values = sanitizeValues(data.table, {
        ...createDefaults[data.table],
        ...(data.values ?? {}),
      });
      result = await client.insert(values).select().single();
    } else if (data.action === "update") {
      const values = sanitizeValues(data.table, data.values ?? {});
      if (!Object.keys(values).length) throw new Error("No changes to save");
      result = await client.update(values).eq("id", data.id!).select().single();
    } else {
      result = await client.delete().eq("id", data.id!).select("id").single();
    }

    if (result.error) throw new Error(result.error.message);
    if (!result.data) throw new Error("Database did not return the saved record");

    return { record: result.data };
  });
