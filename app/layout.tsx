import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Amiri } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-serif",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sidogiri-bekasi.sch.id";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Darul Khidmah Sidogiri Bekasi | Madrasah Miftahul Ulum & TPQ",
    template: "%s | Darul Khidmah Sidogiri Bekasi",
  },
  description:
    "Pusat Pendidikan & Dakwah Darul Khidmah Sidogiri Bekasi. Menaungi Madrasah Miftahul Ulum (MI aktif & persiapan pembukaan MTs), TPQ Metode Tartil Sidogiri, asrama santri mukim, dan kajian kitab kuning salafiyah.",
  keywords: [
    "Darul Khidmah Sidogiri Bekasi",
    "Sidogiri Bekasi",
    "Madrasah Miftahul Ulum Bekasi",
    "MI Miftahul Ulum Bekasi",
    "MTs Sidogiri Bekasi",
    "TPQ Tartil Sidogiri",
    "Pondok Pesantren Bekasi",
    "Asrama Santri Bekasi",
    "Kitab Kuning Bekasi",
    "Pendaftaran Santri Baru Bekasi",
    "Pendidikan Islam Bekasi",
  ],
  authors: [{ name: "Darul Khidmah Sidogiri Bekasi", url: baseUrl }],
  creator: "Darul Khidmah Sidogiri Bekasi",
  publisher: "Darul Khidmah Sidogiri Bekasi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: baseUrl,
    siteName: "Darul Khidmah Sidogiri Bekasi",
    title: "Darul Khidmah Sidogiri Bekasi | Pendidikan Islam Terpadu & Asrama Santri",
    description:
      "Website resmi Darul Khidmah Sidogiri Bekasi. Informasi pendaftaran santri baru, profil Madrasah Miftahul Ulum (MI & MTs), TPQ Tartil, asrama santri, dan berita kegiatan.",
    images: [
      {
        url: "/logo-sidogiri.jpeg",
        width: 800,
        height: 800,
        alt: "Logo Resmi Darul Khidmah Sidogiri Bekasi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Darul Khidmah Sidogiri Bekasi",
    description: "Pusat Pendidikan Salafiyah & Madrasah Miftahul Ulum Darul Khidmah Sidogiri Bekasi.",
    images: ["/logo-sidogiri.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo-sidogiri.jpeg", type: "image/jpeg" },
    ],
    shortcut: "/logo-sidogiri.jpeg",
    apple: [
      { url: "/logo-sidogiri.jpeg", sizes: "180x180", type: "image/jpeg" },
    ],
  },
  alternates: {
    canonical: "/",
  },
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${baseUrl}/#organization`,
      name: "Darul Khidmah Sidogiri Bekasi",
      alternateName: [
        "Pondok Pesantren Darul Khidmah Sidogiri Bekasi",
        "DK Sidogiri Bekasi",
        "Madrasah Miftahul Ulum Sidogiri Bekasi",
      ],
      url: baseUrl,
      logo: `${baseUrl}/logo-sidogiri.jpeg`,
      image: `${baseUrl}/logo-sidogiri.jpeg`,
      description:
        "Lembaga pendidikan Islam kepesantrenan Darul Khidmah Sidogiri Bekasi, menaungi Madrasah Miftahul Ulum (MI & MTs) serta TPQ Metode Tartil Sidogiri.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bekasi",
        addressRegion: "Jawa Barat",
        addressCountry: "ID",
      },
      telephone: "+62-812-3456-7890",
      email: "info@sidogiri-bekasi.sch.id",
      sameAs: [
        "https://www.instagram.com",
        "https://www.youtube.com",
        "https://www.facebook.com",
      ],
      department: [
        {
          "@type": "School",
          name: "Madrasah Ibtidaiyah (MI) Miftahul Ulum Darul Khidmah Sidogiri Bekasi",
          description: "Pendidikan tingkat dasar salafiyah kelas 1-6 dan kelas shifir.",
        },
        {
          "@type": "School",
          name: "Madrasah Tsanawiyah (MTs) Miftahul Ulum Darul Khidmah Sidogiri Bekasi",
          description: "Persiapan pembukaan jenjang menengah lanjutan salafiyah.",
        },
        {
          "@type": "School",
          name: "TPQ Al-Qur'an Metode Tartil Sidogiri",
          description: "Pendidikan bimbingan membaca dan tahfidz tajwid Al-Qur'an tartil.",
        },
      ],
    },
    {
      "@type": "LocalBusiness",
      "@id": `${baseUrl}/#localbusiness`,
      name: "Darul Khidmah Sidogiri Bekasi",
      image: `${baseUrl}/logo-sidogiri.jpeg`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bekasi",
        addressRegion: "Jawa Barat",
        addressCountry: "ID",
      },
      priceRange: "$$",
      openingHours: "Mo-Su 00:00-24:00",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${amiri.variable} font-sans antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="min-h-screen flex flex-col relative selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Ambient Liquid Orbs & Islamic Pattern Watermark Layer */}
          <div className="ambient-scene" aria-hidden="true">
            <div className="liquid-orb liquid-orb-1" />
            <div className="liquid-orb liquid-orb-2" />
            <div className="liquid-orb liquid-orb-3" />
            <div className="liquid-orb liquid-orb-4" />
            <div className="liquid-mesh-flow" />
            <div className="islamic-pattern" />
          </div>

          <div className="relative z-10 flex min-h-screen flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
