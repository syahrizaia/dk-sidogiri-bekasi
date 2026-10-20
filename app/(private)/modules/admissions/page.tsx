"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  ArrowLeft,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Download,
  Search,
  FileText,
  Printer,
  Trash2,
  X,
  ShieldCheck,
  Check,
  Building,
  User,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Sparkles,
  BedDouble,
  ExternalLink,
  ChevronRight,
  Filter,
  RefreshCw,
  Copy,
  Sliders,
  Settings,
  Eye,
  Layers,
  Save,
  RotateCcw,
  BookOpen,
  Megaphone,
  Pin,
  Edit3,
  Tag,
} from "lucide-react";
import { exportCorporateCSV } from "@/lib/export-utils";
import { getCurrentUserAction } from "@/lib/actions/auth";
import { getUserPermissionsAction, type UserPermissionsResult } from "@/lib/actions/roles";
import {
  getAdmissionsAction,
  updateAdmissionStatusAction,
  createAdmissionAction,
  deleteAdmissionAction,
  getAdmissionSettingsAction,
  updateAdmissionSettingsAction,
} from "@/lib/actions/admissions";
import {
  defaultAdmissionSettings,
  type AdmissionRecord,
  type AdmissionsOverviewData,
  type AdmissionStatus,
  type PendaftaranPayload,
  type AdmissionSettings,
  type DynamicFormField,
  type FieldInputType,
  type FieldSection,
  type AdmissionAnnouncement,
} from "@/lib/admissions-config";

