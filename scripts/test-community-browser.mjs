import { chromium } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.env.ROOM_PREVIEW_URL || "http://127.0.0.1:5174";
const env = await readFile(new URL("../.env", import.meta.url), "utf8");
const api = env.match(/^VITE_SUPABASE_URL=["']?([^\s"']+)/m)[1];
const project = new URL(api).hostname.split(".")[0];
const a = "00000000-0000-4000-8000-000000000001",
  b = "00000000-0000-4000-8000-000000000002",
  guestId = "00000000-0000-4000-8000-000000000003",
  questionId = "00000000-0000-4000-8000-000000000004";
const boston = {
  id: "boston",
  slug: "boston-founder-dinner-2026-09-18",
  title: "Founder Dinner",
  date_label: "September 18, 2026",
  city: "Boston",
  status: "past",
  cover_url: "/images/events/boston-founder-dinner-cover-19.png",
  detail_image_url: "/images/events/boston-founder-dinner-photo.jpg",
  summary: "Your story before your company.",
  body: "Nineteen founders around one table, with one rule: we get into your story before we get into your company.\n\nThank you to Briar Group for providing the space at the Glass House.\n\nThe Room is a members-only community that curates a small room of founders every month, for people who would rather be in the RIGHT room than in EVERY room.",
  attendance_label: "19 founders",
  cover_caption: "Original invitation · planned for 12, welcomed 19 founders",
  cover_display: "poster",
  image_alt: "Founders sharing dinner around one table at the Glass House in Boston",
  archive_number: 2,
  sort_order: -100,
};
const shanghai = {
  ...boston,
  id: "shanghai",
  slug: "waic-2026-founders-dinner",
  title: "WAIC 2026 Founder’s Dinner",
  city: "Shanghai, China",
  date_label: "July 18, 2026",
  archive_number: 1,
  attendance_label: "30 guests",
  cover_url: "/images/events/waic-founders-dinner-cover.png",
  detail_image_url: "/images/events/waic-founders-dinner-detail.jpg",
  cover_caption: null,
  sort_order: 1,
};
const upcoming = [
  "The Room Opening: Our First Guest",
  "How to Raise Funding",
  "How to Take a Company Public",
].map((title, index) => ({
  id: `upcoming-${index}`,
  title,
  city: "Boston",
  status: "upcoming",
  date_label: ["Oct 15", "Nov 15", "Dec 15"][index],
  sort_order: index + 1,
}));
const profile = (id, name) => ({
  id,
  full_name: name,
  avatar_url: null,
  school: "Boston",
  startup: "A new venture",
  position: "Founder",
  website: null,
  linkedin_url: null,
  contact_email_mask: null,
  conversation_topics: "Building thoughtful communities.",
  tags: ["Community"],
  about: "I build spaces for honest conversations.",
  member_no: 1,
  is_member: true,
  onboarded: true,
  home_featured: false,
  home_featured_order: 999,
});
const profiles = [profile(a, "Alex Morgan"), profile(b, "Sam Chen")];
const guests = [
  {
    id: guestId,
    name: "Jordan Lee",
    title: "Founder & operator",
    event: "Founder Dinner",
    date_label: "September 18, 2026",
    bio: "Jordan builds tools for independent founders.",
    avatar_url: null,
    sort_order: 0,
  },
];
const questions = [
  {
    id: questionId,
    body: "How do you find the right people to build with?",
    created_at: "2026-09-19T12:00:00Z",
  },
];
const answers = [
  {
    id: "answer-1",
    question_id: questionId,
    body: "Begin with a conversation about what matters to each of you.",
    responder_type: "guest",
    responder_name: "Jordan Lee",
    responder_title: "Founder & operator",
    guest_id: guestId,
    responder_avatar_url: null,
    created_at: "2026-09-20T12:00:00Z",
  },
];
const browser = await chromium.launch({ channel: "chrome", headless: true });
await mkdir(new URL("../output/qa/", import.meta.url), { recursive: true });
let passed = 0;
async function scenario(name, fn) {
  await fn();
  console.log(`PASS ${name}`);
  passed++;
}
async function contextFor(viewport, signed = false) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  let state = [];
  let review = "pending";
  const errors = [];
  if (signed) {
    const token = [
      { alg: "HS256", typ: "JWT" },
      { sub: a, exp: 2100000000, iat: 1700000000, role: "authenticated" },
      "signature",
    ]
      .map((v, i) => (i === 2 ? v : Buffer.from(JSON.stringify(v)).toString("base64url")))
      .join(".");
    await context.addInitScript(
      ({ project, token, a }) =>
        localStorage.setItem(
          `sb-${project}-auth-token`,
          JSON.stringify({
            access_token: token,
            refresh_token: "fixture",
            expires_at: 2100000000,
            expires_in: 3600,
            token_type: "bearer",
            user: {
              id: a,
              email: "alex@test.invalid",
              aud: "authenticated",
              role: "authenticated",
            },
          }),
        ),
      { project, token, a },
    );
  }
  await context.route(`${api}/**`, async (route) => {
    const u = new URL(route.request().url());
    const path = u.pathname;
    const payload = route.request().postDataJSON();
    let data = [];
    if (path.includes("/auth/v1/user"))
      return route.fulfill({
        status: signed ? 200 : 401,
        contentType: "application/json",
        body: JSON.stringify(
          signed
            ? { id: a, email: "alex@test.invalid", aud: "authenticated", role: "authenticated" }
            : { message: "Not signed in" },
        ),
      });
    if (path.endsWith("/profiles")) data = u.searchParams.has("id") ? profiles[0] : profiles;
    else if (path.endsWith("/events")) data = [boston, ...upcoming, shanghai];
    else if (path.endsWith("/guests")) data = guests;
    else if (path.endsWith("/qa_questions")) data = questions;
    else if (path.endsWith("/qa_answers")) data = answers;
    else if (path.endsWith("/has_role")) data = false;
    else if (path.endsWith("/claim_waitlist_for_current_user")) data = null;
    else if (path.endsWith("/room_connections")) {
      if (payload._action === "list") data = state;
      else if (payload._action === "blocks") data = [];
      else if (payload._action === "request") {
        state = [
          {
            id: "c1",
            sender_id: a,
            recipient_id: b,
            name: "Sam Chen",
            reason: payload._payload.reason,
            status: "pending",
            created_at: "2026-09-28T10:00:00Z",
            updated_at: "2026-09-28T10:00:00Z",
          },
        ];
        data = { notification_id: null };
      } else if (payload._action === "withdraw") {
        state[0].status = "withdrawn";
        data = { notification_id: null };
      } else if (payload._action === "accept") {
        state[0].status = "accepted";
        data = { notification_id: null };
      } else if (payload._action === "disconnect") {
        state[0].status = "disconnected";
        data = { notification_id: null };
      }
    } else if (path.endsWith("/reveal_member_contact_email")) data = "sam@contact.invalid";
    else if (path.endsWith("/room_guest_approval")) {
      if (payload._decision) review = payload._decision;
      data = {
        body: answers[0].body,
        question: questions[0].body,
        name: "Jordan Lee",
        title: "Founder & operator",
        status: review,
        expires_at: "2026-10-05T00:00:00Z",
      };
    } else if (path.includes("/rpc/")) data = 0;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  return {
    context,
    page,
    errors,
    setState: (v) => {
      state = v;
    },
  };
}
async function noOverflow(page) {
  assert.ok(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    "No horizontal page overflow",
  );
}
for (const [name, viewport] of [
  ["desktop", { width: 1440, height: 1000 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  const { context, page, errors } = await contextFor(viewport);
  await scenario(
    `${name}: event poster, original event template, correct facts and keyboard close`,
    async () => {
      await page.goto(`${base}/events`);
      await page.getByRole("button", { name: /Founder Dinner/ }).waitFor();
      await noOverflow(page);
      const upcomingCards = page
        .locator(".light-archive-section")
        .first()
        .locator(".light-event-study");
      assert.equal(await upcomingCards.count(), 3);
      assert.deepEqual(await upcomingCards.locator("time").allTextContents(), [
        "Oct 15",
        "Nov 15",
        "Dec 15",
      ]);
      const archive = page.locator(".light-archive-section--muted");
      assert.deepEqual(
        (await archive.locator(".light-event-study__index").allTextContents()).map((s) => s.trim()),
        ["Past event / 02", "Past event / 01"],
      );
      assert.equal(
        await page
          .getByRole("button", { name: /Founder Dinner/ })
          .evaluate((el) => getComputedStyle(el).opacity),
        "1",
      );
      await page.screenshot({ path: `output/qa/events-${name}.png`, fullPage: true });
      await page.getByRole("button", { name: /Founder Dinner/ }).click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      await dialog.getByText("19 founders", { exact: true }).waitFor();
      assert.match(await dialog.innerText(), /Briar Group/);
      assert.ok(!/Shanghai|30 guests|WAIC/.test(await dialog.innerText()));
      assert.equal(
        await dialog.locator("img").evaluate((img) => getComputedStyle(img).objectFit),
        "cover",
      );
      await page.locator(".light-event-story-overlay--open").waitFor();
      await page.screenshot({ path: `output/qa/dinner-${name}.png`, fullPage: false });
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
    },
  );
  if (process.env.ROOM_TEST_EVENTS_ONLY) {
    assert.deepEqual(errors, []);
    await context.close();
    continue;
  }
  await scenario(`${name}: Q&A filter and guest profile`, async () => {
    await page.goto(`${base}/qa`);
    await page.getByRole("link", { name: /Jordan Lee/ }).waitFor();
    await page.screenshot({ path: `output/qa/qa-${name}.png`, fullPage: true });
    await noOverflow(page);
    await page.getByRole("button", { name: "Awaiting answers" }).click();
    assert.equal(await page.locator("#question-" + questionId).count(), 0);
    await page.getByRole("button", { name: "Answered", exact: true }).click();
    await page.getByRole("link", { name: /Jordan Lee/ }).click();
    await page.getByRole("heading", { name: "Jordan Lee" }).waitFor();
    await noOverflow(page);
  });
  await scenario(`${name}: private guest consent requires explicit checkbox`, async () => {
    await page.goto(`${base}/guest-review#token=fixture-private-token`);
    const approve = page.getByRole("button", { name: "Approve this version" });
    await approve.waitFor();
    assert.equal(await approve.isDisabled(), true);
    await page.getByRole("checkbox").check();
    await approve.click();
    await page
      .getByText("Thank you. This version is approved; the team can now publish it.")
      .waitFor();
    await noOverflow(page);
  });
  assert.deepEqual(errors, []);
  await context.close();
}
if (process.env.ROOM_TEST_EVENTS_ONLY) {
  await browser.close();
  console.log(`${passed} event browser scenarios passed.`);
  process.exit(0);
}
const { context, page, errors, setState } = await contextFor({ width: 390, height: 844 }, true);
await scenario("member requests connection with an explicit sharing notice", async () => {
  await page.goto(`${base}/member/${b}`);
  await page.getByRole("button", { name: "Connect ↗", exact: true }).click();
  await page.getByLabel("A reason to meet").fill("I would love to discuss community building.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send connection request" }).click();
  await page.getByRole("link", { name: /Request sent/ }).waitFor();
  await page.getByRole("link", { name: /Request sent/ }).click();
  await page.getByRole("button", { name: "sent", exact: true }).click();
  await page.getByRole("button", { name: "Withdraw request" }).waitFor();
  await page.screenshot({ path: "output/qa/connections-mobile.png", fullPage: true });
  await noOverflow(page);
  await page.getByRole("button", { name: "Withdraw request" }).click();
  await page.getByText(/withdrawn ·/).waitFor();
});
await scenario("recipient accepts; contact copy appears; disconnect removes it", async () => {
  setState([
    {
      id: "c2",
      sender_id: b,
      recipient_id: a,
      name: "Sam Chen",
      reason: "Let’s compare notes about building a community.",
      status: "pending",
      created_at: "2026-09-28T10:00:00Z",
      updated_at: "2026-09-28T10:00:00Z",
    },
  ]);
  await page.reload();
  const accept = page.getByRole("button", { name: "Accept introduction" });
  await accept.waitFor();
  assert.ok(await accept.isDisabled());
  await page.getByRole("checkbox").check();
  await accept.click();
  await page.getByRole("button", { name: "connected", exact: true }).click();
  await page.getByRole("button", { name: "View contact email" }).click();
  await page.getByRole("link", { name: "Write email" }).waitFor();
  assert.equal(
    await page.getByRole("link", { name: "Write email" }).getAttribute("href"),
    "mailto:sam@contact.invalid",
  );
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Disconnect", exact: true }).click();
  await page.getByText("No connections yet. Start with someone’s story.").waitFor();
  assert.equal(await page.getByRole("link", { name: "Write email" }).count(), 0);
});
assert.deepEqual(errors, []);
await context.close();
await browser.close();
console.log(`\n${passed} browser scenarios passed (isolated API fixtures; no real messages sent).`);
