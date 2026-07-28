import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFamilyBusinesses, hostOf } from "@/lib/use-family-businesses";

const CATEGORIES = [
  "Manufacturing",
  "Apparel",
  "Retail",
  "Home",
  "Food & Beverage",
  "Design",
  "Agency",
  "Tech",
  "Trading",
  "Other",
];

const field =
  "mt-1 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary";
const label = "text-xs uppercase tracking-wider text-muted-foreground";

export function FamilyBusinessSection({ defaultOwner = "" }: { defaultOwner?: string }) {
  const { items, loading, refresh } = useFamilyBusinesses("mine");
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium">Family business (optional)</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Add your family business so it appears in the members-only directory.
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-medium hover:border-primary hover:text-primary"
          >
            + Add business
          </button>
        )}
      </div>

      {!loading && items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <span className="min-w-0">
                <span className="font-medium">{b.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {b.category}
                  {hostOf(b.website) ? ` · ${hostOf(b.website)}` : ""}
                </span>
              </span>
              <button
                type="button"
                onClick={async () => {
                  await supabase.from("family_businesses").delete().eq("id", b.id);
                  void refresh();
                }}
                className="shrink-0 text-xs text-muted-foreground hover:text-red-400"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <BusinessForm
          defaultOwner={defaultOwner}
          onCancel={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            void refresh();
          }}
        />
      )}
    </div>
  );
}

function BusinessForm({
  defaultOwner,
  onCancel,
  onSaved,
}: {
  defaultOwner: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [website, setWebsite] = useState("");
  const [ownerName, setOwnerName] = useState(defaultOwner);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) {
      setError("Business name is required.");
      return;
    }
    setBusy(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      setError("Session expired, please sign in again.");
      setBusy(false);
      return;
    }
    const { error: insertError } = await supabase.from("family_businesses").insert({
      user_id: uid,
      name: name.trim().slice(0, 120),
      category,
      website: website.trim().slice(0, 300) || null,
      owner_name: ownerName.trim().slice(0, 80) || null,
      location: location.trim().slice(0, 120) || null,
      description: description.trim().slice(0, 300) || null,
    });
    setBusy(false);
    if (insertError) setError(insertError.message);
    else onSaved();
  };

  return (
    <div className="mt-5 space-y-4 border-t border-border pt-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="biz-name" className={label}>Business name *</label>
          <input id="biz-name" value={name} onChange={(e) => setName(e.target.value)} className={field} maxLength={120} />
        </div>
        <div>
          <label htmlFor="biz-cat" className={label}>Category</label>
          <select id="biz-cat" value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="biz-owner" className={label}>Owner / run by</label>
          <input id="biz-owner" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={field} maxLength={80} />
        </div>
        <div>
          <label htmlFor="biz-loc" className={label}>Location</label>
          <input id="biz-loc" value={location} onChange={(e) => setLocation(e.target.value)} className={field} placeholder="Shanghai, CN" maxLength={120} />
        </div>
      </div>

      <div>
        <label htmlFor="biz-site" className={label}>Website</label>
        <input id="biz-site" value={website} onChange={(e) => setWebsite(e.target.value)} className={field} placeholder="https://…" maxLength={300} />
      </div>

      <div>
        <label htmlFor="biz-desc" className={label}>Short description</label>
        <textarea id="biz-desc" value={description} onChange={(e) => setDescription(e.target.value)} className={`${field} min-h-[80px]`} maxLength={300} />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save business"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground hover:text-primary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
