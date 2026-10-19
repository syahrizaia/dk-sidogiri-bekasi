"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  getDormitoriesAction, 
  createDormitoryAction, 
  allocateResidentAction,
  updateDormitoryAction 
} from "@/lib/actions/dormitory";
import { getUserPermissionsAction } from "@/lib/actions/roles";
import {
  Building2,
  Users,
  BedDouble,
  ShieldCheck,
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  UserCheck,
  DoorOpen,
  ArrowLeft,
  Pencil,
} from "lucide-react";

interface Resident {
  nis: string;
  name: string;
  class: string;
}

interface DormitoryRoom {
  _id: string;
  roomNumber: string;
  roomName: string;
  complex: "Asrama Sayyid Sulaiman" | "Asrama Kiai Aminullah";
  floor: number;
  capacity: number;
  occupied: number;
  facilities: string[];
  cleanlinessStatus: "Sangat Bersih" | "Terawat" | "Perlu Perhatian";
  securityStatus: "Aman Terkunci" | "Standar";
  residentSantri: Resident[];
}

export default function DormitoryModulePage() {
  const [rooms, setRooms] = useState<DormitoryRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<{
    role: string;
    permissions: Record<string, boolean>;
    crudPermissions: Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }>;
  } | null>(null);
  const [activeComplex, setActiveComplex] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);

  const canCreate = userPermissions?.crudPermissions?.dormitory?.create ?? false;
  const canEdit = userPermissions?.crudPermissions?.dormitory?.update ?? false;
  const canManage = canCreate || canEdit;

  // Modals state
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedRoomForAllocate, setSelectedRoomForAllocate] = useState<DormitoryRoom | null>(null);

  // Form state: Add Room
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newComplex, setNewComplex] = useState<"Asrama Sayyid Sulaiman" | "Asrama Kiai Aminullah">("Asrama Sayyid Sulaiman");
  const [newFloor, setNewFloor] = useState("1");
  const [newCapacity, setNewCapacity] = useState("10");
  const [newFacilities, setNewFacilities] = useState<string[]>(["AC", "Lemari Individu"]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form state: Allocate Student
  const [allocateNis, setAllocateNis] = useState("");
  const [allocateName, setAllocateName] = useState("");
  const [allocateClass, setAllocateClass] = useState("MI Kelas 4");

  // Form state: Edit Room
  const [editingRoom, setEditingRoom] = useState<DormitoryRoom | null>(null);
  const [editRoomNumber, setEditRoomNumber] = useState("");
  const [editRoomName, setEditRoomName] = useState("");
  const [editComplex, setEditComplex] = useState<"Asrama Sayyid Sulaiman" | "Asrama Kiai Aminullah">("Asrama Sayyid Sulaiman");
  const [editFloor, setEditFloor] = useState("1");
  const [editCapacity, setEditCapacity] = useState("10");
  const [editFacilities, setEditFacilities] = useState<string[]>([]);
  const [editCleanlinessStatus, setEditCleanlinessStatus] = useState<"Sangat Bersih" | "Terawat" | "Perlu Perhatian">("Sangat Bersih");
  const [editSecurityStatus, setEditSecurityStatus] = useState<"Aman Terkunci" | "Standar">("Aman Terkunci");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const openEditRoomModal = (room: DormitoryRoom) => {
    setEditingRoom(room);
    setEditRoomNumber(room.roomNumber || "");
    setEditRoomName(room.roomName || "");
    setEditComplex(room.complex || "Asrama Sayyid Sulaiman");
    setEditFloor(String(room.floor || 1));
    setEditCapacity(String(room.capacity || 10));
    setEditFacilities(room.facilities || []);
    setEditCleanlinessStatus(room.cleanlinessStatus || "Sangat Bersih");
    setEditSecurityStatus(room.securityStatus || "Aman Terkunci");
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    setEditSubmitting(true);

    try {
      const res = await updateDormitoryAction(editingRoom._id, {
        roomNumber: editRoomNumber,
        roomName: editRoomName,
        complex: editComplex,
        floor: Number(editFloor),
        capacity: Number(editCapacity),
        facilities: editFacilities,
        cleanlinessStatus: editCleanlinessStatus,
        securityStatus: editSecurityStatus,
      });

      if (res.success) {
        showToast("Data kamar asrama berhasil diperbarui di MongoDB Atlas!", "success");
        setEditingRoom(null);
        fetchRooms();
      } else {
        showToast(res.error || "Gagal memperbarui kamar asrama.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat memperbarui kamar.", "error");
    } finally {
      setEditSubmitting(false);
    }
  };

  const fetchRooms = () => {
    getDormitoriesAction()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setRooms(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat kamar:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRooms();
    getUserPermissionsAction().then((res) => {
      if (res?.success && res?.data) {
        setUserPermissions(res.data);
      }
    });
  }, []);

  const showToast = (text: string, type: "success" | "error") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats calculation
  const totalRooms = rooms.length;
  const totalCapacity = useMemo(() => rooms.reduce((acc, r) => acc + (r.capacity || 0), 0), [rooms]);
  const totalOccupied = useMemo(() => rooms.reduce((acc, r) => acc + (r.occupied || 0), 0), [rooms]);
  const totalAvailable = totalCapacity - totalOccupied;

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchComplex = activeComplex === "Semua" || room.complex === activeComplex;
      const matchQuery =
        searchQuery.trim() === "" ||
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.residentSantri?.some((r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.nis.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchComplex && matchQuery;
    });
  }, [rooms, activeComplex, searchQuery]);

  // Handle Add Room
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await createDormitoryAction({
        roomNumber: newRoomNumber,
        roomName: newRoomName,
        complex: newComplex,
        floor: parseInt(newFloor, 10),
        capacity: parseInt(newCapacity, 10),
        facilities: newFacilities,
        cleanlinessStatus: "Sangat Bersih",
        securityStatus: "Aman Terkunci",
      });

      if (res.success) {
        showToast("Kamar baru berhasil ditambahkan!", "success");
        setShowAddRoomModal(false);
        setNewRoomNumber("");
        setNewRoomName("");
        fetchRooms();
      } else {
        showToast(res.error || "Gagal menambahkan kamar.", "error");
      }
    } catch {
      showToast("Terjadi kendala saat menambah kamar.", "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Allocate Student
  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForAllocate) return;
    setFormSubmitting(true);
    try {
      const res = await allocateResidentAction({
        roomId: selectedRoomForAllocate._id,
        studentNis: allocateNis,
        studentName: allocateName,
        studentClass: allocateClass,
      });

      if (res.success) {
        showToast(`Santri berhasil dialokasikan ke kamar ${selectedRoomForAllocate.roomNumber}!`, "success");
        setShowAllocateModal(false);
        setAllocateNis("");
        setAllocateName("");
        fetchRooms();
      } else {
        showToast(res.error || "Gagal mengalokasikan santri.", "error");
      }
    } catch {
      showToast("Terjadi kendala saat alokasi santri.", "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl liquid-glass border shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 text-xs font-semibold ${
            toastMessage.type === "success"
              ? "border-emerald-500/40 text-emerald-800 dark:text-emerald-300 bg-emerald-500/15"
              : "border-rose-500/40 text-rose-700 dark:text-rose-300 bg-rose-500/15"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Breadcrumb & Navigation Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/modules"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors liquid-glass-pill px-4 py-2"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Modul Sistem</span>
        </Link>

        {canCreate && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddRoomModal(true)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 text-white text-xs font-semibold shadow-md flex items-center gap-2 hover:opacity-95 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Tambah Kamar</span>
            </button>
          </div>
        )}
      </div>

      {/* Header Banner */}
      <div className="relative rounded-[32px] overflow-hidden liquid-glass-elevated border border-white/60 dark:border-white/10 p-6 sm:p-10 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <Building2 size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Sistem Manajemen Asrama & Santri Mukim</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Manajemen Asrama Santri
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Pemetaan blok kamar Asrama Sayyid Sulaiman &amp; Asrama Kiai Aminullah Darul Khidmah Sidogiri Bekasi, monitoring kapasitas terisi, inventaris fasilitas, dan alokasi santri mukim.
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-80 relative">
            <div className="liquid-glass rounded-full border border-white/50 dark:border-white/15 p-1.5 shadow-md flex items-center">
              <Search className="ml-3 text-muted-foreground shrink-0" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kamar / nama santri..."
                className="w-full bg-transparent px-2.5 py-1.5 text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 mr-1 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats 4-Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/20 dark:border-white/10">
          <div className="p-4 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">Total Kamar</span>
              <DoorOpen size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{totalRooms}</div>
            <div className="text-[10px] text-muted-foreground">Blok Sulaiman &amp; Aminullah</div>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">Kapasitas Total</span>
              <BedDouble size={16} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{totalCapacity}</div>
            <div className="text-[10px] text-muted-foreground">Tempat tidur santri</div>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">Santri Mukim</span>
              <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{totalOccupied}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0}% Terisi
            </div>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">Sisa Kuota</span>
              <Sparkles size={16} className="text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{totalAvailable}</div>
            <div className="text-[10px] text-muted-foreground">Tempat tidur siap huni</div>
          </div>
        </div>

        {/* Filter Capsule Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {["Semua", "Asrama Sayyid Sulaiman", "Asrama Kiai Aminullah"].map((complexName) => {
            const isActive = activeComplex === complexName;
            return (
              <button
                key={complexName}
                type="button"
                onClick={() => setActiveComplex(complexName)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md scale-105"
                    : "liquid-glass border border-white/40 dark:border-white/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                {complexName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-3xl liquid-glass border border-white/40 dark:border-white/10 p-6 space-y-4 animate-pulse"
            >
              <div className="h-6 bg-muted/40 rounded-full w-2/3" />
              <div className="h-4 bg-muted/30 rounded-full w-1/2" />
              <div className="h-10 bg-muted/20 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="rounded-3xl liquid-glass border border-white/40 dark:border-white/10 p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">
            Tidak ditemukan kamar asrama yang cocok dengan filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => {
            const occupancyRate = (room.occupied / room.capacity) * 100;
            const isFull = room.occupied >= room.capacity;
            const isExpanded = expandedRoomId === room._id;

            return (
              <div
                key={room._id}
                className="rounded-3xl liquid-glass-interactive border border-white/60 dark:border-white/10 p-6 flex flex-col justify-between space-y-5 transition-all duration-300"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-mono font-extrabold text-xs">
                          {room.roomNumber}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-semibold">
                          Lantai {room.floor}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-foreground mt-1">
                        {room.roomName}
                      </h3>
                      <p className="text-xs text-muted-foreground">{room.complex}</p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          isFull
                            ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                            : occupancyRate > 75
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {isFull ? "Penuh" : `${room.capacity - room.occupied} Kuota Tersedia`}
                      </span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Kapasitas Terisi</span>
                      <span className="text-foreground">
                        {room.occupied} / {room.capacity} Santri ({Math.round(occupancyRate)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull
                            ? "bg-rose-500"
                            : occupancyRate > 75
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Facilities Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {room.facilities.map((fac, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-full liquid-glass border border-white/40 dark:border-white/10 text-muted-foreground"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>

                  {/* Cleanliness & Security Status */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/20 dark:border-white/10 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Sparkles size={12} className="text-emerald-600 dark:text-emerald-400" />
                      {room.cleanlinessStatus}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={12} className="text-teal-600 dark:text-teal-400" />
                      {room.securityStatus}
                    </span>
                  </div>
                </div>

                {/* Resident Santri Accordion */}
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setExpandedRoomId(isExpanded ? null : room._id)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span>Daftar Penghuni ({room.residentSantri?.length || 0})</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isExpanded && (
                    <div className="space-y-2 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 max-h-48 overflow-y-auto animate-in fade-in duration-200">
                      {room.residentSantri && room.residentSantri.length > 0 ? (
                        room.residentSantri.map((santri, sIdx) => (
                          <div
                            key={sIdx}
                            className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 last:border-0"
                          >
                            <span className="font-semibold text-foreground truncate max-w-[170px]">
                              {santri.name}
                            </span>
                            <span className="text-muted-foreground font-mono text-[10px]">
                              {santri.class}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-muted-foreground italic text-center py-2">
                          Belum ada santri yang dialokasikan ke kamar ini.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons: Edit & Allocate (Restricted by dynamic RBAC) */}
                  {canEdit ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditRoomModal(room)}
                        className="px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 liquid-glass border border-white/30 text-foreground hover:bg-white/10 transition-colors cursor-pointer"
                        title="Edit Detail Kamar"
                      >
                        <Pencil size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        disabled={isFull}
                        onClick={() => {
                          setSelectedRoomForAllocate(room);
                          setShowAllocateModal(true);
                        }}
                        className={`flex-1 py-2 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isFull
                            ? "bg-muted/40 text-muted-foreground cursor-not-allowed"
                            : "bg-emerald-600/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white"
                        }`}
                      >
                        <UserCheck size={14} />
                        <span>{isFull ? "Kamar Penuh" : "Alokasikan Santri"}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2 text-center">
                      <span className="text-[11px] text-muted-foreground/60 italic">Mode Pratinjau (Lihat Saja)</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Tambah Kamar Baru */}
      {showAddRoomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setShowAddRoomModal(false)}
        >
          <div
            className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl sm:rounded-[28px] liquid-glass-elevated border border-white/50 dark:border-white/10 shadow-2xl text-foreground overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Modal Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-white/15 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold truncate">Tambah Kamar Asrama Baru</h2>
                <p className="text-xs text-muted-foreground truncate">
                  Daftarkan nomor dan kapasitas unit kamar asrama Sidogiri Bekasi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRoomModal(false)}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Nomor Kamar</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: SS-103"
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Nama Kamar</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: Kamar Al-Khawarizmi"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Kompleks Asrama</label>
                    <select
                      value={newComplex}
                      onChange={(e) =>
                        setNewComplex(e.target.value as "Asrama Sayyid Sulaiman" | "Asrama Kiai Aminullah")
                      }
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none bg-background text-foreground"
                    >
                      <option value="Asrama Sayyid Sulaiman">Asrama Sayyid Sulaiman</option>
                      <option value="Asrama Kiai Aminullah">Asrama Kiai Aminullah</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Lantai</label>
                    <select
                      value={newFloor}
                      onChange={(e) => setNewFloor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none bg-background text-foreground"
                    >
                      <option value="1">Lantai 1</option>
                      <option value="2">Lantai 2</option>
                      <option value="3">Lantai 3</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Kapasitas Tempat Tidur Santri</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Fasilitas Kamar</label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {["AC", "Kipas Angin Dinding", "Kamar Mandi Dalam", "Lemari Individu", "Balkon Asri", "Rak Kitab"].map(
                      (fac) => {
                        const isChecked = newFacilities.includes(fac);
                        return (
                          <button
                            key={fac}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setNewFacilities(newFacilities.filter((f) => f !== fac));
                              } else {
                                setNewFacilities([...newFacilities, fac]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                              isChecked
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "liquid-glass border-white/30 text-muted-foreground"
                            }`}
                          >
                            {fac}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              {/* Pinned Modal Footer */}
              <div className="shrink-0 p-3.5 sm:p-4 border-t border-white/15 dark:border-white/10 flex items-center justify-end gap-3 bg-background/50 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 rounded-full liquid-glass border border-white/30 text-xs font-semibold hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer shadow-md"
                >
                  {formSubmitting ? "Menyimpan..." : "Simpan Kamar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Kamar */}
      {editingRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setEditingRoom(null)}
        >
          <div
            className="relative w-full max-w-lg max-h-[88dvh] sm:max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl sm:rounded-[28px] liquid-glass-elevated border border-white/50 dark:border-white/10 shadow-2xl text-foreground overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Modal Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-white/15 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold truncate">Edit Kamar Asrama</h2>
                <p className="text-xs text-muted-foreground truncate">
                  Perbarui nomor, kapasitas, dan fasilitas kamar asrama di MongoDB Atlas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateRoom} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Nomor Kamar</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: SS-103"
                      value={editRoomNumber}
                      onChange={(e) => setEditRoomNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Nama Kamar</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: Kamar Al-Khawarizmi"
                      value={editRoomName}
                      onChange={(e) => setEditRoomName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Kompleks Asrama</label>
                    <select
                      value={editComplex}
                      onChange={(e) =>
                        setEditComplex(e.target.value as "Asrama Sayyid Sulaiman" | "Asrama Kiai Aminullah")
                      }
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none bg-background text-foreground"
                    >
                      <option value="Asrama Sayyid Sulaiman">Asrama Sayyid Sulaiman</option>
                      <option value="Asrama Kiai Aminullah">Asrama Kiai Aminullah</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Lantai</label>
                    <select
                      value={editFloor}
                      onChange={(e) => setEditFloor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none bg-background text-foreground"
                    >
                      <option value="1">Lantai 1</option>
                      <option value="2">Lantai 2</option>
                      <option value="3">Lantai 3</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Kapasitas Tempat Tidur</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      required
                      value={editCapacity}
                      onChange={(e) => setEditCapacity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Kebersihan</label>
                    <select
                      value={editCleanlinessStatus}
                      onChange={(e) => setEditCleanlinessStatus(e.target.value as typeof editCleanlinessStatus)}
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none bg-background text-foreground"
                    >
                      <option value="Sangat Bersih">Sangat Bersih</option>
                      <option value="Terawat">Terawat</option>
                      <option value="Perlu Perhatian">Perlu Perhatian</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Keamanan</label>
                    <select
                      value={editSecurityStatus}
                      onChange={(e) => setEditSecurityStatus(e.target.value as typeof editSecurityStatus)}
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none bg-background text-foreground"
                    >
                      <option value="Aman Terkunci">Aman Terkunci</option>
                      <option value="Standar">Standar</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Fasilitas Kamar</label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {["AC", "Kipas Angin Dinding", "Kamar Mandi Dalam", "Lemari Individu", "Balkon Asri", "Rak Kitab"].map(
                      (fac) => {
                        const isChecked = editFacilities.includes(fac);
                        return (
                          <button
                            key={fac}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setEditFacilities(editFacilities.filter((f) => f !== fac));
                              } else {
                                setEditFacilities([...editFacilities, fac]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                              isChecked
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "liquid-glass border-white/30 text-muted-foreground"
                            }`}
                          >
                            {fac}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>

              {/* Pinned Modal Footer */}
              <div className="shrink-0 p-3.5 sm:p-4 border-t border-white/15 dark:border-white/10 flex items-center justify-end gap-3 bg-background/50 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setEditingRoom(null)}
                  className="px-4 py-2 rounded-full liquid-glass border border-white/30 text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer shadow-md"
                >
                  {editSubmitting ? "Menyimpan..." : "Perbarui Kamar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Alokasi Santri */}
      {showAllocateModal && selectedRoomForAllocate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setShowAllocateModal(false)}
        >
          <div
            className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl sm:rounded-[28px] liquid-glass-elevated border border-white/50 dark:border-white/10 shadow-2xl text-foreground overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Modal Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-white/15 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold truncate">Alokasikan Santri</h2>
                <p className="text-xs text-muted-foreground truncate">
                  Ke kamar <strong>{selectedRoomForAllocate.roomNumber}</strong> ({selectedRoomForAllocate.roomName}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAllocateModal(false)}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAllocate} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Nomor Induk Santri (NIS)</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: 2026-MI-045"
                    value={allocateNis}
                    onChange={(e) => setAllocateNis(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Nama Lengkap Santri</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap santri"
                    value={allocateName}
                    onChange={(e) => setAllocateName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Jenjang / Kelas</label>
                  <select
                    value={allocateClass}
                    onChange={(e) => setAllocateClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none bg-background text-foreground"
                  >
                    <option value="MI Kelas 1">Madrasah Ibtidaiyah - Kelas 1</option>
                    <option value="MI Kelas 2">Madrasah Ibtidaiyah - Kelas 2</option>
                    <option value="MI Kelas 3">Madrasah Ibtidaiyah - Kelas 3</option>
                    <option value="MI Kelas 4">Madrasah Ibtidaiyah - Kelas 4</option>
                    <option value="MI Kelas 5">Madrasah Ibtidaiyah - Kelas 5</option>
                    <option value="MI Kelas 6">Madrasah Ibtidaiyah - Kelas 6</option>
                    <option value="TPQ Jilid 1-6">TPQ Metode Tartil Sidogiri</option>
                  </select>
                </div>
              </div>

              {/* Pinned Modal Footer */}
              <div className="shrink-0 p-3.5 sm:p-4 border-t border-white/15 dark:border-white/10 flex items-center justify-end gap-3 bg-background/50 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2 rounded-full liquid-glass border border-white/30 text-xs font-semibold hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer shadow-md"
                >
                  {formSubmitting ? "Mengalokasikan..." : "Konfirmasi Alokasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
