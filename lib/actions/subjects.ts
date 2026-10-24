"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { verifyUserPermission } from "@/lib/actions/roles";
import { ObjectId } from "mongodb";
import { serializeData } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface SubjectRecord {
  id?: string;
  _id?: string;
  unit: "MI" | "MTs" | "TPQ";
  code: string;
  name: string;
  category: "Kitab Kuning / Diniyah" | "Kurikulum Nasional" | "Tahfidz & Al-Quran" | "Muatan Lokal" | string;
  kitabName: string;
  grade: string;
  semester: "Ganjil" | "Genap" | "Semua";
  teacherId: string;
  teacherName?: string;
  weeklyHours: number;
  description: string;
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_SUBJECTS: Omit<SubjectRecord, "id" | "_id">[] = [
  // === MI ===
  {
    unit: "MI",
    code: "MI-DIN-01",
    name: "Fiqih Ibadah",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Fathul Qorib - Syaikh Ibn Qasim Al-Ghazi",
    grade: "Kelas 5-6",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 4,
    description: "Mempelajari hukum ibadah mahdhah (thaharah, shalat, zakat, puasa, haji) secara sistematis dengan metode sorogan dan bandongan.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-DIN-02",
    name: "Nahwu Dasar",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Al-Jurumiyah - Syaikh Ash-Shanhaji",
    grade: "Kelas 4-5",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 3,
    description: "Pengenalan dasar ilmu nahwu (tata bahasa Arab): kalam, isim, fi'il, huruf, i'rab, dan tanda-tanda i'rab.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-DIN-03",
    name: "Akhlaq & Adab",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Ta'limul Muta'allim - Syaikh Az-Zarnuji",
    grade: "Kelas 4-6",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 2,
    description: "Adab menuntut ilmu, etika terhadap guru, dan budi pekerti santri menurut ulama salaf.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-NAS-01",
    name: "Matematika",
    category: "Kurikulum Nasional",
    kitabName: "Buku Paket Matematika MI/SD Kelas 4-6",
    grade: "Kelas 4-6",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 4,
    description: "Aritmatika, geometri dasar, dan pemecahan masalah sesuai standar kurikulum Kemenag RI.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-NAS-02",
    name: "Bahasa Indonesia",
    category: "Kurikulum Nasional",
    kitabName: "Buku Paket Bahasa Indonesia MI/SD",
    grade: "Kelas 4-6",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 4,
    description: "Keterampilan membaca, menulis, menyimak, dan berbicara dalam bahasa Indonesia baku.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-DIN-04",
    name: "Hadits Nabawi",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Riyadhush Shalihin - Imam An-Nawawi (Mukhtashar)",
    grade: "Kelas 5-6",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 2,
    description: "Hafalan dan pemahaman hadits-hadits pilihan tentang adab, ibadah, dan muamalah.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-DIN-05",
    name: "Bahasa Arab & Tarikh Islam",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Durusul Lughah Al-Arabiyyah & Khulashoh Nurul Yaqin",
    grade: "Kelas 4-6",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 3,
    description: "Pembelajaran bahasa Arab percakapan dan sejarah peradaban Islam dari masa Nabi hingga Khulafa' Rasyidin.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  // === MTs ===
  {
    unit: "MTs",
    code: "MTS-DIN-01",
    name: "Nahwu & Shorof Menengah",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Alfiyah Ibnu Malik & Amtsilati Tashrifiyyah",
    grade: "Kelas 7-9 / Persiapan",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 6,
    description: "Pendalaman ilmu nahwu melalui syair Alfiyah dan praktik tashrif (konjugasi) fi'il secara intensif.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    unit: "MTs",
    code: "MTS-DIN-02",
    name: "Fiqih Muqoron",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Fathul Mu'in - Syaikh Zainuddin Al-Malibari",
    grade: "Kelas 7-9 / Persiapan",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 4,
    description: "Fiqih komparatif madzhab Syafi'i dengan pengenalan dalil dan metode istinbath hukum.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    unit: "MTs",
    code: "MTS-NAS-01",
    name: "Ilmu Pengetahuan Alam (IPA)",
    category: "Kurikulum Nasional",
    kitabName: "Buku Paket IPA MTs Kelas 7-9",
    grade: "Kelas 7-9 / Persiapan",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 4,
    description: "Fisika, biologi, dan kimia dasar sesuai kurikulum merdeka Kemenag RI.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    unit: "MTs",
    code: "MTS-DIN-03",
    name: "Ushul Fiqh & Qowaidul Fiqhiyyah",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Al-Waraqat - Imam Al-Juwaini",
    grade: "Kelas 8-9",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 2,
    description: "Dasar-dasar metodologi pengambilan hukum Islam dan kaidah-kaidah fiqih universal.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  // === TPQ ===
  {
    unit: "TPQ",
    code: "TPQ-QUR-01",
    name: "Tartil Al-Quran Metode Sidogiri",
    category: "Tahfidz & Al-Quran",
    kitabName: "Buku Tartil Sidogiri Jilid 1-6",
    grade: "Jilid 1-6",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 10,
    description: "Pembelajaran membaca Al-Quran dengan metode Tartil khas Sidogiri: pengenalan huruf hijaiyah hingga membaca Al-Quran bi-tartil.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    unit: "TPQ",
    code: "TPQ-QUR-02",
    name: "Tajwid Praktis",
    category: "Tahfidz & Al-Quran",
    kitabName: "Tuhfatul Athfal - Syaikh Sulaiman Al-Jamzuri",
    grade: "Al-Quran / Pasca Jilid 6",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 4,
    description: "Hukum-hukum tajwid praktis: nun mati/tanwin, mim mati, mad, waqaf, dan ibtida' melalui hafalan nazhom.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    unit: "TPQ",
    code: "TPQ-QUR-03",
    name: "Tahfidz Juz 30 (Juz Amma)",
    category: "Tahfidz & Al-Quran",
    kitabName: "Mushaf Al-Quran Rasm Utsmani",
    grade: "Semua Jilid",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 6,
    description: "Program hafalan surat-surat pendek (Juz 30) dengan metode setoran harian dan muraja'ah mingguan.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    unit: "TPQ",
    code: "TPQ-DIN-01",
    name: "Aqidah & Doa Harian",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Aqidatul Awam - Syaikh Ahmad Al-Marzuqi",
    grade: "Semua Jilid",
    semester: "Semua",
    teacherId: "",
    weeklyHours: 2,
    description: "Hafalan nazhom aqidah 57 bait dan doa-doa harian pilihan untuk santri TPQ.",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
];

async function ensureSeedSubjects() {
  const db = await getDatabase();
  const collection = db.collection("subjects");
  const count = await collection.countDocuments();
  if (count === 0) {
    // Link teacherId to real teachers if available
    const teachersCollection = db.collection("teachers");
    const allTeachers = await teachersCollection.find({}).toArray();

    const seeded = DEFAULT_SUBJECTS.map((s) => {
      const matchedTeacher = allTeachers.find(
        (t) => t.institution === s.unit
      );
      return {
        ...s,
        teacherId: matchedTeacher ? matchedTeacher._id.toString() : "",
        teacherName: matchedTeacher ? matchedTeacher.name : "",
      };
    });

    await collection.insertMany(seeded as any);
    // Create indexes
    await collection.createIndex({ unit: 1 });
    await collection.createIndex({ unit: 1, code: 1 }, { unique: true });
    await collection.createIndex({ status: 1 });
  }
}

/**
 * Mengambil seluruh mata pelajaran & kitab kuning berdasarkan unit
 */
export async function getSubjectsByUnitAction(
  unit: "MI" | "MTs" | "TPQ"
): Promise<{ success: boolean; data?: SubjectRecord[]; error?: string }> {
  try {
    await ensureSeedSubjects();
    const db = await getDatabase();
    const collection = db.collection("subjects");
    const teachersCollection = db.collection("teachers");

    const rawList = await collection
      .find({ unit })
      .sort({ category: 1, code: 1 })
      .toArray();

    // Resolve teacher names
    const allTeachers = await teachersCollection.find({}).toArray();
    const teacherMap = new Map(
      allTeachers.map((t) => [t._id.toString(), t.name])
    );

    const formatted: SubjectRecord[] = rawList.map((doc) => ({
      id: doc._id.toString(),
      _id: doc._id.toString(),
      unit: doc.unit,
      code: doc.code,
      name: doc.name,
      category: doc.category,
      kitabName: doc.kitabName || "",
      grade: doc.grade || "",
      semester: doc.semester || "Semua",
      teacherId: doc.teacherId ? String(doc.teacherId) : "",
      teacherName: doc.teacherId
        ? teacherMap.get(String(doc.teacherId)) || doc.teacherName || ""
        : doc.teacherName || "",
      weeklyHours: Number(doc.weeklyHours) || 0,
      description: doc.description || "",
      status: doc.status || "Active",
      createdAt: doc.createdAt || "",
      updatedAt: doc.updatedAt || "",
    }));

    return { success: true, data: serializeData(formatted) };
  } catch (error) {
    console.error("Error in getSubjectsByUnitAction:", error);
    return {
      success: false,
      error: "Gagal memuat data kurikulum dan kitab kuning.",
    };
  }
}

/**
 * Menambahkan mata pelajaran / kitab kuning baru
 */
export async function createSubjectAction(
  payload: Omit<SubjectRecord, "id" | "_id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; data?: SubjectRecord; error?: string }> {
  try {
    const modKey = payload.unit === "MI" ? "mi" : payload.unit === "MTs" ? "mts" : "tpq";
    const auth = await verifyUserPermission(modKey, "create");
    if (!auth.allowed) {
      return {
        success: false,
        error: auth.error || "Akses ditolak: Anda tidak memiliki wewenang menambahkan mata pelajaran.",
      };
    }

    if (!payload.name?.trim() || !payload.unit || !payload.code?.trim()) {
      return {
        success: false,
        error: "Kode, nama mata pelajaran, dan unit pendidikan wajib diisi.",
      };
    }

    const db = await getDatabase();
    const collection = db.collection("subjects");

    // Check for duplicate code within same unit
    const existing = await collection.findOne({
      unit: payload.unit,
      code: payload.code.trim().toUpperCase(),
    });
    if (existing) {
      return {
        success: false,
        error: `Kode mata pelajaran '${payload.code}' sudah digunakan pada unit ${payload.unit}.`,
      };
    }

    // Resolve teacher name
    let teacherName = payload.teacherName || "";
    if (payload.teacherId && ObjectId.isValid(payload.teacherId)) {
      const teachersCollection = db.collection("teachers");
      const teacher = await teachersCollection.findOne({
        _id: new ObjectId(payload.teacherId),
      });
      if (teacher) teacherName = teacher.name;
    }

    const now = new Date().toISOString();
    const newDoc = {
      unit: payload.unit,
      code: payload.code.trim().toUpperCase(),
      name: payload.name.trim(),
      category: payload.category || "Kitab Kuning / Diniyah",
      kitabName: payload.kitabName?.trim() || "",
      grade: payload.grade?.trim() || "",
      semester: payload.semester || "Semua",
      teacherId: payload.teacherId || "",
      teacherName,
      weeklyHours: Number(payload.weeklyHours) || 0,
      description: payload.description?.trim() || "",
      status: payload.status || "Active",
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(newDoc);

    revalidatePath(`/modules/${payload.unit.toLowerCase()}`);

    return {
      success: true,
      data: serializeData({
        ...newDoc,
        id: result.insertedId.toString(),
        _id: result.insertedId.toString(),
      }),
    };
  } catch (error) {
    console.error("Error in createSubjectAction:", error);
    return {
      success: false,
      error: "Gagal menambahkan mata pelajaran / kitab kuning.",
    };
  }
}

/**
 * Memperbarui data mata pelajaran / kitab kuning
 */
export async function updateSubjectAction(
  id: string,
  payload: Partial<SubjectRecord>
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const unit = payload.unit || "MI";
    const modKey = unit === "MI" ? "mi" : unit === "MTs" ? "mts" : "tpq";
    const auth = await verifyUserPermission(modKey, "update");
    if (!auth.allowed) {
      return {
        success: false,
        error: auth.error || "Akses ditolak: Anda tidak memiliki wewenang memperbarui data mata pelajaran.",
      };
    }

    if (!id || !ObjectId.isValid(id)) {
      return { success: false, error: "ID mata pelajaran tidak valid." };
    }

    const db = await getDatabase();
    const collection = db.collection("subjects");

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (payload.code !== undefined) updateFields.code = payload.code.trim().toUpperCase();
    if (payload.name !== undefined) updateFields.name = payload.name.trim();
    if (payload.category !== undefined) updateFields.category = payload.category;
    if (payload.kitabName !== undefined) updateFields.kitabName = payload.kitabName.trim();
    if (payload.grade !== undefined) updateFields.grade = payload.grade.trim();
    if (payload.semester !== undefined) updateFields.semester = payload.semester;
    if (payload.teacherId !== undefined) {
      updateFields.teacherId = payload.teacherId;
      // Resolve teacher name
      if (payload.teacherId && ObjectId.isValid(payload.teacherId)) {
        const teachersCollection = db.collection("teachers");
        const teacher = await teachersCollection.findOne({
          _id: new ObjectId(payload.teacherId),
        });
        if (teacher) updateFields.teacherName = teacher.name;
      } else {
        updateFields.teacherName = "";
      }
    }
    if (payload.weeklyHours !== undefined) updateFields.weeklyHours = Number(payload.weeklyHours);
    if (payload.description !== undefined) updateFields.description = payload.description.trim();
    if (payload.status !== undefined) updateFields.status = payload.status;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: "Data mata pelajaran tidak ditemukan." };
    }

    revalidatePath(`/modules/${unit.toLowerCase()}`);

    return {
      success: true,
      message: "Data mata pelajaran / kitab kuning berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Error in updateSubjectAction:", error);
    return {
      success: false,
      error: "Gagal memperbarui data mata pelajaran.",
    };
  }
}

/**
 * Menghapus mata pelajaran / kitab kuning
 */
export async function deleteSubjectAction(
  id: string,
  unit: "MI" | "MTs" | "TPQ"
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const modKey = unit === "MI" ? "mi" : unit === "MTs" ? "mts" : "tpq";
    const auth = await verifyUserPermission(modKey, "delete");
    if (!auth.allowed) {
      return {
        success: false,
        error: auth.error || "Akses ditolak: Anda tidak memiliki wewenang menghapus mata pelajaran.",
      };
    }

    if (!id || !ObjectId.isValid(id)) {
      return { success: false, error: "ID mata pelajaran tidak valid." };
    }

    const db = await getDatabase();
    const collection = db.collection("subjects");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return { success: false, error: "Data mata pelajaran tidak ditemukan." };
    }

    revalidatePath(`/modules/${unit.toLowerCase()}`);

    return {
      success: true,
      message: "Mata pelajaran / kitab kuning berhasil dihapus.",
    };
  } catch (error) {
    console.error("Error in deleteSubjectAction:", error);
    return {
      success: false,
      error: "Gagal menghapus data mata pelajaran.",
    };
  }
}

