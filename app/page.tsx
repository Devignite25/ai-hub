import Link from "next/link";
import { getStories, getTodayStories, getModels, getPapers, getRepos } from "@/lib/data";
import { CATEGORIES } from "@/lib/types";
import { StoryCard, ArticleCard, ModelCard, PaperCard, RepoCard, SectionHeader, EmptyState, ExternalNote } from "@/components/cards";
import { CategoryChips, CompanyChips } from "@/components/layout";
import { ClaraCard } from "@/components/clara-card";
import { timeAgo } from "@/lib/format";

export const revalidate = 900; // 15 min — breaking/current news window

export default async function HomePage() {
  const [stories, today, models, papers, repos] = await Promise.all([
    getStories(),
    getTodayStories(),
    getModels(),
    getPapers(),
    getRepos(),
  ]);

  const featured = today.slice(0, 3);
  const trending = stories.slice(0, 6);
  const latest = stories.slice(0, 12);
  const toolsAgents = stories
    .filter((s) => s.category === "tools" || s.category === "agents")
    .slice(0, 6);

  // "Today in AI" category breakdown
  const breakdown = CATEGORIES.map((c) => ({
    ...c,
    count: today.filter((s) => s.category === c.slug).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="space-y-12">
      {/* ── TODAY IN AI ─────────────────────────────────────────── */}
      <section aria-labelledby="today">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h1 id="today" className="text-3xl font-black tracking-tight">Today in AI</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {today.length} significant development{today.length === 1 ? "" : "s"} in the last 24 hours
              {breakdown.length > 0 && (
                <> — {breakdown.map((b) => `${b.label}: ${b.count}`).join(" · ")}</>
              )}
            </p>
          </div>
          <Link href="/latest" className="text-sm font-medium text-zinc-600 hover:underline dark:text-zinc-400">
            All stories →
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <StoryCard cluster={featured[0]} featured />
            <div className="grid gap-4">
              {featured.slice(1).map((s) => (
                <StoryCard key={s.id} cluster={s} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState message="No major AI developments in the last 24 hours. Check back soon — feeds refresh every 15 minutes." />
        )}
      </section>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* ── TRENDING / IMPORTANT ──────────────────────────────── */}
        <section aria-labelledby="trending" className="lg:col-span-1">
          <SectionHeader title="Trending / Important" />
          {trending.length > 0 ? (
            <ol className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
              {trending.map((s, i) => (
                <li key={s.id} className="flex gap-3 p-3">
                  <span className="text-lg font-black text-zinc-300 dark:text-zinc-700">{i + 1}</span>
                  <div>
                    <a href={s.primary.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold leading-snug hover:underline">
                      {s.primary.title} <span className="text-zinc-400">↗</span>
                    </a>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {s.primary.source} · {timeAgo(s.publishedAt)}
                      {s.sources.length > 1 && ` · ${s.sources.length} sources`}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState message="No trending stories right now." />
          )}
          <ClaraCard placement="home" />
        </section>

        {/* ── LATEST AI ─────────────────────────────────────────── */}
        <section aria-labelledby="latest" className="lg:col-span-2">
          <SectionHeader title="Latest AI" href="/latest" />
          {latest.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {latest.map((s) => (
                <StoryCard key={s.id} cluster={s} />
              ))}
            </div>
          ) : (
            <EmptyState message="No stories available right now — sources may be temporarily unreachable. Please try again shortly." />
          )}
        </section>
      </div>

      {/* ── NEW MODELS ──────────────────────────────────────────── */}
      <section aria-labelledby="models">
        <SectionHeader title="New Models" href="/models" blurb="Recently updated models on the Hugging Face Hub." />
        {models.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {models.slice(0, 6).map((m) => (
              <ModelCard key={m.id} model={m} />
            ))}
          </div>
        ) : (
          <EmptyState message="Model data is temporarily unavailable." />
        )}
      </section>

      {/* ── LATEST RESEARCH ─────────────────────────────────────── */}
      <section aria-labelledby="research">
        <SectionHeader title="Latest Research" href="/research" blurb="Recent AI papers from arXiv." />
        {papers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {papers.slice(0, 6).map((p) => (
              <PaperCard key={p.id} paper={p} />
            ))}
          </div>
        ) : (
          <EmptyState message="Research data is temporarily unavailable." />
        )}
      </section>

      {/* ── OPEN SOURCE WATCH ───────────────────────────────────── */}
      <section aria-labelledby="opensource">
        <SectionHeader title="Open Source Watch" href="/open-source" blurb="Notable AI repositories and their latest releases." />
        {repos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.slice(0, 6).map((r) => (
              <RepoCard key={r.id} repo={r} />
            ))}
          </div>
        ) : (
          <EmptyState message="Repository data is temporarily unavailable." />
        )}
      </section>

      {/* ── TOOLS & AGENTS ──────────────────────────────────────── */}
      <section aria-labelledby="tools">
        <SectionHeader title="Tools & Agents" href="/category/tools" />
        {toolsAgents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {toolsAgents.map((s) => (
              <ArticleCard key={s.id} article={s.primary} />
            ))}
          </div>
        ) : (
          <EmptyState message="No tool or agent stories right now." />
        )}
      </section>

      {/* ── BROWSE ──────────────────────────────────────────────── */}
      <section aria-labelledby="browse" className="space-y-4">
        <h2 id="browse" className="text-xl font-bold tracking-tight">Browse</h2>
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">Categories</p>
          <CategoryChips />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">Companies</p>
          <CompanyChips />
        </div>
        <ExternalNote />
      </section>
    </div>
  );
}
