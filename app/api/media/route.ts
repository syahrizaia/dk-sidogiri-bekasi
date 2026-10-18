import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface MediaItem {
  _id?: string | ObjectId;
  title: string;
  category: "Kegiatan Santri" | "Kajian Kitab Kuning" | "Prestasi" | "Fasilitas" | "Video Liputan";
  type: "image" | "video";
  url: string;
  thumbnail: string;
  duration?: string;
  description: string;
  date: string;
  author: string;
  published: boolean;
  createdAt?: string;
}

const DEFAULT_MEDIA_SEEDS: Omit<MediaItem, "_id">[] = [
  {
    title: "Kajian Rutin Fathul Qarib & Sullamut Taufiq Ba'da Maghrib",
    category: "Kajian Kitab Kuning",
    type: "image",
    url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    description: "Halaqah sorogan dan bandongan kitab Fathul Qarib al-Mujib bersama Masyaikh Sidogiri di Musholla Asrama Sayyid Sulaiman.",
    date: "15 Oktober 2026",
    author: "Biro Ta'lim & Dakwah",
    published: true,
    createdAt: new Date("2026-10-15T18:30:00Z").toISOString(),
  },
  {
    title: "Halaqah Tahfidz & Pengujian Metode Tartil Sidogiri Santri MI",
    category: "Kegiatan Santri",
    type: "image",
    url: "https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&w=800&q=80",
    description: "Simakan dan munaqasyah tajwid metode Tartil Sidogiri secara berkala untuk menjaga fashahah bacaan para santri Madrasah Miftahul Ulum.",
    date: "12 Oktober 2026",
    author: "Lembaga Metode Tartil",
    published: true,
    createdAt: new Date("2026-10-12T08:00:00Z").toISOString(),
  },
  {
    title: "Juara 1 Musabaqah Qira'atil Kutub (MQK) Tingkat Kabupaten Bekasi",
    category: "Prestasi",
    type: "image",
    url: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80",
    description: "Santri Darul Khidmah Sidogiri Bekasi meraih Juara 1 lomba baca kitab kuning bidang Nahwu-Sharaf antar pesantren se-Bekasi.",
    date: "08 Oktober 2026",
    author: "Humas Pesantren",
    published: true,
    createdAt: new Date("2026-10-08T14:00:00Z").toISOString(),
  },
  {
    title: "Video Profil & Suasana Santri Darul Khidmah Sidogiri Bekasi",
    category: "Video Liputan",
    type: "video",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?auto=format&fit=crop&w=800&q=80",
    duration: "08:45",
    description: "Dokumentasi komprehensif keseharian santri, kedisiplinan asrama, serta persiapan sarana MTs Miftahul Ulum tahun ajaran mendatang.",
    date: "04 Oktober 2026",
    author: "Multimedia Tim Kreatif",
    published: true,
    createdAt: new Date("2026-10-04T10:00:00Z").toISOString(),
  },
  {
    title: "Gedung Asrama Sayyid Sulaiman & Ruang Kelas Madrasah Miftahul Ulum",
    category: "Fasilitas",
    type: "image",
    url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    description: "Ruang kelas ber-AC dan asrama santri yang bersih, tertata rapi, dan menunjang ketenangan belajar khidmah salafiyah.",
    date: "28 September 2026",
    author: "Biro Sarpras",
    published: true,
    createdAt: new Date("2026-09-28T09:00:00Z").toISOString(),
  },
  {
    title: "Khataman & Ijazahan Doa Kitab Riyadhus Shalihin",
    category: "Kajian Kitab Kuning",
    type: "image",
    url: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80",
    description: "Pemberian sanad dan doa khataman kitab hadits Riyadhus Shalihin bersama para dewan asatidz alumni Sidogiri Pasuruan.",
    date: "20 September 2026",
    author: "Majlis Tarbiyah",
    published: true,
    createdAt: new Date("2026-09-20T20:00:00Z").toISOString(),
  },
  {
    title: "Muhadharah Kubro & Latihan Khithabah Tiga Bahasa Santri",
    category: "Kegiatan Santri",
    type: "image",
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
    description: "Pengasahan retorika dakwah dan kemampuan khutbah santri dalam Bahasa Arab, Bahasa Inggris, dan Bahasa Indonesia setiap malam Jumat.",
    date: "15 September 2026",
    author: "Pengembangan Bahasa",
    published: true,
    createdAt: new Date("2026-09-15T19:30:00Z").toISOString(),
  },
  {
    title: "Dokumenter Kilas Balik Peringatan Milad Pondok Sidogiri",
    category: "Video Liputan",
    type: "video",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
    duration: "14:20",
    description: "Liputan istighosah akbar, temu alumni IASS Bekasi, serta refleksi keilmuan dan perjuangan dakwah Sidogiri.",
    date: "01 September 2026",
    author: "Multimedia Tim Kreatif",
    published: true,
    createdAt: new Date("2026-09-01T11:00:00Z").toISOString(),
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const includeUnpublished = searchParams.get("all") === "true";

    const db = await getDatabase();
    const mediaCollection = db.collection("media");

    // Auto-seed if empty
    const count = await mediaCollection.countDocuments();
    if (count === 0) {
      await mediaCollection.insertMany(DEFAULT_MEDIA_SEEDS);
    }

    const query: Record<string, unknown> = {};
    if (!includeUnpublished) {
      query.published = true;
    }
    if (category && category !== "Semua") {
      query.category = category;
    }

    const items = await mediaCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = items.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat galeri media." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, type, url, thumbnail, duration, description, date, author, published } = body;

    if (!title || !category || !type || !url) {
      return NextResponse.json(
        { success: false, error: "Judul, kategori, tipe media, dan URL wajib diisi." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const mediaCollection = db.collection("media");

    const newMedia: Omit<MediaItem, "_id"> = {
      title: String(title).trim(),
      category,
      type: type === "video" ? "video" : "image",
      url: String(url).trim(),
      thumbnail: thumbnail ? String(thumbnail).trim() : String(url).trim(),
      duration: duration ? String(duration).trim() : undefined,
      description: String(description || "").trim(),
      date: date || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      author: author ? String(author).trim() : "Redaksi Media",
      published: published !== false,
      createdAt: new Date().toISOString(),
    };

    const result = await mediaCollection.insertOne(newMedia);

    return NextResponse.json(
      {
        success: true,
        message: "Dokumentasi media berhasil ditambahkan.",
        data: { ...newMedia, _id: result.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating media:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan dokumentasi media." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID media tidak disertakan." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const mediaCollection = db.collection("media");

    let query: Record<string, unknown> = { id };
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    }

    const result = await mediaCollection.deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Media tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Dokumentasi media berhasil dihapus.",
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus dokumentasi media." },
      { status: 500 }
    );
  }
}
