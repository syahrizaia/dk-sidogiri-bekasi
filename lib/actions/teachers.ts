"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { getSessionFromCookies } from "@/lib/auth";
import { verifyUserPermission } from "@/lib/actions/roles";
import { ObjectId } from "mongodb";
import { serializeData } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface TeachingAssignment {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  unit: "MI" | "MTs" | "TPQ";
}

export interface HomeroomAssignment {
  unit: "MI" | "MTs" | "TPQ";
  className: string;
}

export interface TeacherRecord {
  id?: string;
  _id?: string;
  nip: string;
  name: string;
  role: string;
  institution: "MI" | "MTs" | "TPQ";
  institutions?: ("MI" | "MTs" | "TPQ")[];
  teachingAssignments?: TeachingAssignment[];
  homeroomAssignments?: HomeroomAssignment[];
  specialization: string;
  phone: string;
  status: "AKTIF" | "CUTI";
  joinedYear: number;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_TEACHERS: Omit<TeacherRecord, "id" | "_id">[] = [
  {
    nip: "DKS-AS-01",
    name: "Ust. M. Sholeh Al-Bantani, S.Pd.I",
    role: "Kepala Madrasah Ibtidaiyah",
    institution: "MI",
    institutions: ["MI"],
    specialization: "Fiqih Fathul Qorib & Ushul Fiqh",
    phone: "0812-3456-7801",
    status: "AKTIF",
    joinedYear: 2020,
    teachingAssignments: [],
    homeroomAssignments: [{ unit: "MI", className: "6 Ibtidaiyah A" }],
    createdAt: new Date().toISOString(),
  },
  {
    nip: "DKS-AS-02",
    name: "Ust. Abdullah Faqih, M.Ag",
    role: "Koordinator Persiapan MTs",
    institution: "MTs",
    institutions: ["MTs", "MI"],
    specialization: "Nahwu Shorof & Alfiyah Ibnu Malik",
    phone: "0812-3456-7802",
    status: "AKTIF",
    joinedYear: 2022,
    teachingAssignments: [],
    homeroomAssignments: [
      { unit: "MTs", className: "Persiapan 1 MTs" },
      { unit: "MI", className: "5 Ibtidaiyah A" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    nip: "DKS-AS-03",
    name: "Ust. Ahmad Zaini Al-Hafizh",
    role: "Koordinator TPQ & Tahfizh",
    institution: "TPQ",
    institutions: ["TPQ", "MI"],
    specialization: "Metode Tartil Sidogiri & Tajwid Praktis",
    phone: "0812-3456-7803",
    status: "AKTIF",
    joinedYear: 2021,
    teachingAssignments: [],
    homeroomAssignments: [{ unit: "TPQ", className: "Jilid 4 Al-Qur'an" }],
    createdAt: new Date().toISOString(),
  },
  {
    nip: "DKS-AS-04",
    name: "Ust. H. Ridwan Mansyur, Lc",
    role: "Guru Senior Kitab Kuning",
    institution: "MI",
    institutions: ["MI", "MTs"],
    specialization: "Hadits Nabawi & Riyadhis Shalihin",
    phone: "0812-3456-7804",
    status: "AKTIF",
    joinedYear: 2021,
    teachingAssignments: [],
    homeroomAssignments: [{ unit: "MI", className: "4 Ibtidaiyah A" }],
    createdAt: new Date().toISOString(),
  },
  {
    nip: "DKS-AS-05",
    name: "Ust. Zainul Arifin, S.Pd",
    role: "Wali Kelas & Pembina Bahasa",
    institution: "MI",
    institutions: ["MI", "TPQ"],
    specialization: "Bahasa Arab & Imla'",
    phone: "0812-3456-7805",
    status: "AKTIF",
    joinedYear: 2021,
    teachingAssignments: [],
    homeroomAssignments: [
      { unit: "MI", className: "5 Ibtidaiyah C" },
      { unit: "TPQ", className: "Tartil Tajwid" },
    ],
    createdAt: new Date().toISOString(),
  },
];

/**
 * Mengambil seluruh daftar Dewan Asatidz beserta penugasan akademik dan wali kelas
 */
export async function getTeachersAction(): Promise<{
  success: boolean;
  data?: TeacherRecord[];
  error?: string;
}> {
  try {
    const db = await getDatabase();
    const collection = db.collection("teachers");

    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(DEFAULT_TEACHERS as any);
      await collection.createIndex({ nip: 1 }, { unique: true });
      await collection.createIndex({ institutions: 1 });
      await collection.createIndex({ "teachingAssignments.subjectId": 1 });
      await collection.createIndex({ "homeroomAssignments.unit": 1 });
    }

    const records = await collection.find({}).sort({ nip: 1 }).toArray();
    const formatted: TeacherRecord[] = records.map((t) => {
      const institutions = Array.isArray(t.institutions) && t.institutions.length > 0
        ? t.institutions
        : [t.institution || "MI"];

      const teachingAssignments: TeachingAssignment[] = Array.isArray(t.teachingAssignments)
        ? t.teachingAssignments.map((a: any) => ({
            subjectId: String(a.subjectId || ""),
            subjectCode: String(a.subjectCode || ""),
            subjectName: String(a.subjectName || ""),
            unit: a.unit || "MI",
          }))
        : [];

      const homeroomAssignments: HomeroomAssignment[] = Array.isArray(t.homeroomAssignments)
        ? t.homeroomAssignments.map((h: any) => ({
            unit: h.unit || "MI",
            className: String(h.className || ""),
          }))
        : [];

      return {
        id: t._id.toString(),
        _id: t._id.toString(),
        nip: t.nip,
        name: t.name,
        role: t.role,
        institution: t.institution || "MI",
        institutions,
        teachingAssignments,
        homeroomAssignments,
        specialization: t.specialization || "",
        phone: t.phone || "",
        status: t.status || "AKTIF",
        joinedYear: Number(t.joinedYear) || new Date().getFullYear(),
        createdAt: t.createdAt ? String(t.createdAt) : undefined,
        updatedAt: t.updatedAt ? String(t.updatedAt) : undefined,
      };
    });

    return { success: true, data: serializeData(formatted) };
  } catch (error) {
    console.error("Error in getTeachersAction:", error);
    return { success: false, error: "Gagal memuat dewan asatidz." };
  }
}

/**
 * Menambahkan data Dewan Asatidz baru
 */
export async function createTeacherAction(payload: {
  nip: string;
  name: string;
  role: string;
  institution: "MI" | "MTs" | "TPQ";
  institutions?: ("MI" | "MTs" | "TPQ")[];
  specialization: string;
  phone: string;
  status?: "AKTIF" | "CUTI";
  joinedYear?: number;
}) {
  try {
    const authCheck = await verifyUserPermission("teachers", "create");
    if (!authCheck.allowed) {
      return {
        success: false,
        error:
          authCheck.error ||
          "Akses ditolak: Anda tidak memiliki wewenang untuk menambahkan data asatidz baru.",
      };
    }

    const { nip, name, role, institution, specialization, phone } = payload;
    if (!nip || !name || !role || !institution) {
      return { success: false, error: "NIP, Nama, Tugas, dan Lembaga wajib diisi." };
    }

    const db = await getDatabase();
    const collection = db.collection("teachers");

    // Cek duplikasi NIP
    const existingNip = await collection.findOne({
      nip: String(nip).trim().toUpperCase(),
    });
    if (existingNip) {
      return { success: false, error: `NIP '${nip}' sudah digunakan oleh asatidz lain.` };
    }

    const institutions = Array.isArray(payload.institutions) && payload.institutions.length > 0
      ? payload.institutions
      : [institution];

    const newRecord = {
      nip: String(nip).trim().toUpperCase(),
      name: String(name).trim(),
      role: String(role).trim(),
      institution,
      institutions,
      teachingAssignments: [],
      homeroomAssignments: [],
      specialization: String(specialization || "").trim(),
      phone: String(phone || "").trim(),
      status: payload.status || "AKTIF",
      joinedYear: Number(payload.joinedYear) || new Date().getFullYear(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(newRecord);

    revalidatePath("/teachers");
    revalidatePath("/modules/mi");
    revalidatePath("/modules/mts");
    revalidatePath("/modules/tpq");

    return {
      success: true,
      message: "Data asatidz berhasil ditambahkan.",
      data: serializeData({
        ...newRecord,
        id: result.insertedId.toString(),
        _id: result.insertedId.toString(),
      }),
    };
  } catch (error) {
    console.error("Error in createTeacherAction:", error);
    return { success: false, error: "Gagal menambahkan guru." };
  }
}

/**
 * Memperbarui data umum Dewan Asatidz
 */
export async function updateTeacherAction(id: string, payload: Partial<TeacherRecord>) {
  try {
    const authCheck = await verifyUserPermission("teachers", "update");
    if (!authCheck.allowed) {
      return {
        success: false,
        error:
          authCheck.error ||
          "Akses ditolak: Anda tidak memiliki wewenang untuk memperbarui data asatidz.",
      };
    }

    if (!id) {
      return { success: false, error: "ID asatidz tidak valid." };
    }

    const db = await getDatabase();
    const collection = db.collection("teachers");

    let query: Record<string, unknown> = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id }, { nip: id }] };
    } else {
      query = { $or: [{ id }, { nip: id }] };
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (payload.name) updateFields.name = String(payload.name).trim();
    if (payload.nip) updateFields.nip = String(payload.nip).trim().toUpperCase();
    if (payload.role) updateFields.role = String(payload.role).trim();
    if (payload.institution) updateFields.institution = payload.institution;
    if (payload.institutions && Array.isArray(payload.institutions)) {
      updateFields.institutions = payload.institutions;
    }
    if (payload.specialization !== undefined) {
      updateFields.specialization = String(payload.specialization).trim();
    }
    if (payload.phone !== undefined) {
      updateFields.phone = String(payload.phone).trim();
    }
    if (payload.status) updateFields.status = payload.status;
    if (payload.joinedYear) updateFields.joinedYear = Number(payload.joinedYear);

    const result = await collection.updateOne(query, { $set: updateFields });
    if (result.matchedCount === 0) {
      return { success: false, error: "Data asatidz tidak ditemukan." };
    }

    // Jika nama diperbarui, sinkronkan nama di koleksi subjects yang diampu
    if (payload.name) {
      const teacherDoc = await collection.findOne(query);
      if (teacherDoc) {
        await db.collection("subjects").updateMany(
          { teacherId: teacherDoc._id.toString() },
          { $set: { teacherName: teacherDoc.name, updatedAt: new Date().toISOString() } }
        );
      }
    }

    revalidatePath("/teachers");
    revalidatePath("/modules/mi");
    revalidatePath("/modules/mts");
    revalidatePath("/modules/tpq");

    return { success: true, message: "Data asatidz berhasil diperbarui." };
  } catch (error) {
    console.error("Error in updateTeacherAction:", error);
    return { success: false, error: "Gagal memperbarui data asatidz." };
  }
}

/**
 * Server Action Khusus: Mengatur Penugasan Akademik (Mata Pelajaran & Wali Kelas Lintas Unit)
 * dengan Validasi Ketat Aturan Bisnis dan Sinkronisasi Dua Arah.
 */
export async function assignTeacherAcademicAction(
  teacherId: string,
  payload: {
    institutions?: ("MI" | "MTs" | "TPQ")[];
    teachingSubjectIds: string[];
    homeroomAssignments: { unit: "MI" | "MTs" | "TPQ"; className: string }[];
  }
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const authCheck = await verifyUserPermission("teachers", "update");
    if (!authCheck.allowed) {
      return {
        success: false,
        error:
          authCheck.error ||
          "Akses ditolak: Anda tidak memiliki wewenang untuk mengatur penugasan akademik asatidz.",
      };
    }

    if (!teacherId) {
      return { success: false, error: "ID asatidz wajib disertakan." };
    }

    const db = await getDatabase();
    const teachersCollection = db.collection("teachers");
    const subjectsCollection = db.collection("subjects");

    // 1. Temukan asatidz sasaran
    let targetQuery: Record<string, unknown> = { id: teacherId };
    if (ObjectId.isValid(teacherId)) {
      targetQuery = { $or: [{ _id: new ObjectId(teacherId) }, { id: teacherId }, { nip: teacherId }] };
    } else {
      targetQuery = { $or: [{ id: teacherId }, { nip: teacherId }] };
    }

    const teacher = await teachersCollection.findOne(targetQuery);
    if (!teacher) {
      return { success: false, error: "Data asatidz tidak ditemukan di sistem." };
    }
    const teacherObjectId = teacher._id;
    const teacherIdStr = teacherObjectId.toString();

    // 2. Filter & Sanitasi Homeroom Assignments
    const rawHomerooms = Array.isArray(payload.homeroomAssignments)
      ? payload.homeroomAssignments
      : [];
    const validHomerooms = rawHomerooms
      .map((h) => ({
        unit: h.unit,
        className: String(h.className || "").trim(),
      }))
      .filter((h) => h.className !== "");

    // === VALIDASI 1 (ATURAN KUNCI): 1 Guru = Maksimal 1 Kelas per Unit Pendidikan ===
    const unitCountMap: Record<string, number> = {};
    for (const hr of validHomerooms) {
      unitCountMap[hr.unit] = (unitCountMap[hr.unit] || 0) + 1;
      if (unitCountMap[hr.unit] > 1) {
        return {
          success: false,
          error: `Dalam satu unit pendidikan yang sama (${hr.unit}), seorang ustadz/guru hanya boleh menjadi wali kelas di maksimal satu kelas saja.`,
        };
      }
    }

    // === VALIDASI 2: Cegah Tabrakan Dualisme Wali Kelas pada Kelas yang Sama ===
    for (const hr of validHomerooms) {
      // Periksa apakah kelas tersebut saat ini sudah memiliki wali kelas lain
      const existingConflict = await teachersCollection.findOne({
        _id: { $ne: teacherObjectId },
        homeroomAssignments: {
          $elemMatch: { unit: hr.unit, className: hr.className },
        },
      });

      if (existingConflict) {
        // Secara terkontrol lepaskan penugasan lama dari guru sebelumnya agar tidak terjadi tabrakan
        await teachersCollection.updateOne(
          { _id: existingConflict._id },
          {
            $pull: {
              homeroomAssignments: { unit: hr.unit, className: hr.className } as any,
            },
            $set: { updatedAt: new Date().toISOString() },
          }
        );
      }
    }

    // 3. Resolusi Mata Pelajaran Mengajar dari Koleksi subjects
    const subjectIds = Array.isArray(payload.teachingSubjectIds)
      ? payload.teachingSubjectIds.filter((id) => Boolean(id) && ObjectId.isValid(id))
      : [];

    const selectedSubjects = await subjectsCollection
      .find({ _id: { $in: subjectIds.map((id) => new ObjectId(id)) } })
      .toArray();

    const newTeachingAssignments: TeachingAssignment[] = selectedSubjects.map((s) => ({
      subjectId: s._id.toString(),
      subjectCode: s.code,
      subjectName: s.name,
      unit: s.unit,
    }));

    // 4. Kalkulasi Otomatis Multi-Unit Membership (institutions)
    const activeUnitsSet = new Set<"MI" | "MTs" | "TPQ">();
    if (teacher.institution) activeUnitsSet.add(teacher.institution);
    if (Array.isArray(payload.institutions)) {
      payload.institutions.forEach((u) => activeUnitsSet.add(u));
    }
    newTeachingAssignments.forEach((t) => activeUnitsSet.add(t.unit));
    validHomerooms.forEach((h) => activeUnitsSet.add(h.unit));

    const finalInstitutions = Array.from(activeUnitsSet);

    // 5. Sinkronisasi Dua Arah ke Koleksi subjects
    // A. Lepas kaitan (unassign) mata pelajaran yang sebelumnya diajar oleh guru ini tapi sekarang dicabut
    await subjectsCollection.updateMany(
      {
        teacherId: teacherIdStr,
        _id: { $nin: selectedSubjects.map((s) => s._id) },
      },
      {
        $set: {
          teacherId: "",
          teacherName: "",
          updatedAt: new Date().toISOString(),
        },
      }
    );

    // B. Kaitkan mata pelajaran terpilih dengan guru ini
    if (selectedSubjects.length > 0) {
      await subjectsCollection.updateMany(
        {
          _id: { $in: selectedSubjects.map((s) => s._id) },
        },
        {
          $set: {
            teacherId: teacherIdStr,
            teacherName: teacher.name,
            updatedAt: new Date().toISOString(),
          },
        }
      );
    }

    // 6. Simpan Pembaruan Dokumen Teacher
    await teachersCollection.updateOne(
      { _id: teacherObjectId },
      {
        $set: {
          institutions: finalInstitutions,
          teachingAssignments: newTeachingAssignments,
          homeroomAssignments: validHomerooms,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    // 7. Revalidasi Seluruh Halaman yang Terkait
    revalidatePath("/teachers");
    revalidatePath("/modules/mi");
    revalidatePath("/modules/mts");
    revalidatePath("/modules/tpq");

    return {
      success: true,
      message: `Penugasan akademik ${teacher.name} berhasil disimpan dan disinkronkan secara menyeluruh.`,
    };
  } catch (error) {
    console.error("Error in assignTeacherAcademicAction:", error);
    return {
      success: false,
      error: "Gagal menyimpan penugasan akademik asatidz.",
    };
  }
}

/**
 * Menghapus data Dewan Asatidz dan melepaskan seluruh relasi mata pelajaran yang diampu
 */
export async function deleteTeacherAction(id: string) {
  try {
    const authCheck = await verifyUserPermission("teachers", "delete");
    if (!authCheck.allowed) {
      return {
        success: false,
        error:
          authCheck.error ||
          "Akses ditolak: Anda tidak memiliki wewenang untuk menghapus data asatidz.",
      };
    }

    if (!id) {
      return { success: false, error: "ID asatidz tidak valid." };
    }

    const db = await getDatabase();
    const collection = db.collection("teachers");
    const subjectsCollection = db.collection("subjects");

    let query: Record<string, unknown> = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id }, { nip: id }] };
    } else {
      query = { $or: [{ id }, { nip: id }] };
    }

    const teacher = await collection.findOne(query);
    if (!teacher) {
      return { success: false, error: "Data asatidz tidak ditemukan." };
    }

    // Lepaskan kaitan asatidz di seluruh mata pelajaran yang diampu
    await subjectsCollection.updateMany(
      { teacherId: teacher._id.toString() },
      {
        $set: {
          teacherId: "",
          teacherName: "",
          updatedAt: new Date().toISOString(),
        },
      }
    );

    await collection.deleteOne({ _id: teacher._id });

    revalidatePath("/teachers");
    revalidatePath("/modules/mi");
    revalidatePath("/modules/mts");
    revalidatePath("/modules/tpq");

    return { success: true, message: "Data asatidz berhasil dihapus." };
  } catch (error) {
    console.error("Error in deleteTeacherAction:", error);
    return { success: false, error: "Gagal menghapus data asatidz." };
  }
}
