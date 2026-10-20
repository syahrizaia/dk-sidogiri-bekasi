"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, HeartHandshake, Sparkles, BookOpen } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="mt-auto mx-auto mb-6 sm:mb-8 max-w-7xl w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] transition-all duration-300">
      {/* Liquid Glass Panel Container */}
      <div className="rounded-[24px] sm:rounded-[28px] liquid-glass p-5 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative inner corner glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-emerald-500/10 via-transparent to-transparent pointer-events-none rounded-tr-[28px]" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10 relative z-10">
          {/* Deskripsi Brand & Khidmah Sidogiri */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white/95 dark:bg-emerald-950/90 p-0.5 shadow-md shadow-emerald-950/20 ring-1.5 ring-emerald-600/40 dark:ring-emerald-400/40 flex items-center justify-center shrink-0">
                <Image
                  src="/logo-sidogiri.jpeg"
                  alt="Logo Darul Khidmah Sidogiri Bekasi"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <span className="font-bold text-sm text-foreground tracking-tight block">
                  Darul Khidmah Sidogiri
                </span>
                <span className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400 tracking-wider">
                  Bekasi
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Integrasi ekosistem pendidikan kepesantrenan Darul Khidmah Sidogiri Bekasi. Menaungi Madrasah Miftahul Ulum (MI aktif & persiapan MTs) serta TPQ Metode Tartil Sidogiri.
            </p>

            {/* Sosmed dengan Efek Refleksi Kaca */}
            <div className="flex items-center gap-2 pt-1">
              <a 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Sidogiri"
                className="p-2.5 rounded-full liquid-glass-pill text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300 hover:scale-110 transition-all duration-300"
              >
                <FaInstagram size={14} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube Sidogiri"
                className="p-2.5 rounded-full liquid-glass-pill text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:scale-110 transition-all duration-300"
              >
                <FaYoutube size={14} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Sidogiri"
                className="p-2.5 rounded-full liquid-glass-pill text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:scale-110 transition-all duration-300"
              >
                <FaFacebook size={14} />
              </a>
            </div>
          </div>

          {/* Navigasi Sistem Akademik */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <BookOpen size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Sistem Tarbiyah</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors font-medium">
                  Profil & Tentang Yayasan
                </Link>
              </li>
              <li>
                <Link href="/students" className="text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                  Data Induk Santri & Murid
                </Link>
              </li>
              <li>
                <Link href="/institutions/mi" className="text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                  Madrasah Ibtidaiyah (MI) - Beroperasi
                </Link>
              </li>
              <li>
                <Link href="/institutions/mts" className="text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                  Madrasah Tsanawiyah (MTs) - Tahun Depan
                </Link>
              </li>
              <li>
                <Link href="/institutions/tpq" className="text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                  Taman Pendidikan Al-Qur&apos;an (TPQ)
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                  Pendaftaran Santri Baru
                </Link>
              </li>
            </ul>
          </div>

          {/* Analitik & Data Science */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-500" />
              <span>Analitik Khidmah</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/data-science" className="text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                  Statistik Demografi Wilayah Bekasi
                </Link>
              </li>
              <li>
                <Link href="/data-science" className="text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                  Prediksi Daya Tampung Asrama
                </Link>
              </li>
              <li>
                <Link href="/data-science" className="text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                  Rasio Santri Mukim & Non-Mukim
                </Link>
              </li>
              <li>
                <Link href="/data-science" className="text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                  Laporan Evaluasi Tarbiyah
                </Link>
              </li>
            </ul>
          </div>

          {/* Keamanan & Dukungan Sistem */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <HeartHandshake size={13} className="text-teal-600 dark:text-teal-400" />
              <span>Integritas Sistem</span>
            </h4>
            <div className="p-4 rounded-2xl liquid-glass-pill border border-border/50 space-y-2">
              <div className="flex items-center gap-2 text-xs text-foreground font-semibold">
                <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>MongoDB Atlas Secured</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Terkoneksi aman dengan klaster database MongoDB Atlas & enkripsi terdistribusi untuk menjaga integritas dan kerahasiaan data santri.
              </p>
            </div>
          </div>
        </div>

        {/* Garis Pembatas Kaca */}
        <div className="border-t border-border/40 my-6" />

        {/* Copyright & Kutipan Khas Pesantren */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground text-center sm:text-left">
          <p>© 2026 Darul Khidmah Sidogiri Bekasi. Khidmah Lil-Ma&apos;had Wal-Ummah.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-5">
            <Link href="/about#kontak" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
              Kebijakan Privasi
            </Link>
            <span className="opacity-30">•</span>
            <Link href="/about#kontak" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
              Ketentuan Layanan
            </Link>
            <span className="opacity-30">•</span>
            <Link href="/about#kontak" className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
              Bantuan Khidmah
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}