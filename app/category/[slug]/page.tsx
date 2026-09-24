import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, type CategorySlug } from "@/lib/types";
import { getStories } from "@/lib/data";
import { StoryCard, EmptyState } from "@/components/cards";

export const revalidate = 900;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return { title: "Category not found" };
  return {
    title: `${cat.label} — AI News`,
    description: cat.blurb,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === (slug as CategorySlug));
  if (!cat) notFound();
  const stories = (await getStories()).filter((s) => s.category === cat.slug);
  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">{cat.label}</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{cat.blurb}</p>
      {stories.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <StoryCard key={s.id} cluster={s} />
          ))}
        </div>
      ) : (
        <div className="mt-6"><EmptyState message={`No ${cat.label.toLowerCase()} stories right now. Check back soon.`} /></div>
      )}
    </div>
  );
}
