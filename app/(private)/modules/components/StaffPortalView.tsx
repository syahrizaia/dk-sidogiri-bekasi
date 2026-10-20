"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Users, 
  UserCheck, 
  HeartHandshake, 
  BedDouble, 
  BookOpen, 
  Building2, 
  Compass, 
  Video, 
  Clock, 
  LogOut, 
  ArrowRight, 
  Plus, 
  Search, 
  Pencil, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  Phone,
  Eye,
  ChevronRight,
  ShieldCheck,
  FileText,
  ClipboardList
} from "lucide-react";
import { getStudentsAction, SantriRecord } from "@/lib/actions/students";
import { getTeachersAction, TeacherRecord } from "@/lib/actions/teachers";
import { getParentsAction, ParentRecord } from "@/lib/actions/parents";
import { getDormitoriesAction, DormitoryRoom } from "@/lib/actions/dormitory";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface StaffPortalViewProps {
  user: UserProfile;
  currentTime: string;
  onLogout: () => Promise<void>;
  loggingOut: boolean;
}

export function StaffPortalView({ user, currentTime, onLogout, loggingOut }: StaffPortalViewProps) {
  const [activeTab, setActiveTab] = useState<"santri" | "asrama" | "wali" | "unit">("santri");
  const [students, setStudents] = useState<SantriRecord[]>([]);
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [parents, setParents] = useState<ParentRecord[]>([]);
  const [rooms, setRooms] = useState<DormitoryRoom[]>([]);
  const [searchSantri, setSearchSantri] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setLoading(true);
        const [resStudents, resTeachers, resParents, resRooms] = await Promise.all([
          getStudentsAction(),
          getTeachersAction(),
          getParentsAction(),
          getDormitoriesAction(),
        ]);

        if (!ignore) {
          if (resStudents.success && Array.isArray(resStudents.data)) {
            setStudents(resStudents.data);
          }
          if (resTeachers.success && Array.isArray(resTeachers.data)) {
            setTeachers(resTeachers.data);
          }
          if (resParents.success && Array.isArray(resParents.data)) {
            setParents(resParents.data);
          }
          if (resRooms.success && Array.isArray(resRooms.data)) {
            setRooms(resRooms.data);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data staf tata usaha:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  const totalSantri = students.length;
  const santriMukim = useMemo(() => students.filter((s) => s.status === "MUKIM").length, [students]);
  const santriNonMukim = totalSantri - santriMukim;

  const totalParents = parents.length;
  const totalTeachers = teachers.length;

  const totalDormCapacity = useMemo(() => rooms.reduce((acc, r) => acc + (r.capacity || 0), 0), [rooms]);
  const totalDormOccupied = useMemo(() => rooms.reduce((acc, r) => acc + (r.occupied || 0), 0), [rooms]);

  const filteredStudents = useMemo(() => {
    if (!searchSantri.trim()) return students;
    const q = searchSantri.toLowerCase();
    return students.filter(
      (s) =>
        s.nama.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        s.kelas.toLowerCase().includes(q) ||
        s.kamar.toLowerCase().includes(q) ||
        s.wali.toLowerCase().includes(q)
    );
  }, [students, searchSantri]);

  return (
    <div className="relative min-h-screen py-8 sm:py-10 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Background Accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 flex items-center justify-center opacity-30 dark:opacity-20">
        <div className="w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-amber-500/10 via-emerald-500/10 to-teal-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Top Welcome Header for Staf Administrasi */}
      <div className="rounded-3xl liquid-glass-elevated p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-emerald-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold">
              <Layers size={14} />
              <span>Portal Operasional Tata Usaha &amp; Administrasi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex flex-wrap items-baseline gap-2.5">
              <span className="font-serif font-bold text-amber-800 dark:text-amber-300 text-3xl sm:text-4xl leading-none">
                أَهْلاً وَسَهْلاً،
              </span>
              <span>{user.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Pusat pelayanan tata usaha pesantren: kelola buku induk santri, data wali santri, penugasan kamar asrama, dan administrasi unit pendidikan (MI, MTs, TPQ) Sidogiri Bekasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <div className="px-3.5 py-2 rounded-2xl liquid-glass-pill border border-white/50 text-xs font-semibold flex items-center gap-2 text-foreground/80">
              <Clock size={14} className="text-amber-600 dark:text-amber-400" />
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

      {/* 4 Operational KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl liquid-glass-elevated p-4 sm:p-5 border border-white/50 dark:border-white/10 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Buku Induk Santri</span>
            <Users size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
            {loading ? "..." : totalSantri}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {santriMukim} Mukim • {santriNonMukim} Non-Mukim
          </p>
        </div>

        <div className="rounded-2xl liquid-glass-elevated p-4 sm:p-5 border border-white/50 dark:border-white/10 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Wali Santri Terdata</span>
            <HeartHandshake size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-700 dark:text-indigo-400">
            {loading ? "..." : totalParents}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Tersinkronisasi Data Kontak &amp; Keluarga
          </p>
        </div>

        <div className="rounded-2xl liquid-glass-elevated p-4 sm:p-5 border border-white/50 dark:border-white/10 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Hunian Asrama</span>
            <BedDouble size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-400">
            {loading ? "..." : `${totalDormOccupied} / ${totalDormCapacity}`}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {rooms.length} Kamar Aktif Terkelola
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
            Guru Pengampu &amp; Pembina Asrama
          </p>
        </div>
      </div>

      {/* Quick Operational Shortcuts */}
      <div className="rounded-3xl liquid-glass p-6 sm:p-8 border border-white/60 dark:border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
            <Sparkles size={18} className="text-amber-600" />
            <span>Akses Cepat Tata Usaha &amp; Administrasi</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/students"
            className="p-4 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 border border-white/40 flex items-center gap-3 transition-all"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Buku Induk Santri</h3>
              <p className="text-[11px] text-muted-foreground">Kelola NIS &amp; Data Pokok</p>
            </div>
          </Link>

          <Link
            href="/parents"
            className="p-4 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 border border-white/40 flex items-center gap-3 transition-all"
          >
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">
              <HeartHandshake size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Wali Santri</h3>
              <p className="text-[11px] text-muted-foreground">Kontak Darurat &amp; Alamat</p>
            </div>
          </Link>

          <Link
            href="/teachers"
            className="p-4 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 border border-white/40 flex items-center gap-3 transition-all"
          >
            <div className="p-2.5 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300">
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Dewan Asatidz</h3>
              <p className="text-[11px] text-muted-foreground">Direktori Guru &amp; NIP</p>
            </div>
          </Link>

          <Link
            href="/modules/dormitory"
            className="p-4 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 border border-white/40 flex items-center gap-3 transition-all"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-300">
              <BedDouble size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Manajemen Asrama</h3>
              <p className="text-[11px] text-muted-foreground">Alokasi Kamar Santri</p>
            </div>
          </Link>

          <Link
            href="/modules/mi"
            className="p-4 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 border border-white/40 flex items-center gap-3 transition-all"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Unit Madrasah MI</h3>
              <p className="text-[11px] text-muted-foreground">Santri &amp; Jadwal MI</p>
            </div>
          </Link>

          <Link
            href="/modules/mts"
            className="p-4 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 border border-white/40 flex items-center gap-3 transition-all"
          >
            <div className="p-2.5 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Unit Madrasah MTs</h3>
              <p className="text-[11px] text-muted-foreground">Persiapan Siswa MTs</p>
            </div>
          </Link>

          <Link
            href="/modules/tpq"
            className="p-4 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 border border-white/40 flex items-center gap-3 transition-all"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
              <Compass size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Unit TPQ Sidogiri</h3>
              <p className="text-[11px] text-muted-foreground">Tartil &amp; Jilid Al-Qur&apos;an</p>
            </div>
          </Link>

          <Link
            href="/modules/media"
            className="p-4 rounded-2xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 border border-white/40 flex items-center gap-3 transition-all"
          >
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300">
              <Video size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Pusat Dokumentasi</h3>
              <p className="text-[11px] text-muted-foreground">Arsip Foto &amp; Kegiatan</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab("santri")}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "santri"
              ? "bg-gradient-to-r from-amber-700 to-emerald-700 text-white shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <ClipboardList size={14} />
            <span>Santri Terbaru</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("asrama")}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "asrama"
              ? "bg-gradient-to-r from-amber-700 to-emerald-700 text-white shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <BedDouble size={14} />
            <span>Status Asrama</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("wali")}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "wali"
              ? "bg-gradient-to-r from-amber-700 to-emerald-700 text-white shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <Users size={14} />
            <span>Data Wali Santri</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("unit")}
          className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
            activeTab === "unit"
              ? "bg-gradient-to-r from-amber-700 to-emerald-700 text-white shadow-md"
              : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1.5">
            <Building2 size={14} />
            <span>Manajemen Unit</span>
          </span>
        </button>
      </div>

      {/* Tab 1: Santri Terbaru */}
      {activeTab === "santri" && (
        <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground">Data Pokok Santri Terdaftar</h3>
              <p className="text-xs text-muted-foreground">Pangkalan data induk seluruh peserta didik aktif di Sidogiri Bekasi.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari santri, NIS, kelas..."
                  value={searchSantri}
                  onChange={(e) => setSearchSantri(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl liquid-glass-input text-xs text-foreground focus:outline-none w-56"
                />
              </div>

              <Link
                href="/students"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md cursor-pointer whitespace-nowrap"
              >
                <span>Buku Induk Lengkap</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-xs text-left">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-white/10 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">NIS &amp; Nama Santri</th>
                  <th className="py-3 px-4">Jenjang &amp; Kelas</th>
                  <th className="py-3 px-4">Status &amp; Asrama</th>
                  <th className="py-3 px-4">Wali Santri</th>
                  <th className="py-3 px-4">Konsulat</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredStudents.slice(0, 10).map((s) => (
                  <tr key={s.nis} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground">{s.nama}</div>
                      <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">{s.nis}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-foreground/90">{s.jenjang}</span>
                      <div className="text-[11px] text-muted-foreground">{s.kelas}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        s.status === "MUKIM"
                          ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                          : "bg-muted/40 text-muted-foreground"
                      }`}>
                        {s.status}
                      </span>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{s.kamar}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{s.wali || "-"}</div>
                      <div className="text-[10px] text-muted-foreground">{s.noHp || "-"}</div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{s.konsulat}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href="/students"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg liquid-glass border border-white/30 text-foreground hover:text-emerald-600 transition-colors text-[11px] font-semibold"
                      >
                        <Pencil size={11} />
                        <span>Detail</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Status Asrama */}
      {activeTab === "asrama" && (
        <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground">Pemetaan Kamar &amp; Alokasi Asrama</h3>
              <p className="text-xs text-muted-foreground">Kelola kapasitas tempat tidur dan santri mukim.</p>
            </div>
            <Link
              href="/modules/dormitory"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold shadow-md w-fit cursor-pointer"
            >
              <span>Buka Modul Asrama</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const occRate = room.capacity > 0 ? Math.round((room.occupied / room.capacity) * 100) : 0;
              return (
                <div key={room._id} className="p-4 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                      {room.roomNumber}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Lantai {room.floor}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{room.roomName}</h4>
                    <p className="text-[10px] text-muted-foreground">{room.complex}</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span>Terisi: {room.occupied} / {room.capacity}</span>
                      <span className="font-bold">{occRate}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${Math.min(occRate, 100)}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Data Wali Santri */}
      {activeTab === "wali" && (
        <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-foreground">Direktori Kontak Wali Santri</h3>
              <p className="text-xs text-muted-foreground">Rekapitulasi kontak orang tua untuk keperluan koordinasi kepesantrenan.</p>
            </div>
            <Link
              href="/parents"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold shadow-md w-fit cursor-pointer"
            >
              <span>Kelola Data Wali</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-xs text-left">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-white/10 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Nama Wali</th>
                  <th className="py-3 px-4">Hubungan</th>
                  <th className="py-3 px-4">Santri Asuhan</th>
                  <th className="py-3 px-4">No. WhatsApp / Telp</th>
                  <th className="py-3 px-4">Domisili</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {parents.slice(0, 10).map((p) => (
                  <tr key={p.id || p.phone} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">{p.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted/40 text-foreground">
                        {p.relation}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-700 dark:text-emerald-400">{p.studentName}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{p.studentNis} ({p.studentInstitution})</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">{p.phone}</td>
                    <td className="py-3 px-4 text-muted-foreground">{p.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Unit Pendidikan */}
      {activeTab === "unit" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 w-fit">
                <BookOpen size={24} />
              </div>
              <h3 className="text-base font-extrabold text-foreground">Madrasah Ibtidaiyah (MI)</h3>
              <p className="text-xs text-muted-foreground">Pendidikan dasar salafiyah dengan penguatan gramatika dasar dan ibadah praktis.</p>
            </div>
            <Link
              href="/modules/mi"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold text-center transition-colors shadow-md block"
            >
              Buka Unit MI &rarr;
            </Link>
          </div>

          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-teal-500/15 text-teal-800 dark:text-teal-300 w-fit">
                <Building2 size={24} />
              </div>
              <h3 className="text-base font-extrabold text-foreground">Madrasah Tsanawiyah (MTs)</h3>
              <p className="text-xs text-muted-foreground">Jenjang menengah pertama dengan pendalaman kajian kitab kuning gundul.</p>
            </div>
            <Link
              href="/modules/mts"
              className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold text-center transition-colors shadow-md block"
            >
              Buka Unit MTs &rarr;
            </Link>
          </div>

          <div className="rounded-3xl liquid-glass-elevated p-6 border border-white/60 dark:border-white/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-300 w-fit">
                <Compass size={24} />
              </div>
              <h3 className="text-base font-extrabold text-foreground">TPQ Al-Qur&apos;an Sidogiri</h3>
              <p className="text-xs text-muted-foreground">Metode Tartil 6 jilid Sidogiri Pasuruan, mencetak generasi mutqin.</p>
            </div>
            <Link
              href="/modules/tpq"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold text-center transition-colors shadow-md block"
            >
              Buka Unit TPQ &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
