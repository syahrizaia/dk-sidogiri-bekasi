"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { getSessionFromCookies, hashPassword, verifyPassword, createSessionToken, AUTH_COOKIE_NAME, type UserSession } from "@/lib/auth";
import { verifyUserPermission } from "@/lib/actions/roles";
import { ObjectId } from "mongodb";
import { serializeData } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export interface InstitutionSettings {
  name: string;
  subHeader: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  leaderName: string;
}

export interface AcademicSettings {
  academicYear: string;
  semester: "Ganjil" | "Genap";
  operationalStatus: "AKTIF" | "IMTIHAN" | "LIBUR";
  curfewTime: string;
  defaultQuota: number;
}

export interface NotificationSettings {
  waNewAdmission: boolean;
  waPermitMutation: boolean;
  waExamSchedule: boolean;
  adminNotificationPhone: string;
}

export interface SystemSettingsDocument {
  _id?: string | ObjectId;
  id: "global_system_settings";
  institution: InstitutionSettings;
  academic: AcademicSettings;
  notifications: NotificationSettings;
  updatedAt: string;
  updatedBy: string;
}

const DEFAULT_SYSTEM_SETTINGS: Omit<SystemSettingsDocument, "_id"> = {
  id: "global_system_settings",
  institution: {
    name: "Darul Khidmah Sidogiri Bekasi",
    subHeader: "Pondok Pesantren Sidogiri Ranting Bekasi • Madrasah Miftahul Ulum (MI - MTs) & TPQ Tartil",
    address: "Jl. Lapangan Kranji, Bintara, Bekasi Barat, Kota Bekasi, Jawa Barat 17134",
    phone: "0812-3456-7890",
    email: "sekretariat@sidogiri-bekasi.sch.id",
    website: "https://dksidogiribekasi.vercel.app",
    leaderName: "KH. Bahruddin Thohir",
  },
  academic: {
    academicYear: "2026/2027",
    semester: "Ganjil",
    operationalStatus: "AKTIF",
    curfewTime: "22:00 WIB",
    defaultQuota: 150,
  },
  notifications: {
    waNewAdmission: true,
    waPermitMutation: true,
    waExamSchedule: true,
    adminNotificationPhone: "0812-3456-7899",
  },
  updatedAt: new Date().toISOString(),
  updatedBy: "Sistem (Inisialisasi Otomatis)",
};

/**
 * Mengambil konfigurasi sistem global dari koleksi 'settings' di MongoDB Atlas.
 * Jika dokumen belum ada, fungsi ini secara otomatis melakukan inisialisasi default (seeding).
 */
export async function getSystemSettingsAction(): Promise<{
  success: boolean;
  data?: SystemSettingsDocument;
  error?: string;
}> {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return { success: false, error: "Sesi login tidak valid. Silakan masuk terlebih dahulu." };
    }

    const db = await getDatabase();
    const collection = db.collection<SystemSettingsDocument>("settings");

    let doc = await collection.findOne({ id: "global_system_settings" });
    if (!doc) {
      // Inisialisasi awal ke MongoDB Atlas
      const seedDoc = {
        ...DEFAULT_SYSTEM_SETTINGS,
        updatedAt: new Date().toISOString(),
      };
      const res = await collection.insertOne(seedDoc as any);
      doc = { ...seedDoc, _id: res.insertedId };
    }

    return {
      success: true,
      data: serializeData(doc),
    };
  } catch (error) {
    console.error("Error in getSystemSettingsAction:", error);
    return {
      success: false,
      error: "Gagal memuat konfigurasi sistem dari database.",
    };
  }
}

/**
 * Memperbarui konfigurasi sistem (Institusi, Akademik, dan Notifikasi Gateway).
 * Diperlukan wewenang Super Admin atau Ketua Ranting.
 */
