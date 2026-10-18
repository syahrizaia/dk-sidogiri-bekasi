import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { hashPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role = "staff" } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Nama, email, dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Kata sandi minimal harus 6 karakter." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // Cek apakah email sudah terdaftar
    const existing = await usersCollection.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Alamat email ini sudah terdaftar. Silakan masuk." },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const newUserDoc = {
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: String(role).trim() || "staff",
      createdAt: new Date().toISOString(),
    };

    const insertResult = await usersCollection.insertOne(newUserDoc);
    const userSession = {
      id: String(insertResult.insertedId),
      name: newUserDoc.name,
      email: newUserDoc.email,
      role: newUserDoc.role,
    };

    const sessionToken = createSessionToken(userSession);

    const response = NextResponse.json(
      {
        success: true,
        message: "Akun berhasil didaftarkan.",
        user: userSession,
      },
      { status: 201 }
    );

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memproses pendaftaran akun.", details: String(error) },
      { status: 500 }
    );
  }
}
