"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { getSessionFromCookies } from "@/lib/auth";
import { verifyUserPermission } from "@/lib/actions/roles";
import { ObjectId } from "mongodb";
import { serializeData } from "@/lib/utils";

export interface SantriRecord {
  id?: string;
  _id?: string;
  nis: string;
  nama: string;
  jenjang: "MI" | "MTs" | "TPQ";
  kelas: string;
  konsulat: string;
  status: "MUKIM" | "NON-MUKIM";
  kamar: string;
  wali: string;
  noHp: string;
  parentRelation?: "Ayah" | "Ibu" | "Wali";
  parentAddress?: string;
  parentId?: string;
  parentUserId?: string;
  parentDetails?: {
    id?: string;
    _id?: string;
    name?: string;
    phone?: string;
    relation?: string;
    address?: string;
    status?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const defaultSantri: SantriRecord[] = [
  { id: "1", nis: "2024.11.001", nama: "Ahmad Fawaid", jenjang: "MI", kelas: "6 Ibtidaiyah A", konsulat: "Bekasi Timur", status: "MUKIM", kamar: "Blok A - Kamar 04", wali: "H. Abdullah Syukri", noHp: "0812-3456-7890", parentRelation: "Ayah", parentAddress: "Bekasi Timur, Kota Bekasi" },
  { id: "2", nis: "2024.11.002", nama: "Muhammad Lutfi Hakim", jenjang: "MTs", kelas: "Persiapan 1 MTs", konsulat: "Tambun Selatan", status: "NON-MUKIM", kamar: "Non-Asrama (Tambun)", wali: "Ust. Miftahul Huda", noHp: "0813-9876-5432", parentRelation: "Ayah", parentAddress: "Tambun Selatan, Kab. Bekasi" },
  { id: "3", nis: "2024.11.003", nama: "Zainal Abidin", jenjang: "MI", kelas: "5 Ibtidaiyah C", konsulat: "Cikarang Barat", status: "MUKIM", kamar: "Blok B - Kamar 12", wali: "Hj. Siti Aminah", noHp: "0813-8765-4302", parentRelation: "Ibu", parentAddress: "Cikarang Barat, Kab. Bekasi" },
  { id: "4", nis: "2024.11.004", nama: "Khoirul Anam", jenjang: "TPQ", kelas: "Jilid 6 Al-Qur'an", konsulat: "Mustikajaya", status: "NON-MUKIM", kamar: "Non-Asrama (Mustikajaya)", wali: "Bpk. Samsul Arifin", noHp: "0877-8901-2345", parentRelation: "Ayah", parentAddress: "Mustikajaya, Kota Bekasi" },
  { id: "5", nis: "2024.11.005", nama: "Fauzan Nur Rahmat", jenjang: "MI", kelas: "4 Ibtidaiyah B", konsulat: "Rawalumbu", status: "MUKIM", kamar: "Blok A - Kamar 08", wali: "Ir. H. Gunawan", noHp: "0812-3344-5566", parentRelation: "Ayah", parentAddress: "Rawalumbu, Kota Bekasi" },
  { id: "6", nis: "2024.11.006", nama: "Ilham Ramadhan", jenjang: "MTs", kelas: "Persiapan 1 MTs", konsulat: "DKI Jakarta", status: "MUKIM", kamar: "Blok B - Kamar 02", wali: "Dr. Bambang Sutrisno", noHp: "0815-6677-8899", parentRelation: "Wali", parentAddress: "DKI Jakarta Timur" },
  { id: "7", nis: "2024.11.007", nama: "Ali Zainal Musthofa", jenjang: "MI", kelas: "6 Ibtidaiyah A", konsulat: "Bekasi Utara", status: "MUKIM", kamar: "Blok A - Kamar 09", wali: "H. Abdul Wahab", noHp: "0818-2233-4455", parentRelation: "Ayah", parentAddress: "Bekasi Utara, Kota Bekasi" },
  { id: "8", nis: "2024.11.008", nama: "Hasan Bisri", jenjang: "TPQ", kelas: "Tartil Tajwid", konsulat: "Pondok Gede", status: "NON-MUKIM", kamar: "Non-Asrama (Pondok Gede)", wali: "Bpk. Sukron Ma'mun", noHp: "0821-9988-7766", parentRelation: "Ayah", parentAddress: "Pondok Gede, Kota Bekasi" },
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
    const collection = db.collection<SantriRecord>("students");
    const parentsCollection = db.collection("parents");

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
        { wali: { $regex: search, $options: "i" } },
      ];
    }

    const [data, parentsList] = await Promise.all([
      collection.find(query).toArray(),
      parentsCollection.find({}).toArray(),
    ]);

