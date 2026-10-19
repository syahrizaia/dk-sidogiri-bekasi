import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  UserPlus, 
  Download
} from "lucide-react";

interface InstansiDetail {
  slug: string;
  nama: string;
  tingkat: string;
  santri: string;
  kepala: string;
  sejarah: string;
  kurikulum: { kelas: string; kitab: string[]; fokus: string }[];
  jadwalHarian: { waktu: string; kegiatan: string }[];
}

const dataInstansi: Record<string, InstansiDetail> = {
  mi: {
    slug: "mi",
    nama: "Madrasah Ibtidaiyah (MI) Miftahul Ulum Darul Khidmah Sidogiri Bekasi",
    tingkat: "Jenjang Pendidikan Dasar Salafiyah (Kelas 1 - 6 + Kelas Shifir)",
    santri: "490 Santri & Murid (Aktif Beroperasi)",
    kepala: "Ust. H. Nur Kholis, S.Pd.I",
    sejarah: "Didirikan sebagai lembaga pendidikan resmi Darul Khidmah Sidogiri Bekasi untuk mencetak generasi salaf yang berakhlak karimah, menguasai literasi Arab Pegon, kaidah dasar nahwu-shorof, dan fiqih ibadah praktis.",
    kurikulum: [
      { kelas: "Kelas Shifir / Ibtidaiyah 1", kitab: ["Mabadi'ul Fiqhiyyah Juz 1", "Aqidatul Awam", "Hidayatus Shibyan"], fokus: "Pengenalan Tauhid, Adab Sholat & Tajwid Dasar" },
      { kelas: "Kelas Ibtidaiyah 2 - 3", kitab: ["Fasholatan", "Al-Amtsilah At-Tashrifiyah (Bab Awal)", "Safinatun Naja"], fokus: "Morfologi Kata (Shorof) & Fiqih Ibadah Praktis" },
      { kelas: "Kelas Ibtidaiyah 4 - 6", kitab: ["Matan Al-Jurumiyah", "Taqrib Abi Syuja'", "Akhlaq Lil Banin Juz 2"], fokus: "Sintaksis Nahwu Lanjutan & Kaidah I'rob Kalimat" },
    ],
    jadwalHarian: [
      { waktu: "07.00 - 08.30", kegiatan: "Diniyah Pagi: Pengajian Kitab Fiqih & Akhlak" },
      { waktu: "08.45 - 11.30", kegiatan: "Kajian Nahwu Shorof & Praktik Baca Arab Pegon" },
      { waktu: "13.30 - 15.00", kegiatan: "Tadarrus Al-Qur'an & Bimbingan Tartil Tajwid" },
      { waktu: "19.30 - 21.00", kegiatan: "Musyawarah Kamar & Muroja'ah Hafalan Nadham" },
    ]
  },
  mts: {
    slug: "mts",
    nama: "Madrasah Tsanawiyah (MTs) Miftahul Ulum Darul Khidmah Sidogiri Bekasi",
    tingkat: "Jenjang Pendidikan Menengah Pertama Salafiyah (Kelas 1 - 3 MTs)",
    santri: "Persiapan Buka Tahun Ajaran Depan (Pendaftaran Inden Terbuka)",
    kepala: "Ust. H. Mas'ud Nawawi",
    sejarah: "Jenjang lanjutan tingkat menengah pertama bagi alumni MI Miftahul Ulum di Darul Khidmah Sidogiri Bekasi. Direncanakan beroperasi penuh mulai tahun ajaran depan untuk memperdalam kajian kitab kuning gundul, gramatika bahasa Arab, dan musyawarah fiqih. (Catatan: Jenjang Aliyah/MA tidak dibuka di Bekasi).",
    kurikulum: [
      { kelas: "Tsanawiyah 1", kitab: ["Nadham Al-Imrithi", "Fathul Qorib Al-Mujib (Ibadah)", "Al-Kailani (Shorof)"], fokus: "Gramatika Nahwu Menengah & Penguasaan Kaidah Shighat Shorof" },
      { kelas: "Tsanawiyah 2", kitab: ["Nadham Al-Maqsud", "Fathul Qorib (Mu'amalat)", "Taisirul Kholaq"], fokus: "Analisis Struktur I'rob & Fiqih Transaksi Mu'amalah" },
      { kelas: "Tsanawiyah 3", kitab: ["Alfiyah Ibnu Malik (Dasar)", "Fathul Qorib (Munakahat & Jinayat)", "Jauharul Maknun"], fokus: "Persiapan Baca Kitab Kuning Gundul & Balaghah Dasar" },
    ],
    jadwalHarian: [
      { waktu: "07.00 - 09.00", kegiatan: "Halaqoh Utama: Sorogan Nadham Imrithi & Fathul Qorib" },
      { waktu: "09.30 - 11.30", kegiatan: "Bandongan Kitab Kaidah Gramatika Bahasa Arab" },
      { waktu: "13.30 - 15.00", kegiatan: "Muroja'ah Nadham & Pendalaman Kosakata Arab" },
      { waktu: "20.00 - 21.45", kegiatan: "Musyawarah Fiqih Antar-Bilik Kamar Santri" },
    ]
  },
  tpq: {
    slug: "tpq",
    nama: "Taman Pendidikan Al-Qur'an (TPQ) Darul Khidmah Sidogiri Bekasi",
    tingkat: "Pembinaan Tartil, Tahsin & Tahfidz Al-Qur'an (8 Tingkat Jilid)",
    santri: "255 Murid & Santri Cilik (Aktif Beroperasi)",
    kepala: "Ust. M. Ridwan Hakim",
    sejarah: "Metode Tartil Sidogiri dirumuskan secara otentik oleh para masyayikh Sidogiri untuk mempermudah santri dan murid melafalkan ayat suci Al-Qur'an sesuai kaidah tajwid yang fasih dan bertahap di lingkungan Darul Khidmah Sidogiri Bekasi.",
    kurikulum: [
      { kelas: "Jilid 1 - 3", kitab: ["Buku Tartil Sidogiri Jilid 1-3"], fokus: "Pengenalan Huruf Hijaiyah Tunggal & Sambung Berharakat" },
      { kelas: "Jilid 4 - 6", kitab: ["Buku Tartil Sidogiri Jilid 4-6", "Doa Sholat"], fokus: "Kaidah Mad (Panjang/Pendek), Sukun & Tasydid" },
      { kelas: "Jilid 7 - 8 & Ghorib", kitab: ["Kitab Ghoribul Qur'an", "Juz 30 ('Amma)"], fokus: "Hukum Nun Sukun, Mim Sukun, Waqaf & Ayat Musykilat" },
    ],
    jadwalHarian: [
      { waktu: "14.00 - 15.15", kegiatan: "Bimbingan Klasikal Jilid Tartil Sidogiri" },
      { waktu: "15.30 - 16.30", kegiatan: "Sorogan Individu Makhorijul Huruf & Tajwid" },
      { waktu: "16.30 - 17.00", kegiatan: "Hafalan Doa Harian, Surat Pendek & Doa Khatam" },
    ]
  }
};

