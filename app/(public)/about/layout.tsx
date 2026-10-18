import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami & Profil Lembaga",
  description:
    "Profil lengkap Darul Khidmah Sidogiri Bekasi: Sejarah pendirian, visi dan misi salafiyah, jajaran dewan pengasuh & asatidz, serta fasilitas sarana pendidikan Islam.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Tentang Kami & Profil Lembaga | Darul Khidmah Sidogiri Bekasi",
    description:
      "Profil lengkap Darul Khidmah Sidogiri Bekasi: Sejarah pendirian, visi dan misi salafiyah, jajaran dewan pengasuh & asatidz, serta fasilitas sarana pendidikan Islam.",
    url: "/about",
    images: [
      {
        url: "/logo-sidogiri.jpeg",
        width: 800,
        height: 800,
        alt: "Profil Darul Khidmah Sidogiri Bekasi",
      },
    ],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
