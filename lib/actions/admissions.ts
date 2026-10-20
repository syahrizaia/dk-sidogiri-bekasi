"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { verifyUserPermission } from "@/lib/actions/roles";
import { ObjectId } from "mongodb";
import { serializeData } from "@/lib/utils";
import { revalidatePath } from "next/cache";

import {
  type AdmissionStatus,
  type FieldInputType,
  type FieldSection,
  type DynamicFormField,
  type AdmissionSettings,
  type PendaftaranPayload,
  type AdmissionRecord,
  type AdmissionsOverviewData,
  defaultAdmissionSettings,
  defaultAdmissions,
} from "@/lib/admissions-config";



async function ensureSeedAdmissions() {
  const db = await getDatabase();
  const collection = db.collection("admissions");
  const count = await collection.countDocuments();
  if (count === 0) {
    await collection.insertMany(defaultAdmissions as any);
  }
}

async function ensureAdmissionSettings(): Promise<AdmissionSettings> {
  const db = await getDatabase();
  const collection = db.collection("admission_settings");
  let doc = await collection.findOne({ id: "default_admission_settings" });
  if (!doc) {
    await collection.insertOne({ ...defaultAdmissionSettings });
    return defaultAdmissionSettings;
  }
  if (!doc.announcements || !Array.isArray(doc.announcements)) {
    doc.announcements = defaultAdmissionSettings.announcements || [];
  }
  return doc as unknown as AdmissionSettings;
}

/**
 * Mengambil pengaturan publik & form dinamis penerimaan santri baru
 */
export async function getAdmissionSettingsAction(): Promise<{
  success: boolean;
  data?: AdmissionSettings;
  error?: string;
}> {
  try {
    const settings = await ensureAdmissionSettings();
    return {
      success: true,
      data: serializeData(settings),
    };
  } catch (error) {
    console.error("Error in getAdmissionSettingsAction:", error);
    return {
      success: false,
      error: "Gagal memuat pengaturan pendaftaran santri baru.",
    };
  }
}

/**
 * Memperbarui pengaturan publik & form dinamis (RBAC Protected: Super Admin, Ketua Ranting, Staf)
 */
export async function updateAdmissionSettingsAction(
  payload: Partial<AdmissionSettings>
): Promise<{ success: boolean; message?: string; data?: AdmissionSettings; error?: string }> {
  try {
    const auth = await verifyUserPermission("admissions", "update");
    if (!auth.allowed) {
      return {
        success: false,
        error: auth.error || "Akses ditolak: Anda tidak memiliki hak untuk mengubah pengaturan pendaftaran.",
      };
    }

    const db = await getDatabase();
    const collection = db.collection("admission_settings");

    const updateDoc: Record<string, any> = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.session?.name || auth.session?.email || "Admin",
    };
    delete updateDoc._id;
    delete updateDoc.id;

    await collection.updateOne(
      { id: "default_admission_settings" },
      { $set: updateDoc },
      { upsert: true }
    );

    const updated = await ensureAdmissionSettings();

    revalidatePath("/modules/admissions");
    revalidatePath("/admissions");

    return {
      success: true,
      message: "Pengaturan halaman dan formulir pendaftaran berhasil diperbarui.",
      data: serializeData(updated),
    };
  } catch (error) {
    console.error("Error in updateAdmissionSettingsAction:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat menyimpan pengaturan pendaftaran.",
    };
  }
}

/**
 * Membaca seluruh data pendaftaran santri baru terproteksi RBAC
 * Akses eksklusif: super_admin, ketua_ranting, staf_administrasi
 */
