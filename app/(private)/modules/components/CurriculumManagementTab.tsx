"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Edit3,
  Trash2,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Sparkles,
  BookMarked,
  Filter,
  GraduationCap,
  Calendar,
  RefreshCw,
  Eye,
  Check
} from "lucide-react";
import {
  getSubjectsByUnitAction,
  createSubjectAction,
  updateSubjectAction,
  deleteSubjectAction,
  SubjectRecord,
} from "@/lib/actions/subjects";
import { TeacherRecord } from "@/lib/actions/teachers";

interface CurriculumManagementTabProps {
  unitSlug: "mi" | "mts" | "tpq";
  unitName: string;
  teachers: TeacherRecord[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export function CurriculumManagementTab({
  unitSlug,
  unitName,
  teachers,
  canCreate,
  canUpdate,
  canDelete,
}: CurriculumManagementTabProps) {
  const unitCode: "MI" | "MTs" | "TPQ" =
    unitSlug === "mi" ? "MI" : unitSlug === "mts" ? "MTs" : "TPQ";

  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Active" | "Inactive">("ALL");

  // Modals & Action States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectRecord | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<SubjectRecord | null>(null);
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<SubjectRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "Kitab Kuning / Diniyah",
    kitabName: "",
    grade: "",
    semester: "Semua" as "Ganjil" | "Genap" | "Semua",
    teacherId: "",
    weeklyHours: 3,
    description: "",
    status: "Active" as "Active" | "Inactive",
  });

