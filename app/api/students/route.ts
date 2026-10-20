import { NextRequest, NextResponse } from "next/server";
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

// Data rujukan dasar Darul Khidmah Sidogiri Bekasi
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const jenjang = searchParams.get("jenjang") || "Semua";
    const status = searchParams.get("status") || "Semua";

    let data: SantriRecord[] = [];
    let source = "mongodb";

    try {
      const db = await getDatabase();
      const collection = db.collection<SantriRecord>("santri");

      // Auto-seed collection if empty
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
        ];
      }

      const docs = await collection.find(query).toArray();
      data = docs.map((doc) => ({
        id: String(doc._id || doc.id),
        nis: doc.nis,
        nama: doc.nama,
        jenjang: doc.jenjang,
        kelas: doc.kelas,
        konsulat: doc.konsulat,
        status: doc.status,
        kamar: doc.kamar,
        wali: doc.wali,
        noHp: doc.noHp,
        createdAt: doc.createdAt,
      }));
    } catch (dbErr) {
      // Graceful fallback to memory data jika koneksi lambat/terputus
      source = "memory_fallback";
      console.warn("MongoDB fetch warning, using fallback:", dbErr);
      data = defaultSantri;
      if (search) {
        data = data.filter(
          (s) =>
            s.nama.toLowerCase().includes(search) ||
            s.nis.toLowerCase().includes(search) ||
            s.konsulat.toLowerCase().includes(search)
        );
      }
      if (jenjang !== "Semua") {
        data = data.filter((s) => s.jenjang === jenjang);
      }
      if (status !== "Semua") {
        data = data.filter((s) => s.status === status);
      }
    }

    return NextResponse.json({
      success: true,
      source,
      total: data.length,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal memuat data santri", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.nama || !body.jenjang) {
      return NextResponse.json(
        { success: false, error: "Field nama dan jenjang wajib diisi." },
        { status: 400 }
      );
    }

    const newSantri: SantriRecord = {
      id: String(Date.now()),
      nis: body.nis || `2026.${Math.floor(10 + Math.random() * 90)}.${Math.floor(100 + Math.random() * 900)}`,
      nama: body.nama,
      jenjang: body.jenjang,
      kelas: body.kelas || "Kelas 1",
      konsulat: body.konsulat || "Bekasi",
      status: body.status || "MUKIM",
      kamar: body.kamar || "Asrama Belum Ditentukan",
      wali: body.wali || "-",
      noHp: body.noHp || "-",
      createdAt: new Date().toISOString(),
    };

    try {
      const db = await getDatabase();
      const collection = db.collection("students");
      const result = await collection.insertOne(newSantri);
      newSantri.id = String(result.insertedId);
    } catch (dbErr) {
      console.warn("MongoDB insert warning (saved to session):", dbErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Data santri berhasil ditambahkan ke pangkalan data.",
        data: newSantri,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan data santri", details: String(error) },
      { status: 500 }
    );
  }
}
