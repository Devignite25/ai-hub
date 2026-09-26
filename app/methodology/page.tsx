import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How The Wider Lens collects, filters, clusters, and ranks AI news — a transparent, deterministic pipeline.",
};

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-black tracking-tight">Methodology</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        The Wider Lens is a deterministic aggregation pipeline. There is no LLM in the loop, no editorial
        curation, and no personalization. Here is exactly what happens on every refresh.
      </p>

      <Section n="1" title="Collection">
        <p>
          Server-side collectors fetch public RSS/Atom feeds, the arXiv API, the GitHub REST API, and
          the Hugging Face Hub API. Every request has a timeout (10–20s). Sources are fetched with
          <code>Promise.allSettled</code> — if one feed is down, slow, or returns malformed data, it is
          logged and skipped; the page renders with the rest.
        </p>
      </Section>

      <Section n="2" title="Normalization">
        <p>
          Every item becomes a common <code>Article</code> record: title, short description, URL, source,
          author, publication date, and image when the feed provides one. Missing fields are handled
          gracefully — an item is never dropped just because it lacks an image or author.
        </p>
      </Section>

      <Section n="3" title="Relevance filtering">
        <p>
          General tech feeds (e.g. TechCrunch) cover more than AI. Items must match AI keywords —
          model names, techniques, companies, or research terms — to survive. Obvious junk (job posts,
          sponsored content) is removed.
        </p>
      </Section>

      <Section n="4" title="Categorization">
        <p>
          A maintainable keyword-rule system assigns each story to one category: Models, Open Source,
          Research, Tools, Agents, Robotics, Coding, Image &amp; Video, Business, or AI Hardware.
          Rules are scored (longer phrases weigh more) and the highest-scoring category wins; ties
          resolve by a fixed priority order. Companies are detected with an alias list
          (e.g. “DeepMind”, “Gemini” → Google).
        </p>
      </Section>

      <Section n="5" title="Deduplication & clustering">
        <p>
          Titles are normalized (lowercased, punctuation and stopwords removed) and compared with
          Jaccard token similarity. Near-identical items (≥ 0.88) from the same source are dropped.
          Items about the same event (≥ 0.38 similarity, or ≥ 0.25 with a shared company) are
          <em> clustered</em>, not deleted: the cluster shows one primary story and a “View N
          sources” expander listing every outlet covering it. When an official company announcement
          exists in the cluster, it becomes the primary.
        </p>
      </Section>

      <Section n="6" title="Importance ranking (0–100)">
        <p>The score is a transparent heuristic:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><strong>Source authority:</strong> official 40 · research 30 · journalism 25 · models 20 · GitHub/Hugging Face/tools 15</li>
          <li><strong>Freshness:</strong> &lt;24h +25 · &lt;72h +15 · &lt;7d +5</li>
          <li><strong>Corroboration:</strong> +8 per additional independent source in the cluster (max +24)</li>
          <li><strong>Event signals:</strong> model-release keywords +10 · official launch announcement +8 · benchmark/breakthrough +5</li>
        </ul>
        <p className="mt-2">
          “Today in AI” shows the top-ranked stories published in the last 24 hours; the trending
          list shows the top-ranked stories overall.
        </p>
      </Section>

      <Section n="7" title="Refresh frequency">
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>News feeds: every 15 minutes</li>
          <li>GitHub: every 30 minutes</li>
          <li>Hugging Face models &amp; arXiv: every 60 minutes</li>
          <li>Learn pages: static, rebuilt on deploy</li>
        </ul>
        <p className="mt-2">
          Implemented with Next.js data-cache revalidation (<code>fetch(..., {"{ next: { revalidate } }"})</code>),
          so upstream APIs are never hit once per visitor.
        </p>
      </Section>

      <Section n="8" title="Limitations">
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>We link to original reporting; The Wider Lens hosts only headlines and excerpts.</li>
          <li>Automated clustering can occasionally group loosely related stories — use the source list to verify.</li>
          <li>Model metadata reflects what the Hugging Face API reports; open-weight status is shown only when the license reliably indicates it.</li>
          <li>GitHub “interesting repos” come from curated topic searches, not a global trending calculation.</li>
        </ul>
      </Section>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8" aria-label={title}>
      <h2 className="text-xl font-bold tracking-tight">
        <span className="mr-2 text-zinc-400">{n}.</span>{title}
      </h2>
      <div className="mt-2 space-y-2 text-[0.95rem] leading-relaxed text-zinc-700 dark:text-zinc-300 [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs dark:[&_code]:bg-zinc-800">
        {children}
      </div>
    </section>
  );
}
