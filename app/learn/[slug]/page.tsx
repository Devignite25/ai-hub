import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LEARN_TOPICS, LEARN_LEVELS, learnTopicBySlug } from "@/lib/learn";

export function generateStaticParams() {
  return LEARN_TOPICS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = learnTopicBySlug(slug);
  if (!t) return { title: "Topic not found" };
  return {
    title: t.title,
    description: t.summary,
    alternates: { canonical: `/learn/${t.slug}` },
  };
}

export default async function LearnTopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = learnTopicBySlug(slug);
  if (!topic) notFound();
  const levelLabel = LEARN_LEVELS.find((l) => l.slug === topic.level)?.label ?? topic.level;
  const idx = LEARN_TOPICS.findIndex((t) => t.slug === slug);
  const prev = LEARN_TOPICS[idx - 1];
  const next = LEARN_TOPICS[idx + 1];

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/learn" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">← All topics</Link>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-zinc-500">{levelLabel}</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight">{topic.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">{topic.summary}</p>

      <div className="mt-6 space-y-4 text-[1.05rem] leading-relaxed">
        {topic.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-bold uppercase tracking-wide">Key points</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {topic.keyPoints.map((k, i) => (
            <li key={i}>{k}</li>
          ))}
        </ul>
      </div>

      <nav className="mt-8 flex justify-between gap-4 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800" aria-label="More topics">
        {prev ? (
          <Link href={`/learn/${prev.slug}`} className="hover:underline">← {prev.title}</Link>
        ) : <span />}
        {next ? (
          <Link href={`/learn/${next.slug}`} className="text-right hover:underline">{next.title} →</Link>
        ) : <span />}
      </nav>
    </article>
  );
}
