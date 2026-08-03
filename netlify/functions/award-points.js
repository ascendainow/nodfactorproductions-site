import { getStore } from "@netlify/blobs";

// Admin-only endpoint for awarding VIP Rewards points.
// Requires the REWARDS_ADMIN_KEY environment variable (set it in the Netlify UI,
// never in client-side code) and an x-admin-key request header that matches it.
//
// Example:
//   curl -X POST https://nodfactorproductions.com/api/award-points \
//     -H "x-admin-key: YOUR_KEY" -H "content-type: application/json" \
//     -d '{"email":"listener@example.com","action":"song_request"}'

const ACTIONS = {
  audio_shoutout: 10,
  video_shoutout: 20,
  youtube_sub: 15,
  song_request: 10,
};

const MAX_DELTA = 1000;

const json = (body, status) => Response.json(body, { status: status || 200 });

export default async function handler(req) {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const adminKey = process.env.REWARDS_ADMIN_KEY;
  if (!adminKey) return json({ error: "REWARDS_ADMIN_KEY is not configured" }, 500);
  if (req.headers.get("x-admin-key") !== adminKey) {
    return json({ error: "unauthorized" }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const email = String(body.email || "").trim().toLowerCase();
  const action = body.action ? String(body.action) : null;
  const delta = Number.isFinite(body.points)
    ? Math.trunc(body.points)
    : ACTIONS[action];

  if (!email) return json({ error: "email is required" }, 400);
  if (!delta) {
    return json(
      { error: "pass a known action or a points number", actions: ACTIONS },
      400
    );
  }
  if (Math.abs(delta) > MAX_DELTA) {
    return json({ error: "points change too large" }, 400);
  }

  const store = getStore("rewards");
  const key = "member:" + email;

  const member = await store.get(key, { type: "json", consistency: "strong" });
  if (!member) return json({ error: "not a rewards member" }, 404);

  const now = new Date().toISOString();
  member.points = Math.max(0, Number(member.points || 0) + delta);
  member.history = (member.history || [])
    .concat([{ action: action || "manual", delta, at: now }])
    .slice(-50);

  if (typeof body.showOnLeaderboard === "boolean") {
    member.showOnLeaderboard = body.showOnLeaderboard;
  }

  await store.setJSON(key, member);

  return json({
    email: member.email,
    displayName: member.displayName,
    points: member.points,
    showOnLeaderboard: member.showOnLeaderboard,
  });
}

export const config = { path: "/api/award-points" };
