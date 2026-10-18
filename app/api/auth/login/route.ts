import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { verifyPassword, hashPassword, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // Auto-seed admin akun utama jika koleksi users kosong
    const totalUsers = await usersCollection.countDocuments();
    if (totalUsers === 0) {
      const defaultAdmin = {
        name: "Admin Darul Khidmah Sidogiri Bekasi",
        email: "admin@sidogiri-bekasi.sch.id",
        passwordHash: hashPassword("Sidogiri2026!"),
        role: "admin",
        createdAt: new Date().toISOString(),
      };
      await usersCollection.insertOne(defaultAdmin);
    }

    const userDoc = await usersCollection.findOne({ email: normalizedEmail });
    if (!userDoc) {
      return NextResponse.json(
        { success: false, error: "Alamat email atau kata sandi tidak cocok." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, userDoc.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Alamat email atau kata sandi tidak cocok." },
        { status: 401 }
      );
    }

    const userSession = {
      id: String(userDoc._id),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role || "staff",
    };

    const sessionToken = createSessionToken(userSession);

    const response = NextResponse.json({
      success: true,
      message: "Berhasil masuk ke sistem.",
      user: userSession,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan sistem saat proses masuk.", details: String(error) },
      { status: 500 }
    );
  }
}
