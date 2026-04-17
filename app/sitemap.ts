import type { MetadataRoute } from "next";
import { GAMES } from "@/lib/games";

const BASE = "https://gamefulness.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/ranking`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${BASE}/facilities`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];
  const gameRoutes: MetadataRoute.Sitemap = GAMES.map((g) => ({
    url: `${BASE}/play/${g.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: g.status === "playable" ? 0.9 : 0.4,
  }));
  return [...staticRoutes, ...gameRoutes];
}
