/**
 * Utilitas Ekspor Dokumen Standar Korporat & Institusional
 * Darul Khidmah Sidogiri Bekasi
 *
 * Mendukung ekspor CSV / Excel dengan:
 * - Kop Surat Resmi Institusi (Pondok Pesantren Sidogiri Ranting Bekasi)
 * - Metadata dokumen (Judul, Tanggal Cetak, Total Baris, Filter)
 * - UTF-8 Byte Order Mark (BOM: \uFEFF) untuk kompatibilitas penuh Microsoft Excel
 * - Proteksi data sel numerik (NIK, NIS, No. HP, No. Registrasi) dari korupsi scientific notation
 */

export const INSTITUTION_INFO = {
  organization: "PONDOK PESANTREN SIDOGIRI - RANTING BEKASI",
  unit: "DARUL KHIDMAH SIDOGIRI BEKASI",
  subHeader: "Madrasah Miftahul Ulum (MI - MTs Persiapan) • TPQ Tartil Al-Qur'an Sidogiri",
  address: "Jl. Lapangan Kranji, Bintara, Bekasi Barat, Kota Bekasi, Jawa Barat 17134",
  phone: "0812-3456-7890",
  email: "sekretariat@sidogiri-bekasi.sch.id",
};

export interface CsvColumn<T = any> {
  header: string;
  accessor?: keyof T | ((row: T, index: number) => any);
  isNumericId?: boolean; // Jika true, diproteksi agar tidak menjadi scientific notation di Excel
}

export interface ExportCorporateCsvOptions<T = any> {
  filename: string;
  title: string;
  subtitle?: string;
  metadata?: Record<string, string | number>;
  columns: (string | CsvColumn<T>)[];
  data: T[];
}

/**
 * Format timestamp bahasa Indonesia standar resmi
 */
export function formatIndonesianTimestamp(date: Date = new Date()): string {
  const d = date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const t = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${d}, ${t} WIB`;
}

/**
 * Sanitasi nilai sel CSV agar aman dari injeksi koma, tanda kutip, dan korupsi format Excel
 */
export function sanitizeCsvValue(val: any, isNumericId = false): string {
  if (val === null || val === undefined) return '""';
  
  let str = String(val).trim();

  // Jika string merupakan ID panjang/nomor telepon/kode registrasi yang berpotensi dikonversi Excel ke eksponen:
  // e.g. NIK 16 digit ("3275..."), No HP ("0812..."), NIS ("2024.11.001"), No Reg ("DKS-...")
  if (isNumericId || (/^\d{10,}$/.test(str) || /^0\d+$/.test(str) || /^\d+\.\d+\.\d+$/.test(str))) {
    // Format standar Excel text formula: ="isi" menjamin sel dibaca sebagai string teks murni
    return `="${str.replace(/"/g, '""')}"`;
  }

  // Escape double quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Eksekusi ekspor CSV korporat dengan Kop Surat Lembaga & UTF-8 BOM
 */
export function exportCorporateCSV<T = any>({
  filename,
  title,
  subtitle,
  metadata = {},
  columns,
  data,
}: ExportCorporateCsvOptions<T>): void {
  const timestamp = new Date();
  const dateStr = timestamp.toISOString().split("T")[0];
  const timeStr = timestamp.toTimeString().split(" ")[0].replace(/:/g, "");

  // Siapkan baris-baris dokumen
  const lines: string[] = [];

  // 1. KOP SURAT RESMI INSTITUSI
  lines.push(`"${INSTITUTION_INFO.organization}"`);
  lines.push(`"${INSTITUTION_INFO.unit}"`);
  lines.push(`"${INSTITUTION_INFO.subHeader}"`);
  lines.push(`"${INSTITUTION_INFO.address} • Telp: ${INSTITUTION_INFO.phone}"`);
  lines.push('""'); // Baris pemisah

  // 2. JUDUL DOKUMEN & METADATA
  lines.push(`"DOKUMEN RESMI: ${title.toUpperCase()}"`);
  if (subtitle) {
    lines.push(`"DESKRIPSI: ${subtitle}"`);
  }
  lines.push(`"TANGGAL CETAK: ${formatIndonesianTimestamp(timestamp)}"`);
  lines.push(`"TOTAL DATA: ${data.length} Baris Data"`);

  // Metadata kustom (Filter, Pencatat, Periode, dll)
  for (const [key, val] of Object.entries(metadata)) {
    lines.push(`"${key.toUpperCase()}: ${val}"`);
  }
  lines.push('""'); // Baris pemisah sebelum tabel

  // 3. BARIS HEADER TABEL
  const headerRow = columns.map((col) => {
    const text = typeof col === "string" ? col : col.header;
    return `"${text.toUpperCase().replace(/"/g, '""')}"`;
  });
  lines.push(headerRow.join(","));

  // 4. BARIS DATA TABEL
  data.forEach((row, index) => {
    const rowValues = columns.map((col) => {
      let val: any;
      let isNumericId = false;

      if (typeof col === "string") {
        val = Array.isArray(row) ? row[index] : (row as any)[col];
      } else {
        isNumericId = !!col.isNumericId;
        if (typeof col.accessor === "function") {
          val = col.accessor(row, index);
        } else if (col.accessor) {
          val = (row as any)[col.accessor];
        } else {
          val = (row as any)[col.header];
        }
      }

      return sanitizeCsvValue(val, isNumericId);
    });

    lines.push(rowValues.join(","));
  });

  // 5. FOOTER RESMI DOKUMEN
  lines.push('""');
  lines.push(`"--- Akhir Dokumen Resmi • Dicetak melalui Sistem Informasi Terpadu Darul Khidmah Sidogiri Bekasi ---"`);

  // 6. GENERASI BERKAS DENGAN UTF-8 BOM
  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const cleanFilename = filename.endsWith(".csv") ? filename : `${filename}_${dateStr}_${timeStr}.csv`;
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
