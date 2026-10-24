"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { getSessionFromCookies } from "@/lib/auth";
import { verifyUserPermission } from "@/lib/actions/roles";
import type { ModulePermissionKey } from "@/lib/roles-config";
import { SantriRecord } from "@/lib/actions/students";
import { TeacherRecord } from "@/lib/actions/teachers";
import { serializeData } from "@/lib/utils";

export interface UnitCurriculumItem {
  kitab: string;
  bidang: string;
  kelas: string;
  target: string;
}

export interface UnitScheduleItem {
  hari: string;
  waktu: string;
  kegiatan: string;
}

export interface UnitRecord {
  _id?: string;
  slug: "mi" | "mts" | "tpq" | string;
  name: string;
  shortName: string;
  jenjang: string;
  tagline: string;
  description: string;
  headmaster: {
    name: string;
    nip: string;
    title: string;
    phone: string;
    email: string;
  };
  status: "AKTIF" | "PERSIAPAN_PEMBUKAAN" | string;
  accreditation?: string;
  establishedYear?: number;
  address?: string;
  targetCapacity?: number;
  curriculum: UnitCurriculumItem[];
  schedules: UnitScheduleItem[];
  facilities: string[];
  updatedAt?: string;
}

/**
 * Mengambil daftar seluruh unit pendidikan (MI, MTs, TPQ)
 */
export async function getUnitsAction(): Promise<{
  success: boolean;
  data?: UnitRecord[];
  error?: string;
}> {
  try {
    const db = await getDatabase();
    const collection = db.collection<UnitRecord>("units");
    const units = await collection.find({}).toArray();

    return {
      success: true,
      data: serializeData(units),
    };
  } catch (error) {
    console.error("Error fetching units:", error);
    return {
      success: false,
      error: "Gagal memuat daftar unit pendidikan.",
    };
  }
}

/**
 * Mengambil detail satu unit pendidikan berdasarkan slug (mi, mts, atau tpq)
 */
export async function getUnitBySlugAction(slug: string): Promise<{
  success: boolean;
  data?: UnitRecord;
  error?: string;
}> {
  try {
    const cleanSlug = slug.toLowerCase().trim();
    const db = await getDatabase();
    const collection = db.collection<UnitRecord>("units");
    const unit = await collection.findOne({ slug: cleanSlug });

    if (!unit) {
      return {
        success: false,
        error: `Unit pendidikan dengan kode '${slug}' tidak ditemukan.`,
      };
    }

    return {
      success: true,
      data: serializeData(unit),
    };
  } catch (error) {
    console.error(`Error fetching unit ${slug}:`, error);
    return {
      success: false,
      error: "Gagal memuat rincian unit pendidikan.",
    };
  }
}

/**
 * Mengambil daftar santri yang terdaftar aktif pada unit tertentu
 */
export async function getUnitStudentsAction(slug: string): Promise<{
  success: boolean;
  data?: SantriRecord[];
  error?: string;
}> {
  try {
    const cleanSlug = slug.toLowerCase().trim();
    let jenjangMatch: "MI" | "MTs" | "TPQ" = "MI";
    if (cleanSlug === "mts") jenjangMatch = "MTs";
    if (cleanSlug === "tpq") jenjangMatch = "TPQ";

    const db = await getDatabase();
    const collection = db.collection<SantriRecord>("students");
    const students = await collection
      .find({ jenjang: jenjangMatch })
      .sort({ nis: 1 })
      .toArray();

    return {
      success: true,
      data: serializeData(students),
    };
  } catch (error) {
    console.error(`Error fetching students for unit ${slug}:`, error);
    return {
      success: false,
      error: "Gagal memuat daftar santri unit ini.",
    };
  }
}

/**
 * Mengambil daftar dewan asatidz yang ditugaskan pada unit tertentu
 */
export async function getUnitTeachersAction(slug: string): Promise<{
  success: boolean;
  data?: TeacherRecord[];
  error?: string;
}> {
  try {
    const cleanSlug = slug.toLowerCase().trim();
    let institutionMatch: "MI" | "MTs" | "TPQ" = "MI";
    if (cleanSlug === "mts") institutionMatch = "MTs";
    if (cleanSlug === "tpq") institutionMatch = "TPQ";

    const db = await getDatabase();
    const collection = db.collection<TeacherRecord>("teachers");
    const teachers = await collection
      .find({
        $or: [
          { institution: institutionMatch },
          { institutions: institutionMatch },
          { "teachingAssignments.unit": institutionMatch },
          { "homeroomAssignments.unit": institutionMatch },
        ],
      })
      .sort({ nip: 1 })
      .toArray();

    const formatted: TeacherRecord[] = teachers.map((t) => ({
      id: t._id ? t._id.toString() : t.id,
      _id: t._id ? t._id.toString() : t.id,
      nip: t.nip,
      name: t.name,
      role: t.role,
      institution: t.institution,
      institutions: Array.isArray(t.institutions) && t.institutions.length > 0 ? t.institutions : [t.institution || "MI"],
      teachingAssignments: Array.isArray(t.teachingAssignments) ? t.teachingAssignments : [],
      homeroomAssignments: Array.isArray(t.homeroomAssignments) ? t.homeroomAssignments : [],
      specialization: t.specialization,
      phone: t.phone,
      status: t.status,
      joinedYear: t.joinedYear,
      createdAt: t.createdAt ? String(t.createdAt) : undefined,
      updatedAt: t.updatedAt ? String(t.updatedAt) : undefined,
    }));

    return {
      success: true,
      data: serializeData(formatted),
    };
  } catch (error) {
    console.error(`Error fetching teachers for unit ${slug}:`, error);
    return {
      success: false,
      error: "Gagal memuat daftar dewan asatidz unit ini.",
    };
  }
}

/**
 * Memperbarui data kurikulum, jadwal, atau fasilitas unit (hanya untuk Super Admin, Ketua Ranting, dan Staf Administrasi)
 */
export async function updateUnitAction(
  slug: string,
  payload: Partial<UnitRecord>
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const cleanSlug = slug.toLowerCase().trim();
    const modKey: ModulePermissionKey =
      cleanSlug === "mi" ? "mi" : cleanSlug === "mts" ? "mts" : cleanSlug === "tpq" ? "tpq" : "modules";

    const authCheck = await verifyUserPermission(modKey, "update");
    if (!authCheck.allowed) {
      return {
        success: false,
        error: authCheck.error || "Akses ditolak: Peran Anda tidak memiliki izin untuk memperbarui unit pendidikan ini.",
      };
    }
    const db = await getDatabase();
    const collection = db.collection("units");

    // Remove immutable fields
    const { _id, slug: _, ...updateData } = payload as Record<string, unknown>;

    const result = await collection.updateOne(
      { slug: cleanSlug },
      {
        $set: {
          ...updateData,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: "Unit pendidikan tidak ditemukan." };
    }

    return {
      success: true,
      message: `Konfigurasi unit '${cleanSlug.toUpperCase()}' berhasil diperbarui.`,
    };
  } catch (error) {
    console.error("Error updating unit:", error);
    return {
      success: false,
      error: "Terjadi kesalahan internal saat memperbarui data unit.",
    };
  }
}
