"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { verifyUserPermission } from "@/lib/actions/roles";
import { ObjectId } from "mongodb";
import { serializeData } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export interface ScheduleRecord {
  id?: string;
  _id?: string;
  unit: "MI" | "MTs" | "TPQ";
  day: "Sabtu" | "Ahad" | "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | string;
  startTime: string;
  endTime: string;
  activityType: "KBM" | "Ta'lim Kitab" | "Tahfidz / Tadarus" | "Praktik Ibadah" | string;
  grade: string;
  room: string;
  subjectId: string;
  subjectName?: string;
  teacherId: string;
  teacherName?: string;
  notes: string;
  status: "Active" | "Cancelled" | "Rescheduled";
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_SCHEDULES: Omit<ScheduleRecord, "id" | "_id">[] = [
  // === MI ===
  { unit: "MI", day: "Sabtu", startTime: "07:30", endTime: "09:00", activityType: "KBM", grade: "Kelas 4-6", room: "Ruang Kelas MI-A", subjectId: "", subjectName: "Matematika", teacherId: "", teacherName: "", notes: "Kurikulum Nasional", status: "Active", createdAt: new Date().toISOString() },
  { unit: "MI", day: "Sabtu", startTime: "09:15", endTime: "10:45", activityType: "Ta'lim Kitab", grade: "Kelas 5-6", room: "Majelis Tarbiyah", subjectId: "", subjectName: "Fiqih Ibadah (Fathul Qorib)", teacherId: "", teacherName: "", notes: "Metode Bandongan", status: "Active", createdAt: new Date().toISOString() },
  { unit: "MI", day: "Ahad", startTime: "07:30", endTime: "09:00", activityType: "Ta'lim Kitab", grade: "Kelas 4-5", room: "Majelis Tarbiyah", subjectId: "", subjectName: "Nahwu Dasar (Al-Jurumiyah)", teacherId: "", teacherName: "", notes: "Metode Sorogan", status: "Active", createdAt: new Date().toISOString() },
  { unit: "MI", day: "Ahad", startTime: "09:15", endTime: "10:45", activityType: "KBM", grade: "Kelas 4-6", room: "Ruang Kelas MI-B", subjectId: "", subjectName: "Bahasa Indonesia", teacherId: "", teacherName: "", notes: "Kurikulum Nasional", status: "Active", createdAt: new Date().toISOString() },
  { unit: "MI", day: "Senin", startTime: "07:30", endTime: "09:00", activityType: "Ta'lim Kitab", grade: "Kelas 5-6", room: "Majelis Tarbiyah", subjectId: "", subjectName: "Hadits Nabawi (Riyadhush Shalihin)", teacherId: "", teacherName: "", notes: "Hafalan & Pemahaman", status: "Active", createdAt: new Date().toISOString() },
  { unit: "MI", day: "Selasa", startTime: "07:30", endTime: "09:00", activityType: "Ta'lim Kitab", grade: "Kelas 4-6", room: "Majelis Tarbiyah", subjectId: "", subjectName: "Akhlaq (Ta'limul Muta'allim)", teacherId: "", teacherName: "", notes: "Hafalan Nazhom & Syarah", status: "Active", createdAt: new Date().toISOString() },
  { unit: "MI", day: "Rabu", startTime: "07:30", endTime: "09:00", activityType: "KBM", grade: "Kelas 4-6", room: "Ruang Kelas MI-A", subjectId: "", subjectName: "Bahasa Arab & Tarikh Islam", teacherId: "", teacherName: "", notes: "Durusul Lughah", status: "Active", createdAt: new Date().toISOString() },
  { unit: "MI", day: "Kamis", startTime: "07:30", endTime: "08:30", activityType: "Praktik Ibadah", grade: "Kelas 4-6", room: "Musholla Kompleks", subjectId: "", subjectName: "Praktik Shalat & Wudhu", teacherId: "", teacherName: "", notes: "Bimbingan langsung", status: "Active", createdAt: new Date().toISOString() },
  // === MTs ===
  { unit: "MTs", day: "Sabtu", startTime: "07:30", endTime: "09:30", activityType: "Ta'lim Kitab", grade: "Persiapan MTs", room: "Majelis Kitab Kuning", subjectId: "", subjectName: "Nahwu Shorof (Alfiyah)", teacherId: "", teacherName: "", notes: "Hafalan bait & i'rab", status: "Active", createdAt: new Date().toISOString() },
  { unit: "MTs", day: "Ahad", startTime: "07:30", endTime: "09:30", activityType: "Ta'lim Kitab", grade: "Persiapan MTs", room: "Majelis Kitab Kuning", subjectId: "", subjectName: "Fiqih (Fathul Mu'in)", teacherId: "", teacherName: "", notes: "Kajian mendalam", status: "Active", createdAt: new Date().toISOString() },
  { unit: "MTs", day: "Senin", startTime: "07:30", endTime: "09:00", activityType: "KBM", grade: "Persiapan MTs", room: "Ruang Kelas MTs-A", subjectId: "", subjectName: "Ilmu Pengetahuan Alam", teacherId: "", teacherName: "", notes: "Kurikulum Nasional", status: "Active", createdAt: new Date().toISOString() },
  { unit: "MTs", day: "Selasa", startTime: "07:30", endTime: "09:00", activityType: "Ta'lim Kitab", grade: "Persiapan MTs", room: "Majelis Kitab Kuning", subjectId: "", subjectName: "Ushul Fiqh (Al-Waraqat)", teacherId: "", teacherName: "", notes: "Kaidah fiqhiyyah", status: "Active", createdAt: new Date().toISOString() },
  // === TPQ ===
  { unit: "TPQ", day: "Sabtu", startTime: "07:00", endTime: "08:30", activityType: "Tahfidz / Tadarus", grade: "Jilid 1-6", room: "Halaqah TPQ-A", subjectId: "", subjectName: "Tartil Sidogiri Jilid 1-6", teacherId: "", teacherName: "", notes: "Setoran & Muraja'ah", status: "Active", createdAt: new Date().toISOString() },
  { unit: "TPQ", day: "Sabtu", startTime: "08:45", endTime: "09:45", activityType: "Ta'lim Kitab", grade: "Semua Jilid", room: "Halaqah TPQ-B", subjectId: "", subjectName: "Aqidatul Awam & Doa Harian", teacherId: "", teacherName: "", notes: "Hafalan nazhom", status: "Active", createdAt: new Date().toISOString() },
  { unit: "TPQ", day: "Ahad", startTime: "07:00", endTime: "08:30", activityType: "Tahfidz / Tadarus", grade: "Al-Quran", room: "Halaqah TPQ-A", subjectId: "", subjectName: "Tajwid Praktis (Tuhfatul Athfal)", teacherId: "", teacherName: "", notes: "Teori & Praktik", status: "Active", createdAt: new Date().toISOString() },
  { unit: "TPQ", day: "Senin", startTime: "07:00", endTime: "08:30", activityType: "Tahfidz / Tadarus", grade: "Semua Jilid", room: "Halaqah TPQ-A", subjectId: "", subjectName: "Tahfidz Juz 30 (Juz Amma)", teacherId: "", teacherName: "", notes: "Setoran harian", status: "Active", createdAt: new Date().toISOString() },
  { unit: "TPQ", day: "Selasa", startTime: "07:00", endTime: "08:00", activityType: "Praktik Ibadah", grade: "Semua Jilid", room: "Musholla Kompleks", subjectId: "", subjectName: "Praktik Wudhu, Shalat & Adzan", teacherId: "", teacherName: "", notes: "Bimbingan langsung", status: "Active", createdAt: new Date().toISOString() },
];

async function ensureSeedSchedules() {
  const db = await getDatabase();
  const collection = db.collection("schedules");
  const count = await collection.countDocuments();
  if (count === 0) {
    // Link to real teachers if available
    const teachersCollection = db.collection("teachers");
    const allTeachers = await teachersCollection.find({}).toArray();

    const seeded = DEFAULT_SCHEDULES.map((s) => {
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
    await collection.createIndex({ unit: 1, day: 1 });
    await collection.createIndex({ status: 1 });
  }
}

/**
 * Mengambil seluruh jadwal ta'lim & KBM berdasarkan unit
 */
export async function getSchedulesByUnitAction(
  unit: "MI" | "MTs" | "TPQ"
): Promise<{ success: boolean; data?: ScheduleRecord[]; error?: string }> {
  try {
    await ensureSeedSchedules();
    const db = await getDatabase();
    const collection = db.collection("schedules");
    const teachersCollection = db.collection("teachers");
    const subjectsCollection = db.collection("subjects");

    const dayOrder = ["Sabtu", "Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

    const rawList = await collection.find({ unit }).toArray();

    // Resolve teacher + subject names
    const allTeachers = await teachersCollection.find({}).toArray();
    const teacherMap = new Map(
      allTeachers.map((t) => [t._id.toString(), t.name])
    );
    const allSubjects = await subjectsCollection.find({}).toArray();
    const subjectMap = new Map(
      allSubjects.map((s) => [s._id.toString(), s.name])
    );

    const formatted: ScheduleRecord[] = rawList.map((doc) => ({
      id: doc._id.toString(),
      _id: doc._id.toString(),
      unit: doc.unit,
      day: doc.day,
      startTime: doc.startTime,
      endTime: doc.endTime,
      activityType: doc.activityType,
      grade: doc.grade || "",
      room: doc.room || "",
      subjectId: doc.subjectId ? String(doc.subjectId) : "",
      subjectName: doc.subjectId
        ? subjectMap.get(String(doc.subjectId)) || doc.subjectName || ""
        : doc.subjectName || "",
      teacherId: doc.teacherId ? String(doc.teacherId) : "",
      teacherName: doc.teacherId
        ? teacherMap.get(String(doc.teacherId)) || doc.teacherName || ""
        : doc.teacherName || "",
      notes: doc.notes || "",
      status: doc.status || "Active",
      createdAt: doc.createdAt || "",
      updatedAt: doc.updatedAt || "",
    }));

    // Sort by day order then startTime
    formatted.sort((a, b) => {
      const dayA = dayOrder.indexOf(a.day);
      const dayB = dayOrder.indexOf(b.day);
      if (dayA !== dayB) return dayA - dayB;
      return a.startTime.localeCompare(b.startTime);
    });

    return { success: true, data: serializeData(formatted) };
  } catch (error) {
    console.error("Error in getSchedulesByUnitAction:", error);
    return {
      success: false,
      error: "Gagal memuat jadwal ta'lim dan KBM.",
    };
  }
}

/**
 * Menambahkan jadwal baru
 */
export async function createScheduleAction(
  payload: Omit<ScheduleRecord, "id" | "_id" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; data?: ScheduleRecord; error?: string }> {
  try {
    const modKey = payload.unit === "MI" ? "mi" : payload.unit === "MTs" ? "mts" : "tpq";
    const auth = await verifyUserPermission(modKey, "create");
    if (!auth.allowed) {
      return {
        success: false,
        error: auth.error || "Akses ditolak: Anda tidak memiliki wewenang menambahkan jadwal.",
      };
    }

    if (!payload.day || !payload.startTime || !payload.endTime || !payload.unit) {
      return {
        success: false,
        error: "Hari, jam mulai, jam selesai, dan unit wajib diisi.",
      };
    }

    const db = await getDatabase();
    const collection = db.collection("schedules");

    // Resolve names
    let teacherName = payload.teacherName || "";
    let subjectName = payload.subjectName || "";

    if (payload.teacherId && ObjectId.isValid(payload.teacherId)) {
      const teacher = await db.collection("teachers").findOne({ _id: new ObjectId(payload.teacherId) });
      if (teacher) teacherName = teacher.name;
    }
    if (payload.subjectId && ObjectId.isValid(payload.subjectId)) {
      const subject = await db.collection("subjects").findOne({ _id: new ObjectId(payload.subjectId) });
      if (subject) subjectName = subject.name;
    }

    const now = new Date().toISOString();
    const newDoc = {
      unit: payload.unit,
      day: payload.day,
      startTime: payload.startTime,
      endTime: payload.endTime,
      activityType: payload.activityType || "KBM",
      grade: payload.grade?.trim() || "",
      room: payload.room?.trim() || "",
      subjectId: payload.subjectId || "",
      subjectName,
      teacherId: payload.teacherId || "",
      teacherName,
      notes: payload.notes?.trim() || "",
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
    console.error("Error in createScheduleAction:", error);
    return {
      success: false,
      error: "Gagal menambahkan jadwal.",
    };
  }
}

/**
 * Memperbarui data jadwal
 */
export async function updateScheduleAction(
  id: string,
  payload: Partial<ScheduleRecord>
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const unit = payload.unit || "MI";
    const modKey = unit === "MI" ? "mi" : unit === "MTs" ? "mts" : "tpq";
    const auth = await verifyUserPermission(modKey, "update");
    if (!auth.allowed) {
      return {
        success: false,
        error: auth.error || "Akses ditolak: Anda tidak memiliki wewenang memperbarui jadwal.",
      };
    }

    if (!id || !ObjectId.isValid(id)) {
      return { success: false, error: "ID jadwal tidak valid." };
    }

    const db = await getDatabase();
    const collection = db.collection("schedules");

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (payload.day !== undefined) updateFields.day = payload.day;
    if (payload.startTime !== undefined) updateFields.startTime = payload.startTime;
    if (payload.endTime !== undefined) updateFields.endTime = payload.endTime;
    if (payload.activityType !== undefined) updateFields.activityType = payload.activityType;
    if (payload.grade !== undefined) updateFields.grade = payload.grade.trim();
    if (payload.room !== undefined) updateFields.room = payload.room.trim();
    if (payload.notes !== undefined) updateFields.notes = payload.notes.trim();
    if (payload.status !== undefined) updateFields.status = payload.status;

    if (payload.teacherId !== undefined) {
      updateFields.teacherId = payload.teacherId;
      if (payload.teacherId && ObjectId.isValid(payload.teacherId)) {
        const teacher = await db.collection("teachers").findOne({ _id: new ObjectId(payload.teacherId) });
        if (teacher) updateFields.teacherName = teacher.name;
      } else {
        updateFields.teacherName = "";
      }
    }

    if (payload.subjectId !== undefined) {
      updateFields.subjectId = payload.subjectId;
      if (payload.subjectId && ObjectId.isValid(payload.subjectId)) {
        const subject = await db.collection("subjects").findOne({ _id: new ObjectId(payload.subjectId) });
        if (subject) updateFields.subjectName = subject.name;
      } else {
        updateFields.subjectName = "";
      }
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: "Data jadwal tidak ditemukan." };
    }

    revalidatePath(`/modules/${unit.toLowerCase()}`);

    return {
      success: true,
      message: "Jadwal berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Error in updateScheduleAction:", error);
    return {
      success: false,
      error: "Gagal memperbarui jadwal.",
    };
  }
}

/**
 * Menghapus jadwal
 */
export async function deleteScheduleAction(
  id: string,
  unit: "MI" | "MTs" | "TPQ"
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const modKey = unit === "MI" ? "mi" : unit === "MTs" ? "mts" : "tpq";
    const auth = await verifyUserPermission(modKey, "delete");
    if (!auth.allowed) {
      return {
        success: false,
        error: auth.error || "Akses ditolak: Anda tidak memiliki wewenang menghapus jadwal.",
      };
    }

    if (!id || !ObjectId.isValid(id)) {
      return { success: false, error: "ID jadwal tidak valid." };
    }

    const db = await getDatabase();
    const collection = db.collection("schedules");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return { success: false, error: "Data jadwal tidak ditemukan." };
    }

    revalidatePath(`/modules/${unit.toLowerCase()}`);

    return {
      success: true,
      message: "Jadwal berhasil dihapus.",
    };
  } catch (error) {
    console.error("Error in deleteScheduleAction:", error);
    return {
      success: false,
      error: "Gagal menghapus jadwal.",
    };
  }
}
