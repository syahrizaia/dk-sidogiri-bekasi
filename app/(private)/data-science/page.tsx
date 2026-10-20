"use client";

import React from "react";
import Link from "next/link";
import { 
  BrainCircuit, 
  ArrowLeft, 
  TrendingUp, 
  MapPin, 
  BookOpen, 
  Bed, 
  CheckCircle2, 
  Download 
} from "lucide-react";
import { exportCorporateCSV } from "@/lib/export-utils";

export default function DataScienceDashboard() {

  // Mock Data Demografi Wilayah Santri Darul Khidmah Sidogiri Bekasi
  const konsulatData = [
    { nama: "Wilayah Bekasi (Kota & Kabupaten)", total: 295, mukim: 160, nonMukim: 135, persentase: 40 },
    { nama: "DKI Jakarta & Sekitar", total: 180, mukim: 150, nonMukim: 30, persentase: 24 },
    { nama: "Bogor, Depok & Tangerang", total: 120, mukim: 100, nonMukim: 20, persentase: 16 },
    { nama: "Karawang & Purwakarta", total: 85, mukim: 70, nonMukim: 15, persentase: 11 },
    { nama: "Utusan Luar Daerah & Alumni Sidogiri", total: 65, mukim: 65, nonMukim: 0, persentase: 9 },
  ];

  // Mock Proyeksi Kapasitas Asrama Darul Khidmah Sidogiri Bekasi
  const asramaCapacity = [
    { blok: "Blok A (Asrama Santri MI Miftahul Ulum)", terisi: 280, kapasitas: 300, status: "Tersedia Terbatas", percent: 93, color: "bg-rose-500" },
    { blok: "Blok B (Persiapan Santri MTs - Buka Tahun Depan)", terisi: 0, kapasitas: 120, status: "Siap Huni (Inden)", percent: 0, color: "bg-amber-500" },
    { blok: "Blok C (Asrama Tahfidz & TPQ Sidogiri)", terisi: 130, kapasitas: 150, status: "Tersedia Aman", percent: 87, color: "bg-emerald-500" },
  ];

  // Mock Indeks Capaian Mutaba'ah Kitab di Bekasi
  const kitabAchievements = [
    { kitab: "Mabadi'ul Fiqhiyyah & Fiqih Ibadah", tuntas: 94, pengajar: "Dewan Asatidz MI" },
    { kitab: "Matan Al-Jurumiyah & Nahwu Dasar", tuntas: 90, pengajar: "Ustadz Pembina Tarbiyah" },
    { kitab: "Al-Amtsilah At-Tashrifiyah (Shorof)", tuntas: 92, pengajar: "Asatidz Senior Sidogiri" },
    { kitab: "Metode Tartil & Tahsin Al-Qur'an", tuntas: 98, pengajar: "Markaz Tartil Darul Khidmah Sidogiri Bekasi" },
  ];

  const handleExportCSV = () => {
    const rows = [
      ...konsulatData.map((k) => ["Demografi Wilayah", k.nama, k.total, `Mukim: ${k.mukim}`, `Non-Mukim: ${k.nonMukim}`, `${k.persentase}%`]),
      ...asramaCapacity.map((a) => ["Kapasitas Asrama", a.blok, a.terisi, `Daya Tampung: ${a.kapasitas}`, `Status: ${a.status}`, `Okupansi: ${a.percent}%`]),
      ...kitabAchievements.map((c) => ["Capaian Kurikulum Kitab", c.kitab, `${c.tuntas}%`, c.pengajar, "Evaluasi Halaqoh", "Standar Tuntas"]),
    ];

    exportCorporateCSV({
      filename: "DataScience_DK_Sidogiri_Bekasi",
      title: "Laporan Dataset Statistik & Analitik Kependidikan",
      subtitle: "Executive Data Science Dashboard • Pondok Pesantren Sidogiri Ranting Bekasi",
      metadata: {
        "Cakupan Data": "Demografi Wilayah, Okupansi Asrama, & Capaian Kurikulum Kitab Kuning",
        "Total Entitas Dianalisis": "745 Santri Aktif",
      },
      columns: [
        { header: "No", accessor: (_, idx) => idx + 1 },
        { header: "Kategori Analitik", accessor: (r) => r[0] },
        { header: "Item / Subjek", accessor: (r) => r[1] },
        { header: "Total / Nilai Capaian", accessor: (r) => r[2] },
        { header: "Parameter 1", accessor: (r) => r[3] },
        { header: "Parameter 2", accessor: (r) => r[4] },
        { header: "Parameter 3", accessor: (r) => r[5] },
      ],
      data: rows,
    });
  };

  return (
    <div className="w-full transition-colors duration-400 py-6 sm:py-8">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link 
            href="/modules" 
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full liquid-glass-pill text-muted-foreground hover:text-foreground transition-all duration-300 w-fit"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Modul Sistem</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
              <BrainCircuit size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Model Regresi TS-2026.4 Active</span>
            </div>
          </div>
        </div>

        {/* Page Hero Header */}
        <div className="relative rounded-[32px] overflow-hidden liquid-glass-elevated border border-white/60 dark:border-white/10 p-6 sm:p-10 shadow-2xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/15">
                Pusat Analitik Darul Khidmah Sidogiri Bekasi
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Data Science & Predictive Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Pemodelan statistik dan machine learning untuk proyeksi kuota asrama MI & persiapan MTs serta sebaran demografi santri di wilayah Bekasi dan sekitarnya.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button 
                type="button"
                onClick={handleExportCSV}
                className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-600 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
              >
                <Download size={14} />
                <span>Export Dataset Raw (CSV)</span>
              </button>
            </div>
          </div>
        </div>

        {/* TOP STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="liquid-glass-interactive rounded-3xl p-6 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Tingkat Okupansi Asrama</span>
              <div className="w-9 h-9 rounded-2xl bg-rose-500/15 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                <Bed size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-extrabold text-foreground">89.1%</h3>
              <p className="text-[11px] text-muted-foreground font-medium">820 terisi dari 920 total ranjang</p>
            </div>
          </div>

          <div className="liquid-glass-interactive rounded-3xl p-6 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Proyeksi Pendaftar Syawal</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-extrabold text-foreground">+184 Jiwa</h3>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Confidence Interval 95%</p>
            </div>
          </div>

          <div className="liquid-glass-interactive rounded-3xl p-6 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Indeks Kelulusan Kitab</span>
              <div className="w-9 h-9 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <BookOpen size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-extrabold text-foreground">93.4 / 100</h3>
              <p className="text-[11px] text-muted-foreground font-medium">Ujian Semester Gasal 1447 H</p>
            </div>
          </div>

          <div className="liquid-glass-interactive rounded-3xl p-6 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Radius Asal Santri</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <MapPin size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-extrabold text-foreground">28 Provinsi</h3>
              <p className="text-[11px] text-muted-foreground font-medium">Termasuk santri dari luar negeri</p>
            </div>
          </div>
        </div>

        {/* BENTO GRID: KONSULAT DEMOGRAPHY & BED CAPACITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Demografi Konsulat Daerah (2 Cols) */}
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 lg:col-span-2 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Distribusi Demografi Berdasarkan Konsulat
                </h3>
                <p className="text-xs text-muted-foreground">
                  Perbandingan santri mukim vs murid pulang pergi per wilayah koordinasi santri Sidogiri
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full liquid-glass-pill text-emerald-800 dark:text-emerald-300">
                Total: 1.245 Santri
              </span>
            </div>

            <div className="space-y-4 pt-2">
              {konsulatData.map((item, idx) => (
                <div key={idx} className="space-y-2 p-3.5 rounded-2xl liquid-glass border border-border/40">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                    <span className="text-foreground">{item.nama}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground text-xs font-normal">
                        Mukim: <strong className="text-foreground">{item.mukim}</strong> • Pulang: <strong className="text-foreground">{item.nonMukim}</strong>
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{item.total} Santri</span>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                    <div 
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.persentase * 2.8}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span>Konsulat Pasuruan & Madura mencakup 57% dari total populasi madrasah.</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Update: Real-time MongoDB Atlas</span>
            </div>
          </div>

          {/* Kuota Kapasitas Asrama per Blok (1 Col) */}
          <div className="liquid-glass-elevated rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <Bed size={15} />
                <span>Kapasitas Kamar & Bilik</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">Pemantauan Blok Asrama</h3>
              <p className="text-xs text-muted-foreground">Batas maksimal kuota hunian santri mukim</p>
            </div>

            <div className="space-y-4">
              {asramaCapacity.map((item, idx) => (
                <div key={idx} className="space-y-1.5 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/40">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-foreground">{item.blok}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full liquid-glass-pill text-foreground">
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{item.terisi} / {item.kapasitas} Ranjang</span>
                    <span className="font-bold text-foreground">{item.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full`} 
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Saran Otomatis AI:</strong> Disarankan merelokasi santri baru tingkat Aliyah ke Blok C yang masih memiliki kapasitas tersisa 40 ranjang.
            </div>
          </div>

        </div>

        {/* CAPAIAN MUTABA'AH KITAB KUNING */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Indeks Capaian Kurikulum Kitab Salaf
              </h3>
              <p className="text-xs text-muted-foreground">
                Tingkat ketuntasan hafalan nadham dan pemahaman matan kitab kuning santri semester ini
              </p>
            </div>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={14} />
              <span>Standar Sidogiri Terpenuhi</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kitabAchievements.map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl liquid-glass border border-border/40 space-y-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">{item.kitab}</h4>
                  <p className="text-[11px] text-muted-foreground">{item.pengajar}</p>
                </div>
                <div className="space-y-1 pt-2 border-t border-border/30">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Ketuntasan:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">{item.tuntas}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full" 
                      style={{ width: `${item.tuntas}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
