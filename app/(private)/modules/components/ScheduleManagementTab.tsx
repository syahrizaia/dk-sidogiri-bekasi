"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Edit3,
  Trash2,
  MapPin,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Sparkles,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Building2,
  Check,
  Filter
} from "lucide-react";
import {
  getSchedulesByUnitAction,
  createScheduleAction,
  updateScheduleAction,
  deleteScheduleAction,
  ScheduleRecord,
} from "@/lib/actions/schedules";
import { getSubjectsByUnitAction, SubjectRecord } from "@/lib/actions/subjects";
import { TeacherRecord } from "@/lib/actions/teachers";

interface ScheduleManagementTabProps {
  unitSlug: "mi" | "mts" | "tpq";
  unitName: string;
  teachers: TeacherRecord[];
  facilities?: string[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

const DAYS_OF_WEEK = ["Sabtu", "Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

export function ScheduleManagementTab({
  unitSlug,
  unitName,
  teachers,
  facilities = [],
  canCreate,
  canUpdate,
  canDelete,
}: ScheduleManagementTabProps) {
  const unitCode: "MI" | "MTs" | "TPQ" =
    unitSlug === "mi" ? "MI" : unitSlug === "mts" ? "MTs" : "TPQ";

  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("Semua");
  const [selectedActivity, setSelectedActivity] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Action States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleRecord | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<ScheduleRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    day: "Sabtu",
    startTime: "07:30",
    endTime: "09:00",
    activityType: "Ta'lim Kitab",
    grade: unitCode === "TPQ" ? "Jilid 1-6" : unitCode === "MTs" ? "Kelas 7-9" : "Kelas 4-6",
    room: "Majelis Tarbiyah",
    subjectId: "",
    subjectName: "",
    teacherId: "",
    notes: "",
    status: "Active" as "Active" | "Cancelled" | "Rescheduled",
  });

  const showToast = useCallback((text: string, type: "success" | "error") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [schedRes, subjRes] = await Promise.all([
        getSchedulesByUnitAction(unitCode),
        getSubjectsByUnitAction(unitCode),
      ]);

      if (schedRes.success && schedRes.data) {
        setSchedules(schedRes.data);
      } else {
        showToast(schedRes.error || "Gagal memuat jadwal.", "error");
      }

      if (subjRes.success && subjRes.data) {
        setSubjects(subjRes.data);
      }
    } catch (err) {
      console.error("Error loading schedules:", err);
      showToast("Terjadi kendala saat memuat data jadwal.", "error");
    } finally {
      setLoading(false);
    }
  }, [unitCode, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Activity filter options
  const activityTypes = [
    "Semua",
    "Ta'lim Kitab",
    "KBM",
    "Tahfidz / Tadarus",
    "Praktik Ibadah",
  ];

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchDay = selectedDay === "Semua" || s.day === selectedDay;
      const matchActivity =
        selectedActivity === "Semua" || s.activityType === selectedActivity;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        query === "" ||
        (s.subjectName && s.subjectName.toLowerCase().includes(query)) ||
        (s.teacherName && s.teacherName.toLowerCase().includes(query)) ||
        (s.room && s.room.toLowerCase().includes(query)) ||
        (s.notes && s.notes.toLowerCase().includes(query)) ||
        (s.grade && s.grade.toLowerCase().includes(query));

      return matchDay && matchActivity && matchSearch;
    });
  }, [schedules, selectedDay, selectedActivity, searchQuery]);

  // Grouped by Day for presentation
  const groupedByDay = useMemo(() => {
    const groups: Record<string, ScheduleRecord[]> = {};
    for (const d of DAYS_OF_WEEK) {
      const dayItems = filteredSchedules.filter((s) => s.day === d);
      if (dayItems.length > 0) {
        groups[d] = dayItems;
      }
    }
    return groups;
  }, [filteredSchedules]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = schedules.length;
    const talim = schedules.filter((s) => s.activityType === "Ta'lim Kitab").length;
    const kbm = schedules.filter((s) => s.activityType === "KBM").length;
    const tahfidz = schedules.filter(
      (s) => s.activityType === "Tahfidz / Tadarus" || s.activityType === "Praktik Ibadah"
    ).length;

    return { total, talim, kbm, tahfidz };
  }, [schedules]);

  const handleOpenAddModal = () => {
    const defaultSubject = subjects[0];
    const defaultTeacher = teachers[0];
    setFormData({
      day: selectedDay !== "Semua" ? selectedDay : "Sabtu",
      startTime: "07:30",
      endTime: "09:00",
      activityType: "Ta'lim Kitab",
      grade: unitCode === "TPQ" ? "Jilid 1-6" : unitCode === "MTs" ? "Kelas 7-9" : "Kelas 4-6",
      room: "Majelis Tarbiyah",
      subjectId: defaultSubject?._id?.toString() || defaultSubject?.id || "",
      subjectName: defaultSubject?.name || "",
      teacherId: defaultTeacher?._id?.toString() || defaultTeacher?.id || "",
      notes: "Metode Sorogan & Bandongan",
      status: "Active",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (schedule: ScheduleRecord) => {
    setEditingSchedule(schedule);
    setFormData({
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      activityType: schedule.activityType,
      grade: schedule.grade || "",
      room: schedule.room || "",
      subjectId: schedule.subjectId || "",
      subjectName: schedule.subjectName || "",
      teacherId: schedule.teacherId || "",
      notes: schedule.notes || "",
      status: schedule.status || "Active",
    });
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.day || !formData.startTime || !formData.endTime) {
      showToast("Hari, jam mulai, dan jam selesai wajib diisi.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedSubject = subjects.find(
        (s) => (s._id?.toString() || s.id) === formData.subjectId
      );
      const selectedTeacher = teachers.find(
        (t) => (t._id?.toString() || t.id) === formData.teacherId
      );

      const res = await createScheduleAction({
        unit: unitCode,
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        activityType: formData.activityType,
        grade: formData.grade.trim(),
        room: formData.room.trim(),
        subjectId: formData.subjectId,
        subjectName: selectedSubject?.name || formData.subjectName || "Kajian Terpadu",
        teacherId: formData.teacherId,
        teacherName: selectedTeacher?.name || "",
        notes: formData.notes.trim(),
        status: formData.status,
      });

      if (res.success) {
        showToast("Jadwal kegiatan berhasil ditambahkan!", "success");
        setIsAddModalOpen(false);
        loadData();
      } else {
        showToast(res.error || "Gagal menambahkan jadwal.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan sistem saat menyimpan jadwal.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    const schedId = editingSchedule.id || editingSchedule._id;
    if (!schedId) {
      showToast("ID jadwal tidak valid.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedSubject = subjects.find(
        (s) => (s._id?.toString() || s.id) === formData.subjectId
      );
      const selectedTeacher = teachers.find(
        (t) => (t._id?.toString() || t.id) === formData.teacherId
      );

      const res = await updateScheduleAction(schedId, {
        unit: unitCode,
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        activityType: formData.activityType,
        grade: formData.grade.trim(),
        room: formData.room.trim(),
        subjectId: formData.subjectId,
        subjectName: selectedSubject?.name || formData.subjectName,
        teacherId: formData.teacherId,
        teacherName: selectedTeacher?.name || "",
        notes: formData.notes.trim(),
        status: formData.status,
      });

      if (res.success) {
        showToast("Jadwal kegiatan berhasil diperbarui!", "success");
        setEditingSchedule(null);
        loadData();
      } else {
        showToast(res.error || "Gagal memperbarui jadwal.", "error");
      }
    } catch {
      showToast("Terjadi kendala saat memperbarui jadwal.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSchedule) return;

    const schedId = deletingSchedule.id || deletingSchedule._id;
    if (!schedId) return;

    setIsSubmitting(true);
    try {
      const res = await deleteScheduleAction(schedId, unitCode);
      if (res.success) {
        showToast("Jadwal berhasil dihapus.", "success");
        setDeletingSchedule(null);
        loadData();
      } else {
        showToast(res.error || "Gagal menghapus jadwal.", "error");
      }
    } catch {
      showToast("Terjadi kendala saat menghapus jadwal.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActivityBadgeClass = (type: string) => {
    switch (type) {
      case "Ta'lim Kitab":
        return "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";
      case "KBM":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
      case "Tahfidz / Tadarus":
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

      {/* Header Banner */}
      <div className="rounded-3xl liquid-glass-elevated p-5 sm:p-6 border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-md">
              <Calendar size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                  Manajemen Jadwal Dinamis Terjadwal
                </span>
                <span className="opacity-40">•</span>
                <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                  Unit {unitCode}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground mt-0.5">
                Jadwal Harian KBM, Halaqah Kitab Kuning & Sesi Tarbiyah
              </h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                Pengaturan agenda pembelajaran santri per hari, jam belajar aktif, lokasi majelis/ruang kelas, serta penugasan dewan asatidz pengampu yang tersimpan secara dinamis di MongoDB Atlas.
              </p>
            </div>
          </div>

          {canCreate && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              id="btn-add-schedule"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/25 transition-all cursor-pointer shrink-0 self-start md:self-center"
            >
              <Plus size={16} />
              <span>Tambah Jadwal Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl liquid-glass border border-white/60 dark:border-white/10 text-center">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
            Total Sesi Terjadwal
          </span>
          <span className="text-xl sm:text-2xl font-black text-foreground mt-1 block">
            {metrics.total}
          </span>
          <span className="text-[10px] text-muted-foreground">Sesi / Pekan</span>
        </div>

        <div className="p-4 rounded-3xl liquid-glass border border-indigo-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider block">
            Halaqah Ta&apos;lim Kitab
          </span>
          <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
            {metrics.talim}
          </span>
          <span className="text-[10px] text-muted-foreground">Kajian Turats Salaf</span>
        </div>

        <div className="p-4 rounded-3xl liquid-glass border border-emerald-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">
            KBM Formal & Umum
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {metrics.kbm}
          </span>
          <span className="text-[10px] text-muted-foreground">Ruang Kelas Formal</span>
        </div>

        <div className="p-4 rounded-3xl liquid-glass border border-amber-500/20 text-center">
          <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider block">
            Tahfidz & Praktik
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
            {metrics.tahfidz}
          </span>
          <span className="text-[10px] text-muted-foreground">Musholla & Halaqah</span>
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
            id="schedule-search-input"
            placeholder="Cari mapel, asatidz, ruang, atau metode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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

        {/* Activity Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {activityTypes.map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => setSelectedActivity(act)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                selectedActivity === act
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold"
                  : "liquid-glass border border-white/60 dark:border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Day Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-border/40 py-2">
        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 shrink-0 mr-1">
          <Filter size={13} />
          <span>Hari:</span>
        </span>
        <button
          type="button"
          onClick={() => setSelectedDay("Semua")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            selectedDay === "Semua"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold"
              : "liquid-glass border border-white/60 dark:border-white/10 text-muted-foreground hover:text-foreground"
          }`}
        >
          Semua Hari ({schedules.length})
        </button>
        {DAYS_OF_WEEK.map((d) => {
          const count = schedules.filter((s) => s.day === d).length;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDay(d)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                selectedDay === d
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold"
                  : "liquid-glass border border-white/60 dark:border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {d} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Grid: Schedule List + Facilities Penunjang */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-8 h-8 mx-auto text-amber-600 animate-spin mb-3" />
              <p className="text-xs text-muted-foreground font-mono">
                Sinkronisasi data jadwal {unitCode} dari MongoDB Atlas...
              </p>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="p-12 text-center rounded-3xl liquid-glass border border-dashed border-border/60">
              <Calendar className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <h3 className="text-sm font-bold text-foreground">
                Tidak ada jadwal yang sesuai kriteria pencarian
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Coba sesuaikan kata kunci pencarian atau ubah filter hari dan aktivitas.
              </p>
            </div>
          ) : selectedDay === "Semua" ? (
            // Grouped by Day
            Object.entries(groupedByDay).map(([dayName, daySchedules]) => (
              <div key={dayName} className="space-y-3">
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h3 className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground">
                    Hari {dayName} ({daySchedules.length} Sesi)
                  </h3>
                  <div className="h-px flex-1 bg-border/40" />
                </div>

                <div className="space-y-3">
                  {daySchedules.map((item) => (
                    <ScheduleCard
                      key={item.id || item._id}
                      item={item}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      onEdit={handleOpenEditModal}
                      onDelete={setDeletingSchedule}
                      badgeClass={getActivityBadgeClass(item.activityType)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Flat list for selected single day
            <div className="space-y-3">
              {filteredSchedules.map((item) => (
                <ScheduleCard
                  key={item.id || item._id}
                  item={item}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  onEdit={handleOpenEditModal}
                  onDelete={setDeletingSchedule}
                  badgeClass={getActivityBadgeClass(item.activityType)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Facilities & Operational Guidelines */}
        <div className="space-y-5">
          {/* Facilities Card */}
          <div className="rounded-3xl liquid-glass-elevated p-5 border border-white/60 dark:border-white/10 shadow-lg space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 font-bold">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-foreground">
                  Sarana & Ruang Belajar
                </h3>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Kompleks Darul Khidmah
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {facilities.length > 0 ? (
                facilities.map((fac, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-2xl liquid-glass border border-border/40"
                  >
                    <CheckCircle2
                      size={14}
                      className="text-emerald-600 shrink-0 mt-0.5"
                    />
                    <span className="font-medium text-foreground">{fac}</span>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-xs italic">
                  Belum ada daftar fasilitas terdata.
                </div>
              )}
            </div>
          </div>

          {/* Guidelines Card */}
          <div className="rounded-3xl liquid-glass p-5 border border-amber-500/20 bg-amber-500/5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
              <Sparkles size={16} />
              <span>Standar Disiplin Ta&apos;lim Sidogiri</span>
            </div>
            <ul className="space-y-2 text-muted-foreground leading-relaxed list-disc list-inside">
              <li>
                Santri wajib hadir di majelis/ruang belajar 10 menit sebelum waktu KBM dimulai.
              </li>
              <li>
                Kitab turats wajib dibawa dengan makna gandul Pegon Jawa yang rapi dan mutqin.
              </li>
              <li>
                Sesi sorogan hafalan Al-Qur&apos;an & nadzom dilaksanakan langsung di hadapan asatidz.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ADD / EDIT SCHEDULE MODAL */}
      {(isAddModalOpen || editingSchedule) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="shrink-0 p-5 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">
                    {editingSchedule ? "Perbarui Data Jadwal" : "Tambah Jadwal Kegiatan Baru"}
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
                  setEditingSchedule(null);
                }}
                className="p-1.5 rounded-xl hover:bg-white/20 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form
              id="schedule-form"
              onSubmit={editingSchedule ? handleSaveEdit : handleSaveAdd}
              className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Hari *</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Jam Mulai (WIB) *</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Jam Selesai (WIB) *</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Jenis Kegiatan</label>
                  <select
                    value={formData.activityType}
                    onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="Ta'lim Kitab">Ta&apos;lim Kitab (Turats Salaf)</option>
                    <option value="KBM">KBM (Kurikulum Formal)</option>
                    <option value="Tahfidz / Tadarus">Tahfidz / Tadarus Al-Qur&apos;an</option>
                    <option value="Praktik Ibadah">Praktik Ibadah & Do&apos;a</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Tautan Mata Pelajaran / Kitab</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => {
                      const selSub = subjects.find(
                        (s) => (s._id?.toString() || s.id) === e.target.value
                      );
                      setFormData({
                        ...formData,
                        subjectId: e.target.value,
                        subjectName: selSub?.name || formData.subjectName,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="">-- Pilih Mata Pelajaran --</option>
                    {subjects.map((sub) => {
                      const subId = sub._id?.toString() || sub.id || "";
                      return (
                        <option key={subId} value={subId}>
                          {sub.code} - {sub.name} {sub.kitabName ? `(${sub.kitabName})` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Nama Kegiatan / Pelajaran *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Fiqih Ibadah (Fathul Qorib)"
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Dewan Asatidz Pengampu</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="">-- Pilih Asatidz / Pengampu --</option>
                    {teachers.map((t) => {
                      const tId = t._id?.toString() || t.id || "";
                      return (
                        <option key={tId} value={tId}>
                          {t.name} ({t.nip}) - {t.specialization}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Lokasi / Ruang Kelas</label>
                  <input
                    type="text"
                    placeholder="Contoh: Majelis Tarbiyah"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Tingkat / Sasaran Santri</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kelas 5-6"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Status Pelaksanaan</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "Active" | "Cancelled" | "Rescheduled",
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="Active">Aktif Berjalan</option>
                    <option value="Rescheduled">Dijadwal Ulang</option>
                    <option value="Cancelled">Diliburkan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">
                  Catatan Pembelajaran & Metode
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Metode Bandongan, Membaca Murad Gandul, Setoran Hafalan"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </form>

            {/* Pinned Modal Footer */}
            <div className="shrink-0 p-4 border-t border-border/40 flex items-center justify-end gap-3 bg-background/50 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSchedule(null);
                }}
                className="px-4 py-2 rounded-2xl liquid-glass border border-border/60 text-xs font-semibold hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="submit"
                form="schedule-form"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>{editingSchedule ? "Simpan Perubahan" : "Tambahkan ke Jadwal"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl liquid-glass-elevated border border-red-500/40 shadow-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="text-base font-extrabold text-foreground">
              Hapus Sesi Jadwal?
            </h3>
            <p className="text-xs text-muted-foreground mt-2">
              Apakah Anda yakin ingin menghapus jadwal{" "}
              <span className="font-bold text-foreground">
                {deletingSchedule.day} ({deletingSchedule.startTime} - {deletingSchedule.endTime}) :{" "}
                {deletingSchedule.subjectName}
              </span>{" "}
              pada unit {unitCode}? Data yang dihapus tidak dapat dipulihkan.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingSchedule(null)}
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

// Subcomponent: Schedule Card
interface ScheduleCardProps {
  item: ScheduleRecord;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (item: ScheduleRecord) => void;
  onDelete: (item: ScheduleRecord) => void;
  badgeClass: string;
}

function ScheduleCard({
  item,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
  badgeClass,
}: ScheduleCardProps) {
  return (
    <div className="rounded-3xl liquid-glass-elevated p-4 sm:p-5 border border-white/60 dark:border-white/10 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-500/40 transition-all group">
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 flex-shrink-0 font-bold group-hover:bg-amber-600 group-hover:text-white transition-colors">
          <Calendar size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-foreground">
              {item.day}
            </span>
            <span className="opacity-30">•</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
              {item.activityType}
            </span>
            {item.grade && (
              <span className="text-[10px] text-muted-foreground font-semibold">
                {item.grade}
              </span>
            )}
          </div>

          <h4 className="text-sm sm:text-base font-extrabold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors break-words">
            {item.subjectName}
          </h4>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-muted-foreground">
            {item.teacherName && (
              <span className="inline-flex items-center gap-1 text-foreground font-medium truncate max-w-[200px]">
                <UserCheck size={12} className="text-teal-600 shrink-0" />
                <span>{item.teacherName}</span>
              </span>
            )}

            {item.room && (
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin size={12} className="text-emerald-600 shrink-0" />
                <span>{item.room}</span>
              </span>
            )}

            {item.notes && (
              <span className="inline-flex items-center gap-1 italic text-muted-foreground">
                <span>Metode: {item.notes}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/30">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold font-mono">
          <Clock size={13} className="text-amber-600 shrink-0" />
          <span>
            {item.startTime} - {item.endTime}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {canUpdate && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              id={`btn-edit-schedule-${item.id || item._id}`}
              className="p-1.5 rounded-xl hover:bg-white/40 dark:hover:bg-white/10 text-muted-foreground hover:text-amber-600 transition-colors cursor-pointer"
              title="Perbarui Jadwal"
            >
              <Edit3 size={14} />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(item)}
              id={`btn-delete-schedule-${item.id || item._id}`}
              className="p-1.5 rounded-xl hover:bg-red-500/15 text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
              title="Hapus Jadwal"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
