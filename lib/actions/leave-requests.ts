"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { getSessionFromCookies } from "@/lib/auth";

export interface IzinSantriRecord {
  id?: string;
  studentId?: string;
  studentNis: string;
  studentName: string;
  parentUserId: string;
  parentName: string;
  alasan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  catatan?: string;
  status: "MENUNGGU" | "DISETUJUI" | "DITOLAK";
  createdAt: string;
}

export async function submitIzinSantriAction(payload: {
  studentId?: string;
  studentNis: string;
  studentName: string;
  alasan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  catatan?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return { success: false, error: "Sesi tidak valid. Silakan login terlebih dahulu." };
    }

    if (!payload.studentNis || !payload.studentName || !payload.tanggalMulai || !payload.tanggalSelesai) {
      return { success: false, error: "Mohon lengkapi seluruh formulir permohonan izin." };
    }

    const db = await getDatabase();
    const collection = db.collection<IzinSantriRecord>("leave_requests");

    const record: IzinSantriRecord = {
      studentId: payload.studentId || session.studentId || "",
      studentNis: payload.studentNis,
      studentName: payload.studentName,
      parentUserId: session.id,
      parentName: session.name,
      alasan: payload.alasan,
      tanggalMulai: payload.tanggalMulai,
      tanggalSelesai: payload.tanggalSelesai,
      catatan: payload.catatan || "",
      status: "MENUNGGU",
      createdAt: new Date().toISOString(),
    };

    await collection.insertOne(record);

    return {
      success: true,
      message: "Permohonan izin santri berhasil diajukan dan sedang menunggu verifikasi dewan asatidz / musyrif.",
    };
  } catch (error) {
    console.error("Error in submitIzinSantriAction:", error);
    return { success: false, error: "Gagal mengajukan permohonan izin santri." };
  }
}
