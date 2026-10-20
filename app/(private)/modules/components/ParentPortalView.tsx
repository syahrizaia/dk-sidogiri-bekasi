"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  HeartHandshake, 
  GraduationCap, 
  BookOpen, 
  BedDouble, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  Sparkles, 
  Users, 
  Video, 
  Download, 
  ChevronRight, 
  LogOut,
  Send,
  FileText,
  CreditCard,
  Megaphone,
  X
} from "lucide-react";
import { getStudentsAction, SantriRecord } from "@/lib/actions/students";
import { submitIzinSantriAction } from "@/lib/actions/leave-requests";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  studentNis?: string;
  studentName?: string;
  studentId?: string;
  parentId?: string;
}

interface ParentPortalViewProps {
  user: UserProfile;
  currentTime: string;
  onLogout: () => Promise<void>;
  loggingOut: boolean;
}

export function ParentPortalView({ user, currentTime, onLogout, loggingOut }: ParentPortalViewProps) {
  const [activeTab, setActiveTab] = useState<"akademik" | "asrama" | "syahriyah" | "maklumat">("akademik");
  const [student, setStudent] = useState<SantriRecord | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [izinModalOpen, setIzinModalOpen] = useState(false);
  const [izinSubmitting, setIzinSubmitting] = useState(false);
  const [izinSuccess, setIzinSuccess] = useState(false);
  const [izinError, setIzinError] = useState("");
  const [izinData, setIzinData] = useState({
    alasan: "Keperluan Keluarga",
    tanggalMulai: "",
    tanggalSelesai: "",
    catatan: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function loadStudent() {
      try {
        const res = await getStudentsAction();
        if (res.success && res.data && isMounted) {
          const matched = res.data.find(
            (s) =>
              (user.studentNis && s.nis === user.studentNis) ||
              (user.studentName && s.nama.toLowerCase() === user.studentName.toLowerCase()) ||
              (user.name && s.wali.toLowerCase() === user.name.toLowerCase()) ||
              s.nis === "2024.11.001"
          );
          if (matched) {
            setStudent(matched);
          }
        }
      } catch (err) {
        console.error("Gagal memuat profil santri:", err);
      } finally {
        if (isMounted) setLoadingStudent(false);
      }
    }
    loadStudent();
    return () => {
      isMounted = false;
    };
  }, [user.studentNis, user.studentName, user.name]);

  const studentName = student?.nama || user.studentName || "Ahmad Fawaid";
  const studentNis = student?.nis || user.studentNis || "2024.11.001";
  const studentJenjang = student?.jenjang === "MI" ? "Madrasah Ibtidaiyah (MI) Miftahul Ulum" : student?.jenjang === "MTs" ? "Madrasah Tsanawiyah (MTs) Miftahul Ulum" : "TPQ Miftahul Ulum";
  const studentClass = student?.kelas || "6 Ibtidaiyah A";
  const studentKonsulat = student?.konsulat || "Bekasi Timur";
  const studentStatus = student?.status === "NON-MUKIM" ? "NON-MUKIM (PULANG-PERGI)" : "MUKIM DI ASRAMA";
  const studentKamar = student?.kamar || "Blok A - Kamar 04";
  const studentInitials = studentName.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase() || "AF";

  const handleKirimIzin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIzinSubmitting(true);
    setIzinError("");
    try {
      const res = await submitIzinSantriAction({
        studentId: student?.id || user.studentId,
        studentNis: studentNis,
        studentName: studentName,
        alasan: izinData.alasan,
        tanggalMulai: izinData.tanggalMulai,
        tanggalSelesai: izinData.tanggalSelesai,
        catatan: izinData.catatan,
      });

      if (res.success) {
        setIzinSuccess(true);
        setTimeout(() => {
          setIzinModalOpen(false);
          setIzinSuccess(false);
          setIzinData({ alasan: "Keperluan Keluarga", tanggalMulai: "", tanggalSelesai: "", catatan: "" });
        }, 1500);
      } else {
        setIzinError(res.error || "Gagal mengajukan izin.");
      }
    } catch {
      setIzinError("Terjadi kesalahan sistem saat mengirim izin.");
    } finally {
      setIzinSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen py-8 sm:py-10 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Background Accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 flex items-center justify-center opacity-30 dark:opacity-20">
        <div className="w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-amber-500/10 via-emerald-500/10 to-teal-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Top Welcome Header for Wali Santri */}
      <div className="rounded-3xl liquid-glass-elevated p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-emerald-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold">
              <HeartHandshake size={14} />
              <span>Portal Resmi Keluarga &amp; Wali Santri</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex flex-wrap items-baseline gap-2.5">
              <span className="font-serif font-bold text-amber-800 dark:text-amber-300 text-3xl sm:text-4xl leading-none">
                أَهْلاً وَسَهْلاً،
              </span>
              <span>Bapak/Ibu {user.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Pantau perkembangan ubudiyah, capaian kitab kuning &amp; Al-Qur&apos;an, kedisiplinan asrama, serta koordinasi terpadu dengan asatidz Darul Khidmah Sidogiri Bekasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <div className="px-3.5 py-2 rounded-2xl liquid-glass-pill border border-white/50 text-xs font-semibold flex items-center gap-2 text-foreground/80">
              <Clock size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>{currentTime || "WIB"}</span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut size={14} />
              <span>{loggingOut ? "Keluar..." : "Keluar Sesi"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Hero Card: Profil Santri Asuhan Terhubung */}
      <div className="rounded-3xl liquid-glass-elevated p-6 sm:p-8 border border-white/70 dark:border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/40">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-950/25 shrink-0">
              {studentInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  NIS: {studentNis}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  {studentStatus}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground mt-1">
                {studentName}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {studentJenjang} • Kelas {studentClass} • Konsulat {studentKonsulat}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`https://wa.me/6281234567801?text=${encodeURIComponent(`Assalamu'alaikum Ustadz, saya Wali dari ${studentName} (${studentJenjang} Kelas ${studentClass}) ingin berkoordinasi.`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Wali Kelas</span>
            </a>

            <button
              type="button"
              onClick={() => setIzinModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full liquid-glass-pill hover:bg-white/40 text-foreground text-xs font-bold transition-all cursor-pointer"
            >
              <FileText size={15} className="text-amber-600" />
              <span>Ajukan Izin Santri</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium block">Kehadiran Shalat &amp; Kelas</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">98.5%</span>
              <span className="text-[10px] text-emerald-600 font-bold">Sangat Rajin</span>
            </div>
            <p className="text-[10px] text-muted-foreground">0 Alpa • 1 Izin Sakit (Terkonfirmasi)</p>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium block">Capaian Tartil Al-Qur&apos;an</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-700 dark:text-teal-400">Jilid 6</span>
              <span className="text-[10px] text-teal-600 font-bold">Progres 92%</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Metode Tartil Sidogiri Pasuruan</p>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium block">Kamar Asrama Santri</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-indigo-700 dark:text-indigo-400">{studentKamar}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {student?.status === "NON-MUKIM" ? "Santri Non-Asrama (Pulang-Pergi)" : "Asrama Darul Khidmah Sidogiri"}
            </p>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium block">Syahriyah Pesantren</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">LUNAS</span>
              <span className="text-[10px] text-emerald-600 font-bold">Okt 2026</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Terverifikasi Bendahara Yayasan</p>
          </div>
        </div>
      </div>

      {/* Interactive Tabs Header */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab("akademik")}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "akademik"
              ? "bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-md shadow-emerald-950/20"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <BookOpen size={14} />
            <span>Akademik &amp; Kitab</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("asrama")}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "asrama"
              ? "bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-md shadow-emerald-950/20"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <BedDouble size={14} />
            <span>Asrama &amp; Sambangan</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("syahriyah")}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "syahriyah"
              ? "bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-md shadow-emerald-950/20"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <CreditCard size={14} />
            <span>Syahriyah &amp; Infaq</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("maklumat")}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "maklumat"
              ? "bg-gradient-to-r from-emerald-800 to-teal-700 text-white shadow-md shadow-emerald-950/20"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <Megaphone size={14} />
            <span>Maklumat Yayasan</span>
          </span>
        </button>
      </div>

      {/* Tab 1: Akademik & Kitab Kuning */}
      {activeTab === "akademik" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <BookOpen size={18} className="text-emerald-600" />
              <span>Target &amp; Capaian Kitab Kuning</span>
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl liquid-glass border border-border/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Fiqih: Safinatun Najah</span>
                  <span className="text-emerald-600">Khatam &amp; Lulus Ujian</span>
                </div>
                <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full w-full" />
                </div>
                <p className="text-[11px] text-muted-foreground">Kajian Fiqih Ibadah Praktis Thaharah &amp; Shalat</p>
              </div>

              <div className="p-3.5 rounded-2xl liquid-glass border border-border/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Nahwu: Matan Al-Jurumiyah</span>
                  <span className="text-teal-600">Bab I&apos;rab (75%)</span>
                </div>
                <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full w-3/4" />
                </div>
                <p className="text-[11px] text-muted-foreground">Hafalan matan kaidah tata bahasa Arab dasar</p>
              </div>

              <div className="p-3.5 rounded-2xl liquid-glass border border-border/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Tauhid: Nadhom Aqidatul Awam</span>
                  <span className="text-emerald-600">57 Bait Khatam</span>
                </div>
                <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full w-full" />
                </div>
                <p className="text-[11px] text-muted-foreground">Hafalan aqidah ahlussunnah wal jama&apos;ah</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <GraduationCap size={18} className="text-teal-600" />
              <span>Catatan Evaluasi Wali Kelas &amp; Asatidz</span>
            </h3>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 size={15} />
                <span>Ust. M. Sholeh Al-Bantani, S.Pd.I (Wali Kelas 6A)</span>
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed italic">
                &ldquo;Alhamdulillah ananda {studentName} menunjukkan ketelatenan tinggi dalam sorogan kitab Fathul Qorib dan sangat disiplin dalam shalat subuh berjamaah. Makhraj tajwidnya fasih dan tartil.&rdquo;
              </p>
              <span className="text-[10px] text-muted-foreground block pt-1">
                Diperbarui pada: 18 Oktober 2026
              </span>
            </div>

            <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-2 text-xs">
              <span className="font-bold text-foreground block">Jadwal Ujian Imtihan Caturwulan I</span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Pelaksanaan Imtihan tulis &amp; lisan (Sorogan Kitab &amp; Fasholatan) dijadwalkan pada tanggal 12 - 19 November 2026.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Keasramaan & Jadwal Sambang */}
      {activeTab === "asrama" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <BedDouble size={18} className="text-indigo-600" />
              <span>Informasi Kamar &amp; Pembina Asrama</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl liquid-glass border border-border/40 flex items-center justify-between">
                <span className="text-muted-foreground">Asrama:</span>
                <span className="font-bold text-foreground">Asrama Sayyid Sulaiman</span>
              </div>
              <div className="p-3.5 rounded-2xl liquid-glass border border-border/40 flex items-center justify-between">
                <span className="text-muted-foreground">Nomor Kamar:</span>
                <span className="font-bold text-foreground">Blok A - Kamar 04</span>
              </div>
              <div className="p-3.5 rounded-2xl liquid-glass border border-border/40 flex items-center justify-between">
                <span className="text-muted-foreground">Musyrif Kamar:</span>
                <span className="font-bold text-foreground">Ust. Farhan Syuhada, S.Hum</span>
              </div>
              <div className="p-3.5 rounded-2xl liquid-glass border border-border/40 flex items-center justify-between">
                <span className="text-muted-foreground">Kapasitas Kamar:</span>
                <span className="font-bold text-foreground">6 Tempat Tidur (Terisi Penuh)</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Calendar size={18} className="text-amber-600" />
              <span>Jadwal Sambang (Kunjungan Wali Santri)</span>
            </h3>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
              <span className="font-bold text-amber-900 dark:text-amber-300 block">
                Hari Kunjungan Resmi: Ahad Legi &amp; Ahad Wage
              </span>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Waktu sambangan dibuka pukul <strong>08.00 s/d 16.30 WIB</strong> di Aula Pertemuan Khusus Wali Santri Darul Khidmah Sidogiri Bekasi.
              </p>
              <div className="pt-2 text-[10px] text-amber-800 dark:text-amber-300 font-semibold">
                * Demi ketertiban pengajian santri, penitipan uang saku dan bekal di luar hari sambang wajib melalui pos piket keamanan yayasan.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIzinModalOpen(true)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Ajukan Permohonan Izin Kepulangan / Sakit
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Administrasi Syahriyah & Infaq */}
      {activeTab === "syahriyah" && (
        <div className="rounded-3xl liquid-glass-elevated p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-xl space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
            <div>
              <h3 className="text-lg font-bold text-foreground">Rekap Administrasi &amp; Infaq Syahriyah</h3>
              <p className="text-xs text-muted-foreground">Pembayaran iuran operasional pendidikan dan asrama santri</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold self-start sm:self-center">
              <CheckCircle2 size={14} />
              <span>Status: Bebas Tunggakan</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1 text-xs">
              <span className="text-muted-foreground text-[11px]">Syahriyah Oktober 2026:</span>
              <p className="font-black text-foreground text-base">Rp 650.000</p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Lunas (05 Okt 2026)</span>
              </span>
            </div>
            <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1 text-xs">
              <span className="text-muted-foreground text-[11px]">Infaq Makan &amp; Asrama:</span>
              <p className="font-black text-foreground text-base">Termasuk Paket</p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>3x Makan Sehat Harian</span>
              </span>
            </div>
            <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-1 text-xs">
              <span className="text-muted-foreground text-[11px]">Infaq Pembangunan Asrama:</span>
              <p className="font-black text-foreground text-base">Tercatat Aktif</p>
              <span className="text-[10px] text-teal-600 font-bold block">Jazaakumullah Khairan</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/40 space-y-2 text-xs">
            <span className="font-bold text-foreground block">Rekening Resmi Pembayaran Yayasan:</span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="font-mono text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">
                Bank Syariah Indonesia (BSI): 7188-0099-26
              </div>
              <span className="text-xs text-muted-foreground">a.n. Darul Khidmah Sidogiri Bekasi</span>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              Konfirmasi bukti transfer dapat dikirimkan ke bendahara pesantren melalui kontak resmi yayasan.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Maklumat & Pengumuman */}
      {activeTab === "maklumat" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-5 sm:p-6 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20">Maklumat Pengasuh</span>
              <span>15 Oktober 2026</span>
            </div>
            <h4 className="font-bold text-foreground text-base sm:text-lg">
              Persiapan Imtihan Caturwulan I &amp; Pengajian Akbar Maulid Nabi SAW
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Diberitahukan kepada segenap wali santri bahwa Imtihan Caturwulan I akan dilaksanakan pada tanggal 12 s/d 19 November 2026. Seluruh wali santri diundang hadir dalam Pengajian Akbar dan Pembacaan Maulid Diba&apos; bersama Majelis Keluarga Pondok Pesantren Sidogiri.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400">
              <span className="px-2 py-0.5 rounded-full bg-teal-500/20">Informasi TPQ &amp; MI</span>
              <span>10 Oktober 2026</span>
            </div>
            <h4 className="font-bold text-foreground text-base sm:text-lg">
              Kajian Rutin Ahad Pagi Kitab Adabul Alim wal Muta&apos;allim
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Majelis taklim khusus wali santri diadakan setiap Ahad pekan ke-2 dan ke-4 setiap bulannya, bertempat di Masjid Jami&apos; Darul Khidmah Sidogiri Bekasi pukul 06.30 WIB.
            </p>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="pt-4 border-t border-border/40">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Layanan &amp; Modul Terkait
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/students"
            className="p-4 rounded-2xl liquid-glass border border-border/40 hover:border-emerald-500/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Users size={18} />
              </div>
              <div>
                <span className="font-bold text-xs text-foreground block group-hover:text-emerald-600 transition-colors">
                  Buku Induk Santri
                </span>
                <span className="text-[10px] text-muted-foreground">Lihat data pokok santri</span>
              </div>
            </div>
            <ChevronRight size={15} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/modules/media"
            className="p-4 rounded-2xl liquid-glass border border-border/40 hover:border-teal-500/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
                <Video size={18} />
              </div>
              <div>
                <span className="font-bold text-xs text-foreground block group-hover:text-teal-600 transition-colors">
                  Pusat Media &amp; Foto
                </span>
                <span className="text-[10px] text-muted-foreground">Dokumentasi kegiatan santri</span>
              </div>
            </div>
            <ChevronRight size={15} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/institutions/mi"
            className="p-4 rounded-2xl liquid-glass border border-border/40 hover:border-amber-500/40 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                <Building2 size={18} />
              </div>
              <div>
                <span className="font-bold text-xs text-foreground block group-hover:text-amber-600 transition-colors">
                  Profil MI Miftahul Ulum
                </span>
                <span className="text-[10px] text-muted-foreground">Kurikulum &amp; asatidz</span>
              </div>
            </div>
            <ChevronRight size={15} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Modal Pengajuan Izin Santri */}
      {izinModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIzinModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-md rounded-3xl liquid-glass-elevated border border-white/80 dark:border-white/15 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <FileText size={16} className="text-amber-600" />
                <span>Formulir Izin Santri</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIzinModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X size={16} />
              </button>
            </div>

            {izinSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-semibold text-center space-y-2">
                <CheckCircle2 size={24} className="mx-auto text-emerald-600" />
                <p>Permohonan izin berhasil diajukan kepada Musyrif Asrama dan Wali Kelas!</p>
              </div>
            ) : (
              <form onSubmit={handleKirimIzin} className="space-y-3 text-xs">
                {izinError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-rose-600" />
                    <span>{izinError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-foreground mb-1">Nama Santri</label>
                  <input 
                    type="text" 
                    disabled 
                    value={`${studentName} (${studentNis} - Kelas ${studentClass})`} 
                    className="w-full p-2.5 rounded-xl bg-muted/40 border border-border/40 text-foreground font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Keperluan Izin</label>
                  <select 
                    value={izinData.alasan}
                    onChange={(e) => setIzinData({ ...izinData, alasan: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground font-semibold cursor-pointer"
                  >
                    <option value="Keperluan Keluarga">Keperluan Keluarga / Acara Penting</option>
                    <option value="Sakit & Pengobatan">Sakit &amp; Rawat Jalan</option>
                    <option value="Tugas Belajar / Lomba">Tugas Belajar / Perlombaan</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Tanggal Mulai</label>
                    <input 
                      type="date" 
                      required
                      value={izinData.tanggalMulai}
                      onChange={(e) => setIzinData({ ...izinData, tanggalMulai: e.target.value })}
                      className="w-full p-2 rounded-xl liquid-glass-input text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Rencana Kembali</label>
                    <input 
                      type="date" 
                      required
                      value={izinData.tanggalSelesai}
                      onChange={(e) => setIzinData({ ...izinData, tanggalSelesai: e.target.value })}
                      className="w-full p-2 rounded-xl liquid-glass-input text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Keterangan Tambahan</label>
                  <textarea 
                    rows={2}
                    placeholder="Tuliskan catatan untuk musyrif..."
                    value={izinData.catatan}
                    onChange={(e) => setIzinData({ ...izinData, catatan: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIzinModalOpen(false)}
                    disabled={izinSubmitting}
                    className="px-4 py-2 rounded-xl liquid-glass-pill text-foreground font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={izinSubmitting}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {izinSubmitting ? "Mengirim..." : "Kirim Permohonan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
