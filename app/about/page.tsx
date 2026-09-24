import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "What AI Hub is and how it works.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-black tracking-tight">About AI Hub</h1>
      <div className="mt-4 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <p>
          AI Hub is a real-time discovery platform for artificial intelligence: AI news, model
          releases, research papers, open-source projects, tools, and learning resources — in one place.
        </p>
        <p>
          It aggregates public sources (official company blogs, reputable publications, arXiv,
          GitHub, and the Hugging Face Hub) through a transparent, deterministic pipeline — no
          editorial curation, no personalization, no accounts. See the{" "}
          <a href="/methodology" className="font-medium underline">methodology</a> page for exactly
          how stories are collected, clustered, and ranked, and the{" "}
          <a href="/sources" className="font-medium underline">sources</a> page for the full source list.
        </p>
        <p>
          AI Hub shows headlines and short excerpts only, and always links to the original publisher.
          All content belongs to its respective owners.
        </p>
      </div>
    </div>
  );
}
