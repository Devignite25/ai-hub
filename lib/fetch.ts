// Server-side fetch helper: timeouts + Next.js data-cache revalidate windows.
// Every external call in the collectors goes through here so one slow or dead
// upstream can never hang a page render.

export interface FetchOptions {
  timeoutMs?: number;
  revalidate?: number; // seconds; maps to fetch(..., { next: { revalidate } })
  headers?: Record<string, string>;
}

const DEFAULT_HEADERS: Record<string, string> = {
  // Identify ourselves politely; some feeds block generic user agents.
  "User-Agent": "AIHub/1.0 (AI news aggregator; +https://ai-hub.vercel.app)",
  Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
};

export async function fetchText(url: string, opts: FetchOptions = {}): Promise<string> {
  const { timeoutMs = 12000, revalidate, headers } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { ...DEFAULT_HEADERS, ...(headers ?? {}) },
      ...(revalidate !== undefined ? { next: { revalidate } } : {}),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson<T>(url: string, opts: FetchOptions = {}): Promise<T> {
  const text = await fetchText(url, opts);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON from ${url}`);
  }
}
