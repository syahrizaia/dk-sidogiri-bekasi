"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface Resident {
  nis: string;
  name: string;
  class: string;
}

export interface DormitoryRoom {
  _id: string;
  roomNumber: string;
  roomName: string;
  complex: "Asrama Sayyid Sulaiman" | "Asrama Kiai Aminullah";
  floor: number;
  capacity: number;
  occupied: number;
  facilities: string[];
  cleanlinessStatus: "Sangat Bersih" | "Terawat" | "Perlu Perhatian";
  securityStatus: "Aman Terkunci" | "Standar";
  residentSantri: Resident[];
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_ROOM_SEEDS = [
  {
    roomNumber: "SS-101",
    roomName: "Kamar Al-Fatih",
    complex: "Asrama Sayyid Sulaiman",
    floor: 1,
    capacity: 10,
    occupied: 8,
    facilities: ["AC", "Kamar Mandi Dalam", "Lemari Kayu Jati", "Kasur Busa Tebal"],
    cleanlinessStatus: "Sangat Bersih",
    securityStatus: "Aman Terkunci",
    residentSantri: [
      { nis: "2026-MI-001", name: "Muhammad Fatih Al-Ghazali", class: "MI Kelas 4" },
      { nis: "2026-MI-002", name: "Ahmad Zaki Mubarak", class: "MI Kelas 5" },
      { nis: "2026-MI-003", name: "Hilman Maulana", class: "MI Kelas 6" },
      { nis: "2026-MI-004", name: "Faizurrohman", class: "MI Kelas 4" },
      { nis: "2026-MI-005", name: "Naufal Ramadhan", class: "MI Kelas 5" },
      { nis: "2026-MI-006", name: "Rifqi Al-Hafidz", class: "MI Kelas 6" },
      { nis: "2026-MI-007", name: "Farhan Syakir", class: "MI Kelas 4" },
      { nis: "2026-MI-008", name: "Izzudin Al-Qassam", class: "MI Kelas 5" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    roomNumber: "SS-102",
    roomName: "Kamar Ibnu Rusyd",
    complex: "Asrama Sayyid Sulaiman",
    floor: 1,
    capacity: 8,
    occupied: 8,
    facilities: ["Kipas Angin Dinding", "Lemari Individu", "Kamar Mandi Dalam", "Ventilasi Asri"],
    cleanlinessStatus: "Sangat Bersih",
    securityStatus: "Aman Terkunci",
    residentSantri: [
      { nis: "2026-MI-009", name: "Habibie An-Nawawi", class: "MI Kelas 4" },
      { nis: "2026-MI-010", name: "Dhafir Ilham", class: "MI Kelas 5" },
      { nis: "2026-MI-011", name: "Arkan Basith", class: "MI Kelas 6" },
      { nis: "2026-MI-012", name: "Rizky Firmansyah", class: "MI Kelas 4" },
      { nis: "2026-MI-013", name: "Kholilurrahman", class: "MI Kelas 5" },
      { nis: "2026-MI-014", name: "Baqir Syihab", class: "MI Kelas 6" },
      { nis: "2026-MI-015", name: "Miftah Fauzi", class: "MI Kelas 4" },
      { nis: "2026-MI-016", name: "Zuhdi Karim", class: "MI Kelas 5" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    roomNumber: "KA-201",
    roomName: "Kamar Al-Biruni",
    complex: "Asrama Kiai Aminullah",
    floor: 2,
    capacity: 10,
    occupied: 7,
    facilities: ["AC", "Lemari Bersekat", "Kamar Mandi Luar Bersih", "Jendela Menghadap Taman"],
    cleanlinessStatus: "Terawat",
    securityStatus: "Aman Terkunci",
    residentSantri: [
      { nis: "2026-TPQ-001", name: "Bilal Al-Habasyi", class: "TPQ Tartil 6" },
      { nis: "2026-TPQ-002", name: "Ilyas Kurniawan", class: "TPQ Tartil 5" },
      { nis: "2026-TPQ-003", name: "Thoriq Ziyad", class: "TPQ Tartil 6" },
      { nis: "2026-TPQ-004", name: "Hafizh Rabbani", class: "TPQ Tartil 4" },
      { nis: "2026-TPQ-005", name: "Danial Asy-Syathir", class: "TPQ Tartil 5" },
      { nis: "2026-TPQ-006", name: "Ammar Yasir", class: "TPQ Tartil 6" },
      { nis: "2026-TPQ-007", name: "Firas Munawar", class: "TPQ Tartil 4" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    roomNumber: "KA-202",
    roomName: "Kamar Al-Farabi",
    complex: "Asrama Kiai Aminullah",
    floor: 2,
    capacity: 12,
    occupied: 5,
    facilities: ["Kipas Angin Gantung", "Rak Kitab Santri", "Kamar Mandi Bersih"],
    cleanlinessStatus: "Sangat Bersih",
    securityStatus: "Standar",
    residentSantri: [
      { nis: "2026-MTS-001", name: "Usamah Bin Zaid", class: "Persiapan MTs 1" },
      { nis: "2026-MTS-002", name: "Hasan Al-Bashri", class: "Persiapan MTs 1" },
      { nis: "2026-MTS-003", name: "Thalhah Ubaidillah", class: "Persiapan MTs 1" },
      { nis: "2026-MTS-004", name: "Zubair Al-Awwam", class: "Persiapan MTs 1" },
      { nis: "2026-MTS-005", name: "Sa'ad Abi Waqqash", class: "Persiapan MTs 1" },
    ],
    createdAt: new Date().toISOString(),
  },
];

export async function getDormitoriesAction(): Promise<{ success: boolean; data?: DormitoryRoom[]; error?: string }> {
  try {
    const db = await getDatabase();
    const dormCollection = db.collection("dormitories");

    const totalRooms = await dormCollection.countDocuments();
    if (totalRooms === 0) {
      await dormCollection.insertMany(DEFAULT_ROOM_SEEDS);
    }

    const rooms = await dormCollection.find({}).sort({ complex: 1, roomNumber: 1 }).toArray();

    const formatted: DormitoryRoom[] = rooms.map((r) => ({
      _id: r._id.toString(),
      roomNumber: r.roomNumber,
      roomName: r.roomName,
      complex: r.complex,
      floor: r.floor,
      capacity: r.capacity,
      occupied: r.occupied || (r.residentSantri ? r.residentSantri.length : 0),
      facilities: r.facilities || [],
      cleanlinessStatus: r.cleanlinessStatus || "Terawat",
      securityStatus: r.securityStatus || "Standar",
      residentSantri: r.residentSantri || [],
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error in getDormitoriesAction:", error);
    return { success: false, error: "Gagal memuat data asrama." };
  }
}

export async function createDormitoryAction(payload: {
  roomNumber: string;
  roomName: string;
  complex: "Asrama Sayyid Sulaiman" | "Asrama Kiai Aminullah";
  floor: number;
  capacity: number;
  facilities: string[];
  cleanlinessStatus?: "Sangat Bersih" | "Terawat" | "Perlu Perhatian";
  securityStatus?: "Aman Terkunci" | "Standar";
}) {
  try {
    const { roomNumber, roomName, complex, floor, capacity, facilities, cleanlinessStatus, securityStatus } = payload;
    if (!roomNumber || !roomName || !complex || !capacity) {
      return { success: false, error: "Nomor kamar, nama kamar, kompleks, dan kapasitas wajib diisi." };
    }

    const db = await getDatabase();
    const dormCollection = db.collection("dormitories");

    const newRoom = {
      roomNumber: String(roomNumber).trim().toUpperCase(),
      roomName: String(roomName).trim(),
      complex: complex === "Asrama Kiai Aminullah" ? "Asrama Kiai Aminullah" : "Asrama Sayyid Sulaiman",
      floor: Number(floor) || 1,
      capacity: Number(capacity) || 10,
      occupied: 0,
      facilities: Array.isArray(facilities) && facilities.length > 0 ? facilities : ["Kipas Angin Dinding", "Lemari Individu"],
      cleanlinessStatus: cleanlinessStatus || "Sangat Bersih",
      securityStatus: securityStatus || "Aman Terkunci",
      residentSantri: [],
      createdAt: new Date().toISOString(),
    };

    const result = await dormCollection.insertOne(newRoom);
    return {
      success: true,
      message: "Kamar asrama berhasil ditambahkan.",
      data: { ...newRoom, _id: result.insertedId.toString() },
    };
  } catch (error) {
    console.error("Error in createDormitoryAction:", error);
    return { success: false, error: "Gagal menambahkan kamar asrama." };
  }
}

export async function allocateResidentAction(payload: {
  roomId: string;
  studentNis: string;
  studentName: string;
  studentClass: string;
}) {
  try {
    const { roomId, studentNis, studentName, studentClass } = payload;
    if (!roomId || !studentNis || !studentName) {
      return { success: false, error: "ID kamar, NIS, dan nama santri wajib diisi." };
    }

    const db = await getDatabase();
    const dormCollection = db.collection("dormitories");

    let query: Record<string, unknown> = { _id: roomId };
    if (ObjectId.isValid(roomId)) {
      query = { _id: new ObjectId(roomId) };
    }

    const room = await dormCollection.findOne(query);
    if (!room) {
      return { success: false, error: "Kamar tidak ditemukan." };
    }

    if (room.occupied >= room.capacity) {
      return { success: false, error: "Kapasitas kamar ini sudah penuh." };
    }

    const existing = room.residentSantri?.find((r: Resident) => r.nis === studentNis);
    if (existing) {
      return { success: false, error: "Santri ini sudah terdaftar di kamar ini." };
    }

    const newResident: Resident = {
      nis: studentNis,
      name: studentName,
      class: studentClass || "MI",
    };

    await dormCollection.updateOne(
      query,
      {
        $push: { residentSantri: newResident },
        $inc: { occupied: 1 },
        $set: { updatedAt: new Date().toISOString() },
      } as unknown as Parameters<typeof dormCollection.updateOne>[1]
    );

    return { success: true, message: "Santri berhasil dialokasikan ke kamar." };
  } catch (error) {
    console.error("Error in allocateResidentAction:", error);
    return { success: false, error: "Gagal mengalokasikan santri." };
  }
}
