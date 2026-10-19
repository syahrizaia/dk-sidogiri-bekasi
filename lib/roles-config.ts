export interface CrudActionPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export type ModulePermissionKey =
  | "modules"
  | "students"
  | "teachers"
  | "parents"
  | "dormitory"
  | "media"
  | "users"
  | "data_science"
  | "settings"
  | "mi"
  | "mts"
  | "tpq";

export type SystemRole =
  | "super_admin"
  | "ketua_ranting"
  | "staf_administrasi"
  | "dewan_asatidz"
  | "wali_santri";

export interface UserAccount {
  id?: string;
  _id: string;
  name: string;
  email: string;
  role: SystemRole;
  phone?: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface RolePermission {
  id: SystemRole | string;
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
    mi?: boolean;
    mts?: boolean;
    tpq?: boolean;
  };
  crudPermissions: Record<string, CrudActionPermissions>;
  updatedAt?: string;
}

export const MODULE_KEYS: ModulePermissionKey[] = [
  "modules",
  "students",
  "teachers",
  "parents",
  "dormitory",
  "media",
  "users",
  "data_science",
  "settings",
  "mi",
  "mts",
  "tpq",
];

export const fullCrud = (): CrudActionPermissions => ({
  create: true,
  read: true,
  update: true,
  delete: true,
});

export const readOnly = (): CrudActionPermissions => ({
  create: false,
  read: true,
  update: false,
  delete: false,
});

export const readWrite = (): CrudActionPermissions => ({
  create: true,
  read: true,
  update: true,
  delete: false,
});

export const readEdit = (): CrudActionPermissions => ({
  create: false,
  read: true,
  update: true,
  delete: false,
});

export const noAccess = (): CrudActionPermissions => ({
  create: false,
  read: false,
  update: false,
  delete: false,
});

export function normalizeRoleId(roleId?: string): SystemRole {
  const r = (roleId || "").trim().toLowerCase();
  if (r === "super_admin" || r === "super admin" || r === "admin") return "super_admin";
  if (r === "ketua_ranting" || r === "ketua" || r === "ketua yayasan" || r === "ketua ranting") return "ketua_ranting";
  if (r === "staf_administrasi" || r === "staf" || r === "staff" || r === "staf administrasi") return "staf_administrasi";
  if (r === "dewan_asatidz" || r === "guru" || r === "teacher" || r === "dewan asatidz") return "dewan_asatidz";
  if (r === "wali_santri" || r === "orang_tua" || r === "parent" || r === "wali santri") return "wali_santri";
  return "staf_administrasi";
}

