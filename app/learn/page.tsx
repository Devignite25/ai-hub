import type { Metadata } from "next";
import Link from "next/link";
import { LEARN_TOPICS, LEARN_LEVELS } from "@/lib/learn";

export const metadata: Metadata = {
  title: "Learn AI",
  description: "Beginner-friendly explanations of AI concepts: LLMs, transformers, RAG, agents, quantization, and more.",
};

export default function LearnPage() {
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Learn AI</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Evergreen explainers on fundamental AI concepts — no account, no tracking, just reading.
      </p>
      {LEARN_LEVELS.map((level) => (
        <section key={level.slug} className="mt-8" aria-labelledby={level.slug}>
          <h2 id={level.slug} className="text-xl font-bold tracking-tight">{level.label}</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LEARN_TOPICS.filter((t) => t.level === level.slug).map((t) => (
              <Link
                key={t.slug}
                href={`/learn/${t.slug}`}
                className="rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <p className="font-bold">{t.title}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
