import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export interface RolePermission {
  id: string; // e.g. "super_admin", "admin_yayasan", "guru", "orang_tua", "staf"
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
    id: "guru",
    name: "Dewan Asatidz",
    description: "Tenaga pendidik kajian kitab salaf, tahsin metode Tartil Sidogiri, dan pembina kedisiplinan asrama.",
    level: "Akademik",
    badgeColor: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30",
    permissions: {
      modules: true,
      students: true,
      teachers: true,
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
    id: "orang_tua",
    name: "Wali Santri",
    description: "Orang tua murid dengan wewenang melihat perkembangan tarbiyah anak, status kamar asrama, dan informasi pengumuman.",
    level: "Keluarga",
    badgeColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
    permissions: {
      modules: true,
      students: false,
      teachers: false,
      parents: true,
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
    name: "Staf Administrasi",
    description: "Petugas ketatausahaan santri, inventaris sarana asrama, dan layanan pendaftaran santri baru.",
    level: "Operasional",
    badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    permissions: {
      modules: true,
      students: true,
      teachers: false,
      parents: true,
      dormitory: true,
      media: true,
      users: false,
      data_science: false,
      settings: false,
    },
    updatedAt: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    const db = await getDatabase();
    const rolesCollection = db.collection("roles");

    const count = await rolesCollection.countDocuments();
    if (count === 0) {
      await rolesCollection.insertMany(DEFAULT_ROLE_PERMISSIONS);
    }

    const roles = await rolesCollection.find({}).toArray();
    const formatted = roles.map((doc) => ({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      level: doc.level,
      badgeColor: doc.badgeColor,
      permissions: doc.permissions,
      updatedAt: doc.updatedAt,
    }));

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
    const body = await request.json();
    const { roleId, permissions } = body;

    if (!roleId || !permissions) {
      return NextResponse.json(
        { success: false, error: "Role ID dan objek perizinan wajib disertakan." },
        { status: 400 }
      );
    }

    // Protect Super Admin from losing root settings and users module access
    if (roleId === "super_admin") {
      permissions.users = true;
      permissions.settings = true;
      permissions.modules = true;
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
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: `Matriks hak akses untuk peran "${roleId}" berhasil diperbarui.`,
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
