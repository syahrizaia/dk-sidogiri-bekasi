import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeri Media & Dokumentasi Kegiatan",
  description:
    "Dokumentasi foto dan video kegiatan santri Darul Khidmah Sidogiri Bekasi: Halaqoh pengajian kitab kuning, kegiatan belajar mengajar, wisuda tartil, dan kegiatan asrama.",
  alternates: {
    canonical: "/media",
  },
  openGraph: {
    title: "Galeri Media & Dokumentasi Kegiatan | Darul Khidmah Sidogiri Bekasi",
    description:
      "Dokumentasi foto dan video kegiatan santri Darul Khidmah Sidogiri Bekasi: Halaqoh pengajian kitab kuning, kegiatan belajar mengajar, wisuda tartil, dan kegiatan asrama.",
    url: "/media",
    images: [
      {
        url: "/logo-sidogiri.jpeg",
        width: 800,
        height: 800,
        alt: "Galeri Media Darul Khidmah Sidogiri Bekasi",
      },
    ],
  },
};

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
