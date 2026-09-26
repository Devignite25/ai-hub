import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Toolkit",
  description:
    "The AI tools The Wider Lens actually uses and recommends — voice, assistants, search, and image generation.",
  alternates: { canonical: "/toolkit" },
};

type Tool = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  category: string;
  affiliate: boolean;
};

/**
 * To add a new affiliate tool: append an entry here with affiliate: true and
 * your referral URL. The badge and rel="sponsored" are applied automatically.
 */
const TOOLS: Tool[] = [
  {
    name: "ElevenLabs",
    tagline: "AI voice generation",
    description:
      "The voices behind our twice-daily Instagram reels. Realistic text-to-speech in dozens of voices and languages — the same engine that narrates every Wider Lens video.",
    url: "https://try.elevenlabs.io/0108u1ziky63",
    category: "Audio",
    affiliate: true,
  },
  {
    name: "ChatGPT",
    tagline: "AI assistant",
    description:
      "The everyday AI assistant for writing, research, coding help, and brainstorming. A solid starting point if you're new to AI tools.",
    url: "https://chatgpt.com",
    category: "Assistants",
    affiliate: false,
  },
  {
    name: "Claude",
    tagline: "AI assistant",
    description:
      "Anthropic's AI assistant — strong at long documents, careful reasoning, and coding. Worth comparing side-by-side with ChatGPT.",
    url: "https://claude.ai",
    category: "Assistants",
    affiliate: false,
  },
  {
    name: "Perplexity",
    tagline: "AI search",
    description:
      "An answer engine that searches the live web and cites its sources — handy for fact-checking the news we cover.",
    url: "https://www.perplexity.ai",
    category: "Search",
    affiliate: false,
  },
  {
    name: "Midjourney",
    tagline: "AI image generation",
    description:
      "The go-to for high-quality AI-generated imagery and thumbnails. Runs through Discord; a short learning curve with striking results.",
    url: "https://www.midjourney.com",
    category: "Images",
    affiliate: false,
  },
];

function AffiliateBadge({ affiliate }: { affiliate: boolean }) {
  return affiliate ? (
    <span className="inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
      Affiliate link
    </span>
  ) : (
    <span className="inline-flex items-center rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      Direct link
    </span>
  );
}

export default function ToolkitPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-black tracking-tight">AI Toolkit</h1>
      <p className="mt-2 leading-relaxed text-zinc-700 dark:text-zinc-300">
        The AI tools we actually use and recommend — the same ones behind The Wider Lens.
        No hype, no spin: if it's here, we've tried it.
      </p>
      <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
        <strong>Disclosure:</strong> some links on this page are affiliate links, marked{" "}
        <AffiliateBadge affiliate />. If you sign up through one, we may earn a commission
        at no extra cost to you — it helps keep The Wider Lens running.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <article
            key={tool.name}
            className="flex flex-col rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {tool.category}
              </span>
              <AffiliateBadge affiliate={tool.affiliate} />
            </div>
            <h2 className="mt-2 text-xl font-bold">{tool.name}</h2>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{tool.tagline}</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {tool.description}
            </p>
            <a
              href={tool.url}
              target="_blank"
              rel={tool.affiliate ? "sponsored noopener noreferrer" : "noopener noreferrer"}
              className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Try {tool.name} <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </div>

      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        This list grows as we join more affiliate programs. Tools are added only if we'd
        recommend them without being paid to.
      </p>
    </div>
  );
}
