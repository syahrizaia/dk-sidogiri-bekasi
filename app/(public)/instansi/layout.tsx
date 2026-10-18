import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unit Pendidikan & Lembaga",
  description:
    "Lembaga pendidikan di bawah naungan Darul Khidmah Sidogiri Bekasi: Madrasah Ibtidaiyah (MI) Miftahul Ulum, persiapan pembukaan MTs Miftahul Ulum, dan TPQ Metode Tartil Sidogiri.",
  alternates: {
    canonical: "/instansi",
  },
  openGraph: {
    title: "Unit Pendidikan & Lembaga | Darul Khidmah Sidogiri Bekasi",
    description:
      "Lembaga pendidikan di bawah naungan Darul Khidmah Sidogiri Bekasi: Madrasah Ibtidaiyah (MI) Miftahul Ulum, persiapan pembukaan MTs Miftahul Ulum, dan TPQ Metode Tartil Sidogiri.",
    url: "/instansi",
    images: [
      {
        url: "/logo-sidogiri.jpeg",
        width: 800,
        height: 800,
        alt: "Unit Pendidikan Darul Khidmah Sidogiri Bekasi",
      },
    ],
  },
};

export default function InstansiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
