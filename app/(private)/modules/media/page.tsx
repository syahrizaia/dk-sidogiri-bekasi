"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  getMediaAction, 
  createMediaAction, 
  deleteMediaAction 
} from "@/lib/actions/media";
import {
  Video,
  ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  Sparkles,
  Eye,
  Layers,
} from "lucide-react";

interface MediaItem {
  _id: string;
  title: string;
  category: "Kegiatan Santri" | "Kajian Kitab Kuning" | "Prestasi" | "Fasilitas" | "Video Liputan";
  type: "image" | "video";
  url: string;
  thumbnail: string;
  duration?: string;
  description: string;
  date: string;
  author: string;
  published: boolean;
  createdAt?: string;
}

const CATEGORIES = [
  "Kegiatan Santri",
  "Kajian Kitab Kuning",
  "Prestasi",
  "Fasilitas",
  "Video Liputan",
] as const;

export default function MediaManagementModulePage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<MediaItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<(typeof CATEGORIES)[number]>("Kegiatan Santri");
  const [formType, setFormType] = useState<"image" | "video">("image");
  const [formUrl, setFormUrl] = useState("");
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAuthor, setFormAuthor] = useState("Redaksi Media");
  const [formPublished, setFormPublished] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchMedia = () => {
    getMediaAction(true)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setMediaList(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat media:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const showToast = (text: string, type: "success" | "error") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats
  const totalMedia = mediaList.length;
  const totalPhotos = useMemo(() => mediaList.filter((m) => m.type === "image").length, [mediaList]);
  const totalVideos = useMemo(() => mediaList.filter((m) => m.type === "video").length, [mediaList]);
  const totalPublished = useMemo(() => mediaList.filter((m) => m.published).length, [mediaList]);

  // Filter
  const filteredMedia = useMemo(() => {
    return mediaList.filter((item) => {
      const matchCategory = activeCategory === "Semua" || item.category === activeCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [mediaList, activeCategory, searchQuery]);

  // Submit new media
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await createMediaAction({
        title: formTitle,
        category: formCategory,
        type: formType,
        url: formUrl,
        thumbnail: formThumbnail || formUrl,
        duration: formType === "video" ? formDuration : undefined,
        description: formDescription,
        author: formAuthor,
        published: formPublished,
      });

      if (res.success) {
        showToast("Dokumentasi media berhasil dipublikasikan!", "success");
        setShowAddModal(false);
        // Reset form
        setFormTitle("");
        setFormUrl("");
        setFormThumbnail("");
        setFormDuration("");
        setFormDescription("");
        fetchMedia();
      } else {
        showToast(res.error || "Gagal menyimpan media.", "error");
      }
    } catch {
      showToast("Terjadi kendala saat menghubungi server.", "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete media
  const handleDeleteMedia = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus arsip media "${title}"?`)) return;
    try {
      const res = await deleteMediaAction(id);
      if (res.success) {
        showToast("Media berhasil dihapus dari arsip.", "success");
        fetchMedia();
      } else {
        showToast(res.error || "Gagal menghapus media.", "error");
      }
    } catch {
      showToast("Gagal menghapus media.", "error");
    }
  };

  return (
    <div className="relative min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Toast Alert */}
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

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/modules"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors liquid-glass-pill px-4 py-2"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Modul Sistem</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/media"
            target="_blank"
            className="px-4 py-2 rounded-full liquid-glass border border-white/40 text-xs font-semibold flex items-center gap-1.5 hover:bg-white/10 transition-colors"
          >
            <span>Lihat Galeri Publik</span>
            <ExternalLink size={13} />
          </Link>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 text-white text-xs font-semibold shadow-md flex items-center gap-2 hover:opacity-95 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Media Baru</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative rounded-[32px] overflow-hidden liquid-glass-elevated border border-white/60 dark:border-white/10 p-6 sm:p-10 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <Video size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Pusat Multimedia &amp; Arsip Dokumentasi</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Manajemen Media &amp; Syiar Dakwah
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Arsip visual kegiatan tarbiyah, kajian kitab kuning, liputan prestasi santri, dan infrastruktur Darul Khidmah Sidogiri Bekasi. Terhubung langsung dengan halaman galeri publik.
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
                placeholder="Cari arsip media..."
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
              <span className="text-[11px] font-semibold">Total Arsip</span>
              <Layers size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{totalMedia}</div>
            <div className="text-[10px] text-muted-foreground">Item dokumentasi</div>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">Foto Dokumentasi</span>
              <ImageIcon size={16} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-2xl font-extrabold text-foreground">{totalPhotos}</div>
            <div className="text-[10px] text-muted-foreground">Galeri fotografi santri</div>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">Video Liputan</span>
              <Video size={16} className="text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{totalVideos}</div>
            <div className="text-[10px] text-muted-foreground">Tayangan dokumenter</div>
          </div>

          <div className="p-4 rounded-2xl liquid-glass border border-white/40 dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-semibold">Status Publikasi</span>
              <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{totalPublished}</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Tayang di /media</div>
          </div>
        </div>

        {/* Filter Capsule Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {["Semua", ...CATEGORIES].map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md scale-105"
                    : "liquid-glass border border-white/40 dark:border-white/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Table / Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl liquid-glass border border-white/30 animate-pulse" />
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="rounded-3xl liquid-glass border border-white/40 dark:border-white/10 p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">
            Tidak ada arsip media yang sesuai dengan kriteria filter.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-white/10 text-muted-foreground font-semibold">
                <tr>
                  <th className="py-4 px-6">Media &amp; Judul</th>
                  <th className="py-4 px-4">Kategori</th>
                  <th className="py-4 px-4">Tipe</th>
                  <th className="py-4 px-4">Tanggal</th>
                  <th className="py-4 px-4">Pengunggah</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMedia.map((item) => (
                  <tr key={item._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-10 rounded-xl overflow-hidden bg-slate-900/10 shrink-0">
                          <Image
                            src={item.thumbnail || item.url}
                            alt={item.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-0.5 max-w-xs sm:max-w-md">
                          <p className="font-bold text-foreground truncate">{item.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        {item.type === "video" ? (
                          <>
                            <Video size={13} className="text-amber-500" />
                            <span>Video</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon size={13} className="text-teal-500" />
                            <span>Foto</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-muted-foreground">
                      {item.date}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap text-muted-foreground">
                      {item.author}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.published
                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : "bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        {item.published ? "Publik" : "Draf"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedPreview(item)}
                          className="p-2 rounded-xl liquid-glass border border-white/30 text-emerald-700 dark:text-emerald-400 hover:bg-white/10 transition-colors"
                          title="Lihat Pratinjau"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(item._id, item.title)}
                          className="p-2 rounded-xl liquid-glass border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Hapus Media"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Media Baru */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[32px] liquid-glass-elevated border border-white/50 dark:border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Unggah &amp; Publikasi Media Baru</h2>
                <p className="text-xs text-muted-foreground">
                  Dokumentasi kegiatan santri, kajian kitab kuning, atau liputan fasilitas Sidogiri Bekasi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMedia} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Judul Media</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Kajian Fathul Qarib Bersama Asatidz"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as (typeof CATEGORIES)[number])}
                    className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none bg-background text-foreground"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Tipe Media</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as "image" | "video")}
                    className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none bg-background text-foreground"
                  >
                    <option value="image">Foto (Gambar)</option>
                    <option value="video">Video (YouTube / Stream)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">URL Media Utama</label>
                <input
                  type="url"
                  required
                  placeholder={
                    formType === "video"
                      ? "https://www.youtube.com/watch?v=..."
                      : "https://images.unsplash.com/... atau URL gambar"
                  }
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">URL Thumbnail (Opsional)</label>
                  <input
                    type="url"
                    placeholder="URL cover gambar"
                    value={formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                  />
                </div>

                {formType === "video" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Durasi Video</label>
                    <input
                      type="text"
                      placeholder="misal: 10:45"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Pengunggah / Tim Dokumentasi</label>
                <input
                  type="text"
                  required
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Deskripsi Dokumentasi</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Keterangan lengkap tentang kegiatan yang didokumentasikan..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pub-check"
                  checked={formPublished}
                  onChange={(e) => setFormPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="pub-check" className="text-xs font-semibold cursor-pointer">
                  Langsung publikasikan ke galeri publik (/media)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full liquid-glass border border-white/30 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer shadow-md"
                >
                  {formSubmitting ? "Menyimpan..." : "Simpan & Publikasikan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Pratinjau Media */}
      {selectedPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setSelectedPreview(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-[32px] liquid-glass-elevated border border-white/50 dark:border-white/10 p-6 sm:p-8 shadow-2xl space-y-4 text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                  {selectedPreview.category}
                </span>
                <h3 className="text-lg font-bold mt-1">{selectedPreview.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/40">
              {selectedPreview.type === "video" ? (
                <iframe
                  src={
                    selectedPreview.url.includes("watch?v=")
                      ? selectedPreview.url.replace("watch?v=", "embed/")
                      : selectedPreview.url
                  }
                  title={selectedPreview.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : (
                <Image
                  src={selectedPreview.url}
                  alt={selectedPreview.title}
                  fill
                  sizes="800px"
                  className="object-contain"
                />
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {selectedPreview.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
