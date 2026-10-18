"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight 
} from "lucide-react";

export default function InstansiOverview() {
  const [activeTab, setActiveTab] = useState("semua");

  const instansiList = [
    {
      id: "mi",
      slug: "mi",
      nama: "Madrasah Ibtidaiyah (MI) Miftahul Ulum",
      tingkat: "Pendidikan Dasar Salafiyah (Kelas 1 - 6 + Kelas Shifir)",
      santri: "490 Santri & Murid (Aktif Beroperasi)",
      kepala: "Ust. H. Nur Kholis, S.Pd.I",
      deskripsi: "Pondasi utama pembinaan akhlak mulia dan tarbiyah salafiyah di Bekasi. Menitikberatkan penguasaan baca tulis Arab Pegon, kaidah dasar nahwu-shorof (Al-Jurumiyah & Al-Amtsilah At-Tashrifiyah), serta fiqih ibadah amaliyah harian.",
      kitabUtama: ["Mabadi'ul Fiqhiyyah", "Matan Al-Jurumiyah", "Al-Amtsilah At-Tashrifiyah", "Aqidatul Awam", "Akhlaq Lil Banin"],
      badge: "Beroperasi Aktif",
      color: "from-emerald-600 to-teal-500",
      accent: "text-emerald-700 dark:text-emerald-400"
    },
    {
      id: "mts",
      slug: "mts",
      nama: "Madrasah Tsanawiyah (MTs) Miftahul Ulum",
      tingkat: "Pendidikan Menengah Pertama Salafiyah (Kelas 1 - 3 MTs)",
      santri: "Persiapan Buka Tahun Ajaran Depan",
      kepala: "Ust. H. Mas'ud Nawawi",
      deskripsi: "Program persiapan pembukaan jenjang lanjutan bagi alumni MI Miftahul Ulum di Darul Khidmah Sidogiri Bekasi. Direncanakan beroperasi penuh mulai tahun ajaran depan dengan fokus pendalaman gramatika Arab (Nadham Imrithi) dan Fathul Qorib.",
      kitabUtama: ["Nadham Al-Imrithi", "Fathul Qorib Al-Mujib", "Al-Kailani (Shorof)", "Taisirul Kholaq"],
      badge: "Buka Tahun Ajaran Depan",
      color: "from-teal-600 to-emerald-700",
      accent: "text-teal-700 dark:text-teal-400"
    },
    {
      id: "tpq",
      slug: "tpq",
      nama: "Taman Pendidikan Al-Qur'an (TPQ) Sidogiri",
      tingkat: "Pembinaan Tartil, Tahsin & Tahfidz (8 Tingkat Jilid + Ghorib)",
      santri: "255 Murid & Santri Cilik (Aktif Beroperasi)",
      kepala: "Ust. M. Ridwan Hakim",
      deskripsi: "Metode otentik Tartil Sidogiri yang membimbing santri melafalkan ayat suci Al-Qur'an dengan makhorijul huruf presisi, penguasaan hukum tajwid tartil, serta hafalan surat-surat pendek Juz 'Amma dan doa harian.",
      kitabUtama: ["Buku Panduan Metode Tartil Sidogiri", "Kitab Tajwid Asy-Syamsiyah", "Juz 'Amma & Doa Harian", "Ghoribul Qur'an"],
      badge: "Beroperasi Aktif",
      color: "from-amber-600 to-emerald-600",
      accent: "text-amber-700 dark:text-amber-400"
    }
  ];

  const filteredInstansi = activeTab === "semua" 
    ? instansiList 
    : instansiList.filter((item) => item.id === activeTab);

  return (
    <div className="w-full transition-colors duration-400 py-6 sm:py-8">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full liquid-glass-pill text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-xs font-semibold px-3 py-1 rounded-full liquid-glass-pill text-emerald-800 dark:text-emerald-300">
            Darul Khidmah Sidogiri Bekasi
          </span>
        </div>

        {/* Page Hero Header */}
        <div className="relative rounded-[32px] overflow-hidden liquid-glass-elevated border border-white/60 dark:border-white/10 p-6 sm:p-10 shadow-2xl space-y-4">
          <div className="max-w-3xl space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/15">
              Unit Lembaga Pendidikan Bekasi
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Lembaga Tarbiyah Darul Khidmah Sidogiri Bekasi
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Darul Khidmah Sidogiri Bekasi secara khusus menaungi <strong>Madrasah Miftahul Ulum</strong> (jenjang <strong>Madrasah Ibtidaiyah / MI</strong> aktif, dan persiapan <strong>Madrasah Tsanawiyah / MTs</strong> tahun depan) serta <strong>TPQ Al-Qur&apos;an Metode Tartil Sidogiri</strong>. <em>(Catatan: Jenjang Madrasah Aliyah / MA tidak diselenggarakan di Bekasi)</em>.
            </p>
          </div>

          {/* Tab Filter Capsule */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button 
              type="button"
              onClick={() => setActiveTab("semua")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "semua" 
                  ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md" 
                  : "liquid-glass-pill text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua Lembaga ({instansiList.length})
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("mi")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "mi" 
                  ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md" 
                  : "liquid-glass-pill text-muted-foreground hover:text-foreground"
              }`}
            >
              Madrasah Ibtidaiyah (MI) - Aktif
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("mts")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "mts" 
                  ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md" 
                  : "liquid-glass-pill text-muted-foreground hover:text-foreground"
              }`}
            >
              Madrasah Tsanawiyah (MTs) - Tahun Depan
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("tpq")}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === "tpq" 
                  ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md" 
                  : "liquid-glass-pill text-muted-foreground hover:text-foreground"
              }`}
            >
              TPQ Al-Qur&apos;an - Aktif
            </button>
          </div>
        </div>

        {/* Instansi Cards List with Bento Liquid Glass */}
        <div className="space-y-6">
          {filteredInstansi.map((item) => (
            <div 
              key={item.id}
              className="liquid-glass rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-xl border border-border/40 space-y-6 relative overflow-hidden group"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                
                <div className="space-y-4 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
                      {item.badge}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      Kepala Lembaga: <strong className="text-foreground">{item.kepala}</strong>
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {item.nama}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      {item.tingkat}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.deskripsi}
                  </p>

                  {/* Kitab Utama Tags */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Kitab & Kurikulum Inti:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.kitabUtama.map((kitab, kIdx) => (
                        <span 
                          key={kIdx}
                          className="px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-foreground flex items-center gap-1.5"
                        >
                          <BookOpen size={12} className="text-emerald-600 dark:text-emerald-400" />
                          <span>{kitab}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side Stats & Action */}
                <div className="lg:w-64 shrink-0 flex flex-col justify-between space-y-4 p-5 rounded-2xl liquid-glass border border-border/40">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Kapasitas Aktual</span>
                    <p className="text-2xl font-extrabold text-foreground">{item.santri}</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>Terdaftar Aktif</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/40 space-y-2">
                    <Link 
                      href={`/instansi/${item.slug}`}
                      className="liquid-sheen w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-600 text-white px-4 py-2.5 rounded-full text-xs font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      <span>Detail Kurikulum</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
