"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";

export interface RolePermission {
  id: string;
  name: string;
  description: string;
  level: "Root Security" | "Manajerial" | "Akademik" | "Keluarga" | "Operasional";
  badgeColor: string;
  permissions: {
    modules: boolean;
    students: boolean;
    teachers: boolean;
    parents: boolean;
    dormitory: boolean;
    media: boolean;
    users: boolean;
    data_science: boolean;
    settings: boolean;
  };
  updatedAt?: string;
}

const DEFAULT_ROLE_PERMISSIONS: RolePermission[] = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Pemegang hak akses tertinggi sistem, konfigurasi RBAC penuh, audit trail, dan manajemen database MongoDB Atlas.",
    level: "Root Security",
    badgeColor: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30",
    permissions: {
      modules: true,
      students: true,
      teachers: true,
      parents: true,
      dormitory: true,
      media: true,
      users: true,
      data_science: true,
      settings: true,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "admin_yayasan",
    name: "Admin Yayasan",
    description: "Pengurus harian pesantren dengan wewenang monitoring santri, guru, wali, asrama, dan arsip media dakwah.",
    level: "Manajerial",
    badgeColor: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
    permissions: {
      modules: true,
      students: true,
      teachers: true,
      parents: true,
      dormitory: true,
      media: true,
      users: true,
      data_science: true,
      settings: false,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "admin",
    name: "Administrator Sistem",
    description: "Pengelola operasional IT, penerimaan santri baru, pengumuman media, dan tata kelola akun.",
    level: "Manajerial",
    badgeColor: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30",
    permissions: {
      modules: true,
      students: true,
      teachers: true,
      parents: true,
      dormitory: true,
      media: true,
      users: true,
      data_science: true,
      settings: false,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "guru",
    name: "Dewan Asatidz",
    description: "Guru dan pengajar Madrasah Miftahul Ulum & TPQ. Mengakses buku induk santri, absensi, dan data wali santri.",
    level: "Akademik",
    badgeColor: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30",
    permissions: {
      modules: true,
      students: true,
      teachers: true,
      parents: true,
      dormitory: false,
      media: false,
      users: false,
      data_science: false,
      settings: false,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "orang_tua",
    name: "Wali Santri",
    description: "Orang tua atau wali sah santri. Memantau progres hafalan, rekam asrama, dan informasi pengumuman yayasan.",
    level: "Keluarga",
    badgeColor: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
    permissions: {
      modules: true,
      students: true,
      teachers: false,
      parents: false,
      dormitory: true,
      media: true,
      users: false,
      data_science: false,
      settings: false,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "staf",
    name: "Staf Tarbiyah & Sarpras",
    description: "Staf pendukung tata kelola asrama, inventaris fasilitas kamar, serta peliputan media kegiatan santri.",
    level: "Operasional",
    badgeColor: "bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-500/30",
    permissions: {
      modules: true,
      students: false,
      teachers: false,
      parents: false,
      dormitory: true,
      media: true,
      users: false,
      data_science: false,
      settings: false,
    },
    updatedAt: new Date().toISOString(),
  },
];

export async function getRolesAction(): Promise<{ success: boolean; data?: RolePermission[]; error?: string }> {
  try {
    const db = await getDatabase();
    const rolesCollection = db.collection("roles");

    const total = await rolesCollection.countDocuments();
    if (total === 0) {
      await rolesCollection.insertMany(DEFAULT_ROLE_PERMISSIONS);
    }

    const roles = await rolesCollection.find({}).toArray();
    const formatted: RolePermission[] = roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      level: r.level,
      badgeColor: r.badgeColor,
      permissions: r.permissions,
      updatedAt: r.updatedAt,
    }));

    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error in getRolesAction:", error);
    return { success: false, error: "Gagal memuat konfigurasi peran." };
  }
}

export async function updateRolePermissionsAction(
  roleId: string,
  permissions: RolePermission["permissions"]
) {
  try {
    if (!roleId || !permissions) {
      return { success: false, error: "Role ID dan hak akses wajib disertakan." };
    }

    const db = await getDatabase();
    const rolesCollection = db.collection("roles");

    const result = await rolesCollection.updateOne(
      { id: roleId },
      {
        $set: {
          permissions,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: "Peran tidak ditemukan." };
    }

    return { success: true, message: "Hak akses peran berhasil diperbarui." };
  } catch (error) {
    console.error("Error in updateRolePermissionsAction:", error);
    return { success: false, error: "Gagal memperbarui hak akses peran." };
  }
}
