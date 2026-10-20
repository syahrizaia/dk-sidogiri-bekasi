"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { getStudentsAction, updateStudentAction } from "@/lib/actions/students";
import { getCurrentUserAction } from "@/lib/actions/auth";
import { getUserPermissionsAction, type UserPermissionsResult } from "@/lib/actions/roles";
import { 
  Search, 
  ArrowLeft, 
  Download, 
  UserPlus, 
  Eye, 
  X, 
  GraduationCap, 
  MapPin,
  Pencil,
  CheckCircle2,
  HeartHandshake,
  MessageCircle,
  ChevronRight,
  Printer
} from "lucide-react";
import { exportCorporateCSV } from "@/lib/export-utils";

interface Santri {
  id: string;
  nis: string;
  nama: string;
  jenjang: "MI" | "MTs" | "TPQ";
  kelas: string;
  konsulat: string;
  status: "MUKIM" | "NON-MUKIM";
  kamar: string;
  wali: string;
  noHp: string;
  parentRelation?: "Ayah" | "Ibu" | "Wali";
  parentAddress?: string;
}

// Mock Data Santri Darul Khidmah Sidogiri Bekasi
const santriList: Santri[] = [
  { id: "1", nis: "2024.11.001", nama: "Ahmad Fawaid", jenjang: "MI", kelas: "6 Ibtidaiyah A", konsulat: "Bekasi Timur", status: "MUKIM", kamar: "Blok A - Kamar 04", wali: "H. Abdullah Syukri", noHp: "081234567890" },
  { id: "2", nis: "2024.11.002", nama: "Muhammad Lutfi Hakim", jenjang: "MTs", kelas: "Persiapan 1 MTs", konsulat: "Tambun Selatan", status: "NON-MUKIM", kamar: "Non-Asrama (Tambun)", wali: "Ust. Miftahul Huda", noHp: "081398765432" },
  { id: "3", nis: "2024.11.003", nama: "Zainal Abidin", jenjang: "MI", kelas: "5 Ibtidaiyah C", konsulat: "Cikarang Barat", status: "MUKIM", kamar: "Blok B - Kamar 12", wali: "Kyai Manshur", noHp: "085612348765" },
  { id: "4", nis: "2024.11.004", nama: "Khoirul Anam", jenjang: "TPQ", kelas: "Jilid 6 Al-Qur'an", konsulat: "Mustikajaya", status: "NON-MUKIM", kamar: "Non-Asrama (Mustikajaya)", wali: "Bpk. Samsul Arifin", noHp: "087789012345" },
  { id: "5", nis: "2024.11.005", nama: "Fauzan Nur Rahmat", jenjang: "MI", kelas: "4 Ibtidaiyah B", konsulat: "Rawalumbu", status: "MUKIM", kamar: "Blok A - Kamar 08", wali: "Ir. H. Gunawan", noHp: "081233445566" },
  { id: "6", nis: "2024.11.006", nama: "Ilham Ramadhan", jenjang: "MTs", kelas: "Persiapan 1 MTs", konsulat: "DKI Jakarta", status: "MUKIM", kamar: "Blok B - Kamar 02", wali: "Dr. Bambang Sutrisno", noHp: "081566778899" },
  { id: "7", nis: "2024.11.007", nama: "Ali Zainal Musthofa", jenjang: "MI", kelas: "6 Ibtidaiyah A", konsulat: "Bekasi Utara", status: "MUKIM", kamar: "Blok A - Kamar 09", wali: "H. Abdul Wahab", noHp: "081822334455" },
  { id: "8", nis: "2024.11.008", nama: "Hasan Bisri", jenjang: "TPQ", kelas: "Tartil Tajwid", konsulat: "Pondok Gede", status: "NON-MUKIM", kamar: "Non-Asrama (Pondok Gede)", wali: "Bpk. Sukron Ma'mun", noHp: "082199887766" },
];

