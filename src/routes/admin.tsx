import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MemberPortalShell } from "@/components/light/LightMemberPortal";
import { useIsAdmin } from "@/lib/use-admin";
import { useAuth } from "@/lib/use-auth";
import { deleteAppUser } from "@/lib/admin.functions";
import { mutateAdminContent } from "@/lib/admin-content.functions";
import { CONTENT_TABLES, type ContentTable } from "@/lib/use-site-content";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · The Room" },
      {
        name: "description",
        content: "Manage The Room events, guests, photos, factory list, partners and members.",
      },
      { property: "og:title", content: "Admin · The Room" },
      {
        property: "og:description",
        content: "Internal control room for The Room content and members.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

type EditableValue = string | number | boolean | null;
type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "select" | "image" | "boolean";
  options?: Array<{ value: string; label: string }>;
};

const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5;

/** Uploads to Supabase Storage so the database only ever stores a durable URL. */
async function uploadContentImage(table: ContentTable, file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${table}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (uploadError) throw new Error(uploadError.message);
  const { data, error } = await supabase.storage.from("media").createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) throw new Error(error?.message ?? "Could not read uploaded image");
  return data.signedUrl;
}

const SECTIONS: {
  table: ContentTable;
  label: string;
  fields: Field[];
  defaults: Record<string, EditableValue>;
}[] = [
  {
    table: "events",
    label: "Events",
    fields: [
      { key: "slug", label: "Archive slug" },
      { key: "title", label: "Title" },
      { key: "date_label", label: "Date (e.g. Sep 15)" },
      { key: "city", label: "City" },
      {
        key: "status",
        label: "Placement",
        type: "select",
        options: [
          { value: "upcoming", label: "Upcoming / Announced" },
          { value: "past", label: "Past / Archive" },
        ],
      },
      { key: "cover_url", label: "Cover image", type: "image" },
      { key: "detail_image_url", label: "Detail image", type: "image" },
      { key: "summary", label: "Short introduction", type: "textarea" },
      { key: "body", label: "Event story", type: "textarea" },
      { key: "sort_order", label: "Order", type: "number" },
    ],
    defaults: {
      slug: "",
      title: "New event",
      date_label: "",
      city: "",
      status: "upcoming",
      cover_url: "",
      detail_image_url: "",
      summary: "",
      body: "",
      sort_order: 99,
    },
  },
  {
    table: "guests",
    label: "Guests",
    fields: [
      { key: "name", label: "Name" },
      { key: "title", label: "Title" },
      { key: "event", label: "Event" },
      { key: "date_label", label: "Date" },
      { key: "sort_order", label: "Order", type: "number" },
    ],
    defaults: {
      name: "Coming Soon",
      title: "Guest speaker TBA",
      event: "",
      date_label: "",
      sort_order: 99,
    },
  },
  {
    table: "event_photos",
    label: "Event photos",
    fields: [
      { key: "src", label: "Image", type: "image" },
      { key: "caption", label: "Caption" },
      { key: "sort_order", label: "Order", type: "number" },
    ],
    defaults: { src: "", caption: "", sort_order: 99 },
  },
  {
    table: "factories",
    label: "Factory list",
    fields: [
      { key: "name", label: "Name" },
      { key: "category", label: "Category" },
      { key: "location", label: "Location" },
      { key: "moq", label: "MOQ" },
      { key: "sample_time", label: "Sample production time" },
      { key: "contact", label: "Contact", type: "textarea" },
      { key: "notes", label: "Notes", type: "textarea" },
      { key: "website", label: "Website" },
      { key: "sort_order", label: "Order", type: "number" },
    ],
    defaults: {
      name: "New factory",
      category: "",
      location: "",
      moq: "",
      sample_time: "",
      contact: "",
      notes: "",
      website: "",
      sort_order: 99,
    },
  },
  {
    table: "partners",
    label: "Partners",
    fields: [
      { key: "name", label: "Name" },
      { key: "tier", label: "Tier (diamond/platinum/gold/silver/ecosystem)" },
      { key: "blurb", label: "Blurb", type: "textarea" },
      { key: "url", label: "URL" },
      { key: "logo_url", label: "Logo", type: "image" },
      { key: "is_published", label: "Published on the public site", type: "boolean" },
      { key: "sort_order", label: "Order", type: "number" },
    ],
    defaults: {
      name: "New partner",
      tier: "silver",
      blurb: "",
      url: "",
      logo_url: "",
      is_published: false,
      sort_order: 99,
    },
  },
];

const inputCls =
  "w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary";

type ContentRecord = { id: string } & Record<string, string | number | boolean | null>;

function mutationMessage(error: unknown) {
  return error instanceof Error ? error.message : "The database change could not be saved";
}

