"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { getSessionFromCookies } from "@/lib/auth";
import { verifyUserPermission } from "@/lib/actions/roles";
import { ObjectId } from "mongodb";
import { serializeData } from "@/lib/utils";

export interface TeacherRecord {
  id?: string;
  _id?: string;
  nip: string;
  name: string;
  role: string;
  institution: "MI" | "MTs" | "TPQ";
  specialization: string;
  phone: string;
  status: "AKTIF" | "CUTI";
  joinedYear: number;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_TEACHERS = [
  {
    nip: "DKS-AS-01",
    name: "Ust. M. Sholeh Al-Bantani, S.Pd.I",
    role: "Kepala Madrasah Ibtidaiyah",
    institution: "MI",
    specialization: "Fiqih Fathul Qorib & Ushul Fiqh",
    phone: "0812-3456-7801",
    status: "AKTIF",
    joinedYear: 2020,
    createdAt: new Date().toISOString(),
  },
  {
    nip: "DKS-AS-02",
    name: "Ust. Abdullah Faqih, M.Ag",
    role: "Koordinator Persiapan MTs",
    institution: "MTs",
    specialization: "Nahwu Shorof & Alfiyah Ibnu Malik",
    phone: "0812-3456-7802",
    status: "AKTIF",
    joinedYear: 2022,
    createdAt: new Date().toISOString(),
  },
  {
    nip: "DKS-AS-03",
    name: "Ust. Ahmad Zaini Al-Hafizh",
    role: "Koordinator TPQ & Tahfizh",
    institution: "TPQ",
    specialization: "Metode Tartil Sidogiri & Tajwid Praktis",
    phone: "0812-3456-7803",
    status: "AKTIF",
    joinedYear: 2021,
    createdAt: new Date().toISOString(),
  },
  {
    nip: "DKS-AS-04",
    name: "Ust. H. Ridwan Mansyur, Lc",
    role: "Guru Senior Kitab Kuning",
    institution: "MI",
    specialization: "Hadits Nabawi & Riyadhis Shalihin",
    phone: "0812-3456-7804",
    status: "AKTIF",
    joinedYear: 2021,
    createdAt: new Date().toISOString(),
  },
  {
    nip: "DKS-AS-05",
    name: "Ust. Farhan Syuhada, S.Hum",
    role: "Guru Bahasa Arab & Tarikh",
    institution: "MI",
    specialization: "Durusul Lughah & Tarikh Islam",
    phone: "0812-3456-7805",
    status: "AKTIF",
    joinedYear: 2023,
    createdAt: new Date().toISOString(),
  },
];

export async function getTeachersAction(): Promise<{ success: boolean; data?: TeacherRecord[]; error?: string }> {
  try {
    const db = await getDatabase();
    const collection = db.collection("teachers");

    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(DEFAULT_TEACHERS);
    }

    const records = await collection.find({}).sort({ nip: 1 }).toArray();
    const formatted: TeacherRecord[] = records.map((t) => ({
      id: t._id.toString(),
      nip: t.nip,
      name: t.name,
      role: t.role,
      institution: t.institution,
      specialization: t.specialization,
      phone: t.phone,
      status: t.status,
      joinedYear: t.joinedYear,
      createdAt: t.createdAt,
    }));

    return { success: true, data: serializeData(formatted) };
  } catch (error) {
    console.error("Error in getTeachersAction:", error);
    return { success: false, error: "Gagal memuat dewan asatidz." };
  }
}

export async function createTeacherAction(payload: {
  nip: string;
  name: string;
  role: string;
  institution: "MI" | "MTs" | "TPQ";
  specialization: string;
  phone: string;
  status: "AKTIF" | "CUTI";
  joinedYear: number;
}) {
  try {
    const authCheck = await verifyUserPermission("teachers", "create");
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.error || "Akses ditolak: Anda tidak memiliki wewenang untuk menambahkan data asatidz baru." };
    }

    const { nip, name, role, institution, specialization, phone } = payload;
    if (!nip || !name || !role || !institution) {
      return { success: false, error: "NIP, Nama, Tugas, dan Lembaga wajib diisi." };
    }

    const db = await getDatabase();
    const collection = db.collection("teachers");

    const newRecord = {
      nip: String(nip).trim().toUpperCase(),
      name: String(name).trim(),
      role: String(role).trim(),
      institution,
      specialization: String(specialization || "").trim(),
      phone: String(phone || "").trim(),
      status: payload.status || "AKTIF",
      joinedYear: Number(payload.joinedYear) || new Date().getFullYear(),
      createdAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(newRecord);
    return {
      success: true,
      message: "Data asatidz berhasil ditambahkan.",
      data: serializeData({
        id: result.insertedId.toString(),
        nip: newRecord.nip,
        name: newRecord.name,
        role: newRecord.role,
        institution: newRecord.institution,
        specialization: newRecord.specialization,
        phone: newRecord.phone,
        status: newRecord.status,
        joinedYear: newRecord.joinedYear,
        createdAt: newRecord.createdAt,
      }),
    };
  } catch (error) {
    console.error("Error in createTeacherAction:", error);
    return { success: false, error: "Gagal menambahkan guru." };
  }
}

export async function updateTeacherAction(id: string, payload: Partial<TeacherRecord>) {
  try {
    const authCheck = await verifyUserPermission("teachers", "update");
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.error || "Akses ditolak: Anda tidak memiliki wewenang untuk memperbarui data asatidz." };
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
    if (payload.specialization !== undefined) updateFields.specialization = String(payload.specialization).trim();
    if (payload.phone !== undefined) updateFields.phone = String(payload.phone).trim();
    if (payload.status) updateFields.status = payload.status;
    if (payload.joinedYear) updateFields.joinedYear = Number(payload.joinedYear);

    const result = await collection.updateOne(query, { $set: updateFields });
    if (result.matchedCount === 0) {
      return { success: false, error: "Data asatidz tidak ditemukan." };
    }

    return { success: true, message: "Data asatidz berhasil diperbarui." };
  } catch (error) {
    console.error("Error in updateTeacherAction:", error);
    return { success: false, error: "Gagal memperbarui data asatidz." };
  }
}

export async function deleteTeacherAction(id: string) {
  try {
    const authCheck = await verifyUserPermission("teachers", "delete");
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.error || "Akses ditolak: Anda tidak memiliki wewenang untuk menghapus data asatidz." };
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

    const result = await collection.deleteOne(query);
    if (result.deletedCount === 0) {
      return { success: false, error: "Data asatidz tidak ditemukan." };
    }

    return { success: true, message: "Data asatidz berhasil dihapus." };
  } catch (error) {
    console.error("Error in deleteTeacherAction:", error);
    return { success: false, error: "Gagal menghapus data asatidz." };
  }
}
