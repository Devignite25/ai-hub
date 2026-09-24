import type { Company } from "./types";

/**
 * Canonical companies for filtering and /companies/[slug] pages.
 * Matching is keyword-based on title+description; aliases are lowercase.
 */
export const COMPANIES: Company[] = [
  { slug: "openai", name: "OpenAI", aliases: ["openai", "chatgpt", "sora", "dall-e", "dall·e"], website: "https://openai.com", description: "Creator of ChatGPT, GPT models, and Sora." },
  { slug: "anthropic", name: "Anthropic", aliases: ["anthropic", "claude"], website: "https://www.anthropic.com", description: "Creator of the Claude family of AI models." },
  { slug: "google", name: "Google", aliases: ["google", "deepmind", "gemini", "gemma", "veo", "notebooklm"], website: "https://deepmind.google", description: "Google DeepMind, Gemini, Gemma, and Google AI research." },
  { slug: "meta", name: "Meta", aliases: ["meta", "llama", "llama 4"], website: "https://ai.meta.com", description: "Meta AI, Llama open-weight models, and FAIR research." },
  { slug: "microsoft", name: "Microsoft", aliases: ["microsoft", "copilot", "azure ai"], website: "https://www.microsoft.com/ai", description: "Microsoft Copilot, Azure AI, and OpenAI partnership." },
  { slug: "nvidia", name: "NVIDIA", aliases: ["nvidia", "blackwell", "hopper", "cuda", "dgx", "nemotron"], website: "https://www.nvidia.com", description: "AI chips, CUDA, and accelerated computing." },
  { slug: "xai", name: "xAI", aliases: ["xai", "x.ai", "grok"], website: "https://x.ai", description: "Elon Musk's AI company; Grok models." },
  { slug: "mistral", name: "Mistral AI", aliases: ["mistral", "mixtral", "le chat"], website: "https://mistral.ai", description: "European open-weight model lab." },
  { slug: "huggingface", name: "Hugging Face", aliases: ["hugging face", "huggingface"], website: "https://huggingface.co", description: "The open AI model and dataset hub." },
  { slug: "cohere", name: "Cohere", aliases: ["cohere", "command r"], website: "https://cohere.com", description: "Enterprise language AI." },
  { slug: "stability", name: "Stability AI", aliases: ["stability ai", "stable diffusion"], website: "https://stability.ai", description: "Stable Diffusion image models." },
  { slug: "deepseek", name: "DeepSeek", aliases: ["deepseek"], website: "https://www.deepseek.com", description: "Open-weight reasoning models from China." },
  { slug: "alibaba", name: "Alibaba", aliases: ["alibaba", "qwen"], website: "https://www.alibabacloud.com", description: "Qwen open-weight models." },
  { slug: "perplexity", name: "Perplexity", aliases: ["perplexity"], website: "https://www.perplexity.ai", description: "AI answer engine and search." },
  { slug: "elevenlabs", name: "ElevenLabs", aliases: ["elevenlabs"], website: "https://elevenlabs.io", description: "AI voice and text-to-speech." },
];

export function companiesInText(text: string): string[] {
  const lower = text.toLowerCase();
  return COMPANIES.filter((c) => c.aliases.some((a) => lower.includes(a))).map((c) => c.slug);
}

export function companyBySlug(slug: string): Company | undefined {
  return COMPANIES.find((c) => c.slug === slug);
}
