import { getStore } from "@netlify/blobs";

// Netlify runs this automatically after every verified form submission.
// The file must be named submission-created.js for the event trigger to fire.

const WELCOME_BONUS = 25;

function safeName(raw) {
  const first = String(raw || "").trim().split(/\s+/)[0] || "";
  return first.replace(/[^\p{L}\p{N}'\-\.]/gu, "").slice(0, 24);
}

export default async function handler(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("bad payload", { status: 200 });
  }

  const payload = body && body.payload;
  if (!payload || payload.form_name !== "rewards-signup") {
    return new Response("ignored", { status: 200 });
  }

  const data = payload.data || {};
  const email = String(data.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return new Response("no email", { status: 200 });
  }

  const store = getStore("rewards");
  const key = "member:" + email;

  const existing = await store.get(key, { type: "json", consistency: "strong" });
  if (existing) {
    return new Response("already a member", { status: 200 });
  }

  const now = new Date().toISOString();

  await store.setJSON(key, {
    email,
    displayName: safeName(data.name) || "Nod Factor VIP",
    points: WELCOME_BONUS,
    joinedAt: now,
    // Opt-in only: hidden from the public board unless the member checked the box.
    showOnLeaderboard: data.leaderboard_optin === "yes",
    history: [{ action: "welcome_bonus", delta: WELCOME_BONUS, at: now }],
  });

  return new Response("member created", { status: 200 });
}
