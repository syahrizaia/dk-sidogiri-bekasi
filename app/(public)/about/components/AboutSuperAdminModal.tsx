"use client";

import React, { useState } from "react";
import { 
  X, 
  Save, 
  RefreshCw, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  ScrollText, 
  Trash2, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  createOrganizationMemberAction,
  updateOrganizationMemberAction,
  deleteOrganizationMemberAction,
  updateAboutTeacherPublicAction,
  updateAboutContentAction,
  type OrganizationMember,
  type PublicTeacherItem,
  type AboutContentDocument
} from "@/lib/actions/about";

interface AboutSuperAdminModalProps {
  type: "add_org" | "edit_org" | "edit_teacher" | "edit_content";
  data?: any;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function AboutSuperAdminModal({
  type,
  data,
  onClose,
  onSuccess,
}: AboutSuperAdminModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Organization Form State
  const [orgForm, setOrgForm] = useState<Partial<OrganizationMember>>({
    name: data?.name || "",
    title: data?.title || "",
    category: data?.category || "PIMPINAN",
    department: data?.department || "",
    photoUrl: data?.photoUrl || "",
    period: data?.period || "2024 - 2029",
    bio: data?.bio || "",
    phone: data?.phone || "",
    email: data?.email || "",
    order: data?.order !== undefined ? data.order : 1,
    isActive: data?.isActive !== undefined ? data.isActive : true,
  });

  // 2. Teacher Public Profile State
  const [teacherForm, setTeacherForm] = useState({
    photoUrl: data?.photoUrl || "",
    education: data?.education || "",
    publicBio: data?.publicBio || "",
    academicYear: data?.academicYear || "2026/2027",
    isPublic: data?.isPublic !== undefined ? data.isPublic : true,
    order: data?.order !== undefined ? data.order : 1,
  });

  // 3. About Content Form State
  const [contentForm, setContentForm] = useState({
    heroTagline: data?.heroTagline || "",
    heroDescription: data?.heroDescription || "",
    historyTitle: data?.historyTitle || "",
    historyParagraphs: Array.isArray(data?.historyParagraphs)
      ? data.historyParagraphs.join("\n\n")
      : "",
    quote: data?.quote || "",
    quoteAuthor: data?.quoteAuthor || "",
    vision: data?.vision || "",
    missions: Array.isArray(data?.missions) ? data.missions.join("\n") : "",
  });

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (type === "add_org") {
        const res = await createOrganizationMemberAction({
          name: orgForm.name!,
          title: orgForm.title!,
          category: orgForm.category as any,
          department: orgForm.department,
          photoUrl: orgForm.photoUrl,
          period: orgForm.period || "2024 - 2029",
          bio: orgForm.bio,
          phone: orgForm.phone,
          email: orgForm.email,
          order: Number(orgForm.order) || 1,
        });

        if (res.success) {
          onSuccess(res.message || "Anggota organisasi berhasil ditambahkan.");
          onClose();
        } else {
          setError(res.error || "Gagal menambahkan anggota organisasi.");
        }
      } else if (type === "edit_org") {
        const res = await updateOrganizationMemberAction(data._id, {
          name: orgForm.name!,
          title: orgForm.title!,
          category: orgForm.category as any,
          department: orgForm.department,
          photoUrl: orgForm.photoUrl,
          period: orgForm.period || "2024 - 2029",
          bio: orgForm.bio,
          phone: orgForm.phone,
          email: orgForm.email,
          order: Number(orgForm.order) || 1,
          isActive: orgForm.isActive,
        });

        if (res.success) {
          onSuccess(res.message || "Data organisasi berhasil diperbarui.");
          onClose();
        } else {
          setError(res.error || "Gagal memperbarui data organisasi.");
        }
      } else if (type === "edit_teacher") {
        const res = await updateAboutTeacherPublicAction(data._id || data.id, {
          photoUrl: teacherForm.photoUrl,
          education: teacherForm.education,
          publicBio: teacherForm.publicBio,
          academicYear: teacherForm.academicYear,
          isPublic: teacherForm.isPublic,
          order: Number(teacherForm.order) || 1,
        });

        if (res.success) {
          onSuccess(res.message || "Profil publik asatidz berhasil diperbarui.");
          onClose();
        } else {
          setError(res.error || "Gagal memperbarui data asatidz.");
        }
      } else if (type === "edit_content") {
        const res = await updateAboutContentAction({
          heroTagline: contentForm.heroTagline,
          heroDescription: contentForm.heroDescription,
          historyTitle: contentForm.historyTitle,
          historyParagraphs: contentForm.historyParagraphs
            .split("\n\n")
            .map((p: string) => p.trim())
            .filter(Boolean),
          quote: contentForm.quote,
          quoteAuthor: contentForm.quoteAuthor,
          vision: contentForm.vision,
          missions: contentForm.missions
            .split("\n")
            .map((m: string) => m.trim())
            .filter(Boolean),
        });

        if (res.success) {
          onSuccess(res.message || "Narasi Tentang Kami berhasil diperbarui.");
          onClose();
        } else {
          setError(res.error || "Gagal memperbarui narasi Tentang Kami.");
        }
      }
    } catch {
      setError("Terjadi kesalahan jaringan atau server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrg = async () => {
    if (!window.confirm(`Yakin ingin menghapus ${data?.name} dari struktur organisasi?`)) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await deleteOrganizationMemberAction(data._id || data.id);
      if (res.success) {
        onSuccess(res.message || "Anggota organisasi berhasil dihapus.");
        onClose();
      } else {
        setError(res.error || "Gagal menghapus anggota.");
      }
    } catch {
      setError("Terjadi kesalahan sistem saat menghapus.");
    } finally {
      setSubmitting(false);
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case "add_org":
        return "Tambah Anggota Struktur Organisasi";
      case "edit_org":
        return `Edit Pengurus: ${data?.name}`;
      case "edit_teacher":
        return `Atur Profil Publik: ${data?.name}`;
      case "edit_content":
        return "Sunting Narasi Profil, Sejarah & Visi Misi";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-2xl my-8 rounded-[28px] liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              {type === "edit_teacher" ? (
                <GraduationCap size={20} />
              ) : type === "edit_content" ? (
                <ScrollText size={20} />
              ) : (
                <Users size={20} />
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30">
                Mode Super Admin
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground mt-1">
                {getModalTitle()}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl liquid-glass text-muted-foreground hover:text-foreground hover:bg-white/30 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs font-semibold text-red-800 dark:text-red-200 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* ========================================================== */}
          {/* 1. ORGANIZATION MEMBER FORM                                */}
          {/* ========================================================== */}
          {(type === "add_org" || type === "edit_org") && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    Nama Lengkap & Gelar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Contoh: KH. Bahruddin Thohir"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    Jabatan Resmi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={orgForm.title}
                    onChange={(e) => setOrgForm({ ...orgForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Contoh: Ketua Pengurus Ranting"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    Kategori / Tingkatan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={orgForm.category}
                    onChange={(e) => setOrgForm({ ...orgForm, category: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                  >
                    <option value="PIMPINAN" className="bg-card text-foreground">Pimpinan Inti Ranting</option>
                    <option value="KEPALA_UNIT" className="bg-card text-foreground">Kepala Unit Pendidikan (MI / MTs / TPQ)</option>
                    <option value="BIDANG_SEKSI" className="bg-card text-foreground">Koordinator Bidang / Seksi</option>
                    <option value="PENASIHAT" className="bg-card text-foreground">Majelis Penasihat / Masyayikh</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    Unit / Departemen
                  </label>
                  <input
                    type="text"
                    value={orgForm.department}
                    onChange={(e) => setOrgForm({ ...orgForm, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Contoh: Pengurus Harian Ranting"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    Masa Khidmah / Periode
                  </label>
                  <input
                    type="text"
                    value={orgForm.period}
                    onChange={(e) => setOrgForm({ ...orgForm, period: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="2024 - 2029"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    Urutan Tampilan (1, 2, 3...)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={orgForm.order}
                    onChange={(e) => setOrgForm({ ...orgForm, order: Number(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-foreground mb-1.5">
                    URL Foto Potret Resmi
                  </label>
                  <input
                    type="url"
                    value={orgForm.photoUrl}
                    onChange={(e) => setOrgForm({ ...orgForm, photoUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
                    placeholder="Kosongkan untuk menggunakan foto profil kosong default"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Kosongkan untuk menampilkan foto profil kosong bawaan (default). Jika diisi URL, foto tersebut yang akan ditampilkan.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-foreground mb-1.5">
                    Biografi Singkat / Komitmen Khidmah
                  </label>
                  <textarea
                    rows={2}
                    value={orgForm.bio}
                    onChange={(e) => setOrgForm({ ...orgForm, bio: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Peran dan fokus pengabdian dalam membina santri..."
                  />
                </div>
              </div>

              {type === "edit_org" && (
                <div className="pt-2 flex items-center justify-between border-t border-border/30">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={orgForm.isActive}
                      onChange={(e) => setOrgForm({ ...orgForm, isActive: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                    <span className="font-semibold text-foreground">Tampilkan di Struktur Organisasi Publik</span>
                  </label>
                </div>
              )}
            </>
          )}

          {/* ========================================================== */}
          {/* 2. TEACHER PUBLIC PROFILE FORM                             */}
          {/* ========================================================== */}
          {type === "edit_teacher" && (
            <>
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 space-y-1">
                <span className="font-bold block text-foreground">{data?.name} (NIP: {data?.nip})</span>
                <p className="text-[11px] leading-relaxed">
                  Data unit penugasan ({data?.institutions?.join(", ") || data?.institution}) dan mata pelajaran sinkron langsung dari modul Dewan Asatidz. Di formulir ini, Anda dapat memperbarui foto potret, almamater, dan kutipan profil publik.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    URL Foto Potret Ustadz/Guru
                  </label>
                  <input
                    type="url"
                    value={teacherForm.photoUrl}
                    onChange={(e) => setTeacherForm({ ...teacherForm, photoUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
                    placeholder="Kosongkan untuk menggunakan foto profil kosong default"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Kosongkan untuk menampilkan foto profil kosong bawaan (default).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground mb-1.5">
                      Almamater / Riwayat Pendidikan
                    </label>
                    <input
                      type="text"
                      value={teacherForm.education}
                      onChange={(e) => setTeacherForm({ ...teacherForm, education: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      placeholder="Contoh: Alumni PP. Sidogiri Pasuruan"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1.5">
                      Tahun Ajaran Aktif
                    </label>
                    <input
                      type="text"
                      value={teacherForm.academicYear}
                      onChange={(e) => setTeacherForm({ ...teacherForm, academicYear: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
                      placeholder="2026/2027"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    Kutipan Profil Publik / Komitmen Pengajaran
                  </label>
                  <textarea
                    rows={2}
                    value={teacherForm.publicBio}
                    onChange={(e) => setTeacherForm({ ...teacherForm, publicBio: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="Kutipan keilmuan atau pesan santri..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/30">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={teacherForm.isPublic}
                      onChange={(e) => setTeacherForm({ ...teacherForm, isPublic: e.target.checked })}
                      className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                    />
                    <span className="font-semibold text-foreground">Tampilkan di Publik</span>
                  </label>

                  <div>
                    <label className="block font-bold text-foreground mb-1">
                      Urutan Prioritas Tampil
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={teacherForm.order}
                      onChange={(e) => setTeacherForm({ ...teacherForm, order: Number(e.target.value) || 1 })}
                      className="w-full px-3 py-1.5 rounded-xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground font-mono"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ========================================================== */}
          {/* 3. ABOUT CONTENT NARRATIVE FORM                            */}
          {/* ========================================================== */}
          {type === "edit_content" && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block font-bold text-foreground mb-1.5">
                  Hero Tagline Utama
                </label>
                <input
                  type="text"
                  required
                  value={contentForm.heroTagline}
                  onChange={(e) => setContentForm({ ...contentForm, heroTagline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5">
                  Deskripsi Pengantar Hero
                </label>
                <textarea
                  rows={3}
                  required
                  value={contentForm.heroDescription}
                  onChange={(e) => setContentForm({ ...contentForm, heroDescription: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5">
                  Judul Bagian Sejarah & Sanad
                </label>
                <input
                  type="text"
                  required
                  value={contentForm.historyTitle}
                  onChange={(e) => setContentForm({ ...contentForm, historyTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5">
                  Paragraf Sejarah (Pisahkan antar paragraf dengan baris kosong ganda Enter)
                </label>
                <textarea
                  rows={4}
                  required
                  value={contentForm.historyParagraphs}
                  onChange={(e) => setContentForm({ ...contentForm, historyParagraphs: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    Kutipan / Mutiara Kata Salaf
                  </label>
                  <textarea
                    rows={2}
                    value={contentForm.quote}
                    onChange={(e) => setContentForm({ ...contentForm, quote: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    Sumber / Penutur Kutipan
                  </label>
                  <input
                    type="text"
                    value={contentForm.quoteAuthor}
                    onChange={(e) => setContentForm({ ...contentForm, quoteAuthor: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5">
                  Visi Utama
                </label>
                <textarea
                  rows={2}
                  value={contentForm.vision}
                  onChange={(e) => setContentForm({ ...contentForm, vision: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5">
                  Misi Pengabdian (1 butir per baris)
                </label>
                <textarea
                  rows={4}
                  value={contentForm.missions}
                  onChange={(e) => setContentForm({ ...contentForm, missions: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl liquid-glass border border-white/60 dark:border-white/10 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/30">
            {type === "edit_org" ? (
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteOrg}
                className="px-4 py-2.5 rounded-full bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={14} />
                <span>Hapus Pengurus</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full liquid-glass border border-border/40 text-xs font-semibold text-foreground hover:bg-white/40 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-emerald-950/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Menyimpan ke Atlas...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
