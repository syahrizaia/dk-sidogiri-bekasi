"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { getSessionFromCookies } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { serializeData } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface OrganizationMember {
  _id?: string;
  id?: string;
  name: string;
  title: string;
  category: "PIMPINAN" | "KEPALA_UNIT" | "BIDANG_SEKSI" | "PENASIHAT";
  department?: string;
  photoUrl?: string;
  period: string;
  bio?: string;
  phone?: string;
  email?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AboutContentDocument {
  _id?: string;
  id: "global_about_content";
  heroTagline: string;
  heroDescription: string;
  historyTitle: string;
  historyParagraphs: string[];
  quote: string;
  quoteAuthor: string;
  vision: string;
  missions: string[];
  pancaJiwa: {
    title: string;
    sub: string;
    desc: string;
    color: string;
  }[];
  updatedAt: string;
  updatedBy: string;
}

export interface PublicTeacherItem {
  _id?: string;
  id?: string;
  nip: string;
  name: string;
  role: string;
  institution: "MI" | "MTs" | "TPQ";
  institutions?: ("MI" | "MTs" | "TPQ")[];
  specialization: string;
  phone?: string;
  photoUrl?: string;
  academicYear?: string;
  education?: string;
  publicBio?: string;
  isPublic?: boolean;
  order?: number;
  teachingAssignments?: {
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    unit: "MI" | "MTs" | "TPQ";
  }[];
  homeroomAssignments?: {
    unit: "MI" | "MTs" | "TPQ";
    className: string;
  }[];
}

export interface PublicAboutDataResult {
  content: AboutContentDocument;
  organization: OrganizationMember[];
  teachers: PublicTeacherItem[];
  academicYear: string;
  institutionContact: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    leaderName: string;
  };
}

const DEFAULT_ABOUT_CONTENT: Omit<AboutContentDocument, "_id"> = {
  id: "global_about_content",
  heroTagline: "Khidmah Lil-Ma'had Wal-Ummah — Meneguhkan Sanad Keilmuan, Menjaga Akhlak Salaf, dan Mencetak Generasi Qur'ani.",
  heroDescription:
    "Darul Khidmah Sidogiri Bekasi merupakan representasi pengabdian para alumni dan muhibbin Pondok Pesantren Sidogiri Pasuruan di wilayah Jawa Barat dan Jabodetabek. Menghadirkan lingkungan belajar yang teduh, berdisiplin tinggi, serta memadukan kurikulum pendidikan formal madrasah dan tradisi keilmuan salaf yang otentik.",
  historyTitle: "Warisan Keilmuan Sayyid Sulaiman Sejak 1745 M",
  historyParagraphs: [
    "Pondok Pesantren Sidogiri di Pasuruan, Jawa Timur, didirikan pada tahun 1745 M (1158 H) oleh ulama besar pejuang dakwah, Sayyid Sulaiman (cucu Sunan Gunung Jati Cirebon), bersama santri pertamanya Kiai Aminullah dari Pulau Bawean. Selama hampir tiga abad, Sidogiri teguh mempertahankan nilai kemandirian tanpa bantuan asing yang mengikat, keikhlasan total, dan pengajaran ilmu agama berasaskan Ahlussunnah wal Jama'ah.",
    "Berangkat dari kerinduan masyarakat perkotaan akan pendidikan Islam yang berakar kuat pada nilai-nilai keteladanan Sidogiri, para alumni mendirikan Darul Khidmah Sidogiri Bekasi. Lembaga ini hadir sebagai rumah khidmah yang menyambungkan sanad keilmuan para masyayikh kepada generasi muda di Bekasi dan sekitarnya.",
  ],
  quote:
    "Tujuan utama pesantren bukanlah mencetak sarjana gelar semata, melainkan mencetak hamba-hamba Allah yang bertakwa, beradab mulia, dan berkhidmah tulus bagi agama serta masyarakat.",
  quoteAuthor: "Masyayikh Pondok Pesantren Sidogiri Pasuruan",
  vision:
    "Terwujudnya lembaga pendidikan Islam yang unggul, mandiri, dan berkarakter mulia berdasarkan ajaran Ahlussunnah wal Jama'ah ala Thoriqoti Salafis Shalihin, serta mampu berkontribusi nyata bagi kemaslahatan umat dan peradaban bangsa.",
  missions: [
    "Menyelenggarakan pendidikan formal madrasah (MI & persiapan MTs) yang memadukan kedalaman ilmu syariah dan kurikulum nasional terpadu.",
    "Menumbuhkan keteladanan adab salaf, sopan santun, serta keikhlasan dalam seluruh aspek pergaulan santri dan asatidz.",
    "Membina kemampuan baca tulis dan tahfizh Al-Qur'an secara tartil, fasih, dan bertajwid menggunakan metode khas Sidogiri.",
    "Membentuk santri berjiwa mandiri, tangguh, berwawasan luas, dan siap berkhidmah di tengah masyarakat majemuk.",
  ],
  pancaJiwa: [
    {
      title: "1. Keikhlasan",
      sub: "Lillahi Ta'ala",
      desc: "Berbuat dan menuntut ilmu semata-mata mencari keridhaan Allah SWT tanpa pamrih keduniaan.",
      color: "emerald",
    },
    {
      title: "2. Kesederhanaan",
      sub: "Al-Qana'ah",
      desc: "Hidup bersahaja, wajar, bersyukur, serta mengedepankan ketahanan jiwa di atas kemewahan materi.",
      color: "teal",
    },
    {
      title: "3. Kemandirian",
      sub: "Berdikari",
      desc: "Sanggup menolong diri sendiri, bertanggung jawab atas amanah, dan tidak berpangku tangan.",
      color: "cyan",
    },
    {
      title: "4. Ukhuwah Islamiyah",
      sub: "Persaudaraan Suci",
      desc: "Saling menyayangi, tolong-menolong, dan menjaga ikatan batin sesama santri dan umat Islam.",
      color: "amber",
    },
    {
      title: "5. Bebas Terarah",
      sub: "Berwawasan Luas",
      desc: "Berpikir cerdas, dinamis, dan objektif dalam koridor syariat Islam Ahlussunnah wal Jama'ah.",
      color: "indigo",
    },
  ],
  updatedAt: new Date().toISOString(),
  updatedBy: "Sistem",
};

