import type { Metadata } from "next";
import { getStories } from "@/lib/data";
import { StoryCard, EmptyState } from "@/components/cards";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Latest AI News",
  description: "The latest AI news stories, clustered across sources and ranked by importance.",
};

export default async function LatestPage() {
  const stories = await getStories();
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Latest AI</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {stories.length} stories, newest first. Related coverage is grouped — expand “View N sources” to compare outlets.
      </p>
      {stories.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <StoryCard key={s.id} cluster={s} />
          ))}
        </div>
      ) : (
        <div className="mt-6"><EmptyState message="No stories available right now — sources may be temporarily unreachable. Please try again shortly." /></div>
      )}
    </div>
  );
}
