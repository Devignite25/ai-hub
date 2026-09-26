import type { Metadata } from "next";
import { FEED_SOURCES } from "@/lib/sources/registry";
import { ARXIV_CATEGORIES } from "@/lib/collectors/arxiv";
import { ExternalMark } from "@/components/cards";

export const metadata: Metadata = {
  title: "Sources",
  description: "Every public source The Wider Lens aggregates from: RSS feeds, arXiv, GitHub, and the Hugging Face Hub.",
};

export default function SourcesPage() {
  const feeds = FEED_SOURCES.filter((f) => f.enabled);
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-black tracking-tight">Sources</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        The Wider Lens reads only public sources, server-side. Headlines and short excerpts are shown;
        full stories live with their original publishers. Sources can be added or removed in
        <code className="mx-1 rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">lib/sources/registry.ts</code>
        without touching the rest of the app.
      </p>

      <h2 className="mt-8 text-xl font-bold">News feeds (RSS/Atom)</h2>
      <ul className="mt-3 divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {feeds.map((f) => (
          <li key={f.id} className="flex items-center justify-between gap-4 p-3">
            <div>
              <p className="font-semibold">{f.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{f.type} feed</p>
            </div>
            <a href={f.siteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
              Visit site<ExternalMark />
            </a>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-xl font-bold">APIs</h2>
      <ul className="mt-3 space-y-3">
        <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="font-semibold">arXiv API <span className="ml-1 rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-medium text-violet-800 dark:bg-violet-950 dark:text-violet-300">research</span></p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Categories: {ARXIV_CATEGORIES.join(", ")}. Queried at most once per page render; results cached for 60 minutes.
          </p>
        </li>
        <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="font-semibold">GitHub REST API <span className="ml-1 rounded bg-zinc-200 px-1.5 py-0.5 text-[11px] font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">github</span></p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Curated AI topic searches plus latest releases. Works without a token (60 requests/hour);
            set <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">GITHUB_TOKEN</code> for 5,000/hour. Cached 30 minutes.
          </p>
        </li>
        <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="font-semibold">Hugging Face Hub API <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">huggingface</span></p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Public model listings sorted by recent update and by likes. No key required. Cached 60 minutes.
          </p>
        </li>
        <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="font-semibold">OpenRouter API <span className="ml-1 rounded bg-indigo-100 px-1.5 py-0.5 text-[11px] font-medium text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">models</span></p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Public model directory with real release timestamps — powers the “Newly released” model list.
            No key required. Cached 60 minutes.
          </p>
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-bold">What we don&apos;t do</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
        <li>No scraping of sites without public feeds or APIs.</li>
        <li>No invented statistics — star counts, likes, and downloads come straight from the APIs.</li>
        <li>No full-article republication — excerpts only, always linking to the original.</li>
      </ul>
    </div>
  );
}