/**
 * Mengambil seluruh data publik Tentang Kami secara gabungan:
 * - Konten sejarah, visi, misi, dan panca jiwa
 * - Struktur organisasi pengurus ranting & pimpinan unit
 * - Dewan asatidz tahun ajaran sekarang
 * - Kontak & alamat resmi dari pengaturan institusi
 */
export async function getPublicAboutDataAction(): Promise<{
  success: boolean;
  data?: PublicAboutDataResult;
  error?: string;
}> {
  try {
    const db = await getDatabase();

    // 1. Ambil Konten Dinamis Tentang Kami
    const aboutCol = db.collection<AboutContentDocument>("about_contents");
    let contentDoc = await aboutCol.findOne({ id: "global_about_content" });
    if (!contentDoc) {
      const seed = { ...DEFAULT_ABOUT_CONTENT, updatedAt: new Date().toISOString() };
      const res = await aboutCol.insertOne(seed as any);
      contentDoc = { ...seed, _id: res.insertedId.toString() };
    }

    // 2. Ambil Struktur Organisasi Aktif
    const orgCol = db.collection<OrganizationMember>("organization_members");
    const organizationMembers = await orgCol
      .find({ isActive: { $ne: false } })
      .sort({ order: 1, _id: 1 })
      .toArray();

    // 3. Ambil Dewan Asatidz Publik
    const teachersCol = db.collection<PublicTeacherItem>("teachers");
    const teachers = await teachersCol
      .find({ isPublic: { $ne: false } })
      .sort({ order: 1, nip: 1 })
      .toArray();

    // 4. Ambil Tahun Ajaran Aktif & Kontak Institusi dari Settings
    const settingsCol = db.collection("settings");
    const settingsDoc = await settingsCol.findOne({ id: "global_system_settings" });

    const academicYear = settingsDoc?.academic?.academicYear || "2026/2027";
    const institutionContact = {
      name: settingsDoc?.institution?.name || "Darul Khidmah Sidogiri Bekasi",
      address: settingsDoc?.institution?.address || "Jl. Lapangan Kranji, Bintara, Bekasi Barat, Kota Bekasi, Jawa Barat 17134",
      phone: settingsDoc?.institution?.phone || "0812-3456-7890",
      email: settingsDoc?.institution?.email || "sekretariat@sidogiri-bekasi.sch.id",
      website: settingsDoc?.institution?.website || "https://dksidogiribekasi.vercel.app",
      leaderName: settingsDoc?.institution?.leaderName || "KH. Bahruddin Thohir",
    };

    return {
      success: true,
      data: serializeData({
        content: contentDoc,
        organization: organizationMembers,
        teachers,
        academicYear,
        institutionContact,
      }),
    };
  } catch (error) {
    console.error("Error in getPublicAboutDataAction:", error);
    return {
      success: false,
      error: "Gagal memuat data informasi publik Tentang Kami.",
    };
  }
}

