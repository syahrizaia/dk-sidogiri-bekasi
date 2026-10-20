"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { getSessionFromCookies } from "@/lib/auth";
import { verifyUserPermission } from "@/lib/actions/roles";
import { ObjectId } from "mongodb";
import { serializeData } from "@/lib/utils";

export interface ParentRecord {
  id?: string;
  _id?: string;
  name: string;
  phone: string;
  studentName: string;
  studentNis: string;
  studentInstitution: "MI" | "MTs" | "TPQ";
  relation: "Ayah" | "Ibu" | "Wali";
  address: string;
  status: "AKTIF" | "ALUMNI";
  studentId?: string;
  userId?: string;
  studentDetails?: {
    id?: string;
    _id?: string;
    nis?: string;
    nama?: string;
    jenjang?: string;
    kelas?: string;
    kamar?: string;
    status?: string;
    konsulat?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_PARENTS: ParentRecord[] = [
  {
    name: "H. Abdullah Syukri",
    phone: "0812-3456-7890",
    studentName: "Ahmad Fawaid",
    studentNis: "2024.11.001",
    studentInstitution: "MI",
    relation: "Ayah",
    address: "Bekasi Timur, Kota Bekasi",
    status: "AKTIF",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Ust. Miftahul Huda",
    phone: "0813-9876-5432",
    studentName: "Muhammad Lutfi Hakim",
    studentNis: "2024.11.002",
    studentInstitution: "MTs",
    relation: "Ayah",
    address: "Tambun Selatan, Kab. Bekasi",
    status: "AKTIF",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Hj. Siti Aminah",
    phone: "0813-8765-4302",
    studentName: "Zainal Abidin",
    studentNis: "2024.11.003",
    studentInstitution: "MI",
    relation: "Ibu",
    address: "Cikarang Barat, Kab. Bekasi",
    status: "AKTIF",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Bpk. Samsul Arifin",
    phone: "0877-8901-2345",
    studentName: "Khoirul Anam",
    studentNis: "2024.11.004",
    studentInstitution: "TPQ",
    relation: "Ayah",
    address: "Mustikajaya, Kota Bekasi",
    status: "AKTIF",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Ir. H. Gunawan",
    phone: "0812-3344-5566",
    studentName: "Fauzan Nur Rahmat",
    studentNis: "2024.11.005",
    studentInstitution: "MI",
    relation: "Ayah",
    address: "Rawalumbu, Kota Bekasi",
    status: "AKTIF",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Dr. Bambang Sutrisno",
    phone: "0815-6677-8899",
    studentName: "Ilham Ramadhan",
    studentNis: "2024.11.006",
    studentInstitution: "MTs",
    relation: "Wali",
    address: "DKI Jakarta Timur",
    status: "AKTIF",
    createdAt: new Date().toISOString(),
  },
  {
    name: "H. Abdul Wahab",
    phone: "0818-2233-4455",
    studentName: "Ali Zainal Musthofa",
    studentNis: "2024.11.007",
    studentInstitution: "MI",
    relation: "Ayah",
    address: "Bekasi Utara, Kota Bekasi",
    status: "AKTIF",
    createdAt: new Date().toISOString(),
  },
  {
    name: "Bpk. Sukron Ma'mun",
    phone: "0821-9988-7766",
    studentName: "Hasan Bisri",
    studentNis: "2024.11.008",
    studentInstitution: "TPQ",
    relation: "Ayah",
    address: "Pondok Gede, Kota Bekasi",
    status: "AKTIF",
    createdAt: new Date().toISOString(),
  },
];

export async function getParentsAction(): Promise<{ success: boolean; data?: ParentRecord[]; error?: string }> {
  try {
    const db = await getDatabase();
    const collection = db.collection("parents");
    const santriCollection = db.collection("students");

    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(DEFAULT_PARENTS as any);
    }

    const [records, santriList] = await Promise.all([
      collection.find({}).sort({ createdAt: -1 }).toArray(),
      santriCollection.find({}).toArray(),
    ]);

    const formatted: ParentRecord[] = records.map((p) => {
      // Temukan santri yang berelasi
      const matchedSantri = santriList.find(
        (s) =>
          (p.studentNis && s.nis && p.studentNis.trim().toUpperCase() === s.nis.trim().toUpperCase()) ||
          (p.studentName && s.nama && p.studentName.trim().toLowerCase() === s.nama.trim().toLowerCase())
      );

      return {
        id: p._id.toString(),
        name: p.name,
        phone: p.phone,
        studentName: matchedSantri?.nama || p.studentName,
        studentNis: matchedSantri?.nis || p.studentNis,
        studentInstitution: (matchedSantri?.jenjang || p.studentInstitution) as "MI" | "MTs" | "TPQ",
        relation: p.relation,
        address: p.address,
        status: p.status,
        studentId: (p.studentId ? String(p.studentId) : undefined) || (matchedSantri?._id ? matchedSantri._id.toString() : undefined),
        userId: p.userId ? String(p.userId) : undefined,
        studentDetails: matchedSantri
          ? {
              id: matchedSantri._id ? matchedSantri._id.toString() : undefined,
              nis: matchedSantri.nis,
              nama: matchedSantri.nama,
              jenjang: matchedSantri.jenjang,
              kelas: matchedSantri.kelas,
              kamar: matchedSantri.kamar,
              status: matchedSantri.status,
              konsulat: matchedSantri.konsulat,
            }
          : undefined,
        createdAt: p.createdAt,
      };
    });

    return { success: true, data: serializeData(formatted) };
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
    const authCheck = await verifyUserPermission("parents", "create");
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.error || "Akses ditolak: Anda tidak memiliki wewenang untuk menambahkan data wali santri baru." };
    }

