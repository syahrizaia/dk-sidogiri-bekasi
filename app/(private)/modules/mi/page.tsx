import React from "react";
import { Metadata } from "next";
import { UnitManagementView } from "../components/UnitManagementView";

export const metadata: Metadata = {
  title: "Madrasah Ibtidaiyah (MI) | Darul Khidmah Sidogiri Bekasi",
  description: "Manajemen mandiri Madrasah Ibtidaiyah (MI) Miftahul Ulum Darul Khidmah Sidogiri Bekasi - Buku Induk Santri, Dewan Asatidz, Kurikulum Kitab Kuning, dan Jadwal Ta'lim.",
};

export default function MiModulePage() {
  return <UnitManagementView slug="mi" />;
}
