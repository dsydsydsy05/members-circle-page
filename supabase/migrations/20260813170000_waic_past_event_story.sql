-- Give archived events enough editorial content for a full public story.
alter table public.events
  add column if not exists slug text,
  add column if not exists detail_image_url text,
  add column if not exists summary text,
  add column if not exists body text;

create unique index if not exists events_slug_unique on public.events (slug);

insert into public.events (
  id,
  slug,
  title,
  date_label,
  city,
  status,
  cover_url,
  detail_image_url,
  summary,
  body,
  sort_order
)
values (
  '7a1c2026-0718-4d1e-9a1c-202607180001',
  'waic-2026-founders-dinner',
  'WAIC 2026 Founder’s Dinner',
  'July 18, 2026',
  'Shanghai, China',
  'past',
  '/images/events/waic-founders-dinner-cover.png',
  '/images/events/waic-founders-dinner-detail.jpg',
  'Thirty founders, investors, and researchers gathered for a candid evening during WAIC week.',
  $story$SHANGHAI — July 18, 2026 — During the World Artificial Intelligence Conference (WAIC), the room had the privilege of hosting an invitation-only Founder's Dinner, bringing together 30 accomplished founders, investors, and researchers from across the AI ecosystem. We were humbled by the response: nearly 400 applications came in for just 30 seats, and narrowing the list down was genuinely difficult — a reflection, we believe, not of the room itself, but of how much this community values candid, high-quality conversation during WAIC week.

The evening's guests represented a remarkable range of backgrounds and achievements. Among them were senior executives from leading global technology companies, including one from a formerly NYSE-listed enterprise; PhD researchers from Tsinghua University's top AI labs; partners from top-tier investment institutions; influential technology creators; LP investors backing leading venture capital funds; current leaders of established family businesses; and one of the world's youngest founders to bring a product into clinical trials.

At the room, our aim has always been simple: to create spaces where exceptional people can speak openly and learn from one another. We're grateful to everyone who applied and attended — more than the credentials at the table, what made the evening special was the openness of the conversations, and we hope to carry that spirit into future gatherings hosted by the room.$story$,
  1
)
on conflict (slug) do update set
  title = excluded.title,
  date_label = excluded.date_label,
  city = excluded.city,
  status = excluded.status,
  cover_url = excluded.cover_url,
  detail_image_url = excluded.detail_image_url,
  summary = excluded.summary,
  body = excluded.body,
  sort_order = excluded.sort_order,
  updated_at = now();
