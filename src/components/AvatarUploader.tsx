import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/integrations/supabase/client";

const OUTPUT_SIZE = 512;
const VIEW = 260; // crop viewport size in px
const MAX_BYTES = 5 * 1024 * 1024;

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export function AvatarUploader({ value, onChange }: Props) {
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingBlob = useRef<Blob | null>(null);

  useEffect(
    () => () => {
      if (srcUrl) URL.revokeObjectURL(srcUrl);
    },
    [srcUrl],
  );

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Please choose a JPG, PNG or WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is larger than 5MB. Please pick a smaller one.");
      return;
    }
    setError(null);
    setSrcUrl(URL.createObjectURL(file));
  };

  const uploadBlob = useCallback(
    async (blob: Blob) => {
      pendingBlob.current = blob;
      setUploading(true);
      setError(null);
      try {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id;
        if (!uid) throw new Error("Your session expired. Please sign in again.");

        const path = `${uid}/avatar-${Date.now()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
        if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

        const { data: signed, error: signErr } = await supabase.storage
          .from("avatars")
          .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
        if (signErr || !signed?.signedUrl) {
          throw new Error(signErr?.message ?? "Uploaded, but the image link could not be created.");
        }
        onChange(signed.signedUrl);
        pendingBlob.current = null;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong while uploading.";
        setError(
          navigator.onLine === false
            ? "You appear to be offline. Check your connection and retry."
            : msg,
        );
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  const retry = () => {
    if (pendingBlob.current) void uploadBlob(pendingBlob.current);
    else setError(null);
  };

  return (
    <div>
      <span className="text-xs uppercase tracking-wider text-muted-foreground">Avatar</span>

      <div className="mt-2 flex items-center gap-4">
        {value.trim() ? (
          <img
            src={value}
            alt="Avatar preview"
            className="h-20 w-20 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-border text-[10px] uppercase tracking-wider text-muted-foreground">
            Photo
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label
            className={`cursor-pointer rounded-full border border-border px-4 py-2 text-sm transition-colors ${uploading ? "opacity-50" : "text-muted-foreground hover:border-primary hover:text-primary"}`}
          >
            {uploading ? "Uploading…" : value.trim() ? "Change photo" : "Upload photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={pickFile}
            />
          </label>
          {value.trim() && !uploading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <span>{error}</span>
          <button
            type="button"
            onClick={retry}
            disabled={uploading}
            className="rounded-full border border-destructive/50 px-3 py-1 text-xs uppercase tracking-wider hover:bg-destructive/20 disabled:opacity-50"
          >
            {pendingBlob.current ? "Retry upload" : "Dismiss"}
          </button>
        </div>
      )}

      {srcUrl && (
        <CropModal
          src={srcUrl}
          busy={uploading}
          onCancel={() => {
            setSrcUrl(null);
          }}
          onConfirm={async (blob) => {
            setSrcUrl(null);
            await uploadBlob(blob);
          }}
        />
      )}
    </div>
  );
}

function CropModal({
  src,
  busy,
  onCancel,
  onConfirm,
}: {
  src: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void | Promise<void>;
}) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // base scale so the image always covers the crop viewport
  const baseScale = natural ? Math.max(VIEW / natural.w, VIEW / natural.h) : 1;
  const scale = baseScale * zoom;
  const dispW = natural ? natural.w * scale : 0;
  const dispH = natural ? natural.h * scale : 0;

  const clamp = (o: { x: number; y: number }) => {
    const maxX = Math.max(0, (dispW - VIEW) / 2);
    const maxY = Math.max(0, (dispH - VIEW) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, o.x)),
      y: Math.min(maxY, Math.max(-maxY, o.y)),
    };
  };

  useEffect(() => {
    setOffset((o) => clamp(o)); /* eslint-disable-next-line */
  }, [zoom, natural]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setOffset(
      clamp({
        x: drag.current.ox + (e.clientX - drag.current.x),
        y: drag.current.oy + (e.clientY - drag.current.y),
      }),
    );
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const confirm = async () => {
    const img = imgRef.current;
    if (!img || !natural) return;
    setWorking(true);
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setWorking(false);
      return;
    }
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // source rect in natural pixels corresponding to the crop viewport
    const srcSize = VIEW / scale;
    const cx = natural.w / 2 - offset.x / scale;
    const cy = natural.h / 2 - offset.y / scale;
    ctx.drawImage(
      img,
      cx - srcSize / 2,
      cy - srcSize / 2,
      srcSize,
      srcSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    );

    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.9));
    setWorking(false);
    if (blob) await onConfirm(blob);
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
          Crop your photo
        </h2>

        <div
          className="relative mx-auto mt-5 cursor-grab overflow-hidden rounded-full bg-black active:cursor-grabbing"
          style={{ width: VIEW, height: VIEW, touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <img
            ref={imgRef}
            src={src}
            alt="Crop source"
            draggable={false}
            onLoad={(e) => {
              const el = e.currentTarget;
              setNatural({ w: el.naturalWidth, h: el.naturalHeight });
            }}
            className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
            style={{
              width: dispW || undefined,
              height: dispH || undefined,
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
            }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-primary/60" />
        </div>

        <label className="mt-5 block text-xs uppercase tracking-wider text-muted-foreground">
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="mt-2 w-full accent-[oklch(var(--primary))]"
          />
        </label>

        <p className="mt-2 text-xs text-muted-foreground">Drag the photo to reposition it.</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={working || busy}
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-primary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={working || busy || !natural}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {working || busy ? "Saving…" : "Use photo"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