  const showToast = useCallback((text: string, type: "success" | "error") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const loadSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSubjectsByUnitAction(unitCode);
      if (res.success && res.data) {
        setSubjects(res.data);
      } else {
        showToast(res.error || "Gagal memuat mata pelajaran & kitab kuning.", "error");
      }
    } catch (err) {
      console.error("Error loading subjects:", err);
      showToast("Terjadi kendala saat memuat data kurikulum.", "error");
    } finally {
      setLoading(false);
    }
  }, [unitCode, showToast]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  // Categories available for current unit
  const categories = useMemo(() => {
    return [
      "Semua",
      "Kitab Kuning / Diniyah",
      "Kurikulum Nasional",
      "Tahfidz & Al-Quran",
      "Muatan Lokal",
    ];
  }, []);

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchCategory =
        selectedCategory === "Semua" || s.category === selectedCategory;
      const matchStatus =
        statusFilter === "ALL" || s.status === statusFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        query === "" ||
        s.code.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query) ||
        s.kitabName.toLowerCase().includes(query) ||
        s.grade.toLowerCase().includes(query) ||
        (s.teacherName && s.teacherName.toLowerCase().includes(query));

      return matchCategory && matchStatus && matchSearch;
    });
  }, [subjects, selectedCategory, statusFilter, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = subjects.length;
    const turats = subjects.filter((s) => s.category === "Kitab Kuning / Diniyah").length;
    const nasional = subjects.filter((s) => s.category === "Kurikulum Nasional").length;
    const tahfidz = subjects.filter((s) => s.category === "Tahfidz & Al-Quran").length;
    const totalHours = subjects.reduce((sum, s) => sum + (s.weeklyHours || 0), 0);

    return { total, turats, nasional, tahfidz, totalHours };
  }, [subjects]);

  const handleOpenAddModal = () => {
    setFormData({
      code: `${unitCode}-${selectedCategory === "Kitab Kuning / Diniyah" ? "DIN" : "MAP"}-${String(
        subjects.length + 1
      ).padStart(2, "0")}`,
      name: "",
      category: "Kitab Kuning / Diniyah",
      kitabName: "",
      grade: unitCode === "TPQ" ? "Jilid 1-6" : unitCode === "MTs" ? "Kelas 7-9" : "Kelas 4-6",
      semester: "Semua",
      teacherId: teachers[0]?._id?.toString() || teachers[0]?.id || "",
      weeklyHours: 3,
      description: "",
      status: "Active",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (subject: SubjectRecord) => {
    setEditingSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      category: subject.category,
      kitabName: subject.kitabName || "",
      grade: subject.grade || "",
      semester: subject.semester || "Semua",
      teacherId: subject.teacherId || "",
      weeklyHours: subject.weeklyHours || 3,
      description: subject.description || "",
      status: subject.status || "Active",
    });
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      showToast("Kode dan nama mata pelajaran wajib diisi.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedTeacher = teachers.find(
        (t) => (t._id?.toString() || t.id) === formData.teacherId
      );
      const res = await createSubjectAction({
        unit: unitCode,
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category,
        kitabName: formData.kitabName.trim(),
        grade: formData.grade.trim(),
        semester: formData.semester,
        teacherId: formData.teacherId,
        teacherName: selectedTeacher?.name || "",
        weeklyHours: Number(formData.weeklyHours),
        description: formData.description.trim(),
        status: formData.status,
      });

      if (res.success) {
        showToast("Mata pelajaran / kitab kuning berhasil ditambahkan!", "success");
        setIsAddModalOpen(false);
        loadSubjects();
      } else {
        showToast(res.error || "Gagal menambahkan mata pelajaran.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan sistem saat menyimpan data.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    const subId = editingSubject.id || editingSubject._id;
    if (!subId) {
      showToast("ID mata pelajaran tidak valid.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedTeacher = teachers.find(
        (t) => (t._id?.toString() || t.id) === formData.teacherId
      );
      const res = await updateSubjectAction(subId, {
        unit: unitCode,
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category,
        kitabName: formData.kitabName.trim(),
        grade: formData.grade.trim(),
        semester: formData.semester,
        teacherId: formData.teacherId,
        teacherName: selectedTeacher?.name || "",
        weeklyHours: Number(formData.weeklyHours),
        description: formData.description.trim(),
        status: formData.status,
      });

      if (res.success) {
        showToast("Mata pelajaran berhasil diperbarui!", "success");
        setEditingSubject(null);
        loadSubjects();
      } else {
        showToast(res.error || "Gagal memperbarui mata pelajaran.", "error");
      }
    } catch {
      showToast("Terjadi kendala saat memperbarui data.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSubject) return;

    const subId = deletingSubject.id || deletingSubject._id;
    if (!subId) return;

    setIsSubmitting(true);
    try {
      const res = await deleteSubjectAction(subId, unitCode);
      if (res.success) {
        showToast("Mata pelajaran berhasil dihapus dari kurikulum.", "success");
        setDeletingSubject(null);
        loadSubjects();
      } else {
        showToast(res.error || "Gagal menghapus mata pelajaran.", "error");
      }
    } catch {
      showToast("Terjadi kendala saat menghapus data.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Kitab Kuning / Diniyah":
        return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";
      case "Kurikulum Nasional":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
      case "Tahfidz & Al-Quran":
        return "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30";
      default:
        return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl liquid-glass-elevated border shadow-2xl animate-in slide-in-from-bottom-5">
          {toastMessage.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-500 shrink-0" />
          )}
          <span className="text-xs font-semibold text-foreground">
            {toastMessage.text}
          </span>
        </div>
      )}

      {/* Header Info & Sidogiri Methodology Note */}
      <div className="rounded-3xl liquid-glass-elevated p-5 sm:p-6 border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-md">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                  Sistem Kurikulum Dinamis Terintegrasi
                </span>
                <span className="opacity-40">•</span>
                <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                  Unit {unitCode}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground mt-0.5">
                Khazanah Turats & Kurikulum Standar Pondok Pesantren Sidogiri Pasuruan
              </h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                Pengaturan terpusat seluruh mata pelajaran, materi kitab kuning (metode sorogan & bandongan gandul Pegon Jawa), integrasi Kurikulum Merdeka Kemendikbudristek, serta target capaian santri yang tersimpan dinamis di MongoDB Atlas.
              </p>
            </div>
          </div>

          {canCreate && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              id="btn-add-subject"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer shrink-0 self-start md:self-center"
            >
              <Plus size={16} />
              <span>Tambah Mata Pelajaran / Kitab</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl liquid-glass border border-white/60 dark:border-white/10 text-center">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Total Mata Pelajaran
          </span>
          <span className="text-xl sm:text-2xl font-black text-foreground mt-1 block">
            {metrics.total}
          </span>
          <span className="text-[10px] text-muted-foreground">Aktif & Terdaftar</span>
        </div>

        <div className="p-4 rounded-3xl liquid-glass border border-indigo-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider block">
            Kitab Kuning / Turats
          </span>
          <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
            {metrics.turats}
          </span>
          <span className="text-[10px] text-muted-foreground">Kajian Salaf</span>
        </div>

        <div className="p-4 rounded-3xl liquid-glass border border-emerald-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">
            Kurikulum Nasional
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {metrics.nasional}
          </span>
          <span className="text-[10px] text-muted-foreground">Kemendikbud/Kemenag</span>
        </div>

        <div className="p-4 rounded-3xl liquid-glass border border-amber-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider block">
            Alokasi Jam / Minggu
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
            {metrics.totalHours} <span className="text-xs font-semibold text-muted-foreground">JP</span>
          </span>
          <span className="text-[10px] text-muted-foreground">Total Beban Belajar</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            type="text"
            id="subject-search-input"
            placeholder="Cari kode mapel, nama kitab, mu'allif, atau guru..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                  : "liquid-glass border border-white/60 dark:border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List / Grid of Subjects */}
      {loading ? (
        <div className="py-16 text-center">
          <RefreshCw className="w-8 h-8 mx-auto text-indigo-600 animate-spin mb-3" />
          <p className="text-xs text-muted-foreground font-mono">
            Memuat data kurikulum {unitCode} dari MongoDB Atlas...
          </p>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="p-12 text-center rounded-3xl liquid-glass border border-dashed border-border/60">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <h3 className="text-sm font-bold text-foreground">
            Tidak ada mata pelajaran yang sesuai kriteria pencarian
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau ubah filter kategori di atas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((sub) => {
            const subId = sub.id || sub._id || "";
            return (
              <div
                key={subId || sub.code}
                className="rounded-3xl liquid-glass-elevated p-5 border border-white/60 dark:border-white/10 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-indigo-500/40 transition-all"
              >
                <div>
                  {/* Top Bar: Code, Category, Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-foreground/5 border border-foreground/10 text-foreground">
                      {sub.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(
                          sub.category
                        )}`}
                      >
                        {sub.category}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          sub.status === "Active" ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                        title={sub.status === "Active" ? "Aktif Diajarkan" : "Tidak Aktif"}
                      />
                    </div>
                  </div>

                  {/* Subject Name */}
                  <h3 className="text-base font-extrabold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {sub.name}
                  </h3>

                  {/* Kitab & Mu'allif if available */}
                  {sub.kitabName && (
                    <div className="mt-2 flex items-start gap-2 p-2.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 text-xs text-foreground">
                      <BookMarked size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block">
                          Kitab Rujukan & Mu&apos;allif
                        </span>
                        <span className="font-semibold italic text-foreground block truncate">
                          {sub.kitabName}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Grade, Hours & Teacher Meta */}
                  <div className="mt-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap size={13} className="text-indigo-600" />
                        <span>Tingkat:</span>
                      </span>
                      <span className="font-bold text-foreground">{sub.grade || "-"}</span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-amber-600" />
                        <span>Alokasi Jam:</span>
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {sub.weeklyHours} Jam / Minggu
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <UserCheck size={13} className="text-teal-600" />
                        <span>Asatidz:</span>
                      </span>
                      <span className="font-semibold text-foreground truncate max-w-[170px]" title={sub.teacherName}>
                        {sub.teacherName || "Belum Ditentukan"}
                      </span>
                    </div>
                  </div>

                  {/* Description / Syllabus snippet */}
                  {sub.description && (
                    <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed border-t border-border/30 pt-2.5">
                      {sub.description}
                    </p>
                  )}
                </div>

                {/* Footer Controls: Detail, Edit, Delete */}
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSubjectDetail(sub)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Eye size={12} />
                    <span>Silabus Lengkap</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {canUpdate && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(sub)}
                        id={`btn-edit-subject-${sub.code}`}
                        className="p-1.5 rounded-xl hover:bg-white/40 dark:hover:bg-white/10 text-muted-foreground hover:text-indigo-600 transition-colors cursor-pointer"
                        title="Perbarui Data"
                      >
                        <Edit3 size={14} />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setDeletingSubject(sub)}
                        id={`btn-delete-subject-${sub.code}`}
                        className="p-1.5 rounded-xl hover:bg-red-500/15 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
                        title="Hapus dari Kurikulum"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedSubjectDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedSubjectDetail(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl hover:bg-white/20 text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                {selectedSubjectDetail.code}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Unit {selectedSubjectDetail.unit}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-foreground mb-1">
              {selectedSubjectDetail.name}
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-4">
              {selectedSubjectDetail.category}
            </p>

            <div className="space-y-4 text-xs">
              {selectedSubjectDetail.kitabName && (
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                    Kitab Turats Rujukan
                  </span>
                  <p className="text-sm font-serif font-bold text-foreground">
                    {selectedSubjectDetail.kitabName}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl liquid-glass border border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Tingkat / Jenjang
                  </span>
                  <span className="font-bold text-foreground">{selectedSubjectDetail.grade || "-"}</span>
                </div>
                <div className="p-3 rounded-2xl liquid-glass border border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Semester
                  </span>
                  <span className="font-bold text-foreground">{selectedSubjectDetail.semester}</span>
                </div>
                <div className="p-3 rounded-2xl liquid-glass border border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Alokasi Jam
                  </span>
                  <span className="font-bold text-foreground">
                    {selectedSubjectDetail.weeklyHours} Jam / Minggu
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl liquid-glass border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                  Dewan Asatidz Pengampu
                </span>
                <span className="font-bold text-foreground text-sm block">
                  {selectedSubjectDetail.teacherName || "Belum Ditugaskan"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl liquid-glass border border-border/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">
                  Silabus & Capaian Pembelajaran
                </span>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedSubjectDetail.description || "Belum ada keterangan silabus."}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/40 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSubjectDetail(null)}
                className="px-5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || editingSubject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="shrink-0 p-5 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">
                    {editingSubject
                      ? "Perbarui Data Mata Pelajaran & Kitab"
                      : "Tambah Mata Pelajaran / Kitab Baru"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Unit Pendidikan: <span className="font-bold text-foreground">{unitName} ({unitCode})</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSubject(null);
                }}
                className="p-1.5 rounded-xl hover:bg-white/20 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form
              id="subject-form"
              onSubmit={editingSubject ? handleSaveEdit : handleSaveAdd}
              className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Kode Mapel *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MI-DIN-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-bold text-foreground">Nama Mata Pelajaran *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Fiqih Ibadah"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Kategori Kurikulum</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="Kitab Kuning / Diniyah">Kitab Kuning / Diniyah</option>
                    <option value="Kurikulum Nasional">Kurikulum Nasional</option>
                    <option value="Tahfidz & Al-Quran">Tahfidz & Al-Quran</option>
                    <option value="Muatan Lokal">Muatan Lokal</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">
                    Kitab Turats Rujukan & Mu&apos;allif
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Fathul Qorib - Syaikh Ibn Qasim"
                    value={formData.kitabName}
                    onChange={(e) => setFormData({ ...formData, kitabName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Tingkat / Kelas Target</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kelas 5-6"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        semester: e.target.value as "Ganjil" | "Genap" | "Semua",
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="Semua">Semua Semester</option>
                    <option value="Ganjil">Semester Ganjil</option>
                    <option value="Genap">Semester Genap</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Alokasi Jam / Minggu</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    required
                    value={formData.weeklyHours}
                    onChange={(e) =>
                      setFormData({ ...formData, weeklyHours: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Dewan Asatidz Pengampu</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="">-- Pilih Guru / Asatidz --</option>
                    {teachers.map((t) => {
                      const tId = t._id?.toString() || t.id || "";
                      return (
                        <option key={tId} value={tId}>
                          {t.name} ({t.nip}) - {t.institution}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Status Pembelajaran</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "Active" | "Inactive",
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="Active">Aktif Diajarkan</option>
                    <option value="Inactive">Tidak Aktif / Ditangguhkan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">
                  Deskripsi & Target Capaian Pembelajaran
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan silabus ringkas, target penguasaan bab, metode (sorogan/bandongan), dan target ujian..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed"
                />
              </div>
            </form>

            {/* Pinned Modal Footer */}
            <div className="shrink-0 p-4 border-t border-border/40 flex items-center justify-end gap-3 bg-background/50 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSubject(null);
                }}
                className="px-4 py-2 rounded-2xl liquid-glass border border-border/60 text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="subject-form"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>{editingSubject ? "Simpan Perubahan" : "Tambahkan ke Kurikulum"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl liquid-glass-elevated border border-red-500/40 shadow-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="text-base font-extrabold text-foreground">
              Hapus Mata Pelajaran?
            </h3>
            <p className="text-xs text-muted-foreground mt-2">
              Apakah Anda yakin ingin menghapus{" "}
              <span className="font-bold text-foreground">
                {deletingSubject.name} ({deletingSubject.code})
              </span>{" "}
              dari kurikulum {unitCode}? Data yang dihapus tidak dapat dipulihkan.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingSubject(null)}
                className="px-4 py-2 rounded-2xl liquid-glass border border-border/60 text-xs font-semibold hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 disabled:opacity-50"
              >
                {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
                <span>Ya, Hapus Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
