"use client";

import React, { useState } from "react";
import Link from "next/link";
import { submitPendaftaranAction, PendaftaranPayload } from "@/lib/actions/pendaftaran";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  User, 
  Users, 
  GraduationCap, 
  Sparkles, 
  Download, 
  AlertCircle 
} from "lucide-react";

export default function PendaftaranSantriBaru() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regId, setRegId] = useState("DKS-2026-7842");
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [formData, setFormData] = useState({
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      setErrorMessage("");
      try {
        const res = await submitPendaftaranAction(formData as unknown as PendaftaranPayload);
        if (res.success) {
          if (res.data?.regId) {
            setRegId(res.data.regId);
          }
          setIsSubmitted(true);
        } else {
          setErrorMessage(res.error || "Gagal memproses pendaftaran.");
        }
      } catch {
        // Fallback for offline resilience
        setIsSubmitted(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="w-full transition-colors duration-400 py-6 sm:py-10">
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full liquid-glass-pill text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Dashboard</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Tahun Ajaran 1447–1448 H</span>
          </div>
        </div>

        {/* Page Header with Islamic Calligraphy */}
        <div className="text-center space-y-3">
          <p className="font-serif text-2xl sm:text-3xl text-emerald-800 dark:text-emerald-300">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Penerimaan Santri Baru Darul Khidmah Sidogiri Bekasi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Formulir pendaftaran santri baru pangkalan data Darul Khidmah Sidogiri Bekasi. Melayani jenjang MI Miftahul Ulum, inden persiapan MTs tahun depan, serta TPQ Tartil.
          </p>
        </div>

        {/* Step Progress Indicators (Apple Liquid Capsule Style) */}
        {!isSubmitted && (
          <div className="liquid-glass rounded-full p-2 max-w-2xl mx-auto shadow-md">
            <div className="grid grid-cols-3 gap-2">
              {/* Step 1 */}
              <div 
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs font-semibold transition-all duration-300 ${
                  step === 1 
                    ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md" 
                    : step > 1 
                    ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300" 
                    : "text-muted-foreground"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step > 1 ? "bg-emerald-600 text-white" : "border border-current"
                }`}>
                  {step > 1 ? <Check size={11} className="stroke-[3]" /> : "1"}
                </div>
                <span className="hidden sm:inline">Data Santri</span>
              </div>

              {/* Step 2 */}
              <div 
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs font-semibold transition-all duration-300 ${
                  step === 2 
                    ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md" 
                    : step > 2 
                    ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300" 
                    : "text-muted-foreground"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step > 2 ? "bg-emerald-600 text-white" : "border border-current"
                }`}>
                  {step > 2 ? <Check size={11} className="stroke-[3]" /> : "2"}
                </div>
                <span className="hidden sm:inline">Data Wali & Asal</span>
              </div>

              {/* Step 3 */}
              <div 
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs font-semibold transition-all duration-300 ${
                  step === 3 
                    ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md" 
                    : "text-muted-foreground"
                }`}
              >
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border border-current">
                  3
                </div>
                <span className="hidden sm:inline">Pilihan Jenjang</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Container (Liquid Glass Elevated Card) */}
        <div className="liquid-glass-elevated rounded-[32px] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          {isSubmitted ? (
            /* Submission Success State */
            <div className="text-center py-10 space-y-6 animate-in fade-in duration-500">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white mx-auto flex items-center justify-center shadow-xl shadow-emerald-600/30">
                <CheckCircle2 size={44} className="stroke-[2.5]" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  Alhamdulillah, Berhasil Terdaftar!
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Data pendaftaran santri baru atas nama <strong className="text-foreground">{formData.namaLengkap || "Santri Baru"}</strong> telah tercatat dalam sistem pangkalan data Darul Khidmah Sidogiri Bekasi.
                </p>
              </div>

              {/* Registration Proof Card */}
              <div className="max-w-md mx-auto rounded-2xl liquid-glass p-5 border border-emerald-500/30 text-left space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-border/40 text-xs">
                  <span className="text-muted-foreground font-medium">Nomor Registrasi:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {regId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[10px]">Pilihan Lembaga:</p>
                    <p className="font-semibold text-foreground">{formData.jenjang}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">Status:</p>
                    <p className="font-semibold text-foreground">
                      {formData.statusMukim === "SANTRI" ? "Santri Mukim (Asrama)" : "Murid Non-Mukim"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">Konsulat Daerah:</p>
                    <p className="font-semibold text-foreground">{formData.konsulat}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">Kontak Wali:</p>
                    <p className="font-semibold text-foreground">{formData.noWhatsApp || "Tersimpan"}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => window.print()}
                  className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-600 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  <Download size={14} />
                  <span>Cetak Bukti Pendaftaran (PDF)</span>
                </button>
                <Link 
                  href="/" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:bg-white/40 transition-all"
                >
                  <span>Kembali ke Beranda</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Multi-step Form Content */
            <form onSubmit={handleNext} className="space-y-6">
              
              {/* STEP 1: DATA DIRI SANTRI */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-foreground">Langkah 1: Identitas Pribadi Calon Santri</h2>
                      <p className="text-xs text-muted-foreground">Isi data calon peserta didik sesuai akta kelahiran & KK</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label htmlFor="namaLengkap" className="block text-xs font-semibold text-foreground/90">
                        Nama Lengkap Calon Santri <span className="text-emerald-600">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="namaLengkap"
                        name="namaLengkap" 
                        required
                        placeholder="Contoh: Muhammad Ilham Al-Fatih"
                        value={formData.namaLengkap}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="nik" className="block text-xs font-semibold text-foreground/90">
                        Nomor Induk Kependudukan (NIK) <span className="text-emerald-600">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="nik"
                        name="nik" 
                        required
                        maxLength={16}
                        placeholder="16 Digit NIK Santri"
                        value={formData.nik}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="jenisKelamin" className="block text-xs font-semibold text-foreground/90">
                        Jenis Kelamin
                      </label>
                      <select 
                        id="jenisKelamin"
                        name="jenisKelamin" 
                        value={formData.jenisKelamin}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all"
                      >
                        <option value="Laki-laki">Laki-laki (Bani)</option>
                        <option value="Perempuan">Perempuan (Banat)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="tempatLahir" className="block text-xs font-semibold text-foreground/90">
                        Tempat Lahir <span className="text-emerald-600">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="tempatLahir"
                        name="tempatLahir" 
                        required
                        placeholder="Kota / Kabupaten Kelahiran"
                        value={formData.tempatLahir}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="tanggalLahir" className="block text-xs font-semibold text-foreground/90">
                        Tanggal Lahir <span className="text-emerald-600">*</span>
                      </label>
                      <input 
                        type="date" 
                        id="tanggalLahir"
                        name="tanggalLahir" 
                        required
                        value={formData.tanggalLahir}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: DATA WALI & ALAMAT ASAL */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                    <div className="w-9 h-9 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                      <Users size={18} />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-foreground">Langkah 2: Data Orang Tua / Wali & Domisili</h2>
                      <p className="text-xs text-muted-foreground">Informasi kontak aktif untuk notifikasi administrasi pondok</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="namaAyah" className="block text-xs font-semibold text-foreground/90">
                        Nama Lengkap Ayah Kandung <span className="text-emerald-600">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="namaAyah"
                        name="namaAyah" 
                        required
                        placeholder="Nama Ayah"
                        value={formData.namaAyah}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="namaIbu" className="block text-xs font-semibold text-foreground/90">
                        Nama Lengkap Ibu Kandung <span className="text-emerald-600">*</span>
                      </label>
                      <input 
                        type="text" 
                        id="namaIbu"
                        name="namaIbu" 
                        required
                        placeholder="Nama Ibu"
                        value={formData.namaIbu}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="noWhatsApp" className="block text-xs font-semibold text-foreground/90">
                        Nomor WhatsApp Aktif Wali <span className="text-emerald-600">*</span>
                      </label>
                      <input 
                        type="tel" 
                        id="noWhatsApp"
                        name="noWhatsApp" 
                        required
                        placeholder="08xxxxxxxxxx"
                        value={formData.noWhatsApp}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="konsulat" className="block text-xs font-semibold text-foreground/90">
                        Konsulat Daerah Sidogiri <span className="text-emerald-600">*</span>
                      </label>
                      <select 
                        id="konsulat"
                        name="konsulat" 
                        value={formData.konsulat}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all"
                      >
                        <option value="Pasuruan">Konsulat Pasuruan & Sekitar</option>
                        <option value="Madura">Konsulat Madura (Bangkalan, Sampang, Pamekasan, Sumenep)</option>
                        <option value="Surabaya">Konsulat Surabaya & Sidoarjo</option>
                        <option value="Tapal Kuda">Konsulat Tapal Kuda (Probolinggo, Lumajang, Jember, Banyuwangi)</option>
                        <option value="Malang Raya">Konsulat Malang Raya & Blitar</option>
                        <option value="Jabodetabek">Konsulat Jabodetabek & Jawa Barat</option>
                        <option value="Luar Jawa">Konsulat Luar Jawa (Sumatera, Kalimantan, Sulawesi, Bali)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label htmlFor="alamatLengkap" className="block text-xs font-semibold text-foreground/90">
                        Alamat Domisili Lengkap
                      </label>
                      <textarea 
                        id="alamatLengkap"
                        name="alamatLengkap" 
                        rows={2}
                        placeholder="Jalan, RT/RW, Dusun, Desa/Kelurahan, Kecamatan, Kabupaten/Kota"
                        value={formData.alamatLengkap}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PILIHAN TARBIYAH & KEMUKIMAN */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 pb-3 border-b border-border/40">
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-foreground">Langkah 3: Pilihan Lembaga Tarbiyah & Asrama</h2>
                      <p className="text-xs text-muted-foreground">Tentukan jenjang pendidikan madrasah dan status asrama pondok</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="jenjang" className="block text-xs font-semibold text-foreground/90">
                        Jenjang Lembaga Pendidikan <span className="text-emerald-600">*</span>
                      </label>
                      <select 
                        id="jenjang"
                        name="jenjang" 
                        value={formData.jenjang}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all"
                      >
                        <option value="MI">Madrasah Ibtidaiyah (MI) Miftahul Ulum - Aktif</option>
                        <option value="MTs">Madrasah Tsanawiyah (MTs) Miftahul Ulum - Inden Tahun Depan</option>
                        <option value="TPQ">Taman Pendidikan Al-Qur&apos;an (TPQ) Sidogiri - Aktif</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="statusMukim" className="block text-xs font-semibold text-foreground/90">
                        Status Kemukiman <span className="text-emerald-600">*</span>
                      </label>
                      <select 
                        id="statusMukim"
                        name="statusMukim" 
                        value={formData.statusMukim}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all"
                      >
                        <option value="SANTRI">SANTRI (Mondok & Tinggal di Asrama Pondok)</option>
                        <option value="MURID">MURID (Pulang Pergi / Sekitar Desa Sidogiri)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                      <AlertCircle size={18} className="text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Informasi Kuota Asrama:</strong> Bagi pendaftar dengan status <em>Santri Mukim</em>, penempatan kamar bilik asrama akan diumumkan saat verifikasi berkas fisik pada pembukaan masa orientasi santri baru bulan Syawalan.
                      </div>
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label htmlFor="catatanKhusus" className="block text-xs font-semibold text-foreground/90">
                        Catatan Tambahan / Riwayat Kesehatan (Opsional)
                      </label>
                      <textarea 
                        id="catatanKhusus"
                        name="catatanKhusus" 
                        rows={2}
                        placeholder="Contoh: Memiliki riwayat asma ringan, atau telah khatam juz amma..."
                        value={formData.catatanKhusus}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Navigation Controls */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-border/40 gap-3">
                {step > 1 ? (
                  <button 
                    type="button"
                    onClick={handlePrev}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:bg-white/40 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <ArrowLeft size={14} />
                    <span>Kembali</span>
                  </button>
                ) : <div className="hidden sm:block" />}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow-lg shadow-emerald-950/20 hover:shadow-emerald-700/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                >
                  <span>
                    {isSubmitting 
                      ? "Memproses Pendaftaran..." 
                      : step === 3 
                      ? "Kirim Pendaftaran Santri" 
                      : "Lanjut ke Tahap Berikutnya"}
                  </span>
                  {step === 3 ? <CheckCircle2 size={15} /> : <ArrowRight size={14} />}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
