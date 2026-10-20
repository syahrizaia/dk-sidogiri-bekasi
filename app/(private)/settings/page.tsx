"use client";

import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Laptop, 
  ShieldCheck, 
  Bell, 
  CheckCircle2, 
  Save, 
  Lock, 
  Database 
} from "lucide-react";

const emptySubscribe = () => () => {};

export default function SettingsPage() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { theme, setTheme } = useTheme();

  const [notifWa, setNotifWa] = useState(true);
  const [notifMutasi, setNotifMutasi] = useState(true);
  const [notifJadwal, setNotifJadwal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="w-full transition-colors duration-400 py-6 sm:py-8">
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link 
            href="/modules" 
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full liquid-glass-pill text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Modul Sistem</span>
          </Link>
          <span className="text-xs font-semibold px-3 py-1 rounded-full liquid-glass-pill text-emerald-800 dark:text-emerald-300">
            Konfigurasi Sistem
          </span>
        </div>

        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/15">
              Preferensi & Manajemen
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Pengaturan Sistem Darul Khidmah Sidogiri Bekasi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Kelola preferensi antarmuka pengguna, notifikasi gerbang WhatsApp wali santri, serta keamanan database terintegrasi.
          </p>
        </div>

        {isSaved && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span>Perubahan preferensi sistem berhasil disimpan secara lokal dan aman.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* TEMA & VISUAL PREFERENCES */}
          <div className="liquid-glass rounded-[28px] p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border/40">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Sun size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Mode Tampilan Antarmuka (Apple Liquid Glass)</h2>
                <p className="text-xs text-muted-foreground">Pilih estetika warna tema yang nyaman bagi pandangan Anda</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Light Mode */}
              <button 
                type="button"
                onClick={() => setTheme("light")}
                className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                  mounted && theme === "light"
                    ? "bg-white/80 dark:bg-black/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/40"
                    : "liquid-glass border-border/40 hover:bg-white/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sun size={20} className="text-amber-500" />
                  {mounted && theme === "light" && <CheckCircle2 size={16} className="text-emerald-600" />}
                </div>
                <div>
                  <strong className="block text-xs text-foreground">Frosted Pearl</strong>
                  <span className="text-[11px] text-muted-foreground">Mode Terang Teduh Sidogiri</span>
                </div>
              </button>

              {/* Dark Mode */}
              <button 
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                  mounted && theme === "dark"
                    ? "bg-white/80 dark:bg-black/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/40"
                    : "liquid-glass border-border/40 hover:bg-white/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Moon size={20} className="text-emerald-400" />
                  {mounted && theme === "dark" && <CheckCircle2 size={16} className="text-emerald-600" />}
                </div>
                <div>
                  <strong className="block text-xs text-foreground">Obsidian Smoked</strong>
                  <span className="text-[11px] text-muted-foreground">Mode Gelap Kaca Jade</span>
                </div>
              </button>

              {/* System Preference */}
              <button 
                type="button"
                onClick={() => setTheme("system")}
                className={`p-4 rounded-2xl border text-left space-y-2 transition-all cursor-pointer ${
                  mounted && theme === "system"
                    ? "bg-white/80 dark:bg-black/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/40"
                    : "liquid-glass border-border/40 hover:bg-white/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Laptop size={20} className="text-teal-600" />
                  {mounted && theme === "system" && <CheckCircle2 size={16} className="text-emerald-600" />}
                </div>
                <div>
                  <strong className="block text-xs text-foreground">Sistem Otomatis</strong>
                  <span className="text-[11px] text-muted-foreground">Menyesuaikan Device OS</span>
                </div>
              </button>
            </div>
          </div>

          {/* NOTIFIKASI GATEWAY */}
          <div className="liquid-glass rounded-[28px] p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border/40">
              <div className="w-9 h-9 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <Bell size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Notifikasi WhatsApp & Administrasi</h2>
                <p className="text-xs text-muted-foreground">Integrasi pengiriman pesan resmi ke nomor telepon wali santri</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3.5 rounded-2xl liquid-glass border border-border/40 cursor-pointer">
                <div className="space-y-0.5">
                  <strong className="text-xs text-foreground block">Notifikasi Status Pendaftaran Baru</strong>
                  <span className="text-[11px] text-muted-foreground">Kirim pesan WhatsApp otomatis saat santri baru berhasil diverifikasi</span>
                </div>
                <input 
                  type="checkbox"
                  checked={notifWa}
                  onChange={(e) => setNotifWa(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl liquid-glass border border-border/40 cursor-pointer">
                <div className="space-y-0.5">
                  <strong className="text-xs text-foreground block">Pemberitahuan Izin Pulang & Mutasi</strong>
                  <span className="text-[11px] text-muted-foreground">Kirim tembusan pesan ke kontak wali saat ada surat izin santri dikeluarkan</span>
                </div>
                <input 
                  type="checkbox"
                  checked={notifMutasi}
                  onChange={(e) => setNotifMutasi(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl liquid-glass border border-border/40 cursor-pointer">
                <div className="space-y-0.5">
                  <strong className="text-xs text-foreground block">Pengingat Ujian Semester & Imtihan</strong>
                  <span className="text-[11px] text-muted-foreground">Kirim jadwal imtihan berkala kepada para wali santri</span>
                </div>
                <input 
                  type="checkbox"
                  checked={notifJadwal}
                  onChange={(e) => setNotifJadwal(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* KEAMANAN & DATABASE */}
          <div className="liquid-glass rounded-[28px] p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border/40">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Integritas Keamanan Database</h2>
                <p className="text-xs text-muted-foreground">Status enkripsi pangkalan data Darul Khidmah Sidogiri Bekasi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl liquid-glass border border-emerald-500/30 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Database size={14} />
                  <span>MongoDB Atlas Enterprise Protected</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Data santri dan transaksi tarbiyah dilindungi dengan klaster MongoDB Atlas (dk-sidogiri-bekasi) berenkripsi SSL/TLS tingkat tinggi dan backup otomatis terdistribusi.
                </p>
              </div>

              <div className="p-4 rounded-2xl liquid-glass border border-emerald-500/30 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <Lock size={14} />
                  <span>Pencadangan Otomatis</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Backup snapshot basis data dilakukan setiap 24 jam sekali pada pukul 02.00 WIB (Waktu Istirahat Santri).
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link 
              href="/"
              className="px-5 py-2.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:bg-white/40 transition-all"
            >
              Batal
            </Link>
            <button 
              type="submit"
              className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow-lg shadow-emerald-950/20 hover:shadow-emerald-700/30 transition-all cursor-pointer"
            >
              <Save size={14} />
              <span>Simpan Pengaturan</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
