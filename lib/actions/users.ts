"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { hashPassword, requireSuperAdminSession } from "@/lib/auth";
import { normalizeRoleId, type UserAccount } from "@/lib/roles-config";
import { ObjectId } from "mongodb";
import { serializeData } from "@/lib/utils";

export async function ensureDefaultSystemAccounts() {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // Migrasi akun legacy jika ada
    await usersCollection.updateMany({ role: "admin_yayasan" }, { $set: { role: "super_admin" } });
    await usersCollection.updateMany({ role: "ketua" }, { $set: { role: "ketua_ranting" } });
    await usersCollection.updateMany({ role: "staf" }, { $set: { role: "staf_administrasi" } });
    await usersCollection.updateMany({ role: "guru" }, { $set: { role: "dewan_asatidz" } });
    await usersCollection.updateMany({ role: "orang_tua" }, { $set: { role: "wali_santri" } });

    const defaultAccounts = [
      {
        email: "admin@sidogiri-bekasi.sch.id",
        name: "Admin Darul Khidmah Sidogiri Bekasi",
        passwordHash: hashPassword("Sidogiri2026!"),
        role: "super_admin",
        phone: "0812-3456-7899",
        status: "active" as const,
      },
      {
        email: "ketua@sidogiri-bekasi.sch.id",
        name: "KH. Bahruddin Thohir",
        passwordHash: hashPassword("KetuaSidogiri2026!"),
        role: "ketua_ranting",
        phone: "0812-3456-7888",
        status: "active" as const,
      },
      {
        email: "guru@sidogiri-bekasi.sch.id",
        name: "Ust. M. Sholeh Al-Bantani, S.Pd.I",
        passwordHash: hashPassword("GuruSidogiri2026!"),
        role: "dewan_asatidz",
        phone: "0812-3456-7801",
        status: "active" as const,
      },
      {
        email: "wali@sidogiri-bekasi.sch.id",
        name: "H. Abdullah Syukri",
        passwordHash: hashPassword("WaliSidogiri2026!"),
        role: "wali_santri",
        phone: "0812-3456-7890",
        status: "active" as const,
      },
      {
        email: "staf@sidogiri-bekasi.sch.id",
        name: "M. Ridwan Ansori",
        passwordHash: hashPassword("StafSidogiri2026!"),
        role: "staf_administrasi",
        phone: "0812-3456-7811",
        status: "active" as const,
      },
    ];

    for (const acc of defaultAccounts) {
      const existing = await usersCollection.findOne({ email: acc.email });
      if (!existing) {
        await usersCollection.insertOne({
          ...acc,
          createdAt: new Date().toISOString(),
        });
      } else if (!existing.passwordHash || existing.role !== acc.role) {
        await usersCollection.updateOne(
          { email: acc.email },
          {
            $set: {
              passwordHash: acc.passwordHash,
              role: acc.role,
              status: "active",
            },
          }
        );
      }
    }
  } catch (err) {
    console.error("Error ensuring default accounts:", err);
  }
}

export async function getUsersAction(role?: string): Promise<{ success: boolean; data?: UserAccount[]; error?: string }> {
  try {
    try {
      await requireSuperAdminSession();
    } catch {
      return { success: false, error: "Akses ditolak: Hanya Super Admin yang berhak mengakses manajemen pengguna." };
    }

    await ensureDefaultSystemAccounts();
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

    const formatted: UserAccount[] = users.map((u) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: normalizeRoleId(u.role),
      phone: u.phone || "",
      status: u.status || "active",
      createdAt: u.createdAt || new Date().toISOString(),
    }));

    return { success: true, data: serializeData(formatted) };
  } catch (error) {
    console.error("Error in getUsersAction:", error);
    return { success: false, error: "Gagal memuat data pengguna." };
  }
}

export async function createUserAction(payload: {
  name: string;
  email: string;
  password?: string;
  role?: string;
  status?: "active" | "inactive";
  phone?: string;
}) {
  try {
    try {
      await requireSuperAdminSession();
    } catch {
      return { success: false, error: "Akses ditolak: Hanya Super Admin yang berhak membuat pengguna baru." };
    }

    const { name, email, password, role, status, phone } = payload;
    if (!name || !email || !password) {
      return { success: false, error: "Nama, email, dan kata sandi wajib diisi." };
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const db = await getDatabase();
    const usersCollection = db.collection("users");

    const existing = await usersCollection.findOne({ email: normalizedEmail });
    if (existing) {
      return { success: false, error: "Email ini sudah digunakan oleh akun lain." };
    }

    const passwordHash = hashPassword(password);
    const finalRole = normalizeRoleId(role);
    const newUser = {
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: finalRole,
      status: status || "active",
      phone: phone ? String(phone).trim() : "",
      createdAt: new Date().toISOString(),
    };

    const result = await usersCollection.insertOne(newUser);
    return {
      success: true,
      message: "Pengguna baru berhasil ditambahkan.",
      data: serializeData({
        _id: result.insertedId.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        phone: newUser.phone,
        createdAt: newUser.createdAt,
      }),
    };
  } catch (error) {
    console.error("Error in createUserAction:", error);
    return { success: false, error: "Gagal membuat pengguna." };
  }
}

export async function updateUserAction(
  id: string,
  payload: {
    name?: string;
    role?: string;
    status?: "active" | "inactive";
    phone?: string;
    password?: string;
  }
) {
  try {
    try {
      await requireSuperAdminSession();
    } catch {
      return { success: false, error: "Akses ditolak: Hanya Super Admin yang berhak memperbarui data pengguna." };
    }

    if (!id) {
      return { success: false, error: "ID pengguna tidak disertakan." };
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    let query: Record<string, unknown> = { id };
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    }

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (payload.name) updateFields.name = String(payload.name).trim();
    if (payload.role) updateFields.role = normalizeRoleId(payload.role);
    if (payload.status) updateFields.status = payload.status;
    if (payload.phone !== undefined) updateFields.phone = String(payload.phone).trim();
    if (payload.password) {
      updateFields.passwordHash = hashPassword(payload.password);
    }

    const result = await usersCollection.updateOne(query, { $set: updateFields });
    if (result.matchedCount === 0) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    return { success: true, message: "Data pengguna berhasil diperbarui." };
  } catch (error) {
    console.error("Error in updateUserAction:", error);
    return { success: false, error: "Gagal memperbarui pengguna." };
  }
}
