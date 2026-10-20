import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMediaByIdAction, getMediaAction } from "@/lib/actions/media";
import { MediaShareButton } from "@/components/media-share-button";
import {
  ArrowLeft,
  Calendar,
  User,
  Video,
  ImageIcon,
  Sparkles,
  Layers,
  Clock,
  Tag,
} from "lucide-react";

interface MediaDetailPageProps {
  params: Promise<{ id: string }>;
}

// Convert YouTube watch/short link to embed URL
function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes("youtube.com/watch?v=")) {
    const videoId = url.split("watch?v=")[1]?.split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  }
  if (url.includes("youtube.com/embed/")) {
    return url;
  }
  return null;
}

export async function generateMetadata({ params }: MediaDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const res = await getMediaByIdAction(id);

  if (!res.success || !res.data) {
    return {
      title: "Dokumentasi Tidak Ditemukan | Darul Khidmah Sidogiri Bekasi",
      description: "Halaman detail dokumentasi media tidak ditemukan.",
    };
  }

  const item = res.data;
  return {
    title: `${item.title} | Dokumentasi Media Darul Khidmah Sidogiri Bekasi`,
    description: item.description || `Dokumentasi kegiatan ${item.title} di Darul Khidmah Sidogiri Bekasi.`,
    alternates: {
      canonical: `/media/${item._id}`,
    },
    openGraph: {
      title: `${item.title} | Darul Khidmah Sidogiri Bekasi`,
      description: item.description,
      url: `/media/${item._id}`,
      type: item.type === "video" ? "video.other" : "article",
      images: [
        {
          url: item.thumbnail || item.url || "/logo-sidogiri.jpeg",
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ],
    },
  };
}

export default async function MediaDetailPage({ params }: MediaDetailPageProps) {
  const { id } = await params;
  const res = await getMediaByIdAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const media = res.data;
  const embedUrl = media.type === "video" ? getEmbedUrl(media.url) : null;

  // Fetch related media items for recommendation carousel/grid
  const allMediaRes = await getMediaAction(false);
  const relatedMedia = (allMediaRes.data || [])
    .filter((item) => item._id !== media._id)
    .slice(0, 3);

  return (
    <div className="relative min-h-screen py-8 sm:py-12 px-3.5 sm:px-6 lg:px-8 w-full max-w-5xl min-w-0 mx-auto space-y-8">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 flex items-center justify-center opacity-30 dark:opacity-20">
        <div className="w-[750px] max-w-[100vw] h-[750px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-amber-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Top Action & Breadcrumb Navigation Capsule */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Link
          href="/media"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground text-xs font-semibold shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
        >
          <ArrowLeft size={14} className="text-emerald-600 dark:text-emerald-400 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Galeri</span>
        </Link>

        <div className="flex items-center gap-2">
          <MediaShareButton title={media.title} description={media.description} />
        </div>
      </div>

      {/* Main Showcase Hero Container (Apple Liquid Glass) */}
      <article className="rounded-3xl sm:rounded-[36px] liquid-glass-elevated border border-white/60 dark:border-white/10 p-4 sm:p-8 shadow-2xl space-y-6 sm:space-y-8 overflow-hidden">
        {/* Media Frame Viewer */}
        <div className="relative w-full rounded-2xl sm:rounded-[28px] overflow-hidden bg-black/60 shadow-2xl border border-white/20 dark:border-white/10">
          {media.type === "video" ? (
            embedUrl ? (
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={embedUrl}
                  title={media.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <div className="relative aspect-video w-full flex flex-col items-center justify-center text-center p-6 space-y-3 bg-black/80 text-white">
                <Video size={48} className="text-amber-400" />
                <p className="text-sm font-semibold">Tautan Video: {media.url}</p>
                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all"
                >
                  Buka Tautan Video Langsung
                </a>
              </div>
            )
          ) : (
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full max-h-[70vh] flex items-center justify-center">
              <Image
                src={media.url}
                alt={media.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-contain"
              />
            </div>
          )}

          {/* Floating Badges inside Viewer (Apple Clear Glass Variant) */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-clear border border-white/40 text-xs font-bold text-white shadow-md">
              {media.type === "video" ? (
                <>
                  <Video size={13} className="text-amber-400" />
                  <span>Video Liputan</span>
                  {media.duration && (
                    <span className="text-[11px] text-white/80 font-normal">({media.duration})</span>
                  )}
                </>
              ) : (
                <>
                  <ImageIcon size={13} className="text-emerald-300" />
                  <span>Foto Dokumentasi</span>
                </>
              )}
            </span>
          </div>

          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full liquid-glass-clear border border-emerald-400/40 text-xs font-bold text-emerald-300 shadow-md">
              <Tag size={12} />
              <span>{media.category}</span>
            </span>
          </div>
        </div>

        {/* Content Header & Narrative */}
        <div className="space-y-6">
          {/* Metadata Badges Row */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-muted-foreground border-b border-border/40 pb-4">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{media.date}</span>
            </div>
            <span className="opacity-40">•</span>
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Diterbitkan oleh: <strong className="text-foreground">{media.author}</strong></span>
            </div>
            {media.duration && (
              <>
                <span className="opacity-40">•</span>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Durasi: <strong className="text-foreground">{media.duration}</strong></span>
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-snug">
            {media.title}
          </h1>

          {/* Narrative Body */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>Keterangan & Rincian Kegiatan</span>
            </h2>
            <div className="p-5 sm:p-6 rounded-2xl liquid-glass-card border border-white/50 dark:border-white/10 text-sm sm:text-base text-foreground/90 leading-relaxed space-y-3">
              <p className="whitespace-pre-line">
                {media.description}
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Related Media Recommendations */}
      {relatedMedia.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers size={18} className="text-emerald-600 dark:text-emerald-400" />
              <span>Dokumentasi Lainnya</span>
            </h2>
            <Link
              href="/media"
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Lihat Seluruh Galeri →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedMedia.map((rel) => (
              <Link
                key={rel._id}
                href={`/media/${rel._id}`}
                className="group rounded-2xl liquid-glass border border-white/50 dark:border-white/10 p-3.5 overflow-hidden flex flex-col justify-between space-y-3 transition-all duration-300 hover:scale-[1.02] block"
              >
                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900/10">
                  <Image
                    src={rel.thumbnail || rel.url}
                    alt={rel.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full liquid-glass-clear text-[9px] font-bold text-emerald-300">
                    {rel.category}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                    <Calendar size={11} />
                    {rel.date}
                  </p>
                  <h3 className="font-bold text-xs text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {rel.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
