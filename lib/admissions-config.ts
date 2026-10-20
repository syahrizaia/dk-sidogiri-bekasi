export type AdmissionStatus = "TERDAFTAR_ONLINE" | "VERIFIKASI_BERKAS" | "LULUS_SELEKSI" | "DITOLAK";

export type FieldInputType = "text" | "number" | "select" | "textarea" | "date";
export type FieldSection = "data_santri" | "data_wali" | "data_pendidikan" | "lainnya";

export interface DynamicFormField {
  id: string;
  label: string;
  type: FieldInputType;
  placeholder: string;
  required: boolean;
  enabled: boolean;
  options?: string[];
  order: number;
  section: FieldSection;
}

export interface AdmissionAnnouncement {
  id: string;
  title: string;
  content: string;
  category: "info" | "warning" | "success" | "schedule";
  date?: string;
  pinned?: boolean;
}

export interface AdmissionSettings {
  id: string;
  isOpen: boolean;
  academicYear: string;
  title: string;
  subtitle: string;
  announcement: string;
  announcements?: AdmissionAnnouncement[];
  closedMessage: string;
  contactPhone: string;
  startDate?: string;
  endDate?: string;
  customFields: DynamicFormField[];
  updatedAt: string;
  updatedBy?: string;
}

export interface PendaftaranPayload {
  namaLengkap: string;
  nik?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  namaAyah?: string;
  namaIbu?: string;
  noWhatsApp?: string;
  provinsi?: string;
  kotaKab?: string;
  alamatLengkap?: string;
  konsulat?: string;
  jenjang: "MI" | "MTs" | "TPQ" | string;
  statusMukim: "SANTRI" | "MURID" | string;
  catatanKhusus?: string;
  asalSekolah?: string;
  dynamicResponses?: Record<string, any>;
  [key: string]: any;
}

export interface AdmissionRecord {
  id: string;
  _id: string;
  regId: string;
  namaLengkap: string;
  nik?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  namaAyah?: string;
  namaIbu?: string;
  noWhatsApp?: string;
  provinsi?: string;
  kotaKab?: string;
  alamatLengkap?: string;
  konsulat?: string;
  jenjang: "MI" | "MTs" | "TPQ" | string;
  statusMukim: "SANTRI" | "MURID" | string;
  catatanKhusus?: string;
  asalSekolah?: string;
  statusPendaftaran: AdmissionStatus;
  catatanAdmin?: string;
  verifiedBy?: string;
  dynamicResponses?: Record<string, any>;
  updatedAt?: string;
  createdAt: string;
}

export interface AdmissionsOverviewData {
  totalApplicants: number;
  totalOnline: number;
  totalVerified: number;
  totalAccepted: number;
  totalRejected: number;
  items: AdmissionRecord[];
}

