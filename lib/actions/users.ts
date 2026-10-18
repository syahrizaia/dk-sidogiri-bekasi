"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import { ObjectId } from "mongodb";

export interface UserAccount {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status: "active" | "inactive";
  createdAt: string;
}

export async function getUsersAction(role?: string): Promise<{ success: boolean; data?: UserAccount[]; error?: string }> {
  try {
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
      role: u.role || "staff",
      phone: u.phone || "",
      status: u.status || "active",
      createdAt: u.createdAt || new Date().toISOString(),
    }));

    return { success: true, data: formatted };
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
    const newUser = {
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash,
      role: role || "staff",
      status: status || "active",
      phone: phone ? String(phone).trim() : "",
      createdAt: new Date().toISOString(),
    };

    const result = await usersCollection.insertOne(newUser);
    return {
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
    if (payload.role) updateFields.role = payload.role;
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
