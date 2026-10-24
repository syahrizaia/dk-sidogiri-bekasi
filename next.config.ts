import type { NextConfig } from "next";

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https: https://images.unsplash.com https://*.unsplash.com;
    font-src 'self' data:;
    connect-src 'self';
    frame-src 'self' https://www.youtube.com https://*.youtube.com https://youtu.be;
    frame-ancestors 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
`.replace(/\s{2,}/g, " ").trim();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/about/profile",
        destination: "/about#profile",
        permanent: true,
      },
      {
        source: "/about/vision-mission",
        destination: "/about#vision-mission",
        permanent: true,
      },
      {
        source: "/about/organization",
        destination: "/about#organization",
        permanent: true,
      },
      {
        source: "/about/teachers",
        destination: "/about#teachers",
        permanent: true,
      },
      {
        source: "/about/contact",
        destination: "/about#contact",
        permanent: true,
      },
      // Backward compatibility untuk path bahasa Indonesia lama
      {
        source: "/about/kontak",
        destination: "/about#contact",
        permanent: true,
      },
      {
        source: "/about/lembaga",
        destination: "/institutions",
        permanent: true,
      },
      {
        source: "/about/unit-pendidikan",
        destination: "/institutions",
        permanent: true,
      },
      {
        source: "/about/struktur-organisasi",
        destination: "/about#organization",
        permanent: true,
      },
      {
        source: "/about/dewan-asatidz",
        destination: "/about#teachers",
        permanent: true,
      },
      {
        source: "/about/visi-misi",
        destination: "/about#vision-mission",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
