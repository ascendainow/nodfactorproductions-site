import { getStore } from "@netlify/blobs";

const SEED = 175000;
const KEY = "count";

export default async function handler(req, context) {
  // CORS headers so the page can call this from any origin
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const store = getStore("visitor-counter");

    // Read current count (returns null if never set)
    let current = await store.get(KEY, { type: "json" });
    if (current === null) {
      current = SEED;
    }

    const next = current + 1;
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
