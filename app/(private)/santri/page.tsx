"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { getStudentsAction } from "@/lib/actions/students";
import { 
  Search, 
  ArrowLeft, 
  Download, 
  UserPlus, 
  Eye, 
  X, 
  GraduationCap, 
  MapPin 
} from "lucide-react";

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

export default function DataIndukSantri() {
  const [dataList, setDataList] = useState<Santri[]>(santriList);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenjang, setFilterJenjang] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);

  React.useEffect(() => {
    let ignore = false;
    async function loadSantri() {
      try {
        setIsLoading(true);
        const res = await getStudentsAction();
        if (res.success && Array.isArray(res.data) && !ignore) {
          setDataList(res.data as unknown as Santri[]);
        }
      } catch {
        // Graceful fallback to default data
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadSantri();
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
              href="/santri-baru" 
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
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:bg-white/40 transition-all cursor-pointer"
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md pl-11 pr-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all"
              />
            </div>

            {/* Filter Jenjang */}
            <div>
              <select 
                value={filterJenjang}
                onChange={(e) => setFilterJenjang(e.target.value)}
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
                onChange={(e) => setFilterStatus(e.target.value)}
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
                ) : filteredData.length > 0 ? (
                  filteredData.map((item) => (
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
                        <button 
                          type="button"
                          onClick={() => setSelectedSantri(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-all cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Kartu Data</span>
                        </button>
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
            <span>Menampilkan {filteredData.length} santri dari total 1.245 santri terdata.</span>
            <div className="flex items-center gap-2">
              <button disabled className="px-3 py-1 rounded-full liquid-glass-pill opacity-50 cursor-not-allowed">Sebelumnya</button>
              <button className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold">1</button>
              <button className="px-3 py-1 rounded-full liquid-glass-pill hover:bg-white/40">2</button>
              <button className="px-3 py-1 rounded-full liquid-glass-pill hover:bg-white/40">Selanjutnya</button>
            </div>
          </div>
        </div>

        {/* Modal Detail Kartu Santri Sidogiri */}
        {selectedSantri && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg rounded-[32px] liquid-glass-elevated border border-white/80 dark:border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-950/20">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Kartu Identitas Santri
                    </span>
                    <h3 className="text-xl font-extrabold text-foreground">{selectedSantri.nama}</h3>
                    <p className="font-mono text-xs text-muted-foreground">NIS: {selectedSantri.nis}</p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setSelectedSantri(null)}
                  className="p-2 rounded-full liquid-glass-pill text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl liquid-glass border border-border/40">
                  <span className="text-muted-foreground text-[10px] block">Lembaga & Kelas:</span>
                  <span className="font-bold text-foreground text-sm">{selectedSantri.jenjang} - {selectedSantri.kelas}</span>
                </div>
                <div className="p-3.5 rounded-2xl liquid-glass border border-border/40">
                  <span className="text-muted-foreground text-[10px] block">Konsulat Daerah:</span>
                  <span className="font-bold text-foreground text-sm">{selectedSantri.konsulat}</span>
                </div>
                <div className="p-3.5 rounded-2xl liquid-glass border border-border/40">
                  <span className="text-muted-foreground text-[10px] block">Status Kemukiman:</span>
                  <span className="font-bold text-foreground text-sm">{selectedSantri.status}</span>
                </div>
                <div className="p-3.5 rounded-2xl liquid-glass border border-border/40">
                  <span className="text-muted-foreground text-[10px] block">Penempatan Kamar:</span>
                  <span className="font-bold text-foreground text-sm">{selectedSantri.kamar}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Wali Santri:</span>
                  <strong className="text-foreground">{selectedSantri.wali}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">WhatsApp Wali:</span>
                  <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{selectedSantri.noHp}</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                <button 
                  type="button"
                  onClick={() => setSelectedSantri(null)}
                  className="px-5 py-2.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground cursor-pointer"
                >
                  Tutup
                </button>
                <button 
                  type="button"
                  onClick={() => alert(`Mencetak kartu santri: ${selectedSantri.nama}`)}
                  className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-600 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-md cursor-pointer"
                >
                  <Download size={14} />
                  <span>Cetak KTS Digital</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