/**
 * Super Admin: Tambah Anggota Struktur Organisasi Baru
 */
export async function createOrganizationMemberAction(input: {
  name: string;
  title: string;
  category: "PIMPINAN" | "KEPALA_UNIT" | "BIDANG_SEKSI" | "PENASIHAT";
  department?: string;
  photoUrl?: string;
  period: string;
  bio?: string;
  phone?: string;
  email?: string;
  order?: number;
}): Promise<{
  success: boolean;
  message?: string;
  data?: OrganizationMember;
  error?: string;
}> {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== "super_admin") {
      return {
        success: false,
        error: "Unauthorized: Hanya Super Admin yang berhak menambahkan anggota struktur organisasi.",
      };
    }

    if (!input.name?.trim() || !input.title?.trim()) {
      return { success: false, error: "Nama lengkap dan jabatan wajib diisi." };
    }

    const db = await getDatabase();
    const col = db.collection<OrganizationMember>("organization_members");

    const newDoc: Omit<OrganizationMember, "_id"> = {
      name: input.name.trim(),
      title: input.title.trim(),
      category: input.category || "BIDANG_SEKSI",
      department: input.department?.trim() || "",
      photoUrl: input.photoUrl?.trim() || "",
      period: input.period?.trim() || "2024 - 2029",
      bio: input.bio?.trim() || "",
      phone: input.phone?.trim() || "",
      email: input.email?.trim() || "",
      order: Number(input.order) || 99,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const res = await col.insertOne(newDoc as any);
    revalidatePath("/about");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Anggota struktur organisasi berhasil ditambahkan.",
      data: serializeData({ ...newDoc, _id: res.insertedId.toString() }),
    };
  } catch (error) {
    console.error("Error in createOrganizationMemberAction:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat menambahkan anggota organisasi." };
  }
}

/**
 * Super Admin: Edit Anggota Struktur Organisasi
 */
