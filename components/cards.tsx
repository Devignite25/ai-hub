import Link from "next/link";
import type { Article, StoryCluster, AiModel, ResearchPaper, Repo, ProviderModel } from "@/lib/types";
import { timeAgo, formatNumber, domainOf, TASK_LABELS } from "@/lib/format";
import { categoryLabel } from "./layout";

/** Marks outbound links so users know they're leaving The Wider Lens. */
export function ExternalMark() {
  return (
    <span className="ml-1 inline-block text-zinc-400" aria-label="(external link)" title="Opens the original source">
      ↗
    </span>
  );
}

export function SourceBadge({ source, sourceType }: { source: string; sourceType: Article["sourceType"] }) {
  const styles: Record<string, string> = {
    official: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    research: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
    journalism: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
    github: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    huggingface: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    models: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
    tools: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  };
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${styles[sourceType] ?? styles.tools}`}>
      {sourceType === "official" ? "Official" : source}
    </span>
  );
}

function Meta({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">{children}</div>;
}

/** A story cluster: primary article + "View N sources" expansion. */
export function StoryCard({ cluster, featured = false }: { cluster: StoryCluster; featured?: boolean }) {
  const { primary } = cluster;
  return (
    <article className={`overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${featured ? "md:col-span-2" : ""}`}>
      {primary.imageUrl && (
        <a href={primary.url} target="_blank" rel="noopener noreferrer" className="block aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={primary.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        </a>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <SourceBadge source={primary.source} sourceType={primary.sourceType} />
          <Link href={`/category/${primary.category}`} className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
            {categoryLabel(primary.category)}
          </Link>
        </div>
        <h3 className={`${featured ? "text-2xl" : "text-base"} mt-2 font-bold leading-snug`}>
          <a href={primary.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {primary.title}
            <ExternalMark />
          </a>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">{primary.description}</p>
        <Meta>
          <span>{timeAgo(cluster.publishedAt)}</span>
          <span aria-hidden="true">·</span>
          <span>{primary.source}</span>
          {cluster.sources.length > 1 && (
            <>
              <span aria-hidden="true">·</span>
              <SourcesToggle cluster={cluster} />
            </>
          )}
        </Meta>
      </div>
    </article>
  );
}

/** Client-side expandable list of clustered sources. */
export function SourcesToggle({ cluster }: { cluster: StoryCluster }) {
  const id = `src-${cluster.id}`;
  return (
    <>
      <button
        type="button"
        data-toggle={id}
        className="font-medium text-zinc-700 underline decoration-dotted underline-offset-2 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
      >
        View {cluster.sources.length} sources
      </button>
      <div id={id} className="hidden w-full">
        <ul className="mt-1 space-y-1 border-t border-zinc-100 pt-2 dark:border-zinc-800">
          {cluster.sources.map((s) => (
            <li key={s.id} className="text-xs">
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:underline dark:text-zinc-400">
                {s.title} — {s.source}
                <ExternalMark />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        <SourceBadge source={article.source} sourceType={article.sourceType} />
        <Link href={`/category/${article.category}`} className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
          {categoryLabel(article.category)}
        </Link>
      </div>
      <h3 className="mt-2 font-bold leading-snug">
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {article.title}
          <ExternalMark />
        </a>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{article.description}</p>
      <Meta>
        <span>{timeAgo(article.publishedAt)}</span>
        <span aria-hidden="true">·</span>
        <span>{article.source}</span>
        {article.author && (<><span aria-hidden="true">·</span><span>{article.author}</span></>)}
      </Meta>
    </article>
  );
}

export function ModelCard({ model }: { model: AiModel }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold leading-snug">
          <a href={model.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {model.name}
            <ExternalMark />
          </a>
        </h3>
        {model.task !== "other" && (
          <span className="shrink-0 rounded bg-indigo-100 px-1.5 py-0.5 text-[11px] font-medium text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            {TASK_LABELS[model.task]}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        by <a href={model.authorUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{model.author}</a>
      </p>
      <Meta>
        {model.likes > 0 && <span>♥ {formatNumber(model.likes)}</span>}
        {model.downloads > 0 && <span>↓ {formatNumber(model.downloads)}/30d</span>}
        <span>{timeAgo(model.lastModified)}</span>
        {model.openWeights === true && <span className="text-emerald-600 dark:text-emerald-400">open weights</span>}
        {model.gated && <span className="text-amber-600 dark:text-amber-400">gated</span>}
      </Meta>
      {model.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {model.tags.slice(0, 5).map((t) => (
            <span key={t} className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">{t}</span>
          ))}
        </div>
      )}
    </article>
  );
}

export function PaperCard({ paper }: { paper: ResearchPaper }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <span className="inline-flex items-center rounded bg-violet-100 px-1.5 py-0.5 text-[11px] font-medium text-violet-800 dark:bg-violet-950 dark:text-violet-300">
        {paper.primaryCategory || "arXiv"}
      </span>
      <h3 className="mt-2 font-bold leading-snug">
        <a href={paper.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {paper.title}
          <ExternalMark />
        </a>
      </h3>
      <p className="mt-1.5 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">{paper.abstract}</p>
      <Meta>
        <span>{timeAgo(paper.publishedAt)}</span>
        {paper.authors.length > 0 && (<><span aria-hidden="true">·</span><span className="line-clamp-1">{paper.authors.slice(0, 3).join(", ")}{paper.authors.length > 3 ? " et al." : ""}</span></>)}
        <span aria-hidden="true">·</span>
        <a href={paper.pdfUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">PDF<ExternalMark /></a>
      </Meta>
    </article>
  );
}

export function RepoCard({ repo }: { repo: Repo }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-bold leading-snug">
        <a href={repo.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {repo.fullName}
          <ExternalMark />
        </a>
      </h3>
      {repo.description && <p className="mt-1.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{repo.description}</p>}
      <Meta>
        <span>★ {formatNumber(repo.stars)} stars</span>
        {repo.language && (<><span aria-hidden="true">·</span><span>{repo.language}</span></>)}
        <span aria-hidden="true">·</span>
        <span>updated {timeAgo(repo.updatedAt)}</span>
      </Meta>
      {repo.latestRelease && (
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          Latest release:{" "}
          <a href={repo.latestRelease.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {repo.latestRelease.name} ({repo.latestRelease.tag})
            <ExternalMark />
          </a>
        </p>
      )}
    </article>
  );
}

export function ProviderModelCard({ model }: { model: ProviderModel }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="font-bold leading-snug">
        <a href={model.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {model.name}
          <ExternalMark />
        </a>
      </h3>
      {model.description && <p className="mt-1.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{model.description}</p>}
      <Meta>
        <span>via {model.provider}</span>
        <span aria-hidden="true">·</span>
        <span>{timeAgo(model.createdAt)}</span>
        {model.contextLength != null && model.contextLength > 0 && (
          <><span aria-hidden="true">·</span><span>{formatNumber(model.contextLength)} ctx</span></>
        )}
      </Meta>
    </article>
  );
}

export function SectionHeader({ title, href, blurb }: { title: string; href?: string; blurb?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {blurb && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{blurb}</p>}
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-white">
          View all →
        </Link>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
    </div>
  );
}

export function ExternalNote() {
  return (
    <p className="text-xs text-zinc-500 dark:text-zinc-500">
      Links marked ↗ open the original source in a new tab. The Wider Lens shows headlines and excerpts only.
    </p>
  );
}
