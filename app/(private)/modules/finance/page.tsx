"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  WalletCards, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Download, 
  Search, 
  FileText, 
  Printer, 
  Trash2, 
  X, 
  ShieldCheck,
  Building,
  User,
  CreditCard,
  Banknote,
  QrCode
} from "lucide-react";
import { exportCorporateCSV } from "@/lib/export-utils";
import { getCurrentUserAction } from "@/lib/actions/auth";
import { getUserPermissionsAction, type UserPermissionsResult } from "@/lib/actions/roles";
import { 
  getFinanceOverviewAction, 
  createFinanceTransactionAction, 
  updateFinanceStatusAction, 
  deleteFinanceTransactionAction,
  type FinanceTransaction, 
  type FinanceOverviewData,
  type TransactionType,
  type TransactionCategory,
  type PaymentStatus,
  type PaymentMethod
} from "@/lib/actions/finance";

export default function FinanceBillingPage() {
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [userPermissions, setUserPermissions] = useState<UserPermissionsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<FinanceOverviewData | null>(null);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [receiptTransaction, setReceiptTransaction] = useState<FinanceTransaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    type: "income" as TransactionType,
    category: "syahriyah" as TransactionCategory,
    amount: "",
    payerName: "",
    santriNis: "",
    santriName: "",
    paymentMethod: "transfer" as PaymentMethod,
    status: "paid" as PaymentStatus,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [user, permsRes, financeRes] = await Promise.all([
        getCurrentUserAction(),
        getUserPermissionsAction(),
        getFinanceOverviewAction(),
      ]);

      if (user?.role) {
        const norm = user.role.toLowerCase();
        setCurrentUserRole(norm);
        // Strict guard: hanya super_admin, ketua_ranting, dan staf_administrasi
        const allowedRoles = ["super_admin", "ketua_ranting", "staf_administrasi", "admin", "ketua", "staff", "staf"];
        if (!allowedRoles.includes(norm)) {
          router.replace("/modules?error=unauthorized");
          return;
        }
      }

      if (permsRes.success && permsRes.data) {
        setUserPermissions(permsRes.data);
        if (!permsRes.data.permissions.finance && !permsRes.data.isSuperAdmin) {
          router.replace("/modules?error=unauthorized");
          return;
        }
      }

      if (financeRes.success && financeRes.data) {
        setOverview(financeRes.data);
        setTransactions(financeRes.data.transactions);
      } else if (financeRes.error) {
        setFeedback({ type: "error", message: financeRes.error });
      }
    } catch (err) {
      console.error("Failed to load finance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CRUD Permissions
  const canCreate = userPermissions?.isSuperAdmin || Boolean(userPermissions?.crudPermissions?.finance?.create);
  const canUpdate = userPermissions?.isSuperAdmin || Boolean(userPermissions?.crudPermissions?.finance?.update);
  const canDelete = userPermissions?.isSuperAdmin || Boolean(userPermissions?.crudPermissions?.finance?.delete);

  // Filtered & Paginated
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.payerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.santriName && t.santriName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.santriNis && t.santriNis.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = filterType === "all" || t.type === filterType;
      const matchStatus = filterStatus === "all" || t.status === filterStatus;
      const matchCategory = filterCategory === "all" || t.category === filterCategory;

      return matchSearch && matchType && matchStatus && matchCategory;
    });
  }, [transactions, searchQuery, filterType, filterStatus, filterCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.payerName) {
      alert("Mohon lengkapi judul transaksi, nominal, dan nama pembayar/penerima.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createFinanceTransactionAction({
        invoiceNo: "",
        title: formData.title,
        type: formData.type,
        category: formData.category,
        amount: Number(formData.amount),
        payerName: formData.payerName,
        santriNis: formData.santriNis || undefined,
        santriName: formData.santriName || undefined,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        date: formData.date,
        notes: formData.notes || undefined,
      });

      if (res.success && res.data) {
        setShowAddModal(false);
        setFormData({
          title: "",
          type: "income",
          category: "syahriyah",
          amount: "",
          payerName: "",
          santriNis: "",
          santriName: "",
          paymentMethod: "transfer",
          status: "paid",
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        setFeedback({ type: "success", message: "Transaksi berhasil dicatat dan masuk ke buku kas." });
        await loadData();
        setTimeout(() => setFeedback(null), 3000);
      } else {
        alert(res.error || "Gagal mencatat transaksi.");
      }
    } catch {
      alert("Terjadi gangguan saat menyimpan transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (transaction: FinanceTransaction) => {
    if (!canUpdate) return;
    const nextStatus: PaymentStatus = transaction.status === "paid" ? "pending" : "paid";
    try {
      const res = await updateFinanceStatusAction(transaction.id, nextStatus);
      if (res.success) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === transaction.id ? { ...t, status: nextStatus } : t))
        );
        loadData();
      } else {
        alert(res.error || "Gagal memperbarui status transaksi.");
      }
    } catch {
      alert("Gagal menghubungi server.");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!canDelete) return;
    if (!window.confirm("Apakah Anda yakin ingin menghapus catatan transaksi ini secara permanen?")) {
      return;
    }

    try {
      const res = await deleteFinanceTransactionAction(id);
      if (res.success) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        loadData();
      } else {
        alert(res.error || "Gagal menghapus transaksi.");
      }
    } catch {
      alert("Terjadi kesalahan sistem.");
    }
  };

  const handleExportCSV = () => {
    if (!filteredTransactions.length) return;
    exportCorporateCSV({
      filename: `Laporan_Keuangan_DK_Sidogiri`,
      title: "Laporan Rekapitulasi Kas & Transaksi Keuangan",
      subtitle: "Buku Kas Terpadu Darul Khidmah Sidogiri Bekasi",
      metadata: {
        "Filter Arus Kas": filterType === "ALL" ? "Semua Transaksi (Pemasukan & Pengeluaran)" : filterType.toUpperCase(),
        "Filter Kategori": filterCategory === "ALL" ? "Semua Kategori Akun" : filterCategory.toUpperCase(),
        "Filter Status": filterStatus === "ALL" ? "Semua Status Pembayaran" : filterStatus.toUpperCase(),
        "Total Saldo Bersih": formatRupiah(filteredTransactions.reduce((acc, t) => acc + (t.type === "income" ? t.amount : -t.amount), 0)),
      },
      columns: [
        { header: "No", accessor: (_, idx) => idx + 1 },
        { header: "Nomor Kwitansi", accessor: "invoiceNo", isNumericId: true },
        { header: "Tanggal", accessor: "date" },
        { header: "Klasifikasi", accessor: (t) => t.type === "income" ? "Pemasukan (Kas Masuk)" : "Pengeluaran (Kas Keluar)" },
        { header: "Kategori", accessor: (t) => t.category.toUpperCase() },
        { header: "Deskripsi Transaksi", accessor: "title" },
        { header: "Nominal (Rp)", accessor: (t) => t.amount },
        { header: "Pembayar / Penerima", accessor: "payerName" },
        { header: "Santri Terkait (NIS)", accessor: (t) => t.santriName ? `${t.santriName} (${t.santriNis || "-"})` : "-" },
        { header: "Metode Bayar", accessor: (t) => t.paymentMethod.toUpperCase() },
        { header: "Status", accessor: (t) => t.status === "paid" ? "LUNAS" : "MENUNGGU" },
        { header: "Dicatat Oleh", accessor: (t) => t.recordedBy || "-" },
      ],
      data: filteredTransactions,
    });
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="w-full transition-colors duration-400 py-6 sm:py-8">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
        
        {/* Navigation Breadcrumb & Access Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link 
            href="/modules" 
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full liquid-glass-pill text-muted-foreground hover:text-foreground transition-all duration-300 w-fit cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Modul Sistem</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Akses Khusus: Super Admin • Ketua Ranting • Staf Administrasi</span>
            </div>
          </div>
        </div>

        {/* Hero Banner Header */}
        <div className="relative rounded-[32px] overflow-hidden liquid-glass-elevated border border-white/60 dark:border-white/10 p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/15">
                  Biro Administrasi & Keuangan
                </span>
                <span className="text-xs text-muted-foreground">Darul Khidmah Sidogiri Bekasi</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                <span>Keuangan & Tagihan Santri</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Pengelolaan arus kas operasional madrasah, rekapitulasi iuran syahriyah (SPP), asrama santri mukim, dan penerbitan kwitansi pembayaran resmi terintegrasi MongoDB Atlas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:bg-white/40 transition-all cursor-pointer active:scale-95"
                title="Unduh seluruh mutasi transaksi sebagai file CSV"
              >
                <Download size={14} />
                <span>Export Laporan (CSV)</span>
              </button>

              {canCreate && (
                <button 
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-600 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
                >
                  <Plus size={14} />
                  <span>Catat Transaksi Baru</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between animate-in fade-in ${
            feedback.type === "success" 
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-900 dark:text-emerald-200" 
              : "bg-rose-500/15 border-rose-500/30 text-rose-900 dark:text-rose-200"
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.message}</span>
            </div>
            <button type="button" onClick={() => setFeedback(null)} className="p-1 hover:opacity-70">
              <X size={14} />
            </button>
          </div>
        )}

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Saldo Kas Bersih */}
          <div className="liquid-glass-interactive rounded-3xl p-6 space-y-3 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo Kas Aktif</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <WalletCards size={20} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-foreground">
                {overview ? formatRupiah(overview.totalBalance) : "Rp 0"}
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Terverifikasi</span>
                <span>• Akumulasi kas masuk bersih</span>
              </p>
            </div>
          </div>

          {/* Card 2: Pemasukan Bulan Ini */}
          <div className="liquid-glass-interactive rounded-3xl p-6 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Kas Masuk</span>
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {overview ? formatRupiah(overview.totalIncomeMonth) : "Rp 0"}
              </div>
              <p className="text-[11px] text-muted-foreground">
                SPP, infaq, asrama & wakaf santri
              </p>
            </div>
          </div>

          {/* Card 3: Pengeluaran Operasional */}
          <div className="liquid-glass-interactive rounded-3xl p-6 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Kas Keluar</span>
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                <TrendingDown size={20} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {overview ? formatRupiah(overview.totalExpenseMonth) : "Rp 0"}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Bisarah asatidz, kitab & operasional
              </p>
            </div>
          </div>

          {/* Card 4: Tagihan Belum Lunas */}
          <div className="liquid-glass-interactive rounded-3xl p-6 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tagihan Pending</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Clock size={20} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {overview ? formatRupiah(overview.totalPendingInvoices) : "Rp 0"}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {overview?.pendingCount || 0} tagihan menunggu verifikasi
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="liquid-glass rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Cari kwitansi, nama santri, pembayar..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md pl-11 pr-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all"
              />
            </div>

            {/* Filter Jenis Transaksi */}
            <div>
              <select 
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all cursor-pointer"
              >
                <option value="all">Semua Jenis (Masuk & Keluar)</option>
                <option value="income">Kas Masuk (Pemasukan)</option>
                <option value="expense">Kas Keluar (Pengeluaran)</option>
              </select>
            </div>

            {/* Filter Status Tagihan */}
            <div>
              <select 
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="paid">Lunas (Terverifikasi)</option>
                <option value="pending">Menunggu Pembayaran</option>
              </select>
            </div>

            {/* Filter Kategori */}
            <div>
              <select 
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                <option value="syahriyah">Syahriyah (SPP Santri)</option>
                <option value="asrama">Asrama & Katering</option>
                <option value="kitab">Kitab & Seragam</option>
                <option value="operasional">Operasional & Bisarah</option>
                <option value="infaq">Infaq & Wakaf Pembangunan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          </div>
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="liquid-glass rounded-3xl shadow-xl overflow-hidden border border-border/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-border/40 bg-black/5 dark:bg-white/5 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">No. Kwitansi</th>
                  <th className="px-6 py-4">Tanggal & Uraian</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4">Pembayar / Santri</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-xs text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>Sinkronisasi buku kas dengan MongoDB Atlas...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((item) => (
                    <tr key={item.id} className="hover:bg-emerald-500/5 transition-colors duration-200">
                      <td className="px-6 py-4 font-mono font-semibold text-emerald-800 dark:text-emerald-300">
                        {item.invoiceNo}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground text-xs sm:text-sm">{item.title}</p>
                          <p className="text-[11px] text-muted-foreground">{item.date}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 text-foreground border border-border/40">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold font-mono text-xs sm:text-sm ${
                          item.type === "income" 
                            ? "text-emerald-700 dark:text-emerald-400" 
                            : "text-rose-600 dark:text-rose-400"
                        }`}>
                          {item.type === "income" ? "+" : "-"} {formatRupiah(item.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">{item.payerName}</p>
                          {item.santriName && (
                            <p className="text-[11px] text-muted-foreground">
                              Santri: {item.santriName} ({item.santriNis || "-"})
                            </p>
                          )}
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono uppercase">
                            {item.paymentMethod === "transfer" && <CreditCard size={10} />}
                            {item.paymentMethod === "tunai" && <Banknote size={10} />}
                            {item.paymentMethod === "qris" && <QrCode size={10} />}
                            <span>{item.paymentMethod}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          disabled={!canUpdate}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all ${
                            canUpdate ? "cursor-pointer hover:scale-105 active:scale-95" : "cursor-default"
                          } ${
                            item.status === "paid"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                          }`}
                          title={canUpdate ? "Klik untuk mengubah status pembayaran" : undefined}
                        >
                          {item.status === "paid" ? (
                            <>
                              <CheckCircle2 size={12} />
                              <span>LUNAS</span>
                            </>
                          ) : (
                            <>
                              <Clock size={12} />
                              <span>PENDING</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setReceiptTransaction(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-foreground hover:text-emerald-700 dark:hover:text-emerald-300 transition-all cursor-pointer active:scale-95"
                            title="Buka & Cetak Kwitansi Resmi"
                          >
                            <FileText size={13} />
                            <span>Kwitansi</span>
                          </button>

                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteTransaction(item.id)}
                              className="p-1.5 rounded-full liquid-glass-pill text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-all cursor-pointer"
                              title="Hapus Transaksi"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Tidak ada catatan transaksi yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className="p-4 sm:p-5 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              Menampilkan {paginatedTransactions.length} dari {filteredTransactions.length} transaksi (Halaman {currentPage} dari {totalPages}).
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className={`px-3 py-1 rounded-full liquid-glass-pill transition-all cursor-pointer ${
                  currentPage <= 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-white/40 active:scale-95"
                }`}
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-emerald-600 text-white shadow-md"
                      : "liquid-glass-pill hover:bg-white/40"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className={`px-3 py-1 rounded-full liquid-glass-pill transition-all cursor-pointer ${
                  currentPage >= totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-white/40 active:scale-95"
                }`}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CATAT TRANSAKSI / TAGIHAN BARU                  */}
      {/* ======================================================== */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="relative w-full max-w-lg max-h-[90dvh] flex flex-col rounded-3xl liquid-glass-elevated border border-white/80 dark:border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-foreground">Catat Transaksi Keuangan</h3>
                  <p className="text-xs text-muted-foreground">Pemasukan syahriyah atau pengeluaran operasional</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateTransaction} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-border/40">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "income" })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    formData.type === "income"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Kas Masuk (Pemasukan)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "expense" })}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    formData.type === "expense"
                      ? "bg-rose-600 text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Kas Keluar (Pengeluaran)
                </button>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Uraian / Judul Transaksi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Syahriyah April 2026 - Ahmad Fawaid"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm"
                />
              </div>

              {/* Category & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Kategori Pos *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TransactionCategory })}
                    className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm cursor-pointer"
                  >
                    <option value="syahriyah">Syahriyah (SPP Santri)</option>
                    <option value="asrama">Asrama & Katering</option>
                    <option value="kitab">Kitab & Seragam</option>
                    <option value="operasional">Operasional & Bisarah</option>
                    <option value="infaq">Infaq & Pembangunan</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="350000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm"
                  />
                </div>
              </div>

              {/* Payer Name & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Pembayar / Penerima *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama wali santri / rekanan"
                    value={formData.payerName}
                    onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
                    className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm cursor-pointer"
                  />
                </div>
              </div>

              {/* Optional Santri Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Nama Santri (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Nama santri jika tagihan santri"
                    value={formData.santriName}
                    onChange={(e) => setFormData({ ...formData, santriName: e.target.value })}
                    className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">NIS Santri (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 2024.11.001"
                    value={formData.santriNis}
                    onChange={(e) => setFormData({ ...formData, santriNis: e.target.value })}
                    className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm"
                  />
                </div>
              </div>

              {/* Payment Method & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Metode Pembayaran</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm cursor-pointer"
                  >
                    <option value="transfer">Transfer Bank</option>
                    <option value="tunai">Tunai (Kasir Administrasi)</option>
                    <option value="qris">QRIS Ranting Sidogiri</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Status Pembayaran</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                    className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm cursor-pointer"
                  >
                    <option value="paid">Lunas (Diterima)</option>
                    <option value="pending">Menunggu Konfirmasi (Pending)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan transfer, nomor referensi mutasi bank, dll."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-3.5 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full liquid-glass-pill text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="liquid-sheen inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-600 text-white px-5 py-2 rounded-full text-xs font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: BUKTI KWITANSI RESMI (RECEIPT PRINT VIEW)       */}
      {/* ======================================================== */}
      {receiptTransaction && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setReceiptTransaction(null)}
        >
          <div 
            className="relative w-full max-w-xl max-h-[92dvh] flex flex-col rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-neutral-900 dark:text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Actions */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Bukti Kwitansi Resmi
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-sm"
                  title="Cetak atau simpan sebagai PDF"
                >
                  <Printer size={13} />
                  <span>Cetak / Unduh PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptTransaction(null)}
                  className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto font-sans bg-white text-neutral-900 print:p-0 print:overflow-visible">
              {/* Kop Surat Resmi Pesantren */}
              <div className="border-b-4 border-double border-emerald-800 pb-3 text-center space-y-1">
                <div className="text-[10px] tracking-widest uppercase font-bold text-neutral-600">
                  PONDOK PESANTREN SIDOGIRI • RANTING BEKASI
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase font-serif tracking-tight text-emerald-900">
                  DARUL KHIDMAH SIDOGIRI BEKASI
                </h2>
                <p className="text-[11px] font-medium text-neutral-700">
                  Madrasah Miftahul Ulum (MI &amp; MTs Persiapan) • TPQ Metode Tartil Sidogiri • Asrama Santri
                </p>
                <p className="text-[10px] text-neutral-500">
                  Jl. Lapangan Kranji, Bintara, Bekasi Barat, Kota Bekasi, Jawa Barat 17134 • Telp: 0812-3456-7890 • Website: dksidogiribekasi.vercel.app
                </p>
              </div>

              {/* Title & Document Badge */}
              <div className="text-center py-1">
                <span className="inline-block px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                  BUKTI KWITANSI PEMBAYARAN RESMI
                </span>
              </div>

              {/* Title & Invoice Number */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-b border-neutral-200 pb-3">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">NOMOR KWITANSI</span>
                  <span className="font-mono font-bold text-base text-emerald-800">
                    {receiptTransaction.invoiceNo}
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">TANGGAL TRANSAKSI</span>
                  <span className="font-semibold">{receiptTransaction.date}</span>
                </div>
              </div>

              {/* Receipt Details Table */}
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400">Telah Terima Dari</span>
                  <span className="col-span-2 font-bold">{receiptTransaction.payerName}</span>
                </div>

                {receiptTransaction.santriName && (
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-400">Untuk Santri</span>
                    <span className="col-span-2 font-semibold">
                      {receiptTransaction.santriName} (NIS: {receiptTransaction.santriNis || "-"})
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400">Untuk Pembayaran</span>
                  <span className="col-span-2 font-semibold">{receiptTransaction.title}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400">Kategori & Metode</span>
                  <span className="col-span-2 font-mono uppercase">
                    {receiptTransaction.category} • METODE {receiptTransaction.paymentMethod}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400">Status Pembayaran</span>
                  <span className="col-span-2 font-bold text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>{receiptTransaction.status === "paid" ? "LUNAS DAN DITERIMA" : "MENUNGGU PEMBAYARAN"}</span>
                  </span>
                </div>

                {receiptTransaction.notes && (
                  <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-neutral-400">Keterangan</span>
                    <span className="col-span-2 italic text-neutral-500">{receiptTransaction.notes}</span>
                  </div>
                )}
              </div>

              {/* Total Amount Box */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider">
                    TOTAL NOMINAL DITERIMA
                  </span>
                  <p className="text-2xl font-black font-mono text-emerald-900 dark:text-emerald-200">
                    {formatRupiah(receiptTransaction.amount)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-600/40 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase rotate-12">
                  LUNAS
                </div>
              </div>

              {/* Signature Footer */}
              <div className="pt-6 border-t border-dashed border-neutral-200 flex justify-between items-end text-xs text-neutral-600">
                <div className="text-center space-y-12">
                  <p className="text-[11px] font-medium">Pihak Pembayar / Penerima</p>
                  <div className="border-t border-neutral-400 pt-1 font-bold text-[11px] text-neutral-900 min-w-[140px]">
                    {receiptTransaction.payerName}
                  </div>
                </div>
                <div className="text-center space-y-12">
                  <p className="text-[11px] font-medium">Bekasi, {receiptTransaction.date}<br />Bendahara / Petugas Keuangan</p>
                  <div className="border-t border-neutral-400 pt-1 font-bold text-[11px] text-neutral-900 min-w-[140px]">
                    {receiptTransaction.recordedBy || "Petugas Administrasi"}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
