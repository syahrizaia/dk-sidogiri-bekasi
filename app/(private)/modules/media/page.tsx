"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  getMediaAction, 
  createMediaAction, 
  deleteMediaAction,
  updateMediaAction 
} from "@/lib/actions/media";
import { getUserPermissionsAction } from "@/lib/actions/roles";
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
  Pencil,
  Play,
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

function MediaFormPreview({
  type,
  url,
  thumbnail,
  title,
}: {
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  title?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [url]);

  useEffect(() => {
    setThumbError(false);
  }, [thumbnail]);

  const embedUrl = useMemo(() => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed.includes("youtube.com/watch?v=")) {
      const videoId = trimmed.split("watch?v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (trimmed.includes("youtu.be/")) {
      const videoId = trimmed.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (trimmed.includes("youtube.com/shorts/")) {
      const videoId = trimmed.split("shorts/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return trimmed;
  }, [url]);

  const hasUrl = Boolean(url && url.trim().length > 0);

  return (
    <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
          {type === "video" ? (
            <>
              <Video size={14} className="text-amber-500" />
              <span>Pratinjau Pemutar Video</span>
            </>
          ) : (
            <>
              <ImageIcon size={14} className="text-teal-500" />
              <span>Pratinjau Foto Dokumentasi</span>
            </>
          )}
        </span>
        {hasUrl && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Preview</span>
          </span>
        )}
      </div>

      {!hasUrl ? (
        <div className="py-6 px-4 rounded-xl border border-dashed border-white/20 dark:border-white/10 flex flex-col items-center justify-center text-center gap-1.5 text-muted-foreground">
          {type === "video" ? (
            <Video size={22} className="text-amber-500/50" />
          ) : (
            <ImageIcon size={22} className="text-teal-500/50" />
          )}
          <p className="text-xs font-medium">
            {type === "video"
              ? "Masukkan link video YouTube di atas untuk melihat preview pemutar video secara langsung."
              : "Masukkan URL foto di atas untuk melihat preview foto secara langsung."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative w-full aspect-video max-h-48 sm:max-h-56 rounded-xl overflow-hidden bg-black/60 shadow-inner flex items-center justify-center border border-white/15">
            {type === "video" ? (
              embedUrl.includes("youtube.com") || embedUrl.includes("youtu.be") ? (
                <iframe
                  src={embedUrl}
                  title={title || "Preview Video"}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : embedUrl.endsWith(".mp4") || embedUrl.endsWith(".webm") ? (
                <video
                  src={embedUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={embedUrl}
                  title={title || "Preview Video"}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              )
            ) : imgError ? (
              <div className="p-4 text-center text-xs text-rose-500 dark:text-rose-400 flex flex-col items-center gap-1.5">
                <AlertCircle size={20} />
                <span className="font-semibold">Gambar tidak dapat dimuat</span>
                <span className="text-[11px] text-muted-foreground">
                  Periksa kembali kevalidan URL foto atau pastikan tautan dapat diakses secara publik.
                </span>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={url.trim()}
                alt={title || "Preview Foto"}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {thumbnail && thumbnail.trim() !== "" && thumbnail.trim() !== url.trim() && (
            <div className="p-2 rounded-xl bg-black/10 dark:bg-white/5 border border-white/10 flex items-center gap-2.5">
              <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-black/40 shrink-0 border border-white/10 flex items-center justify-center">
                {thumbError ? (
                  <span className="text-[9px] text-rose-400">Error</span>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={thumbnail.trim()}
                    alt="Cover Thumbnail"
                    onError={() => setThumbError(true)}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-foreground">Thumbnail Kustom Aktif</p>
                <p className="text-[10px] text-muted-foreground truncate">{thumbnail}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MediaManagementModulePage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<{
    role: string;
    permissions: Record<string, boolean>;
    crudPermissions: Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }>;
  } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<MediaItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const canCreate = userPermissions?.crudPermissions?.media?.create ?? false;
  const canEdit = userPermissions?.crudPermissions?.media?.update ?? false;
  const canDelete = userPermissions?.crudPermissions?.media?.delete ?? false;

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

  // Edit states
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<(typeof CATEGORIES)[number]>("Kegiatan Santri");
  const [editType, setEditType] = useState<"image" | "video">("image");
  const [editUrl, setEditUrl] = useState("");
  const [editThumbnail, setEditThumbnail] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAuthor, setEditAuthor] = useState("Redaksi Media");
  const [editPublished, setEditPublished] = useState(true);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const openEditModal = (item: MediaItem) => {
    setEditingMedia(item);
    setEditTitle(item.title || "");
    setEditCategory(item.category || "Kegiatan Santri");
    setEditType(item.type || "image");
    setEditUrl(item.url || "");
    setEditThumbnail(item.thumbnail || "");
    setEditDuration(item.duration || "");
    setEditDescription(item.description || "");
    setEditAuthor(item.author || "Redaksi Media");
    setEditPublished(item.published !== false);
  };

  const handleUpdateMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;
    setEditSubmitting(true);

    try {
      const res = await updateMediaAction(editingMedia._id, {
        title: editTitle,
        category: editCategory,
        type: editType,
        url: editUrl,
        thumbnail: editThumbnail || editUrl,
        duration: editType === "video" ? editDuration : undefined,
        description: editDescription,
        author: editAuthor,
        published: editPublished,
      });

      if (res.success) {
        showToast("Dokumentasi media berhasil diperbarui di MongoDB Atlas!", "success");
        setEditingMedia(null);
        fetchMedia();
      } else {
        showToast(res.error || "Gagal memperbarui dokumentasi media.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan saat memperbarui media.", "error");
    } finally {
      setEditSubmitting(false);
    }
  };

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
    <div className="relative min-h-screen py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8 w-full max-w-7xl min-w-0 mx-auto space-y-6 sm:space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl liquid-glass border shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 text-xs font-semibold max-w-[90vw] ${
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
          <span className="truncate">{toastMessage.text}</span>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/modules"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors liquid-glass-pill px-4 py-2 self-start"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Modul Sistem</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/media"
            target="_blank"
            className="px-4 py-2 rounded-full liquid-glass border border-white/40 text-xs font-semibold flex items-center gap-1.5 hover:bg-white/10 transition-colors"
          >
            <span>Lihat Galeri Publik</span>
            <ExternalLink size={13} />
          </Link>
          {canCreate && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 text-white text-xs font-semibold shadow-md flex items-center gap-2 hover:opacity-95 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Tambah Media Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative rounded-[32px] overflow-hidden liquid-glass-elevated border border-white/60 dark:border-white/10 p-5 sm:p-10 shadow-2xl space-y-4">
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
        <div className="rounded-3xl liquid-glass-elevated border border-white/60 dark:border-white/10 overflow-hidden shadow-xl w-full max-w-full min-w-0">
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
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
                          className="p-2 rounded-xl liquid-glass border border-white/30 text-foreground hover:bg-white/10 transition-colors"
                          title="Lihat Pratinjau"
                        >
                          <Eye size={15} />
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-xl liquid-glass border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="Edit Dokumentasi"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(item._id, item.title)}
                            className="p-2 rounded-xl liquid-glass border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Hapus Media"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 bg-muted/20 border-t border-border/30 text-[10px] text-muted-foreground flex items-center justify-between sm:hidden">
            <span>← Geser tabel ke samping untuk info lengkap →</span>
            <span className="font-mono font-semibold">{filteredMedia.length} Media</span>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Media Baru */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative w-full max-w-xl max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl sm:rounded-[28px] liquid-glass-elevated border border-white/50 dark:border-white/10 shadow-2xl text-foreground overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Modal Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-white/15 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold truncate">Unggah &amp; Publikasi Media Baru</h2>
                <p className="text-xs text-muted-foreground truncate">
                  Dokumentasi kegiatan santri atau fasilitas Sidogiri Bekasi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form with scrollable fields and pinned footer */}
            <form onSubmit={handleAddMedia} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

                {/* Live Preview Gambar & Video */}
                <MediaFormPreview
                  type={formType}
                  url={formUrl}
                  thumbnail={formThumbnail}
                  title={formTitle}
                />

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

                <div className="flex items-center gap-2 pt-1">
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
              </div>

              {/* Pinned Modal Footer */}
              <div className="shrink-0 p-3.5 sm:p-4 border-t border-white/15 dark:border-white/10 flex items-center justify-end gap-3 bg-background/50 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full liquid-glass border border-white/30 text-xs font-semibold hover:bg-white/10 transition-colors"
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

      {/* MODAL: Edit Media */}
      {editingMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setEditingMedia(null)}
        >
          <div
            className="relative w-full max-w-xl max-h-[88dvh] sm:max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl sm:rounded-[28px] liquid-glass-elevated border border-white/50 dark:border-white/10 shadow-2xl text-foreground overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Modal Header */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-white/15 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold truncate">Edit Dokumentasi Media</h2>
                <p className="text-xs text-muted-foreground truncate">
                  Perbarui data dokumentasi foto/video di MongoDB Atlas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMedia(null)}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form with scrollable fields and pinned footer */}
            <form onSubmit={handleUpdateMedia} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Judul Media</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Kajian Fathul Qarib Bersama Asatidz"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Kategori</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as (typeof CATEGORIES)[number])}
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
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as "image" | "video")}
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
                      editType === "video"
                        ? "https://www.youtube.com/watch?v=..."
                        : "https://images.unsplash.com/... atau URL gambar"
                    }
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">URL Thumbnail (Opsional)</label>
                    <input
                      type="url"
                      placeholder="URL cover gambar"
                      value={editThumbnail}
                      onChange={(e) => setEditThumbnail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                    />
                  </div>

                  {editType === "video" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">Durasi Video</label>
                      <input
                        type="text"
                        placeholder="misal: 10:45"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Live Preview Gambar & Video */}
                <MediaFormPreview
                  type={editType}
                  url={editUrl}
                  thumbnail={editThumbnail}
                  title={editTitle}
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Pengunggah / Tim Dokumentasi</label>
                  <input
                    type="text"
                    required
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Deskripsi Dokumentasi</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Keterangan lengkap tentang kegiatan yang didokumentasikan..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass border border-white/30 text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="edit-pub-check"
                    checked={editPublished}
                    onChange={(e) => setEditPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="edit-pub-check" className="text-xs font-semibold cursor-pointer">
                    Publikasikan ke galeri publik (/media)
                  </label>
                </div>
              </div>

              {/* Pinned Modal Footer */}
              <div className="shrink-0 p-3.5 sm:p-4 border-t border-white/15 dark:border-white/10 flex items-center justify-end gap-3 bg-background/50 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="px-4 py-2 rounded-full liquid-glass border border-white/30 text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer shadow-md"
                >
                  {editSubmitting ? "Menyimpan..." : "Perbarui Dokumentasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Pratinjau Media */}
      {selectedPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setSelectedPreview(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl sm:rounded-[28px] liquid-glass-elevated border border-white/50 dark:border-white/10 shadow-2xl text-foreground overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Header */}
            <div className="shrink-0 p-3.5 sm:p-4 border-b border-white/15 dark:border-white/10 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                  {selectedPreview.category}
                </span>
                <h3 className="text-sm sm:text-base font-bold mt-1 truncate">{selectedPreview.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3">
              <div className="relative aspect-video w-full max-h-[35vh] sm:max-h-[44vh] rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center">
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

              <p className="text-xs text-muted-foreground leading-relaxed bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-white/10">
                {selectedPreview.description}
              </p>
            </div>

            {/* Pinned Footer */}
            <div className="shrink-0 p-3 sm:p-4 border-t border-white/15 dark:border-white/10 flex items-center justify-end bg-background/50 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-1.5 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
