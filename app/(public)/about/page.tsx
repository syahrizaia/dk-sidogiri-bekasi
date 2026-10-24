"use client";

import React, { useState, useEffect, useSyncExternalStore, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Compass,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Award,
  ScrollText,
  Quote,
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  ExternalLink,
  RefreshCw,
  Layers,
  ChevronRight,
  UserCheck
} from "lucide-react";
import {
  getPublicAboutDataAction,
  type PublicAboutDataResult,
  type OrganizationMember,
  type PublicTeacherItem,
  type AboutContentDocument
} from "@/lib/actions/about";
import { getUserPermissionsAction } from "@/lib/actions/roles";
import { AboutSuperAdminModal } from "./components/AboutSuperAdminModal";

const emptySubscribe = () => () => {};

/**
 * Komponen Foto Profil Kosong (Default Blank Profile Silhouette Avatar)
 */
function BlankProfilePhoto({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 via-slate-200/90 to-slate-300 dark:from-slate-800 dark:via-slate-900/90 dark:to-slate-950 text-slate-400 dark:text-slate-500 relative select-none overflow-hidden ${className}`}
    >
      {/* Subtle ambient light highlight */}
      <div className="absolute inset-0 bg-radial-gradient from-white/40 dark:from-white/5 to-transparent pointer-events-none" />
      {/* Clean Human Silhouette (Head & Shoulders) */}
      <svg
        className="w-3/5 h-3/5 opacity-80 drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

export default function AboutPage() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Data State
  const [data, setData] = useState<PublicAboutDataResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("profile");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters State
  const [orgCategoryFilter, setOrgCategoryFilter] = useState<string>("ALL");
  const [teacherUnitFilter, setTeacherUnitFilter] = useState<string>("ALL");
  const [teacherSearchQuery, setTeacherSearchQuery] = useState<string>("");

  // Super Admin Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "add_org" | "edit_org" | "edit_teacher" | "edit_content";
    data?: any;
  }>({
    isOpen: false,
    type: "add_org",
  });

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [aboutRes, permsRes] = await Promise.all([
        getPublicAboutDataAction(),
        getUserPermissionsAction(),
      ]);

      if (aboutRes.success && aboutRes.data) {
        setData(aboutRes.data);
      }

      if (permsRes.success && permsRes.data) {
        setIsSuperAdmin(permsRes.data.isSuperAdmin || permsRes.data.role === "super_admin");
      } else {
        setIsSuperAdmin(false);
      }
    } catch (err) {
      console.error("Gagal memuat data About:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSuccess = (msg: string) => {
    setToastMessage(msg);
    fetchData();
  };

  // Filtered Organization Members
  const filteredOrgMembers = useMemo(() => {
    if (!data?.organization) return [];
    if (orgCategoryFilter === "ALL") return data.organization;
    return data.organization.filter((m) => m.category === orgCategoryFilter);
  }, [data?.organization, orgCategoryFilter]);

  // Filtered Teachers
  const filteredTeachers = useMemo(() => {
    if (!data?.teachers) return [];
    return data.teachers.filter((teacher) => {
      // Unit filter (checks multi-unit or single unit)
      if (teacherUnitFilter !== "ALL") {
        const units = teacher.institutions || (teacher.institution ? [teacher.institution] : []);
        if (!units.includes(teacherUnitFilter as any)) {
          return false;
        }
      }

      // Search query filter
      if (teacherSearchQuery.trim()) {
        const q = teacherSearchQuery.toLowerCase();
        const matchName = teacher.name.toLowerCase().includes(q);
        const matchNip = teacher.nip.toLowerCase().includes(q);
        const matchSpec = teacher.specialization?.toLowerCase().includes(q) || false;
        const matchSubject = teacher.teachingAssignments?.some(
          (ta) =>
            ta.subjectName.toLowerCase().includes(q) ||
            ta.subjectCode.toLowerCase().includes(q)
        );
        const matchHomeroom = teacher.homeroomAssignments?.some((ha) =>
          ha.className.toLowerCase().includes(q)
        );

        return matchName || matchNip || matchSpec || matchSubject || matchHomeroom;
      }

      return true;
    });
  }, [data?.teachers, teacherUnitFilter, teacherSearchQuery]);

  if (!mounted || loading) {
    return (
      <div className="relative min-h-screen py-16 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-spin">
          <RefreshCw size={24} />
        </div>
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          Memuat Informasi Resmi Darul Khidmah Sidogiri...
        </p>
      </div>
    );
  }

  const content = data?.content;
  const contact = data?.institutionContact;
  const academicYear = data?.academicYear || "2026/2027";

  return (
    <div className="relative min-h-screen py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8 w-full max-w-7xl min-w-0 mx-auto overflow-x-clip">
      {/* Background Decorative Ambient Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 flex items-center justify-center opacity-30 dark:opacity-20">
        <div className="w-[900px] max-w-[100vw] h-[900px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-amber-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Floating Super Admin Action Banner (HANYA MUNCUL UNTUK SUPER ADMIN) */}
      {isSuperAdmin && (
        <div className="mb-6 p-4 rounded-3xl liquid-glass-elevated border border-emerald-500/30 bg-emerald-500/10 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                  Panel Akses Super Admin Aktif
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  Full CRUD Enabled
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Anda memiliki hak istimewa untuk mengedit narasi profil, menambah/mengedit pengurus organisasi, dan mengatur profil publik asatidz.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() =>
                setModalState({
                  isOpen: true,
                  type: "edit_content",
                  data: content,
                })
              }
              className="px-3.5 py-1.5 rounded-2xl liquid-glass border border-emerald-500/30 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/20 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit size={13} />
              <span>Sunting Narasi Publik</span>
            </button>
            <button
              onClick={() =>
                setModalState({
                  isOpen: true,
                  type: "add_org",
                })
              }
              className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-600 text-white text-xs font-bold hover:from-emerald-600 hover:to-teal-500 inline-flex items-center gap-1.5 shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>+ Tambah Pengurus</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl liquid-glass-elevated border border-emerald-500/40 bg-emerald-600 text-white shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 size={18} className="shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Sticky Sub-Navigation Bar (Anchor Pills) */}
      <div className="sticky top-16 z-30 mb-8 py-2.5 backdrop-blur-md">
        <div className="p-1.5 rounded-full liquid-glass-card border border-white/60 dark:border-white/10 shadow-lg flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full justify-start sm:justify-center">
          {[
            { id: "profile", label: "Profil & Sejarah", icon: ScrollText },
            { id: "vision-mission", label: "Visi & Misi", icon: Award },
            { id: "organization", label: "Struktur Organisasi", icon: Users },
            { id: "teachers", label: `Dewan Asatidz (${academicYear})`, icon: GraduationCap },
            { id: "contact", label: "Kontak & Lokasi", icon: MapPin },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md shadow-emerald-900/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PROFIL & SEJARAH (1745 M)                                      */}
      {/* ========================================================================= */}
      <section id="profile" className="scroll-mt-28 mb-14">
        {/* Hero Card */}
        <div className="rounded-[32px] liquid-glass-elevated p-8 sm:p-12 mb-8 border border-white/60 dark:border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/15 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Profil Resmi Yayasan & Ekosistem Pendidikan</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Mengenal Darul Khidmah Sidogiri Bekasi
              </h1>
              {isSuperAdmin && (
                <button
                  onClick={() =>
                    setModalState({
                      isOpen: true,
                      type: "edit_content",
                      data: content,
                    })
                  }
                  className="p-2.5 rounded-2xl liquid-glass border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 shrink-0 transition-colors cursor-pointer"
                  title="Sunting Hero & Sejarah"
                >
                  <Edit size={16} />
                </button>
              )}
            </div>

            <p className="text-base sm:text-lg text-emerald-800 dark:text-emerald-300 font-serif italic">
              &ldquo;{content?.heroTagline || "Khidmah Lil-Ma'had Wal-Ummah — Meneguhkan Sanad Keilmuan, Menjaga Akhlak Salaf, dan Mencetak Generasi Qur'ani."}&rdquo;
            </p>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {content?.heroDescription ||
                "Darul Khidmah Sidogiri Bekasi merupakan representasi pengabdian para alumni dan muhibbin Pondok Pesantren Sidogiri Pasuruan di wilayah Jawa Barat dan Jabodetabek. Menghadirkan lingkungan belajar yang teduh, berdisiplin tinggi, serta memadukan kurikulum pendidikan formal madrasah dan tradisi keilmuan salaf yang otentik."}
            </p>

            {/* Quick Stats Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-3.5 rounded-2xl liquid-glass-card text-center border border-white/40 dark:border-white/5">
                <span className="block text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">1745 M</span>
                <span className="text-[11px] font-medium text-muted-foreground">Sanad Sidogiri</span>
              </div>
              <div className="p-3.5 rounded-2xl liquid-glass-card text-center border border-white/40 dark:border-white/5">
                <span className="block text-2xl font-black text-teal-700 dark:text-teal-400 font-mono">2</span>
                <span className="text-[11px] font-medium text-muted-foreground">Lembaga Aktif (MI & TPQ)</span>
              </div>
              <div className="p-3.5 rounded-2xl liquid-glass-card text-center border border-white/40 dark:border-white/5">
                <span className="block text-2xl font-black text-cyan-700 dark:text-cyan-400 font-mono">1</span>
                <span className="text-[11px] font-medium text-muted-foreground">Persiapan MTs</span>
              </div>
              <div className="p-3.5 rounded-2xl liquid-glass-card text-center border border-white/40 dark:border-white/5">
                <span className="block text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">100%</span>
                <span className="text-[11px] font-medium text-muted-foreground">Aswaja Asy&apos;ariyah</span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative & Sanad */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <ScrollText size={13} />
              <span>Akar Sejarah & Sanad Salaf</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {content?.historyTitle || "Warisan Keilmuan Sayyid Sulaiman Sejak 1745 M"}
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {content?.historyParagraphs && content.historyParagraphs.length > 0 ? (
                content.historyParagraphs.map((para, idx) => <p key={idx}>{para}</p>)
              ) : (
                <>
                  <p>
                    Pondok Pesantren Sidogiri di Pasuruan, Jawa Timur, didirikan pada tahun <strong>1745 M (1158 H)</strong> oleh ulama besar pejuang dakwah, <strong>Sayyid Sulaiman</strong> (cucu Sunan Gunung Jati Cirebon), bersama santri pertamanya <strong>Kiai Aminullah</strong> dari Pulau Bawean. Selama hampir tiga abad, Sidogiri teguh mempertahankan nilai kemandirian tanpa bantuan asing yang mengikat, keikhlasan total, dan pengajaran ilmu agama berasaskan <em>Ahlussunnah wal Jama&apos;ah</em>.
                  </p>
                  <p>
                    Berangkat dari kerinduan masyarakat perkotaan akan pendidikan Islam yang berakar kuat pada nilai-nilai keteladanan Sidogiri, para alumni mendirikan <strong>Darul Khidmah Sidogiri Bekasi</strong>. Lembaga ini hadir sebagai rumah khidmah yang menyambungkan sanad keilmuan para masyayikh kepada generasi muda di Bekasi dan sekitarnya.
                  </p>
                </>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-foreground flex items-start gap-3">
              <Quote className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="italic">
                  &ldquo;{content?.quote || "Tujuan utama pesantren bukanlah mencetak sarjana gelar semata, melainkan mencetak hamba-hamba Allah yang bertakwa, beradab mulia, dan berkhidmah tulus bagi agama serta masyarakat."}&rdquo;
                </p>
                <span className="block text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mt-1">
                  — {content?.quoteAuthor || "Masyayikh Pondok Pesantren Sidogiri Pasuruan"}
                </span>
              </div>
            </div>
          </div>

          {/* Principles Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl liquid-glass-card liquid-sheen p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-md">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Khidmah Santri Sidogiri</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Prinsip Pokok Pendidikan</p>
                </div>
              </div>

              <ul className="space-y-3 text-xs">
                {[
                  { title: "Tafaqquh fid-Din", desc: "Mendalami hukum syariat melalui kajian kitab turats (kitab kuning) standar Sidogiri." },
                  { title: "Metode Tartil Sidogiri", desc: "Kefasihan membaca Al-Qur'an bersanad muttashil melalui tahapan 6 jilid." },
                  { title: "Integritas & Akhlaqul Karimah", desc: "Memprioritaskan adab sebelum ilmu, hormat kepada guru, dan cinta ulama." },
                  { title: "Kemandirian Hidup (Berdikari)", desc: "Meneladani jiwa wirausaha dan kemandirian pondok pesantren induk." }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                    <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block">{item.title}</strong>
                      <span className="text-muted-foreground leading-tight block mt-0.5">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: VISI & MISI SERTA PANCA JIWA                                   */}
      {/* ========================================================================= */}
      <section id="vision-mission" className="scroll-mt-28 mb-14">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
            <Award size={13} />
            <span>Arah Langkah & Cita-Cita</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Visi & Misi Darul Khidmah Sidogiri Bekasi
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Panduan kompas strategis dalam menyelenggarakan pendidikan formal madrasah dan pengasuhan santri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Visi Card */}
          <div className="rounded-3xl liquid-glass-card p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Compass size={20} />
              </div>
              <h3 className="text-xl font-bold text-foreground">Visi Utama</h3>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                &ldquo;{content?.vision || "Terwujudnya lembaga pendidikan Islam yang unggul, mandiri, dan berkarakter mulia berdasarkan ajaran Ahlussunnah wal Jama'ah ala Thoriqoti Salafis Shalihin, serta mampu berkontribusi nyata bagi kemaslahatan umat dan peradaban bangsa."}&rdquo;
              </p>
            </div>
            <div className="pt-6 border-t border-border/40 mt-6 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
              <ShieldCheck size={14} />
              <span>Berlandaskan Akidah Asy&apos;ariyah & Mazhab Syafi&apos;i</span>
            </div>
          </div>

          {/* Misi Card */}
          <div className="rounded-3xl liquid-glass-card p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-lg space-y-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Sparkles size={20} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Misi Pengabdian</h3>
            <ol className="space-y-2.5 text-xs text-muted-foreground">
              {content?.missions && content.missions.length > 0 ? (
                content.missions.map((mission, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{idx + 1}.</span>
                    <span>{mission}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">1.</span>
                    <span>Menyelenggarakan pendidikan formal madrasah (MI & persiapan MTs) yang memadukan kedalaman ilmu syariah dan kurikulum nasional terpadu.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">2.</span>
                    <span>Menumbuhkan keteladanan adab salaf, sopan santun, serta keikhlasan dalam seluruh aspek pergaulan santri dan asatidz.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">3.</span>
                    <span>Membina kemampuan baca tulis dan tahfizh Al-Qur&apos;an secara tartil, fasih, dan bertajwid menggunakan metode khas Sidogiri.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">4.</span>
                    <span>Membentuk santri berjiwa mandiri, tangguh, berwawasan luas, dan siap berkhidmah di tengah masyarakat majemuk.</span>
                  </li>
                </>
              )}
            </ol>
          </div>
        </div>

        {/* Panca Jiwa Pesantren */}
        <div id="five-principles" className="scroll-mt-28">
          <div className="text-center max-w-xl mx-auto mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
              <HeartHandshake size={13} />
              <span>Fondasi Karakter Santri</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">Panca Jiwa Pondok Pesantren</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {(content?.pancaJiwa || [
              { title: "1. Keikhlasan", sub: "Lillahi Ta'ala", desc: "Berbuat dan menuntut ilmu semata-mata mencari keridhaan Allah SWT tanpa pamrih keduniaan.", color: "emerald" },
              { title: "2. Kesederhanaan", sub: "Al-Qana'ah", desc: "Hidup bersahaja, wajar, bersyukur, serta mengedepankan ketahanan jiwa di atas kemewahan materi.", color: "teal" },
              { title: "3. Kemandirian", sub: "Berdikari", desc: "Sanggup menolong diri sendiri, bertanggung jawab atas amanah, dan tidak berpangku tangan.", color: "cyan" },
              { title: "4. Ukhuwah Islamiyah", sub: "Persaudaraan Suci", desc: "Saling menyayangi, tolong-menolong, dan menjaga ikatan batin sesama santri dan umat Islam.", color: "amber" },
              { title: "5. Bebas Terarah", sub: "Berwawasan Luas", desc: "Berpikir cerdas, dinamis, dan objektif dalam koridor syariat Islam Ahlussunnah wal Jama'ah.", color: "indigo" }
            ]).map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl liquid-glass-card p-5 border border-white/50 dark:border-white/5 shadow-md flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                    {item.sub}
                  </span>
                  <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: STRUKTUR ORGANISASI (PENGURUS RANTING & UNIT)                 */}
      {/* ========================================================================= */}
      <section id="organization" className="scroll-mt-28 mb-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              <Users size={13} />
              <span>Amanah Khidmah Kepengurusan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Struktur Organisasi Darul Khidmah Sidogiri Bekasi
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Jajaran pengurus ranting, pimpinan harian, majelis penasihat, dan kepala unit pendidikan.
            </p>
          </div>

          {/* Super Admin: Tambah Pengurus */}
          {isSuperAdmin && (
            <button
              onClick={() =>
                setModalState({
                  isOpen: true,
                  type: "add_org",
                })
              }
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-600 text-white text-xs font-bold hover:from-emerald-600 hover:to-teal-500 inline-flex items-center gap-2 shadow-md shadow-emerald-900/20 shrink-0 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Pengurus Baru</span>
            </button>
          )}
        </div>

        {/* Filter Kategori Pengurus */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {[
            { id: "ALL", label: "Semua Pengurus" },
            { id: "PIMPINAN", label: "Pimpinan Inti Ranting" },
            { id: "KEPALA_UNIT", label: "Kepala Unit Pendidikan" },
            { id: "BIDANG_SEKSI", label: "Koordinator Bidang / Seksi" },
            { id: "PENASIHAT", label: "Majelis Penasihat" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setOrgCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                orgCategoryFilter === cat.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                  : "liquid-glass border border-white/60 dark:border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid Kartu Pengurus */}
        {filteredOrgMembers.length === 0 ? (
          <div className="p-8 rounded-3xl liquid-glass text-center border border-dashed border-border/50 text-xs text-muted-foreground">
            Belum ada data pengurus untuk kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredOrgMembers.map((member) => (
              <div
                key={member._id || member.id || member.name}
                className="rounded-3xl liquid-glass-card border border-white/60 dark:border-white/10 shadow-lg p-5 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200 relative group overflow-hidden"
              >
                {/* Super Admin Quick Edit Button */}
                {isSuperAdmin && (
                  <button
                    onClick={() =>
                      setModalState({
                        isOpen: true,
                        type: "edit_org",
                        data: member,
                      })
                    }
                    className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-white/80 dark:bg-black/80 backdrop-blur-md text-foreground hover:text-emerald-600 shadow-md border border-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Edit Pengurus"
                  >
                    <Edit size={14} />
                  </button>
                )}

                <div>
                  {/* Photo Container */}
                  <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden mb-4 bg-muted relative liquid-glass border border-white/40 dark:border-white/5 flex items-center justify-center">
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <BlankProfilePhoto />
                    )}

                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20">
                        Periode {member.period}
                      </span>
                    </div>
                  </div>

                  {/* Title & Info */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 block">
                      {member.department || member.category}
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-foreground leading-snug line-clamp-2">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 line-clamp-1">
                      {member.title}
                    </p>
                  </div>

                  {member.bio && (
                    <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </div>

                {isSuperAdmin && (
                  <div className="pt-3 mt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Urutan: #{member.order}</span>
                    <button
                      onClick={() =>
                        setModalState({
                          isOpen: true,
                          type: "edit_org",
                          data: member,
                        })
                      }
                      className="font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
                    >
                      Kelola Pengurus &rarr;
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: DEWAN ASATIDZ TAHUN AJARAN SEKARANG (2026/2027)                */}
      {/* ========================================================================= */}
      <section id="teachers" className="scroll-mt-28 mb-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              <GraduationCap size={13} />
              <span>Pendidik & Pembina Santri</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Dewan Asatidz & Pengajar — Tahun Ajaran {academicYear}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Para ustadz dan ustadzah yang mengemban amanah taklim wa tarbiyah di seluruh jenjang MI, MTs, dan TPQ.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass border border-white/60 dark:border-white/10 text-xs font-semibold text-foreground shrink-0">
            <UserCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Total {data?.teachers?.length || 0} Asatidz Terdaftar</span>
          </div>
        </div>

        {/* Filter & Live Search Toolbar */}
        <div className="p-3.5 rounded-3xl liquid-glass-card border border-white/60 dark:border-white/10 shadow-lg mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Unit Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: "ALL", label: "Semua Unit" },
              { id: "MI", label: "MI Miftahul Ulum" },
              { id: "MTs", label: "MTs Miftahul Ulum" },
              { id: "TPQ", label: "TPQ Tartil Sidogiri" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTeacherUnitFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  teacherUnitFilter === tab.id
                    ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md shadow-emerald-900/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Live Search Input */}
          <div className="relative min-w-[240px] sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={teacherSearchQuery}
              onChange={(e) => setTeacherSearchQuery(e.target.value)}
              placeholder="Cari nama ustadz, mapel/kitab, NIP..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>

        {/* Grid Kartu Asatidz */}
        {filteredTeachers.length === 0 ? (
          <div className="p-10 rounded-3xl liquid-glass text-center border border-dashed border-border/50 text-xs text-muted-foreground space-y-2">
            <GraduationCap size={32} className="mx-auto opacity-40 text-muted-foreground" />
            <p>Tidak ditemukan ustadz/guru yang sesuai dengan pencarian atau filter unit yang dipilih.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => {
              const units = teacher.institutions || (teacher.institution ? [teacher.institution] : []);
              return (
                <div
                  key={teacher._id || teacher.id || teacher.nip}
                  className="rounded-3xl liquid-glass-card border border-white/60 dark:border-white/10 shadow-lg p-5 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200 relative group overflow-hidden"
                >
                  {/* Super Admin Quick Edit Button */}
                  {isSuperAdmin && (
                    <button
                      onClick={() =>
                        setModalState({
                          isOpen: true,
                          type: "edit_teacher",
                          data: teacher,
                        })
                      }
                      className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-white/80 dark:bg-black/80 backdrop-blur-md text-foreground hover:text-emerald-600 shadow-md border border-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Atur Profil Publik Guru"
                    >
                      <Edit size={14} />
                    </button>
                  )}

                  <div>
                    {/* Top Row: Photo & Header Info */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Photo */}
                      <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden bg-muted relative liquid-glass border border-white/40 dark:border-white/5 shrink-0">
                        {teacher.photoUrl ? (
                          <img
                            src={teacher.photoUrl}
                            alt={teacher.name}
                            className="w-full h-full object-cover object-top"
                            loading="lazy"
                          />
                        ) : (
                          <BlankProfilePhoto />
                        )}
                      </div>

                      {/* Header details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1">
                          {units.map((u) => (
                            <span
                              key={u}
                              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                u === "MI"
                                  ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                                  : u === "MTs"
                                  ? "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30"
                                  : "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30"
                              }`}
                            >
                              Unit {u}
                            </span>
                          ))}
                        </div>

                        <h3 className="font-extrabold text-sm sm:text-base text-foreground leading-snug">
                          {teacher.name}
                        </h3>

                        <p className="text-[11px] font-mono text-muted-foreground">
                          NIP: {teacher.nip}
                        </p>

                        {teacher.education && (
                          <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 line-clamp-1">
                            {teacher.education}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amanah Wali Kelas Badge (Jika Ada) */}
                    {teacher.homeroomAssignments && teacher.homeroomAssignments.length > 0 && (
                      <div className="mb-3 p-2 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center gap-2 text-xs text-teal-900 dark:text-teal-300">
                        <ShieldCheck size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="text-[11px] font-semibold">
                          Wali Kelas:{" "}
                          {teacher.homeroomAssignments
                            .map((h) => `${h.className} (${h.unit})`)
                            .join(", ")}
                        </span>
                      </div>
                    )}

                    {/* Mata Pelajaran / Kitab yang Diampu */}
                    <div className="space-y-1.5 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Mata Pelajaran & Kitab Diampu ({academicYear}):
                      </span>
                      {teacher.teachingAssignments && teacher.teachingAssignments.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.teachingAssignments.map((ta, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-lg liquid-glass border border-white/50 dark:border-white/5 text-foreground/90"
                            >
                              {ta.subjectName}{" "}
                              <span className="opacity-60">({ta.unit})</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground italic">
                          {teacher.specialization || "Guru Pengajar"}
                        </p>
                      )}
                    </div>

                    {/* Public Bio Quote */}
                    {teacher.publicBio && (
                      <p className="text-[11px] text-muted-foreground italic leading-relaxed pt-2 border-t border-border/20 line-clamp-2">
                        &ldquo;{teacher.publicBio}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Footer / Super Admin action */}
                  {isSuperAdmin && (
                    <div className="pt-3 mt-3 border-t border-border/30 flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">TA {teacher.academicYear || academicYear}</span>
                      <button
                        onClick={() =>
                          setModalState({
                            isOpen: true,
                            type: "edit_teacher",
                            data: teacher,
                          })
                        }
                        className="font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        Atur Profil Publik &rarr;
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: KONTAK & LOKASI SEKRETARIAT (DINAMIS DARI SETTINGS)             */}
      {/* ========================================================================= */}
      <section id="contact" className="scroll-mt-28 rounded-3xl liquid-glass-card p-8 sm:p-10 border border-white/60 dark:border-white/10 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <MapPin size={13} />
              <span>Sekretariat & Asrama</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Kunjungi {contact?.name || "Darul Khidmah Sidogiri Bekasi"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Kami menyambut hangat para orang tua, wali santri, alumni, dan kaum muslimin yang ingin bersilaturahmi atau mendaftarkan putra-putrinya ke lembaga pendidikan kami.
            </p>

            <div className="space-y-2.5 text-xs text-foreground/90 pt-2">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="break-words">
                  {contact?.address || "Jl. Lapangan Kranji, Bintara, Bekasi Barat, Kota Bekasi, Jawa Barat 17134"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <span>{contact?.phone || "0812-3456-7890"} (Sekretariat PSB)</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className="break-all">{contact?.email || "sekretariat@sidogiri-bekasi.sch.id"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link
              href="/admissions"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>Daftar Santri Baru (PSB)</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/modules"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground text-xs font-bold transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>Masuk Portal Modul</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Super Admin Modal (Tambah/Edit Pengurus, Edit Profil Publik Guru, Sunting Narasi) */}
      {modalState.isOpen && (
        <AboutSuperAdminModal
          type={modalState.type}
          data={modalState.data}
          onClose={() => setModalState({ isOpen: false, type: "add_org" })}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
