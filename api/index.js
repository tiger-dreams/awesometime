import { renderFromQuery } from '../lib/render.js';

export const config = { runtime: 'edge' };

// Successful badges change slowly, so they are cached for an hour. An error
// card means the URL itself is wrong — caching that for an hour would keep
// a corrected URL stuck on the error, so errors only get 60 seconds.
const CACHE_OK = 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400';
const CACHE_ERROR = 'public, max-age=60, s-maxage=60';

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());
  const { svg, status } = renderFromQuery(query, new Date());

  return new Response(svg, {
    status,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': status === 200 ? CACHE_OK : CACHE_ERROR,
    },
  });
}
