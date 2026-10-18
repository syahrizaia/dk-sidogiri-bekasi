"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";

export interface TeacherRecord {
  id?: string;
  nip: string;
  name: string;
  role: string;
  institution: "MI" | "MTs" | "TPQ";
  specialization: string;
  phone: string;
  status: "AKTIF" | "CUTI";
  joinedYear: number;
  createdAt?: string;
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

    return { success: true, data: formatted };
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
      data: { ...newRecord, id: result.insertedId.toString() },
    };
  } catch (error) {
    console.error("Error in createTeacherAction:", error);
    return { success: false, error: "Gagal menambahkan guru." };
  }
}