export async function getAdmissionsAction(filters?: {
  search?: string;
  jenjang?: string;
  status?: string;
  statusMukim?: string;
}): Promise<{
  success: boolean;
  data?: AdmissionsOverviewData;
  error?: string;
  userRole?: string;
}> {
  try {
    const auth = await verifyUserPermission("admissions", "read");
    if (!auth.allowed) {
      return {
        success: false,
        error: auth.error || "Akses ditolak: Anda tidak memiliki wewenang untuk mengakses Modul Pendaftaran Santri Baru.",
      };
    }

    await ensureSeedAdmissions();
    const db = await getDatabase();
    const collection = db.collection("admissions");

    const query: Record<string, any> = {};

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      query.$or = [
        { namaLengkap: { $regex: q, $options: "i" } },
        { regId: { $regex: q, $options: "i" } },
        { nik: { $regex: q, $options: "i" } },
        { namaAyah: { $regex: q, $options: "i" } },
        { namaIbu: { $regex: q, $options: "i" } },
        { noWhatsApp: { $regex: q, $options: "i" } },
        { kotaKab: { $regex: q, $options: "i" } },
        { asalSekolah: { $regex: q, $options: "i" } },
      ];
    }

    if (filters?.jenjang && filters.jenjang !== "ALL") {
      query.jenjang = { $regex: filters.jenjang, $options: "i" };
    }

    if (filters?.status && filters.status !== "ALL") {
      query.statusPendaftaran = filters.status;
    }

    if (filters?.statusMukim && filters.statusMukim !== "ALL") {
      query.statusMukim = { $regex: filters.statusMukim, $options: "i" };
    }

    const rawList = await collection.find(query).sort({ createdAt: -1 }).toArray();

    // Kalkulasi KPI ringkasan
    const allRecords = await collection.find({}).toArray();
    let totalOnline = 0;
    let totalVerified = 0;
    let totalAccepted = 0;
    let totalRejected = 0;

    for (const item of allRecords) {
      const st = item.statusPendaftaran || "TERDAFTAR_ONLINE";
      if (st === "TERDAFTAR_ONLINE") totalOnline++;
      else if (st === "VERIFIKASI_BERKAS") totalVerified++;
      else if (st === "LULUS_SELEKSI") totalAccepted++;
      else if (st === "DITOLAK") totalRejected++;
    }

    const formattedItems: AdmissionRecord[] = rawList.map((doc) => ({
      id: doc._id.toString(),
      _id: doc._id.toString(),
      regId: doc.regId || `DKS-${doc._id.toString().slice(-4)}`,
      namaLengkap: doc.namaLengkap || "Tanpa Nama",
      nik: doc.nik || "",
      tempatLahir: doc.tempatLahir || "",
      tanggalLahir: doc.tanggalLahir || "",
      jenisKelamin: doc.jenisKelamin || "Laki-laki",
      namaAyah: doc.namaAyah || "",
      namaIbu: doc.namaIbu || "",
      noWhatsApp: doc.noWhatsApp || "",
      provinsi: doc.provinsi || "Jawa Barat",
      kotaKab: doc.kotaKab || "Bekasi",
      alamatLengkap: doc.alamatLengkap || "",
      konsulat: doc.konsulat || "Jabodetabek",
      jenjang: doc.jenjang || "MI",
      statusMukim: doc.statusMukim || "SANTRI",
      catatanKhusus: doc.catatanKhusus || "",
      asalSekolah: doc.asalSekolah || "",
      statusPendaftaran: (doc.statusPendaftaran as AdmissionStatus) || "TERDAFTAR_ONLINE",
      catatanAdmin: doc.catatanAdmin || "",
      verifiedBy: doc.verifiedBy || "",
      dynamicResponses: doc.dynamicResponses || {},
      updatedAt: doc.updatedAt || "",
      createdAt: doc.createdAt || new Date().toISOString(),
    }));

    return {
      success: true,
      data: serializeData({
        totalApplicants: allRecords.length,
        totalOnline,
        totalVerified,
        totalAccepted,
        totalRejected,
        items: formattedItems,
      }),
      userRole: auth.session?.role,
    };
  } catch (error) {
    console.error("Error in getAdmissionsAction:", error);
    return { success: false, error: "Gagal mengambil data pendaftaran santri baru." };
  }
}

/**
 * Memperbarui status verifikasi calon santri
 * Akses eksklusif: super_admin, ketua_ranting, staf_administrasi
 */
export async function updateAdmissionStatusAction(
  id: string,
  newStatus: AdmissionStatus,
  adminNotes?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const auth = await verifyUserPermission("admissions", "update");
    if (!auth.allowed) {
      return { success: false, error: auth.error || "Akses ditolak: Anda tidak memiliki hak untuk memperbarui status berkas." };
    }

    if (!id) {
      return { success: false, error: "ID pendaftaran tidak valid." };
    }

    const validStatuses: AdmissionStatus[] = ["TERDAFTAR_ONLINE", "VERIFIKASI_BERKAS", "LULUS_SELEKSI", "DITOLAK"];
    if (!validStatuses.includes(newStatus)) {
      return { success: false, error: "Status pendaftaran yang dipilih tidak valid." };
    }

    const db = await getDatabase();
    const collection = db.collection("admissions");

    let query: Record<string, any> = { regId: id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { regId: id }] };
    }

    const updateDoc: Record<string, any> = {
      statusPendaftaran: newStatus,
      updatedAt: new Date().toISOString(),
      verifiedBy: auth.session?.name || auth.session?.email || "Staf Administrasi",
    };

    if (adminNotes !== undefined) {
      updateDoc.catatanAdmin = adminNotes;
    }

    const result = await collection.updateOne(query, { $set: updateDoc });

    if (result.matchedCount === 0) {
      return { success: false, error: "Data pendaftaran calon santri tidak ditemukan." };
    }

    revalidatePath("/modules/admissions");
    return { success: true, message: `Status berhasil diubah menjadi ${newStatus}.` };
  } catch (error) {
    console.error("Error in updateAdmissionStatusAction:", error);
    return { success: false, error: "Terjadi gangguan saat memperbarui status pendaftaran." };
  }
}

