import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { requireSuperAdminSession } from "@/lib/auth";
import {
  DEFAULT_ROLE_PERMISSIONS,
  buildFallbackCrud,
  noAccess,
  type RolePermission,
  type CrudActionPermissions,
} from "@/lib/roles-config";

export async function GET() {
  try {
    try {
      await requireSuperAdminSession();
    } catch {
      return NextResponse.json(
        { success: false, error: "Akses ditolak: Hanya Super Admin." },
        { status: 403 }
      );
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
    const formatted: RolePermission[] = roles.map((doc) => {
      const perms = (doc.permissions || {}) as RolePermission["permissions"];
      const crud = buildFallbackCrud(doc.id, perms, doc.crudPermissions);

      return {
        id: doc.id,
        name: doc.name || doc.id,
        description: doc.description || "",
        level: doc.level || "Operasional",
        badgeColor: doc.badgeColor || "bg-slate-500/15 text-slate-800 dark:text-slate-300 border-slate-500/30",
        permissions: perms,
        crudPermissions: crud,
        updatedAt: doc.updatedAt,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat matriks hak akses peran." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    try {
      await requireSuperAdminSession();
    } catch {
      return NextResponse.json(
        { success: false, error: "Akses ditolak: Hanya Super Admin." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { roleId, permissions, crudPermissions } = body as {
      roleId: string;
      permissions: RolePermission["permissions"];
      crudPermissions?: Record<string, CrudActionPermissions>;
    };

    if (!roleId || !permissions) {
      return NextResponse.json(
        { success: false, error: "Role ID dan objek perizinan wajib disertakan." },
        { status: 400 }
      );
    }

    const safePermissions = { ...permissions };
    const safeCrud = crudPermissions ? { ...crudPermissions } : buildFallbackCrud(roleId, safePermissions);

    // Protect Super Admin from losing root settings and users module access
    if (roleId === "super_admin") {
      safePermissions.users = true;
      safePermissions.settings = true;
      safePermissions.modules = true;
      safeCrud.users = { create: true, read: true, update: true, delete: true };
      safeCrud.settings = { create: true, read: true, update: true, delete: true };
      safeCrud.modules = { create: true, read: true, update: true, delete: true };
    } else {
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

    return NextResponse.json({
      success: true,
      message: `Matriks hak akses dan CRUD untuk peran "${roleId}" berhasil diperbarui.`,
      result,
    });
  } catch (error) {
    console.error("Error updating role permissions:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui wewenang peran." },
      { status: 500 }
    );
  }
}
