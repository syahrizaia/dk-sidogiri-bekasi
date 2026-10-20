"use server";

import "server-only";
import { getDatabase } from "@/lib/mongodb";
import { verifyUserPermission } from "@/lib/actions/roles";
import { ObjectId } from "mongodb";
import { serializeData } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export type TransactionType = "income" | "expense";
export type TransactionCategory = "syahriyah" | "asrama" | "kitab" | "operasional" | "infaq" | "lainnya";
export type PaymentStatus = "paid" | "pending" | "cancelled";
export type PaymentMethod = "transfer" | "tunai" | "qris";

export interface FinanceTransaction {
  id: string;
  _id?: string;
  invoiceNo: string;
  title: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  santriNis?: string;
  santriName?: string;
  payerName: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  date: string;
  notes?: string;
  recordedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FinanceOverviewData {
  totalBalance: number;
  totalIncomeMonth: number;
  totalExpenseMonth: number;
  totalPendingInvoices: number;
  pendingCount: number;
  paidCount: number;
  transactions: FinanceTransaction[];
}

const defaultTransactions: Omit<FinanceTransaction, "id">[] = [
  {
    invoiceNo: "INV/2026/04/001",
    title: "Syahriyah (SPP) Periode April 2026 - Ahmad Fawaid",
    type: "income",
    category: "syahriyah",
    amount: 350000,
    santriNis: "2024.11.001",
    santriName: "Ahmad Fawaid",
    payerName: "H. Abdullah Syukri",
    paymentMethod: "transfer",
    status: "paid",
    date: "2026-04-02",
    notes: "Pembayaran iuran syahriyah MI Miftahul Ulum Kelas 6",
    recordedBy: "Staf Administrasi",
    createdAt: new Date("2026-04-02T08:30:00Z").toISOString(),
  },
  {
    invoiceNo: "INV/2026/04/002",
    title: "Iuran Asrama Sayyid Sulaiman - Zainal Abidin",
    type: "income",
    category: "asrama",
    amount: 450000,
    santriNis: "2024.11.003",
    santriName: "Zainal Abidin",
    payerName: "Hj. Siti Aminah",
    paymentMethod: "qris",
    status: "paid",
    date: "2026-04-03",
    notes: "Biaya katering dan pemeliharaan kamar Blok B 12",
    recordedBy: "Staf Administrasi",
    createdAt: new Date("2026-04-03T10:15:00Z").toISOString(),
  },
  {
    invoiceNo: "INV/2026/04/003",
    title: "Pengadaan Kitab Kuning Fathul Qorib & Jurumiyah",
    type: "expense",
    category: "kitab",
    amount: 2450000,
    payerName: "Penerbit Sidogiri Pasuruan",
    paymentMethod: "transfer",
    status: "paid",
    date: "2026-04-05",
    notes: "Pengiriman 50 eksemplar kitab standar majlis tarbiyah",
    recordedBy: "Staf Administrasi",
    createdAt: new Date("2026-04-05T14:20:00Z").toISOString(),
  },
  {
    invoiceNo: "INV/2026/04/004",
    title: "Infaq Pembangunan Asrama Santri Tahfidz",
    type: "income",
    category: "infaq",
    amount: 5000000,
    payerName: "Hamba Allah (Alumni Sidogiri Bekasi)",
    paymentMethod: "transfer",
    status: "paid",
    date: "2026-04-07",
    notes: "Wakaf tunai renovasi fasilitas asrama putra",
    recordedBy: "Ketua Ranting",
    createdAt: new Date("2026-04-07T09:00:00Z").toISOString(),
  },
  {
    invoiceNo: "INV/2026/04/005",
    title: "Syahriyah (SPP) Periode April 2026 - Fauzan Nur Rahmat",
    type: "income",
    category: "syahriyah",
    amount: 350000,
    santriNis: "2024.11.005",
    santriName: "Fauzan Nur Rahmat",
    payerName: "Ir. H. Gunawan",
    paymentMethod: "transfer",
    status: "pending",
    date: "2026-04-08",
    notes: "Menunggu konfirmasi mutasi rekening bank",
    recordedBy: "Staf Administrasi",
    createdAt: new Date("2026-04-08T11:45:00Z").toISOString(),
  },
  {
    invoiceNo: "INV/2026/04/006",
    title: "Operasional Kelistrikan & Air Bersih Kompleks",
    type: "expense",
    category: "operasional",
    amount: 1850000,
    payerName: "PLN & PDAM Kota Bekasi",
    paymentMethod: "transfer",
    status: "paid",
    date: "2026-04-10",
    notes: "Tagihan rutin bulanan fasilitas asrama dan madrasah",
    recordedBy: "Staf Administrasi",
    createdAt: new Date("2026-04-10T16:00:00Z").toISOString(),
  },
  {
    invoiceNo: "INV/2026/04/007",
    title: "Iuran Tartil Al-Qur'an TPQ - Hasan Bisri",
    type: "income",
    category: "syahriyah",
    amount: 150000,
    santriNis: "2024.11.008",
    santriName: "Hasan Bisri",
    payerName: "Bpk. Sukron Ma'mun",
    paymentMethod: "tunai",
    status: "paid",
    date: "2026-04-12",
    notes: "Pembayaran langsung di kantor administrasi ranting",
    recordedBy: "Staf Administrasi",
    createdAt: new Date("2026-04-12T17:10:00Z").toISOString(),
  },
  {
    invoiceNo: "INV/2026/04/008",
    title: "Bisarah & Honorarium Dewan Asatidz Bulan April",
    type: "expense",
    category: "operasional",
    amount: 4500000,
    payerName: "Dewan Asatidz Sidogiri",
    paymentMethod: "transfer",
    status: "paid",
    date: "2026-04-15",
    notes: "Bisarah khidmah asatidz pengampu MI & TPQ",
    recordedBy: "Ketua Ranting",
    createdAt: new Date("2026-04-15T09:30:00Z").toISOString(),
  },
  {
    invoiceNo: "INV/2026/04/009",
    title: "Syahriyah (SPP) Periode April 2026 - Ali Zainal Musthofa",
    type: "income",
    category: "syahriyah",
    amount: 350000,
    santriNis: "2024.11.007",
    santriName: "Ali Zainal Musthofa",
    payerName: "H. Abdul Wahab",
    paymentMethod: "transfer",
    status: "pending",
    date: "2026-04-16",
    notes: "Tagihan terkirim ke wali santri",
    recordedBy: "Staf Administrasi",
    createdAt: new Date("2026-04-16T13:00:00Z").toISOString(),
  },
  {
    invoiceNo: "INV/2026/04/010",
    title: "Paket Seragam & Atribut Santri Baru MI Miftahul Ulum",
    type: "income",
    category: "kitab",
    amount: 650000,
    santriNis: "2024.11.002",
    santriName: "Muhammad Lutfi Hakim",
    payerName: "Ust. Miftahul Huda",
    paymentMethod: "qris",
    status: "paid",
    date: "2026-04-18",
    notes: "Pakaian seragam putih hijau & peci khas Sidogiri",
    recordedBy: "Staf Administrasi",
    createdAt: new Date("2026-04-18T10:40:00Z").toISOString(),
  },
];

async function ensureSeedData() {
  const db = await getDatabase();
  const collection = db.collection("finance_transactions");
  const count = await collection.countDocuments();
  if (count === 0) {
    await collection.insertMany(defaultTransactions as any);
  }
}

export async function getFinanceOverviewAction(): Promise<{
  success: boolean;
  data?: FinanceOverviewData;
  error?: string;
}> {
  try {
    const auth = await verifyUserPermission("finance", "read");
    if (!auth.allowed) {
      return { success: false, error: auth.error || "Akses ditolak ke modul Keuangan & Tagihan." };
    }

    await ensureSeedData();
    const db = await getDatabase();
    const collection = db.collection("finance_transactions");

    const rawList = await collection.find({}).sort({ date: -1, createdAt: -1 }).toArray();

    const transactions: FinanceTransaction[] = rawList.map((doc) => ({
      id: doc._id.toString(),
      _id: doc._id.toString(),
      invoiceNo: doc.invoiceNo,
      title: doc.title,
      type: doc.type,
      category: doc.category,
      amount: Number(doc.amount) || 0,
      santriNis: doc.santriNis,
      santriName: doc.santriName,
      payerName: doc.payerName,
      paymentMethod: doc.paymentMethod || "transfer",
      status: doc.status || "paid",
      date: doc.date || new Date().toISOString().split("T")[0],
      notes: doc.notes || "",
      recordedBy: doc.recordedBy || "Petugas Keuangan",
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: doc.updatedAt,
    }));

    let totalIncomePaid = 0;
    let totalExpensePaid = 0;
    let totalPendingInvoices = 0;
    let pendingCount = 0;
    let paidCount = 0;

    for (const t of transactions) {
      if (t.status === "paid") {
        paidCount++;
        if (t.type === "income") {
          totalIncomePaid += t.amount;
        } else if (t.type === "expense") {
          totalExpensePaid += t.amount;
        }
      } else if (t.status === "pending" && t.type === "income") {
        pendingCount++;
        totalPendingInvoices += t.amount;
      }
    }

    const totalBalance = totalIncomePaid - totalExpensePaid;

    return {
      success: true,
      data: serializeData({
        totalBalance,
        totalIncomeMonth: totalIncomePaid,
        totalExpenseMonth: totalExpensePaid,
        totalPendingInvoices,
        pendingCount,
        paidCount,
        transactions,
      }),
    };
  } catch (err) {
    console.error("Error in getFinanceOverviewAction:", err);
    return { success: false, error: "Gagal memuat ikhtisar keuangan dan tagihan." };
  }
}

export async function createFinanceTransactionAction(
  data: Omit<FinanceTransaction, "id" | "createdAt">
): Promise<{ success: boolean; data?: FinanceTransaction; error?: string }> {
  try {
    const auth = await verifyUserPermission("finance", "create");
    if (!auth.allowed) {
      return { success: false, error: auth.error || "Akses ditolak: Anda tidak memiliki wewenang mencatat transaksi." };
    }

    if (!data.title || !data.amount || data.amount <= 0 || !data.payerName) {
      return { success: false, error: "Judul transaksi, nominal, dan nama pembayar/penerima wajib diisi dengan benar." };
    }

    const db = await getDatabase();
    const collection = db.collection("finance_transactions");

    // Generate unique invoice number if not provided
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const count = await collection.countDocuments();
    const invSequence = String(count + 1).padStart(3, "0");
    const invoiceNo = data.invoiceNo || `INV/${year}/${month}/${invSequence}`;

    const newDoc = {
      ...data,
      invoiceNo,
      amount: Number(data.amount),
      recordedBy: auth.session?.name || "Petugas Keuangan",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(newDoc as any);

    revalidatePath("/modules/finance");
    revalidatePath("/modules");

    return {
      success: true,
      data: serializeData({
        ...newDoc,
        id: result.insertedId.toString(),
        _id: result.insertedId.toString(),
      }),
    };
  } catch (err) {
    console.error("Error in createFinanceTransactionAction:", err);
    return { success: false, error: "Gagal menyimpan transaksi keuangan." };
  }
}

export async function updateFinanceStatusAction(
  id: string,
  newStatus: PaymentStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await verifyUserPermission("finance", "update");
    if (!auth.allowed) {
      return { success: false, error: auth.error || "Akses ditolak: Anda tidak memiliki wewenang memperbarui status tagihan." };
    }

    if (!ObjectId.isValid(id)) {
      return { success: false, error: "ID transaksi tidak valid." };
    }

    const db = await getDatabase();
    const collection = db.collection("finance_transactions");

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        },
      }
    );

    revalidatePath("/modules/finance");
    return { success: true };
  } catch (err) {
    console.error("Error in updateFinanceStatusAction:", err);
    return { success: false, error: "Gagal memperbarui status transaksi." };
  }
}

export async function deleteFinanceTransactionAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = await verifyUserPermission("finance", "delete");
    if (!auth.allowed) {
      return { success: false, error: auth.error || "Akses ditolak: Hanya peran dengan hak 'delete' yang dapat menghapus transaksi." };
    }

    if (!ObjectId.isValid(id)) {
      return { success: false, error: "ID transaksi tidak valid." };
    }

    const db = await getDatabase();
    const collection = db.collection("finance_transactions");

    await collection.deleteOne({ _id: new ObjectId(id) });

    revalidatePath("/modules/finance");
    return { success: true };
  } catch (err) {
    console.error("Error in deleteFinanceTransactionAction:", err);
    return { success: false, error: "Gagal menghapus transaksi keuangan." };
  }
}
