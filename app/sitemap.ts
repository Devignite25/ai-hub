import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/types";
import { COMPANIES } from "@/lib/companies";
import { LEARN_TOPICS } from "@/lib/learn";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thewiderlens.info";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/latest",
    "/models",
    "/research",
    "/open-source",
    "/learn",
    "/search",
    "/sources",
    "/methodology",
    "/about",
    "/privacy",
  ];
  const urls: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${SITE_URL}${r || "/"}`,
    lastModified: now,
    changeFrequency: r === "" || r === "/latest" ? "hourly" : "daily",
    priority: r === "" ? 1 : 0.8,
  }));
  for (const c of CATEGORIES) {
    urls.push({ url: `${SITE_URL}/category/${c.slug}`, lastModified: now, changeFrequency: "hourly", priority: 0.7 });
  }
  for (const c of COMPANIES) {
    urls.push({ url: `${SITE_URL}/companies/${c.slug}`, lastModified: now, changeFrequency: "daily", priority: 0.6 });
  }
  for (const t of LEARN_TOPICS) {
    urls.push({ url: `${SITE_URL}/learn/${t.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.6 });
  }
  return urls;
}