export async function updateOrganizationMemberAction(
  id: string,
  input: {
    name: string;
    title: string;
    category: "PIMPINAN" | "KEPALA_UNIT" | "BIDANG_SEKSI" | "PENASIHAT";
    department?: string;
    photoUrl?: string;
    period: string;
    bio?: string;
    phone?: string;
    email?: string;
    order?: number;
    isActive?: boolean;
  }
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== "super_admin") {
      return {
        success: false,
        error: "Unauthorized: Hanya Super Admin yang berhak mengubah data struktur organisasi.",
      };
    }

    if (!id) {
      return { success: false, error: "ID anggota organisasi tidak valid." };
    }

    const db = await getDatabase();
    const col = db.collection("organization_members");

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return { success: false, error: "Format ID dokumen tidak valid." };
    }

    await col.updateOne(
      { _id: objectId },
      {
        $set: {
          name: input.name.trim(),
          title: input.title.trim(),
          category: input.category,
          department: input.department?.trim() || "",
          photoUrl: input.photoUrl?.trim() || "",
          period: input.period?.trim() || "2024 - 2029",
          bio: input.bio?.trim() || "",
          phone: input.phone?.trim() || "",
          email: input.email?.trim() || "",
          order: Number(input.order) || 1,
          isActive: input.isActive !== undefined ? input.isActive : true,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    revalidatePath("/about");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Data struktur organisasi berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Error in updateOrganizationMemberAction:", error);
    return { success: false, error: "Gagal memperbarui data anggota organisasi." };
  }
}

/**
 * Super Admin: Hapus Anggota Struktur Organisasi
 */
export async function deleteOrganizationMemberAction(id: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== "super_admin") {
      return {
        success: false,
        error: "Unauthorized: Hanya Super Admin yang berhak menghapus anggota organisasi.",
      };
    }

    if (!id) return { success: false, error: "ID anggota tidak disertakan." };

    const db = await getDatabase();
    const col = db.collection("organization_members");

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return { success: false, error: "Format ID dokumen tidak valid." };
    }

    await col.deleteOne({ _id: objectId });

    revalidatePath("/about");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Anggota struktur organisasi berhasil dihapus.",
    };
  } catch (error) {
    console.error("Error in deleteOrganizationMemberAction:", error);
    return { success: false, error: "Gagal menghapus anggota organisasi." };
  }
}

/**
 * Super Admin: Perbarui Profil Publik Asatidz (Foto, Almamater, Bio, Status Publik)
 */
export async function updateAboutTeacherPublicAction(
  id: string,
  input: {
    photoUrl?: string;
    education?: string;
    publicBio?: string;
    academicYear?: string;
    isPublic?: boolean;
    order?: number;
  }
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== "super_admin") {
      return {
        success: false,
        error: "Unauthorized: Hanya Super Admin yang berhak mengubah informasi publik pengajar.",
      };
    }

    if (!id) return { success: false, error: "ID pengajar tidak valid." };

    const db = await getDatabase();
    const teachersCol = db.collection("teachers");

    let query: any = { _id: id };
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    await teachersCol.updateOne(query, {
      $set: {
        photoUrl: input.photoUrl?.trim() || "",
        education: input.education?.trim() || "",
        publicBio: input.publicBio?.trim() || "",
        academicYear: input.academicYear?.trim() || "2026/2027",
        isPublic: input.isPublic !== undefined ? input.isPublic : true,
        order: Number(input.order) || 1,
        updatedAt: new Date().toISOString(),
      },
    });

    revalidatePath("/about");
    revalidatePath("/teachers");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Profil publik asatidz berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Error in updateAboutTeacherPublicAction:", error);
    return { success: false, error: "Gagal memperbarui data pengajar." };
  }
}

/**
 * Super Admin: Edit Teks Konten Dinamis Tentang Kami (Sejarah, Visi, Misi)
 */
export async function updateAboutContentAction(input: {
  heroTagline: string;
  heroDescription: string;
  historyTitle: string;
  historyParagraphs: string[];
  quote: string;
  quoteAuthor: string;
  vision: string;
  missions: string[];
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== "super_admin") {
      return {
        success: false,
        error: "Unauthorized: Hanya Super Admin yang berhak menyunting narasi profil Tentang Kami.",
      };
    }

    const db = await getDatabase();
    const aboutCol = db.collection("about_contents");

    await aboutCol.updateOne(
      { id: "global_about_content" },
      {
        $set: {
          heroTagline: input.heroTagline.trim(),
          heroDescription: input.heroDescription.trim(),
          historyTitle: input.historyTitle.trim(),
          historyParagraphs: input.historyParagraphs.filter((p) => Boolean(p.trim())),
          quote: input.quote.trim(),
          quoteAuthor: input.quoteAuthor.trim(),
          vision: input.vision.trim(),
          missions: input.missions.filter((m) => Boolean(m.trim())),
          updatedAt: new Date().toISOString(),
          updatedBy: `${session.name} (Super Admin)`,
        },
      },
      { upsert: true }
    );

    revalidatePath("/about");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Narasi profil Tentang Kami berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Error in updateAboutContentAction:", error);
    return { success: false, error: "Gagal memperbarui narasi profil." };
  }
}
