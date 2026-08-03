import { getStore } from "@netlify/blobs";

// Public, read-only leaderboard feed for the VIP Rewards page.
// Only rank / display name / points are returned - emails never leave this function.

const TOP_N = 20;

export default async function handler() {
  try {
    const store = getStore("rewards");
    const { blobs } = await store.list({ prefix: "member:" });

    const members = await Promise.all(
      blobs.map((blob) => store.get(blob.key, { type: "json" }))
    );

    const top = members
      .filter((m) => m && m.showOnLeaderboard && Number(m.points) > 0)
      .sort(
        (a, b) =>
          Number(b.points) - Number(a.points) ||
          new Date(a.joinedAt) - new Date(b.joinedAt)
      )
      .slice(0, TOP_N)
      .map((m, i) => ({
        rank: i + 1,
        name: m.displayName,
        points: Number(m.points),
      }));

    return Response.json(
      { updated: new Date().toISOString(), count: top.length, top },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } }
    );
  } catch (err) {
    console.error("leaderboard error:", err);
    return Response.json(
      { error: "leaderboard unavailable", top: [] },
      { status: 500 }
    );
  }
}

export const config = { path: "/api/leaderboard" };
