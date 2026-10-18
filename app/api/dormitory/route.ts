import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface Resident {
  nis: string;
  name: string;
  class: string;
}

export interface DormitoryRoom {
  _id?: string | ObjectId;
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

const DEFAULT_ROOM_SEEDS: Omit<DormitoryRoom, "_id">[] = [
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
      { nis: "2026-MI-009", name: "Dhafin Ar-Rasyid", class: "MI Kelas 4" },
      { nis: "2026-MI-010", name: "Salman Al-Farisi", class: "MI Kelas 4" },
      { nis: "2026-MI-011", name: "Zaidan Al-Khair", class: "MI Kelas 5" },
      { nis: "2026-MI-012", name: "Rayhan Al-Munawwar", class: "MI Kelas 5" },
      { nis: "2026-MI-013", name: "Haidar Ali", class: "MI Kelas 6" },
      { nis: "2026-MI-014", name: "Hamzah Asadullah", class: "MI Kelas 6" },
      { nis: "2026-MI-015", name: "Zubair Al-Awwam", class: "MI Kelas 5" },
      { nis: "2026-MI-016", name: "Bilal Rabah", class: "MI Kelas 4" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    roomNumber: "SS-201",
    roomName: "Kamar Imam An-Nawawi",
    complex: "Asrama Sayyid Sulaiman",
    floor: 2,
    capacity: 12,
    occupied: 9,
    facilities: ["AC", "Balkon Asri", "Lemari Individu", "Kamar Mandi Dalam"],
    cleanlinessStatus: "Terawat",
    securityStatus: "Aman Terkunci",
    residentSantri: [
      { nis: "2026-MI-017", name: "Umar Faruq", class: "MI Kelas 6" },
      { nis: "2026-MI-018", name: "Abu Ubaidah", class: "MI Kelas 6" },
      { nis: "2026-MI-019", name: "Khalid Walid", class: "MI Kelas 5" },
      { nis: "2026-MI-020", name: "Thalhah Ubaidillah", class: "MI Kelas 5" },
      { nis: "2026-MI-021", name: "Sa'ad Abi Waqqas", class: "MI Kelas 4" },
      { nis: "2026-MI-022", name: "Said Zaid", class: "MI Kelas 4" },
      { nis: "2026-MI-023", name: "Abdurrahman Auf", class: "MI Kelas 5" },
      { nis: "2026-MI-024", name: "Mus'ab Umair", class: "MI Kelas 6" },
      { nis: "2026-MI-025", name: "Ja'far Abi Thalib", class: "MI Kelas 4" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    roomNumber: "KA-101",
    roomName: "Kamar Hujjatul Islam",
    complex: "Asrama Kiai Aminullah",
    floor: 1,
    capacity: 10,
    occupied: 6,
    facilities: ["Kipas Angin Dinding", "Lemari Kayu", "Meja Belajar Kitab", "Kamar Mandi Luar Bersih"],
    cleanlinessStatus: "Sangat Bersih",
    securityStatus: "Aman Terkunci",
    residentSantri: [
      { nis: "2026-MI-026", name: "Usamah Zaid", class: "MI Kelas 4" },
      { nis: "2026-MI-027", name: "Abdullah Mas'ud", class: "MI Kelas 5" },
      { nis: "2026-MI-028", name: "Abdullah Umar", class: "MI Kelas 6" },
      { nis: "2026-MI-029", name: "Abdullah Abbas", class: "MI Kelas 5" },
      { nis: "2026-MI-030", name: "Anas Malik", class: "MI Kelas 4" },
      { nis: "2026-MI-031", name: "Jabir Abdullah", class: "MI Kelas 6" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    roomNumber: "KA-201",
    roomName: "Kamar Syaikhona Kholil",
    complex: "Asrama Kiai Aminullah",
    floor: 2,
    capacity: 10,
    occupied: 7,
    facilities: ["AC", "Lemari Individu", "Kamar Mandi Dalam", "Rak Kitab Kuning"],
    cleanlinessStatus: "Sangat Bersih",
    securityStatus: "Aman Terkunci",
    residentSantri: [
      { nis: "2026-MI-032", name: "Mu'adz Jabal", class: "MI Kelas 5" },
      { nis: "2026-MI-033", name: "Abu Dzar Al-Ghifari", class: "MI Kelas 6" },
      { nis: "2026-MI-034", name: "Hudzaifah Yaman", class: "MI Kelas 4" },
      { nis: "2026-MI-035", name: "Ammar Yasir", class: "MI Kelas 5" },
      { nis: "2026-MI-036", name: "Miqdad Aswad", class: "MI Kelas 6" },
      { nis: "2026-MI-037", name: "Ubay Ka'ab", class: "MI Kelas 4" },
      { nis: "2026-MI-038", name: "Zaid Tsabit", class: "MI Kelas 5" },
    ],
    createdAt: new Date().toISOString(),
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const complex = searchParams.get("complex");

    const db = await getDatabase();
    const dormCollection = db.collection("dormitories");

    // Auto-seed if empty
    const count = await dormCollection.countDocuments();
    if (count === 0) {
      await dormCollection.insertMany(DEFAULT_ROOM_SEEDS);
    }

    const query: Record<string, unknown> = {};
    if (complex && complex !== "Semua") {
      query.complex = complex;
    }

    const rooms = await dormCollection.find(query).sort({ roomNumber: 1 }).toArray();

    const formatted = rooms.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching dormitories:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data asrama santri." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    const db = await getDatabase();
    const dormCollection = db.collection("dormitories");

    if (action === "allocate") {
      // Allocate student to room
      const { roomId, studentNis, studentName, studentClass } = body;
      if (!roomId || !studentNis || !studentName) {
        return NextResponse.json(
          { success: false, error: "Data santri dan ID kamar wajib disertakan." },
          { status: 400 }
        );
      }

      let query: Record<string, unknown> = { _id: roomId };
      if (ObjectId.isValid(roomId)) {
        query = { _id: new ObjectId(roomId) };
      }

      const room = await dormCollection.findOne(query);
      if (!room) {
        return NextResponse.json(
          { success: false, error: "Kamar tidak ditemukan." },
          { status: 404 }
        );
      }

      if (room.occupied >= room.capacity) {
        return NextResponse.json(
          { success: false, error: "Kapasitas kamar ini sudah penuh." },
          { status: 400 }
        );
      }

      const existingResident = room.residentSantri?.find(
        (r: Resident) => r.nis === studentNis
      );
      if (existingResident) {
        return NextResponse.json(
          { success: false, error: "Santri ini sudah terdaftar di kamar ini." },
          { status: 400 }
        );
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

      return NextResponse.json({
        success: true,
        message: "Santri berhasil dialokasikan ke kamar.",
      });
    }

    // Default action: Create new room
    const {
      roomNumber,
      roomName,
      complex,
      floor,
      capacity,
      facilities,
      cleanlinessStatus,
      securityStatus,
    } = body;

    if (!roomNumber || !roomName || !complex || !capacity) {
      return NextResponse.json(
        { success: false, error: "Nomor kamar, nama kamar, kompleks asrama, dan kapasitas wajib diisi." },
        { status: 400 }
      );
    }

    const newRoom: Omit<DormitoryRoom, "_id"> = {
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

    return NextResponse.json(
      {
        success: true,
        message: "Kamar asrama berhasil ditambahkan.",
        data: { ...newRoom, _id: result.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating/allocating dormitory:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses data asrama." },
      { status: 500 }
    );
  }
}
