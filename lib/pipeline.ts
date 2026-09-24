// Deduplication + story clustering. No LLM — title normalization plus
// Jaccard token similarity, which is cheap and serverless-friendly.

import type { Article, StoryCluster } from "./types";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "in", "on", "for", "to", "with", "by",
  "at", "from", "as", "is", "are", "was", "were", "be", "has", "have", "had",
  "it", "its", "this", "that", "these", "those", "will", "would", "could",
  "new", "says", "say", "announces", "announce", "announced", "introduces",
  "introduce", "introduced", "introducing", "launches", "launch", "launched",
  "releases", "release", "released", "unveils", "unveil", "unveiled", "reveals",
  "reveal", "revealed", "just", "now", "here", "how", "what", "why", "when",
  "all", "more", "most", "than", "into", "over", "after", "before", "between",
  "you", "your", "yours", "we", "our", "ours", "they", "their", "theirs",
]);

/** Normalize a title for comparison: lowercase, strip punctuation/stopwords,
 *  crude plural stemming so "calls" matches "call". */
export function normalizeTitle(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[''""“”‘’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .map((w) => (w.length > 4 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w));
}

/** Jaccard similarity between two token sets (0–1). */
export function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter++;
  return inter / (setA.size + setB.size - inter);
}

const CLUSTER_THRESHOLD = 0.38; // same event
const CLUSTER_COMPANY_THRESHOLD = 0.25; // same event when a company is shared
const DEDUP_THRESHOLD = 0.88; // near-identical (same source reposts)

/**
 * Cluster articles about the same event. Prefers the official source as the
 * cluster primary. Near-identical items from the SAME source are dropped.
 */
export function clusterArticles(articles: Article[]): StoryCluster[] {
  const sorted = [...articles].sort(
    (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
  );
  const clusters: { tokens: string[]; articles: Article[] }[] = [];

  for (const article of sorted) {
    const tokens = normalizeTitle(article.title);
    let placed = false;
    for (const c of clusters) {
      const sim = jaccard(tokens, c.tokens);
      const sharedCompany =
        article.companies.length > 0 &&
        c.articles.some((x) => x.companies.some((co) => article.companies.includes(co)));
      if (sim >= DEDUP_THRESHOLD && c.articles.some((x) => x.source === article.source)) {
        placed = true; // same-source repost — drop silently
        break;
      }
      // Merge: strong title similarity, or moderate similarity + shared company.
      if (sim >= CLUSTER_THRESHOLD || (sim >= CLUSTER_COMPANY_THRESHOLD && sharedCompany)) {
        c.articles.push(article);
        placed = true;
        break;
      }
    }
    if (!placed) clusters.push({ tokens, articles: [article] });
  }

  return clusters.map((c, i) => {
    const bySource = [...c.articles].sort((a, b) => sourceRank(a.sourceType) - sourceRank(b.sourceType));
    const primary = bySource[0];
    const companies = [...new Set(c.articles.flatMap((a) => a.companies))];
    const newest = c.articles.reduce((m, a) => (a.publishedAt > m ? a.publishedAt : m), c.articles[0].publishedAt);
    return {
      id: `cluster-${i}-${hashId(primary.url)}`,
      primary,
      sources: bySource,
      category: primary.category,
      companies,
      publishedAt: newest,
      importanceScore: 0, // filled by rankClusters()
    };
  });
}

function sourceRank(t: Article["sourceType"]): number {
  return { official: 0, research: 1, journalism: 2, huggingface: 3, github: 4, models: 5, tools: 6 }[t] ?? 7;
}

function hashId(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

// ─── Importance ranking (transparent heuristic; see /methodology) ────────────

const HOUR = 3_600_000;

export function scoreArticle(a: Article, extraSources = 0): number {
  let s = 0;
  // 1. Source authority
  s += { official: 40, research: 30, journalism: 25, huggingface: 15, github: 15, models: 20, tools: 15 }[a.sourceType] ?? 10;
  // 2. Freshness
  const age = Date.now() - +new Date(a.publishedAt);
  if (age < 24 * HOUR) s += 25;
  else if (age < 72 * HOUR) s += 15;
  else if (age < 7 * 24 * HOUR) s += 5;
  // 3. Independent corroboration (cluster size)
  s += Math.min(extraSources * 8, 24);
  // 4. Event-type signals (title keywords only — transparent)
  const t = ` ${a.title} `.toLowerCase();
  if (/(new model|model release|releases model|open-weight|open weight|gpt-|claude |gemini |llama |grok |deepseek|qwen)/.test(t)) s += 10;
  if (a.sourceType === "official" && /(launch|announc|introduc|unveil|release)/.test(t)) s += 8;
  if (/(benchmark|sota|state-of-the-art|breakthrough)/.test(t)) s += 5;
  return Math.min(100, Math.round(s));
}

export function rankClusters(clusters: StoryCluster[]): StoryCluster[] {
  for (const c of clusters) {
    c.importanceScore = scoreArticle(c.primary, c.sources.length - 1);
  }
  return clusters.sort((a, b) => b.importanceScore - a.importanceScore);
}
