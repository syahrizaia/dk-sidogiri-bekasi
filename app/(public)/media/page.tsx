"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { getMediaAction } from "@/lib/actions/media";
import {
  Search,
  Play,
  ImageIcon,
  Calendar,
  User,
  Share2,
  X,
  Sparkles,
  Check,
  Video,
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
}

const CATEGORIES = [
  "Semua",
  "Kegiatan Santri",
  "Kajian Kitab Kuning",
  "Prestasi",
  "Fasilitas",
  "Video Liputan",
] as const;

export default function PublicMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let ignore = false;
    getMediaAction(false)
      .then((res) => {
        if (!ignore && res.success && Array.isArray(res.data)) {
          setMediaList(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat media:", err);
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Filtered Media
  const filteredMedia = useMemo(() => {
    return mediaList.filter((item) => {
      const matchCategory =
        activeCategory === "Semua" || item.category === activeCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [mediaList, activeCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: mediaList.length };
    for (const item of mediaList) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }
    return counts;
  }, [mediaList]);

  // Handle Share
  const handleShare = async (item: MediaItem) => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.title} | Darul Khidmah Sidogiri Bekasi`,
          text: item.description,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${item.title} - ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Convert youtube watch URL to embed URL if needed
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "youtube.com/embed/");
    }
    return url;
  };

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Hero Section */}
      <div className="relative rounded-[32px] overflow-hidden liquid-glass-elevated border border-white/60 dark:border-white/10 p-6 sm:p-12 shadow-2xl text-center space-y-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span className="font-serif tracking-wide text-sm">مَعْرَضُ الْأَنْشِطَةِ وَالتَّوْثِيقِ</span>
            <span>•</span>
            <span>Galeri Multi-Dokumentasi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Dokumentasi & Syiar Dakwah
            <span className="block text-gradient-emerald text-2xl sm:text-4xl mt-1">
              Darul Khidmah Sidogiri Bekasi
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Rekam jejak keilmuan salaf, kedisiplinan tarbiyah santri Madrasah Miftahul Ulum, metode Tartil Al-Qur&apos;an Sidogiri, serta khidmah kemasyarakatan di wilayah Bekasi.
          </p>
        </div>

        {/* Search Bar Capsule */}
        <div className="max-w-xl mx-auto relative">
          <div className="relative liquid-glass rounded-full border border-white/50 dark:border-white/15 p-1.5 shadow-lg flex items-center">
            <Search className="ml-3.5 text-muted-foreground shrink-0" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari dokumentasi kegiatan, kajian, atau prestasi..."
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1.5 mr-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Hapus pencarian"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Capsule Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-md shadow-emerald-950/20 scale-105"
                    : "liquid-glass border border-white/50 dark:border-white/10 text-muted-foreground hover:text-foreground hover:border-white/80"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-black/5 dark:bg-white/10 text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Grid Section */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="rounded-3xl liquid-glass border border-white/40 dark:border-white/10 p-4 space-y-4 animate-pulse"
            >
              <div className="aspect-[16/10] bg-muted/40 rounded-2xl" />
              <div className="h-4 bg-muted/40 rounded-full w-3/4" />
              <div className="h-3 bg-muted/30 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="rounded-3xl liquid-glass border border-white/40 dark:border-white/10 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Layers size={32} />
          </div>
          <h3 className="text-lg font-bold text-foreground">Tidak Ada Dokumentasi</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tidak ditemukan media yang sesuai dengan filter atau kata kunci &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory("Semua");
              setSearchQuery("");
            }}
            className="px-5 py-2 rounded-full bg-emerald-700 text-white text-xs font-semibold shadow-md hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item) => (
            <div
              key={item._id}
              onClick={() => setSelectedItem(item)}
              className="group rounded-3xl liquid-glass-interactive border border-white/60 dark:border-white/10 p-4 overflow-hidden flex flex-col justify-between cursor-pointer space-y-4 transition-all duration-300"
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900/10">
                <Image
                  src={item.thumbnail || item.url}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Type Badge (Apple Clear Glass Variant) */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-clear border border-white/40 text-[11px] font-semibold text-white shadow-sm">
                  {item.type === "video" ? (
                    <>
                      <Video size={13} className="text-amber-400" />
                      <span>Video</span>
                      {item.duration && (
                        <span className="text-[10px] text-white/80">({item.duration})</span>
                      )}
                    </>
                  ) : (
                    <>
                      <ImageIcon size={13} className="text-emerald-300" />
                      <span>Foto</span>
                    </>
                  )}
                </div>

                {/* Category Badge (Apple Clear Glass Variant) */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full liquid-glass-clear border border-emerald-400/40 text-[10px] font-bold text-emerald-300">
                  {item.category}
                </div>

                {/* Play Button Overlay for Videos (Apple Clear Glass with Fluid Interactivity) */}
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full liquid-glass-clear border border-white/60 text-white flex items-center justify-center shadow-xl group-hover:scale-115 group-hover:bg-emerald-600/80 transition-all duration-400">
                      <Play size={20} className="ml-0.5 fill-current" />
                    </div>
                  </div>
                )}
              </div>

              {/* Information */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-emerald-600 dark:text-emerald-400" />
                    {item.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 truncate max-w-[140px]">
                    <User size={13} className="text-emerald-600 dark:text-emerald-400" />
                    {item.author}
                  </span>
                </div>

                <h3 className="font-bold text-base text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Card Footer action hint */}
              <div className="pt-2 border-t border-white/20 dark:border-white/5 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                <span>{item.type === "video" ? "Tonton Video Liputan" : "Lihat Foto Dokumentasi"}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Modal Preview */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[32px] liquid-glass-elevated border border-white/40 dark:border-white/10 p-6 sm:p-8 shadow-2xl text-foreground space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    {selectedItem.category}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar size={13} />
                    {selectedItem.date}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {selectedItem.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-2.5 rounded-full liquid-glass border border-white/40 dark:border-white/10 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Tutup Preview"
              >
                <X size={20} />
              </button>
            </div>

            {/* Media Player / Image Display */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-black/40 shadow-inner">
              {selectedItem.type === "video" ? (
                <div className="aspect-video w-full">
                  <iframe
                    src={getEmbedUrl(selectedItem.url)}
                    title={selectedItem.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full">
                  <Image
                    src={selectedItem.url}
                    alt={selectedItem.title}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            {/* Media Caption & Actions */}
            <div className="space-y-4 pt-2 border-t border-white/20 dark:border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <User size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Didokumentasikan oleh: <strong>{selectedItem.author}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleShare(selectedItem)}
                    className="px-4 py-2 rounded-full liquid-glass border border-white/40 dark:border-white/10 text-xs font-semibold flex items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Tautan Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={14} />
                        <span>Bagikan</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-5 py-2 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer shadow-md"
                  >
                    Tutup
                  </button>
                </div>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-white/10">
                {selectedItem.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
