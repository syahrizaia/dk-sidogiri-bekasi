"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  UserCheck, 
  BedDouble, 
  Sparkles, 
  BookOpen, 
  Compass, 
  Video, 
  Clock, 
  LogOut, 
  ArrowRight, 
  GraduationCap, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  HeartHandshake
} from "lucide-react";
import { getStudentsAction, SantriRecord } from "@/lib/actions/students";
import { getTeachersAction, TeacherRecord } from "@/lib/actions/teachers";
import { getDormitoriesAction, DormitoryRoom } from "@/lib/actions/dormitory";
import { getMediaAction, MediaItem } from "@/lib/actions/media";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ExecutivePortalViewProps {
  user: UserProfile;
  currentTime: string;
  onLogout: () => Promise<void>;
  loggingOut: boolean;
}

export function ExecutivePortalView({ user, currentTime, onLogout, loggingOut }: ExecutivePortalViewProps) {
  const [activeTab, setActiveTab] = useState<"ringkasan" | "unit" | "asrama" | "asatidz">("ringkasan");
  const [students, setStudents] = useState<SantriRecord[]>([]);
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [rooms, setRooms] = useState<DormitoryRoom[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setLoading(true);
        const [resStudents, resTeachers, resRooms, resMedia] = await Promise.all([
          getStudentsAction(),
          getTeachersAction(),
          getDormitoriesAction(),
          getMediaAction(true),
        ]);

        if (!ignore) {
          if (resStudents.success && Array.isArray(resStudents.data)) {
            setStudents(resStudents.data);
          }
          if (resTeachers.success && Array.isArray(resTeachers.data)) {
            setTeachers(resTeachers.data);
          }
          if (resRooms.success && Array.isArray(resRooms.data)) {
            setRooms(resRooms.data);
          }
          if (resMedia.success && Array.isArray(resMedia.data)) {
            setMediaList(resMedia.data);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data eksekutif:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  // Dynamic Metrics Computed from Live Database
  const totalSantri = students.length;
  const santriMukim = useMemo(() => students.filter((s) => s.status === "MUKIM").length, [students]);
  const santriNonMukim = totalSantri - santriMukim;
  const percentMukim = totalSantri > 0 ? Math.round((santriMukim / totalSantri) * 100) : 0;

  const totalTeachers = teachers.length;
  const activeTeachers = useMemo(() => teachers.filter((t) => t.status === "AKTIF").length, [teachers]);

  const totalDormCapacity = useMemo(() => rooms.reduce((acc, r) => acc + (r.capacity || 0), 0), [rooms]);
  const totalDormOccupied = useMemo(() => rooms.reduce((acc, r) => acc + (r.occupied || 0), 0), [rooms]);
  const dormOccupancyRate = totalDormCapacity > 0 ? Math.round((totalDormOccupied / totalDormCapacity) * 100) : 0;

  // Breakdown per Unit
  const countMI = useMemo(() => students.filter((s) => s.jenjang === "MI").length, [students]);
  const countMTs = useMemo(() => students.filter((s) => s.jenjang === "MTs").length, [students]);
  const countTPQ = useMemo(() => students.filter((s) => s.jenjang === "TPQ").length, [students]);

  const teachersMI = useMemo(() => teachers.filter((t) => t.institution === "MI").length, [teachers]);
  const teachersMTs = useMemo(() => teachers.filter((t) => t.institution === "MTs").length, [teachers]);
  const teachersTPQ = useMemo(() => teachers.filter((t) => t.institution === "TPQ").length, [teachers]);

  // Konsulat Breakdown
  const konsulatList = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of students) {
      const k = s.konsulat || "Lainnya";
      map[k] = (map[k] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [students]);

  return (
    <div className="relative min-h-screen py-8 sm:py-10 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Background Islamic Watermark Accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 flex items-center justify-center opacity-30 dark:opacity-20">
        <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-purple-500/10 via-emerald-500/10 to-teal-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Top Welcome Header for Ketua Ranting */}
      <div className="rounded-3xl liquid-glass-elevated p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-500/10 via-emerald-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30 text-xs font-bold">
              <Building2 size={14} />
              <span>Portal Eksekutif &amp; Manajerial Ketua Ranting</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Ahlan wa Sahlan, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Pusat monitoring manajerial pimpinan: tinjau perkembangan pendidikan seluruh unit (MI, MTs, TPQ), okupansi asrama, kualifikasi dewan asatidz, serta pertumbuhan santri Sidogiri Bekasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <div className="px-3.5 py-2 rounded-2xl liquid-glass-pill border border-white/50 text-xs font-semibold flex items-center gap-2 text-foreground/80">
              <Clock size={14} className="text-purple-600 dark:text-purple-400" />
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

      {/* 4 Macro KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl liquid-glass-elevated p-4 sm:p-5 border border-white/50 dark:border-white/10 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Seluruh Santri</span>
            <Users size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {loading ? "..." : totalSantri}
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{santriMukim} Mukim</span> • {santriNonMukim} Non-Mukim ({percentMukim}%)
          </p>
        </div>

        <div className="rounded-2xl liquid-glass-elevated p-4 sm:p-5 border border-white/50 dark:border-white/10 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Dewan Asatidz</span>
            <UserCheck size={18} className="text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-700 dark:text-teal-400">
            {loading ? "..." : totalTeachers}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {activeTeachers} Pengajar Aktif di Seluruh Unit
          </p>
        </div>

        <div className="rounded-2xl liquid-glass-elevated p-4 sm:p-5 border border-white/50 dark:border-white/10 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Kapasitas Asrama</span>
            <BedDouble size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-400">
            {loading ? "..." : `${dormOccupancyRate}%`}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {totalDormOccupied} / {totalDormCapacity} Tempat Tidur Terisi
          </p>
        </div>

        <div className="rounded-2xl liquid-glass-elevated p-4 sm:p-5 border border-white/50 dark:border-white/10 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Arsip Media &amp; Syiar</span>
            <Video size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-700 dark:text-indigo-400">
            {loading ? "..." : mediaList.length}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Foto &amp; Video Liputan Dakwah Terverifikasi
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Grid for Ketua Ranting */}
      <div className="rounded-3xl liquid-glass p-6 sm:p-8 border border-white/60 dark:border-white/10 space-y-4">
        <h2 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
          <Sparkles size={18} className="text-purple-600" />
          <span>Akses Cepat Pengawasan &amp; Manajemen Unit</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/modules/mi"
            className="group p-4 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 border border-white/40 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  Madrasah Ibtidaiyah (MI)
                </h3>
                <p className="text-[11px] text-muted-foreground">{countMI} Santri • {teachersMI} Asatidz</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/modules/mts"
            className="group p-4 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 border border-white/40 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                  Madrasah Tsanawiyah (MTs)
                </h3>
                <p className="text-[11px] text-muted-foreground">{countMTs} Santri • {teachersMTs} Asatidz</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/modules/tpq"
            className="group p-4 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 border border-white/40 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
                <Compass size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  TPQ Al-Qur&apos;an Sidogiri
                </h3>
                <p className="text-[11px] text-muted-foreground">{countTPQ} Santri • {teachersTPQ} Asatidz</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/modules/dormitory"
            className="group p-4 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 border border-white/40 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300">
                <BedDouble size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                  Manajemen Asrama Santri
                </h3>
                <p className="text-[11px] text-muted-foreground">{rooms.length} Kamar • {totalDormOccupied} Penghuni</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/data-science"
            className="group p-4 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 border border-white/40 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                  Data Science &amp; Prediktif AI
                </h3>
                <p className="text-[11px] text-muted-foreground">Analisis Retensi &amp; Performa Belajar</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/modules/media"
            className="group p-4 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 border border-white/40 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300">
                <Video size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors">
                  Pusat Media &amp; Dokumentasi
                </h3>
                <p className="text-[11px] text-muted-foreground">Galeri Kegiatan &amp; Dakwah Ranting</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab("ringkasan")}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "ringkasan"
              ? "bg-gradient-to-r from-purple-800 to-indigo-700 text-white shadow-md shadow-purple-950/20"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          📊 Ringkasan Manajerial
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("unit")}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "unit"
              ? "bg-gradient-to-r from-purple-800 to-indigo-700 text-white shadow-md shadow-purple-950/20"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          🏫 Unit Pendidikan (MI/MTs/TPQ)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("asrama")}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "asrama"
              ? "bg-gradient-to-r from-purple-800 to-indigo-700 text-white shadow-md shadow-purple-950/20"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          🛏️ Pemantauan Asrama
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("asatidz")}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "asatidz"
              ? "bg-gradient-to-r from-purple-800 to-indigo-700 text-white shadow-md shadow-purple-950/20"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          👳‍♂️ Direktori Dewan Asatidz
        </button>
      </div>

      {/* Tab 1: Ringkasan Manajerial */}
      {activeTab === "ringkasan" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {/* Distribusi Jenjang */}
          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4">
            <h3 className="text-sm font-extrabold text-foreground flex items-center justify-between">
              <span>Distribusi Siswa per Jenjang Pendidikan</span>
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">Total: {totalSantri} Santri</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Madrasah Ibtidaiyah (MI)</span>
                  <span className="font-mono">{countMI} Santri ({totalSantri > 0 ? Math.round((countMI / totalSantri) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${totalSantri > 0 ? (countMI / totalSantri) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Madrasah Tsanawiyah (MTs)</span>
                  <span className="font-mono">{countMTs} Santri ({totalSantri > 0 ? Math.round((countMTs / totalSantri) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${totalSantri > 0 ? (countMTs / totalSantri) * 100 : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>TPQ Al-Qur&apos;an Sidogiri</span>
                  <span className="font-mono">{countTPQ} Santri ({totalSantri > 0 ? Math.round((countTPQ / totalSantri) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalSantri > 0 ? (countTPQ / totalSantri) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/30 flex justify-between text-[11px] text-muted-foreground">
              <span>Status Mukim: <strong>{santriMukim} Santri</strong></span>
              <span>Status Non-Mukim: <strong>{santriNonMukim} Santri</strong></span>
            </div>
          </div>

          {/* Konsulat Asal Santri */}
          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4">
            <h3 className="text-sm font-extrabold text-foreground flex items-center justify-between">
              <span>Demografi Wilayah / Konsulat Santri</span>
              <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400">{konsulatList.length} Konsulat</span>
            </h3>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {konsulatList.map(([konsulat, count]) => (
                <div key={konsulat} className="flex items-center justify-between p-2 rounded-xl liquid-glass-pill text-xs">
                  <span className="font-semibold text-foreground">{konsulat}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-muted/40 overflow-hidden hidden sm:block">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(count / totalSantri) * 100}%` }} />
                    </div>
                    <span className="font-mono font-bold text-purple-800 dark:text-purple-300">{count} Santri</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Unit Pendidikan */}
      {activeTab === "unit" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Card MI */}
          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 w-fit">
                <BookOpen size={24} />
              </div>
              <h3 className="text-base font-extrabold text-foreground">Madrasah Ibtidaiyah (MI)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pendidikan dasar khas Sidogiri mengintegrasikan kurikulum kitab kuning salaf (Fathul Qorib, Fasholatan, Jurumiyah) dan kurikulum formal terpadu.
              </p>
              <div className="pt-2 space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">Kepala Madrasah</span>
                  <span className="font-semibold text-foreground">Ust. M. Sholeh Al-Bantani</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">Peserta Didik Aktif</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">{countMI} Santri</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Dewan Pengampu</span>
                  <span className="font-bold text-foreground font-mono">{teachersMI} Asatidz</span>
                </div>
              </div>
            </div>
            <Link
              href="/modules/mi"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold text-center transition-colors shadow-md block mt-4"
            >
              Buka Manajemen MI &rarr;
            </Link>
          </div>

          {/* Card MTs */}
          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-teal-500/15 text-teal-800 dark:text-teal-300 w-fit">
                <Building2 size={24} />
              </div>
              <h3 className="text-base font-extrabold text-foreground">Madrasah Tsanawiyah (MTs)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Jenjang lanjutan menengah pertama salafiyah dengan fokus pendalaman kajian kitab gundul, gramatika Nahwu-Shorof tingkat lanjut, dan musyawarah fiqih.
              </p>
              <div className="pt-2 space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">Koordinator Unit</span>
                  <span className="font-semibold text-foreground">Ust. Abdullah Faqih, M.Ag</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">Santri Persiapan</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400 font-mono">{countMTs} Santri</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Dewan Pengampu</span>
                  <span className="font-bold text-foreground font-mono">{teachersMTs} Asatidz</span>
                </div>
              </div>
            </div>
            <Link
              href="/modules/mts"
              className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold text-center transition-colors shadow-md block mt-4"
            >
              Buka Manajemen MTs &rarr;
            </Link>
          </div>

          {/* Card TPQ */}
          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-300 w-fit">
                <Compass size={24} />
              </div>
              <h3 className="text-base font-extrabold text-foreground">TPQ Al-Qur&apos;an Sidogiri</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pendidikan Al-Qur&apos;an 6 jilid dengan sanad metode Tartil Sidogiri Pasuruan, membina makharijul huruf fasih, tajwid praktis, dan fasholatan santri.
              </p>
              <div className="pt-2 space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">Koordinator Tartil</span>
                  <span className="font-semibold text-foreground">Ust. Ahmad Zaini Al-Hafizh</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/20">
                  <span className="text-muted-foreground">Murid Terdaftar</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">{countTPQ} Santri</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Dewan Pengajar</span>
                  <span className="font-bold text-foreground font-mono">{teachersTPQ} Asatidz</span>
                </div>
              </div>
            </div>
            <Link
              href="/modules/tpq"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold text-center transition-colors shadow-md block mt-4"
            >
              Buka Manajemen TPQ &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Tab 3: Pemantauan Asrama */}
      {activeTab === "asrama" && (
        <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground">Kapasitas &amp; Alokasi Kamar Asrama</h3>
              <p className="text-xs text-muted-foreground">Monitoring hunian santri mukim di Asrama Sayyid Sulaiman &amp; Kiai Aminullah.</p>
            </div>
            <Link
              href="/modules/dormitory"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold shadow-md w-fit cursor-pointer"
            >
              <span>Kelola Detail Asrama</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const occRate = room.capacity > 0 ? Math.round((room.occupied / room.capacity) * 100) : 0;
              return (
                <div key={room._id} className="p-4 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-lg">
                      {room.roomNumber}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground">
                      Lantai {room.floor}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{room.roomName}</h4>
                    <p className="text-[11px] text-muted-foreground">{room.complex}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span>Hunian: {room.occupied} / {room.capacity}</span>
                      <span className="font-mono font-bold text-purple-800 dark:text-purple-300">{occRate}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${occRate >= 100 ? "bg-rose-500" : "bg-purple-600"}`}
                        style={{ width: `${Math.min(occRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Dewan Asatidz */}
      {activeTab === "asatidz" && (
        <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground">Direktori Dewan Asatidz Ranting</h3>
              <p className="text-xs text-muted-foreground">Daftar asatidz pembina, spesialisasi kitab kuning, dan penugasan lembaga.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-xs text-left">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-white/10 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">NIP &amp; Nama Asatidz</th>
                  <th className="py-3 px-4">Tugas &amp; Jabatan</th>
                  <th className="py-3 px-4">Unit Penugasan</th>
                  <th className="py-3 px-4">Spesialisasi Kitab</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {teachers.map((t) => (
                  <tr key={t.nip} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground">{t.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{t.nip}</div>
                    </td>
                    <td className="py-3 px-4 text-foreground/90 font-medium">{t.role}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        t.institution === "MI"
                          ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                          : t.institution === "MTs"
                          ? "bg-teal-500/15 text-teal-800 dark:text-teal-300"
                          : "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                      }`}>
                        {t.institution}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{t.specialization}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 size={12} />
                        <span>{t.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
