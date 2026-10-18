"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";

export interface SantriRecord {
  id?: string;
  nis: string;
  nama: string;
  jenjang: "MI" | "MTs" | "TPQ";
  kelas: string;
  konsulat: string;
  status: "MUKIM" | "NON-MUKIM";
  kamar: string;
  wali: string;
  noHp: string;
  createdAt?: string;
}

const defaultSantri: SantriRecord[] = [
  { id: "1", nis: "2024.11.001", nama: "Ahmad Fawaid", jenjang: "MI", kelas: "6 Ibtidaiyah A", konsulat: "Bekasi Timur", status: "MUKIM", kamar: "Blok A - Kamar 04", wali: "H. Abdullah Syukri", noHp: "081234567890" },
  { id: "2", nis: "2024.11.002", nama: "Muhammad Lutfi Hakim", jenjang: "MTs", kelas: "Persiapan 1 MTs", konsulat: "Tambun Selatan", status: "NON-MUKIM", kamar: "Non-Asrama (Tambun)", wali: "Ust. Miftahul Huda", noHp: "081398765432" },
  { id: "3", nis: "2024.11.003", nama: "Zainal Abidin", jenjang: "MI", kelas: "5 Ibtidaiyah C", konsulat: "Cikarang Barat", status: "MUKIM", kamar: "Blok B - Kamar 12", wali: "Kyai Manshur", noHp: "085612348765" },
  { id: "4", nis: "2024.11.004", nama: "Khoirul Anam", jenjang: "TPQ", kelas: "Jilid 6 Al-Qur'an", konsulat: "Mustikajaya", status: "NON-MUKIM", kamar: "Non-Asrama (Mustikajaya)", wali: "Bpk. Samsul Arifin", noHp: "087789012345" },
  { id: "5", nis: "2024.11.005", nama: "Fauzan Nur Rahmat", jenjang: "MI", kelas: "4 Ibtidaiyah B", konsulat: "Rawalumbu", status: "MUKIM", kamar: "Blok A - Kamar 08", wali: "Ir. H. Gunawan", noHp: "081233445566" },
  { id: "6", nis: "2024.11.006", nama: "Ilham Ramadhan", jenjang: "MTs", kelas: "Persiapan 1 MTs", konsulat: "DKI Jakarta", status: "MUKIM", kamar: "Blok B - Kamar 02", wali: "Dr. Bambang Sutrisno", noHp: "081566778899" },
  { id: "7", nis: "2024.11.007", nama: "Ali Zainal Musthofa", jenjang: "MI", kelas: "6 Ibtidaiyah A", konsulat: "Bekasi Utara", status: "MUKIM", kamar: "Blok A - Kamar 09", wali: "H. Abdul Wahab", noHp: "081822334455" },
  { id: "8", nis: "2024.11.008", nama: "Hasan Bisri", jenjang: "TPQ", kelas: "Tartil Tajwid", konsulat: "Pondok Gede", status: "NON-MUKIM", kamar: "Non-Asrama (Pondok Gede)", wali: "Bpk. Sukron Ma'mun", noHp: "082199887766" },
];

export async function getStudentsAction(params?: {
  search?: string;
  jenjang?: string;
  status?: string;
}): Promise<{ success: boolean; data?: SantriRecord[]; error?: string }> {
  try {
    const search = params?.search?.trim() || "";
    const jenjang = params?.jenjang || "Semua";
    const status = params?.status || "Semua";

    const db = await getDatabase();
    const collection = db.collection<SantriRecord>("santri");

    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(defaultSantri);
    }

    const query: Record<string, unknown> = {};
    if (jenjang !== "Semua") {
      query.jenjang = jenjang;
    }
    if (status !== "Semua") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { nama: { $regex: search, $options: "i" } },
        { nis: { $regex: search, $options: "i" } },
        { konsulat: { $regex: search, $options: "i" } },
        { kamar: { $regex: search, $options: "i" } },
      ];
    }

    const data = await collection.find(query).toArray();
    const formatted = data.map((d) => ({
      ...d,
      id: d._id ? d._id.toString() : d.id || d.nis,
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error in getStudentsAction:", error);
    return { success: false, error: "Gagal mengambil data santri." };
  }
}

export async function createStudentAction(payload: SantriRecord) {
  try {
    if (!payload.nis || !payload.nama || !payload.jenjang) {
      return { success: false, error: "NIS, Nama Santri, dan Jenjang wajib diisi." };
    }

    const db = await getDatabase();
    const collection = db.collection<SantriRecord>("santri");

    const newRecord: SantriRecord = {
      ...payload,
      createdAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(newRecord);
    return {
      success: true,
      message: "Data santri berhasil ditambahkan.",
      data: { ...newRecord, id: result.insertedId.toString() },
    };
  } catch (error) {
    console.error("Error in createStudentAction:", error);
    return { success: false, error: "Gagal menyimpan data santri." };
  }
}
