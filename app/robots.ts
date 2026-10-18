import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sidogiri-bekasi.sch.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/modules",
          "/modules/*",
          "/students",
          "/students/*",
          "/teachers",
          "/teachers/*",
          "/parents",
          "/parents/*",
          "/data-science",
          "/data-science/*",
          "/settings",
          "/settings/*",
          "/santri",
          "/santri/*",
          "/api/*",
          "/auth/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
