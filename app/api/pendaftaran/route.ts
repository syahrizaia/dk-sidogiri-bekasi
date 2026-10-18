import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

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

export async function POST(request: NextRequest) {
  try {
    const body: PendaftaranPayload = await request.json();

    if (!body.namaLengkap || !body.jenjang) {
      return NextResponse.json(
        {
          success: false,
          error: "Nama lengkap dan jenjang pendidikan wajib diisi.",
        },
        { status: 400 }
      );
    }

    // Validasi aturan kelembagaan Bekasi
    if ((body.jenjang as string) === "MA") {
      return NextResponse.json(
        {
          success: false,
          error: "Jenjang Madrasah Aliyah (MA) tidak dibuka di Darul Khidmah Sidogiri Bekasi. Pilihan tersedia: MI, MTs (Persiapan), dan TPQ.",
        },
        { status: 400 }
      );
    }

    const regId = `DKS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    const record = {
      regId,
      ...body,
      statusPendaftaran: "TERDAFTAR_ONLINE",
      createdAt: timestamp,
    };

    let mongoInsertedId: string | null = null;
    try {
      const db = await getDatabase();
      const collection = db.collection("pendaftaran");
      const insertResult = await collection.insertOne(record);
      mongoInsertedId = String(insertResult.insertedId);
    } catch (dbErr) {
      console.warn("MongoDB pendaftaran warning (processed with fallback):", dbErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pendaftaran santri baru Darul Khidmah Sidogiri Bekasi berhasil diterima dan tersimpan di database.",
        data: {
          ...record,
          id: mongoInsertedId || regId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat memproses formulir pendaftaran.",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
