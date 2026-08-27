# Using awesometime badges in Notion

Notion pages render Markdown-style content and plain image blocks, so any awesometime badge works there too — no integration, no API key.

## Steps

1. In any Notion page, type `/image` and choose **"Embed link"** (not "Upload"), or just paste an image URL directly onto its own line — Notion offers to turn it into an image block automatically.
2. Paste an awesometime URL, e.g.:
   ```
   https://awesometime.vercel.app/api?period=quarter&style=gradient
   ```
3. Resize/align it like any other image block.

Good candidates for a Notion doc specifically: `period=week`/`month`/`quarter` next to a roadmap or OKR list, or `type=dayssince` for "days since last deploy" at the top of an incident/runbook page.

## The one honest caveat: caching

GitHub's own image proxy (camo) respects the `Cache-Control` header awesometime sends (`max-age=3600` — refreshes within about an hour of being viewed). **Notion does not behave the same way.** Notion caches external images on its own infrastructure, and the refresh interval isn't documented or guaranteed — in practice it can be anywhere from a few hours to a few days before a Notion-embedded badge shows a new value, regardless of what `Cache-Control` says.

Practical implications:

- **Good fit**: `period=` badges (day/week/month/quarter/year) and `dayssince`/`countdown` at day-level granularity — being a day or two stale doesn't really matter for "how much of this quarter is left."
- **Bad fit**: relying on the live-ticking `motion` seconds animation for real-time accuracy in a Notion doc — the underlying SVG will still animate once loaded (it's client-side SMIL, not dependent on Notion's refresh), but the *day/hour/minute numbers themselves* baked into that particular cached fetch may be stale by however long Notion took to last refresh it.
- **If you need a guaranteed-fresh number**: delete the image block and re-paste the URL — this forces Notion to fetch it as a new image rather than serving its cache.

This isn't an awesometime limitation — any dynamic badge service (github-readme-stats included) has the same Notion-caching behavior, since it's how Notion's own image pipeline works, not something a `Cache-Control` header can override.
