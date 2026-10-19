"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { serializeData } from "@/lib/utils";

export interface PendaftaranPayload {
  namaLengkap: string;
  nik?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  namaAyah?: string;
  namaIbu?: string;
  noWhatsApp?: string;
  provinsi?: string;
  kotaKab?: string;
  alamatLengkap?: string;
  konsulat?: string;
  jenjang: "MI" | "MTs" | "TPQ";
  statusMukim: "SANTRI" | "MURID";
  catatanKhusus?: string;
}

export async function submitPendaftaranAction(payload: PendaftaranPayload) {
  try {
    if (!payload.namaLengkap || !payload.jenjang) {
      return { success: false, error: "Nama lengkap dan jenjang pendidikan wajib diisi." };
    }

    if ((payload.jenjang as string) === "MA") {
      return {
        success: false,
        error: "Jenjang Madrasah Aliyah (MA) tidak dibuka di Darul Khidmah Sidogiri Bekasi. Pilihan tersedia: MI, MTs (Persiapan), dan TPQ.",
      };
    }

    const regId = `DKS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    const record = {
      regId,
      ...payload,
      statusPendaftaran: "TERDAFTAR_ONLINE",
      createdAt: timestamp,
    };

    const db = await getDatabase();
    const collection = db.collection("pendaftaran");
    const result = await collection.insertOne(record);

    return {
      success: true,
      message: "Pendaftaran santri baru berhasil dikirim.",
      data: serializeData({
        id: result.insertedId.toString(),
        regId,
        namaLengkap: payload.namaLengkap,
        jenjang: payload.jenjang,
        statusPendaftaran: "TERDAFTAR_ONLINE",
      }),
    };
  } catch (error) {
    console.error("Error in submitPendaftaranAction:", error);
    return { success: false, error: "Terjadi gangguan saat memproses pendaftaran." };
  }
}
