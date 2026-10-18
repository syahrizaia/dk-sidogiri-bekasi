import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sidogiri-bekasi.sch.id";

  const publicRoutes = [
    { path: "", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/about", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/instansi", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/instansi/mi", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/instansi/mts", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/instansi/tpq", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/media", changeFrequency: "daily" as const, priority: 0.8 },
    { path: "/santri-baru", changeFrequency: "daily" as const, priority: 0.95 },
  ];

  return publicRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
