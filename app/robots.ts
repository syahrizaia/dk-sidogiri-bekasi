import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dksidogiribekasi.vercel.app";

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
          "/api/*",
          "/auth/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
