"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { getSessionFromCookies } from "@/lib/auth";
import { verifyUserPermission } from "@/lib/actions/roles";
import { ObjectId } from "mongodb";
import { serializeData } from "@/lib/utils";

export interface MediaItem {
  id?: string;
  _id: string;
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
  updatedAt?: string;
}

const DEFAULT_MEDIA_SEEDS = [
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
    url: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80",
    duration: "04:25",
    description: "Liputan dokumenter keseharian santri Darul Khidmah Sidogiri Bekasi: dari tahajud, salat berjamaah, sorogan, hingga sekolah formal Madrasah Miftahul Ulum.",
    date: "01 Oktober 2026",
    author: "Multimedia Dakwah",
    published: true,
    createdAt: new Date("2026-10-01T06:00:00Z").toISOString(),
  },
  {
    title: "Gedung Asrama Sayyid Sulaiman & Ruang Kelas Modern",
    category: "Fasilitas",
    type: "image",
    url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    description: "Sarana asrama representatif dan ruang belajar interaktif yang nyaman untuk santri mukim di Darul Khidmah Sidogiri Bekasi.",
    date: "25 September 2026",
    author: "Sarpras & Aset",
    published: true,
    createdAt: new Date("2026-09-25T10:00:00Z").toISOString(),
  },
  {
    title: "Ziarah Akbar & Silaturahmi Masyaikh Sidogiri Pasuruan",
    category: "Kegiatan Santri",
    type: "image",
    url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    description: "Rihlah ilmiah dan tabarrukan santri asrama Darul Khidmah Sidogiri Bekasi ke Pondok Pesantren Sidogiri Pasuruan Jawa Timur.",
    date: "18 September 2026",
    author: "Pengurus Harian",
    published: true,
    createdAt: new Date("2026-09-18T07:00:00Z").toISOString(),
  },
];

export async function getMediaAction(all = false): Promise<{ success: boolean; data?: MediaItem[]; error?: string }> {
  try {
    const db = await getDatabase();
    const mediaCollection = db.collection("media");

    const totalMedia = await mediaCollection.countDocuments();
    if (totalMedia === 0) {
      await mediaCollection.insertMany(DEFAULT_MEDIA_SEEDS);
    }

    const query: Record<string, unknown> = {};
    if (!all) {
      query.published = true;
    }

    const items = await mediaCollection.find(query).sort({ createdAt: -1 }).toArray();

    const formatted: MediaItem[] = items.map((m) => ({
      _id: m._id.toString(),
      title: m.title,
      category: m.category,
      type: m.type,
      url: m.url,
      thumbnail: m.thumbnail || m.url,
      duration: m.duration,
      description: m.description,
      date: m.date,
      author: m.author,
      published: m.published !== false,
      createdAt: m.createdAt,
    }));

    return { success: true, data: serializeData(formatted) };
  } catch (error) {
    console.error("Error in getMediaAction:", error);
    return { success: false, error: "Gagal memuat arsip media." };
  }
}

export async function createMediaAction(payload: {
  title: string;
  category: "Kegiatan Santri" | "Kajian Kitab Kuning" | "Prestasi" | "Fasilitas" | "Video Liputan";
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  duration?: string;
  description?: string;
  date?: string;
  author?: string;
  published?: boolean;
}) {
  try {
    const authCheck = await verifyUserPermission("media", "create");
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.error || "Akses ditolak: Anda tidak memiliki wewenang untuk menambahkan dokumentasi media." };
    }

    const { title, category, type, url, thumbnail, duration, description, date, author, published } = payload;
    if (!title || !category || !url) {
      return { success: false, error: "Judul, kategori, dan tautan media wajib diisi." };
    }

    const db = await getDatabase();
    const mediaCollection = db.collection("media");

    const newMedia = {
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
    return {
      success: true,
      message: "Dokumentasi media berhasil ditambahkan.",
      data: serializeData({ ...newMedia, _id: result.insertedId.toString() }),
    };
  } catch (error) {
    console.error("Error in createMediaAction:", error);
    return { success: false, error: "Gagal menyimpan dokumentasi media." };
  }
}

export async function deleteMediaAction(id: string) {
  try {
    const authCheck = await verifyUserPermission("media", "delete");
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.error || "Akses ditolak: Anda tidak memiliki wewenang untuk menghapus dokumentasi media." };
    }

    if (!id) {
      return { success: false, error: "ID media tidak disertakan." };
    }

    const db = await getDatabase();
    const mediaCollection = db.collection("media");

    let query: Record<string, unknown> = { id };
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    }

    const result = await mediaCollection.deleteOne(query);
    if (result.deletedCount === 0) {
      return { success: false, error: "Media tidak ditemukan." };
    }

    return { success: true, message: "Dokumentasi media berhasil dihapus." };
  } catch (error) {
    console.error("Error in deleteMediaAction:", error);
    return { success: false, error: "Gagal menghapus dokumentasi media." };
  }
}

export async function updateMediaAction(
  id: string,
  payload: {
    title?: string;
    category?: "Kegiatan Santri" | "Kajian Kitab Kuning" | "Prestasi" | "Fasilitas" | "Video Liputan";
    type?: "image" | "video";
    url?: string;
    thumbnail?: string;
    duration?: string;
    description?: string;
    date?: string;
    author?: string;
    published?: boolean;
  }
) {
  try {
    const authCheck = await verifyUserPermission("media", "update");
    if (!authCheck.allowed) {
      return { success: false, error: authCheck.error || "Akses ditolak: Anda tidak memiliki wewenang untuk memperbarui dokumentasi media." };
    }

    if (!id) {
      return { success: false, error: "ID media tidak disertakan." };
    }

    const db = await getDatabase();
    const mediaCollection = db.collection("media");

    let query: Record<string, unknown> = { id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { id }] };
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (payload.title) updateFields.title = String(payload.title).trim();
    if (payload.category) updateFields.category = payload.category;
    if (payload.type) updateFields.type = payload.type;
    if (payload.url) updateFields.url = String(payload.url).trim();
    if (payload.thumbnail !== undefined) updateFields.thumbnail = String(payload.thumbnail).trim();
    if (payload.duration !== undefined) updateFields.duration = String(payload.duration).trim();
    if (payload.description) updateFields.description = String(payload.description).trim();
    if (payload.date) updateFields.date = String(payload.date).trim();
    if (payload.author) updateFields.author = String(payload.author).trim();
    if (payload.published !== undefined) updateFields.published = payload.published;

    const result = await mediaCollection.updateOne(query, { $set: updateFields });
    if (result.matchedCount === 0) {
      return { success: false, error: "Media tidak ditemukan." };
    }

    return { success: true, message: "Dokumentasi media berhasil diperbarui." };
  } catch (error) {
    console.error("Error in updateMediaAction:", error);
    return { success: false, error: "Gagal memperbarui dokumentasi media." };
  }
}
