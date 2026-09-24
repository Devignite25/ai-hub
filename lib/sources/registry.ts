import type { SourceType } from "../types";

/** Revalidate windows (seconds) per data type. */
export const REVALIDATE = {
  news: 900, // 15 min — breaking/current news
  models: 3600, // 60 min — Hugging Face / model trackers
  research: 3600, // 60 min — arXiv
  github: 1800, // 30 min — GitHub repos/releases
} as const;

/** One RSS/Atom feed in the source registry. */
export interface FeedSource {
  id: string;
  name: string;
  type: SourceType;
  feedUrl: string;
  siteUrl: string;
  enabled: boolean;
  priority: number; // 1 (highest) – 5; official sources rank highest
  maxItems: number;
  verified: boolean; // true = feed XML was observed live on 2026-09-24
}

/**
 * RSS/Atom source registry. Add/remove sources here — the rest of the
 * pipeline (collect → normalize → rank → render) needs no other changes.
 * Every entry is fetched server-side with a timeout; one failing feed
 * never breaks the page (Promise.allSettled).
 *
 * All feed URLs below were verified live (XML actually fetched) on 2026-09-24.
 * Sources with no working public feed (Anthropic, Meta AI, xAI, Cohere),
 * bot-walled feeds (VentureBeat, Unite.AI), or dead feeds (AI News, TLDR AI)
 * are intentionally omitted.
 */
export const FEED_SOURCES: FeedSource[] = [
  // ── Official AI sources (priority 1) ──────────────────────────────────
  {
    id: "openai-news",
    name: "OpenAI News",
    type: "official",
    feedUrl: "https://openai.com/news/rss.xml",
    siteUrl: "https://openai.com/news",
    enabled: true,
    priority: 1,
    maxItems: 10,
    verified: true,
  },
  {
    id: "deepmind-blog",
    name: "Google DeepMind Blog",
    type: "official",
    feedUrl: "https://deepmind.google/blog/rss.xml",
    siteUrl: "https://deepmind.google/discover/blog/",
    enabled: true,
    priority: 1,
    maxItems: 10,
    verified: true,
  },
  {
    id: "google-ai-blog",
    name: "Google Blog — AI",
    type: "official",
    feedUrl: "https://blog.google/technology/ai/rss/",
    siteUrl: "https://blog.google/technology/ai/",
    enabled: true,
    priority: 1,
    maxItems: 12,
    verified: true,
  },
  {
    id: "hf-blog",
    name: "Hugging Face Blog",
    type: "official",
    feedUrl: "https://huggingface.co/blog/feed.xml",
    siteUrl: "https://huggingface.co/blog",
    enabled: true,
    priority: 1,
    maxItems: 12,
    verified: true,
  },
  {
    id: "nvidia-blog",
    name: "NVIDIA Blog",
    type: "official",
    feedUrl: "https://blogs.nvidia.com/feed/",
    siteUrl: "https://blogs.nvidia.com",
    enabled: true,
    priority: 1,
    maxItems: 12,
    verified: true,
  },
  {
    id: "mistral-news",
    name: "Mistral AI News",
    type: "official",
    feedUrl: "https://mistral.ai/rss.xml",
    siteUrl: "https://mistral.ai/news/",
    enabled: true,
    priority: 1,
    maxItems: 10,
    verified: true,
  },
  {
    id: "msft-research",
    name: "Microsoft Research Blog",
    type: "official",
    feedUrl: "https://www.microsoft.com/en-us/research/feed/",
    siteUrl: "https://www.microsoft.com/en-us/research/",
    enabled: true,
    priority: 1,
    maxItems: 10,
    verified: true,
  },
  {
    id: "stability-news",
    name: "Stability AI News",
    type: "official",
    feedUrl: "https://stability.ai/news-updates?format=rss",
    siteUrl: "https://stability.ai/news",
    enabled: true,
    priority: 1,
    maxItems: 8,
    verified: true,
  },
  {
    id: "transformer-circuits",
    name: "Transformer Circuits",
    type: "official",
    feedUrl: "https://transformer-circuits.pub/feed.xml",
    siteUrl: "https://transformer-circuits.pub",
    enabled: true,
    priority: 1,
    maxItems: 6,
    verified: true,
  },
  // ── Reputable tech/AI publications (priority 3–4) ─────────────────────
  {
    id: "techcrunch-ai",
    name: "TechCrunch — AI",
    type: "journalism",
    feedUrl: "https://techcrunch.com/category/artificial-intelligence/feed/",
    siteUrl: "https://techcrunch.com/category/artificial-intelligence/",
    enabled: true,
    priority: 3,
    maxItems: 25,
    verified: true,
  },
  {
    id: "the-verge",
    name: "The Verge",
    type: "journalism",
    feedUrl: "https://www.theverge.com/rss/index.xml",
    siteUrl: "https://www.theverge.com",
    enabled: true,
    priority: 3,
    maxItems: 25,
    verified: true,
  },
  {
    id: "mit-tr-ai",
    name: "MIT Technology Review — AI",
    type: "journalism",
    feedUrl: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
    siteUrl: "https://www.technologyreview.com/topic/artificial-intelligence/",
    enabled: true,
    priority: 3,
    maxItems: 20,
    verified: true,
  },
  {
    id: "ars-technica",
    name: "Ars Technica",
    type: "journalism",
    feedUrl: "https://feeds.arstechnica.com/arstechnica/index",
    siteUrl: "https://arstechnica.com",
    enabled: true,
    priority: 4,
    maxItems: 20,
    verified: true,
  },
  {
    id: "wired-ai",
    name: "Wired — AI",
    type: "journalism",
    feedUrl: "https://www.wired.com/feed/tag/ai/latest/rss",
    siteUrl: "https://www.wired.com/tag/ai/",
    enabled: true,
    priority: 4,
    maxItems: 20,
    verified: true,
  },
  {
    id: "marktechpost",
    name: "MarkTechPost",
    type: "journalism",
    feedUrl: "https://www.marktechpost.com/feed/",
    siteUrl: "https://www.marktechpost.com",
    enabled: true,
    priority: 4,
    maxItems: 20,
    verified: true,
  },
  {
    id: "the-decoder",
    name: "The Decoder",
    type: "journalism",
    feedUrl: "https://the-decoder.com/feed/",
    siteUrl: "https://the-decoder.com",
    enabled: true,
    priority: 4,
    maxItems: 20,
    verified: true,
  },
  {
    id: "tds",
    name: "Towards Data Science",
    type: "journalism",
    feedUrl: "https://towardsdatascience.com/feed",
    siteUrl: "https://towardsdatascience.com",
    enabled: true,
    priority: 4,
    maxItems: 15,
    verified: true,
  },
  {
    id: "import-ai",
    name: "Import AI",
    type: "journalism",
    feedUrl: "https://importai.substack.com/feed",
    siteUrl: "https://importai.substack.com",
    enabled: true,
    priority: 4,
    maxItems: 8,
    verified: true,
  },
];

export function enabledFeeds(): FeedSource[] {
  return FEED_SOURCES.filter((f) => f.enabled);
}
