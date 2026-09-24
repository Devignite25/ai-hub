# AI Hub — Real-Time AI News, Research & Discovery

AI news + research + model tracker + open-source tracker + learning center, in one
Next.js app. Aggregates public sources server-side with a transparent, deterministic
pipeline (no LLM, no database, no accounts).

## Local development

Requirements: Node.js 18.18+ (20+ recommended) and npm.

```bash
cd ai-hub
npm install
npm run dev      # http://localhost:3000
```

### Environment variables

Copy `.env.example` to `.env.local` if you want to set any:

| Variable | Required | Purpose |
|---|---|---|
| `GITHUB_TOKEN` | No | GitHub personal access token. Without it the API allows 60 req/hour (reduced mode still works); with it, 5,000/hour. |
| `NEWS_API_KEY` | No | Reserved for an optional news provider. Unused in V1 — leave unset. |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical site URL for sitemap/OpenGraph. Defaults to `https://ai-hub.vercel.app`. |

```bash
cp .env.example .env.local
# edit .env.local, then:
npm run dev
```

## Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init && git add . && git commit -m "AI Hub"
   gh repo create ai-hub --public --source=. --push
   # or push to a repo you create on github.com
   ```
2. **Import into Vercel** — vercel.com → Add New → Project → select the repo.
   Framework preset: Next.js (auto-detected). No build-setting changes needed.
3. **Environment variables** — in the Vercel project settings add (all optional):
   - `GITHUB_TOKEN` — recommended for GitHub rate limits
   - `NEXT_PUBLIC_SITE_URL` — your production domain (e.g. `https://aihub.example.com`)
4. **Deploy** — Vercel builds and deploys automatically on every push to `main`.

No database, no Docker, no extra services — the app is a single Vercel project.

## Architecture

```
External sources (RSS/Atom, arXiv, GitHub, Hugging Face)
        ↓  server-side collectors (lib/collectors/*, timeouts, no secrets in browser)
Normalization → relevance filter → categorization (keyword rules)
        ↓
Deduplication + story clustering (title normalization + Jaccard, no LLM)
        ↓
Importance ranking (transparent heuristic — see /methodology)
        ↓
Next.js data cache (fetch next.revalidate: news 15m, GitHub 30m, models/arXiv 60m)
        ↓
Server-rendered pages (minimal client JS: theme toggle, source expanders)
```

### Key files

- `lib/types.ts` — normalized data model (`Article`, `StoryCluster`, `AiModel`, `ResearchPaper`, `Repo`)
- `lib/sources/registry.ts` — source registry (`FEED_SOURCES`, revalidate windows). Add/remove a feed here; nothing else changes.
- `lib/collectors/` — `rss.ts`, `arxiv.ts`, `github.ts`, `huggingface.ts`
- `lib/relevance.ts` — AI-relevance filter, keyword categorization, company/tag extraction
- `lib/pipeline.ts` — dedup/clustering + importance ranking
- `lib/data.ts` — aggregation with `Promise.allSettled` fault tolerance (one broken source never crashes a page)
- `lib/companies.ts` — company alias registry for filtering and `/companies/[slug]`
- `lib/learn.ts` — 20 evergreen Learn topics (static content)
- `app/` — routes: `/`, `/latest`, `/category/[slug]`, `/models`, `/research`, `/open-source`, `/learn`, `/learn/[slug]`, `/search`, `/companies/[slug]`, `/sources`, `/methodology`, `/about`, `/privacy`, `sitemap.ts`, `robots.ts`

### Adding a source

1. Add an entry to `FEED_SOURCES` in `lib/sources/registry.ts` with a **verified** feed URL
   (feed URL must be observed live — never guess one).
2. Set `type` (`official` ranks highest), `priority`, and `maxItems`.
3. Done — collection, filtering, ranking, and rendering pick it up automatically.

## Scripts

```bash
npm run dev     # development server
npm run build   # production build (must pass clean)
npm start       # serve the production build
```

## Notes & limitations

- Content shown is headlines + short excerpts only; full articles live with original publishers.
- Automated clustering is heuristic — verify via the “View N sources” list on any story.
- GitHub repo lists come from curated topic searches, not a global “trending” computation.
- Model metadata reflects the Hugging Face API; open-weight status is shown only when the license reliably indicates it.
