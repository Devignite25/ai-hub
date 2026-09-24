// OpenRouter collector. Public model directory, no key required.
// The `created` field is a real Unix timestamp of when the model was
// onboarded — the closest thing to a "new model release" feed available.

import { fetchJson } from "../fetch";
import { REVALIDATE } from "../sources/registry";
import type { ProviderModel } from "../types";

interface ORModelJson {
  id: string;
  canonical_slug?: string;
  name: string;
  created: number; // unix seconds
  description?: string;
  context_length?: number;
}

export async function collectOpenRouterModels(limit = 15): Promise<ProviderModel[]> {
  const data = await fetchJson<{ data: ORModelJson[] }>("https://openrouter.ai/api/v1/models", {
    timeoutMs: 30000,
    revalidate: REVALIDATE.models,
  });
  const models = (data.data ?? [])
    .filter((m) => m.id && m.created)
    .sort((a, b) => b.created - a.created)
    .slice(0, limit);
  return models.map((m) => ({
    id: m.id,
    name: m.name || m.id,
    url: `https://openrouter.ai/${m.canonical_slug || m.id}`,
    description: (m.description ?? "").slice(0, 300),
    createdAt: new Date(m.created * 1000).toISOString(),
    contextLength: m.context_length,
    provider: "OpenRouter",
  }));
}
