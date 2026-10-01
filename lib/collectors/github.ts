// GitHub collector. Public REST API; works without a token in reduced mode
// (60 req/hour). Set GITHUB_TOKEN to raise limits to 5,000 req/hour.
// Never invents statistics — only reports fields the API actually returns.

import { fetchJson } from "../fetch";
import { REVALIDATE } from "../sources/registry";
import type { Repo } from "../types";

const API = "https://api.github.com";

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

interface GhRepoJson {
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  updated_at: string;
  pushed_at: string;
}

interface GhReleaseJson {
  name: string | null;
  tag_name: string;
  html_url: string;
  published_at: string | null;
}

function toRepo(j: GhRepoJson, release: GhReleaseJson | null): Repo {
  return {
    id: j.full_name,
    name: j.name,
    fullName: j.full_name,
    description: (j.description ?? "").slice(0, 300),
    url: j.html_url,
    stars: j.stargazers_count ?? 0,
    forks: j.forks_count ?? 0,
    language: j.language ?? undefined,
    topics: (j.topics ?? []).slice(0, 10),
    updatedAt: j.updated_at ?? j.pushed_at,
    latestRelease: release?.published_at
      ? {
          name: (release.name ?? release.tag_name).slice(0, 120),
          tag: release.tag_name,
          url: release.html_url,
          publishedAt: release.published_at,
        }
      : null,
  };
}

async function latestRelease(fullName: string): Promise<GhReleaseJson | null> {
  try {
    const r = await fetchJson<GhReleaseJson>(`${API}/repos/${fullName}/releases/latest`, {
      timeoutMs: 15000,
      revalidate: REVALIDATE.github,
      headers: headers(),
    });
    return r;
  } catch {
    return null; // many repos have no releases — not an error
  }
}

/** Run async tasks in small batches to avoid connection throttling. */
async function batched<T>(tasks: (() => Promise<T>)[], size = 4): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < tasks.length; i += size) {
    const batch = await Promise.allSettled(tasks.slice(i, i + size).map((t) => t()));
    for (const r of batch) out.push(r.status === "fulfilled" ? r.value : (null as T));
  }
  return out;
}

/** Curated AI topics, searched by stars; releases attached for the top repos only
 *  to stay well under GitHub's unauthenticated rate limits (60 core req/hr). */
const AI_TOPIC_QUERIES = ["machine-learning", "deep-learning", "llm", "generative-ai"];

export async function collectRepos(perTopic = 6, releaseLimit = 12): Promise<Repo[]> {
  const out: Repo[] = [];
  const seen = new Map<string, GhRepoJson>();
  for (const topic of AI_TOPIC_QUERIES) {
    const url = `${API}/search/repositories?q=topic:${encodeURIComponent(topic)}+stars:>500&sort=stars&order=desc&per_page=${perTopic}`;
    const data = await fetchJson<{ items: GhRepoJson[] }>(url, {
      timeoutMs: 30000,
      revalidate: REVALIDATE.github,
      headers: headers(),
    });
    for (const item of data.items ?? []) {
      if (!seen.has(item.full_name)) seen.set(item.full_name, item);
    }
  }
  const top = [...seen.values()]
    .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
    .slice(0, releaseLimit);
  // Releases fetched in small batches; failures yield null.
  const releases = await batched(top.map((r) => () => latestRelease(r.full_name)), 4);
  top.forEach((item, i) => {
    out.push(toRepo(item, releases[i]));
  });
  return out;
}

/** One specific repository (e.g. our own projects), with its latest release. */
export async function collectRepo(fullName: string): Promise<Repo> {
  const item = await fetchJson<GhRepoJson>(`${API}/repos/${fullName}`, {
    timeoutMs: 30000,
    revalidate: REVALIDATE.github,
    headers: headers(),
  });
  return toRepo(item, await latestRelease(fullName));
}
