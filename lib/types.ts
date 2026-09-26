// ─── The Wider Lens: normalized data model ───────────────────────────────────────────
// V1 operates with no database. All data comes from external public sources,
// is normalized here, and is cached by Next.js/Vercel per fetch revalidate.

export type SourceType =
  | "official" // official company / org announcements
  | "journalism" // reputable tech/AI publications
  | "research" // arXiv and other research sources
  | "github" // GitHub repositories / releases
  | "huggingface" // Hugging Face Hub models
  | "models" // model registry / release trackers
  | "tools"; // AI tools / agent directories & announcements

export type CategorySlug =
  | "models"
  | "open-source"
  | "research"
  | "tools"
  | "agents"
  | "robotics"
  | "coding"
  | "image-video"
  | "business"
  | "hardware";

export const CATEGORIES: { slug: CategorySlug; label: string; blurb: string }[] = [
  { slug: "models", label: "Models", blurb: "New and notable AI model releases and updates." },
  { slug: "open-source", label: "Open Source", blurb: "AI repositories, releases, and open-weight projects." },
  { slug: "research", label: "Research", blurb: "Recent AI papers from arXiv." },
  { slug: "tools", label: "Tools", blurb: "New AI tools, apps, and platforms." },
  { slug: "agents", label: "Agents", blurb: "AI agents, frameworks, and agentic systems." },
  { slug: "robotics", label: "Robotics", blurb: "Robotics and embodied AI developments." },
  { slug: "coding", label: "Coding", blurb: "AI coding assistants, models, and dev tooling." },
  { slug: "image-video", label: "Image & Video", blurb: "Generative image, video, and audio AI." },
  { slug: "business", label: "Business", blurb: "Funding, deals, policy, and AI industry news." },
  { slug: "hardware", label: "AI Hardware", blurb: "Chips, accelerators, and AI infrastructure." },
];

/** A single normalized item from any source. */
export interface Article {
  id: string; // stable, derived from source + url
  title: string;
  description: string; // short excerpt only — never full copyrighted text
  url: string; // canonical link to the original
  imageUrl?: string;
  source: string; // display name, e.g. "Hugging Face Blog"
  sourceType: SourceType;
  author?: string;
  publishedAt: string; // ISO 8601
  category: CategorySlug;
  tags: string[];
  companies: string[]; // canonical company slugs
  importanceScore: number; // 0–100, transparent heuristic (see /methodology)
}

/** A cluster of articles about the same event, from independent sources. */
export interface StoryCluster {
  id: string;
  primary: Article; // preferred: the official source when one exists
  sources: Article[]; // all articles in the cluster, primary first
  category: CategorySlug;
  companies: string[];
  publishedAt: string; // newest publishedAt in the cluster
  importanceScore: number;
}

/** A model from the Hugging Face Hub / model registries. Real metadata only. */
export interface AiModel {
  id: string; // e.g. "meta-llama/Llama-4-Scout-17B-16E"
  name: string;
  author: string;
  authorUrl: string;
  url: string;
  pipelineTag?: string; // e.g. "text-generation"
  tags: string[];
  likes: number;
  downloads: number; // as reported by the Hub API (monthly when available)
  lastModified: string; // ISO
  createdAt?: string;
  gated: boolean;
  license?: string;
  library?: string;
  task: string; // normalized task bucket: llm | image | video | audio | coding | embeddings | reasoning | multimodal | other
  openWeights: boolean | null; // true/false only when reliably determinable, else null
}

/** A model from a provider directory (e.g. OpenRouter). Real metadata only. */
export interface ProviderModel {
  id: string;
  name: string;
  url: string;
  description: string;
  createdAt: string; // ISO — real release/onboarding timestamp
  contextLength?: number;
  provider: string; // e.g. "OpenRouter"
}

/** An arXiv paper. */
export interface ResearchPaper {
  id: string; // arXiv id
  title: string;
  authors: string[];
  abstract: string; // excerpt only
  url: string; // abs page
  pdfUrl: string;
  publishedAt: string; // ISO
  updatedAt?: string;
  categories: string[];
  primaryCategory: string;
}

/** A GitHub repository. Real numbers only — never invented growth stats. */
export interface Repo {
  id: string; // owner/repo
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language?: string;
  topics: string[];
  updatedAt: string; // ISO
  latestRelease?: { name: string; tag: string; url: string; publishedAt: string } | null;
}

export interface Company {
  slug: string;
  name: string;
  aliases: string[]; // matching keywords (lowercase)
  website: string;
  description: string;
}