export default function AdmissionsPage() {
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [userPermissions, setUserPermissions] = useState<UserPermissionsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Tab: "list" (Daftar Pendaftar) | "settings" (Kustomisasi Halaman & Form)
  const [activeTab, setActiveTab] = useState<"list" | "settings">("list");

  // Admissions Data & Stats
  const [overview, setOverview] = useState<AdmissionsOverviewData | null>(null);
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>([]);

  // Admission Settings & Dynamic Form Builder State
  const [settings, setSettings] = useState<AdmissionSettings>(defaultAdmissionSettings);
  const [savingSettings, setSavingSettings] = useState(false);

  // Filters & Pagination for Tab "list"
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenjang, setFilterJenjang] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterStatusMukim, setFilterStatusMukim] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals & Active Records
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [receiptAdmission, setReceiptAdmission] = useState<AdmissionRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal New Custom Field Builder
  const [showNewFieldModal, setShowNewFieldModal] = useState(false);
  const [newFieldData, setNewFieldData] = useState<{
    label: string;
    type: FieldInputType;
    placeholder: string;
    required: boolean;
    section: FieldSection;
    optionsStr: string;
  }>({
    label: "",
    type: "text",
    placeholder: "",
    required: false,
    section: "data_santri",
    optionsStr: "",
  });

  // Modal & Form State for Announcements Builder
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [announcementFormData, setAnnouncementFormData] = useState<{
    title: string;
    content: string;
    category: "info" | "warning" | "success" | "schedule";
    date: string;
    pinned: boolean;
  }>({
    title: "",
    content: "",
    category: "info",
    date: new Date().toISOString().split("T")[0],
    pinned: false,
  });

  // Verification Form State inside Detail Modal
  const [detailStatus, setDetailStatus] = useState<AdmissionStatus>("TERDAFTAR_ONLINE");
  const [detailNotes, setDetailNotes] = useState("");

  // Add Form State (Manual Registration)
  const [addFormData, setAddFormData] = useState<PendaftaranPayload & { statusPendaftaran: AdmissionStatus; catatanAdmin: string }>({
    namaLengkap: "",
    nik: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "Laki-laki",
    namaAyah: "",
    namaIbu: "",
    noWhatsApp: "",
    provinsi: "Jawa Barat",
    kotaKab: "Bekasi",
    alamatLengkap: "",
    konsulat: "Jabodetabek",
    jenjang: "MI",
    statusMukim: "SANTRI",
    catatanKhusus: "",
    statusPendaftaran: "TERDAFTAR_ONLINE",
    catatanAdmin: "",
  });

  const loadData = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      else setRefreshing(true);

      const [user, permsRes, admissionsRes, settingsRes] = await Promise.all([
        getCurrentUserAction(),
        getUserPermissionsAction(),
        getAdmissionsAction(),
        getAdmissionSettingsAction(),
      ]);

      if (user?.role) {
        const norm = user.role.toLowerCase();
        setCurrentUserRole(norm);
        // Strict guard: hanya super_admin, ketua_ranting, dan staf_administrasi
        const allowedRoles = ["super_admin", "ketua_ranting", "staf_administrasi", "admin", "ketua", "staff", "staf"];
        if (!allowedRoles.includes(norm)) {
          router.replace("/modules?error=unauthorized");
          return;
        }
      }

      if (permsRes.success && permsRes.data) {
        setUserPermissions(permsRes.data);
        if (!permsRes.data.permissions.admissions && !permsRes.data.isSuperAdmin) {
          router.replace("/modules?error=unauthorized");
          return;
        }
      }

      if (admissionsRes.success && admissionsRes.data) {
        setOverview(admissionsRes.data);
        setAdmissions(admissionsRes.data.items);
      } else if (admissionsRes.error) {
        setFeedback({ type: "error", message: admissionsRes.error });
      }

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }
    } catch (err) {
      console.error("Gagal memuat data pendaftaran santri baru:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CRUD Permissions
  const canCreate = userPermissions?.isSuperAdmin || Boolean(userPermissions?.crudPermissions?.admissions?.create);
  const canUpdate = userPermissions?.isSuperAdmin || Boolean(userPermissions?.crudPermissions?.admissions?.update);
  const canDelete = userPermissions?.isSuperAdmin || Boolean(userPermissions?.crudPermissions?.admissions?.delete);

  // Filtered & Paginated records
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.namaLengkap.toLowerCase().includes(q) ||
        item.regId.toLowerCase().includes(q) ||
        (item.nik && item.nik.toLowerCase().includes(q)) ||
        (item.namaAyah && item.namaAyah.toLowerCase().includes(q)) ||
        (item.namaIbu && item.namaIbu.toLowerCase().includes(q)) ||
        (item.noWhatsApp && item.noWhatsApp.toLowerCase().includes(q)) ||
        (item.kotaKab && item.kotaKab.toLowerCase().includes(q));

      const matchJenjang = filterJenjang === "ALL" || (item.jenjang && item.jenjang.toUpperCase().includes(filterJenjang));
      const matchStatus = filterStatus === "ALL" || item.statusPendaftaran === filterStatus;
      const matchStatusMukim = filterStatusMukim === "ALL" || (item.statusMukim && item.statusMukim.toUpperCase().includes(filterStatusMukim));

      return matchSearch && matchJenjang && matchStatus && matchStatusMukim;
    });
  }, [admissions, searchQuery, filterJenjang, filterStatus, filterStatusMukim]);

  const totalPages = Math.max(1, Math.ceil(filteredAdmissions.length / itemsPerPage));
  const paginatedAdmissions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAdmissions.slice(start, start + itemsPerPage);
  }, [filteredAdmissions, currentPage, itemsPerPage]);

  // Open Detail Modal
  const handleOpenDetail = (item: AdmissionRecord) => {
    setSelectedAdmission(item);
    setDetailStatus(item.statusPendaftaran);
    setDetailNotes(item.catatanAdmin || "");
    setShowDetailModal(true);
  };

  // Update Status from Detail Modal
  const handleUpdateStatus = async () => {
    if (!selectedAdmission) return;
    try {
      setIsSubmitting(true);
      const res = await updateAdmissionStatusAction(selectedAdmission.id, detailStatus, detailNotes);
      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Status pendaftaran berhasil diperbarui." });
        setShowDetailModal(false);
        loadData(false);
      } else {
        setFeedback({ type: "error", message: res.error || "Gagal memperbarui status berkas." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Terjadi gangguan sistem saat memperbarui status." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Admission Manual
  const handleCreateAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.namaLengkap.trim() || !addFormData.jenjang) {
      alert("Nama lengkap calon santri dan jenjang pendidikan wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createAdmissionAction(addFormData);
      if (res.success && res.data) {
        setShowAddModal(false);
        setFeedback({ type: "success", message: res.message || "Pendaftar baru berhasil ditambahkan." });
        setAddFormData({
          namaLengkap: "",
          nik: "",
          tempatLahir: "",
          tanggalLahir: "",
          jenisKelamin: "Laki-laki",
          namaAyah: "",
          namaIbu: "",
          noWhatsApp: "",
          provinsi: "Jawa Barat",
          kotaKab: "Bekasi",
          alamatLengkap: "",
          konsulat: "Jabodetabek",
          jenjang: "MI",
          statusMukim: "SANTRI",
          catatanKhusus: "",
          statusPendaftaran: "TERDAFTAR_ONLINE",
          catatanAdmin: "",
        });
        loadData(false);
      } else {
        setFeedback({ type: "error", message: res.error || "Gagal menambahkan data calon santri." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Terjadi kesalahan sistem saat menyimpan pendaftaran." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Admission
  const handleDeleteAdmission = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus permanen data pendaftaran calon santri "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const res = await deleteAdmissionAction(id);
      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Data pendaftaran berhasil dihapus." });
        if (showDetailModal) setShowDetailModal(false);
        loadData(false);
      } else {
        setFeedback({ type: "error", message: res.error || "Gagal menghapus pendaftaran." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Terjadi gangguan sistem saat menghapus data." });
    }
  };

  // Save Settings to Database
  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      const res = await updateAdmissionSettingsAction(settings);
      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Pengaturan berhasil disimpan ke database." });
        if (res.data) setSettings(res.data);
      } else {
        setFeedback({ type: "error", message: res.error || "Gagal menyimpan pengaturan." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "Terjadi gangguan sistem saat menyimpan pengaturan." });
    } finally {
      setSavingSettings(false);
    }
  };

  // Toggle dynamic field enabled
  const handleToggleFieldEnabled = (fieldId: string) => {
    setSettings((prev) => ({
      ...prev,
      customFields: prev.customFields.map((f) =>
        f.id === fieldId ? { ...f, enabled: !f.enabled } : f
      ),
    }));
  };

  // Toggle dynamic field required
  const handleToggleFieldRequired = (fieldId: string) => {
    setSettings((prev) => ({
      ...prev,
      customFields: prev.customFields.map((f) =>
        f.id === fieldId ? { ...f, required: !f.required } : f
      ),
    }));
  };

  // Add new dynamic custom field
  const handleAddNewCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldData.label.trim()) return;

    const baseId = newFieldData.label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 30);
    const uniqueId = `field_${baseId}_${Date.now().toString().slice(-4)}`;

    const newField: DynamicFormField = {
      id: uniqueId,
      label: newFieldData.label.trim(),
      type: newFieldData.type,
      placeholder: newFieldData.placeholder.trim() || `Masukkan ${newFieldData.label.toLowerCase()}...`,
      required: newFieldData.required,
      enabled: true,
      options:
        newFieldData.type === "select" && newFieldData.optionsStr
          ? newFieldData.optionsStr.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
      order: settings.customFields.length + 1,
      section: newFieldData.section,
    };

    setSettings((prev) => ({
      ...prev,
      customFields: [...prev.customFields, newField],
    }));

    setShowNewFieldModal(false);
    setNewFieldData({
      label: "",
      type: "text",
      placeholder: "",
      required: false,
      section: "data_santri",
      optionsStr: "",
    });
    setFeedback({ type: "success", message: `Field "${newField.label}" berhasil ditambahkan. Klik 'Simpan Perubahan' untuk mengaktifkannya.` });
  };

  // Remove dynamic custom field
  const handleRemoveCustomField = (fieldId: string) => {
    setSettings((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((f) => f.id !== fieldId),
    }));
  };

  // Reset to default Sidogiri fields
  const handleResetToDefaultFields = () => {
    if (!confirm("Kembalikan seluruh susunan formulir ke standar awal Sidogiri?")) return;
    setSettings((prev) => ({
      ...prev,
      customFields: defaultAdmissionSettings.customFields,
    }));
    setFeedback({ type: "success", message: "Susunan formulir dikembalikan ke standar awal. Jangan lupa klik 'Simpan Perubahan'." });
  };

  // Open Add Announcement Modal
  const handleOpenAddAnnouncement = () => {
    setEditingAnnouncementId(null);
    setAnnouncementFormData({
      title: "",
      content: "",
      category: "info",
      date: new Date().toISOString().split("T")[0],
      pinned: false,
    });
    setShowAnnouncementModal(true);
  };

  // Open Edit Announcement Modal
  const handleOpenEditAnnouncement = (ann: AdmissionAnnouncement) => {
    setEditingAnnouncementId(ann.id);
    setAnnouncementFormData({
      title: ann.title,
      content: ann.content,
      category: ann.category,
      date: ann.date || new Date().toISOString().split("T")[0],
      pinned: !!ann.pinned,
    });
    setShowAnnouncementModal(true);
  };

  // Save Announcement (Add or Edit)
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementFormData.title.trim() || !announcementFormData.content.trim()) {
      setFeedback({ type: "error", message: "Judul dan isi pengumuman wajib diisi." });
      return;
    }

    if (editingAnnouncementId) {
      setSettings((prev) => ({
        ...prev,
        announcements: (prev.announcements || []).map((ann) =>
          ann.id === editingAnnouncementId
            ? { ...ann, ...announcementFormData }
            : ann
        ),
      }));
      setFeedback({ type: "success", message: "Pengumuman berhasil diperbarui. Klik 'Simpan Perubahan' untuk menyimpan ke database." });
    } else {
      const newAnn: AdmissionAnnouncement = {
        id: `ann-${Date.now()}`,
        ...announcementFormData,
      };
      setSettings((prev) => ({
        ...prev,
        announcements: [newAnn, ...(prev.announcements || [])],
      }));
      setFeedback({ type: "success", message: "Pengumuman baru berhasil ditambahkan. Klik 'Simpan Perubahan' untuk mengaktifkannya." });
    }

    setShowAnnouncementModal(false);
  };

  // Delete Announcement
  const handleDeleteAnnouncement = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      announcements: (prev.announcements || []).filter((ann) => ann.id !== id),
    }));
    setFeedback({ type: "success", message: "Pengumuman dihapus dari draft. Klik 'Simpan Perubahan' untuk menyimpan." });
  };

  // Toggle Pin Announcement
  const handleTogglePinAnnouncement = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      announcements: (prev.announcements || []).map((ann) =>
        ann.id === id ? { ...ann, pinned: !ann.pinned } : ann
      ),
    }));
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredAdmissions.length === 0) {
      alert("Tidak ada data pendaftaran untuk diekspor.");
      return;
    }

    exportCorporateCSV({
      filename: "Data_PPDB_Sidogiri_Bekasi",
      title: "Laporan Data Penerimaan Santri Baru (PPDB)",
      subtitle: `Tahun Ajaran ${settings.academicYear} • Madrasah Miftahul Ulum & TPQ Tartil Sidogiri`,
      metadata: {
        "Status Berkas": filterStatus === "ALL" ? "Seluruh Status Pendaftaran" : filterStatus,
        "Jenjang Pilihan": filterJenjang === "ALL" ? "Seluruh Jenjang (MI, MTs, TPQ)" : filterJenjang,
        "Status Mukim": filterStatusMukim === "ALL" ? "Semua (Mukim & Non-Mukim)" : filterStatusMukim,
      },
      columns: [
        { header: "No", accessor: (_, idx) => idx + 1 },
        { header: "Nomor Registrasi", accessor: "regId", isNumericId: true },
        { header: "Nama Lengkap Calon Santri", accessor: "namaLengkap" },
        { header: "Nomor Induk Kependudukan (NIK)", accessor: "nik", isNumericId: true },
        { header: "Tempat Lahir", accessor: (item) => item.tempatLahir || "-" },
        { header: "Tanggal Lahir", accessor: (item) => item.tanggalLahir || "-" },
        { header: "Jenis Kelamin", accessor: (item) => item.jenisKelamin || "-" },
        { header: "Jenjang", accessor: "jenjang" },
        { header: "Status Keberadaan", accessor: "statusMukim" },
        { header: "Nama Ayah", accessor: (item) => item.namaAyah || "-" },
        { header: "Nama Ibu", accessor: (item) => item.namaIbu || "-" },
        { header: "No. WhatsApp Wali", accessor: (item) => item.noWhatsApp || "-", isNumericId: true },
        { header: "Kota / Kabupaten", accessor: (item) => item.kotaKab || "-" },
        { header: "Provinsi", accessor: (item) => item.provinsi || "-" },
        { header: "Alamat Lengkap", accessor: (item) => item.alamatLengkap || "-" },
        { header: "Konsulat Asal", accessor: (item) => item.konsulat || "-" },
        { header: "Asal Sekolah", accessor: (item) => item.asalSekolah || "-" },
        { header: "Status Pendaftaran", accessor: (item) => item.statusPendaftaran.replace(/_/g, " ") },
        { header: "Catatan Khusus", accessor: (item) => item.catatanKhusus || "-" },
        { header: "Catatan Panitia", accessor: (item) => item.catatanAdmin || "-" },
        { header: "Verifikator", accessor: (item) => item.verifiedBy || "-" },
        { header: "Tanggal Daftar", accessor: (item) => item.createdAt ? item.createdAt.split("T")[0] : "-" },
      ],
      data: filteredAdmissions,
    });
  };

  const getStatusBadge = (status: AdmissionStatus) => {
    switch (status) {
      case "TERDAFTAR_ONLINE":
        return {
          label: "Terdaftar Online",
          dotColor: "bg-sky-500",
          className: "bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30",
        };
      case "VERIFIKASI_BERKAS":
        return {
          label: "Verifikasi Berkas",
          dotColor: "bg-amber-500",
          className: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
        };
      case "LULUS_SELEKSI":
        return {
          label: "Lulus Seleksi",
          dotColor: "bg-emerald-500",
          className: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
        };
      case "DITOLAK":
        return {
          label: "Ditolak / Batal",
          dotColor: "bg-rose-500",
          className: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
        };
      default:
        return {
          label: status,
          dotColor: "bg-slate-500",
          className: "bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-500/30",
        };
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setFeedback({ type: "success", message: `ID "${text}" berhasil disalin ke clipboard.` });
  };

  return (
    <div className="w-full transition-colors duration-400 py-6 sm:py-8">
      {/* Outer Constrained Container matching other modules */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8 relative z-10">

        {/* Floating Feedback Alert */}
        {feedback && (
          <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-top-4 duration-300">
            <div
              className={`p-4 rounded-2xl liquid-glass border shadow-xl flex items-start gap-3 ${
                feedback.type === "success"
                  ? "border-emerald-500/40 text-emerald-800 dark:text-emerald-200"
                  : "border-rose-500/40 text-rose-800 dark:text-rose-200"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs font-semibold leading-relaxed">{feedback.message}</div>
              <button
                onClick={() => setFeedback(null)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* NAVIGATION BREADCRUMB & ACCESS PILL                       */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/modules"
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full liquid-glass-pill text-muted-foreground hover:text-foreground transition-all duration-300 w-fit cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Modul Sistem</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Akses Khusus: Super Admin • Ketua Ranting • Staf Administrasi</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* HERO BANNER HEADER (APPLE LIQUID GLASS)                   */}
        {/* ========================================================= */}
        <div className="relative rounded-[32px] overflow-hidden liquid-glass-elevated border border-white/60 dark:border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                  PPDB TA {settings.academicYear}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border ${
                  settings.isOpen
                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                    : "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${settings.isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  <span>{settings.isOpen ? "Pendaftaran Daring Buka" : "Pendaftaran Ditutup"}</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3 font-serif">
                <span>Penerimaan Santri Baru (Admissions)</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Pusat verifikasi berkas pendaftaran santri baru Madrasah Ibtidaiyah (MI), MTs Persiapan, dan TPQ Tartil Al-Qur&apos;an Sidogiri terintegrasi MongoDB Atlas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admissions"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-all cursor-pointer active:scale-95 border border-emerald-500/30"
                title="Buka halaman formulir publik yang diakses wali santri"
              >
                <Eye size={14} />
                <span>Lihat Halaman Publik</span>
                <ExternalLink size={12} className="opacity-70" />
              </Link>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:bg-white/40 transition-all cursor-pointer active:scale-95"
                title="Unduh seluruh data pendaftar sebagai file CSV"
              >
                <Download size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span>Export CSV</span>
              </button>

              {canCreate && (
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg shadow-emerald-900/15 hover:shadow-emerald-700/25 transition-all cursor-pointer active:scale-95"
                >
                  <Plus size={14} className="stroke-[2.5]" />
                  <span>Pendaftar Baru (Manual)</span>
                </button>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* TABS SELECTOR (DAFTAR PENDAFTAR VS KUSTOMISASI FORM)      */}
          {/* ========================================================= */}
          <div className="flex items-center gap-2 pt-2 border-t border-border/30 overflow-x-auto">
            <button
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "list"
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/20"
                  : "liquid-glass hover:bg-white/40 text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              <Users size={15} />
              <span>Daftar Pendaftar Masuk</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "list" ? "bg-white/20 text-white" : "bg-muted text-foreground"
              }`}>
                {overview ? overview.totalApplicants : "..."}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "settings"
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-900/20"
                  : "liquid-glass hover:bg-white/40 text-muted-foreground hover:text-foreground border border-border/40"
              }`}
            >
              <Sliders size={15} />
              <span>Kustomisasi Halaman &amp; Form Dinamis</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                settings.isOpen ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300" : "bg-rose-500/20 text-rose-700"
              }`}>
                {settings.isOpen ? "Buka" : "Tutup"}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: DAFTAR PENDAFTAR (DATA & SELEKSI BERKAS)            */}
        {/* ========================================================= */}
        {activeTab === "list" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* KPI METRIC CARDS (BALANCED RESPONSIVE GRID) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Total Pendaftar */}
              <div className="p-4 rounded-3xl liquid-glass border border-white/60 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Pendaftar
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <Users size={14} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground font-serif">
                  {overview ? overview.totalApplicants : "..."}
                </div>
                <span className="text-[10px] text-muted-foreground">Seluruh jenjang pendidikan</span>
              </div>

              {/* Terdaftar Online */}
              <div className="p-4 rounded-3xl liquid-glass border border-white/60 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-sky-500/40 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Daftar Baru
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-sky-500/15 text-sky-700 dark:text-sky-400 flex items-center justify-center">
                    <Clock size={14} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 font-serif">
                  {overview ? overview.totalOnline : "..."}
                </div>
                <span className="text-[10px] text-muted-foreground">Menunggu tindak lanjut</span>
              </div>

              {/* Verifikasi Berkas */}
              <div className="p-4 rounded-3xl liquid-glass border border-white/60 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Verifikasi Berkas
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <AlertCircle size={14} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-serif">
                  {overview ? overview.totalVerified : "..."}
                </div>
                <span className="text-[10px] text-muted-foreground">Tahap validasi &amp; tes</span>
              </div>

              {/* Lulus Seleksi */}
              <div className="p-4 rounded-3xl liquid-glass border border-white/60 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Lulus Seleksi
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={14} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-serif">
                  {overview ? overview.totalAccepted : "..."}
                </div>
                <span className="text-[10px] text-muted-foreground">Diterima resmi di cabang</span>
              </div>

              {/* Ditolak / Batal */}
              <div className="p-4 rounded-3xl liquid-glass border border-white/60 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-rose-500/40 transition-all col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Ditolak / Batal
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                    <XCircle size={14} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-serif">
                  {overview ? overview.totalRejected : "..."}
                </div>
                <span className="text-[10px] text-muted-foreground">Tidak memenuhi syarat</span>
              </div>
            </div>

            {/* FILTER & SEARCH TOOLBAR */}
            <div className="p-4 sm:p-5 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama santri, No. Registrasi, NIK, wali, kota..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass border border-border/50 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Filter Selects */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Filter Jenjang */}
                  <select
                    value={filterJenjang}
                    onChange={(e) => {
                      setFilterJenjang(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3.5 py-2.5 rounded-2xl liquid-glass border border-border/50 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    <option value="ALL">Semua Jenjang</option>
                    <option value="MI">MI (Ibtidaiyah)</option>
                    <option value="MTs">MTs (Persiapan)</option>
                    <option value="TPQ">TPQ (Tartil Qur&apos;an)</option>
                  </select>

                  {/* Filter Status */}
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3.5 py-2.5 rounded-2xl liquid-glass border border-border/50 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="TERDAFTAR_ONLINE">Terdaftar Online</option>
                    <option value="VERIFIKASI_BERKAS">Verifikasi Berkas</option>
                    <option value="LULUS_SELEKSI">Lulus Seleksi</option>
                    <option value="DITOLAK">Ditolak / Batal</option>
                  </select>

                  {/* Filter Status Mukim */}
                  <select
                    value={filterStatusMukim}
                    onChange={(e) => {
                      setFilterStatusMukim(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3.5 py-2.5 rounded-2xl liquid-glass border border-border/50 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    <option value="ALL">Semua Status Tinggal</option>
                    <option value="SANTRI">Santri Mukim (Asrama)</option>
                    <option value="MURID">Murid Non-Mukim</option>
                  </select>

                  {(searchQuery || filterJenjang !== "ALL" || filterStatus !== "ALL" || filterStatusMukim !== "ALL") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setFilterJenjang("ALL");
                        setFilterStatus("ALL");
                        setFilterStatusMukim("ALL");
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2.5 rounded-2xl liquid-glass border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Reset filter"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Result summary */}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                <span>
                  Menampilkan <strong>{filteredAdmissions.length}</strong> calon santri
                  {filterJenjang !== "ALL" && ` • Jenjang ${filterJenjang}`}
                  {filterStatus !== "ALL" && ` • Status ${filterStatus}`}
                </span>
                <span>
                  Halaman {currentPage} dari {totalPages}
                </span>
              </div>
            </div>

            {/* ADMISSIONS DATA TABLE */}
            <div className="rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/30 font-semibold text-muted-foreground text-[11px] tracking-wider uppercase">
                      <th className="py-3.5 px-4">No. Registrasi</th>
                      <th className="py-3.5 px-4">Calon Santri</th>
                      <th className="py-3.5 px-4">Jenjang &amp; Tinggal</th>
                      <th className="py-3.5 px-4">Orang Tua / Kontak</th>
                      <th className="py-3.5 px-4">Tgl Daftar</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="animate-spin text-emerald-600" size={20} />
                            <span className="text-xs">Memuat data pendaftaran santri baru...</span>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedAdmissions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <UserPlus size={28} className="text-muted-foreground/40 stroke-1" />
                            <span className="text-xs font-medium">Tidak ada data pendaftaran yang sesuai kriteria pencarian.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedAdmissions.map((item) => {
                        const badge = getStatusBadge(item.statusPendaftaran);
                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                            onClick={() => handleOpenDetail(item)}
                          >
                            {/* No. Registrasi */}
                            <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-700 dark:text-emerald-400 group-hover:underline">
                                  {item.regId}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(item.regId);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-opacity cursor-pointer"
                                  title="Salin No. Registrasi"
                                >
                                  <Copy size={11} className="text-muted-foreground" />
                                </button>
                              </div>
                            </td>

                            {/* Calon Santri */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                                {item.namaLengkap}
                              </div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                                <span>{item.jenisKelamin}</span>
                                {item.kotaKab && (
                                  <>
                                    <span>•</span>
                                    <span>{item.kotaKab}</span>
                                  </>
                                )}
                              </div>
                            </td>

                            {/* Jenjang & Tinggal */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                  {item.jenjang.includes("MI") ? "Madrasah Ibtidaiyah" : item.jenjang.includes("MTs") ? "MTs Persiapan" : "TPQ Tartil"}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                  item.statusMukim.includes("SANTRI")
                                    ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
                                    : "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20"
                                }`}>
                                  {item.statusMukim.includes("SANTRI") ? "Mukim Asrama" : "Non-Mukim"}
                                </span>
                              </div>
                            </td>

                            {/* Orang Tua / Kontak */}
                            <td className="py-3.5 px-4">
                              <div className="text-foreground font-medium">
                                {item.namaAyah || item.namaIbu || "Belum dicatat"}
                              </div>
                              {item.noWhatsApp && (
                                <a
                                  href={`https://wa.me/${item.noWhatsApp.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5"
                                >
                                  <Phone size={11} />
                                  <span>{item.noWhatsApp}</span>
                                </a>
                              )}
                            </td>

                            {/* Tgl Daftar */}
                            <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                              {item.createdAt ? item.createdAt.split("T")[0] : "-"}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.className}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                                <span>{badge.label}</span>
                              </span>
                            </td>

                            {/* Aksi */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleOpenDetail(item)}
                                  className="p-1.5 rounded-lg liquid-glass border border-border/40 text-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors cursor-pointer"
                                  title="Lihat & Verifikasi Berkas"
                                >
                                  <FileText size={14} />
                                </button>

                                <button
                                  onClick={() => setReceiptAdmission(item)}
                                  className="p-1.5 rounded-lg liquid-glass border border-border/40 text-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors cursor-pointer"
                                  title="Cetak Tanda Terima Pendaftaran"
                                >
                                  <Printer size={14} />
                                </button>

                                {canDelete && (
                                  <button
                                    onClick={() => handleDeleteAdmission(item.id, item.namaLengkap)}
                                    className="p-1.5 rounded-lg liquid-glass border border-border/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                    title="Hapus Data (Super Admin)"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Toolbar */}
              {totalPages > 1 && (
                <div className="p-3 sm:p-4 border-t border-border/40 bg-muted/20 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-xl liquid-glass border border-border/40 text-xs font-semibold disabled:opacity-40 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Sebelumnya
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          currentPage === page
                            ? "bg-emerald-700 text-white shadow-sm"
                            : "liquid-glass hover:bg-white/40 text-foreground"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-xl liquid-glass border border-border/40 text-xs font-semibold disabled:opacity-40 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: KUSTOMISASI HALAMAN & FORM DINAMIS                */}
        {/* ========================================================= */}
        {activeTab === "settings" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Pengaturan & Action Save */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10">
              <div>
                <h3 className="font-bold text-foreground text-lg flex items-center gap-2 font-serif">
                  <Sliders size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Pengaturan Portal Penerimaan &amp; Formulir Dinamis</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Konfigurasikan pembukaan pendaftaran daring, teks instruksi formulir publik, dan kelola susunan input formulir secara fleksibel.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleResetToDefaultFields}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold liquid-glass-pill text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  title="Kembalikan form ke standar Sidogiri"
                >
                  <RotateCcw size={13} />
                  <span>Reset Default</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white px-6 py-2 rounded-full text-xs font-semibold shadow-lg shadow-emerald-900/15 hover:shadow-emerald-700/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {savingSettings ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>

            {/* Grid 2 Kolom: Pengaturan Halaman & Status Buka/Tutup */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kolom Kiri: Status & Informasi Umum (2 Kolom) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Card Status Pembukaan */}
                <div className="p-6 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <span className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Clock size={16} className="text-emerald-600" />
                      <span>Status Pembukaan Pendaftaran Daring</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, isOpen: !prev.isOpen }))}
                      className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.isOpen ? "bg-emerald-600" : "bg-slate-400 dark:bg-slate-600"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          settings.isOpen ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                        Tahun Ajaran Aktif
                      </label>
                      <input
                        type="text"
                        value={settings.academicYear}
                        onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                        placeholder="Contoh: 2026/2027"
                        className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                        No. WhatsApp Helpdesk / Panitia
                      </label>
                      <input
                        type="text"
                        value={settings.contactPhone}
                        onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                        placeholder="Contoh: 0812-8899-1201"
                        className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                        Tanggal Mulai Pendaftaran
                      </label>
                      <input
                        type="date"
                        value={settings.startDate || ""}
                        onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                        Tanggal Akhir Pendaftaran
                      </label>
                      <input
                        type="date"
                        value={settings.endDate || ""}
                        onChange={(e) => setSettings({ ...settings, endDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Konten Teks Halaman Publik */}
                <div className="p-6 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 space-y-4 shadow-sm text-xs">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <span className="font-bold text-sm text-foreground flex items-center gap-2">
                      <FileText size={16} className="text-emerald-600" />
                      <span>Teks &amp; Pengumuman Halaman Publik (`/admissions`)</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                        Judul Utama Halaman Publik
                      </label>
                      <input
                        type="text"
                        value={settings.title}
                        onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                        placeholder="Judul halaman..."
                        className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                        Subjudul Halaman
                      </label>
                      <input
                        type="text"
                        value={settings.subtitle}
                        onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                        placeholder="Subjudul halaman..."
                        className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                        Pengumuman / Instruksi Persyaratan (Tampil saat Buka)
                      </label>
                      <textarea
                        rows={3}
                        value={settings.announcement}
                        onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                        placeholder="Instruksi berkas, jadwal tes tartil..."
                        className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                        Pesan Saat Pendaftaran Ditutup
                      </label>
                      <textarea
                        rows={2}
                        value={settings.closedMessage}
                        onChange={(e) => setSettings({ ...settings, closedMessage: e.target.value })}
                        placeholder="Pesan saat pendaftaran tutup..."
                        className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Preview Status & Ringkasan Form */}
              <div className="space-y-6">
                <div className="p-6 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 space-y-4 shadow-sm text-xs">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border/40 pb-3">
                    <Sparkles size={16} className="text-amber-500" />
                    <span>Pratinjau Status Publik</span>
                  </span>

                  <div className={`p-4 rounded-2xl border text-center space-y-2 ${
                    settings.isOpen
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
                  }`}>
                    <span className="font-bold text-sm flex items-center justify-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${settings.isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                      <span>{settings.isOpen ? "PENDAFTARAN SEDANG DIBUKA" : "PENDAFTARAN SEDANG DITUTUP"}</span>
                    </span>
                    <p className="text-[11px] opacity-90 leading-relaxed">
                      {settings.isOpen
                        ? `Pengunjung publik dapat mengisi formulir dinamis secara mandiri di halaman /admissions.`
                        : `Pengunjung publik yang mengakses halaman pendaftaran akan melihat pesan penutupan.`}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/30 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total Field Aktif:</span>
                      <strong className="text-foreground">
                        {settings.customFields.filter((f) => f.enabled).length} Field
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Field Wajib (Required):</span>
                      <strong className="text-foreground">
                        {settings.customFields.filter((f) => f.enabled && f.required).length} Field
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Terakhir Diperbarui:</span>
                      <span className="text-[11px] text-foreground">
                        {settings.updatedAt ? settings.updatedAt.split("T")[0] : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* PAPAN INFORMASI & PENGUMUMAN DINAMIS PPDB                */}
            {/* ========================================================= */}
            <div className="p-6 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div>
                  <h4 className="font-bold text-foreground text-base flex items-center gap-2 font-serif">
                    <Megaphone size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Papan Informasi &amp; Pengumuman Dinamis PPDB</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Kelola pengumuman resmi, jadwal tes, dan persyaratan yang tampil langsung di halaman pendaftaran publik (`/admissions`).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddAnnouncement}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md transition-all cursor-pointer self-start sm:self-auto active:scale-95"
                >
                  <Plus size={14} />
                  <span>Tambah Pengumuman Baru</span>
                </button>
              </div>

              {(!settings.announcements || settings.announcements.length === 0) ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-border/60 space-y-2">
                  <Megaphone size={28} className="mx-auto text-muted-foreground/50" />
                  <p className="text-xs font-semibold text-foreground">Belum ada pengumuman publik yang ditambahkan</p>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Klik tombol &quot;Tambah Pengumuman Baru&quot; untuk mempublikasikan jadwal tes, persyaratan berkas, atau info asrama.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {settings.announcements.map((ann) => {
                    const categoryConfig = {
                      schedule: {
                        label: "Jadwal Seleksi",
                        badge: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
                        border: "border-amber-500/30 hover:border-amber-500/50",
                      },
                      info: {
                        label: "Informasi Berkas",
                        badge: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
                        border: "border-emerald-500/30 hover:border-emerald-500/50",
                      },
                      warning: {
                        label: "Peringatan Penting",
                        badge: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
                        border: "border-rose-500/30 hover:border-rose-500/50",
                      },
                      success: {
                        label: "Fasilitas & Asrama",
                        badge: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30",
                        border: "border-teal-500/30 hover:border-teal-500/50",
                      },
                    }[ann.category] || {
                      label: "Informasi",
                      badge: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
                      border: "border-emerald-500/30 hover:border-emerald-500/50",
                    };

                    return (
                      <div
                        key={ann.id}
                        className={`p-4 rounded-2xl liquid-glass border transition-all duration-300 flex flex-col justify-between space-y-3 relative group ${categoryConfig.border}`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${categoryConfig.badge}`}>
                              <Tag size={10} />
                              <span>{categoryConfig.label}</span>
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleTogglePinAnnouncement(ann.id)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  ann.pinned
                                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                                }`}
                                title={ann.pinned ? "Lepas pin dari baris teratas" : "Sematkan (Pin) ke baris teratas"}
                              >
                                <Pin size={12} className={ann.pinned ? "fill-current" : ""} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditAnnouncement(ann)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                title="Edit pengumuman ini"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAnnouncement(ann.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Hapus pengumuman ini"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          <h5 className="font-bold text-foreground text-xs line-clamp-2 leading-snug">
                            {ann.title}
                          </h5>

                          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                            {ann.content}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 pt-2 border-t border-border/30">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} className="text-emerald-600" />
                            <span>{ann.date || "-"}</span>
                          </span>
                          {ann.pinned && (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                              <Pin size={10} className="fill-current" />
                              <span>Tersemat</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* BUILDER SUSUNAN FIELD FORMULIR DINAMIS                   */}
            {/* ========================================================= */}
            <div className="p-6 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
                <div>
                  <h4 className="font-bold text-foreground text-base flex items-center gap-2 font-serif">
                    <Layers size={17} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Susunan Field Formulir Pendaftaran Dinamis</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Aktifkan, nonaktifkan, atau atur kewajiban isian (*required*) untuk setiap pertanyaan formulir yang tampil di sisi publik.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewFieldModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Plus size={14} />
                  <span>Tambah Field Kustom</span>
                </button>
              </div>

              {/* Tabel / List Field Dinamis */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/30 font-semibold text-muted-foreground text-[11px] tracking-wider uppercase">
                      <th className="py-3 px-3">No</th>
                      <th className="py-3 px-3">Label Pertanyaan</th>
                      <th className="py-3 px-3">Tipe Input</th>
                      <th className="py-3 px-3">Bagian Form</th>
                      <th className="py-3 px-3 text-center">Wajib (Required)</th>
                      <th className="py-3 px-3 text-center">Tampilkan</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {settings.customFields.map((field, idx) => (
                      <tr
                        key={field.id}
                        className={`hover:bg-white/40 dark:hover:bg-white/5 transition-colors ${
                          !field.enabled ? "opacity-50" : ""
                        }`}
                      >
                        <td className="py-3 px-3 font-mono text-muted-foreground">{idx + 1}</td>
                        <td className="py-3 px-3 font-semibold text-foreground">
                          {field.label}
                          <div className="text-[10px] text-muted-foreground font-normal">
                            Key: <code className="font-mono text-emerald-700 dark:text-emerald-400">{field.id}</code>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-foreground uppercase">
                            {field.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground capitalize">
                          {field.section.replace(/_/g, " ")}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleFieldRequired(field.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer border ${
                              field.required
                                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
                                : "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30"
                            }`}
                          >
                            {field.required ? "Wajib" : "Opsional"}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleFieldEnabled(field.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer border ${
                              field.enabled
                                ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                                : "bg-slate-500/15 text-slate-500 border-slate-500/30"
                            }`}
                          >
                            {field.enabled ? "Aktif" : "Sembunyi"}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {field.id.startsWith("field_") && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomField(field.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Hapus field kustom ini"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL TAMBAH FIELD KUSTOM BARU                            */}
      {/* ========================================================= */}
      {showNewFieldModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowNewFieldModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl liquid-glass-elevated border border-white/80 dark:border-white/15 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2 font-serif">
                <Plus size={16} className="text-emerald-600" />
                <span>Tambah Field Formulir Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewFieldModal(false)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddNewCustomField} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">
                  Label Pertanyaan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newFieldData.label}
                  onChange={(e) => setNewFieldData({ ...newFieldData, label: e.target.value })}
                  placeholder="Contoh: Golongan Darah Santri"
                  className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Tipe Input
                  </label>
                  <select
                    value={newFieldData.type}
                    onChange={(e) => setNewFieldData({ ...newFieldData, type: e.target.value as FieldInputType })}
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="text">Teks Singkat</option>
                    <option value="number">Angka / Nomor</option>
                    <option value="select">Pilihan Dropdown</option>
                    <option value="textarea">Teks Panjang (Paragraf)</option>
                    <option value="date">Tanggal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Bagian Formulir
                  </label>
                  <select
                    value={newFieldData.section}
                    onChange={(e) => setNewFieldData({ ...newFieldData, section: e.target.value as FieldSection })}
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    <option value="data_santri">Data Santri</option>
                    <option value="data_pendidikan">Pilihan Pendidikan</option>
                    <option value="data_wali">Data Wali Santri</option>
                    <option value="lainnya">Informasi Tambahan</option>
                  </select>
                </div>
              </div>

              {newFieldData.type === "select" && (
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Pilihan Dropdown (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={newFieldData.optionsStr}
                    onChange={(e) => setNewFieldData({ ...newFieldData, optionsStr: e.target.value })}
                    placeholder="Contoh: A, B, AB, O"
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">
                  Placeholder / Contoh Teks
                </label>
                <input
                  type="text"
                  value={newFieldData.placeholder}
                  onChange={(e) => setNewFieldData({ ...newFieldData, placeholder: e.target.value })}
                  placeholder="Contoh: Masukkan golongan darah..."
                  className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="req_checkbox"
                  checked={newFieldData.required}
                  onChange={(e) => setNewFieldData({ ...newFieldData, required: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="req_checkbox" className="text-xs font-semibold text-foreground cursor-pointer">
                  Wajib Diisi oleh Pendaftar (Required)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewFieldModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-xs font-semibold shadow-md cursor-pointer"
                >
                  Tambahkan ke Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DETAIL & VERIFIKASI BERKAS                          */}
      {/* ========================================================= */}
      {showDetailModal && selectedAdmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl liquid-glass-elevated border border-white/80 dark:border-white/15 p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base font-serif">
                    Berkas Pendaftaran Santri
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                      {selectedAdmission.regId}
                    </span>
                    <span>•</span>
                    <span>Terdaftar {selectedAdmission.createdAt.split("T")[0]}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Calon Santri Dossier */}
            <div className="space-y-4 text-xs">
              {/* Section 1: Data Diri */}
              <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-3">
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <User size={13} />
                  <span>Data Diri Calon Santri</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Nama Lengkap</span>
                    <span className="font-semibold text-foreground text-sm">{selectedAdmission.namaLengkap}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">NIK / No. Identitas</span>
                    <span className="font-semibold text-foreground">{selectedAdmission.nik || "Tidak dicantumkan"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Tempat, Tanggal Lahir</span>
                    <span className="font-semibold text-foreground">
                      {selectedAdmission.tempatLahir || "-"}, {selectedAdmission.tanggalLahir || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Jenis Kelamin</span>
                    <span className="font-semibold text-foreground">{selectedAdmission.jenisKelamin}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Pilihan Program & Tinggal */}
              <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-3">
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-teal-700 dark:text-teal-400">
                  <GraduationCap size={13} />
                  <span>Pilihan Program Pendidikan</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Jenjang Pendidikan</span>
                    <span className="font-bold text-foreground">
                      {selectedAdmission.jenjang.includes("MI")
                        ? "Madrasah Ibtidaiyah (MI)"
                        : selectedAdmission.jenjang.includes("MTs")
                        ? "MTs Persiapan"
                        : "TPQ Tartil Al-Qur'an"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Status Domisili Santri</span>
                    <span className="font-bold text-foreground">
                      {selectedAdmission.statusMukim.includes("SANTRI") ? "Santri Mukim (Asrama)" : "Murid Non-Mukim"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Konsulat Asal</span>
                    <span className="font-semibold text-foreground">{selectedAdmission.konsulat || "Jabodetabek"}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Orang Tua / Wali & Kontak */}
              <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-3">
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-purple-700 dark:text-purple-400">
                  <Users size={13} />
                  <span>Data Orang Tua / Wali</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Nama Ayah Kandung</span>
                    <span className="font-semibold text-foreground">{selectedAdmission.namaAyah || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Nama Ibu Kandung</span>
                    <span className="font-semibold text-foreground">{selectedAdmission.namaIbu || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">No. WhatsApp Aktif</span>
                    {selectedAdmission.noWhatsApp ? (
                      <a
                        href={`https://wa.me/${selectedAdmission.noWhatsApp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <Phone size={11} />
                        <span>{selectedAdmission.noWhatsApp}</span>
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Alamat Domisili Lengkap</span>
                  <span className="font-medium text-foreground">
                    {selectedAdmission.alamatLengkap || "-"} ({selectedAdmission.kotaKab}, {selectedAdmission.provinsi})
                  </span>
                </div>
              </div>

              {/* Section 4: Catatan Khusus & Dynamic Field Values */}
              {(selectedAdmission.catatanKhusus || selectedAdmission.asalSekolah || (selectedAdmission.dynamicResponses && Object.keys(selectedAdmission.dynamicResponses).length > 0)) && (
                <div className="p-4 rounded-2xl liquid-glass border border-border/40 space-y-2 text-xs">
                  <span className="font-bold text-foreground uppercase tracking-wider text-[11px] block">
                    Informasi Tambahan / Isian Kustom:
                  </span>
                  {selectedAdmission.asalSekolah && (
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Asal Sekolah / Madrasah:</span>
                      <span className="font-semibold text-foreground">{selectedAdmission.asalSekolah}</span>
                    </div>
                  )}
                  {selectedAdmission.catatanKhusus && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                      <span className="font-semibold text-[10px] block mb-0.5">Catatan Khusus Santri:</span>
                      <p>{selectedAdmission.catatanKhusus}</p>
                    </div>
                  )}
                  {selectedAdmission.dynamicResponses && Object.entries(selectedAdmission.dynamicResponses).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1 border-b border-border/30">
                      <span className="text-muted-foreground">{k}:</span>
                      <span className="font-semibold text-foreground">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Section 5: Form Verifikasi Status (RBAC Protected) */}
              {canUpdate ? (
                <div className="p-4 rounded-2xl liquid-glass border border-emerald-500/30 space-y-3 bg-emerald-500/5">
                  <span className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck size={14} />
                      <span>Panel Verifikasi &amp; Keputusan Seleksi</span>
                    </span>
                    {selectedAdmission.verifiedBy && (
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Verifikator: {selectedAdmission.verifiedBy}
                      </span>
                    )}
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { val: "TERDAFTAR_ONLINE", label: "Daftar Baru", color: "sky" },
                      { val: "VERIFIKASI_BERKAS", label: "Verifikasi Berkas", color: "amber" },
                      { val: "LULUS_SELEKSI", label: "Lulus Seleksi", color: "emerald" },
                      { val: "DITOLAK", label: "Ditolak / Batal", color: "rose" },
                    ].map((s) => (
                      <button
                        key={s.val}
                        type="button"
                        onClick={() => setDetailStatus(s.val as AdmissionStatus)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                          detailStatus === s.val
                            ? "bg-emerald-700 text-white border-emerald-600 shadow-md scale-[1.02]"
                            : "liquid-glass border-border/50 text-foreground hover:bg-white/40"
                        }`}
                      >
                        <span>{s.label}</span>
                        {detailStatus === s.val && <Check size={12} />}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      Catatan Administrasi / Hasil Tes Wawancara:
                    </label>
                    <textarea
                      rows={2}
                      value={detailNotes}
                      onChange={(e) => setDetailNotes(e.target.value)}
                      placeholder="Masukkan catatan verifikasi berkas, skor tes tartil, jadwal kedatangan asrama, dll..."
                      className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl liquid-glass border border-border/40 text-xs">
                  <span className="font-bold text-muted-foreground block text-[10px]">Status Terkini:</span>
                  <span className="font-bold text-foreground text-sm">{selectedAdmission.statusPendaftaran}</span>
                  {selectedAdmission.catatanAdmin && (
                    <p className="mt-1 text-muted-foreground">{selectedAdmission.catatanAdmin}</p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-border/40 pt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReceiptAdmission(selectedAdmission);
                    setShowDetailModal(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold liquid-glass-pill text-foreground hover:bg-white/40 transition-colors cursor-pointer"
                >
                  <Printer size={13} className="text-emerald-600" />
                  <span>Cetak Tanda Terima</span>
                </button>

                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDeleteAdmission(selectedAdmission.id, selectedAdmission.namaLengkap)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                {canUpdate && (
                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    disabled={isSubmitting}
                    className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-600 text-white px-5 py-2 rounded-full text-xs font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Check size={13} className="stroke-[2.5]" />
                    )}
                    <span>Simpan Perubahan</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL FORM TAMBAH PENDAFTAR MANUAL                        */}
      {/* ========================================================= */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl liquid-glass-elevated border border-white/80 dark:border-white/15 p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base font-serif">
                    Pendaftaran Santri Baru (Manual)
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Catat calon santri baru dari formulir fisik / pendaftaran langsung di kantor sekretariat
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAdmission} className="space-y-4 text-xs">
              {/* Row 1: Nama & NIK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Nama Lengkap Calon Santri <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addFormData.namaLengkap}
                    onChange={(e) => setAddFormData({ ...addFormData, namaLengkap: e.target.value })}
                    placeholder="Contoh: Muhammad Ilham Maulana"
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    NIK / No. Kartu Keluarga
                  </label>
                  <input
                    type="text"
                    value={addFormData.nik}
                    onChange={(e) => setAddFormData({ ...addFormData, nik: e.target.value })}
                    placeholder="16 digit NIK (opsional)"
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              {/* Row 2: Tempat & Tgl Lahir + Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={addFormData.tempatLahir}
                    onChange={(e) => setAddFormData({ ...addFormData, tempatLahir: e.target.value })}
                    placeholder="Kota kelahiran"
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={addFormData.tanggalLahir}
                    onChange={(e) => setAddFormData({ ...addFormData, tanggalLahir: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">Jenis Kelamin</label>
                  <select
                    value={addFormData.jenisKelamin}
                    onChange={(e) => setAddFormData({ ...addFormData, jenisKelamin: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Jenjang & Status Mukim */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Jenjang Pendidikan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={addFormData.jenjang}
                    onChange={(e) => setAddFormData({ ...addFormData, jenjang: e.target.value as "MI" | "MTs" | "TPQ" })}
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    <option value="MI">Madrasah Ibtidaiyah (MI) Miftahul Ulum</option>
                    <option value="MTs">Madrasah Tsanawiyah (MTs Persiapan)</option>
                    <option value="TPQ">TPQ Al-Qur&apos;an Tartil Sidogiri</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Status Domisili Santri <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={addFormData.statusMukim}
                    onChange={(e) => setAddFormData({ ...addFormData, statusMukim: e.target.value as "SANTRI" | "MURID" })}
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    <option value="SANTRI">Santri Mukim (Menetap di Asrama Sidogiri)</option>
                    <option value="MURID">Murid Non-Mukim (Pulang-Pergi / Khusus TPQ &amp; MI Lokal)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Orang Tua & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">Nama Ayah</label>
                  <input
                    type="text"
                    value={addFormData.namaAyah}
                    onChange={(e) => setAddFormData({ ...addFormData, namaAyah: e.target.value })}
                    placeholder="Nama ayah kandung"
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">Nama Ibu</label>
                  <input
                    type="text"
                    value={addFormData.namaIbu}
                    onChange={(e) => setAddFormData({ ...addFormData, namaIbu: e.target.value })}
                    placeholder="Nama ibu kandung"
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={addFormData.noWhatsApp}
                    onChange={(e) => setAddFormData({ ...addFormData, noWhatsApp: e.target.value })}
                    placeholder="0812xxxxxxxx"
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              {/* Row 5: Alamat & Konsulat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    value={addFormData.kotaKab}
                    onChange={(e) => setAddFormData({ ...addFormData, kotaKab: e.target.value })}
                    placeholder="Bekasi / Jakarta / dll"
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">Konsulat Asal</label>
                  <input
                    type="text"
                    value={addFormData.konsulat}
                    onChange={(e) => setAddFormData({ ...addFormData, konsulat: e.target.value })}
                    placeholder="Jabodetabek / Jawa Barat / dll"
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">Alamat Lengkap</label>
                <textarea
                  rows={2}
                  value={addFormData.alamatLengkap}
                  onChange={(e) => setAddFormData({ ...addFormData, alamatLengkap: e.target.value })}
                  placeholder="Nama jalan, RT/RW, kelurahan, kecamatan..."
                  className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              {/* Status Awal Pendaftaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">Status Awal</label>
                  <select
                    value={addFormData.statusPendaftaran}
                    onChange={(e) => setAddFormData({ ...addFormData, statusPendaftaran: e.target.value as AdmissionStatus })}
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                  >
                    <option value="TERDAFTAR_ONLINE">Terdaftar Online (Baru)</option>
                    <option value="VERIFIKASI_BERKAS">Verifikasi Berkas</option>
                    <option value="LULUS_SELEKSI">Lulus Seleksi Langsung</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">Catatan Tambahan Petugas</label>
                  <input
                    type="text"
                    value={addFormData.catatanAdmin}
                    onChange={(e) => setAddFormData({ ...addFormData, catatanAdmin: e.target.value })}
                    placeholder="Catatan berkas / rekomendasi asatidz"
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-600 text-white px-6 py-2 rounded-full text-xs font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Plus size={13} className="stroke-[2.5]" />
                  )}
                  <span>Simpan Pendaftar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL PRINT TANDA TERIMA / RECEIPT PPDB                   */}
      {/* ========================================================= */}
      {receiptAdmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setReceiptAdmission(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-white text-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kop Surat Resmi */}
            <div className="text-center border-b-4 border-double border-slate-900 pb-3 space-y-1">
              <div className="text-[10px] tracking-widest uppercase font-bold text-slate-600">
                PONDOK PESANTREN SIDOGIRI • RANTING BEKASI
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-slate-950">
                DARUL KHIDMAH SIDOGIRI BEKASI
              </h2>
              <div className="text-[11px] font-medium text-slate-700">
                Madrasah Miftahul Ulum (MI &amp; MTs Persiapan) • TPQ Metode Tartil Sidogiri • Asrama Santri
              </div>
              <div className="text-[10px] text-slate-500">
                Jl. Lapangan Kranji, Bintara, Bekasi Barat, Kota Bekasi, Jawa Barat 17134 • Telp: 0812-3456-7890 • Website: dksidogiribekasi.vercel.app
              </div>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center space-y-1">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                BUKTI PENDAFTARAN SANTRI BARU (PPDB)
              </span>
              <div className="font-mono text-xs font-bold text-slate-800">
                NO. REGISTRASI: {receiptAdmission.regId}
              </div>
            </div>

            {/* Rincian Calon Santri */}
            <div className="space-y-2.5 text-xs border-y border-dashed border-slate-300 py-3">
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Nama Calon Santri:</span>
                <span className="font-bold text-slate-900">{receiptAdmission.namaLengkap}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Jenjang Pendidikan:</span>
                <span className="font-bold text-slate-900">
                  {receiptAdmission.jenjang.includes("MI")
                    ? "Madrasah Ibtidaiyah (MI)"
                    : receiptAdmission.jenjang.includes("MTs")
                    ? "MTs Persiapan"
                    : "TPQ Tartil Al-Qur'an"}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Status Tempat Tinggal:</span>
                <span className="font-bold text-slate-900">
                  {receiptAdmission.statusMukim.includes("SANTRI") ? "Santri Mukim (Asrama)" : "Murid Non-Mukim"}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Nama Orang Tua / Wali:</span>
                <span className="font-semibold text-slate-900">
                  {receiptAdmission.namaAyah || receiptAdmission.namaIbu || "-"}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">No. WhatsApp Wali:</span>
                <span className="font-semibold text-slate-900">{receiptAdmission.noWhatsApp || "-"}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Kota Asal / Domisili:</span>
                <span className="font-semibold text-slate-900">
                  {receiptAdmission.kotaKab}, {receiptAdmission.provinsi}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Status Berkas Saat Ini:</span>
                <span className="font-bold text-emerald-700 uppercase">
                  {receiptAdmission.statusPendaftaran.replace(/_/g, " ")}
                </span>
              </div>
              {receiptAdmission.catatanAdmin && (
                <div className="pt-1 text-[11px] text-slate-600 italic">
                  &ldquo;{receiptAdmission.catatanAdmin}&rdquo;
                </div>
              )}
            </div>

            {/* Petunjuk Seleksi */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-1">
              <span className="font-bold block text-slate-800">Petunjuk Verifikasi Dokumen:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Bawalah lembar bukti ini saat verifikasi berkas dan tes wawancara langsung.</li>
                <li>Lampirkan fotokopi Kartu Keluarga (KK), Akta Kelahiran, dan pas foto 3x4 (3 lembar).</li>
                <li>Bagi santri mukim, persiapan perlengkapan asrama diatur setelah status dinyatakan Lulus Seleksi.</li>
              </ul>
            </div>

            {/* Tanda Tangan */}
            <div className="flex justify-between items-end pt-2 text-[10px] text-slate-700">
              <div className="text-center space-y-8">
                <div>Wali Santri / Calon Santri</div>
                <div className="font-semibold">(......................................)</div>
              </div>
              <div className="text-center space-y-8">
                <div>Bekasi, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br />Panitia PPDB DK Sidogiri</div>
                <div className="font-semibold text-slate-900">({receiptAdmission.verifiedBy || "Petugas Administrasi"})</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setReceiptAdmission(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Printer size={13} />
                <span>Cetak Lembar Tanda Terima</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL TAMBAH / EDIT PENGUMUMAN DINAMIS                     */}
      {/* ========================================================= */}
      {showAnnouncementModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowAnnouncementModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl liquid-glass-elevated border border-white/80 dark:border-white/15 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2 font-serif">
                <Megaphone size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>{editingAnnouncementId ? "Edit Pengumuman PPDB" : "Tambah Pengumuman Baru"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAnnouncementModal(false)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">
                  Judul Pengumuman <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={announcementFormData.title}
                  onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
                  placeholder="Contoh: Jadwal Tes Baca Al-Qur'an Gelombang 1"
                  className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Kategori Pengumuman
                  </label>
                  <select
                    value={announcementFormData.category}
                    onChange={(e) =>
                      setAnnouncementFormData({
                        ...announcementFormData,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-background"
                  >
                    <option value="schedule">Jadwal Seleksi / Agenda</option>
                    <option value="info">Informasi Berkas / Dokumen</option>
                    <option value="success">Fasilitas &amp; Asrama</option>
                    <option value="warning">Peringatan Penting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Tanggal Agenda / Publikasi
                  </label>
                  <input
                    type="date"
                    value={announcementFormData.date}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinAnnouncement"
                  checked={announcementFormData.pinned}
                  onChange={(e) => setAnnouncementFormData({ ...announcementFormData, pinned: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-border cursor-pointer"
                />
                <label htmlFor="pinAnnouncement" className="text-[11px] font-semibold text-foreground cursor-pointer flex items-center gap-1.5">
                  <Pin size={12} className={announcementFormData.pinned ? "text-amber-500 fill-current" : "text-muted-foreground"} />
                  <span>Sematkan pengumuman ini di baris teratas (Pinned)</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">
                  Isi Lengkap Pengumuman <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={announcementFormData.content}
                  onChange={(e) => setAnnouncementFormData({ ...announcementFormData, content: e.target.value })}
                  placeholder="Tuliskan rincian persyaratan, lokasi, pakaian yang harus dikenakan, atau instruksi lengkap bagi wali santri..."
                  className="w-full p-2.5 rounded-xl liquid-glass border border-border/50 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold liquid-glass-pill hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer"
                >
                  {editingAnnouncementId ? "Simpan Perubahan" : "Tambahkan Pengumuman"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
