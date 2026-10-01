import type { Metadata } from "next";
import { getRepos, getOwnRepos } from "@/lib/data";
import { RepoCard, SectionHeader, EmptyState, ExternalNote } from "@/components/cards";
import { OwnProjectCard } from "@/components/clara-card";

export const revalidate = 1800; // 30 min — GitHub

export const metadata: Metadata = {
  title: "Open Source Watch",
  description: "Notable AI open-source repositories, star counts, and latest releases from GitHub.",
};

export default async function OpenSourcePage() {
  const [repos, own] = await Promise.all([getRepos(), getOwnRepos()]);
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Open Source Watch</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Notable AI repositories on GitHub. Star counts are current figures from the GitHub API —
        we never show invented growth statistics.
      </p>
      {own.length > 0 && (
        <section aria-labelledby="ours" className="mt-6">
          <SectionHeader title="From The Wider Lens" />
          <p className="-mt-2 mb-3 text-xs text-zinc-500 dark:text-zinc-400">
            Our own open-source projects, shown separately: they aren&apos;t part of the ranking below.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {own.map((r) => (
              <OwnProjectCard key={r.id} repo={r} />
            ))}
          </div>
        </section>
      )}
      <div className="mt-6">
        <SectionHeader title="Repositories" />
        {repos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((r) => (
              <RepoCard key={r.id} repo={r} />
            ))}
          </div>
        ) : (
          <EmptyState message="Repository data is temporarily unavailable — GitHub may be rate-limiting or unreachable. Add a GITHUB_TOKEN to raise limits." />
        )}
        <div className="mt-4"><ExternalNote /></div>
      </div>
    </div>
  );
}
