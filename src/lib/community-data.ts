export type Member = {
  id: string;
  name: string;
  handle: string;
  role: string;
  city: string;
  bio: string;
  tags: string[];
  website: string;
  initials: string;
  avatarUrl?: string | null;
  memberNo?: number | null;
};


export const members: Member[] = [];


export type Guest = {
  id: string;
  name: string;
  title: string;
  event: string;
  date: string;
};

export const guests: Guest[] = [
  { id: "g1", name: "Emily Weiss", title: "Founder, Glossier", event: "Fireside: Building Cult Brands", date: "Aug 14" },
  { id: "g2", name: "Tobi Lütke", title: "CEO, Shopify", event: "Closed Q&A", date: "Sep 03" },
  { id: "g3", name: "Yvon Chouinard", title: "Founder, Patagonia", event: "On Values & Manufacturing", date: "Oct 21" },
  { id: "g4", name: "Rin Iwasaki", title: "Creative Director", event: "Design Workshop", date: "Nov 09" },
];

export type EventItem = {
  id: string;
  title: string;
  date: string;
  city: string;
  status: "upcoming" | "past";
  cover: string;
};

export const events: EventItem[] = [
  { id: "e1", title: "The Room Opening: Our First Guest", date: "Sep 15", city: "Boston", status: "upcoming",
    cover: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&auto=format&fit=crop&q=70" },
  { id: "e2", title: "How to Raise Funding", date: "Oct 15", city: "Boston", status: "upcoming",
    cover: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&auto=format&fit=crop&q=70" },
  { id: "e3", title: "How to Take a Company Public", date: "Nov 15", city: "Boston", status: "upcoming",
    cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=70" },
];

export const eventPhotos: { id: string; src: string; caption: string }[] = [
  { id: "p1", src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&auto=format&fit=crop&q=70", caption: "Founders Dinner No. 06 — Tokyo" },
  { id: "p2", src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1000&auto=format&fit=crop&q=70", caption: "Workshop: Small-batch dye" },
  { id: "p3", src: "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1000&auto=format&fit=crop&q=70", caption: "Studio visit — Lisbon" },
  { id: "p4", src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=70", caption: "The Room Spring Social — NYC" },
  { id: "p5", src: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1000&auto=format&fit=crop&q=70", caption: "Factory tour — Guangzhou" },
  { id: "p6", src: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1000&auto=format&fit=crop&q=70", caption: "Coffee Hour — Paris" },
];

export type Factory = {
  id: string;
  name: string;
  category: string;
  location: string;
  moq: string;
  notes: string;
  website: string;
};

export const factories: Factory[] = [
  { id: "f1", name: "Nanhai Knit Works", category: "Knitwear", location: "Foshan, CN", moq: "150 / color", notes: "Great with merino & recycled cotton blends.", website: "https://example.com" },
  { id: "f2", name: "Porto Cut & Sew", category: "Apparel", location: "Porto, PT", moq: "100 pcs", notes: "Family-run, strong on shirting.", website: "https://example.com" },
  { id: "f3", name: "Aegean Ceramics", category: "Home / Ceramics", location: "Izmir, TR", moq: "300 pcs", notes: "Hand-thrown small batches, kind lead times.", website: "https://example.com" },
  { id: "f4", name: "Kobe Paperworks", category: "Packaging", location: "Kobe, JP", moq: "500 pcs", notes: "Beautiful uncoated stocks, letterpress friendly.", website: "https://example.com" },
];

export type FamilyBiz = {
  id: string;
  name: string;
  owner: string;
  category: string;
  website: string;
};

export const familyBusinesses: FamilyBiz[] = [
  { id: "b1", name: "Loom & Co.", owner: "Ava Chen", category: "Knitwear", website: "https://loomandco.example.com" },
  { id: "b2", name: "Studio Norte", owner: "Marco Silva", category: "Design", website: "https://studionorte.example.com" },
  { id: "b3", name: "Kite Goods", owner: "Priya Rao", category: "Home", website: "https://kitegoods.example.com" },
  { id: "b4", name: "Maison Bleu", owner: "Jules Martin", category: "Retail", website: "https://maisonbleu.example.com" },
  { id: "b5", name: "Hako Studio", owner: "Kenji Ito", category: "Home", website: "https://hakostudio.example.com" },
  { id: "b6", name: "Faro", owner: "Sofia Alvarez", category: "Agency", website: "https://faroagency.example.com" },
];
