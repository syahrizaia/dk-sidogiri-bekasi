import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDatabase();

    const [
      totalSantri,
      santriMukim,
      santriNonMukim,
      totalTeachers,
      miSantri,
      mtsSantri,
      tpqSantri,
      dormitories,
      konsulatAgg
    ] = await Promise.all([
      db.collection("students").countDocuments(),
      db.collection("students").countDocuments({ status: "MUKIM" }),
      db.collection("students").countDocuments({ status: "NON-MUKIM" }),
      db.collection("teachers").countDocuments(),
      db.collection("students").countDocuments({ jenjang: "MI" }),
      db.collection("students").countDocuments({ jenjang: "MTs" }),
      db.collection("students").countDocuments({ jenjang: "TPQ" }),
      db.collection("dormitories").find({}).toArray(),
      db.collection("students").aggregate([
        { $group: { _id: "$konsulat", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 }
      ]).toArray()
    ]);

    const persentaseMukim = totalSantri > 0 ? Math.round((santriMukim / totalSantri) * 100) : 0;

    // Asrama summary calculation
    const asramaSummary = dormitories.map((room) => {
      const cap = Number(room.capacity) || 0;
      const occ = Number(room.occupied) || (Array.isArray(room.residentSantri) ? room.residentSantri.length : 0);
      const persen = cap > 0 ? Math.round((occ / cap) * 100) : 0;
      return {
        blok: `${room.roomNumber} - ${room.roomName} (${room.complex})`,
        terisi: occ,
        kapasitas: cap,
        status: persen >= 100 ? "Penuh" : persen >= 80 ? "Tersedia Terbatas" : "Tersedia Aman",
        persen,
      };
    });

    const demografiWilayah = konsulatAgg.map((item) => {
      const count = Number(item.count) || 0;
      const persen = totalSantri > 0 ? Math.round((count / totalSantri) * 100) : 0;
      return {
        wilayah: String(item._id || "Lainnya"),
        santri: count,
        persen,
      };
    });

    const statsData = {
      instansi: "Darul Khidmah Sidogiri Bekasi",
      tahunAjaran: "1447–1448 H / 2026–2027 M",
      summary: {
        totalSantri,
        santriMukim,
        muridNonMukim: santriNonMukim,
        totalTeachers,
        persentaseMukim,
        growthYoY: "+18.5%",
      },
      distribusiJenjang: [
        {
          id: "mi",
          nama: "Madrasah Ibtidaiyah (MI) Miftahul Ulum",
          status: "Beroperasi Aktif",
          jumlahSantri: miSantri,
          kelas: "6 Kelas (1 - 6 Ibtidaiyah)",
        },
        {
          id: "mts",
          nama: "Madrasah Tsanawiyah (MTs) Miftahul Ulum",
          status: "Persiapan Pembukaan Resmi",
          jumlahSantri: mtsSantri,
          kuotaRencana: 120,
          kelas: "Kelas Persiapan I'dadiyah & MTs",
        },
        {
          id: "tpq",
          nama: "Taman Pendidikan Al-Qur'an (TPQ) Sidogiri",
          status: "Beroperasi Aktif",
          jumlahSantri: tpqSantri,
          kelas: "6 Jilid Metode Tartil Sidogiri",
        },
      ],
      asrama: asramaSummary,
      demografiWilayah,
    };

    return NextResponse.json({
      success: true,
      data: statsData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in stats API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memuat analitik statistik dinamis.",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
