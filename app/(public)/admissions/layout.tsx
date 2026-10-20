import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pendaftaran Santri Baru (PPDB Online)",
  description:
    "Portal resmi pendaftaran santri baru Darul Khidmah Sidogiri Bekasi. Penerimaan murid baru Madrasah Ibtidaiyah (MI) Miftahul Ulum, MTs Persiapan, dan TPQ Tartil Al-Qur'an Sidogiri.",
  alternates: {
    canonical: "/admissions",
  },
  openGraph: {
    title: "Pendaftaran Santri Baru (PPDB) | Darul Khidmah Sidogiri Bekasi",
    description:
      "Formulir daring pendaftaran santri baru MI Miftahul Ulum, MTs Persiapan, dan TPQ Tartil Al-Qur'an Sidogiri Ranting Bekasi.",
    url: "/admissions",
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

export default function AdmissionsPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
