import { getStore } from "@netlify/blobs";

// Starting value used the first time the counter runs (no stored value yet).
const SEED = 175125;
const KEY = "count";

export default async function handler(req, context) {
  // CORS headers so the page can call this from any origin
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };

  try {
    // Strong consistency so each visit reads the latest value before incrementing.
    const store = getStore({ name: "visitor-counter", consistency: "strong" });

    // Read current count (returns null if never set).
    const current = await store.get(KEY, { type: "json" });

    // First visit seeds at SEED; every subsequent visit increments by 1.
    const next = current === null ? SEED : current + 1;
    await store.setJSON(KEY, next);

    return new Response(JSON.stringify({ count: next }), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("visitor-counter error:", err);
    return new Response(JSON.stringify({ error: "counter unavailable" }), {
      status: 500,
      headers,
    });
  }
}

export const config = {
  path: "/.netlify/functions/visitor-counter",
};
