"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";

export interface ParentRecord {
  id?: string;
  name: string;
  phone: string;
  studentName: string;
  studentNis: string;
  studentInstitution: "MI" | "MTs" | "TPQ";
  relation: "Ayah" | "Ibu" | "Wali";
  address: string;
  status: "AKTIF" | "ALUMNI";
  createdAt?: string;
}

const DEFAULT_PARENTS = [
  {
    name: "H. Muhammad Ridwan",
    phone: "0812-9876-5401",
    studentName: "Ahmad Farhan",
    studentNis: "202601001",
    studentInstitution: "MI",
    relation: "Ayah",
    address: "Bekasi Timur, Kota Bekasi",
    status: "AKTIF",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Hj. Siti Aminah",
    phone: "0813-8765-4302",
    studentName: "Zainal Abidin",
    studentNis: "202601002",
    studentInstitution: "MI",
    relation: "Ibu",
    address: "Pondok Gede, Kota Bekasi",
    status: "AKTIF",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Bpk. Agus Salim",
    phone: "0812-7654-3203",
    studentName: "Bilal Habasyi",
    studentNis: "202602001",
    studentInstitution: "MTs",
    relation: "Ayah",
    address: "Tambun Selatan, Kab. Bekasi",
    status: "AKTIF",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Ibu Nurul Hidayah",
    phone: "0815-6543-2104",
    studentName: "Fathur Rahman",
    studentNis: "202602002",
    studentInstitution: "MTs",
    relation: "Ibu",
    address: "Cikarang Barat, Kab. Bekasi",
    status: "AKTIF",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Bpk. Samsul Arifin",
    phone: "0877-8901-2345",
    studentName: "Khoirul Anam",
    studentNis: "202603001",
    studentInstitution: "TPQ",
    relation: "Ayah",
    address: "Mustikajaya, Kota Bekasi",
    status: "AKTIF",
    createdAt: new Date().toISOString(),
  },
];

export async function getParentsAction(): Promise<{ success: boolean; data?: ParentRecord[]; error?: string }> {
  try {
    const db = await getDatabase();
    const collection = db.collection("parents");

    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(DEFAULT_PARENTS);
    }

    const records = await collection.find({}).sort({ createdAt: -1 }).toArray();
    const formatted: ParentRecord[] = records.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      phone: p.phone,
      studentName: p.studentName,
      studentNis: p.studentNis,
      studentInstitution: p.studentInstitution,
      relation: p.relation,
      address: p.address,
      status: p.status,
      createdAt: p.createdAt,
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error in getParentsAction:", error);
    return { success: false, error: "Gagal memuat wali santri." };
  }
}

export async function createParentAction(payload: {
  name: string;
  phone: string;
  studentName: string;
  studentNis: string;
  studentInstitution: "MI" | "MTs" | "TPQ";
  relation: "Ayah" | "Ibu" | "Wali";
  address: string;
  status: "AKTIF" | "ALUMNI";
}) {
  try {
    const { name, phone, studentName, studentNis, studentInstitution, relation, address } = payload;
    if (!name || !phone || !studentName || !studentNis) {
      return { success: false, error: "Nama wali, no HP, nama santri, dan NIS wajib diisi." };
    }

    const db = await getDatabase();
    const collection = db.collection("parents");

    const newRecord = {
      name: String(name).trim(),
      phone: String(phone).trim(),
      studentName: String(studentName).trim(),
      studentNis: String(studentNis).trim().toUpperCase(),
      studentInstitution,
      relation,
      address: String(address || "").trim(),
      status: payload.status || "AKTIF",
      createdAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(newRecord);
    return {
      success: true,
      message: "Data wali santri berhasil ditambahkan.",
      data: { ...newRecord, id: result.insertedId.toString() },
    };
  } catch (error) {
    console.error("Error in createParentAction:", error);
    return { success: false, error: "Gagal menambahkan wali santri." };
  }
}
