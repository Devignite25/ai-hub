import { NextResponse } from "next/server";
import { getTodayStories } from "@/lib/data";

// Feed text comes from RSS/Atom sources that HTML-encode entities.
// Decode them so downstream consumers (video cards, captions) get clean text.
function decodeHtml(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

// Machine-readable feed of the day's top AI stories, for the
// @thewiderlensen Instagram pipeline. Only clusters corroborated by at
// least two independent outlets are included, matching the pipeline's
// two-outlet verification rule. Refreshes every 15 minutes (same as /latest).
export const revalidate = 900;

const MAX_STORIES = 6;

export async function GET() {
  const stories = await getTodayStories();
  const qualified = stories
    .filter((s) => s.sources.length >= 2)
    .slice(0, MAX_STORIES)
    .map((s) => ({
      headline: decodeHtml(s.primary.title),
      summary: decodeHtml(s.primary.description),
      category: s.category,
      companies: s.companies,
      publishedAt: s.publishedAt,
      importanceScore: Math.round(s.importanceScore),
      imageUrl: s.primary.imageUrl ?? null,
      sourceCount: s.sources.length,
      sources: s.sources.map((a) => ({
        outlet: a.source,
        type: a.sourceType,
        title: decodeHtml(a.title),
        url: a.url,
      })),
    }));

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      site: "https://hackzgaming.com/latest",
      storyCount: qualified.length,
      stories: qualified,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300",
      },
    },
  );
}
