"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  getTeachersAction,
  createTeacherAction,
  updateTeacherAction,
  assignTeacherAcademicAction,
  TeacherRecord,
  TeachingAssignment,
  HomeroomAssignment,
} from "@/lib/actions/teachers";
import { getAllSubjectsAction, SubjectRecord } from "@/lib/actions/subjects";
import { getDistinctClassesAction } from "@/lib/actions/students";
import { getUserPermissionsAction, type UserPermissionsResult } from "@/lib/actions/roles";
import {
  UserCheck,
  Search,
  Plus,
  BookOpen,
  Building2,
  Compass,
  ArrowLeft,
  Phone,
  Calendar,
  CheckCircle2,
  X,
  Filter,
  Users,
  ShieldCheck,
  GraduationCap,
  Pencil,
  Download,
  BookMarked,
  Check,
  AlertCircle,
  RefreshCw,
  Layers,
  Sparkles,
} from "lucide-react";
import { exportCorporateCSV } from "@/lib/export-utils";

const UNITS: ("MI" | "MTs" | "TPQ")[] = ["MI", "MTs", "TPQ"];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [classesMap, setClassesMap] = useState<Record<"MI" | "MTs" | "TPQ", string[]>>({
    MI: [],
    MTs: [],
    TPQ: [],
  });
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<UserPermissionsResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInst, setSelectedInst] = useState<"ALL" | "MI" | "MTs" | "TPQ">("ALL");

  // Notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // RBAC
  const canCreate = userPermissions?.crudPermissions?.teachers?.create ?? false;
  const canEdit = userPermissions?.crudPermissions?.teachers?.update ?? false;

  // Modal 1: Create Teacher
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    nip: "",
    role: "",
    institution: "MI" as "MI" | "MTs" | "TPQ",
    specialization: "",
    phone: "",
    joinedYear: new Date().getFullYear(),
  });

  // Modal 2: Edit General Profile
  const [editingTeacher, setEditingTeacher] = useState<TeacherRecord | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    nip: "",
    role: "",
    institution: "MI" as "MI" | "MTs" | "TPQ",
    specialization: "",
    phone: "",
    status: "AKTIF" as "AKTIF" | "CUTI",
    joinedYear: new Date().getFullYear(),
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Modal 3: Academic & Homeroom Assignment Modal (STRICT 1 CLASS PER UNIT)
  const [assignmentTeacher, setAssignmentTeacher] = useState<TeacherRecord | null>(null);
  const [assignmentInstitutions, setAssignmentInstitutions] = useState<("MI" | "MTs" | "TPQ")[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  // Exactly one homeroom class per unit:
  const [homeroomsByUnit, setHomeroomsByUnit] = useState<Record<"MI" | "MTs" | "TPQ", string>>({
    MI: "",
    MTs: "",
    TPQ: "",
  });
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);

  const showNotification = useCallback((message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [tRes, sRes, cRes] = await Promise.all([
        getTeachersAction(),
        getAllSubjectsAction(),
        getDistinctClassesAction(),
      ]);

      if (tRes.success && tRes.data) {
        setTeachers(tRes.data);
      }
      if (sRes.success && sRes.data) {
        setSubjects(sRes.data);
      }
      if (cRes.success && cRes.data) {
        setClassesMap(cRes.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data teachers atau subjects:", err);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      getTeachersAction(),
      getAllSubjectsAction(),
      getDistinctClassesAction(),
      getUserPermissionsAction(),
    ])
      .then(([tRes, sRes, cRes, permsRes]) => {
        if (!ignore) {
          if (tRes.success && tRes.data) setTeachers(tRes.data);
          if (sRes.success && sRes.data) setSubjects(sRes.data);
          if (cRes.success && cRes.data) setClassesMap(cRes.data);
          if (permsRes.success && permsRes.data) setUserPermissions(permsRes.data);
        }
      })
      .catch((err) => {
        console.error("Error loading teachers data:", err);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Filtered Teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        query === "" ||
        t.name.toLowerCase().includes(query) ||
        t.nip.toLowerCase().includes(query) ||
        t.specialization.toLowerCase().includes(query) ||
        t.role.toLowerCase().includes(query) ||
        (t.teachingAssignments &&
          t.teachingAssignments.some((a) =>
            a.subjectName.toLowerCase().includes(query) || a.subjectCode.toLowerCase().includes(query)
          )) ||
        (t.homeroomAssignments &&
          t.homeroomAssignments.some((h) => h.className.toLowerCase().includes(query)));

      const matchInst =
        selectedInst === "ALL" ||
        t.institution === selectedInst ||
        (Array.isArray(t.institutions) && t.institutions.includes(selectedInst)) ||
        (Array.isArray(t.teachingAssignments) && t.teachingAssignments.some((a) => a.unit === selectedInst)) ||
        (Array.isArray(t.homeroomAssignments) && t.homeroomAssignments.some((h) => h.unit === selectedInst));

      return matchSearch && matchInst;
    });
  }, [teachers, searchQuery, selectedInst]);

  // Statistics
  const stats = useMemo(() => {
    const total = teachers.length;
    const miCount = teachers.filter(
      (t) =>
        t.institution === "MI" ||
        (t.institutions && t.institutions.includes("MI"))
    ).length;
    const mtsCount = teachers.filter(
      (t) =>
        t.institution === "MTs" ||
        (t.institutions && t.institutions.includes("MTs"))
    ).length;
    const tpqCount = teachers.filter(
      (t) =>
        t.institution === "TPQ" ||
        (t.institutions && t.institutions.includes("TPQ"))
    ).length;
    const homeroomTotal = teachers.filter(
      (t) => t.homeroomAssignments && t.homeroomAssignments.length > 0
    ).length;

    return { total, mi: miCount, mts: mtsCount, tpq: tpqCount, homerooms: homeroomTotal };
  }, [teachers]);

  // Open Edit Profile Modal
  const openEditModal = (t: TeacherRecord) => {
    setEditingTeacher(t);
    setEditFormData({
      name: t.name || "",
      nip: t.nip || "",
      role: t.role || "",
      institution: t.institution || "MI",
      specialization: t.specialization || "",
      phone: t.phone || "",
      status: t.status || "AKTIF",
      joinedYear: t.joinedYear || new Date().getFullYear(),
    });
  };

  // Open Academic & Homeroom Assignment Modal
  const openAssignmentModal = (t: TeacherRecord) => {
    setAssignmentTeacher(t);

    // Initial institutions
    const instSet = new Set<"MI" | "MTs" | "TPQ">();
    if (t.institution) instSet.add(t.institution);
    if (Array.isArray(t.institutions)) {
      t.institutions.forEach((u) => instSet.add(u));
    }
    setAssignmentInstitutions(Array.from(instSet));

    // Initial teaching subjects
    const subIds = (t.teachingAssignments || []).map((a) => a.subjectId).filter(Boolean);
    setSelectedSubjectIds(subIds);

    // Initial homerooms (exactly 1 per unit)
    const initialH: Record<"MI" | "MTs" | "TPQ", string> = {
      MI: "",
      MTs: "",
      TPQ: "",
    };
    (t.homeroomAssignments || []).forEach((hr) => {
      if (hr.unit && hr.className) {
        initialH[hr.unit] = hr.className;
      }
    });
    setHomeroomsByUnit(initialH);
  };

  // Handle Save Assignment
  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentTeacher) return;

    const teacherId = assignmentTeacher.id || assignmentTeacher._id;
    if (!teacherId) {
      showNotification("ID Asatidz tidak valid.", "error");
      return;
    }

    setAssignmentSubmitting(true);

    try {
      // Build homeroom assignments array (only non-empty)
      const homeroomAssignments: HomeroomAssignment[] = [];
      for (const unit of UNITS) {
        const cls = homeroomsByUnit[unit]?.trim();
        if (cls) {
          homeroomAssignments.push({ unit, className: cls });
        }
      }

      const res = await assignTeacherAcademicAction(teacherId, {
        institutions: assignmentInstitutions,
        teachingSubjectIds: selectedSubjectIds,
        homeroomAssignments,
      });

      if (res.success) {
        showNotification(
          res.message || "Penugasan akademik & wali kelas berhasil disimpan!",
          "success"
        );
        setAssignmentTeacher(null);
        await loadData();
      } else {
        showNotification(res.error || "Gagal menyimpan penugasan.", "error");
      }
    } catch {
      showNotification("Terjadi kendala saat menyimpan penugasan.", "error");
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  // Handle Save Create Teacher
  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitting(true);

    try {
      const res = await createTeacherAction({
        name: createFormData.name,
        nip: createFormData.nip,
        role: createFormData.role,
        institution: createFormData.institution,
        specialization: createFormData.specialization,
        phone: createFormData.phone,
        status: "AKTIF",
        joinedYear: createFormData.joinedYear,
      });

      if (res.success) {
        showNotification("Data asatidz baru berhasil disimpan ke MongoDB Atlas!", "success");
        setIsCreateModalOpen(false);
        setCreateFormData({
          name: "",
          nip: "",
          role: "",
          institution: "MI",
          specialization: "",
          phone: "",
          joinedYear: new Date().getFullYear(),
        });
        await loadData();
      } else {
        showNotification(res.error || "Gagal menyimpan data asatidz.", "error");
      }
    } catch {
      showNotification("Terjadi kesalahan saat menyimpan data asatidz.", "error");
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Handle Save Update Profile
  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    const tId = editingTeacher.id || editingTeacher._id || editingTeacher.nip;

    setEditSubmitting(true);

    try {
      const res = await updateTeacherAction(tId, editFormData);
      if (res.success) {
        showNotification("Data asatidz berhasil diperbarui di MongoDB Atlas!", "success");
        setEditingTeacher(null);
        await loadData();
      } else {
        showNotification(res.error || "Gagal memperbarui data asatidz.", "error");
      }
    } catch {
      showNotification("Terjadi kesalahan saat memperbarui data.", "error");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Export CSV
  const handleExportTeachersCSV = () => {
    if (!filteredTeachers.length) return;
    exportCorporateCSV({
      filename: "Direktori_Asatidz_DK_Sidogiri",
      title: "Direktori Resmi Dewan Asatidz & Penugasan Akademik",
      subtitle: "Pangkalan Data Asatidz Madrasah Miftahul Ulum & TPQ Tartil Sidogiri",
      metadata: {
        "Unit Lembaga": selectedInst === "ALL" ? "Seluruh Lembaga (MI, MTs, TPQ)" : selectedInst,
        "Kata Kunci Pencarian": searchQuery || "Semua Data",
      },
      columns: [
        { header: "No", accessor: (_, idx) => idx + 1 },
        { header: "NIP / Kode", accessor: "nip", isNumericId: true },
        { header: "Nama Lengkap Asatidz", accessor: "name" },
        { header: "Jabatan Utama", accessor: "role" },
        {
          header: "Lembaga Mengajar",
          accessor: (t: any) =>
            (t.institutions && t.institutions.length > 0 ? t.institutions : [t.institution]).join(", "),
        },
        {
          header: "Amanah Wali Kelas",
          accessor: (t: any) =>
            t.homeroomAssignments && t.homeroomAssignments.length > 0
              ? t.homeroomAssignments.map((h: any) => `${h.className} (${h.unit})`).join("; ")
              : "Bukan Wali Kelas",
        },
        {
          header: "Mata Pelajaran Diampu",
          accessor: (t: any) =>
            t.teachingAssignments && t.teachingAssignments.length > 0
              ? t.teachingAssignments.map((a: any) => `${a.subjectCode} - ${a.subjectName} (${a.unit})`).join("; ")
              : t.specialization,
        },
        { header: "Status", accessor: "status" },
        { header: "No. WhatsApp", accessor: "phone", isNumericId: true },
      ],
      data: filteredTeachers,
    });
  };

  return (
    <div className="relative min-h-screen py-8 sm:py-10 px-3.5 sm:px-6 lg:px-8 w-full max-w-7xl min-w-0 mx-auto">
      {/* Top Breadcrumb & Navigation Back */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/modules"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground/80 hover:text-foreground transition-all"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Portal Modul</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <ShieldCheck size={14} />
          <span>MongoDB Atlas Dynamic RBAC</span>
        </span>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl liquid-glass-elevated p-5 sm:p-8 mb-8 border border-white/60 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              <UserCheck size={14} />
              <span>Direktori Dewan Asatidz Sidogiri</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Tenaga Pendidik &amp; Penugasan Akademik
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              Manajemen terpusat Dewan Asatidz: pengaturan penugasan mata pelajaran, kitab kuning, dan amanah wali kelas terpadu lintas unit MI, MTs persiapan, dan TPQ Tartil Sidogiri.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={handleExportTeachersCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:bg-white/40 dark:hover:bg-white/10 transition-all cursor-pointer active:scale-95"
              title="Unduh direktori dewan asatidz dalam format CSV resmi"
            >
              <Download size={14} />
              <span>Unduh CSV</span>
            </button>

            {canCreate && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                id="btn-add-teacher"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Plus size={15} />
                <span>Tambah Asatidz Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-3.5 mt-6 pt-6 border-t border-border/40">
          <div className="p-3.5 rounded-2xl liquid-glass-card text-center sm:text-left">
            <span className="text-[11px] font-semibold text-muted-foreground block">Total Asatidz</span>
            <span className="text-2xl font-bold text-foreground font-mono">{stats.total}</span>
          </div>
          <div className="p-3.5 rounded-2xl liquid-glass-card text-center sm:text-left">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">MI Miftahul Ulum</span>
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">{stats.mi}</span>
          </div>
          <div className="p-3.5 rounded-2xl liquid-glass-card text-center sm:text-left">
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400 block">MTs Persiapan</span>
            <span className="text-2xl font-bold text-teal-700 dark:text-teal-400 font-mono">{stats.mts}</span>
          </div>
          <div className="p-3.5 rounded-2xl liquid-glass-card text-center sm:text-left">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block">TPQ Tartil</span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">{stats.tpq}</span>
          </div>
          <div className="p-3.5 rounded-2xl liquid-glass-card col-span-2 sm:col-span-1 text-center sm:text-left">
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block">Wali Kelas Aktif</span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">{stats.homerooms}</span>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between border shadow-lg animate-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border-emerald-500/30"
              : "bg-rose-500/15 text-rose-900 dark:text-rose-200 border-rose-500/30"
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {notification.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
            )}
            <span className="truncate">{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="opacity-60 hover:opacity-100 shrink-0 ml-2"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          <input
            type="text"
            id="teacher-search-input"
            placeholder="Cari asatidz, NIP, mapel, atau kelas wali..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl liquid-glass-input text-xs font-medium placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="w-full sm:w-auto flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 min-w-0">
          <Filter size={14} className="text-muted-foreground ml-1 mr-1 hidden sm:inline shrink-0" />
          {[
            { id: "ALL", label: "Seluruh Unit" },
            { id: "MI", label: "MI (Ibtidaiyah)" },
            { id: "MTs", label: "MTs (Persiapan)" },
            { id: "TPQ", label: "TPQ (Tartil)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedInst(tab.id as typeof selectedInst)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedInst === tab.id
                  ? "bg-emerald-700 text-white shadow-sm font-bold"
                  : "liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Section */}
      <div className="rounded-3xl liquid-glass-card border border-white/60 dark:border-white/10 shadow-xl overflow-hidden w-full max-w-full min-w-0">
        {loading ? (
          <div className="p-16 text-center text-xs text-muted-foreground">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="font-mono">Sinkronisasi direktori dewan asatidz dari MongoDB Atlas...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-semibold text-foreground">Tidak ada data asatidz yang sesuai.</p>
            <p className="mt-1">Coba sesuaikan kata kunci pencarian atau filter unit lembaga.</p>
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="border-b border-border/40 bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Dewan Asatidz & NIP</th>
                  <th className="py-3.5 px-4">Lembaga Naungan</th>
                  <th className="py-3.5 px-4">Amanah Wali Kelas</th>
                  <th className="py-3.5 px-4">Mata Pelajaran Diampu</th>
                  <th className="py-3.5 px-4">Kontak WhatsApp</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-medium">
                {filteredTeachers.map((t) => {
                  const tId = t.id || t._id || t.nip;
                  const instList =
                    Array.isArray(t.institutions) && t.institutions.length > 0
                      ? t.institutions
                      : [t.institution || "MI"];
                  const homerooms = t.homeroomAssignments || [];
                  const teaching = t.teachingAssignments || [];

                  return (
                    <tr key={tId} className="hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
                      {/* Teacher name & NIP */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold flex-shrink-0 shadow-sm">
                            <GraduationCap size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm leading-tight">{t.name}</p>
                            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{t.nip}</p>
                            <span className="text-[10px] text-muted-foreground block">{t.role}</span>
                          </div>
                        </div>
                      </td>

                      {/* Multi-unit badges */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {instList.map((inst) => (
                            <span
                              key={inst}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                inst === "MI"
                                  ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                                  : inst === "MTs"
                                  ? "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30"
                                  : "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30"
                              }`}
                            >
                              {inst}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Homeroom assignments */}
                      <td className="py-4 px-4 max-w-[200px]">
                        {homerooms.length > 0 ? (
                          <div className="space-y-1">
                            {homerooms.map((hr, idx) => (
                              <div
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 text-[11px] font-bold w-full truncate"
                              >
                                <span className="font-mono text-[9px] uppercase px-1 py-0.2 rounded bg-indigo-500/20 shrink-0">
                                  {hr.unit}
                                </span>
                                <span className="truncate">{hr.className}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/70 italic">
                            Bukan Wali Kelas
                          </span>
                        )}
                      </td>

                      {/* Teaching subjects */}
                      <td className="py-4 px-4 max-w-[240px]">
                        {teaching.length > 0 ? (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground block">
                              {teaching.length} Mata Pelajaran:
                            </span>
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                              {teaching.map((sub, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-foreground/5 border border-foreground/10 text-foreground font-medium truncate max-w-[190px]"
                                  title={`${sub.subjectCode} - ${sub.subjectName} (${sub.unit})`}
                                >
                                  <span className="font-mono text-[9px] text-muted-foreground">{sub.unit}:</span>
                                  <span className="truncate">{sub.subjectName}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px] line-clamp-2">
                            {t.specialization || "Belum ada mapel tertaut"}
                          </span>
                        )}
                      </td>

                      {/* Phone / WA */}
                      <td className="py-4 px-4 font-mono text-muted-foreground whitespace-nowrap">
                        <a
                          href={`https://wa.me/${t.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          <Phone size={13} className="text-emerald-600 shrink-0" />
                          <span>{t.phone}</span>
                        </a>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === "AKTIF"
                              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                              : "bg-slate-500/20 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {canEdit ? (
                            <>
                              <button
                                type="button"
                                onClick={() => openAssignmentModal(t)}
                                id={`btn-assign-teacher-${t.nip}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-sm transition-all active:scale-95 cursor-pointer"
                                title="Atur Penugasan Mengajar & Wali Kelas"
                              >
                                <BookMarked size={12} />
                                <span>Penugasan</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditModal(t)}
                                id={`btn-edit-teacher-${t.nip}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl liquid-glass-pill hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] transition-all active:scale-95 cursor-pointer"
                                title="Edit Profil Umum"
                              >
                                <Pencil size={12} />
                                <span>Profil</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-muted-foreground/60 italic">Lihat Saja</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-2.5 bg-muted/20 border-t border-border/30 text-[10px] text-muted-foreground flex items-center justify-between sm:hidden">
          <span>← Geser tabel ke samping untuk info lengkap →</span>
          <span className="font-mono font-semibold">{filteredTeachers.length} Asatidz</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ATUR PENUGASAN AKADEMIK & WALI KELAS (STRICT 1 CLASS PER UNIT)   */}
      {/* ========================================================================= */}
      {assignmentTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Pinned Header */}
            <div className="shrink-0 p-5 border-b border-border/40 flex items-center justify-between bg-background/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <BookMarked size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Atur Penugasan Akademik &amp; Wali Kelas
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Asatidz: <span className="font-bold text-foreground">{assignmentTeacher.name}</span> ({assignmentTeacher.nip})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAssignmentTeacher(null)}
                className="p-1.5 rounded-full liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveAssignment} id="assignment-form" className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Section 1: Multi-Unit Selection */}
              <div className="space-y-2">
                <label className="font-bold text-foreground block">
                  1. Keanggotaan Unit Lembaga (Bisa Mengajar Lintas Unit)
                </label>
                <div className="flex flex-wrap gap-2">
                  {UNITS.map((u) => {
                    const isChecked = assignmentInstitutions.includes(u);
                    return (
                      <button
                        key={u}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            if (assignmentInstitutions.length > 1) {
                              setAssignmentInstitutions(assignmentInstitutions.filter((x) => x !== u));
                            } else {
                              showNotification("Minimal satu unit lembaga harus dipilih.", "error");
                            }
                          } else {
                            setAssignmentInstitutions([...assignmentInstitutions, u]);
                          }
                        }}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isChecked
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                            : "liquid-glass border-white/60 dark:border-white/10 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Unit {u}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Pilih unit di mana asatidz aktif mengajar atau mengampu amanah perwalian.
                </p>
              </div>

              {/* Section 2: Strict Homeroom Settings per Unit (1 Class per Unit Maximum) */}
              <div className="space-y-3 p-4 rounded-2xl liquid-glass border border-indigo-500/25 bg-indigo-500/5">
                <div className="flex items-start gap-2">
                  <ShieldCheck size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground text-xs">
                      2. Pengaturan Amanah Wali Kelas (Aturan: 1 Guru = Maksimal 1 Kelas per Unit)
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Seorang ustadz dapat menjadi wali kelas lintas unit (misal: 1 kelas di MI dan 1 kelas di TPQ). Namun dalam satu unit yang sama, maksimal hanya boleh 1 kelas.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {UNITS.map((unit) => {
                    const availableClasses = classesMap[unit] || [];
                    const currentSelected = homeroomsByUnit[unit] || "";

                    return (
                      <div key={unit} className="space-y-1.5 p-3 rounded-xl bg-background/60 border border-border/40">
                        <label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                          <span>Wali Kelas Unit {unit}</span>
                          <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-foreground/5 text-muted-foreground">
                            Max 1
                          </span>
                        </label>
                        <select
                          value={currentSelected}
                          onChange={(e) =>
                            setHomeroomsByUnit({
                              ...homeroomsByUnit,
                              [unit]: e.target.value,
                            })
                          }
                          className="w-full p-2 rounded-xl liquid-glass-input text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                        >
                          <option value="">-- Bukan Wali Kelas di {unit} --</option>
                          {availableClasses.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Teaching Subjects Selection by Unit */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-foreground text-xs">
                    3. Penugasan Mata Pelajaran &amp; Kitab Kuning
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Centang mata pelajaran dan kitab kuning yang diajarkan oleh asatidz ini. Sistem akan otomatis mensinkronkan ID pengajar pada koleksi kurikulum.
                  </p>
                </div>

                <div className="space-y-3">
                  {UNITS.map((unit) => {
                    const unitSubjects = subjects.filter((s) => s.unit === unit);
                    if (unitSubjects.length === 0) return null;

                    return (
                      <div key={unit} className="p-3.5 rounded-2xl liquid-glass border border-border/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                unit === "MI" ? "bg-emerald-500" : unit === "MTs" ? "bg-teal-500" : "bg-amber-500"
                              }`}
                            />
                            <span>Mata Pelajaran Unit {unit}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {unitSubjects.length} Mapel Tersedia
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                          {unitSubjects.map((sub) => {
                            const subId = sub.id || sub._id || "";
                            const isChecked = selectedSubjectIds.includes(subId);

                            return (
                              <button
                                key={subId}
                                type="button"
                                onClick={() => {
                                  if (isChecked) {
                                    setSelectedSubjectIds(selectedSubjectIds.filter((id) => id !== subId));
                                  } else {
                                    setSelectedSubjectIds([...selectedSubjectIds, subId]);
                                  }
                                }}
                                className={`flex items-start gap-2.5 p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                                  isChecked
                                    ? "bg-indigo-600/15 border-indigo-600/40 text-foreground"
                                    : "bg-background/40 border-border/30 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                                    isChecked
                                      ? "bg-indigo-600 text-white border-indigo-600"
                                      : "border-border/60 bg-background"
                                  }`}
                                >
                                  {isChecked && <Check size={11} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold text-foreground block truncate leading-tight">
                                    {sub.name}
                                  </span>
                                  <span className="font-mono text-[9px] text-muted-foreground block">
                                    {sub.code} • {sub.category}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>

            {/* Pinned Modal Footer */}
            <div className="shrink-0 p-4 border-t border-border/40 flex items-center justify-end gap-3 bg-background/50 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setAssignmentTeacher(null)}
                className="px-4 py-2 rounded-xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground font-semibold cursor-pointer text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                form="assignment-form"
                disabled={assignmentSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
              >
                {assignmentSubmitting ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>Simpan Penugasan Akademik</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TAMBAH ASATIDZ BARU                                              */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl sm:rounded-[28px] liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="shrink-0 p-4 sm:p-5 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">Tambah Dewan Asatidz</h3>
                <p className="text-xs text-muted-foreground">Data akan tersimpan langsung ke MongoDB Atlas.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-full liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="flex flex-col flex-1 min-h-0 text-xs">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Nama Lengkap &amp; Gelar *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ust. M. Hasan Basri, S.Pd.I"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">NIP / Kode *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: DKS-AS-15"
                      value={createFormData.nip}
                      onChange={(e) => setCreateFormData({ ...createFormData, nip: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">Unit Utama *</label>
                    <select
                      value={createFormData.institution}
                      onChange={(e) =>
                        setCreateFormData({
                          ...createFormData,
                          institution: e.target.value as "MI" | "MTs" | "TPQ",
                        })
                      }
                      className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                    >
                      <option value="MI">MI Miftahul Ulum (Aktif)</option>
                      <option value="MTs">MTs Miftahul Ulum (Persiapan)</option>
                      <option value="TPQ">TPQ Al-Qur&apos;an Sidogiri</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Jabatan / Amanah *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pengajar Fiqih &amp; Diniyah"
                    value={createFormData.role}
                    onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Bidang Keahlian / Spesialisasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Fathul Qorib, Nahwu, Metode Tartil"
                    value={createFormData.specialization}
                    onChange={(e) => setCreateFormData({ ...createFormData, specialization: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">No. WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="Contoh: 0812-3456-7890"
                      value={createFormData.phone}
                      onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">Tahun Bergabung</label>
                    <input
                      type="number"
                      value={createFormData.joinedYear}
                      onChange={(e) => setCreateFormData({ ...createFormData, joinedYear: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="shrink-0 p-3.5 sm:p-4 border-t border-border/40 flex items-center justify-end gap-3 bg-background/50 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white font-bold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {createSubmitting ? "Menyimpan..." : "Simpan Asatidz"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EDIT GENERAL PROFILE                                            */}
      {/* ========================================================================= */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[88dvh] sm:max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl sm:rounded-[28px] liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="shrink-0 p-4 sm:p-5 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">Edit Profil Asatidz</h3>
                <p className="text-xs text-muted-foreground">Perbarui data umum guru/asatidz.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="p-1.5 rounded-full liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateTeacher} className="flex flex-col flex-1 min-h-0 text-xs">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Nama Lengkap &amp; Gelar *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">NIP *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.nip}
                      onChange={(e) => setEditFormData({ ...editFormData, nip: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">Status Keaktifan *</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, status: e.target.value as "AKTIF" | "CUTI" })
                      }
                      className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                    >
                      <option value="AKTIF">AKTIF</option>
                      <option value="CUTI">CUTI</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">Unit Utama *</label>
                    <select
                      value={editFormData.institution}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          institution: e.target.value as "MI" | "MTs" | "TPQ",
                        })
                      }
                      className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                    >
                      <option value="MI">MI Miftahul Ulum (Aktif)</option>
                      <option value="MTs">MTs Miftahul Ulum (Persiapan)</option>
                      <option value="TPQ">TPQ Al-Qur&apos;an Sidogiri</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">Jabatan / Peran *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">Bidang Keahlian / Spesialisasi</label>
                  <input
                    type="text"
                    value={editFormData.specialization}
                    onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-foreground mb-1">No. WhatsApp</label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-foreground mb-1">Tahun Bergabung</label>
                    <input
                      type="number"
                      value={editFormData.joinedYear}
                      onChange={(e) => setEditFormData({ ...editFormData, joinedYear: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl liquid-glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="shrink-0 p-3.5 sm:p-4 border-t border-border/40 flex items-center justify-end gap-3 bg-background/50 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 rounded-xl liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white font-bold shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {editSubmitting ? "Menyimpan..." : "Perbarui Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
