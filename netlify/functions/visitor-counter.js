// Visitor counter backed by Netlify Blobs.
//
// This site has NO build step (static HTML, no `npm install`), so the
// `@netlify/blobs` package cannot be resolved at runtime. Instead we talk to
// the Netlify Blobs HTTP API directly with the global `fetch` (Node 18+),
// which needs no dependencies, no imports, and no bundling.
//
// Connection details are injected by the runtime in the base64-encoded
// `NETLIFY_BLOBS_CONTEXT` env var, which decodes to:
//   { siteID, token, edgeURL, uncachedEdgeURL, apiURL, ... }
//
// The blob is addressed at:  {edgeURL}/{siteID}/site:{store}/{key}
// (the store name is prefixed with "site:" for site-scoped stores).

const STORE = "visitor-counter";
const KEY = "count";
const SEED = 175125;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Decode NETLIFY_BLOBS_CONTEXT and build the blob URL + auth header.
function getBlobsConnection() {
  const raw = process.env.NETLIFY_BLOBS_CONTEXT;
  if (!raw) {
    throw new Error("NETLIFY_BLOBS_CONTEXT is not set");
  }

  const ctx = JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
  const { siteID, token } = ctx;
  if (!siteID || !token) {
    throw new Error("Blobs context missing siteID or token");
  }

  // Prefer the edge URL (what functions normally use); fall back to the API.
  const base = ctx.edgeURL || ctx.uncachedEdgeURL;
  const url = base
    ? `${base}/${siteID}/site:${STORE}/${KEY}`
    : `${ctx.apiURL || "https://api.netlify.com"}/api/v1/blobs/${siteID}/site:${STORE}/${KEY}`;

  return { url, token };
}

exports.handler = async (event) => {
  // Preflight support for cross-origin browser calls.
  if (event && event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  try {
    const { url, token } = getBlobsConnection();
    const auth = { authorization: `Bearer ${token}` };

    // 1. Read the current count (404 / empty => first visit, use the seed).
    let current = SEED;
    const getRes = await fetch(url, { headers: auth });
    if (getRes.ok) {
      const text = (await getRes.text()).trim();
      const parsed = parseInt(text, 10);
      if (Number.isFinite(parsed)) {
        current = parsed;
      }
    } else if (getRes.status !== 404) {
      throw new Error(`Blobs GET failed: ${getRes.status}`);
    }

    // 2. Increment.
    const next = current + 1;

    // 3. Write the new value back.
    const putRes = await fetch(url, {
      method: "PUT",
      headers: { ...auth, "content-type": "text/plain" },
      body: String(next),
    });
    if (!putRes.ok) {
      throw new Error(`Blobs PUT failed: ${putRes.status}`);
    }

    // 4. Return the updated count.
    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ count: next }),
    };
  } catch (err) {
    console.error("visitor-counter error:", err);
    return {
      statusCode: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "counter unavailable" }),
    };
  }
};
