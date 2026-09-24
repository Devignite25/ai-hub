// RSS/Atom collector. Parses RSS 2.0, Atom, and RDF feeds into raw items.
// Never throws on malformed content — returns an empty list instead.

import { XMLParser } from "fast-xml-parser";
import { fetchText } from "../fetch";
import { REVALIDATE, type FeedSource } from "../sources/registry";

export interface RawFeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string | null; // ISO or null
  author: string | null;
  imageUrl: string | null;
  guid: string | null;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  processEntities: true,
});

function asString(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if ("#text" in o) return asString(o["#text"]);
    if ("_cdata" in o) return asString(o["_cdata"]);
    if ("__cdata" in o) return asString(o["__cdata"]);
  }
  return "";
}

function first<T>(v: T | T[] | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function pickLink(link: unknown): string {
  if (typeof link === "string") return link;
  if (Array.isArray(link)) {
    const alt =
      link.find((l) => typeof l === "object" && (l as Record<string, unknown>)["@_rel"] === "alternate") ??
      link[0];
    return pickLink(alt);
  }
  if (typeof link === "object" && link !== null) {
    const o = link as Record<string, unknown>;
    if (typeof o["@_href"] === "string") return o["@_href"];
    return asString(o);
  }
  return "";
}

function pickImage(item: Record<string, unknown>): string | null {
  // media:thumbnail / media:content / enclosure / itunes:image
  const mediaThumb = first(item["media:thumbnail"] as unknown[]);
  if (mediaThumb && typeof mediaThumb === "object") {
    const u = (mediaThumb as Record<string, unknown>)["@_url"];
    if (typeof u === "string" && u.startsWith("http")) return u;
  }
  const mediaContent = first(item["media:content"] as unknown[]);
  if (mediaContent && typeof mediaContent === "object") {
    const o = mediaContent as Record<string, unknown>;
    const u = o["@_url"];
    const medium = o["@_medium"];
    if (typeof u === "string" && u.startsWith("http") && (medium === "image" || medium === undefined))
      return u;
  }
  const enclosure = first(item["enclosure"] as unknown[]);
  if (enclosure && typeof enclosure === "object") {
    const o = enclosure as Record<string, unknown>;
    const u = o["@_url"];
    const t = o["@_type"];
    if (typeof u === "string" && u.startsWith("http") && typeof t === "string" && t.startsWith("image/"))
      return u;
  }
  return null;
}

function parseDate(v: unknown): string | null {
  const s = asString(v);
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseFeed(xml: string): RawFeedItem[] {
  let doc: Record<string, unknown>;
  try {
    doc = parser.parse(xml) as Record<string, unknown>;
  } catch {
    return [];
  }

  // RSS 2.0
  const rss = doc["rss"] as Record<string, unknown> | undefined;
  const channel = rss?.["channel"] as Record<string, unknown> | undefined;
  // RDF
  const rdf = doc["rdf:RDF"] as Record<string, unknown> | undefined;
  // Atom
  const atomFeed = doc["feed"] as Record<string, unknown> | undefined;

  const rawItems: unknown[] = [];
  if (channel?.["item"]) rawItems.push(...(Array.isArray(channel["item"]) ? channel["item"] : [channel["item"]]));
  else if (rdf?.["item"]) rawItems.push(...(Array.isArray(rdf["item"]) ? rdf["item"] : [rdf["item"]]));
  else if (atomFeed?.["entry"])
    rawItems.push(...(Array.isArray(atomFeed["entry"]) ? atomFeed["entry"] : [atomFeed["entry"]]));

  const items: RawFeedItem[] = [];
  for (const raw of rawItems) {
    if (typeof raw !== "object" || raw === null) continue;
    const item = raw as Record<string, unknown>;
    const title = stripHtml(asString(item["title"])).slice(0, 300);
    const link = pickLink(item["link"]).trim();
    if (!title || !link || !/^https?:\/\//.test(link)) continue;
    const desc = stripHtml(
      asString(first(item["description"] as unknown[]) ?? item["content:encoded"] ?? item["content"] ?? item["summary"]),
    ).slice(0, 600);
    items.push({
      title,
      link,
      description: desc,
      pubDate: parseDate(item["pubDate"] ?? item["published"] ?? item["updated"] ?? item["dc:date"]),
      author: asString(item["author"] ?? item["dc:creator"]) || null,
      imageUrl: pickImage(item),
      guid: asString(item["guid"]) || null,
    });
  }
  return items;
}

export async function collectFeed(source: FeedSource): Promise<RawFeedItem[]> {
  const xml = await fetchText(source.feedUrl, { timeoutMs: 15000, revalidate: REVALIDATE.news });
  return parseFeed(xml).slice(0, source.maxItems);
}