    const formatted: SantriRecord[] = data.map((d) => {
      // Cari relasi wali santri yang cocok
      const matchedParent = parentsList.find(
        (p) =>
          (p.studentNis && d.nis && p.studentNis.trim().toUpperCase() === d.nis.trim().toUpperCase()) ||
          (p.studentName && d.nama && p.studentName.trim().toLowerCase() === d.nama.trim().toLowerCase()) ||
          (p.name && d.wali && p.name.trim().toLowerCase() === d.wali.trim().toLowerCase())
      );

      return {
        id: d._id ? d._id.toString() : (d.id || d.nis),
        nis: d.nis,
        nama: d.nama,
        jenjang: d.jenjang,
        kelas: d.kelas,
        konsulat: d.konsulat,
        status: d.status,
        kamar: d.kamar,
        wali: d.wali || matchedParent?.name || "",
        noHp: d.noHp || matchedParent?.phone || "",
        parentRelation: (d.parentRelation || matchedParent?.relation || "Wali") as "Ayah" | "Ibu" | "Wali",
        parentAddress: d.parentAddress || matchedParent?.address || "",
        parentId: (d.parentId ? String(d.parentId) : undefined) || (matchedParent?._id ? matchedParent._id.toString() : undefined),
        parentUserId: d.parentUserId ? String(d.parentUserId) : undefined,
        parentDetails: matchedParent
          ? {
              id: matchedParent._id ? matchedParent._id.toString() : undefined,
              name: matchedParent.name,
              phone: matchedParent.phone,
              relation: matchedParent.relation,
              address: matchedParent.address,
              status: matchedParent.status,
            }
          : undefined,
        createdAt: d.createdAt ? String(d.createdAt) : undefined,
      };
    });

    return { success: true, data: serializeData(formatted) };
  } catch (error) {
    console.error("Error in getStudentsAction:", error);
    return { success: false, error: "Gagal mengambil data santri." };
  }
}

export async function createStudentAction(payload: SantriRecord) {
  try {
    const authCheck = await verifyUserPermission("students", "create");
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.error || "Akses ditolak: Anda tidak memiliki wewenang untuk menambahkan santri baru." };
    }

    if (!payload.nis || !payload.nama || !payload.jenjang) {
      return { success: false, error: "NIS, Nama Santri, dan Jenjang wajib diisi." };
    }

    const db = await getDatabase();
    const collection = db.collection<SantriRecord>("students");
    const parentsCollection = db.collection("parents");

    const newRecord: SantriRecord = {
      ...payload,
      createdAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(newRecord);

    // Sinkronisasi otomatis ke koleksi Wali Santri jika ada data wali
    if (payload.wali) {
      await parentsCollection.updateOne(
        { studentNis: payload.nis },
        {
          $set: {
            name: payload.wali,
            phone: payload.noHp || "",
            studentName: payload.nama,
            studentNis: payload.nis,
            studentInstitution: payload.jenjang,
            relation: payload.parentRelation || "Wali",
            address: payload.parentAddress || payload.konsulat || "",
            status: "AKTIF",
            updatedAt: new Date().toISOString(),
          },
          $setOnInsert: {
            createdAt: new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    }

    return {
      success: true,
      message: "Data santri berhasil ditambahkan dan disinkronkan dengan data wali santri.",
      data: serializeData({
        id: result.insertedId.toString(),
        nis: newRecord.nis,
        nama: newRecord.nama,
        jenjang: newRecord.jenjang,
        kelas: newRecord.kelas,
        konsulat: newRecord.konsulat,
        status: newRecord.status,
        kamar: newRecord.kamar,
        wali: newRecord.wali,
        noHp: newRecord.noHp,
        createdAt: newRecord.createdAt,
      }),
    };
  } catch (error) {
    console.error("Error in createStudentAction:", error);
    return { success: false, error: "Gagal menyimpan data santri." };
  }
}

export async function updateStudentAction(id: string, payload: Partial<SantriRecord>) {
  try {
    const authCheck = await verifyUserPermission("students", "update");
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.error || "Akses ditolak: Anda tidak memiliki wewenang untuk mengubah data santri." };
    }

    if (!id) {
      return { success: false, error: "ID santri tidak valid." };
    }

    const db = await getDatabase();
    const collection = db.collection<SantriRecord>("students");
    const parentsCollection = db.collection("parents");

    let query: Record<string, unknown> = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id }, { nis: id }] };
    } else {
      query = { $or: [{ id }, { nis: id }] };
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (payload.nama) updateFields.nama = String(payload.nama).trim();
    if (payload.nis) updateFields.nis = String(payload.nis).trim();
    if (payload.jenjang) updateFields.jenjang = payload.jenjang;
    if (payload.kelas) updateFields.kelas = String(payload.kelas).trim();
    if (payload.konsulat) updateFields.konsulat = String(payload.konsulat).trim();
    if (payload.status) updateFields.status = payload.status;
    if (payload.kamar) updateFields.kamar = String(payload.kamar).trim();
    if (payload.wali) updateFields.wali = String(payload.wali).trim();
    if (payload.noHp) updateFields.noHp = String(payload.noHp).trim();
    if (payload.parentRelation) updateFields.parentRelation = payload.parentRelation;
    if (payload.parentAddress !== undefined) updateFields.parentAddress = String(payload.parentAddress).trim();

    const result = await collection.updateOne(query, { $set: updateFields });
    if (result.matchedCount === 0) {
      return { success: false, error: "Data santri tidak ditemukan." };
    }

    // Ambil data santri terbaru untuk sinkronisasi balik ke parents
    const updatedSantri = await collection.findOne(query);
    if (updatedSantri && (payload.wali || payload.noHp || payload.nama || payload.parentRelation || payload.parentAddress !== undefined)) {
      await parentsCollection.updateOne(
        { $or: [{ studentNis: updatedSantri.nis }, { studentName: updatedSantri.nama }] },
        {
          $set: {
            name: updatedSantri.wali,
            phone: updatedSantri.noHp,
            studentName: updatedSantri.nama,
            studentNis: updatedSantri.nis,
            studentInstitution: updatedSantri.jenjang,
            relation: payload.parentRelation || updatedSantri.parentRelation || "Wali",
            address: payload.parentAddress !== undefined ? payload.parentAddress : (updatedSantri.parentAddress || updatedSantri.konsulat),
            status: "AKTIF",
            updatedAt: new Date().toISOString(),
          },
        },
        { upsert: false }
      );
    }

    return { success: true, message: "Data santri dan relasi wali berhasil diperbarui." };
  } catch (error) {
    console.error("Error in updateStudentAction:", error);
    return { success: false, error: "Gagal memperbarui data santri." };
  }
}

