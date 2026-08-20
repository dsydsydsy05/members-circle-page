import { useMemo, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type CreatedTag = {
  serial_no: string;
  token: string;
  url_path: string;
};

function downloadBatchCsv(batchId: string, rows: CreatedTag[]) {
  const csv = [
    ["Card No.", "Batch", "URL to encode", "NDEF type"],
    ...rows.map((row) => [
      row.serial_no,
      batchId,
      `${window.location.origin}${row.url_path}`,
      "URI / URL Record",
    ]),
  ]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `the-room-nfc-${batchId.toLowerCase()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdminNfcSection() {
  const queryClient = useQueryClient();
  const [batchId, setBatchId] = useState("");
  const [count, setCount] = useState(50);
  const [hours, setHours] = useState(8);
  const [busy, setBusy] = useState<string | null>(null);
  const [lastBatch, setLastBatch] = useState<{ id: string; rows: CreatedTag[] } | null>(null);

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-nfc-tags"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_nfc_tags");
      if (error) throw error;
      return data;
    },
    retry: false,
  });

  const batches = useMemo(() => {
    const grouped = new Map<
      string,
      { total: number; inactive: number; claimable: number; claimed: number; disabled: number }
    >();
    data.forEach((tag) => {
      const current = grouped.get(tag.batch_id) ?? {
        total: 0,
        inactive: 0,
        claimable: 0,
        claimed: 0,
        disabled: 0,
      };
      current.total += 1;
      switch (tag.status) {
        case "inactive":
        case "claimable":
        case "claimed":
        case "disabled":
          current[tag.status] += 1;
          break;
      }
      grouped.set(tag.batch_id, current);
    });
    return [...grouped.entries()];
  }, [data]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-nfc-tags"] });

  const createBatch = async (event: FormEvent) => {
    event.preventDefault();
    const clean = batchId.trim().toUpperCase();
    if (!clean) return;
    setBusy("create");
    const { data, error } = await supabase.rpc("admin_create_nfc_batch", {
      _batch_id: clean,
      _count: Math.max(1, Math.min(1000, count)),
    });
    setBusy(null);
    if (error) return toast.error(error.message);
    const rows = data ?? [];
    setLastBatch({ id: clean, rows });
    downloadBatchCsv(clean, rows);
    setBatchId("");
    await refresh();
    toast.success(`${rows.length} anonymous NFC URLs created. CSV downloaded.`);
  };

  const setBatchOpen = async (id: string, claimable: boolean) => {
    setBusy(`${id}-${claimable}`);
    const { data: changed, error } = await supabase.rpc("admin_set_nfc_batch_claimable", {
      _batch_id: id,
      _claimable: claimable,
      _minutes: Math.max(1, Math.round(hours * 60)),
    });
    setBusy(null);
    if (error) return toast.error(error.message);
    await refresh();
    toast.success(
      claimable
        ? `${changed} passes are open for ${hours} hours.`
        : `${changed} unclaimed passes returned to inventory.`,
    );
  };

  const disableTag = async (id: string, serialNo: string) => {
    if (!confirm(`Disable ${serialNo}? It will stop opening the member profile.`)) return;
    setBusy(id);
    const { error } = await supabase.rpc("admin_disable_nfc_tag", { _tag_id: id });
    setBusy(null);
    if (error) return toast.error(error.message);
    await refresh();
    toast.success(`${serialNo} disabled.`);
  };

  return (
    <section className="space-y-10">
      <header className="border-b border-border pb-6">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">NFC / Event inventory</div>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Anonymous passes</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Manufacture the URLs before attendees are known. Keep batches inactive in storage, open
          them at check-in, and let each attendee claim the physical pass once.
        </p>
      </header>

      <form
        onSubmit={createBatch}
        className="grid gap-5 border-b border-border pb-10 md:grid-cols-[1fr_140px_auto] md:items-end"
      >
        <label className="text-xs uppercase tracking-wider text-muted-foreground">
          Batch ID
          <input
            value={batchId}
            onChange={(event) => setBatchId(event.target.value)}
            placeholder="BOSTON-2026-01"
            maxLength={48}
            required
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm uppercase outline-none focus:border-primary"
          />
        </label>
        <label className="text-xs uppercase tracking-wider text-muted-foreground">
          Quantity
          <input
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          disabled={busy === "create"}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy === "create" ? "Generating…" : "Generate + download CSV"}
        </button>
      </form>

      {lastBatch ? (
        <div className="flex flex-wrap items-center justify-between gap-4 border-l-2 border-primary bg-primary/5 px-5 py-4 text-sm">
          <span>
            <strong>{lastBatch.id}</strong> generated. Raw URLs are only returned at creation time.
          </span>
          <button
            type="button"
            onClick={() => downloadBatchCsv(lastBatch.id, lastBatch.rows)}
            className="border-b border-current text-xs uppercase tracking-wider"
          >
            Download CSV again
          </button>
        </div>
      ) : null}

      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Event controls</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Opening a batch affects only inactive or already-open passes. Claimed and disabled
              passes stay unchanged.
            </p>
          </div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">
            Claim window / hours
            <input
              type="number"
              min={1}
              max={168}
              value={hours}
              onChange={(event) => setHours(Number(event.target.value))}
              className="ml-3 w-20 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            />
          </label>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading NFC inventory…</p>
        ) : error ? (
          <p className="mt-6 border-l-2 border-amber-500 px-4 text-sm text-amber-700">
            NFC inventory becomes available after the latest Supabase migration is applied.
          </p>
        ) : batches.length === 0 ? (
          <p className="mt-6 border-t border-border py-10 text-sm text-muted-foreground">
            No NFC batches yet.
          </p>
        ) : (
          <div className="mt-6 divide-y divide-border border-y border-border">
            {batches.map(([id, summary]) => (
              <div key={id} className="grid gap-5 py-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.14em]">{id}</div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                    <span>{summary.total} total</span>
                    <span>{summary.inactive} inventory</span>
                    <span className="text-primary">{summary.claimable} open</span>
                    <span>{summary.claimed} claimed</span>
                    <span>{summary.disabled} disabled</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => setBatchOpen(id, true)}
                    className="rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground disabled:opacity-40"
                  >
                    Open at event
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => setBatchOpen(id, false)}
                    className="rounded-full border border-border px-4 py-2 text-xs disabled:opacity-40"
                  >
                    Close unclaimed
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.length ? (
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Physical inventory</h3>
          <div className="mt-5 overflow-x-auto border-y border-border">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 font-normal">Serial</th>
                  <th className="px-3 py-3 font-normal">Batch</th>
                  <th className="px-3 py-3 font-normal">Status</th>
                  <th className="px-3 py-3 font-normal">Member</th>
                  <th className="px-3 py-3 font-normal">Window / Claimed</th>
                  <th className="px-3 py-3 font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((tag) => (
                  <tr key={tag.id}>
                    <td className="px-3 py-3 font-mono text-xs">{tag.serial_no}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{tag.batch_id}</td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          tag.status === "claimable" ? "text-primary" : "text-muted-foreground"
                        }
                      >
                        {tag.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">{tag.member_name || "—"}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {tag.claimed_at
                        ? new Date(tag.claimed_at).toLocaleString()
                        : tag.claimable_until
                          ? `Open until ${new Date(tag.claimable_until).toLocaleString()}`
                          : "—"}
                    </td>
                    <td className="px-3 py-3">
                      {tag.status !== "disabled" ? (
                        <button
                          type="button"
                          disabled={busy === tag.id}
                          onClick={() => disableTag(tag.id, tag.serial_no)}
                          className="text-xs text-destructive underline decoration-destructive/40 underline-offset-4 disabled:opacity-40"
                        >
                          Disable
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
