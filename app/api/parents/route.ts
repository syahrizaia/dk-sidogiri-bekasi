import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export interface ParentRecord {
  id?: string;
  name: string;
  phone: string;
  studentName: string;
  studentNis: string;
  studentInstitution: "MI" | "MTs" | "TPQ";
  relation: "Ayah" | "Ibu" | "Wali";
  address: string;
  status: "AKTIF" | "ALUMNI";
  createdAt?: Date;
}

const DEFAULT_PARENTS: Omit<ParentRecord, "id">[] = [
  {
    name: "H. Muhammad Ridwan",
    phone: "0812-9876-5401",
    studentName: "Ahmad Farhan",
    studentNis: "202601001",
    studentInstitution: "MI",
    relation: "Ayah",
    address: "Bekasi Timur, Kota Bekasi",
    status: "AKTIF",
    createdAt: new Date(),
  },
  {
    name: "Hj. Siti Aminah",
    phone: "0813-8765-4302",
    studentName: "Zainal Abidin",
    studentNis: "202601002",
    studentInstitution: "MI",
    relation: "Ibu",
    address: "Pondok Gede, Kota Bekasi",
    status: "AKTIF",
    createdAt: new Date(),
  },
  {
    name: "Bpk. Agus Salim",
    phone: "0812-7654-3203",
    studentName: "Bilal Habasyi",
    studentNis: "202602001",
    studentInstitution: "MTs",
    relation: "Ayah",
    address: "Tambun Selatan, Kab. Bekasi",
    status: "AKTIF",
    createdAt: new Date(),
  },
  {
    name: "Ibu Nurul Hidayah",
    phone: "0815-6543-2104",
    studentName: "Fathur Rahman",
    studentNis: "202602002",
    studentInstitution: "MTs",
    relation: "Ibu",
    address: "Cikarang Barat, Kab. Bekasi",
    status: "AKTIF",
    createdAt: new Date(),
  },
  {
    name: "Bpk. Hendra Gunawan",
    phone: "0818-5432-1005",
    studentName: "Hasan Bisri",
    studentNis: "202603001",
    studentInstitution: "TPQ",
    relation: "Ayah",
    address: "Rawalumbu, Kota Bekasi",
    status: "AKTIF",
    createdAt: new Date(),
  },
  {
    name: "Ibu Fatimah Az-Zahra",
    phone: "0812-4321-0906",
    studentName: "Ali Murtadha",
    studentNis: "202603002",
    studentInstitution: "TPQ",
    relation: "Ibu",
    address: "Mustika Jaya, Kota Bekasi",
    status: "AKTIF",
    createdAt: new Date(),
  },
];

export async function GET() {
  try {
    const db = await getDatabase();
    const collection = db.collection("parents");

    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(DEFAULT_PARENTS);
    }

    const parents = await collection
      .find({})
      .sort({ studentInstitution: 1, name: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      parents: parents.map((doc) => ({
        id: doc._id.toString(),
        name: doc.name,
        phone: doc.phone,
        studentName: doc.studentName,
        studentNis: doc.studentNis,
        studentInstitution: doc.studentInstitution,
        relation: doc.relation || "Wali",
        address: doc.address || "-",
        status: doc.status || "AKTIF",
        createdAt: doc.createdAt,
      })),
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    console.error("Error fetching parents:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data wali santri.",
        error: errorMsg,
        parents: DEFAULT_PARENTS.map((p, idx) => ({ id: `local-${idx}`, ...p })),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, studentName, studentNis, studentInstitution, relation, address, status } = body;

    if (!name || !phone || !studentName || !studentInstitution) {
      return NextResponse.json(
        { success: false, message: "Nama Wali, No. Telepon, Nama Santri, dan Lembaga wajib diisi." },
        { status: 400 }
      );
    }

    const validInstitutions = ["MI", "MTs", "TPQ"];
    if (!validInstitutions.includes(studentInstitution)) {
      return NextResponse.json(
        { success: false, message: "Lembaga tidak valid. Pilih MI, MTs, atau TPQ." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection("parents");

    const newParent = {
      name: name.trim(),
      phone: phone.trim(),
      studentName: studentName.trim(),
      studentNis: studentNis?.trim() || "-",
      studentInstitution,
      relation: relation || "Wali",
      address: address?.trim() || "-",
      status: status === "ALUMNI" ? "ALUMNI" : "AKTIF",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(newParent);

    return NextResponse.json({
      success: true,
      message: "Data wali santri berhasil disimpan ke MongoDB Atlas.",
      parent: {
        id: result.insertedId.toString(),
        ...newParent,
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal error";
    console.error("Error creating parent:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan data wali santri.", error: errorMsg },
      { status: 500 }
    );
  }
}