/**
 * Mengambil daftar kelas unik yang tersedia di masing-masing jenjang (MI, MTs, TPQ)
 */
export async function getDistinctClassesAction(): Promise<{
  success: boolean;
  data?: Record<"MI" | "MTs" | "TPQ", string[]>;
  error?: string;
}> {
  try {
    const db = await getDatabase();
    const collection = db.collection<SantriRecord>("students");

    const defaultClasses: Record<"MI" | "MTs" | "TPQ", string[]> = {
      MI: [
        "1 Ibtidaiyah",
        "2 Ibtidaiyah",
        "3 Ibtidaiyah A",
        "4 Ibtidaiyah A",
        "4 Ibtidaiyah B",
        "5 Ibtidaiyah A",
        "5 Ibtidaiyah B",
        "5 Ibtidaiyah C",
        "6 Ibtidaiyah A",
        "6 Ibtidaiyah B",
      ],
      MTs: [
        "Persiapan 1 MTs",
        "Persiapan 2 MTs",
        "7 Tsanawiyah A",
        "8 Tsanawiyah A",
        "9 Tsanawiyah A",
      ],
      TPQ: [
        "Jilid 1 Al-Qur'an",
        "Jilid 2 Al-Qur'an",
        "Jilid 3 Al-Qur'an",
        "Jilid 4 Al-Qur'an",
        "Jilid 5 Al-Qur'an",
        "Jilid 6 Al-Qur'an",
        "Tartil Tajwid",
      ],
    };

    const students = await collection.find({}).toArray();

    const miSet = new Set(defaultClasses.MI);
    const mtsSet = new Set(defaultClasses.MTs);
    const tpqSet = new Set(defaultClasses.TPQ);

    students.forEach((s) => {
      if (s.kelas && s.kelas.trim()) {
        if (s.jenjang === "MI") miSet.add(s.kelas.trim());
        else if (s.jenjang === "MTs") mtsSet.add(s.kelas.trim());
        else if (s.jenjang === "TPQ") tpqSet.add(s.kelas.trim());
      }
    });

    const result = {
      MI: Array.from(miSet).sort(),
      MTs: Array.from(mtsSet).sort(),
      TPQ: Array.from(tpqSet).sort(),
    };

    return {
      success: true,
      data: serializeData(result),
    };
  } catch (error) {
    console.error("Error in getDistinctClassesAction:", error);
    return {
      success: false,
      error: "Gagal memuat daftar kelas.",
    };
  }
}

