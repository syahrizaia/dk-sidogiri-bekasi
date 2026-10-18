import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export interface TeacherRecord {
  id?: string;
  nip: string;
  name: string;
  role: string;
  institution: "MI" | "MTs" | "TPQ";
  specialization: string;
  phone: string;
  status: "AKTIF" | "CUTI";
  joinedYear: number;
  createdAt?: Date;
}

const DEFAULT_TEACHERS: Omit<TeacherRecord, "id">[] = [
  {
    nip: "DKS-AS-01",
    name: "Ust. M. Sholeh Al-Bantani, S.Pd.I",
    role: "Kepala Madrasah Ibtidaiyah",
    institution: "MI",
    specialization: "Fiqih Fathul Qorib & Ushul Fiqh",
    phone: "0812-3456-7801",
    status: "AKTIF",
    joinedYear: 2020,
    createdAt: new Date(),
  },
  {
    nip: "DKS-AS-02",
    name: "Ust. Abdullah Faqih, M.Ag",
    role: "Koordinator Persiapan MTs",
    institution: "MTs",
    specialization: "Nahwu Shorof & Alfiyah Ibnu Malik",
    phone: "0812-3456-7802",
    status: "AKTIF",
    joinedYear: 2022,
    createdAt: new Date(),
  },
  {
    nip: "DKS-AS-03",
    name: "Ust. Ahmad Zaini Al-Hafizh",
    role: "Koordinator TPQ & Tahfizh",
    institution: "TPQ",
    specialization: "Metode Tartil Sidogiri & Tajwid Praktis",
    phone: "0812-3456-7803",
    status: "AKTIF",
    joinedYear: 2021,
    createdAt: new Date(),
  },
  {
    nip: "DKS-AS-04",
    name: "Ust. H. Ridwan Mansyur, Lc",
    role: "Guru Senior Kitab Kuning",
    institution: "MI",
    specialization: "Hadits Nabawi & Riyadhis Shalihin",
    phone: "0812-3456-7804",
    status: "AKTIF",
    joinedYear: 2021,
    createdAt: new Date(),
  },
  {
    nip: "DKS-AS-05",
    name: "Ustazah Siti Maryam, S.Pd",
    role: "Guru Kelas & Tematik Terpadu",
    institution: "MI",
    specialization: "Bahasa Arab & Pendidikan Karakter",
    phone: "0812-3456-7805",
    status: "AKTIF",
    joinedYear: 2023,
    createdAt: new Date(),
  },
  {
    nip: "DKS-AS-06",
    name: "Ust. M. Nurul Huda",
    role: "Pembina Asrama & Qira'ah",
    institution: "TPQ",
    specialization: "Makhorijul Huruf & Adab Salaf",
    phone: "0812-3456-7806",
    status: "AKTIF",
    joinedYear: 2024,
    createdAt: new Date(),
  },
];

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection("teachers");

    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(DEFAULT_TEACHERS);
    }

    const teachers = await collection
      .find({})
      .sort({ institution: 1, nip: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      teachers: teachers.map((doc) => ({
        id: doc._id.toString(),
        nip: doc.nip,
        name: doc.name,
        role: doc.role,
        institution: doc.institution,
        specialization: doc.specialization,
        phone: doc.phone,
        status: doc.status || "AKTIF",
        joinedYear: doc.joinedYear || new Date().getFullYear(),
        createdAt: doc.createdAt,
      })),
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data asatidz.",
        error: errorMsg,
        teachers: DEFAULT_TEACHERS.map((t, idx) => ({ id: `local-${idx}`, ...t })),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, institution, specialization, phone, status, joinedYear } = body;

    if (!name || !institution || !specialization) {
      return NextResponse.json(
        { success: false, message: "Nama, Lembaga, dan Bidang Spesialisasi wajib diisi." },
        { status: 400 }
      );
    }

    const validInstitutions = ["MI", "MTs", "TPQ"];
    if (!validInstitutions.includes(institution)) {
      return NextResponse.json(
        { success: false, message: "Lembaga tidak valid. Pilih MI, MTs, atau TPQ." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection("teachers");

    // Generate NIP baru jika tidak diisi
    const totalTeachers = await collection.countDocuments();
    const nip = body.nip || `DKS-AS-${String(totalTeachers + 1).padStart(2, "0")}`;

    const newTeacher = {
      nip,
      name: name.trim(),
      role: role?.trim() || "Tenaga Pengajar",
      institution,
      specialization: specialization.trim(),
      phone: phone?.trim() || "-",
      status: status === "CUTI" ? "CUTI" : "AKTIF",
      joinedYear: Number(joinedYear) || new Date().getFullYear(),
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newTeacher);

    return NextResponse.json({
      success: true,
      message: "Data asatidz berhasil ditambahkan ke MongoDB Atlas.",
      teacher: {
        id: result.insertedId.toString(),
        ...newTeacher,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    console.error("Error creating teacher:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data asatidz.", error: errorMsg },
      { status: 500 }
    );
  }
}
