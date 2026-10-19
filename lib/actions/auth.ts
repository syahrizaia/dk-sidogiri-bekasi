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
import { serializeData } from "@/lib/utils";

export async function loginAction(formData: { email: string; password: string }) {
  try {
    const { email, password } = formData;
    if (!email || !password) {
      return { success: false, error: "Email dan kata sandi wajib diisi." };
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // Pastikan seluruh akun peran utama (Super Admin, Dewan Asatidz, Wali Santri) terdaftar
    const { ensureDefaultSystemAccounts } = await import("@/lib/actions/users");
    await ensureDefaultSystemAccounts();

    const userDoc = await usersCollection.findOne({ email: normalizedEmail });
    if (!userDoc) {
      return { success: false, error: "Alamat email atau kata sandi tidak cocok." };
    }

    const isValid = verifyPassword(password, userDoc.passwordHash);
    if (!isValid) {
      return { success: false, error: "Alamat email atau kata sandi tidak cocok." };
    }

    const { normalizeRoleId } = await import("@/lib/roles-config");
    const userSession: UserSession = {
      id: String(userDoc._id),
      name: userDoc.name,
      email: userDoc.email,
      role: normalizeRoleId(userDoc.role),
      studentNis: userDoc.studentNis,
      studentName: userDoc.studentName,
      studentId: userDoc.studentId,
      parentId: userDoc.parentId,
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

    return { success: true, user: serializeData(userSession) };
  } catch (error) {
    console.error("Error in loginAction:", error);
    return { success: false, error: "Terjadi kesalahan saat memproses login." };
  }
}

export async function registerAction() {
  return {
    success: false,
    error: "Pendaftaran akun publik telah dinonaktifkan. Seluruh akun pengguna dibuatkan langsung oleh Super Admin.",
  };
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
    return serializeData(verifySessionToken(token));
  } catch {
    return null;
  }
}
