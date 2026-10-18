import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pendaftaran Santri Baru (PSB) Online",
  description:
    "Portal Penerimaan Santri Baru (PSB) Darul Khidmah Sidogiri Bekasi. Formulir pendaftaran online untuk MI Miftahul Ulum, TPQ Metode Tartil Sidogiri, dan asrama santri.",
  alternates: {
    canonical: "/santri-baru",
  },
  openGraph: {
    title: "Pendaftaran Santri Baru (PSB) Online | Darul Khidmah Sidogiri Bekasi",
    description:
      "Portal Penerimaan Santri Baru (PSB) Darul Khidmah Sidogiri Bekasi. Formulir pendaftaran online untuk MI Miftahul Ulum, TPQ Metode Tartil Sidogiri, dan asrama santri.",
    url: "/santri-baru",
    images: [
      {
        url: "/logo-sidogiri.jpeg",
        width: 800,
        height: 800,
        alt: "Pendaftaran Santri Baru Darul Khidmah Sidogiri Bekasi",
      },
    ],
  },
};

export default function SantriBaruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
