"use server";

import "server-only";
import { cookies } from "next/headers";
import { getDatabase } from "@/lib/mongodb";
import { 
  verifyPassword, 
  hashPassword, 
  createSessionToken, 
  verifySessionToken, 
  AUTH_COOKIE_NAME,
  UserSession 
} from "@/lib/auth";

export async function loginAction(formData: { email: string; password: string }) {
  try {
    const { email, password } = formData;
    if (!email || !password) {
      return { success: false, error: "Email dan kata sandi wajib diisi." };
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // Auto-seed admin jika koleksi kosong
    const count = await usersCollection.countDocuments();
    if (count === 0) {
      const defaultAdmin = {
        name: "Admin Darul Khidmah Sidogiri Bekasi",
        email: "admin@sidogiri-bekasi.sch.id",
        passwordHash: hashPassword("Sidogiri2026!"),
        role: "super_admin",
        createdAt: new Date().toISOString(),
      };
      await usersCollection.insertOne(defaultAdmin);
    }

    const userDoc = await usersCollection.findOne({ email: normalizedEmail });
    if (!userDoc) {
      return { success: false, error: "Alamat email atau kata sandi tidak cocok." };
    }

    const isValid = verifyPassword(password, userDoc.passwordHash);
    if (!isValid) {
      return { success: false, error: "Alamat email atau kata sandi tidak cocok." };
    }

    const userSession: UserSession = {
      id: String(userDoc._id),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role || "staff",
    };

    const sessionToken = createSessionToken(userSession);
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return { success: true, user: userSession };
  } catch (error) {
    console.error("Error in loginAction:", error);
    return { success: false, error: "Terjadi kesalahan saat memproses login." };
  }
}

export async function registerAction(data: { name: string; email: string; password: string; role?: string }) {
  try {
    const { name, email, password, role } = data;
    if (!name || !email || !password) {
      return { success: false, error: "Nama, email, dan kata sandi wajib diisi." };
    }

    if (password.length < 6) {
      return { success: false, error: "Kata sandi minimal 6 karakter." };
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDatabase();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email: normalizedEmail });
    if (existingUser) {
      return { success: false, error: "Email ini sudah terdaftar." };
    }

    const assignedRole = role || "staff";
    const passwordHash = hashPassword(password);
    const newUser = {
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: assignedRole,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    const result = await usersCollection.insertOne(newUser);
    const userSession: UserSession = {
      id: String(result.insertedId),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    const sessionToken = createSessionToken(userSession);
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, user: userSession };
  } catch (error) {
    console.error("Error in registerAction:", error);
    return { success: false, error: "Gagal mendaftarkan akun." };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);
    return { success: true };
  } catch (error) {
    console.error("Error in logoutAction:", error);
    return { success: false, error: "Gagal logout." };
  }
}

export async function getCurrentUserAction(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}
