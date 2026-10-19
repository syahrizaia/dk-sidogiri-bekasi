# 🌿 Darul Khidmah Sidogiri Bekasi
### *Enterprise Integrated Education System & Salafiyah Digital Portal*

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_7.7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![UI Design](https://img.shields.io/badge/Design-Apple_Liquid_Glass-10B981?style=for-the-badge&logo=apple&logoColor=white)](https://developer.apple.com/documentation/technologyoverviews/liquid-glass)
[![Security](https://img.shields.io/badge/Security-Zero_Network_Exposure-059669?style=for-the-badge&logo=shield&logoColor=white)](#keamanan-sistem--zero-network-exposure)
[![Turbopack](https://img.shields.io/badge/Bundler-Turbopack_Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://turbo.build/pack)

---

## 📌 Ikhtisar Platform

**Darul Khidmah Sidogiri Bekasi** adalah platform manajemen pendidikan dan sistem informasi kepesantrenan generasi terbaru yang mengintegrasikan seluruh lini akademik, administrasi, dan asrama di bawah naungan Pondok Pesantren Sidogiri di wilayah Bekasi, Jawa Barat.

Sistem ini melayani:
- **Madrasah Ibtidaiyah (MI) Miftahul Ulum:** Jenjang pendidikan dasar salafiyah (Kelas Shifir dan Kelas 1–6).
- **Madrasah Tsanawiyah (MTs) Miftahul Ulum:** Persiapan pembukaan jenjang lanjutan salafiyah & kajian gramatika Arab.
- **Taman Pendidikan Al-Qur'an (TPQ) Metode Tartil Sidogiri:** Bimbingan tahsin, tartil, dan tahfidz Al-Qur'an otentik Sidogiri.
- **Kompleks Asrama Santri Mukim:** Manajemen bilik, ranjang, inventaris, dan perizinan santri.

Dibangun dengan arsitektur **Next.js 16 App Router**, **React 19**, dan basis data **MongoDB Atlas**, aplikasi ini menggabungkan kemewahan antarmuka **Apple Liquid Glass** dengan perimeter keamanan tingkat tinggi **Zero Network Exposure**.

---

## ✨ Fitur Unggulan

### 1. 💎 Antarmuka Apple Liquid Glass (visionOS / macOS Spec)
*Merujuk pada spesifikasi resmi [Apple Developer Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/liquid-glass) dan [Apple Human Interface Guidelines (HIG) - Materials](https://developer.apple.com/design/human-interface-guidelines/materials)*:
- **Dua Varian Material Resmi Apple:**
  - **Regular Variant (`.liquid-glass`):** Material fungsional utama untuk floating capsule navbars, sidebars, sheets, dan modul popovers. Mengatur refraksi dan saturasi `blur(32px) saturate(210%)` demi menjamin ketajaman teks di atas latar dinamis.
  - **Clear Variant (`.liquid-glass-clear`):** Material ultra-translusen dengan opasitas tipis `0.22` dan `blur(20px) saturate(220%)`, dirancang khusus untuk elemen kontrol yang mengapung di atas latar belakang kaya media (foto/video galeri) sesuai panduan HIG.
- **Specular Rim Lighting & Multi-Layered Shadows:** Refleksi tepi kaca ganda menggunakan *inset shadows* berlapis (`inset 0 1px 1px 0 ...` dan elevasi bayangan `0 24px 48px -12px ...`) yang menciptakan ilusi ketebalan lensa optik dan cembungan tepi kaca visionOS/macOS otentik.
- **Fluid Interactive States & Liquid Sheen Sweep:** Transisi responsif kurva pegas Apple (`cubic-bezier(0.16, 1, 0.3, 1)`) disertai efek kilau cahaya mengalir (*liquid sheen*) saat kursor berinteraksi dengan kartu atau tombol.
- **Wadah Efek Kaca Terpadu (`.glass-effect-container`):** Koordinasi multi-elemen kaca bersarang (*nested views*) yang membaurkan bayangan dan refraksi secara konsentris.
- **Dual Mode Estetik Khas Pesantren:** *Pristine Alabaster Glass* pada Light Mode dan *Obsidian Smoked Glass & Deep Jade* pada Dark Mode.

### 2. 🛡️ Keamanan Zero Network Exposure
- **Server Actions & Server Components Exclusive:** Seluruh mutasi data dan kueri database dieksekusi secara privat di sisi server menggunakan direktif `"use server"` dan proteksi `import "server-only"`. Tidak ada API credentials, koneksi database string, atau kueri MongoDB yang terpapar ke browser client.
- **Perimeter Edge Defense ([proxy.ts](file:///Users/syahrizaalsistani/Documents/Projects/dk-sidogiri/proxy.ts)):** Inspeksi otomatis terhadap pola injeksi NoSQL (`$where`, `$regex`, `$gt`, `{"$`) dan upaya XSS berbahaya di seluruh query string dan URL parameter dengan respon langsung HTTP 400 Bad Request.
- **Enterprise HTTP Security Headers:** Konfigurasi CSP (*Content Security Policy*) ketat, HSTS Preload 2 tahun (`max-age=63072000; includeSubDomains; preload`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, serta pemblokiran sensor perangkat via `Permissions-Policy`.

### 3. 📚 Modul Sistem Akademik & Tata Kelola Santri
- **Buku Induk Santri:** Rekam data santri aktif, alumni, nomor induk pesantren (NIS), riwayat kelas, dan status mukim/non-mukim.
- **Manajemen Dewan Asatidz:** Data guru madrasah, bidang keahlian kitab kuning, dan jadwal mengajar halaqoh.
- **Portal Wali Santri:** Monitoring hafalan, rekam presensi, catatan disiplin, dan pelaporan SPP bulanan.
- **Sistem Asrama & Kamar:** Tata kelola bilik/asrama, alokasi kasur, kapasitas hunian, dan rekam perizinan santri mukim.
- **Penerimaan Santri Baru (PSB) Online:** Alur pendaftaran mandiri 4 tahap berbasis formulir interaktif dengan validasi data wali dan dokumen santri.
- **Pusat Galeri Media:** Katalog dokumentasi foto dan video kajian salafiyah, wisuda tartil, dan kegiatan hari santri.
- **Kecerdasan Buatan & Data Science Santri:** Dasbor visualisasi performa santri, prediksi kelulusan, dan analitik distribusi santri.

### 4. 🚀 Optimasi SEO Teknis & Metadata
- **Sitemap Dinamis XML (`/sitemap.xml`):** Mengindeks otomatis seluruh entitas profil dan madrasah dengan prioritas pencarian Google.
- **Robots Directive (`/robots.txt`):** Melindungi direktori internal sistem dan mengarahkan crawler mesin pencari ke rute publik.
- **Schema.org JSON-LD:** Penanda terstruktur `@graph` kategori `EducationalOrganization` dan `LocalBusiness` lengkap dengan geo-koordinat Bekasi.

---

## 🏛️ Arsitektur Sistem

```
dk-sidogiri/
├── app/
│   ├── (auth)/                  # Portal Autentikasi (Login; Akun dibuat oleh Super Admin)
│   │   ├── auth/login/page.tsx
│   │   └── layout.tsx           # Layout Berorientasi Kaca dengan Logo Resmi
│   ├── (private)/               # Dasbor & Modul Internal (Memerlukan Sesi & RBAC)
│   │   ├── modules/             # Beranda Modul Sistem & Utilitas
│   │   ├── students/            # Buku Induk Santri
│   │   ├── teachers/            # Manajemen Dewan Asatidz
│   │   ├── parents/             # Portal Wali Santri
│   │   ├── data-science/        # Analitik & Statistik Santri
│   │   └── settings/            # Pengaturan Sistem & Profil Lembaga
│   ├── (public)/                # Halaman Informasi Terbuka Publik
│   │   ├── about/               # Profil, Sejarah, & Dewan Pengasuh
│   │   ├── instansi/            # Unit Pendidikan (MI, MTs, TPQ)
│   │   ├── media/               # Galeri Foto & Dokumentasi Acara
│   │   ├── santri-baru/         # Portal Formulir PSB Online
│   │   └── page.tsx             # Beranda Interaktif Publik
│   ├── api/                     # REST API Handlers Terproteksi
│   ├── globals.css              # Apple Liquid Glass Tokens, Mesh Aura, & Animations
│   ├── layout.tsx               # Root Layout, Metadata SEO, Favicon, & Schema.org
│   ├── not-found.tsx            # Halaman 404 Estetik Apple Liquid Glass
│   ├── robots.ts                # Next.js Native Robots Generator
│   └── sitemap.ts               # Next.js Dynamic XML Sitemap Generator
├── components/
│   ├── ui/                      # Komponen Primitif (Button, Card, Dialog, Badge)
│   ├── public-navbar.tsx        # Floating Glass Capsule Header untuk Publik
│   ├── private-sidebar.tsx      # Sidebar Kolapsibel & Navigasi Modul Privat
│   ├── private-navbar.tsx       # Header Pelengkap Dasbor Internal
│   ├── footer.tsx               # Footer Informasi Legal & Kontak Resmi
│   └── theme-provider.tsx       # Pengelola Tema Terpadu (Next-Themes)
├── lib/
│   ├── actions/                 # Server Actions Mutasi & Query Data ("use server")
│   │   ├── auth.ts              # Login, Logout, Validasi JWT Session
│   │   ├── dormitory.ts         # Server Action Data Asrama & Bilik
│   │   ├── media.ts             # Server Action Katalog Galeri Media
│   │   ├── pendaftaran.ts       # Server Action Penerimaan Santri Baru
│   │   ├── roles.ts             # Server Action Role-Based Access Control
│   │   ├── students.ts          # Server Action Buku Induk Santri
│   │   ├── teachers.ts          # Server Action Dewan Asatidz
│   │   └── users.ts             # Server Action Manajemen Pengguna Sistem
│   ├── auth.ts                  # Enkripsi & Verifikasi Sesi Token (Server-Only)
│   ├── mongodb.ts               # Koneksi Pool MongoDB Atlas Driver (Server-Only)
│   └── utils.ts                 # Utilitas Format & Helper Class Tailwind
├── public/
│   └── logo-sidogiri.jpeg       # Aset Identitas & Logo Resmi Pesantren
├── next.config.ts               # Konfigurasi Turbopack, Image Domains, & CSP Headers
├── proxy.ts                     # Next.js 16 Edge Proxy (Perimeter Defense & RBAC)
└── README.md                    # Dokumentasi Teknis Korporat Proyek
```

---

## 👥 Matriks Hak Akses (Role-Based Access Control)

| Peran Pengguna | Dasbor Modul | Buku Induk Santri | Dewan Asatidz | Wali Santri | Manajemen Asrama | Analisis Data | Pengaturan Sistem |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Super Admin** | ✅ Penuh | ✅ Penuh | ✅ Penuh | ✅ Penuh | ✅ Penuh | ✅ Penuh | ✅ Penuh |
| **Admin** | ✅ Penuh | ✅ Penuh | ✅ Penuh | ✅ Penuh | ✅ Penuh | ✅ Penuh | 🔒 Terbatas |
| **Pengasuh** | ✅ Baca | ✅ Baca | ✅ Baca | ✅ Baca | ✅ Baca | ✅ Baca | 🔒 Tertutup |
| **Ustadz / Asatidz** | ✅ Modul | ✅ Input Nilai | 👁️ Profil | 🔒 Tertutup | 👁️ Izin Asrama | 🔒 Tertutup | 🔒 Tertutup |
| **Wali Santri** | 🔒 Tertutup | 👁️ Santri Sendiri | 👁️ Kontak Guru | ✅ Tagihan/SPP | 👁️ Asrama Anak | 🔒 Tertutup | 🔒 Tertutup |
| **Santri** | 🔒 Tertutup | 👁️ Biodata Sendiri | 👁️ Jadwal | 🔒 Tertutup | 👁️ Bilik Sendiri | 🔒 Tertutup | 🔒 Tertutup |

---

## 🛠️ Persyaratan Lingkungan (Prerequisites)

Sebelum menjalankan aplikasi, pastikan environment Anda telah terpasang:
- **Node.js:** Versi `20.x` atau lebih baru (Disarankan Node LTS).
- **Package Manager:** `npm` (disertakan bersama Node), `pnpm`, atau `yarn`.
- **Database:** Instance aktif **MongoDB Atlas** (atau MongoDB Server lokal versi 7.0+).

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### 1. Kloning Repositori
```bash
git clone https://github.com/syahrizaalsistani/dk-sidogiri.git
cd dk-sidogiri
```

### 2. Konfigurasi Variabel Lingkungan (`.env.local`)
Buat berkas `.env.local` di root direktori proyek:
```bash
cp .env.example .env.local
```
Isi variabel lingkungan berikut sesuai konfigurasi Anda:
```env
# Koneksi Basis Data MongoDB Atlas
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/dk-sidogiri-bekasi?retryWrites=true&w=majority"
MONGODB_DB="dk-sidogiri-bekasi"

# Keamanan Sesi & Kunci JWT
JWT_SECRET="ganti_dengan_string_acak_panjang_dan_sangat_aman_minimal_64_karakter"

# Alamat Publik Situs (Untuk Kanonikal SEO & Metadata)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Menjalankan Server Pengembangan (Turbopack)
```bash
npm run dev
```
Buka browser dan akses [http://localhost:3000](http://localhost:3000).

### 5. Kompilasi Produksi (Production Build)
Untuk memverifikasi tipe TypeScript dan membuat bundle teroptimasi:
```bash
npm run build
```

### 6. Menjalankan Server Produksi
```bash
npm run start
```

---

## 🧪 Pemeriksaan Kualitas & Pengujian (Quality Assurance)

Proyek ini dilengkapi dengan skrip verifikasi ketat:

```bash
# Verifikasi Tipe TypeScript Tanpa Emisi File
npx tsc --noEmit

# Analisis Linting & Kode Bersih
npm run lint

# Audit Uji Coba Perimeter Injeksi NoSQL (Edge Proxy)
curl -sI "http://localhost:3000/?test=%24where"
# Output Diharapkan: HTTP/1.1 400 Bad Request (Perimeter Defense Aktif)

# Verifikasi XML Sitemap & Robots
curl -s http://localhost:3000/sitemap.xml
curl -s http://localhost:3000/robots.txt
```

---

## 🎨 Panduan Identitas Visual

- **Warna Utama (Sidogiri Emerald):** `oklch(0.38 0.14 158)` / Hex `#064e3b`
- **Warna Aksen Kaca (Mint Jade):** `oklch(0.72 0.13 162)` / Hex `#34d399`
- **Warna Kehormatan (Sidogiri Gold):** `oklch(0.78 0.12 85)` / Hex `#d97706`
- **Tipografi Sans:** *Plus Jakarta Sans* (Otomatis dimuat via `next/font/google`)
- **Tipografi Arab & Serif:** *Amiri* (Kajian gramatika & literasi Arab Pegon)

---

## 📄 Lisensi & Hak Cipta

Seluruh kode sumber, aset desain visual, dan dokumentasi ini dikembangkan khusus untuk **Darul Khidmah Sidogiri Bekasi**.  
Hak Cipta © 2026 **Darul Khidmah Sidogiri Bekasi**. Dilindungi oleh Undang-Undang.