export const defaultAdmissionSettings: AdmissionSettings = {
  id: "default_admission_settings",
  isOpen: true,
  academicYear: "2026/2027",
  title: "Penerimaan Santri Baru (PPDB)",
  subtitle: "Pondok Pesantren Sidogiri Ranting Bekasi • MI, MTs Persiapan, & TPQ Tartil",
  announcement:
    "Pendaftaran Santri Baru Tahun Ajaran 2026/2027 resmi dibuka. Harap melengkapi seluruh berkas identitas calon santri dan data wali sah secara benar dan lengkap sebelum mengirimkan formulir.",
  closedMessage:
    "Pendaftaran Santri Baru saat ini sedang ditutup atau belum memasuki jadwal penerimaan gelombang berikutnya. Silakan hubungi Sekretariat Darul Khidmah Sidogiri Bekasi untuk informasi berkas dan jadwal tes.",
  contactPhone: "0812-8899-1201",
  startDate: "2026-03-01",
  endDate: "2026-07-15",
  announcements: [
    {
      id: "ann-1",
      title: "Jadwal Ujian Masuk & Seleksi Tartil Gelombang 1",
      content:
        "Tes seleksi baca Al-Qur'an (metode Pasuruan), tes fardhu 'ain, dan wawancara kesiapan wali santri akan diselenggarakan pada hari Ahad, 24 Mei 2026 pukul 08.00 WIB di Kompleks Darul Khidmah Sidogiri Bekasi.",
      category: "schedule",
      date: "2026-05-24",
      pinned: true,
    },
    {
      id: "ann-2",
      title: "Kelengkapan Berkas Fisik Saat Hadir di Pesantren",
      content:
        "Calon santri wajib membawa: Fotokopi Akta Kelahiran (3 lembar), Fotokopi Kartu Keluarga (3 lembar), Surat Keterangan Lulus/Surat Pindah (bagi mutasi), dan Pasfoto 3x4 berseragam putih latar biru (4 lembar).",
      category: "info",
      date: "2026-04-01",
      pinned: false,
    },
    {
      id: "ann-3",
      title: "Informasi Fasilitas Asrama Santri Sayyid Sulaiman",
      content:
        "Bagi calon santri yang memilih status Mukim Asrama, lemari santri dan kasur standar pesantren telah disediakan. Santri disarankan hanya membawa perlengkapan ibadah, seragam, dan kitab yang ditentukan.",
      category: "success",
      date: "2026-04-10",
      pinned: false,
    },
  ],
  customFields: [
    {
      id: "namaLengkap",
      label: "Nama Lengkap Calon Santri",
      type: "text",
      placeholder: "Sesuai akta kelahiran / kartu keluarga",
      required: true,
      enabled: true,
      order: 1,
      section: "data_santri",
    },
    {
      id: "nik",
      label: "Nomor Induk Kependudukan (NIK)",
      type: "text",
      placeholder: "16 digit NIK calon santri",
      required: false,
      enabled: true,
      order: 2,
      section: "data_santri",
    },
    {
      id: "tempatLahir",
      label: "Tempat Lahir",
      type: "text",
      placeholder: "Kota/Kabupaten kelahiran",
      required: true,
      enabled: true,
      order: 3,
      section: "data_santri",
    },
    {
      id: "tanggalLahir",
      label: "Tanggal Lahir",
      type: "date",
      placeholder: "YYYY-MM-DD",
      required: true,
      enabled: true,
      order: 4,
      section: "data_santri",
    },
    {
      id: "jenisKelamin",
      label: "Jenis Kelamin",
      type: "select",
      placeholder: "Pilih jenis kelamin",
      required: true,
      enabled: true,
      options: ["Laki-laki", "Perempuan"],
      order: 5,
      section: "data_santri",
    },
    {
      id: "jenjang",
      label: "Jenjang Pendidikan yang Dituju",
      type: "select",
      placeholder: "Pilih jenjang",
      required: true,
      enabled: true,
      options: [
        "MI (Madrasah Ibtidaiyah)",
        "MTs (Madrasah Tsanawiyah Persiapan)",
        "TPQ (Tartil Al-Qur'an Sidogiri)",
      ],
      order: 6,
      section: "data_pendidikan",
    },
    {
      id: "statusMukim",
      label: "Pilihan Status Domisili",
      type: "select",
      placeholder: "Pilih status tempat tinggal",
      required: true,
      enabled: true,
      options: [
        "SANTRI (Mukim di Asrama Sayyid Sulaiman)",
        "MURID (Non-Mukim / Pulang-Pergi)",
      ],
      order: 7,
      section: "data_pendidikan",
    },
    {
      id: "konsulat",
      label: "Konsulat / Wilayah Asal",
      type: "select",
      placeholder: "Pilih konsulat",
      required: true,
      enabled: true,
      options: ["Jabodetabek", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Luar Jawa"],
      order: 8,
      section: "data_santri",
    },
    {
      id: "namaAyah",
      label: "Nama Ayah Kandung",
      type: "text",
      placeholder: "Nama lengkap ayah kandung",
      required: true,
      enabled: true,
      order: 9,
      section: "data_wali",
    },
    {
      id: "namaIbu",
      label: "Nama Ibu Kandung",
      type: "text",
      placeholder: "Nama lengkap ibu kandung",
      required: true,
      enabled: true,
      order: 10,
      section: "data_wali",
    },
    {
      id: "noWhatsApp",
      label: "Nomor WhatsApp Wali (Aktif)",
      type: "text",
      placeholder: "Contoh: 081288991201",
      required: true,
      enabled: true,
      order: 11,
      section: "data_wali",
    },
    {
      id: "kotaKab",
      label: "Kota / Kabupaten Domisili",
      type: "text",
      placeholder: "Contoh: Kota Bekasi",
      required: true,
      enabled: true,
      order: 12,
      section: "data_wali",
    },
    {
      id: "alamatLengkap",
      label: "Alamat Domisili Lengkap",
      type: "textarea",
      placeholder: "Nama jalan, RT/RW, kelurahan, kecamatan...",
      required: true,
      enabled: true,
      order: 13,
      section: "data_wali",
    },
    {
      id: "asalSekolah",
      label: "Asal Sekolah / Madrasah Sebelumnya",
      type: "text",
      placeholder: "Nama TK/RA/SD/MI asal calon santri",
      required: false,
      enabled: true,
      order: 14,
      section: "data_pendidikan",
    },
    {
      id: "catatanKhusus",
      label: "Catatan Khusus / Riwayat Kesehatan / Hafalan",
      type: "textarea",
      placeholder: "Tuliskan riwayat hafalan Al-Qur'an, alergi, atau catatan khusus lainnya jika ada",
      required: false,
      enabled: true,
      order: 15,
      section: "lainnya",
    },
  ],
  updatedAt: new Date().toISOString(),
  updatedBy: "Sistem",
};

export const defaultAdmissions = [
  {
    regId: "DKS-2026-1042",
    namaLengkap: "Muhammad Ilham Maulana",
    nik: "3275011204120001",
    tempatLahir: "Bekasi",
    tanggalLahir: "2014-05-12",
    jenisKelamin: "Laki-laki",
    namaAyah: "H. Syamsul Arifin",
    namaIbu: "Hj. Nur Aini",
    noWhatsApp: "081288991201",
    provinsi: "Jawa Barat",
    kotaKab: "Bekasi",
    alamatLengkap: "Jl. Lapangan Kranji No. 45, Bintara, Bekasi Barat",
    konsulat: "Jabodetabek",
    jenjang: "MI",
    statusMukim: "SANTRI",
    catatanKhusus: "Pindahan dari madrasah salaf, sudah hafal juz 30.",
    statusPendaftaran: "LULUS_SELEKSI",
    catatanAdmin: "Berkas lengkap. Lulus tes baca Al-Qur'an dan wawancara wali.",
    verifiedBy: "Staf Administrasi",
    createdAt: new Date("2026-03-10T09:15:00Z").toISOString(),
  },
  {
    regId: "DKS-2026-2105",
    namaLengkap: "Ahmad Zaidan Mubarak",
    nik: "3275022508110002",
    tempatLahir: "Jakarta",
    tanggalLahir: "2013-08-25",
    jenisKelamin: "Laki-laki",
    namaAyah: "Drs. M. Fathoni",
    namaIbu: "Siti Masruroh",
    noWhatsApp: "085694210344",
    provinsi: "DKI Jakarta",
    kotaKab: "Jakarta Timur",
    alamatLengkap: "Jl. Raya Pondok Kelapa Blok B7/12, Duren Sawit",
    konsulat: "Jabodetabek",
    jenjang: "MTs",
    statusMukim: "SANTRI",
    catatanKhusus: "Mendaftar kelas persiapan madrasah tsanawiyah.",
    statusPendaftaran: "VERIFIKASI_BERKAS",
    catatanAdmin: "Menunggu legalisir rapor kelas 6 dan kartu keluarga.",
    verifiedBy: "Staf Administrasi",
    createdAt: new Date("2026-03-18T14:20:00Z").toISOString(),
  },
  {
    regId: "DKS-2026-3391",
    namaLengkap: "Fatimah Azzahra Putri",
    nik: "3275034102170003",
    tempatLahir: "Bekasi",
    tanggalLahir: "2019-02-14",
    jenisKelamin: "Perempuan",
    namaAyah: "Rahmat Hidayat",
    namaIbu: "Dewi Lestari",
    noWhatsApp: "087788112233",
    provinsi: "Jawa Barat",
    kotaKab: "Bekasi",
    alamatLengkap: "Perumahan Harapan Indah Blok DB/08, Medan Satria",
    konsulat: "Jabodetabek",
    jenjang: "TPQ",
    statusMukim: "MURID",
    catatanKhusus: "Kelas tartil sore Sidogiri.",
    statusPendaftaran: "TERDAFTAR_ONLINE",
    catatanAdmin: "Pendaftaran via portal publik DK Sidogiri Bekasi.",
    createdAt: new Date("2026-04-01T10:00:00Z").toISOString(),
  },
  {
    regId: "DKS-2026-4482",
    namaLengkap: "Rayhan Al-Fatih Subagja",
    nik: "3275041909130004",
    tempatLahir: "Bekasi",
    tanggalLahir: "2015-09-19",
    jenisKelamin: "Laki-laki",
    namaAyah: "Budi Subagja",
    namaIbu: "Rina Kusuma",
    noWhatsApp: "081399447722",
    provinsi: "Jawa Barat",
    kotaKab: "Bekasi",
    alamatLengkap: "Jl. Kemang Pratama Raya No. 18, Rawalumbu",
    konsulat: "Jabodetabek",
    jenjang: "MI",
    statusMukim: "SANTRI",
    catatanKhusus: "Memiliki riwayat asma ringan.",
    statusPendaftaran: "TERDAFTAR_ONLINE",
    catatanAdmin: "Berkas awal terunggah daring, jadwal wawancara diatur.",
    createdAt: new Date("2026-04-05T11:45:00Z").toISOString(),
  },
  {
    regId: "DKS-2026-5593",
    namaLengkap: "Umar Abdul Aziz",
    nik: "3275050303120005",
    tempatLahir: "Karawang",
    tanggalLahir: "2014-03-03",
    jenisKelamin: "Laki-laki",
    namaAyah: "H. Saepul Bahri",
    namaIbu: "Halimah",
    noWhatsApp: "082112349090",
    provinsi: "Jawa Barat",
    kotaKab: "Karawang",
    alamatLengkap: "Dusun Krajan RT 02/01, Rengasdengklok",
    konsulat: "Jawa Barat",
    jenjang: "MTs",
    statusMukim: "SANTRI",
    catatanKhusus: "Santri mukim Asrama Sayyid Sulaiman.",
    statusPendaftaran: "LULUS_SELEKSI",
    catatanAdmin: "Diterima penuh di Asrama Santri & Kelas MTs Persiapan.",
    verifiedBy: "Ketua Ranting",
    createdAt: new Date("2026-04-08T08:30:00Z").toISOString(),
  },
  {
    regId: "DKS-2026-6674",
    namaLengkap: "Siti Khadijah Marwa",
    nik: "3275065011180006",
    tempatLahir: "Bekasi",
    tanggalLahir: "2018-11-10",
    jenisKelamin: "Perempuan",
    namaAyah: "Hasanuddin",
    namaIbu: "Marwah Al-Idrus",
    noWhatsApp: "085712998877",
    provinsi: "Jawa Barat",
    kotaKab: "Bekasi",
    alamatLengkap: "Jl. Kaliabang Tengah No. 24, Bekasi Utara",
    konsulat: "Jabodetabek",
    jenjang: "TPQ",
    statusMukim: "MURID",
    catatanKhusus: "Murid sore TPQ Tartil Al-Qur'an.",
    statusPendaftaran: "VERIFIKASI_BERKAS",
    catatanAdmin: "Wawancara orang tua selesai, berkas foto santri diverifikasi.",
    verifiedBy: "Staf Administrasi",
    createdAt: new Date("2026-04-12T16:15:00Z").toISOString(),
  },
  {
    regId: "DKS-2026-7842",
    namaLengkap: "Abdullah Gymnastiar Rasyid",
    nik: "3275071407150007",
    tempatLahir: "Bekasi",
    tanggalLahir: "2015-07-14",
    jenisKelamin: "Laki-laki",
    namaAyah: "Ir. Hendra Rasyid",
    namaIbu: "Farida Utami",
    noWhatsApp: "081299880011",
    provinsi: "Jawa Barat",
    kotaKab: "Bekasi",
    alamatLengkap: "Jl. Jatiwaringin Asri Blok C4/19, Pondok Gede",
    konsulat: "Jabodetabek",
    jenjang: "MI",
    statusMukim: "MURID",
    catatanKhusus: "Santri non-mukim.",
    statusPendaftaran: "DITOLAK",
    catatanAdmin: "Membatalkan pendaftaran karena mutasi tugas orang tua ke luar pulau.",
    verifiedBy: "Staf Administrasi",
    createdAt: new Date("2026-04-14T13:10:00Z").toISOString(),
  },
];