export async function updateSystemSettingsAction(input: {
  institution: InstitutionSettings;
  academic: AcademicSettings;
  notifications: NotificationSettings;
}): Promise<{
  success: boolean;
  message?: string;
  data?: SystemSettingsDocument;
  error?: string;
}> {
  try {
    const authCheck = await verifyUserPermission("settings", "update");
    if (!authCheck.allowed) {
      return {
        success: false,
        error: authCheck.error || "Akses ditolak: Anda tidak memiliki wewenang untuk mengubah pengaturan sistem.",
      };
    }

    const session = authCheck.session;
    if (!input.institution?.name?.trim()) {
      return { success: false, error: "Nama institusi resmi tidak boleh kosong." };
    }
    if (!input.academic?.academicYear?.trim()) {
      return { success: false, error: "Tahun ajaran aktif wajib diisi." };
    }

    const db = await getDatabase();
    const collection = db.collection<SystemSettingsDocument>("settings");

    const updatePayload: Partial<SystemSettingsDocument> = {
      institution: {
        name: input.institution.name.trim(),
        subHeader: input.institution.subHeader?.trim() || "",
        address: input.institution.address?.trim() || "",
        phone: input.institution.phone?.trim() || "",
        email: input.institution.email?.trim() || "",
        website: input.institution.website?.trim() || "",
        leaderName: input.institution.leaderName?.trim() || "",
      },
      academic: {
        academicYear: input.academic.academicYear.trim(),
        semester: input.academic.semester || "Ganjil",
        operationalStatus: input.academic.operationalStatus || "AKTIF",
        curfewTime: input.academic.curfewTime?.trim() || "22:00 WIB",
        defaultQuota: Number(input.academic.defaultQuota) || 150,
      },
      notifications: {
        waNewAdmission: Boolean(input.notifications.waNewAdmission),
        waPermitMutation: Boolean(input.notifications.waPermitMutation),
        waExamSchedule: Boolean(input.notifications.waExamSchedule),
        adminNotificationPhone: input.notifications.adminNotificationPhone?.trim() || "",
      },
      updatedAt: new Date().toISOString(),
      updatedBy: `${session?.name || "Pengguna"} (${session?.role || "Staff"})`,
    };

    await collection.updateOne(
      { id: "global_system_settings" },
      { $set: updatePayload },
      { upsert: true }
    );

    revalidatePath("/settings");
    revalidatePath("/", "layout");
    revalidatePath("/modules");
    revalidatePath("/about");

    const refreshed = await collection.findOne({ id: "global_system_settings" });

    return {
      success: true,
      message: "Pengaturan sistem berhasil disimpan secara permanen di MongoDB Atlas.",
      data: refreshed ? serializeData(refreshed) : undefined,
    };
  } catch (error) {
    console.error("Error in updateSystemSettingsAction:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat menyimpan pengaturan sistem ke database.",
    };
  }
}

/**
 * Mengambil detail profil pengguna yang sedang login langsung dari koleksi 'users'.
 */
export async function getCurrentUserProfileDetailsAction(): Promise<{
  success: boolean;
  data?: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    status: string;
    createdAt?: string;
  };
  error?: string;
}> {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.id) {
      return { success: false, error: "Sesi login tidak ditemukan." };
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    let userDoc: any = null;
    try {
      userDoc = await usersCollection.findOne({ _id: new ObjectId(session.id) });
    } catch {
      userDoc = await usersCollection.findOne({ email: session.email });
    }

    if (!userDoc) {
      return {
        success: true,
        data: {
          id: session.id,
          name: session.name,
          email: session.email,
          role: session.role,
          phone: "",
          status: "active",
        },
      };
    }

    return {
      success: true,
      data: {
        id: String(userDoc._id),
        name: userDoc.name || session.name,
        email: userDoc.email || session.email,
        role: userDoc.role || session.role,
        phone: userDoc.phone || "",
        status: userDoc.status || "active",
        createdAt: userDoc.createdAt,
      },
    };
  } catch (error) {
    console.error("Error in getCurrentUserProfileDetailsAction:", error);
    return {
      success: false,
      error: "Gagal memuat profil pengguna dari database.",
    };
  }
}

