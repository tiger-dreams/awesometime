import { renderFromQuery } from '../lib/render.js';

export const config = { runtime: 'edge' };

function escapeAttr(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }[c]));
}

/**
 * `/view` — same query params as `/api`, but wraps the badge in a full-page
 * HTML shell instead of returning the raw SVG. Meant for "Add to Home
 * Screen": opening a bare SVG URL directly in Safari renders it at native
 * pixel size pinned to the top-left with a blank white page around it (a
 * plain browser image view has no idea it should fill the screen) — this
 * centers and scales it instead, so a home-screen shortcut actually looks
 * like a full-screen display rather than a small badge in the corner.
 */
export default function handler(req) {
  const { searchParams, origin } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());
  const { status } = renderFromQuery(query, new Date());
  if (status !== 200) {
    // Same error card behavior as /api, just still wrapped for consistency.
  }

  const apiUrl = `${origin}/api?${searchParams.toString()}`;
  const title = query.label || 'awesometime';

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${escapeAttr(title)}</title>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<style>
  html, body {
    margin: 0;
    height: 100%;
    background: #0d1117;
  }
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    min-height: 100dvh;
    padding: 24px;
    box-sizing: border-box;
  }
  img {
    width: 100%;
    max-width: 640px;
    height: auto;
  }
</style>
</head>
<body>
  <img src="${escapeAttr(apiUrl)}" alt="${escapeAttr(title)}">
  <script>
    // Re-fetch periodically so a shortcut left open stays reasonably
    // current — the underlying /api image is still subject to its own
    // Cache-Control (max-age=3600), this just re-triggers the check.
    setTimeout(() => location.reload(), 5 * 60 * 1000);
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
