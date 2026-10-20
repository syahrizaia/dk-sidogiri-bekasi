import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dksidogiribekasi.vercel.app";

  const publicRoutes = [
    { path: "", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/about", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/institutions", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/institutions/mi", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/institutions/mts", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/institutions/tpq", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/admissions", changeFrequency: "daily" as const, priority: 0.95 },
    { path: "/media", changeFrequency: "daily" as const, priority: 0.8 },
  ];

  return publicRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
