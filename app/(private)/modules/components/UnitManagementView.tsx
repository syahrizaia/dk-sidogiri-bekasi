"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Building2, 
  Compass, 
  Users, 
  UserCheck, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Search, 
  ChevronRight, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Award,
  ExternalLink,
  Filter,
  GraduationCap,
  HeartHandshake
} from "lucide-react";
import { 
  getUnitBySlugAction, 
  getUnitStudentsAction, 
  getUnitTeachersAction, 
  UnitRecord, 
  UnitCurriculumItem, 
  UnitScheduleItem 
} from "@/lib/actions/units";
import { SantriRecord } from "@/lib/actions/students";
import { TeacherRecord } from "@/lib/actions/teachers";
import { getUserPermissionsAction, type UserPermissionsResult } from "@/lib/actions/roles";
import { CurriculumManagementTab } from "./CurriculumManagementTab";
import { ScheduleManagementTab } from "./ScheduleManagementTab";

interface UnitManagementViewProps {
  slug: "mi" | "mts" | "tpq";
}

export function UnitManagementView({ slug }: UnitManagementViewProps) {
  const [unit, setUnit] = useState<UnitRecord | null>(null);
  const [students, setStudents] = useState<SantriRecord[]>([]);
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermissionsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"students" | "teachers" | "curriculum" | "schedules">("students");
  
  // Search & Filters for Santri tab
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState<"ALL" | "MUKIM" | "NON-MUKIM">("ALL");

  // Search & Filters for Teachers tab
  const [teacherSearch, setTeacherSearch] = useState("");

  const canCreate = Boolean(
    userPermissions?.isSuperAdmin ||
    userPermissions?.crudPermissions?.[slug]?.create
  );
  const canUpdate = Boolean(
    userPermissions?.isSuperAdmin ||
    userPermissions?.crudPermissions?.[slug]?.update
  );
  const canDelete = Boolean(
    userPermissions?.isSuperAdmin ||
    userPermissions?.crudPermissions?.[slug]?.delete
  );

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    Promise.all([
      getUnitBySlugAction(slug),
      getUnitStudentsAction(slug),
      getUnitTeachersAction(slug),
      getUserPermissionsAction(),
    ])
      .then(([unitRes, studentsRes, teachersRes, permRes]) => {
        if (ignore) return;
        if (unitRes.success && unitRes.data) {
          setUnit(unitRes.data);
        }
        if (studentsRes.success && studentsRes.data) {
          setStudents(studentsRes.data);
        }
        if (teachersRes.success && teachersRes.data) {
          setTeachers(teachersRes.data);
        }
        if (permRes?.success && permRes?.data) {
          setUserPermissions(permRes.data);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat data unit:", err);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [slug]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.nama.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.nis.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.konsulat.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (s.kamar && s.kamar.toLowerCase().includes(studentSearch.toLowerCase())) ||
        (s.wali && s.wali.toLowerCase().includes(studentSearch.toLowerCase()));

      if (studentStatusFilter === "ALL") return matchSearch;
      return matchSearch && s.status === studentStatusFilter;
    });
  }, [students, studentSearch, studentStatusFilter]);

  // Filtered Teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      return (
        t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.nip.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.specialization.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.role.toLowerCase().includes(teacherSearch.toLowerCase())
      );
    });
  }, [teachers, teacherSearch]);

  const getUnitIcon = () => {
    switch (slug) {
      case "mi":
        return BookOpen;
      case "mts":
        return Building2;
      case "tpq":
        return Compass;
      default:
        return GraduationCap;
    }
  };

  const UnitIcon = getUnitIcon();

  if (loading) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 animate-spin mb-4">
          <UnitIcon className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-muted-foreground animate-pulse font-mono">
          Sinkronisasi Data Unit {slug.toUpperCase()} dari MongoDB Atlas...
        </p>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-4xl mx-auto text-center">
        <div className="p-8 rounded-3xl liquid-glass border border-red-500/30 shadow-xl">
          <h2 className="text-xl font-bold text-red-600 mb-2">Unit Pendidikan Tidak Ditemukan</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Data unit &apos;{slug}&apos; belum tersimpan pada database MongoDB Atlas.
          </p>
          <Link
            href="/modules"
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all"
          >
            Kembali ke Modul Sistem
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Background Islamic Watermark Accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 flex items-center justify-center opacity-30 dark:opacity-20">
        <div className="w-[850px] h-[850px] rounded-full bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-amber-500/5 blur-3xl" />
      </div>

      {/* Top Breadcrumb & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full max-w-full">
        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0 truncate">
          <Link href="/modules" className="hover:text-emerald-600 transition-colors shrink-0">
            Modul Sistem
          </Link>
          <ChevronRight size={13} className="shrink-0" />
          <span className="shrink-0">Unit Pendidikan</span>
          <ChevronRight size={13} className="shrink-0" />
          <span className="font-semibold text-foreground uppercase truncate">{unit.slug}</span>
        </div>

        {/* Quick Unit Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs w-full sm:w-auto overflow-x-auto max-w-full">
          <Link
            href="/modules/mi"
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 text-center ${
              slug === "mi"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-white/5"
            }`}
          >
            MI Miftahul Ulum
          </Link>
          <Link
            href="/modules/mts"
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 text-center ${
              slug === "mts"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/30 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-white/5"
            }`}
          >
            MTs Miftahul Ulum
          </Link>
          <Link
            href="/modules/tpq"
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 text-center ${
              slug === "tpq"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-white/30 dark:hover:bg-white/5"
            }`}
          >
            TPQ Tartil Sidogiri
          </Link>
        </div>
      </div>

      {/* Header Banner - Apple Liquid Glass Style */}
      <div className="rounded-3xl liquid-glass-elevated p-5 sm:p-8 border border-white/60 dark:border-white/10 shadow-2xl relative overflow-hidden w-full max-w-full">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 min-w-0">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 min-w-0">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 p-0.5 shadow-xl flex-shrink-0">
              <div className="w-full h-full rounded-[14px] bg-card flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <UnitIcon className="w-7 h-7 sm:w-10 sm:h-10 stroke-[1.8]" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-serif">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </span>
                <span className="opacity-40">•</span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {unit.jenjang}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5 truncate">
                <span>{unit.name}</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl line-clamp-2 break-words">
                {unit.tagline}
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 self-stretch lg:self-center w-full lg:w-auto">
            <div className="p-3 sm:p-3.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-center min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block truncate">
                Status Operasional
              </span>
              <span className="inline-flex items-center justify-center gap-1 mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 truncate">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>{unit.status === "AKTIF" ? "Beroperasi Aktif" : "Persiapan Buka"}</span>
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-center min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block truncate">
                Santri Aktif
              </span>
              <span className="text-base sm:text-lg font-black text-foreground">
                {students.length} <span className="text-xs font-semibold text-muted-foreground">Santri</span>
              </span>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-center col-span-2 sm:col-span-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block truncate">
                Dewan Asatidz
              </span>
              <span className="text-base sm:text-lg font-black text-teal-700 dark:text-teal-300">
                {teachers.length} <span className="text-xs font-semibold text-muted-foreground">Ustadz</span>
              </span>
            </div>
          </div>
        </div>

        {/* Headmaster & Institutional Meta Bar */}
        <div className="mt-6 pt-5 border-t border-white/40 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 text-xs w-full min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold shrink-0">
              <GraduationCap size={16} />
            </div>
            <div className="min-w-0 flex-1 truncate">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block truncate">
                {unit.headmaster.title}
              </span>
              <span className="font-semibold text-foreground truncate block">{unit.headmaster.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 font-bold shrink-0">
              <Award size={16} />
            </div>
            <div className="min-w-0 flex-1 truncate">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block truncate">
                Standarisasi Mutu
              </span>
              <span className="font-semibold text-foreground truncate block">
                {unit.accreditation || "Standar Pondok Pesantren Sidogiri"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold shrink-0">
              <Phone size={16} />
            </div>
            <div className="min-w-0 flex-1 truncate">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block truncate">
                Layanan Informasi & Kontak
              </span>
              <span className="font-semibold text-foreground font-mono truncate block">{unit.headmaster.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border/50 pb-3 overflow-x-auto max-w-full scrollbar-none py-1">
        <button
          type="button"
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "students"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
          }`}
        >
          <Users size={16} className="shrink-0" />
          <span>Buku Induk Santri</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono shrink-0">
            {students.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("teachers")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "teachers"
              ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30"
              : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
          }`}
        >
          <UserCheck size={16} className="shrink-0" />
          <span>Dewan Asatidz</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono shrink-0">
            {teachers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("curriculum")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "curriculum"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
          }`}
        >
          <BookOpen size={16} className="shrink-0" />
          <span>Kurikulum & Kitab Kuning</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schedules")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "schedules"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
              : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
          }`}
        >
          <Calendar size={16} className="shrink-0" />
          <span>Jadwal Ta&apos;lim & KBM</span>
        </button>
      </div>

      {/* TAB 1: BUKU INDUK SANTRI */}
      {activeTab === "students" && (
        <div className="space-y-4 w-full max-w-full">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full max-w-full">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Cari nama santri, NIS, kamar, atau wali..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto overflow-x-auto max-w-full pb-1 sm:pb-0">
              <div className="flex items-center gap-1 p-1 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setStudentStatusFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                    studentStatusFilter === "ALL"
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Semua ({students.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentStatusFilter("MUKIM")}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                    studentStatusFilter === "MUKIM"
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Mukim ({students.filter((s) => s.status === "MUKIM").length})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentStatusFilter("NON-MUKIM")}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                    studentStatusFilter === "NON-MUKIM"
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Non-Mukim ({students.filter((s) => s.status === "NON-MUKIM").length})
                </button>
              </div>

              <Link
                href="/students"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl liquid-glass text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/10 transition-all shrink-0"
              >
                <span>Master Santri</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-xl overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto w-full max-w-full">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-border/40 bg-white/20 dark:bg-white/5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3.5 px-4">NIS</th>
                    <th className="py-3.5 px-4">Nama Lengkap</th>
                    <th className="py-3.5 px-4">Kelas</th>
                    <th className="py-3.5 px-4">Konsulat</th>
                    <th className="py-3.5 px-4">Status & Asrama</th>
                    <th className="py-3.5 px-4">Wali Santri</th>
                    <th className="py-3.5 px-4 text-right">No. WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                        <p className="font-semibold">Tidak ada santri yang sesuai kriteria pencarian.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((santri) => (
                      <tr key={santri.nis} className="hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {santri.nis}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-foreground block">{santri.nama}</span>
                          <span className="text-[10px] text-muted-foreground">{santri.jenjang} Sidogiri</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {santri.kelas}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                            <MapPin size={11} className="text-emerald-600" />
                            {santri.konsulat}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              santri.status === "MUKIM"
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                                : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {santri.status}
                          </span>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">
                            {santri.kamar || "Non-Asrama"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-foreground block">{santri.wali}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {santri.parentRelation || "Wali"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[11px] text-muted-foreground">
                          {santri.noHp}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEWAN ASATIDZ */}
      {activeTab === "teachers" && (
        <div className="space-y-4 w-full max-w-full">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full max-w-full">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Cari dewan asatidz, NIP, spesialisasi..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>

            <Link
              href="/teachers"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl liquid-glass text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-500/30 hover:bg-teal-500/10 transition-all shrink-0 self-start sm:self-center"
            >
              <span>Direktori Asatidz</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          {/* Teachers Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-full">
            {filteredTeachers.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground rounded-3xl liquid-glass border border-white/60 dark:border-white/10 col-span-full">
                <UserCheck className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="font-bold text-sm text-foreground">Tidak ada asatidz yang sesuai pencarian</p>
                <p className="text-xs text-muted-foreground mt-1">Coba sesuaikan kata kunci nama, NIP, atau keahlian.</p>
              </div>
            ) : (
              filteredTeachers.map((teacher) => {
                const currentUnitCode: "MI" | "MTs" | "TPQ" = slug === "mi" ? "MI" : slug === "mts" ? "MTs" : "TPQ";
                const assignedUnits = (teacher.institutions && teacher.institutions.length > 0)
                  ? teacher.institutions
                  : [teacher.institution];

                const unitHomeroom = (teacher.homeroomAssignments || []).find((h) => h.unit === currentUnitCode);
                const otherHomerooms = (teacher.homeroomAssignments || []).filter((h) => h.unit !== currentUnitCode);
                const unitTeachings = (teacher.teachingAssignments || []).filter((t) => t.unit === currentUnitCode);

                return (
                  <div
                    key={teacher.nip}
                    className="rounded-3xl liquid-glass-elevated p-5 border border-white/60 dark:border-white/10 shadow-lg relative overflow-hidden flex flex-col justify-between min-w-0"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-500 p-0.5 shadow-md flex-shrink-0">
                          <div className="w-full h-full rounded-[14px] bg-card flex items-center justify-center font-bold text-teal-600 dark:text-teal-400">
                            <GraduationCap size={22} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30 font-bold shrink-0">
                            {teacher.nip}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-extrabold text-foreground text-sm sm:text-base leading-tight break-words">
                        {teacher.name}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {teacher.role}
                      </p>

                      {/* Multi-unit Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        {assignedUnits.map((u) => {
                          const isCurrent = u === currentUnitCode;
                          return (
                            <span
                              key={u}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                                isCurrent
                                  ? u === "MI"
                                    ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/20"
                                    : u === "MTs"
                                    ? "bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-500/40 ring-1 ring-teal-500/20"
                                    : "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 ring-1 ring-amber-500/20"
                                  : "bg-muted/40 text-muted-foreground border-border/40"
                              }`}
                            >
                              Unit {u}
                            </span>
                          );
                        })}
                      </div>

                      {/* Homeroom Assignment in this Unit */}
                      {unitHomeroom ? (
                        <div className="mt-3.5 p-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                            <ShieldCheck size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block leading-tight">
                              Wali Kelas {currentUnitCode}
                            </span>
                            <span className="text-xs font-black text-foreground truncate block">
                              {unitHomeroom.className}
                            </span>
                          </div>
                        </div>
                      ) : otherHomerooms.length > 0 ? (
                        <div className="mt-3 p-2 rounded-xl bg-muted/30 border border-border/30 text-[10px] text-muted-foreground flex items-center gap-1.5">
                          <ShieldCheck size={13} className="text-muted-foreground/60 shrink-0" />
                          <span className="truncate">
                            Wali Kelas: {otherHomerooms.map((h) => `${h.unit} (${h.className})`).join(", ")}
                          </span>
                        </div>
                      ) : null}

                      {/* Subjects in this Unit */}
                      <div className="mt-3 p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 text-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                            Tugas Mengajar di {currentUnitCode}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/60 dark:bg-white/10 text-muted-foreground">
                            {unitTeachings.length} Mapel
                          </span>
                        </div>

                        {unitTeachings.length > 0 ? (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {unitTeachings.map((t) => (
                              <span
                                key={t.subjectId || t.subjectCode}
                                className="px-2 py-0.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold"
                              >
                                {t.subjectName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-muted-foreground italic">
                            {teacher.specialization || "Belum ada mata pelajaran khusus yang ditugaskan"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground gap-2">
                      <span className="flex items-center gap-1 font-mono text-[11px] truncate">
                        <Phone size={12} className="text-teal-600 shrink-0" />
                        <span>{teacher.phone}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 shrink-0">
                          <CheckCircle2 size={11} />
                          <span>{teacher.status}</span>
                        </span>
                        <Link
                          href={`/teachers`}
                          title="Buka Penugasan di Direktori Asatidz"
                          className="p-1 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: KURIKULUM & KITAB KUNING */}
      {activeTab === "curriculum" && (
        <CurriculumManagementTab
          unitSlug={slug}
          unitName={unit.name}
          teachers={teachers}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      )}

      {/* TAB 4: JADWAL TA'LIM & KBM */}
      {activeTab === "schedules" && (
        <ScheduleManagementTab
          unitSlug={slug}
          unitName={unit.name}
          teachers={teachers}
          facilities={unit.facilities}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      )}
    </div>
  );
}
