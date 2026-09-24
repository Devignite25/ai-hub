import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMPANIES, companyBySlug } from "@/lib/companies";
import { getStories, getModels } from "@/lib/data";
import { StoryCard, ModelCard, SectionHeader, EmptyState, ExternalMark } from "@/components/cards";

export const revalidate = 900;

export function generateStaticParams() {
  return COMPANIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = companyBySlug(slug);
  if (!c) return { title: "Company not found" };
  return { title: `${c.name} — AI News & Models`, description: `Latest AI news, models, and open-source activity from ${c.name}.` };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const company = companyBySlug(slug);
  if (!company) notFound();

  const [stories, models] = await Promise.all([getStories(), getModels()]);
  const companyStories = stories.filter((s) => s.companies.includes(company.slug)).slice(0, 12);
  const companyModels = models
    .filter((m) => company.aliases.some((a) => `${m.author} ${m.id}`.toLowerCase().includes(a)))
    .slice(0, 6);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight">{company.name}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{company.description}</p>
        <a href={company.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium hover:underline">
          Official site<ExternalMark />
        </a>
      </div>

      <section>
        <SectionHeader title={`Latest from ${company.name}`} />
        {companyStories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companyStories.map((s) => <StoryCard key={s.id} cluster={s} />)}
          </div>
        ) : (
          <EmptyState message={`No current stories mention ${company.name}.`} />
        )}
      </section>

      {companyModels.length > 0 && (
        <section>
          <SectionHeader title="Models" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companyModels.map((m) => <ModelCard key={m.id} model={m} />)}
          </div>
        </section>
      )}

    </div>
  );
}