function ImageField({
  table,
  value,
  onChange,
}: {
  table: ContentTable;
  value: string;
  onChange: (next: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadContentImage(table, file));
      toast.success("Image uploaded — press Save to store it");
    } catch (error) {
      toast.error(mutationMessage(error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <span className="mt-1 block space-y-2">
      <input
        type="text"
        className={inputCls}
        placeholder="https://…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => pick(e.target.files?.[0])}
          className="text-xs"
        />
        {uploading ? <span className="text-xs text-muted-foreground">Uploading…</span> : null}
      </span>
      {value ? (
        <img
          src={value}
          alt=""
          className="h-16 w-24 rounded-md border border-border object-cover"
        />
      ) : null}
    </span>
  );
}

function ContentSection({ section }: { section: (typeof SECTIONS)[number] }) {
  const qc = useQueryClient();
  const key = ["site-content", section.table] as const;
  const [busy, setBusy] = useState<string | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(section.table)
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as ContentRecord[];
    },
  });

  const [draft, setDraft] = useState<Record<string, ContentRecord>>({});
  useEffect(() => {
    const next: Record<string, ContentRecord> = {};
    rows.forEach((r) => (next[r.id] = { ...r }));
    setDraft(next);
  }, [rows]);

  const refresh = async () => {
    const invalidations = [qc.invalidateQueries({ queryKey: key })];
    if (section.table === "factories") {
      invalidations.push(qc.invalidateQueries({ queryKey: ["factory-count"] }));
    }
    invalidations.push(qc.invalidateQueries({ queryKey: ["site-content", section.table] }));
    await Promise.all(invalidations);
  };

  const save = async (id: string) => {
    const patch: Record<string, EditableValue> = {};
    section.fields.forEach((f) => {
      const v = draft[id]?.[f.key];
      if (f.type === "number") patch[f.key] = Number(v) || 0;
      else if (f.type === "boolean") patch[f.key] = v === true;
      else patch[f.key] = typeof v === "string" ? v : (v ?? "") === "" ? "" : String(v);
    });
    setBusy(id);
    try {
      await mutateAdminContent({
        data: { action: "update", table: section.table, id, values: patch },
      });
      await refresh();
      toast.success("Saved to database");
    } catch (error) {
      toast.error(mutationMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    setBusy(id);
    try {
      await mutateAdminContent({ data: { action: "delete", table: section.table, id } });
      await refresh();
      toast.success("Deleted from database");
    } catch (error) {
      toast.error(mutationMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const add = async () => {
    setBusy("add");
    try {
      await mutateAdminContent({
        data: { action: "create", table: section.table, values: section.defaults },
      });
      await refresh();
      toast.success(`Added to ${section.label} database list`);
    } catch (error) {
      toast.error(mutationMessage(error));
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{section.label}</h2>
        <button
          onClick={add}
          disabled={busy !== null}
          className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "add" ? "Adding…" : "+ Add"}
        </button>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">Nothing here yet.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const id = row.id as string;
            return (
              <div key={id} className="rounded-2xl border border-border bg-card/60 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.fields.map((f) => (
                    <label key={f.key} className="block text-xs text-muted-foreground">
                      {f.label}
                      {f.type === "textarea" ? (
                        <textarea
                          className={`${inputCls} mt-1 min-h-[70px]`}
                          value={draft[id]?.[f.key] ?? ""}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, [id]: { ...d[id], [f.key]: e.target.value } }))
                          }
                        />
                      ) : f.type === "boolean" ? (
                        <span className="mt-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-[hsl(var(--primary))]"
                            checked={draft[id]?.[f.key] === true}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                [id]: { ...d[id], [f.key]: e.target.checked },
                              }))
                            }
                          />
                          <span className="text-xs">
                            {draft[id]?.[f.key] === true ? "Visible publicly" : "Draft (hidden)"}
                          </span>
                        </span>
                      ) : f.type === "image" ? (
                        <ImageField
                          table={section.table}
                          value={typeof draft[id]?.[f.key] === "string" ? (draft[id][f.key] as string) : ""}
                          onChange={(next) =>
                            setDraft((d) => ({ ...d, [id]: { ...d[id], [f.key]: next } }))
                          }
                        />
                      ) : f.type === "select" ? (
                        <select
                          className={`${inputCls} mt-1`}
                          value={draft[id]?.[f.key] ?? ""}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, [id]: { ...d[id], [f.key]: e.target.value } }))
                          }
                        >
                          {f.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type === "number" ? "number" : "text"}
                          className={`${inputCls} mt-1`}
                          value={draft[id]?.[f.key] ?? ""}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, [id]: { ...d[id], [f.key]: e.target.value } }))
                          }
                        />
                      )}
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => save(id)}
                    disabled={busy !== null}
                    className="rounded-full border border-border px-4 py-1.5 text-xs hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy === id ? "Saving…" : "Save to database"}
                  </button>
                  <button
                    onClick={() => remove(id)}
                    disabled={busy !== null}
                    className="rounded-full border border-destructive/50 px-4 py-1.5 text-xs text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MembersSection() {
  const qc = useQueryClient();
  const { userId } = useAuth();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("member_no", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-profiles"] });

  const toggleMember = async (id: string, next: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_member: next }).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const featuredCount = rows.filter((profile) => profile.home_featured).length;
  const featuredSchemaReady =
    rows.length === 0 || rows.some((profile) => profile.home_featured !== undefined);

  const updateFeatured = async (id: string, featured: boolean, order: number) => {
    if (featured && featuredCount >= 3) {
      return toast.error("Only three members can be featured on the homepage");
    }
    const { error } = await supabase.rpc("admin_set_home_featured", {
      _profile_id: id,
      _featured: featured,
      _order: Math.max(1, Math.min(999, order || 999)),
    });
    if (error) return toast.error(error.message);
    toast.success(featured ? "Featured on homepage" : "Removed from homepage");
    refresh();
    qc.invalidateQueries({ queryKey: ["community-profiles"] });
  };

  const removeUser = async (id: string) => {
    if (!confirm("Permanently delete this user and their data?")) return;
    try {
      await deleteAppUser({ data: { userId: id } });
      toast.success("User deleted");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete user");
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Members</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Select up to three public profiles for the light homepage. Lower order appears first.
        </p>
        {!featuredSchemaReady && (
          <p className="mt-2 text-xs text-amber-600">
            Featured controls will become available after the local featured-members migration is
            applied.
          </p>
        )}
        {featuredCount > 3 && (
          <p className="mt-2 text-xs text-destructive">
            More than three profiles are marked as featured; only the first three will be shown.
          </p>
        )}
      </div>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">No.</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Startup</th>
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3 text-left">Homepage</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.member_no ? String(p.member_no).padStart(4, "0") : "—"}
                  </td>
                  <td className="px-4 py-3">{p.full_name || "Unnamed"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[p.position, p.startup].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleMember(p.id, !p.is_member)}
                      className={`rounded-full px-3 py-1 text-xs ${
                        p.is_member ? "bg-primary text-primary-foreground" : "border border-border"
                      }`}
                    >
                      {p.is_member ? "Member" : "Not member"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!featuredSchemaReady || (!p.home_featured && featuredCount >= 3)}
                        onClick={() =>
                          updateFeatured(p.id, !p.home_featured, p.home_featured_order ?? 999)
                        }
                        className={`rounded-full px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40 ${
                          p.home_featured
                            ? "bg-primary text-primary-foreground"
                            : "border border-border"
                        }`}
                      >
                        {p.home_featured ? "Featured" : "Feature"}
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        defaultValue={p.home_featured_order ?? 999}
                        disabled={!featuredSchemaReady || !p.home_featured}
                        aria-label={`Homepage order for ${p.full_name || "member"}`}
                        className="w-16 rounded-md border border-border bg-background px-2 py-1 text-xs disabled:opacity-40"
                        onBlur={(event) => {
                          const next = Number(event.currentTarget.value) || 999;
                          if (p.home_featured && next !== p.home_featured_order) {
                            updateFeatured(p.id, true, next);
                          }
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.id === userId ? (
                      <span className="text-xs text-muted-foreground">You</span>
                    ) : (
                      <button
                        onClick={() => removeUser(p.id)}
                        className="rounded-full border border-destructive/50 px-3 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        Delete user
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function BusinessesSection() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("family_businesses")
        .select("id, name, category, owner_name, location, website")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const remove = async (id: string) => {
    if (!confirm("Delete this business?")) return;
    const { error } = await supabase.from("family_businesses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-businesses"] });
    qc.invalidateQueries({ queryKey: ["family-businesses"] });
    qc.invalidateQueries({ queryKey: ["family-business-count"] });
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Family businesses</h2>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="space-y-2">
          {rows.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3 text-sm"
            >
              <div>
                <div className="font-medium">{b.name}</div>
                <div className="text-xs text-muted-foreground">
                  {[b.category, b.owner_name, b.location].filter(Boolean).join(" · ")}
                </div>
              </div>
              <button
                onClick={() => remove(b.id)}
                className="rounded-full border border-destructive/50 px-3 py-1 text-xs text-destructive hover:bg-destructive/10"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const TABS = [
  ...SECTIONS.map((s) => ({ id: s.table as string, label: s.label })),
  { id: "members", label: "Members" },
  { id: "businesses", label: "Family businesses" },
];

function AdminPage() {
  const { isAdmin, loading } = useIsAdmin();
  const { isSignedIn } = useAuth();
  const [tab, setTab] = useState<string>("events");
  const section = useMemo(() => SECTIONS.find((s) => s.table === tab), [tab]);

  return (
    <MemberPortalShell className="portal-page">
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <div className="text-xs uppercase tracking-[0.22em] text-primary">Control room</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Admin</h1>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Checking access…</p>
        ) : !isAdmin ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">Admins only</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This area is restricted to The Room administrators.
            </p>
            <Link
              to={isSignedIn ? "/" : "/auth"}
              className="mt-6 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              {isSignedIn ? "Back home" : "Sign in"}
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
                    tab === t.id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:bg-secondary"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-10">
              {section ? (
                <ContentSection key={section.table} section={section} />
              ) : tab === "members" ? (
                <MembersSection />
              ) : (
                <BusinessesSection />
              )}
            </div>
          </>
        )}
      </main>
    </MemberPortalShell>
  );
}

export { CONTENT_TABLES };
