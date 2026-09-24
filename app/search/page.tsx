import type { Metadata } from "next";
import Link from "next/link";
import { getStories, getModels, getPapers, getRepos } from "@/lib/data";
import { LEARN_TOPICS } from "@/lib/learn";
import { StoryCard, ModelCard, PaperCard, RepoCard, SectionHeader, EmptyState } from "@/components/cards";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Search",
  description: "Search AI Hub's current stories, models, research papers, and repositories.",
};

function matches(q: string, ...fields: (string | undefined)[]): boolean {
  const hay = fields.filter(Boolean).join(" ").toLowerCase();
  return q.split(/\s+/).every((w) => hay.includes(w));
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  if (!query) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-black tracking-tight">Search AI Hub</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Search currently cached stories, models, papers, repositories, and learning topics.
        </p>
        <form action="/search" method="get" className="mt-6 flex gap-2" role="search">
          <input
            type="search"
            name="q"
            placeholder="e.g. llama, robotics, RAG"
            className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            aria-label="Search query"
          />
          <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">
            Search
          </button>
        </form>
      </div>
    );
  }

  const [stories, models, papers, repos] = await Promise.all([
    getStories(),
    getModels(),
    getPapers(),
    getRepos(),
  ]);

  const storyHits = stories.filter((s) =>
    matches(query, s.primary.title, s.primary.description, s.primary.source, ...s.companies, ...s.primary.tags),
  ).slice(0, 12);
  const modelHits = models.filter((m) => matches(query, m.name, m.author, m.pipelineTag, ...m.tags)).slice(0, 9);
  const paperHits = papers.filter((p) => matches(query, p.title, p.abstract, ...p.authors, ...p.categories)).slice(0, 9);
  const repoHits = repos.filter((r) => matches(query, r.fullName, r.description, r.language, ...r.topics)).slice(0, 9);
  const learnHits = LEARN_TOPICS.filter((t) => matches(query, t.title, t.summary)).slice(0, 6);
  const total = storyHits.length + modelHits.length + paperHits.length + repoHits.length + learnHits.length;

  return (
    <div className="space-y-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-black tracking-tight">Results for “{q}”</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{total} result{total === 1 ? "" : "s"} in current content.</p>
        <form action="/search" method="get" className="mt-4 flex gap-2" role="search">
          <input
            type="search"
            name="q"
            defaultValue={q}
            className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            aria-label="Search query"
          />
          <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">
            Search
          </button>
        </form>
      </div>

      {total === 0 && <EmptyState message="No matches in current content. Try a broader term, or check back as feeds refresh." />}

      {storyHits.length > 0 && (
        <section><SectionHeader title="Stories" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{storyHits.map((s) => <StoryCard key={s.id} cluster={s} />)}</div>
        </section>
      )}
      {modelHits.length > 0 && (
        <section><SectionHeader title="Models" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{modelHits.map((m) => <ModelCard key={m.id} model={m} />)}</div>
        </section>
      )}
      {paperHits.length > 0 && (
        <section><SectionHeader title="Research" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{paperHits.map((p) => <PaperCard key={p.id} paper={p} />)}</div>
        </section>
      )}
      {repoHits.length > 0 && (
        <section><SectionHeader title="Repositories" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{repoHits.map((r) => <RepoCard key={r.id} repo={r} />)}</div>
        </section>
      )}
      {learnHits.length > 0 && (
        <section><SectionHeader title="Learn" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {learnHits.map((t) => (
              <Link key={t.slug} href={`/learn/${t.slug}`} className="rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600">
                <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{t.level}</p>
                <p className="mt-1 font-bold">{t.title}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
