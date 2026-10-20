"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { getDatabase } from "@/lib/mongodb";
import { requireSuperAdminSession, getSessionFromCookies, type UserSession } from "@/lib/auth";
import type {
  RolePermission,
  CrudActionPermissions,
  ModulePermissionKey,
  SystemRole,
} from "@/lib/roles-config";
import {
  DEFAULT_ROLE_PERMISSIONS,
  buildFallbackCrud,
  normalizeRoleId,
  noAccess,
  fullCrud,
} from "@/lib/roles-config";
import { serializeData } from "@/lib/utils";

export interface UserPermissionsResult {
  role: SystemRole;
  isSuperAdmin: boolean;
  permissions: Record<ModulePermissionKey, boolean>;
  crudPermissions: Record<ModulePermissionKey, CrudActionPermissions>;
}

export async function getRolesAction(): Promise<{ success: boolean; data?: RolePermission[]; error?: string }> {
  try {
    try {
      await requireSuperAdminSession();
    } catch {
      return { success: false, error: "Akses ditolak: Hanya Super Admin yang berhak melihat matriks perizinan peran." };
    }

    const db = await getDatabase();
    const rolesCollection = db.collection("roles");

    // 1. Bersihkan role legacy yang dihapus dari sistem (admin_yayasan & admin)
    await rolesCollection.deleteMany({
      id: { $in: ["admin_yayasan", "admin", "ketua", "staf", "guru", "orang_tua"] },
    });

    // 2. Pastikan seluruh 5 peran standar terdaftar di database
    for (const defRole of DEFAULT_ROLE_PERMISSIONS) {
      const existing = await rolesCollection.findOne({ id: defRole.id });
      if (!existing) {
        await rolesCollection.insertOne({
          ...defRole,
          createdAt: new Date().toISOString(),
        });
      } else {
        await rolesCollection.updateOne(
          { id: defRole.id },
          {
            $set: {
              name: defRole.name,
              description: defRole.description,
              level: defRole.level,
              badgeColor: defRole.badgeColor,
              crudPermissions: existing.crudPermissions || defRole.crudPermissions,
            },
          }
        );
      }
    }

    const roles = await rolesCollection
      .find({
        id: { $in: ["super_admin", "ketua_ranting", "staf_administrasi", "dewan_asatidz", "wali_santri"] },
      })
      .toArray();

    const formatted: RolePermission[] = roles.map((r) => {
      const perms = (r.permissions || {}) as RolePermission["permissions"];
      const crud = buildFallbackCrud(r.id, perms, r.crudPermissions);

      return {
        id: r.id,
        name: r.name || r.id,
        description: r.description || "",
        level: r.level || "Operasional",
        badgeColor: r.badgeColor || "bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-500/30",
        permissions: {
          modules: perms.modules ?? true,
          students: perms.students ?? false,
          teachers: perms.teachers ?? false,
          parents: perms.parents ?? false,
          dormitory: perms.dormitory ?? false,
          media: perms.media ?? false,
          users: perms.users ?? false,
          data_science: perms.data_science ?? false,
          settings: perms.settings ?? false,
          mi: perms.mi ?? true,
          mts: perms.mts ?? true,
          tpq: perms.tpq ?? true,
          finance: perms.finance ?? (r.id === "super_admin" || r.id === "ketua_ranting" || r.id === "staf_administrasi"),
          admissions: perms.admissions ?? (r.id === "super_admin" || r.id === "ketua_ranting" || r.id === "staf_administrasi"),
        },
        crudPermissions: crud,
        updatedAt: r.updatedAt,
      };
    });

    return { success: true, data: serializeData(formatted) };
  } catch (error) {
    console.error("Error in getRolesAction:", error);
    return { success: false, error: "Gagal memuat konfigurasi peran." };
  }
}

export async function getUserPermissionsAction(): Promise<{
  success: boolean;
  data?: UserPermissionsResult;
  error?: string;
}> {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return { success: false, error: "Tidak ada sesi pengguna aktif." };
    }

    const normRole = normalizeRoleId(session.role);
    const db = await getDatabase();
    const rolesCollection = db.collection("roles");

    const roleDoc = await rolesCollection.findOne({ id: normRole });
    const defaultRole =
      DEFAULT_ROLE_PERMISSIONS.find((r) => r.id === normRole) || DEFAULT_ROLE_PERMISSIONS[0];

    const rawPermissions = (roleDoc?.permissions || defaultRole.permissions) as Record<string, boolean>;
    const rawCrud = (roleDoc?.crudPermissions || defaultRole.crudPermissions) as Record<
      string,
      CrudActionPermissions
    >;

    const permissions: Record<ModulePermissionKey, boolean> = {
      modules: rawPermissions.modules ?? true,
      students: rawPermissions.students ?? false,
      teachers: rawPermissions.teachers ?? false,
      parents: rawPermissions.parents ?? false,
      dormitory: rawPermissions.dormitory ?? false,
      media: rawPermissions.media ?? false,
      users: normRole === "super_admin",
      data_science: rawPermissions.data_science ?? false,
      settings: normRole === "super_admin" ? true : (rawPermissions.settings ?? false),
      mi: rawPermissions.mi ?? true,
      mts: rawPermissions.mts ?? true,
      tpq: rawPermissions.tpq ?? true,
      finance: rawPermissions.finance ?? (normRole === "super_admin" || normRole === "ketua_ranting" || normRole === "staf_administrasi"),
      admissions: rawPermissions.admissions ?? (normRole === "super_admin" || normRole === "ketua_ranting" || normRole === "staf_administrasi"),
    };

    const crudPermissions = buildFallbackCrud(normRole, permissions, rawCrud) as Record<
      ModulePermissionKey,
      CrudActionPermissions
    >;

    // Failsafe Super Admin
    if (normRole === "super_admin") {
      permissions.modules = true;
      permissions.users = true;
      permissions.settings = true;
      crudPermissions.modules = fullCrud();
      crudPermissions.users = fullCrud();
      crudPermissions.settings = fullCrud();
    } else {
      permissions.users = false;
      crudPermissions.users = noAccess();
    }

    return {
      success: true,
      data: serializeData({
        role: normRole,
        isSuperAdmin: normRole === "super_admin",
        permissions,
        crudPermissions,
      }),
    };
  } catch (error) {
    console.error("Error in getUserPermissionsAction:", error);
    return { success: false, error: "Gagal mengambil hak akses pengguna." };
  }
}

