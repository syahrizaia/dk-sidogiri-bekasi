import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    const query: Record<string, unknown> = {};
    if (role && role !== "all") {
      query.role = role;
    }

    const users = await usersCollection
      .find(query, {
        projection: { passwordHash: 0 },
      })
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = users.map((u) => ({
      ...u,
      _id: u._id.toString(),
      status: u.status || "active",
      createdAt: u.createdAt || new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data pengguna." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, status, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Nama, email, dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // Check duplicate
    const existing = await usersCollection.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar dalam sistem." },
        { status: 400 }
      );
    }

    const newUser = {
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      role: role || "staf",
      status: status || "active",
      phone: phone ? String(phone).trim() : "",
      createdAt: new Date().toISOString(),
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json(
      {
        success: true,
        message: "Pengguna baru berhasil ditambahkan.",
        data: {
          _id: result.insertedId.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          phone: newUser.phone,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat pengguna baru." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, role, name, phone } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID pengguna tidak disertakan." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    let query: Record<string, unknown> = { _id: id };
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (status !== undefined) updateFields.status = status;
    if (role !== undefined) updateFields.role = role;
    if (name !== undefined) updateFields.name = String(name).trim();
    if (phone !== undefined) updateFields.phone = String(phone).trim();

    const result = await usersCollection.updateOne(query, { $set: updateFields });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data pengguna berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui pengguna." },
      { status: 500 }
    );
  }
}
