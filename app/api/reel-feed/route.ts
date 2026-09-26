import { NextResponse } from "next/server";
import { getTodayStories } from "@/lib/data";

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
      headline: s.primary.title,
      summary: s.primary.description,
      category: s.category,
      companies: s.companies,
      publishedAt: s.publishedAt,
      importanceScore: Math.round(s.importanceScore),
      imageUrl: s.primary.imageUrl ?? null,
      sourceCount: s.sources.length,
      sources: s.sources.map((a) => ({
        outlet: a.source,
        type: a.sourceType,
        title: a.title,
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
