"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/actions/auth";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Award,
  GraduationCap,
  Users,
  ClipboardCheck
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/modules";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await loginAction({ email, password });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal masuk ke sistem. Silakan periksa kredensial Anda.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 700);
    } catch {
      setErrorMessage("Terjadi gangguan saat memproses autentikasi server.");
      setIsLoading(false);
    }
  };

  const [selectedDemoRole, setSelectedDemoRole] = useState<string | null>(null);

  const handleFillDemo = (role: "admin" | "ketua" | "guru" | "wali" | "staf") => {
    setSelectedDemoRole(role);
    setErrorMessage("");
    if (role === "admin") {
      setEmail("admin@sidogiri-bekasi.sch.id");
      setPassword("Sidogiri2026!");
    } else if (role === "ketua") {
      setEmail("ketua@sidogiri-bekasi.sch.id");
      setPassword("KetuaSidogiri2026!");
    } else if (role === "guru") {
      setEmail("guru@sidogiri-bekasi.sch.id");
      setPassword("GuruSidogiri2026!");
    } else if (role === "wali") {
      setEmail("wali@sidogiri-bekasi.sch.id");
      setPassword("WaliSidogiri2026!");
    } else if (role === "staf") {
      setEmail("staf@sidogiri-bekasi.sch.id");
      setPassword("StafSidogiri2026!");
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-14rem)] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full liquid-glass-pill text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
            <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Portal Masuk Terpadu</span>
          </div>
        </div>

        {/* Apple Liquid Glass Card */}
        <div className="liquid-glass-elevated rounded-[32px] p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-white/10 space-y-6 relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="space-y-3 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl overflow-hidden bg-white/95 dark:bg-emerald-950/90 p-1 shadow-lg shadow-emerald-950/25 ring-2 ring-emerald-600/40 dark:ring-emerald-400/40 flex items-center justify-center">
              <Image
                src="/logo-sidogiri.jpeg"
                alt="Logo Darul Khidmah Sidogiri Bekasi"
                width={56}
                height={56}
                priority
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <p className="font-serif text-lg text-emerald-800/90 dark:text-emerald-300/90">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Masuk ke Portal Santri
              </h1>
              <p className="text-xs text-muted-foreground">
                Sistem Terpadu Darul Khidmah Sidogiri Bekasi
              </p>
            </div>
          </div>

          {/* Status Alert Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-300">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-300">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Autentikasi berhasil. Mengarahkan ke modul sistem...</span>
            </div>
          )}

          {/* Form Inputs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label 
                htmlFor="email" 
                className="block text-xs font-semibold text-foreground/90"
              >
                Alamat Email Pengguna
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  required
                  placeholder="nama@sidogiri-bekasi.sch.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md pl-11 pr-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label 
                htmlFor="password" 
                className="block text-xs font-semibold text-foreground/90"
              >
                Kata Sandi Akun
              </label>

              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md pl-11 pr-11 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Quick Demo Role Selector */}
            <div className="p-3 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Isi Cepat Akun Demo:</span>
                </span>
                {selectedDemoRole && (
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                    {selectedDemoRole === "admin"
                      ? "Super Admin"
                      : selectedDemoRole === "ketua"
                      ? "Ketua Ranting"
                      : selectedDemoRole === "guru"
                      ? "Dewan Asatidz"
                      : selectedDemoRole === "wali"
                      ? "Wali Santri"
                      : "Staf Administrasi"}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillDemo("admin")}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex flex-col items-center gap-1 border cursor-pointer ${
                    selectedDemoRole === "admin"
                      ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40 shadow-sm"
                      : "bg-white/60 dark:bg-black/40 text-muted-foreground hover:text-foreground border-white/40 dark:border-white/10 hover:border-emerald-500/30"
                  }`}
                  title="Super Admin (admin@sidogiri-bekasi.sch.id)"
                >
                  <ShieldCheck size={14} className="text-rose-600 dark:text-rose-400" />
                  <span className="text-xs font-bold">Admin</span>
                  <span className="text-[9px] opacity-75">Utama</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo("ketua")}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex flex-col items-center gap-1 border cursor-pointer ${
                    selectedDemoRole === "ketua"
                      ? "bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-500/40 shadow-sm"
                      : "bg-white/60 dark:bg-black/40 text-muted-foreground hover:text-foreground border-white/40 dark:border-white/10 hover:border-emerald-500/30"
                  }`}
                  title="Ketua Ranting (ketua@sidogiri-bekasi.sch.id)"
                >
                  <Award size={14} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold">Ketua</span>
                  <span className="text-[9px] opacity-75">Ranting</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo("guru")}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex flex-col items-center gap-1 border cursor-pointer ${
                    selectedDemoRole === "guru"
                      ? "bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-500/40 shadow-sm"
                      : "bg-white/60 dark:bg-black/40 text-muted-foreground hover:text-foreground border-white/40 dark:border-white/10 hover:border-emerald-500/30"
                  }`}
                  title="Dewan Asatidz / Guru (guru@sidogiri-bekasi.sch.id)"
                >
                  <GraduationCap size={14} className="text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold">Guru</span>
                  <span className="text-[9px] opacity-75">Asatidz</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo("wali")}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex flex-col items-center gap-1 border cursor-pointer ${
                    selectedDemoRole === "wali"
                      ? "bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-500/40 shadow-sm"
                      : "bg-white/60 dark:bg-black/40 text-muted-foreground hover:text-foreground border-white/40 dark:border-white/10 hover:border-emerald-500/30"
                  }`}
                  title="Wali Santri (wali@sidogiri-bekasi.sch.id)"
                >
                  <Users size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold">Wali</span>
                  <span className="text-[9px] opacity-75">Santri</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo("staf")}
                  className={`col-span-2 sm:col-span-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex flex-col items-center gap-1 border cursor-pointer ${
                    selectedDemoRole === "staf"
                      ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40 shadow-sm"
                      : "bg-white/60 dark:bg-black/40 text-muted-foreground hover:text-foreground border-white/40 dark:border-white/10 hover:border-emerald-500/30"
                  }`}
                  title="Staf Administrasi (staf@sidogiri-bekasi.sch.id)"
                >
                  <ClipboardCheck size={14} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-bold">Staf</span>
                  <span className="text-[9px] opacity-75">Admin</span>
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading || isSuccess}
              className="liquid-sheen w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white p-3 rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-950/20 hover:shadow-emerald-700/30 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? "Memverifikasi Kredensial..." : "Masuk ke Sistem Tarbiyah"}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Bottom Info: Akun Dikelola Super Admin */}
          <div className="pt-3.5 border-t border-border/40 text-center space-y-1.5 text-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/40 text-[11px] font-medium text-muted-foreground">
              <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Akun dibuat &amp; dikelola langsung oleh Super Admin</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Pendaftaran akun mandiri ditutup. Hubungi administrator madrasah jika Anda belum memiliki akun atau lupa kata sandi.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-[50vh] flex items-center justify-center text-xs text-muted-foreground">
        Memuat modul autentikasi...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
