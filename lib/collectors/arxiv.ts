// arXiv collector. Uses the public export.arxiv.org API (Atom).
// Respect the arXiv usage policy: single query per page load, no hammering.

import { XMLParser } from "fast-xml-parser";
import { fetchText } from "../fetch";
import { REVALIDATE } from "../sources/registry";
import type { ResearchPaper } from "../types";

export const ARXIV_CATEGORIES = [
  "cs.AI", // Artificial Intelligence
  "cs.LG", // Machine Learning
  "cs.CL", // Computation and Language
  "cs.CV", // Computer Vision
  "cs.RO", // Robotics
  "stat.ML", // Machine Learning (stats)
] as const;

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", trimValues: true });

function entryLink(entry: Record<string, unknown>): string {
  const links = entry["link"];
  const arr = Array.isArray(links) ? links : links ? [links] : [];
  for (const l of arr) {
    if (typeof l === "object" && l !== null) {
      const o = l as Record<string, unknown>;
      if (o["@_rel"] === "alternate" && typeof o["@_href"] === "string") return o["@_href"];
    }
  }
  return "";
}

function authorNames(authors: unknown): string[] {
  const a = (authors as Record<string, unknown>)?.["author"];
  if (!a) return [];
  const arr = Array.isArray(a) ? a : [a];
  return arr
    .map((x) => (typeof x === "object" && x !== null ? String((x as Record<string, unknown>)["name"] ?? "") : ""))
    .filter(Boolean)
    .slice(0, 12);
}

function parseDate(v: unknown): string | null {
  const s = typeof v === "string" ? v : "";
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

export function parseArxiv(xml: string): ResearchPaper[] {
  let doc: Record<string, unknown>;
  try {
    doc = parser.parse(xml) as Record<string, unknown>;
  } catch {
    return [];
  }
  const feed = doc["feed"] as Record<string, unknown> | undefined;
  const entries = feed?.["entry"];
  const arr: unknown[] = Array.isArray(entries) ? entries : entries ? [entries] : [];
  const papers: ResearchPaper[] = [];
  for (const raw of arr) {
    if (typeof raw !== "object" || raw === null) continue;
    const e = raw as Record<string, unknown>;
    const idUrl = String(e["id"] ?? "");
    const m = idUrl.match(/arxiv\.org\/abs\/([\w.\-/]+)/);
    const arxivId = m?.[1]?.replace(/v\d+$/, "") ?? "";
    if (!arxivId) continue;
    const cats = String(e["arxiv:primary_category"] ?? "");
    const allCats = [cats]
      .concat(
        (Array.isArray(e["category"]) ? e["category"] : e["category"] ? [e["category"]] : []).map((c) =>
          typeof c === "object" && c !== null ? String((c as Record<string, unknown>)["@_term"] ?? "") : "",
        ),
      )
      .filter(Boolean);
    papers.push({
      id: arxivId,
      title: String(e["title"] ?? "").replace(/\s+/g, " ").trim().slice(0, 300),
      authors: authorNames(e),
      abstract: String(e["summary"] ?? "").replace(/\s+/g, " ").trim().slice(0, 900),
      url: `https://arxiv.org/abs/${arxivId}`,
      pdfUrl: `https://arxiv.org/pdf/${arxivId}`,
      publishedAt: parseDate(e["published"]) ?? new Date().toISOString(),
      updatedAt: parseDate(e["updated"]) ?? undefined,
      categories: allCats,
      primaryCategory: cats,
    });
  }
  return papers;
}

/** Recent AI-relevant papers, newest first. maxResults kept small for rate limits. */
export async function collectArxiv(maxResults = 30): Promise<ResearchPaper[]> {
  const query = ARXIV_CATEGORIES.map((c) => `cat:${c}`).join("+OR+");
  const url =
    `https://export.arxiv.org/api/query?search_query=${query}` +
    `&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;
  const xml = await fetchText(url, { timeoutMs: 20000, revalidate: REVALIDATE.research });
  return parseArxiv(xml);
}