/**
 * Memperbarui data profil akun pengguna yang sedang login di koleksi 'users'
 * dan menyinkronkan token sesi/cookie (dk_session) secara instan.
 */
export async function updateUserProfileAction(input: {
  name: string;
  phone?: string;
  email?: string;
}): Promise<{
  success: boolean;
  message?: string;
  user?: UserSession;
  error?: string;
}> {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.id) {
      return { success: false, error: "Sesi Anda telah kedaluwarsa. Silakan masuk kembali." };
    }

    const name = input.name?.trim();
    if (!name || name.length < 3) {
      return { success: false, error: "Nama lengkap minimal 3 karakter." };
    }

    const email = input.email?.trim().toLowerCase();
    if (email && !email.includes("@")) {
      return { success: false, error: "Format alamat email tidak valid." };
    }

    const phone = input.phone?.trim() || "";

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // Jika email diubah, pastikan tidak bertabrakan dengan akun lain
    if (email && email !== session.email) {
      const existingUser = await usersCollection.findOne({
        email,
        _id: { $ne: new ObjectId(session.id) },
      });
      if (existingUser) {
        return { success: false, error: "Alamat email tersebut telah digunakan oleh akun lain." };
      }
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(session.id) },
      {
        $set: {
          name,
          phone,
          ...(email ? { email } : {}),
          updatedAt: new Date().toISOString(),
        },
      }
    );

    // Sinkronisasi Sesi Cookie dk_session
    const updatedSession: UserSession = {
      ...session,
      name,
      ...(email ? { email } : {}),
    };

    const newSessionToken = createSessionToken(updatedSession);
    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    revalidatePath("/settings");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Profil akun Anda berhasil diperbarui dan disinkronkan ke seluruh sistem.",
      user: serializeData(updatedSession),
    };
  } catch (error) {
    console.error("Error in updateUserProfileAction:", error);
    return {
      success: false,
      error: "Terjadi kesalahan sistem saat memperbarui profil pengguna.",
    };
  }
}

/**
 * Memperbarui kata sandi akun pengguna yang sedang login.
 * Memvalidasi kata sandi saat ini dan menyimpan kata sandi baru dengan hash scrypt.
 */
