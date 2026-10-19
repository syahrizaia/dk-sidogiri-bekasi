import React from "react";
import { Metadata } from "next";
import { UnitManagementView } from "../components/UnitManagementView";

export const metadata: Metadata = {
  title: "Madrasah Tsanawiyah (MTs) | Darul Khidmah Sidogiri Bekasi",
  description: "Manajemen mandiri Madrasah Tsanawiyah (MTs) Miftahul Ulum Darul Khidmah Sidogiri Bekasi - Persiapan pembukaan, kurikulum turats menengah, santri pendaftar, dan jadwal ta'lim.",
};

export default function MtsModulePage() {
  return <UnitManagementView slug="mts" />;
}
