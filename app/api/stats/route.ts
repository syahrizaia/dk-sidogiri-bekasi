import { NextResponse } from "next/server";

export async function GET() {
  try {
    const statsData = {
      instansi: "Darul Khidmah Sidogiri Bekasi",
      tahunAjaran: "1447–1448 H / 2026–2027 M",
      summary: {
        totalSantri: 745,
        santriMukim: 490,
        muridNonMukim: 255,
        persentaseMukim: 66,
        growthYoY: "+14.8%",
      },
      distribusiJenjang: [
        {
          id: "mi",
          nama: "Madrasah Ibtidaiyah (MI) Miftahul Ulum",
          status: "Beroperasi Aktif",
          jumlahSantri: 490,
          kelas: "6 Kelas + Kelas Shifir",
        },
        {
          id: "mts",
          nama: "Madrasah Tsanawiyah (MTs) Miftahul Ulum",
          status: "Persiapan Buka Tahun Ajaran Depan",
          jumlahSantri: 0,
          kuotaRencana: 120,
          kelas: "Kelas 1 - 3 MTs",
        },
        {
          id: "tpq",
          nama: "Taman Pendidikan Al-Qur'an (TPQ) Sidogiri",
          status: "Beroperasi Aktif",
          jumlahSantri: 255,
          kelas: "8 Jilid Metode Tartil Sidogiri",
        },
      ],
      asrama: [
        {
          blok: "Blok A (Asrama Santri MI Miftahul Ulum)",
          terisi: 280,
          kapasitas: 300,
          status: "Tersedia Terbatas",
          persen: 93,
        },
        {
          blok: "Blok B (Persiapan Santri MTs)",
          terisi: 0,
          kapasitas: 120,
          status: "Siap Huni (Inden)",
          persen: 0,
        },
        {
          blok: "Blok C (Asrama Tahfidz & TPQ Sidogiri)",
          terisi: 130,
          kapasitas: 150,
          status: "Tersedia Aman",
          persen: 87,
        },
      ],
      demografiWilayah: [
        { wilayah: "Bekasi (Kota & Kabupaten)", santri: 295, persen: 40 },
        { wilayah: "DKI Jakarta & Sekitar", santri: 180, persen: 24 },
        { wilayah: "Bogor, Depok & Tangerang", santri: 120, persen: 16 },
        { wilayah: "Karawang & Purwakarta", santri: 85, persen: 11 },
        { wilayah: "Utusan Luar Daerah & Alumni", santri: 65, persen: 9 },
      ],
    };

    return NextResponse.json({
      success: true,
      data: statsData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Gagal memuat analitik statistik.",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
