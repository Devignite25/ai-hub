import type { Metadata } from "next";
import Link from "next/link";
import { getPapers } from "@/lib/data";
import { PaperCard, SectionHeader, EmptyState } from "@/components/cards";
import { ARXIV_CATEGORIES } from "@/lib/collectors/arxiv";

export const revalidate = 3600; // 60 min — arXiv

export const metadata: Metadata = {
  title: "AI Research",
  description: "Recent AI research papers from arXiv across machine learning, NLP, vision, and robotics.",
};

const CAT_LABELS: Record<string, string> = {
  "cs.AI": "Artificial Intelligence",
  "cs.LG": "Machine Learning",
  "cs.CL": "Language",
  "cs.CV": "Vision",
  "cs.RO": "Robotics",
  "stat.ML": "Statistics ML",
};

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const papers = await getPapers();
  const filtered = cat ? papers.filter((p) => p.categories.some((c) => c.startsWith(cat))) : papers;

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">AI Research</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Recent papers from arXiv (cs.AI, cs.LG, cs.CL, cs.CV, cs.RO, stat.ML). Abstracts are excerpts only —
        read the full paper on arXiv.
      </p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <CatChip cat={undefined} active={!cat} label="All" />
        {ARXIV_CATEGORIES.map((c) => (
          <CatChip key={c} cat={c} active={cat === c} label={CAT_LABELS[c] ?? c} />
        ))}
      </div>
      <div className="mt-6">
        <SectionHeader title={cat ? CAT_LABELS[cat] ?? cat : "Latest papers"} />
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PaperCard key={p.id} paper={p} />
            ))}
          </div>
        ) : (
          <EmptyState message="No papers available right now — arXiv may be temporarily unreachable." />
        )}
      </div>
    </div>
  );
}

function CatChip({ cat, active, label }: { cat?: string; active: boolean; label: string }) {
  return (
    <Link
      href={cat ? `/research?cat=${encodeURIComponent(cat)}` : "/research"}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          : "border border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
      }`}
    >
      {label}
    </Link>
  );
}
