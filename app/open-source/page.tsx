import type { Metadata } from "next";
import { getRepos } from "@/lib/data";
import { RepoCard, SectionHeader, EmptyState, ExternalNote } from "@/components/cards";

export const revalidate = 1800; // 30 min — GitHub

export const metadata: Metadata = {
  title: "Open Source Watch",
  description: "Notable AI open-source repositories, star counts, and latest releases from GitHub.",
};

export default async function OpenSourcePage() {
  const repos = await getRepos();
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Open Source Watch</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Notable AI repositories on GitHub. Star counts are current figures from the GitHub API —
        we never show invented growth statistics.
      </p>
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
