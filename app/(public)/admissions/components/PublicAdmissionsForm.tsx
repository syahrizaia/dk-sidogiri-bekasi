"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  UserPlus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  X,
  Phone,
  User,
  GraduationCap,
  Users,
  Building,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Copy,
  ChevronRight,
  RotateCcw,
  Megaphone,
  Pin,
  Tag,
} from "lucide-react";
import { submitPendaftaranAction } from "@/lib/actions/admissions";
import {
  type AdmissionSettings,
  type DynamicFormField,
  type PendaftaranPayload,
  type AdmissionAnnouncement,
} from "@/lib/admissions-config";

interface PublicAdmissionsFormProps {
  initialSettings: AdmissionSettings;
}

export function PublicAdmissionsForm({ initialSettings }: PublicAdmissionsFormProps) {
  const [settings] = useState<AdmissionSettings>(initialSettings);

  // Dynamic Form Values State
  const [formValues, setFormValues] = useState<Record<string, string>>({
    jenisKelamin: "Laki-laki",
    jenjang: "MI (Madrasah Ibtidaiyah)",
    statusMukim: "SANTRI (Mukim di Asrama Sayyid Sulaiman)",
    konsulat: "Jabodetabek",
    provinsi: "Jawa Barat",
    kotaKab: "Bekasi",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedData, setSubmittedData] = useState<{
    regId: string;
    namaLengkap: string;
    jenjang: string;
    statusMukim: string;
    noWhatsApp: string;
    createdAt: string;
  } | null>(null);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Filter only enabled custom fields, sorted by order
  const activeFields: DynamicFormField[] = useMemo(() => {
    return [...(settings.customFields || [])]
      .filter((f: DynamicFormField) => f.enabled)
      .sort((a: DynamicFormField, b: DynamicFormField) => a.order - b.order);
  }, [settings.customFields]);

  // Group fields by section
  const santriFields: DynamicFormField[] = useMemo(
    () => activeFields.filter((f: DynamicFormField) => f.section === "data_santri"),
    [activeFields]
  );
  const pendidikanFields: DynamicFormField[] = useMemo(
    () => activeFields.filter((f: DynamicFormField) => f.section === "data_pendidikan"),
    [activeFields]
  );
  const waliFields: DynamicFormField[] = useMemo(
    () => activeFields.filter((f: DynamicFormField) => f.section === "data_wali"),
    [activeFields]
  );
  const lainnyaFields: DynamicFormField[] = useMemo(
    () => activeFields.filter((f: DynamicFormField) => f.section === "lainnya"),
    [activeFields]
  );

  // Filter announcements: sort pinned first, then by date
  const [announcementCategoryFilter, setAnnouncementCategoryFilter] = useState<string>("ALL");

  const sortedAnnouncements: AdmissionAnnouncement[] = useMemo(() => {
    const list = [...(settings.announcements || [])];
    return list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.date || "").localeCompare(a.date || "");
    });
  }, [settings.announcements]);

  const filteredAnnouncements = useMemo(() => {
    if (announcementCategoryFilter === "ALL") return sortedAnnouncements;
    return sortedAnnouncements.filter((a) => a.category === announcementCategoryFilter);
  }, [sortedAnnouncements, announcementCategoryFilter]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate required fields
    for (const field of activeFields) {
      if (field.required && !formValues[field.id]?.trim()) {
        setErrorMessage(`Field "${field.label}" wajib diisi.`);
        return;
      }
    }

    // Special validation for MA
    const chosenJenjang = formValues["jenjang"] || "";
    if (chosenJenjang.toUpperCase().includes("MA")) {
      setErrorMessage(
        "Jenjang Madrasah Aliyah (MA) tidak dibuka di Ranting Bekasi. Pilihan tersedia: MI, MTs Persiapan, dan TPQ."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Separate standard fields and dynamic custom responses
      const standardKeys = [
        "namaLengkap",
        "nik",
        "tempatLahir",
        "tanggalLahir",
        "jenisKelamin",
        "jenjang",
        "statusMukim",
        "namaAyah",
        "namaIbu",
        "noWhatsApp",
        "provinsi",
        "kotaKab",
        "alamatLengkap",
        "konsulat",
        "catatanKhusus",
        "asalSekolah",
      ];

      const payload: PendaftaranPayload = {
        namaLengkap: formValues["namaLengkap"] || "Calon Santri",
        nik: formValues["nik"] || "",
        tempatLahir: formValues["tempatLahir"] || "",
        tanggalLahir: formValues["tanggalLahir"] || "",
        jenisKelamin: formValues["jenisKelamin"] || "Laki-laki",
        namaAyah: formValues["namaAyah"] || "",
        namaIbu: formValues["namaIbu"] || "",
        noWhatsApp: formValues["noWhatsApp"] || "",
        provinsi: formValues["provinsi"] || "Jawa Barat",
        kotaKab: formValues["kotaKab"] || "Bekasi",
        alamatLengkap: formValues["alamatLengkap"] || "",
        konsulat: formValues["konsulat"] || "Jabodetabek",
        jenjang: formValues["jenjang"] || "MI",
        statusMukim: formValues["statusMukim"] || "SANTRI",
        catatanKhusus: formValues["catatanKhusus"] || "",
        asalSekolah: formValues["asalSekolah"] || "",
        dynamicResponses: {},
      };

      for (const [key, value] of Object.entries(formValues)) {
        if (!standardKeys.includes(key)) {
          payload.dynamicResponses![key] = value;
        }
      }

      const res = await submitPendaftaranAction(payload);
      if (res.success && res.data) {
        setSubmittedData({
          regId: res.data.regId,
          namaLengkap: payload.namaLengkap,
          jenjang: payload.jenjang,
          statusMukim: payload.statusMukim,
          noWhatsApp: payload.noWhatsApp || "",
          createdAt: new Date().toISOString(),
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrorMessage(res.error || "Gagal memproses pendaftaran. Silakan periksa kembali data Anda.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi gangguan koneksi saat mengirim formulir. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRegId = () => {
    if (!submittedData) return;
    navigator.clipboard.writeText(submittedData.regId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Render individual input based on field type
  const renderFieldInput = (field: DynamicFormField) => {
    const val = formValues[field.id] || "";

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            rows={3}
            id={field.id}
            name={field.id}
            required={field.required}
            value={val}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full p-3 rounded-2xl liquid-glass border border-border/50 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
          />
        );

      case "select":
        return (
          <select
            id={field.id}
            name={field.id}
            required={field.required}
            value={val}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full p-3 rounded-2xl liquid-glass border border-border/50 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all cursor-pointer"
          >
            <option value="">-- Pilih {field.label} --</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      case "date":
        return (
          <input
            type="date"
            id={field.id}
            name={field.id}
            required={field.required}
            value={val}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full p-3 rounded-2xl liquid-glass border border-border/50 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
          />
        );

      case "number":
        return (
          <input
            type="number"
            id={field.id}
            name={field.id}
            required={field.required}
            value={val}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full p-3 rounded-2xl liquid-glass border border-border/50 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
          />
        );

      case "text":
      default:
        return (
          <input
            type="text"
            id={field.id}
            name={field.id}
            required={field.required}
            value={val}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full p-3 rounded-2xl liquid-glass border border-border/50 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
          />
        );
    }
  };

  // =========================================================
  // VIEW: PENDAFTARAN SEDANG DITUTUP
  // =========================================================
  if (!settings.isOpen) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 p-8 sm:p-10 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle size={32} />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
              Pendaftaran Ditutup
            </span>
            <h2 className="text-2xl font-bold font-serif text-foreground">
              {settings.title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {settings.closedMessage}
            </p>
          </div>

          <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-full liquid-glass text-xs font-semibold text-foreground hover:bg-white/40 transition-colors"
            >
              Kembali ke Beranda
            </Link>
            {settings.contactPhone && (
              <a
                href={`https://wa.me/${settings.contactPhone.replace(/\D/g, "")}?text=Assalamu%27alaikum%20Panitia%20PSB%20Sidogiri%20Bekasi`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Phone size={13} />
                <span>Hubungi Panitia PSB</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // VIEW: REGISTRASI BERHASIL (SUCCESS CONFIRMATION)
  // =========================================================
  if (submittedData) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 animate-in zoom-in-95 duration-300">
        <div className="max-w-xl w-full rounded-[32px] liquid-glass-elevated border border-emerald-500/40 p-6 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <span className="px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40">
              Pendaftaran Berhasil Dikirim
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-foreground flex flex-wrap items-center justify-center gap-2">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold text-3xl sm:text-4xl">أَهْلاً وَسَهْلاً،</span>
              <span>Calon Santri Baru!</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Formulir pendaftaran santri baru telah tersimpan di sistem Darul Khidmah Sidogiri Bekasi. Harap catat atau simpan nomor registrasi Anda di bawah ini:
            </p>
          </div>

          {/* Registration Code Badge */}
          <div className="p-4 rounded-2xl liquid-glass border border-emerald-500/30 flex items-center justify-between gap-3 max-w-md mx-auto bg-emerald-500/5">
            <div className="text-left">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Nomor Registrasi PPDB
              </span>
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                {submittedData.regId}
              </span>
            </div>
            <button
              type="button"
              onClick={copyRegId}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold liquid-glass border border-emerald-500/30 hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 transition-all cursor-pointer"
            >
              <Copy size={13} />
              <span>{copiedId ? "Tersalin!" : "Salin"}</span>
            </button>
          </div>

          {/* Quick Summary */}
          <div className="text-left text-xs p-4 rounded-2xl liquid-glass border border-border/40 space-y-2 max-w-md mx-auto text-muted-foreground">
            <div className="flex justify-between">
              <span>Nama Calon Santri:</span>
              <strong className="text-foreground">{submittedData.namaLengkap}</strong>
            </div>
            <div className="flex justify-between">
              <span>Pilihan Program:</span>
              <strong className="text-foreground">{submittedData.jenjang}</strong>
            </div>
            <div className="flex justify-between">
              <span>Status Tinggal:</span>
              <strong className="text-foreground">{submittedData.statusMukim}</strong>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full liquid-glass text-xs font-semibold text-foreground hover:bg-white/40 transition-colors cursor-pointer border border-border/50"
            >
              <Printer size={14} className="text-emerald-600" />
              <span>Cetak Bukti Pendaftaran</span>
            </button>

            {settings.contactPhone && (
              <a
                href={`https://wa.me/${settings.contactPhone.replace(/\D/g, "")}?text=Assalamu%27alaikum%20Panitia%20PSB%20Sidogiri%20Bekasi,%20saya%20telah%20mendaftarkan%20calon%20santri%20${encodeURIComponent(
                  submittedData.namaLengkap
                )}%20dengan%20No.%20Registrasi%20${submittedData.regId}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Phone size={14} />
                <span>Konfirmasi via WhatsApp</span>
              </a>
            )}
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={() => {
                setSubmittedData(null);
                setFormValues({
                  jenisKelamin: "Laki-laki",
                  jenjang: "MI (Madrasah Ibtidaiyah)",
                  statusMukim: "SANTRI (Mukim di Asrama Sayyid Sulaiman)",
                  konsulat: "Jabodetabek",
                  provinsi: "Jawa Barat",
                  kotaKab: "Bekasi",
                });
              }}
              className="text-xs text-muted-foreground hover:text-emerald-600 underline transition-colors cursor-pointer"
            >
              Daftarkan Calon Santri Lain
            </button>
          </div>
        </div>

        {/* Modal Print Slip Tanda Terima */}
        {showPrintModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setShowPrintModal(false)}
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
                  Jl. Lapangan Kranji, Bintara, Bekasi Barat, Kota Bekasi, Jawa Barat 17134 • Telp: {settings.contactPhone} • Website: dksidogiribekasi.vercel.app
                </div>
              </div>

              {/* Judul Dokumen */}
              <div className="text-center space-y-1">
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                  BUKTI PENDAFTARAN SANTRI BARU (PPDB)
                </span>
                <div className="font-mono text-xs font-bold text-slate-800">
                  NO. REGISTRASI: {submittedData.regId}
                </div>
              </div>

              {/* Rincian Calon Santri */}
              <div className="space-y-2 text-xs border-y border-dashed border-slate-300 py-3">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Nama Calon Santri:</span>
                  <span className="font-bold text-slate-900">{submittedData.namaLengkap}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Pilihan Program:</span>
                  <span className="font-bold text-slate-900">{submittedData.jenjang}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Status Tempat Tinggal:</span>
                  <span className="font-bold text-slate-900">{submittedData.statusMukim}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">No. WhatsApp Terdaftar:</span>
                  <span className="font-semibold text-slate-900">{submittedData.noWhatsApp || "-"}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Status Awal Berkas:</span>
                  <span className="font-bold text-emerald-700 uppercase">TERDAFTAR ONLINE (MENUNGGU VERIFIKASI)</span>
                </div>
              </div>

              {/* Petunjuk Panitia */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-1 text-left">
                <span className="font-bold block text-slate-800">Instruksi Verifikasi Fisik &amp; Seleksi:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Bawalah lembar bukti pendaftaran ini saat hadir verifikasi berkas di kantor sekretariat.</li>
                  <li>Sertakan fotokopi Kartu Keluarga (KK), Akta Kelahiran, dan pas foto 3x4 (3 lembar).</li>
                  <li>Jadwal tes baca tartil Al-Qur&apos;an dan wawancara wali santri akan dihubungi oleh panitia via WhatsApp.</li>
                </ul>
              </div>

              {/* Tanda Tangan */}
              <div className="flex justify-between items-end pt-2 text-[10px] text-slate-700">
                <div className="text-center space-y-8">
                  <div>Wali Santri / Pendaftar</div>
                  <div className="font-semibold">(......................................)</div>
                </div>
                <div className="text-center space-y-8">
                  <div>Bekasi, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br />Panitia PPDB DK Sidogiri</div>
                  <div className="font-semibold text-slate-900">(Panitia Penerimaan)</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full text-xs font-semibold shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Printer size={13} />
                  <span>Cetak Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // VIEW: FORMULIR PENDAFTARAN DINAMIS (ACTIVE)
  // =========================================================
  return (
    <div className="relative min-w-0 max-w-full overflow-x-hidden pb-16 pt-6 sm:pt-10">
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-8 relative z-10">

        {/* Hero Banner Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
            <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Penerimaan Santri Baru TA {settings.academicYear}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground font-serif">
            {settings.title}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {settings.subtitle}
          </p>

          {/* Announcement Card */}
          {settings.announcement && (
            <div className="mt-4 p-4 sm:p-5 rounded-2xl liquid-glass border border-emerald-500/30 bg-emerald-500/5 text-left text-xs leading-relaxed max-w-2xl mx-auto space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                <FileText size={14} />
                <span>Petunjuk &amp; Informasi Pendaftaran</span>
              </div>
              <p className="text-foreground/90">{settings.announcement}</p>
              {settings.contactPhone && (
                <div className="pt-1 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Phone size={11} className="text-emerald-600" />
                  <span>
                    Layanan Bantuan / Helpdesk WhatsApp: <strong>{settings.contactPhone}</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Announcements Showcase */}
        {sortedAnnouncements.length > 0 && (
          <div className="rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  <Megaphone size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Pengumuman &amp; Petunjuk Resmi PPDB</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-foreground">
                  Informasi Penting Penerimaan Santri
                </h3>
                <p className="text-xs text-muted-foreground">
                  Simak jadwal tes seleksi, berkas fisik yang wajib dibawa, dan ketentuan asrama di bawah ini.
                </p>
              </div>

              {/* Filter Kategori Pengumuman */}
              <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
                {[
                  { key: "ALL", label: "Semua" },
                  { key: "schedule", label: "Jadwal" },
                  { key: "info", label: "Berkas" },
                  { key: "success", label: "Fasilitas" },
                  { key: "warning", label: "Penting" },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setAnnouncementCategoryFilter(cat.key)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      announcementCategoryFilter === cat.key
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "liquid-glass-pill text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Kartu Pengumuman */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAnnouncements.map((ann) => {
                const categoryStyle = {
                  schedule: {
                    badge: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
                    label: "Jadwal Seleksi",
                    accent: "border-amber-500/40 bg-amber-500/5",
                  },
                  info: {
                    badge: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
                    label: "Informasi Berkas",
                    accent: "border-emerald-500/40 bg-emerald-500/5",
                  },
                  warning: {
                    badge: "bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30",
                    label: "Penting",
                    accent: "border-rose-500/40 bg-rose-500/5",
                  },
                  success: {
                    badge: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30",
                    label: "Fasilitas Asrama",
                    accent: "border-teal-500/40 bg-teal-500/5",
                  },
                }[ann.category] || {
                  badge: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
                  label: "Informasi",
                  accent: "border-emerald-500/40 bg-emerald-500/5",
                };

                return (
                  <div
                    key={ann.id}
                    className={`p-5 rounded-2xl liquid-glass border transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${categoryStyle.accent}`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${categoryStyle.badge}`}>
                          <Tag size={10} />
                          <span>{categoryStyle.label}</span>
                        </span>

                        {ann.pinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                            <Pin size={10} className="fill-current" />
                            <span>Tersemat</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-foreground text-sm sm:text-base leading-snug font-serif">
                        {ann.title}
                      </h4>

                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {ann.content}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/30">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar size={12} className="text-emerald-600" />
                        <span>{ann.date || "Agenda PPDB"}</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                        Sidogiri Bekasi
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl liquid-glass border border-rose-500/40 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start gap-2.5 shadow-md">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
            <span className="flex-1 leading-relaxed">{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Dynamic Form Container */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Data Diri Calon Santri */}
          {santriFields.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b border-border/40 pb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base font-serif">
                    Data Identitas Calon Santri
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Lengkapi identitas diri santri sesuai dokumen kependudukan resmi
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {santriFields.map((field) => (
                  <div
                    key={field.id}
                    className={field.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}
                  >
                    <label htmlFor={field.id} className="block text-xs font-semibold text-foreground">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    {renderFieldInput(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Pilihan Program & Asrama */}
          {pendidikanFields.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b border-border/40 pb-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base font-serif">
                    Pilihan Unit Pendidikan &amp; Asrama
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Pilih madrasah dan status mukim asrama di Pondok Sidogiri Bekasi
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendidikanFields.map((field) => (
                  <div
                    key={field.id}
                    className={field.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}
                  >
                    <label htmlFor={field.id} className="block text-xs font-semibold text-foreground">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    {renderFieldInput(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Data Orang Tua / Wali */}
          {waliFields.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b border-border/40 pb-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base font-serif">
                    Data Orang Tua &amp; Kontak Wali Sah
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Pastikan nomor WhatsApp aktif untuk penerimaan informasi jadwal tes
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {waliFields.map((field) => (
                  <div
                    key={field.id}
                    className={field.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}
                  >
                    <label htmlFor={field.id} className="block text-xs font-semibold text-foreground">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    {renderFieldInput(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Informasi Tambahan */}
          {lainnyaFields.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b border-border/40 pb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base font-serif">
                    Informasi Tambahan
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Riwayat kesehatan, hafalan, atau catatan khusus calon santri
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lainnyaFields.map((field) => (
                  <div
                    key={field.id}
                    className={field.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}
                  >
                    <label htmlFor={field.id} className="block text-xs font-semibold text-foreground">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    {renderFieldInput(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button & Confirmation Notice */}
          <div className="p-6 rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 text-center space-y-4">
            <p className="text-[11px] text-muted-foreground max-w-lg mx-auto">
              Dengan mengirimkan formulir ini, saya menyatakan bahwa data yang diisikan adalah benar dan bersedia mengikuti prosedur penerimaan santri baru Pondok Pesantren Sidogiri Ranting Bekasi.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="liquid-sheen inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold shadow-xl shadow-emerald-900/20 hover:shadow-emerald-700/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50 w-full sm:w-auto"
            >
              {isSubmitting ? (
                <span>Sedang Mengirimkan Formulir...</span>
              ) : (
                <>
                  <UserPlus size={16} className="stroke-[2.5]" />
                  <span>Kirim Formulir Pendaftaran Sekarang</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