export const DEFAULT_ROLE_PERMISSIONS: RolePermission[] = [
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
      mi: true,
      mts: true,
      tpq: true,
    },
    crudPermissions: {
      modules: fullCrud(),
      students: fullCrud(),
      teachers: fullCrud(),
      parents: fullCrud(),
      dormitory: fullCrud(),
      media: fullCrud(),
      users: fullCrud(),
      data_science: fullCrud(),
      settings: fullCrud(),
      mi: fullCrud(),
      mts: fullCrud(),
      tpq: fullCrud(),
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ketua_ranting",
    name: "Ketua Ranting",
    description: "Pimpinan tertinggi Ranting Darul Khidmah Sidogiri Bekasi. Wewenang pengawasan eksekutif, rekapitulasi data santri, asatidz, keuangan, dan kebijakan umum.",
    level: "Manajerial",
    badgeColor: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30",
    permissions: {
      modules: true,
      students: true,
      teachers: true,
      parents: true,
      dormitory: true,
      media: true,
      users: false, // Tidak bisa akses manajemen pengguna
      data_science: true,
      settings: true,
      mi: true,
      mts: true,
      tpq: true,
    },
    crudPermissions: {
      modules: readOnly(),
      students: readEdit(),
      teachers: readEdit(),
      parents: readEdit(),
      dormitory: readEdit(),
      media: readWrite(),
      users: noAccess(),
      data_science: readEdit(),
      settings: readOnly(),
      mi: readEdit(),
      mts: readEdit(),
      tpq: readEdit(),
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "staf_administrasi",
    name: "Staf Administrasi",
    description: "Staf administrasi dan ketatausahaan santri, inventaris sarana prasarana asrama, serta dokumentasi & logistik harian.",
    level: "Operasional",
    badgeColor: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
    permissions: {
      modules: true,
      students: true,
      teachers: true,
      parents: true,
      dormitory: true,
      media: true,
      users: false, // Tidak bisa akses manajemen pengguna
      data_science: false,
      settings: false,
      mi: true,
      mts: true,
      tpq: true,
    },
    crudPermissions: {
      modules: readOnly(),
      students: readWrite(),
      teachers: readOnly(),
      parents: readWrite(),
      dormitory: readWrite(),
      media: readWrite(),
      users: noAccess(),
      data_science: noAccess(),
      settings: noAccess(),
      mi: readWrite(),
      mts: readWrite(),
      tpq: readWrite(),
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "dewan_asatidz",
    name: "Dewan Asatidz",
    description: "Guru dan pengajar Madrasah Miftahul Ulum & TPQ. Mengakses buku induk santri, absensi, dan data wali santri.",
    level: "Akademik",
    badgeColor: "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30",
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
      mi: true,
      mts: true,
      tpq: true,
    },
    crudPermissions: {
      modules: readOnly(),
      students: readEdit(),
      teachers: readOnly(),
      parents: readOnly(),
      dormitory: noAccess(),
      media: noAccess(),
      users: noAccess(),
      data_science: noAccess(),
      settings: noAccess(),
      mi: readEdit(),
      mts: readEdit(),
      tpq: readEdit(),
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wali_santri",
    name: "Wali Santri",
    description: "Orang tua atau wali sah santri. Memantau progres hafalan, rekam asrama, dan informasi pengumuman ranting.",
    level: "Keluarga",
    badgeColor: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
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
      mi: true,
      mts: true,
      tpq: true,
    },
    crudPermissions: {
      modules: readOnly(),
      students: readOnly(),
      teachers: noAccess(),
      parents: noAccess(),
      dormitory: readOnly(),
      media: readOnly(),
      users: noAccess(),
      data_science: noAccess(),
      settings: noAccess(),
      mi: readOnly(),
      mts: readOnly(),
      tpq: readOnly(),
    },
    updatedAt: new Date().toISOString(),
  },
];

export function buildFallbackCrud(
  roleId: string,
  perms: Record<string, boolean | undefined> | Partial<RolePermission["permissions"]>,
  existing?: Record<string, CrudActionPermissions>
): Record<string, CrudActionPermissions> {
  const result: Record<string, CrudActionPermissions> = {};
  const norm = normalizeRoleId(roleId);

  for (const key of MODULE_KEYS) {
    if (existing && existing[key]) {
      result[key] = {
        create: Boolean(existing[key].create),
        read: Boolean(existing[key].read),
        update: Boolean(existing[key].update),
        delete: Boolean(existing[key].delete),
      };
      continue;
    }

    const isAllowed = Boolean(perms[key]);
    if (!isAllowed) {
      result[key] = noAccess();
      continue;
    }

    if (norm === "super_admin") {
      result[key] = fullCrud();
    } else if (norm === "ketua_ranting") {
      result[key] = key === "media" ? readWrite() : readEdit();
    } else if (norm === "staf_administrasi") {
      result[key] =
        key === "dormitory" ||
        key === "media" ||
        key === "parents" ||
        key === "students" ||
        key === "mi" ||
        key === "mts" ||
        key === "tpq"
          ? readWrite()
          : readOnly();
    } else if (norm === "dewan_asatidz") {
      result[key] =
        key === "students" || key === "mi" || key === "mts" || key === "tpq"
          ? readEdit()
          : readOnly();
    } else {
      result[key] = readOnly();
    }
  }

  return result;
}