// Alias slug mts-ma agar URL lama tetap mengarah ke profil MTs Bekasi
dataInstansi["mts-ma"] = dataInstansi["mts"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = dataInstansi[slug];

  if (!data) {
    return {
      title: "Instansi Tidak Ditemukan",
      description: "Halaman detail instansi pendidikan tidak ditemukan.",
    };
  }

  return {
    title: data.nama,
    description: data.sejarah.slice(0, 160),
    alternates: {
      canonical: `/instansi/${data.slug}`,
    },
    openGraph: {
      title: `${data.nama} | Darul Khidmah Sidogiri Bekasi`,
      description: data.sejarah.slice(0, 160),
      url: `/instansi/${data.slug}`,
      images: [
        {
          url: "/logo-sidogiri.jpeg",
          width: 800,
          height: 800,
          alt: data.nama,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.nama} | Darul Khidmah Sidogiri Bekasi`,
      description: data.sejarah.slice(0, 160),
      images: ["/logo-sidogiri.jpeg"],
    },
  };
}

export default async function InstansiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = dataInstansi[slug];

  if (!data) {
    notFound();
  }

  return (
    <div className="w-full transition-colors duration-400 py-6 sm:py-8">
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link 
            href="/instansi" 
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full liquid-glass-pill text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Daftar Instansi</span>
          </Link>
          <span className="text-xs font-semibold px-3 py-1 rounded-full liquid-glass-pill text-emerald-800 dark:text-emerald-300">
            {data.tingkat.split("(")[0]}
          </span>
        </div>

        {/* Instansi Header Banner */}
        <div className="relative rounded-[32px] overflow-hidden liquid-glass-elevated border border-white/60 dark:border-white/10 p-6 sm:p-10 shadow-2xl space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/15">
                Profil Resmi Lembaga
              </span>
              <span className="text-xs text-muted-foreground">Pondok Pesantren Sidogiri</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              {data.nama}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {data.sejarah}
            </p>
          </div>

          <div className="pt-3 border-t border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-2xl liquid-glass border border-border/40">
              <span className="text-muted-foreground text-[10px] block">Kepala Lembaga:</span>
              <strong className="text-foreground">{data.kepala}</strong>
            </div>
            <div className="p-3 rounded-2xl liquid-glass border border-border/40">
              <span className="text-muted-foreground text-[10px] block">Total Peserta Didik:</span>
              <strong className="text-emerald-700 dark:text-emerald-400 break-words">{data.santri}</strong>
            </div>
            <div className="p-3 rounded-2xl liquid-glass border border-border/40">
              <span className="text-muted-foreground text-[10px] block">Status Akreditasi:</span>
              <strong className="text-foreground">Mu&apos;adalah Salafiyah Terakreditasi</strong>
            </div>
          </div>
        </div>

        {/* Kurikulum & Silabus Kitab Kuning */}
        <div className="liquid-glass rounded-[32px] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Silabus Kurikulum & Kitab Rujukan
              </h2>
              <p className="text-xs text-muted-foreground">
                Materi wajib per tingkatan kelas berdasarkan panduan Majlis Tarbiyah Sidogiri
              </p>
            </div>
            <button 
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:bg-white/40"
            >
              <Download size={13} />
              <span>Silabus Lengkap (PDF)</span>
            </button>
          </div>

          <div className="space-y-4">
            {data.kurikulum.map((kur, idx) => (
              <div key={idx} className="p-5 rounded-2xl liquid-glass border border-border/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>{kur.kelas}</span>
                  </h3>
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10">
                    Fokus: {kur.fokus}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {kur.kitab.map((k, kIdx) => (
                    <span key={kIdx} className="px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <BookOpen size={12} className="text-emerald-600 dark:text-emerald-400" />
                      <span>{k}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jadwal Kegiatan Harian */}
        <div className="liquid-glass rounded-[32px] p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Rutinitas & Jadwal Ta&apos;lim Harian
            </h2>
            <p className="text-xs text-muted-foreground">
              Tata tertib kegiatan pembelajaran santri pagi, siang, dan malam hari
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.jadwalHarian.map((jad, jIdx) => (
              <div key={jIdx} className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Clock size={13} />
                  <span>{jad.waktu}</span>
                </div>
                <p className="text-xs text-foreground font-semibold leading-relaxed">
                  {jad.kegiatan}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA to Register */}
        <div className="liquid-glass-elevated rounded-[28px] p-6 text-center space-y-3 shadow-xl">
          <h3 className="text-lg font-bold text-foreground">
            Tertarik Mendaftarkan Santri ke {data.nama.split("Miftahul")[0]}?
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Pendaftaran dibuka secara daring maupun tatap muka langsung di Sekretariat Darul Khidmah Sidogiri Bekasi.
          </p>
          <div className="pt-2">
            <Link 
              href="/santri-baru"
              className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-600 text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <UserPlus size={14} />
              <span>Daftar Sekarang Secara Daring</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