export async function verifyUserPermission(
  moduleKey: ModulePermissionKey,
  action: "create" | "read" | "update" | "delete"
): Promise<{ allowed: boolean; session?: UserSession; error?: string }> {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return { allowed: false, error: "Sesi tidak ditemukan atau telah berakhir. Silakan login kembali." };
    }

    const normRole = normalizeRoleId(session.role);

    // Root Security Failsafe: Super Admin selalu diizinkan
    if (normRole === "super_admin") {
      return { allowed: true, session };
    }

    // Root Security: Modul users terkunci khusus super_admin
    if (moduleKey === "users") {
      return { allowed: false, session, error: "Akses ditolak: Modul manajemen pengguna hanya untuk Super Admin." };
    }

    const db = await getDatabase();
    const roleDoc = await db.collection("roles").findOne({ id: normRole });
    const defaultRole = DEFAULT_ROLE_PERMISSIONS.find((r) => r.id === normRole);

    const crudMap = (roleDoc?.crudPermissions || defaultRole?.crudPermissions || {}) as Record<
      string,
      CrudActionPermissions
    >;
    const moduleCrud = crudMap[moduleKey];

    if (moduleCrud && moduleCrud[action] === true) {
      return { allowed: true, session };
    }

    // Jika belum diset di crud, cek fallback
    const perms = (roleDoc?.permissions || defaultRole?.permissions || {}) as Record<string, boolean>;
    const fallbackCrud = buildFallbackCrud(normRole, perms, crudMap);

    if (fallbackCrud[moduleKey] && fallbackCrud[moduleKey][action] === true) {
      return { allowed: true, session };
    }

    return {
      allowed: false,
      session,
      error: `Akses ditolak: Peran '${normRole}' tidak memiliki wewenang '${action}' pada modul '${moduleKey}'. Hubungi Super Admin.`,
    };
  } catch (err) {
    console.error("Error in verifyUserPermission:", err);
    return { allowed: false, error: "Terjadi kesalahan sistem saat memverifikasi hak akses." };
  }
}

export async function updateRolePermissionsAction(
  roleId: string,
  permissions: RolePermission["permissions"],
  crudPermissions?: Record<string, CrudActionPermissions>
) {
  try {
    try {
      await requireSuperAdminSession();
    } catch {
      return { success: false, error: "Akses ditolak: Hanya Super Admin yang berhak memperbarui matriks perizinan peran." };
    }

    if (!roleId || !permissions) {
      return { success: false, error: "Role ID dan hak akses wajib disertakan." };
    }

    const safePermissions = { ...permissions };
    const safeCrud = crudPermissions ? { ...crudPermissions } : buildFallbackCrud(roleId, safePermissions);

    // Proteksi keamanan inti Super Admin (root settings & users tidak boleh terlepas)
    if (roleId === "super_admin") {
      safePermissions.modules = true;
      safePermissions.users = true;
      safePermissions.settings = true;
      safeCrud.modules = fullCrud();
      safeCrud.users = fullCrud();
      safeCrud.settings = fullCrud();
    } else {
      // Role selain super_admin DILARANG MUTLAK mengakses modul users (manajemen pengguna)
      safePermissions.users = false;
      safeCrud.users = noAccess();
    }

    const db = await getDatabase();
    const rolesCollection = db.collection("roles");

    const result = await rolesCollection.updateOne(
      { id: roleId },
      {
        $set: {
          permissions: safePermissions,
          crudPermissions: safeCrud,
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    if (result.matchedCount === 0 && result.upsertedCount === 0) {
      return { success: false, error: "Peran tidak ditemukan." };
    }

    // Revalidasi cache Next.js agar seluruh perubahan hak akses langsung aktif seketika
    revalidatePath("/", "layout");
    revalidatePath("/modules", "page");
    revalidatePath("/students", "page");
    revalidatePath("/teachers", "page");
    revalidatePath("/parents", "page");
    revalidatePath("/modules/dormitory", "page");
    revalidatePath("/modules/media", "page");
    revalidatePath("/modules/mi", "page");
    revalidatePath("/modules/mts", "page");
    revalidatePath("/modules/tpq", "page");
    revalidatePath("/modules/finance", "page");

    return { success: true, message: "Hak akses peran dan wewenang CRUD berhasil diperbarui seketika." };
  } catch (error) {
    console.error("Error in updateRolePermissionsAction:", error);
    return { success: false, error: "Gagal memperbarui hak akses peran." };
  }
}