/**
 * Mengambil seluruh mata pelajaran dan kitab kuning dari semua unit (MI, MTs, TPQ)
 */
export async function getAllSubjectsAction(): Promise<{
  success: boolean;
  data?: SubjectRecord[];
  error?: string;
}> {
  try {
    await ensureSeedSubjects();
    const db = await getDatabase();
    const collection = db.collection("subjects");
    const teachersCollection = db.collection("teachers");

    const rawList = await collection
      .find({})
      .sort({ unit: 1, category: 1, code: 1 })
      .toArray();

    const allTeachers = await teachersCollection.find({}).toArray();
    const teacherMap = new Map(allTeachers.map((t) => [t._id.toString(), t.name]));

    const formatted: SubjectRecord[] = rawList.map((doc) => ({
      id: doc._id.toString(),
      _id: doc._id.toString(),
      unit: doc.unit,
      code: doc.code,
      name: doc.name,
      category: doc.category,
      kitabName: doc.kitabName || "",
      grade: doc.grade || "",
      semester: doc.semester || "Semua",
      teacherId: doc.teacherId ? String(doc.teacherId) : "",
      teacherName: doc.teacherId
        ? teacherMap.get(String(doc.teacherId)) || doc.teacherName || ""
        : doc.teacherName || "",
      weeklyHours: Number(doc.weeklyHours) || 0,
      description: doc.description || "",
      status: doc.status || "Active",
      createdAt: doc.createdAt || "",
      updatedAt: doc.updatedAt || "",
    }));

    return { success: true, data: serializeData(formatted) };
  } catch (error) {
    console.error("Error in getAllSubjectsAction:", error);
    return { success: false, error: "Gagal memuat seluruh mata pelajaran." };
  }
}