export async function updateUserPasswordAction(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.id) {
      return { success: false, error: "Sesi Anda telah kedaluwarsa. Silakan masuk kembali." };
    }

    const { currentPassword, newPassword, confirmPassword } = input;

    if (!currentPassword) {
      return { success: false, error: "Kata sandi saat ini wajib diisi." };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Kata sandi baru minimal 6 karakter." };
    }
    if (newPassword !== confirmPassword) {
      return { success: false, error: "Konfirmasi kata sandi baru tidak cocok." };
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    let userDoc: any = null;
    try {
      userDoc = await usersCollection.findOne({ _id: new ObjectId(session.id) });
    } catch {
      userDoc = await usersCollection.findOne({ email: session.email });
    }

    if (!userDoc || !userDoc.passwordHash) {
      return { success: false, error: "Dokumen akun tidak ditemukan atau kata sandi belum dikonfigurasi." };
    }

    const isMatch = verifyPassword(currentPassword, userDoc.passwordHash);
    if (!isMatch) {
      return { success: false, error: "Kata sandi saat ini yang Anda masukkan salah." };
    }

    const newHash = hashPassword(newPassword);

    await usersCollection.updateOne(
      { _id: new ObjectId(session.id) },
      {
        $set: {
          passwordHash: newHash,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    return {
      success: true,
      message: "Kata sandi Anda berhasil diperbarui secara aman.",
    };
  } catch (error) {
    console.error("Error in updateUserPasswordAction:", error);
    return {
      success: false,
      error: "Terjadi kesalahan sistem saat memperbarui kata sandi.",
    };
  }
}

/**
 * Mengembalikan seluruh pengaturan sistem ke standar baku Darul Khidmah Sidogiri Bekasi.
 * Khusus Super Admin.
 */
export async function resetSystemSettingsAction(): Promise<{
  success: boolean;
  message?: string;
  data?: SystemSettingsDocument;
  error?: string;
}> {
  try {
    const session = await getSessionFromCookies();
    if (!session || session.role !== "super_admin") {
      return {
        success: false,
        error: "Akses ditolak: Hanya Super Admin yang berhak mereset konfigurasi sistem.",
      };
    }

    const db = await getDatabase();
    const collection = db.collection<SystemSettingsDocument>("settings");

    const resetDoc = {
      ...DEFAULT_SYSTEM_SETTINGS,
      updatedAt: new Date().toISOString(),
      updatedBy: `${session.name} (Reset ke Standar Pabrik)`,
    };

    await collection.updateOne(
      { id: "global_system_settings" },
      { $set: resetDoc },
      { upsert: true }
    );

    revalidatePath("/settings");
    revalidatePath("/", "layout");
    revalidatePath("/modules");

    return {
      success: true,
      message: "Konfigurasi sistem berhasil dikembalikan ke standar resmi Sidogiri Bekasi.",
      data: serializeData(resetDoc),
    };
  } catch (error) {
    console.error("Error in resetSystemSettingsAction:", error);
    return {
      success: false,
      error: "Gagal mereset pengaturan sistem.",
    };
  }
}

/**
 * Mengambil metrik performa & status kesehatan pangkalan data MongoDB Atlas secara real-time.
 */
export async function getSystemDatabaseHealthAction(): Promise<{
  success: boolean;
  data?: {
    status: "CONNECTED" | "DEGRADED" | "DISCONNECTED";
    latencyMs: number;
    databaseName: string;
    totalCollections: number;
    totalDocuments: number;
    collectionsDetail: { name: string; count: number }[];
    serverTime: string;
  };
  error?: string;
}> {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return { success: false, error: "Akses ditolak: Sesi tidak terautentikasi." };
    }

    const db = await getDatabase();
    const startTime = performance.now();
    await db.command({ ping: 1 });
    const latencyMs = Math.round(performance.now() - startTime);

    const collections = await db.listCollections().toArray();
    let totalDocs = 0;
    const collectionsDetail: { name: string; count: number }[] = [];

    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments();
      totalDocs += count;
      collectionsDetail.push({ name: c.name, count });
    }

    collectionsDetail.sort((a, b) => b.count - a.count);

    return {
      success: true,
      data: {
        status: "CONNECTED",
        latencyMs,
        databaseName: "dk-sidogiri-bekasi",
        totalCollections: collections.length,
        totalDocuments: totalDocs,
        collectionsDetail,
        serverTime: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error in getSystemDatabaseHealthAction:", error);
    return {
      success: false,
      error: "Gagal menghubungkan atau memeriksa kesehatan database MongoDB Atlas.",
    };
  }
}

/**
 * Merevalidasi seluruh cache halaman publik dan privat dalam satu ketukan.
 */
export async function revalidateAllSystemCacheAction(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getSessionFromCookies();
    if (!session || (session.role !== "super_admin" && session.role !== "ketua_ranting")) {
      return {
        success: false,
        error: "Akses ditolak: Hanya Super Admin dan Ketua Ranting yang dapat merevalidasi cache sistem.",
      };
    }

    revalidatePath("/", "layout");
    revalidatePath("/settings");
    revalidatePath("/modules");
    revalidatePath("/students");
    revalidatePath("/teachers");
    revalidatePath("/parents");
    revalidatePath("/modules/mi");
    revalidatePath("/modules/mts");
    revalidatePath("/modules/tpq");
    revalidatePath("/modules/admissions");

    return {
      success: true,
      message: "Seluruh cache sistem, layout, dan rute aplikasi berhasil disinkronisasi ulang secara menyeluruh.",
    };
  } catch (error) {
    console.error("Error in revalidateAllSystemCacheAction:", error);
    return {
      success: false,
      error: "Gagal merevalidasi cache sistem.",
    };
  }
}