/**
 * Menambahkan data pendaftar baru secara manual dari panel internal
 * Akses: super_admin, staf_administrasi
 */
export async function createAdmissionAction(
  payload: PendaftaranPayload & { statusPendaftaran?: AdmissionStatus; catatanAdmin?: string }
): Promise<{ success: boolean; message?: string; data?: any; error?: string }> {
  try {
    const auth = await verifyUserPermission("admissions", "create");
    if (!auth.allowed) {
      return { success: false, error: auth.error || "Akses ditolak: Anda tidak memiliki hak menambah data pendaftaran." };
    }

    if (!payload.namaLengkap?.trim() || !payload.jenjang) {
      return { success: false, error: "Nama lengkap calon santri dan jenjang pendidikan wajib diisi." };
    }

    if (typeof payload.jenjang === "string" && payload.jenjang.toUpperCase().includes("MA")) {
      return {
        success: false,
        error: "Jenjang MA tidak diselenggarakan di Darul Khidmah Sidogiri Bekasi. Pilihan tersedia: MI, MTs (Persiapan), dan TPQ.",
      };
    }

    const regId = `DKS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    const record = {
      regId,
      ...payload,
      statusPendaftaran: payload.statusPendaftaran || "TERDAFTAR_ONLINE",
      catatanAdmin: payload.catatanAdmin || "Didaftarkan manual oleh administrator cabang.",
      verifiedBy: auth.session?.name || "Staf Administrasi",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const db = await getDatabase();
    const collection = db.collection("admissions");
    const result = await collection.insertOne(record);

    revalidatePath("/modules/admissions");
    return {
      success: true,
      message: `Pendaftar ${payload.namaLengkap} berhasil dicatat dengan No. Registrasi ${regId}.`,
      data: serializeData({
        id: result.insertedId.toString(),
        ...record,
      }),
    };
  } catch (error) {
    console.error("Error in createAdmissionAction:", error);
    return { success: false, error: "Terjadi kesalahan saat menambahkan pendaftaran baru." };
  }
}

/**
 * Menghapus data pendaftaran calon santri
 * Akses eksklusif: super_admin
 */
export async function deleteAdmissionAction(
  id: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const auth = await verifyUserPermission("admissions", "delete");
    if (!auth.allowed) {
      return { success: false, error: auth.error || "Akses ditolak: Hanya Super Admin yang berhak menghapus berkas pendaftaran." };
    }

    if (!id) {
      return { success: false, error: "ID pendaftaran tidak valid." };
    }

    const db = await getDatabase();
    const collection = db.collection("admissions");

    let query: Record<string, any> = { regId: id };
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { regId: id }] };
    }

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      return { success: false, error: "Data pendaftaran tidak ditemukan atau sudah terhapus." };
    }

    revalidatePath("/modules/admissions");
    return { success: true, message: "Data pendaftaran berhasil dihapus dari sistem." };
  } catch (error) {
    console.error("Error in deleteAdmissionAction:", error);
    return { success: false, error: "Terjadi kesalahan saat menghapus data pendaftaran." };
  }
}

/**
 * Public submission action - Dipanggil oleh formulir publik dari calon wali santri
 */
export async function submitPendaftaranAction(payload: PendaftaranPayload) {
  try {
    // 1. Cek apakah penerimaan sedang dibuka di pengaturan
    const settings = await ensureAdmissionSettings();
    if (!settings.isOpen) {
      return {
        success: false,
        error: settings.closedMessage || "Pendaftaran santri baru saat ini sedang ditutup.",
      };
    }

    if (!payload.namaLengkap || !payload.namaLengkap.trim()) {
      return { success: false, error: "Nama lengkap calon santri wajib diisi." };
    }

    if (typeof payload.jenjang === "string" && payload.jenjang.toUpperCase().includes("MA")) {
      return {
        success: false,
        error: "Jenjang Madrasah Aliyah (MA) tidak dibuka di Darul Khidmah Sidogiri Bekasi. Pilihan tersedia: MI, MTs (Persiapan), dan TPQ.",
      };
    }

    const regId = `DKS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    const record = {
      regId,
      ...payload,
      statusPendaftaran: "TERDAFTAR_ONLINE",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const db = await getDatabase();
    const collection = db.collection("admissions");
    const result = await collection.insertOne(record);

    revalidatePath("/modules/admissions");
    revalidatePath("/admissions");

    return {
      success: true,
      message: "Pendaftaran santri baru berhasil dikirim.",
      data: serializeData({
        id: result.insertedId.toString(),
        regId,
        namaLengkap: payload.namaLengkap,
        jenjang: payload.jenjang,
        statusPendaftaran: "TERDAFTAR_ONLINE",
      }),
    };
  } catch (error) {
    console.error("Error in submitPendaftaranAction:", error);
    return { success: false, error: "Terjadi gangguan saat memproses formulir pendaftaran." };
  }
}
