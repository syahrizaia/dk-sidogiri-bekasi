import React from "react";
import { Metadata } from "next";
import { UnitManagementView } from "../components/UnitManagementView";

export const metadata: Metadata = {
  title: "TPQ Al-Qur'an Sidogiri | Darul Khidmah Sidogiri Bekasi",
  description: "Manajemen mandiri Taman Pendidikan Al-Qur'an (TPQ) Sidogiri Bekasi - Metode Tartil Sidogiri 6 Jilid, Dewan Pengajar Tahsin/Tahfidz, Santri, dan Jadwal Halaqah.",
};

export default function TpqModulePage() {
  return <UnitManagementView slug="tpq" />;
}