export default function StudentsMasterPage() {
  const [dataList, setDataList] = useState<Santri[]>(santriList);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [userPermissions, setUserPermissions] = useState<UserPermissionsResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenjang, setFilterJenjang] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Dynamic RBAC: canEdit merujuk langsung ke wewenang 'update' pada modul students di database
  const canEdit = userPermissions
    ? Boolean(userPermissions.crudPermissions?.students?.update)
    : (currentUserRole !== "wali_santri" && currentUserRole !== "orang_tua" && currentUserRole !== "parent");

  // Edit State
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [editForm, setEditForm] = useState<Partial<Santri>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleOpenEdit = (santri: Santri) => {
    setEditingSantri(santri);
    setEditForm({ ...santri });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSantri || !editForm.nama || !editForm.nis) return;
    try {
      setIsUpdating(true);
      const res = await updateStudentAction(editingSantri.id, editForm);
      if (res.success) {
        setDataList((prev) =>
          prev.map((s) => (s.id === editingSantri.id ? ({ ...s, ...editForm } as Santri) : s))
        );
        if (selectedSantri && selectedSantri.id === editingSantri.id) {
          setSelectedSantri({ ...selectedSantri, ...editForm } as Santri);
        }
        setFeedbackMsg("Data santri berhasil diperbarui!");
        setTimeout(() => {
          setEditingSantri(null);
          setFeedbackMsg(null);
        }, 1200);
      } else {
        alert(res.error || "Gagal memperbarui data santri.");
      }
    } catch {
      alert("Terjadi gangguan saat menyimpan perubahan data santri.");
    } finally {
      setIsUpdating(false);
    }
  };

  React.useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setIsLoading(true);
        const [res, user, permsRes] = await Promise.all([
          getStudentsAction(),
          getCurrentUserAction(),
          getUserPermissionsAction(),
        ]);
        if (!ignore) {
          if (res.success && Array.isArray(res.data)) {
            setDataList(res.data as unknown as Santri[]);
          }
          if (user?.role) {
            setCurrentUserRole(user.role.toLowerCase());
          }
          if (permsRes.success && permsRes.data) {
            setUserPermissions(permsRes.data);
          }
        }
      } catch {
        // Graceful fallback to default data
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return dataList.filter((item) => {
      const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.konsulat.toLowerCase().includes(searchQuery.toLowerCase());
      const matchJenjang = filterJenjang === "Semua" || item.jenjang === filterJenjang;
      const matchStatus = filterStatus === "Semua" || item.status === filterStatus;
      return matchSearch && matchJenjang && matchStatus;
    });
  }, [dataList, searchQuery, filterJenjang, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleExportSantriCSV = () => {
    if (!filteredData.length) return;
    exportCorporateCSV({
      filename: `Laporan_Induk_Santri_DK_Sidogiri`,
      title: "Buku Induk Pangkalan Data Pokok Santri",
      subtitle: "Daftar Peserta Didik Madrasah Miftahul Ulum & TPQ Tartil Sidogiri",
      metadata: {
        "Jenjang": filterJenjang === "ALL" ? "Seluruh Jenjang (MI, MTs, TPQ)" : filterJenjang,
        "Status Santri": filterStatus === "ALL" ? "Seluruh Status" : filterStatus,
        "Kata Kunci Pencarian": searchQuery || "Semua Data",
      },
      columns: [
        { header: "No", accessor: (_, idx) => idx + 1 },
        { header: "Nomor Induk Santri (NIS)", accessor: "nis", isNumericId: true },
        { header: "Nama Lengkap Santri", accessor: "nama" },
        { header: "Jenjang", accessor: "jenjang" },
        { header: "Kelas / Halaqoh", accessor: "kelas" },
        { header: "Konsulat Asal", accessor: "konsulat" },
        { header: "Status Keberadaan", accessor: "status" },
        { header: "Kamar / Asrama", accessor: (s) => s.kamar || "-" },
        { header: "Nama Wali Santri", accessor: (s) => s.wali || "-" },
        { header: "No. WhatsApp Wali", accessor: (s) => s.noHp || "-", isNumericId: true },
      ],
      data: filteredData,
    });
  };

  return (
    <div className="w-full transition-colors duration-400 py-6 sm:py-8">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link 
            href="/modules" 
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full liquid-glass-pill text-muted-foreground hover:text-foreground transition-all duration-300 w-fit"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Modul Sistem</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link 
              href="/modules/admissions" 
              className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-600 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <UserPlus size={14} />
              <span>Registrasi Santri Baru</span>
            </Link>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/15">
                Buku Induk Kependidikan
              </span>
              <span className="text-xs text-muted-foreground">Darul Khidmah Sidogiri Bekasi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Pangkalan Data Induk Santri
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Daftar peserta didik aktif Madrasah Miftahul Ulum (MI & persiapan MTs) dan TPQ Tartil Darul Khidmah Sidogiri Bekasi.
            </p>
          </div>

          <button 
            type="button"
            onClick={handleExportSantriCSV}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:bg-white/40 transition-all cursor-pointer active:scale-95"
            title="Unduh seluruh data santri hasil filter sebagai file CSV"
          >
            <Download size={14} />
            <span>Unduh Laporan Induk</span>
          </button>
        </div>

        {/* Filter & Search Bar Panel */}
        <div className="liquid-glass rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Cari nama santri, NIS, atau konsulat..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md pl-11 pr-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all"
              />
            </div>

            {/* Filter Jenjang */}
            <div>
              <select 
                value={filterJenjang}
                onChange={(e) => {
                  setFilterJenjang(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all cursor-pointer"
              >
                <option value="Semua">Semua Lembaga</option>
                <option value="MI">Madrasah Ibtidaiyah (MI)</option>
                <option value="MTs">Madrasah Tsanawiyah (MTs) - Tahun Depan</option>
                <option value="TPQ">TPQ Al-Qur&apos;an</option>
              </select>
            </div>

            {/* Filter Status Kemukiman */}
            <div>
              <select 
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                <option value="MUKIM">Santri Mukim (Asrama)</option>
                <option value="NON-MUKIM">Murid Non-Mukim (Pulang)</option>
              </select>
            </div>

          </div>
        </div>

        {/* Data Table Container with Liquid Glass Material */}
        <div className="liquid-glass rounded-3xl shadow-xl overflow-hidden border border-border/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-border/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Nomor Induk (NIS)</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">Jenjang & Kelas</th>
                  <th className="px-6 py-4">Konsulat Asal</th>
                  <th className="px-6 py-4">Status & Kamar</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-xs text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>Sinkronisasi pangkalan data santri...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-emerald-500/5 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                        {item.nis}
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        {item.nama}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full liquid-glass-pill text-xs">
                          <span className="font-bold text-emerald-800 dark:text-emerald-300">{item.jenjang}</span>
                          <span className="text-muted-foreground text-[11px]">({item.kelas})</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground/90 flex items-center gap-1.5">
                        <MapPin size={13} className="text-muted-foreground" />
                        <span>{item.konsulat}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === "MUKIM" 
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20" 
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                          }`}>
                            {item.status === "MUKIM" ? "Santri Mukim" : "Murid Pulang"}
                          </span>
                          <p className="text-[11px] text-muted-foreground">{item.kamar}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            type="button"
                            onClick={() => setSelectedSantri(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-all cursor-pointer"
                            title="Lihat Kartu Data"
                          >
                            <Eye size={13} />
                            <span>Kartu Data</span>
                          </button>
                          {canEdit && (
                            <button 
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer"
                              title="Edit Data Santri"
                            >
                              <Pencil size={13} />
                              <span>Edit</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      Tidak ada santri yang sesuai dengan kata kunci atau filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 sm:p-5 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              Menampilkan {paginatedData.length} dari {filteredData.length} santri terdata (Halaman {currentPage} dari {totalPages}).
            </span>
            <div className="flex items-center gap-1.5">
              <button 
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className={`px-3 py-1 rounded-full liquid-glass-pill transition-all cursor-pointer ${
                  currentPage <= 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-white/40 active:scale-95"
                }`}
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-emerald-600 text-white shadow-md"
                      : "liquid-glass-pill hover:bg-white/40"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button 
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className={`px-3 py-1 rounded-full liquid-glass-pill transition-all cursor-pointer ${
                  currentPage >= totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-white/40 active:scale-95"
                }`}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>

        {/* Modal Detail Kartu Santri Sidogiri (Kartu Data) */}
        {selectedSantri && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setSelectedSantri(null)}
          >
            <div 
              className="relative w-full max-w-lg max-h-[85dvh] sm:max-h-[88dvh] flex flex-col rounded-2xl sm:rounded-[28px] liquid-glass-elevated border border-white/80 dark:border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Pinned Modal Header */}
              <div className="shrink-0 p-3.5 sm:p-5 border-b border-border/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-950/20 shrink-0">
                    <GraduationCap size={22} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block truncate">
                      Kartu Identitas Santri
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-foreground truncate">{selectedSantri.nama}</h3>
                    <p className="font-mono text-xs text-muted-foreground truncate">NIS: {selectedSantri.nis}</p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setSelectedSantri(null)}
                  className="p-1.5 sm:p-2 rounded-full liquid-glass-pill text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                  title="Tutup"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Content Body (Fits Mobile Screen Height) */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl liquid-glass border border-border/40">
                    <span className="text-muted-foreground text-[10px] block">Lembaga &amp; Kelas:</span>
                    <span className="font-bold text-foreground text-xs sm:text-sm">{selectedSantri.jenjang} - {selectedSantri.kelas}</span>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl liquid-glass border border-border/40">
                    <span className="text-muted-foreground text-[10px] block">Konsulat Daerah:</span>
                    <span className="font-bold text-foreground text-xs sm:text-sm">{selectedSantri.konsulat}</span>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl liquid-glass border border-border/40">
                    <span className="text-muted-foreground text-[10px] block">Status Kemukiman:</span>
                    <span className="font-bold text-foreground text-xs sm:text-sm">{selectedSantri.status}</span>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl liquid-glass border border-border/40">
                    <span className="text-muted-foreground text-[10px] block">Penempatan Kamar:</span>
                    <span className="font-bold text-foreground text-xs sm:text-sm">{selectedSantri.kamar}</span>
                  </div>
                </div>

                {/* Relasi Data Wali Santri Terhubung */}
                <div className="p-3.5 sm:p-4 rounded-2xl liquid-glass border border-emerald-500/30 bg-emerald-500/5 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      <HeartHandshake size={14} className="text-emerald-600" />
                      <span>Relasi Data Wali Santri</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                      Terhubung di MongoDB
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/30">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Nama Wali &amp; Hubungan:</span>
                      <strong className="text-foreground text-xs">{selectedSantri.wali}</strong>
                      <span className="text-[10px] text-muted-foreground block mt-0.5 font-medium">
                        (Hubungan: {selectedSantri.parentRelation || "Wali"})
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted-foreground block">Kontak WhatsApp:</span>
                      {selectedSantri.noHp ? (
                        <a
                          href={`https://wa.me/${selectedSantri.noHp.replace(/[^0-9]/g, "").startsWith("0") ? "62" + selectedSantri.noHp.replace(/[^0-9]/g, "").slice(1) : selectedSantri.noHp.replace(/[^0-9]/g, "")}?text=Assalamu%27alaikum%20Warahmatullahi%20Wabarakatuh%20Bapak%2FIbu%20${encodeURIComponent(selectedSantri.wali)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold hover:underline"
                        >
                          <MessageCircle size={12} />
                          <span>{selectedSantri.noHp}</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Belum terdata</span>
                      )}
                    </div>
                  </div>

                  {selectedSantri.parentAddress && (
                    <div className="pt-1 text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin size={12} className="text-emerald-600 shrink-0" />
                      <span className="truncate">Domisili: {selectedSantri.parentAddress}</span>
                    </div>
                  )}

                  <div className="pt-1.5 flex justify-end">
                    <Link
                      href={`/parents?search=${encodeURIComponent(selectedSantri.nis)}`}
                      className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Buka Profil Wali di Portal Keluarga</span>
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Pinned Modal Footer */}
              <div className="shrink-0 p-3 sm:p-4 border-t border-border/40 flex items-center justify-between gap-2 bg-background/50 backdrop-blur-md">
                {canEdit ? (
                  <button 
                    type="button"
                    onClick={() => handleOpenEdit(selectedSantri)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:bg-amber-500/10 hover:text-amber-600 transition-colors cursor-pointer"
                  >
                    <Pencil size={13} />
                    <span>Edit Data</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setSelectedSantri(null)}
                    className="px-3.5 py-2 rounded-full liquid-glass-pill text-xs font-semibold text-foreground cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button 
                    type="button"
                    onClick={() => window.print()}
                    className="liquid-sheen inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-700 to-teal-600 text-white px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold shadow-md cursor-pointer hover:shadow-lg transition-all active:scale-95"
                    title="Cetak KTS atau simpan sebagai dokumen PDF resmi"
                  >
                    <Printer size={13} />
                    <span>Cetak KTS / PDF</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Modal Edit Data Santri */}
        {editingSantri && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200"
            onClick={() => !isUpdating && setEditingSantri(null)}
          >
            <div 
              className="relative w-full max-w-lg max-h-[88dvh] sm:max-h-[min(90vh,calc(100dvh-2rem))] flex flex-col rounded-2xl sm:rounded-[28px] liquid-glass-elevated border border-white/50 dark:border-white/10 shadow-2xl text-foreground overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Pinned Modal Header */}
              <div className="shrink-0 p-4 sm:p-5 border-b border-border/40 flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-bold truncate">Perbarui Data Pokok Santri</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    Edit profil, nomor induk, wali, dan asrama untuk <strong>{editingSantri.nama}</strong>.
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => !isUpdating && setEditingSantri(null)}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                  title="Tutup"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form with Scrollable Fields and Pinned Footer */}
              <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 min-h-0 text-xs">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {feedbackMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 size={16} />
                      <span className="font-semibold">{feedbackMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Nama Lengkap Santri *</label>
                      <input 
                        type="text"
                        required
                        value={editForm.nama || ""}
                        onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Nomor Induk Santri (NIS) *</label>
                      <input 
                        type="text"
                        required
                        value={editForm.nis || ""}
                        onChange={(e) => setEditForm({ ...editForm, nis: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Jenjang Lembaga *</label>
                      <select 
                        value={editForm.jenjang || "MI"}
                        onChange={(e) => setEditForm({ ...editForm, jenjang: e.target.value as "MI" | "MTs" | "TPQ" })}
                        className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-foreground focus:outline-none bg-background cursor-pointer"
                      >
                        <option value="MI">MI (Madrasah Ibtidaiyah)</option>
                        <option value="MTs">MTs (Madrasah Tsanawiyah)</option>
                        <option value="TPQ">TPQ Metode Tartil</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Kelas / Rombel *</label>
                      <input 
                        type="text"
                        required
                        value={editForm.kelas || ""}
                        onChange={(e) => setEditForm({ ...editForm, kelas: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Konsulat Daerah *</label>
                      <input 
                        type="text"
                        required
                        value={editForm.konsulat || ""}
                        onChange={(e) => setEditForm({ ...editForm, konsulat: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Status Kemukiman *</label>
                      <select 
                        value={editForm.status || "MUKIM"}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as "MUKIM" | "NON-MUKIM" })}
                        className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-foreground focus:outline-none bg-background cursor-pointer"
                      >
                        <option value="MUKIM">Santri Mukim (Asrama)</option>
                        <option value="NON-MUKIM">Santri Non-Mukim (Laju/Pulang)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Kamar / Lokasi Asrama</label>
                    <input 
                      type="text"
                      value={editForm.kamar || ""}
                      onChange={(e) => setEditForm({ ...editForm, kamar: e.target.value })}
                      placeholder="misal: Blok A - Kamar 04 atau Non-Asrama"
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Nama Wali Santri</label>
                      <input 
                        type="text"
                        value={editForm.wali || ""}
                        onChange={(e) => setEditForm({ ...editForm, wali: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Hubungan Keluarga</label>
                      <select 
                        value={editForm.parentRelation || "Ayah"}
                        onChange={(e) => setEditForm({ ...editForm, parentRelation: e.target.value as "Ayah" | "Ibu" | "Wali" })}
                        className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-foreground focus:outline-none bg-background cursor-pointer"
                      >
                        <option value="Ayah">Ayah</option>
                        <option value="Ibu">Ibu</option>
                        <option value="Wali">Wali Lainnya</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">No. WhatsApp / HP</label>
                      <input 
                        type="tel"
                        value={editForm.noHp || ""}
                        onChange={(e) => setEditForm({ ...editForm, noHp: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-foreground focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Alamat Domisili Wali</label>
                      <input 
                        type="text"
                        placeholder="Contoh: Bekasi Timur, Kota Bekasi"
                        value={editForm.parentAddress || ""}
                        onChange={(e) => setEditForm({ ...editForm, parentAddress: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <HeartHandshake size={12} />
                    <span>Perubahan data wali akan disinkronkan otomatis ke database Wali Santri.</span>
                  </div>
                </div>

                {/* Pinned Modal Footer */}
                <div className="shrink-0 p-3.5 sm:p-4 border-t border-border/40 flex items-center justify-end gap-3 bg-background/50 backdrop-blur-md">
                  <button 
                    type="button"
                    disabled={isUpdating}
                    onClick={() => setEditingSantri(null)}
                    className="px-4 py-2 rounded-full liquid-glass border border-white/30 text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