    const { name, phone, studentName, studentNis, studentInstitution, relation, address } = payload;
    if (!name || !phone || !studentName || !studentNis) {
      return { success: false, error: "Nama wali, no HP, nama santri, dan NIS wajib diisi." };
    }

    const db = await getDatabase();
    const collection = db.collection("parents");
    const santriCollection = db.collection("students");

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

    // Sinkronisasi data wali ke santri terkait jika ada
    await santriCollection.updateOne(
      { $or: [{ nis: newRecord.studentNis }, { nama: newRecord.studentName }] },
      {
        $set: {
          wali: newRecord.name,
          noHp: newRecord.phone,
          parentRelation: newRecord.relation,
          parentAddress: newRecord.address,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: false }
    );

    return {
      success: true,
      message: "Data wali santri berhasil ditambahkan dan direlasikan dengan santri.",
      data: serializeData({
        id: result.insertedId.toString(),
        name: newRecord.name,
        phone: newRecord.phone,
        studentName: newRecord.studentName,
        studentNis: newRecord.studentNis,
        studentInstitution: newRecord.studentInstitution,
        relation: newRecord.relation,
        address: newRecord.address,
        status: newRecord.status,
        createdAt: newRecord.createdAt,
      }),
    };
  } catch (error) {
    console.error("Error in createParentAction:", error);
    return { success: false, error: "Gagal menambahkan wali santri." };
  }
}

export async function updateParentAction(id: string, payload: Partial<ParentRecord>) {
  try {
    const authCheck = await verifyUserPermission("parents", "update");
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.error || "Akses ditolak: Anda tidak memiliki wewenang untuk memperbarui data wali santri." };
    }

    if (!id) {
      return { success: false, error: "ID wali santri tidak valid." };
    }

    const db = await getDatabase();
    const collection = db.collection("parents");
    const santriCollection = db.collection("students");

    let query: Record<string, unknown> = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id }, { studentNis: id }] };
    } else {
      query = { $or: [{ id }, { studentNis: id }] };
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (payload.name) updateFields.name = String(payload.name).trim();
    if (payload.phone) updateFields.phone = String(payload.phone).trim();
    if (payload.studentName) updateFields.studentName = String(payload.studentName).trim();
    if (payload.studentNis) updateFields.studentNis = String(payload.studentNis).trim().toUpperCase();
    if (payload.studentInstitution) updateFields.studentInstitution = payload.studentInstitution;
    if (payload.relation) updateFields.relation = payload.relation;
    if (payload.address !== undefined) updateFields.address = String(payload.address).trim();
    if (payload.status) updateFields.status = payload.status;

    const result = await collection.updateOne(query, { $set: updateFields });
    if (result.matchedCount === 0) {
      return { success: false, error: "Data wali santri tidak ditemukan." };
    }

    // Ambil data terbaru untuk sinkronisasi balik ke santri
    const updatedParent = await collection.findOne(query);
    if (updatedParent && (payload.name || payload.phone || payload.studentNis || payload.studentName || payload.relation || payload.address !== undefined)) {
      await santriCollection.updateOne(
        { $or: [{ nis: updatedParent.studentNis }, { nama: updatedParent.studentName }] },
        {
          $set: {
            wali: updatedParent.name,
            noHp: updatedParent.phone,
            parentRelation: updatedParent.relation,
            parentAddress: updatedParent.address,
            updatedAt: new Date().toISOString(),
          },
        },
        { upsert: false }
      );
    }

    return { success: true, message: "Data wali santri dan relasi santri berhasil diperbarui." };
  } catch (error) {
    console.error("Error in updateParentAction:", error);
    return { success: false, error: "Gagal memperbarui data wali santri." };
  }
}

export async function deleteParentAction(id: string) {
  try {
    const authCheck = await verifyUserPermission("parents", "delete");
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.error || "Akses ditolak: Anda tidak memiliki wewenang untuk menghapus data wali santri." };
    }

    if (!id) {
      return { success: false, error: "ID wali santri tidak valid." };
    }

    const db = await getDatabase();
    const collection = db.collection("parents");

    let query: Record<string, unknown> = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id }, { studentNis: id }] };
    } else {
      query = { $or: [{ id }, { studentNis: id }] };
    }

    const result = await collection.deleteOne(query);
    if (result.deletedCount === 0) {
      return { success: false, error: "Data wali santri tidak ditemukan." };
    }

    return { success: true, message: "Data wali santri berhasil dihapus." };
  } catch (error) {
    console.error("Error in deleteParentAction:", error);
    return { success: false, error: "Gagal menghapus data wali santri." };
  }
}
