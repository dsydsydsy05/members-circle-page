import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { useIsAdmin } from "@/lib/use-admin";
import { useAuth } from "@/lib/use-auth";
import { deleteAppUser } from "@/lib/admin.functions";
import { CONTENT_TABLES, type ContentTable } from "@/lib/use-site-content";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · The Room" },
      { name: "description", content: "Manage The Room events, guests, photos, factory list, partners and members." },
      { property: "og:title", content: "Admin · The Room" },
      { property: "og:description", content: "Internal control room for The Room content and members." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

type Field = { key: string; label: string; type?: "text" | "textarea" | "number" };

const SECTIONS: {
  table: ContentTable;
  label: string;
  fields: Field[];
  defaults: Record<string, unknown>;
}[] = [
  {
    table: "events",
    label: "Events",
    fields: [
      { key: "title", label: "Title" },
      { key: "date_label", label: "Date (e.g. Sep 15)" },
      { key: "city", label: "City" },
      { key: "status", label: "Status (upcoming / past)" },
      { key: "cover_url", label: "Cover image URL" },
      { key: "sort_order", label: "Order", type: "number" },
    ],
    defaults: { title: "New event", date_label: "", city: "", status: "upcoming", cover_url: "", sort_order: 99 },
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
    defaults: { name: "Coming Soon", title: "Guest speaker TBA", event: "", date_label: "", sort_order: 99 },
  },
  {
    table: "event_photos",
    label: "Event photos",
    fields: [
      { key: "src", label: "Image URL" },
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
      { key: "notes", label: "Notes", type: "textarea" },
      { key: "website", label: "Website" },
      { key: "sort_order", label: "Order", type: "number" },
    ],
    defaults: { name: "New factory", category: "", location: "", moq: "", notes: "", website: "", sort_order: 99 },
  },
  {
    table: "partners",
    label: "Partners",
    fields: [
      { key: "name", label: "Name" },
      { key: "tier", label: "Tier (diamond/platinum/gold/silver/ecosystem)" },
      { key: "blurb", label: "Blurb", type: "textarea" },
      { key: "url", label: "URL" },
      { key: "logo_url", label: "Logo URL" },
      { key: "sort_order", label: "Order", type: "number" },
    ],
    defaults: { name: "New partner", tier: "silver", blurb: "", url: "", logo_url: "", sort_order: 99 },
  },
];

const inputCls =
  "w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:border-primary";

function ContentSection({ section }: { section: (typeof SECTIONS)[number] }) {
  const qc = useQueryClient();
  const key = ["site-content", section.table] as const;

  const { data: rows = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from(section.table)
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Record<string, any>[];
    },
  });

  const [draft, setDraft] = useState<Record<string, Record<string, any>>>({});
  useEffect(() => {
    const next: Record<string, Record<string, any>> = {};
    rows.forEach((r) => (next[r.id as string] = { ...r }));
    setDraft(next);
  }, [rows]);

  const refresh = () => qc.invalidateQueries({ queryKey: key });

  const save = async (id: string) => {
    const patch: Record<string, any> = {};
    section.fields.forEach((f) => {
      const v = draft[id]?.[f.key];
      patch[f.key] = f.type === "number" ? Number(v) || 0 : v ?? "";
    });
    const { error } = await (supabase.from(section.table) as any).update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(section.table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  const add = async () => {
    const { error } = await supabase.from(section.table).insert(section.defaults as any);
    if (error) return toast.error(error.message);
    refresh();
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{section.label}</h2>
        <button
          onClick={add}
          className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          + Add
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
                    className="rounded-full border border-border px-4 py-1.5 text-xs hover:bg-secondary"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => remove(id)}
                    className="rounded-full border border-destructive/50 px-4 py-1.5 text-xs text-destructive hover:bg-destructive/10"
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
        .select("id, full_name, school, startup, position, is_member, onboarded, member_no")
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
      <h2 className="text-xl font-semibold tracking-tight">Members</h2>
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
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((p: any) => (
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
          {rows.map((b: any) => (
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
    <div className="min-h-screen">
      <SiteNav />
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
      <SiteFooter />
    </div>
  );
}

export { CONTENT_TABLES };
