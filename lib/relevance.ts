// Relevance filtering + categorization. Pure functions, no I/O.
// Feeds like TechCrunch cover general tech; only AI-relevant items survive.

import type { CategorySlug } from "./types";
import { companiesInText } from "./companies";

const AI_STRONG = [
  "artificial intelligence", "machine learning", "deep learning", "large language model",
  "generative ai", "genai", "neural network", "foundation model", "frontier model",
  "chatgpt", "gpt-", "llm", "diffusion model", "transformer model", "ai agent",
  "agentic", "copilot", "chatbot", "text-to-image", "text-to-video", "text-to-speech",
  "stable diffusion", "midjourney", "sora", "grok", "gemini", "claude", "llama",
  "mistral", "deepseek", "qwen", "hugging face", "openai", "anthropic", "deepmind",
  "xai", "nvidia", "cuda", "benchmark", "swe-bench", "arxiv", "fine-tun", "rag ",
  "rag,", "retrieval-augmented", "embedding", "vector database", "inference",
  "quantiz", "gguf", "mixture of experts", "token", "context window", "prompt engineering",
  "mcp", "model context protocol", "robot", "humanoid", "autonomous vehicle",
];

const AI_WEAK = [
  " ai ", " ai,", " ai.", " ai-", "(ai)", "ai-powered", "ai startup", "ai model",
  "ai chip", "ai company", "ai tool", "ai assistant", "ai video", "ai image",
  "ai-generated", "machine-learning", "data center", "datacenter", "semiconductor",
];

const JUNK = [
  "we're hiring", "job opening", "careers page", "apply now for",
  "sponsored post", "advertisement", "cookie policy", "terms of service update",
];

export function isAiRelevant(title: string, description: string): boolean {
  const text = ` ${title} ${description} `.toLowerCase();
  if (JUNK.some((j) => text.includes(j))) return false;
  if (AI_STRONG.some((k) => text.includes(k))) return true;
  const weakHits = AI_WEAK.filter((k) => text.includes(k)).length;
  if (weakHits >= 2) return true;
  // A named AI company plus any weak signal is relevant.
  return weakHits >= 1 && companiesInText(text).length > 0;
}

// ─── Categorization: keyword-rule system, scored per category ────────────────

const RULES: Record<CategorySlug, string[]> = {
  robotics: ["robot", "humanoid", "drone", "embodied ai", "boston dynamics", "unitree", "figure ai", "optimus", "actuator", "warehouse automation"],
  coding: ["coding agent", "code assistant", "github copilot", "cursor", "codex", "swe-bench", "vibe coding", "code generation", "copilot workspace", "devin", "replit agent", "windsurf"],
  "image-video": ["text-to-image", "text-to-video", "image generation", "video generation", "dall-e", "midjourney", "stable diffusion", "flux", "sora", "veo", "runway", "pika", "kling", "luma", "text-to-speech", "tts", "voice cloning", "elevenlabs", "suno", "udio"],
  models: ["new model", "model release", "releases model", "open-weight", "open weight", "foundation model", "reasoning model", "frontier model", "checkpoint", "llm", "large language model", "gpt-5", "gpt-6", "claude 4", "claude 5", "gemini 3", "llama 4", "llama 5", "grok 4", "grok 5", "deepseek v", "deepseek r", "qwen3", "qwen 3", "mistral large", "mixtral", "ollama", "hugging face"],
  agents: ["ai agent", "agent framework", "agentic", "autonomous agent", "multi-agent", "model context protocol", "mcp server", "tool use", "function calling", "computer use", "operator", "browser agent"],
  research: ["arxiv", "paper", "researchers", "study finds", "benchmark", "sota", "state-of-the-art", "peer-reviewed", "preprint", "ablation"],
  hardware: ["gpu", "tpu", "npu", "ai chip", "blackwell", "hopper", "b200", "h100", "cerebras", "groq", "datacenter", "data center", "stargate", "inference chip", "asic", "semiconductor fab", "tsmc ai"],
  business: ["funding", "raises $", "series a", "series b", "series c", "valuation", "ipo", "acquisition", "acquires", "merger", "lawsuit", "sues", "regulation", "antitrust", "executive order", "earnings", "layoffs", "partnership", "invests $", "billion", "trillion"],
  "open-source": ["open source", "open-source", "github", "pull request", "mit license", "apache 2.0", "release notes", "v1.0", "self-host"],
  tools: ["launches", "new app", "ai app", "assistant", "chatbot", "plugin", "integration", "api", "sdk", "platform", "copilot+", "notebooklm", "perplexity", "search engine"],
};

const CATEGORY_PRIORITY: CategorySlug[] = [
  "robotics", "coding", "image-video", "agents", "models",
  "research", "hardware", "business", "open-source", "tools",
];

export function categorize(title: string, description: string): CategorySlug {
  const text = ` ${title} ${description} `.toLowerCase();
  let best: CategorySlug | null = null;
  let bestScore = 0;
  for (const slug of CATEGORY_PRIORITY) {
    let score = 0;
    for (const kw of RULES[slug]) {
      if (text.includes(kw)) score += kw.length > 8 ? 2 : 1; // longer phrases weigh more
    }
    if (score > bestScore) {
      bestScore = score;
      best = slug;
    }
  }
  if (best && bestScore > 0) return best;
  // Sensible defaults when no rule fires.
  if (/(launch|release|app|api|platform|service|feature)/.test(text)) return "tools";
  return "business";
}

/** Tags: companies + salient keyword tags for filters. */
export function extractTags(title: string, description: string, companies: string[]): string[] {
  const text = ` ${title} ${description} `.toLowerCase();
  const tags = new Set<string>(companies);
  const candidates = [
    "open-source", "open-weight", "llm", "reasoning", "multimodal", "benchmark",
    "funding", "acquisition", "regulation", "robotics", "agents", "coding",
    "image generation", "video generation", "voice", "chips", "data center",
    "research", "api", "enterprise",
  ];
  for (const c of candidates) if (text.includes(c)) tags.add(c);
  return [...tags].slice(0, 8);
}
