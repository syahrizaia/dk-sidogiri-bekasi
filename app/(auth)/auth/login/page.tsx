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
  Sparkles
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

  const handleFillDemo = () => {
    setEmail("admin@sidogiri-bekasi.sch.id");
    setPassword("Sidogiri2026!");
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
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="password" 
                  className="block text-xs font-semibold text-foreground/90"
                >
                  Kata Sandi Akun
                </label>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[10px] text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                  title="Gunakan akun admin demo"
                >
                  <Sparkles size={11} />
                  <span>Isi Akun Admin</span>
                </button>
              </div>

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

            <button 
              type="submit"
              disabled={isLoading || isSuccess}
              className="liquid-sheen w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white p-3 rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-950/20 hover:shadow-emerald-700/30 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? "Memverifikasi Kredensial..." : "Masuk ke Sistem Tarbiyah"}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Bottom Link to Register */}
          <div className="pt-3 border-t border-border/40 text-center space-y-2 text-xs">
            <p className="text-muted-foreground">
              Belum memiliki akun pengelola atau wali?{" "}
              <Link 
                href="/auth/register" 
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Daftar Akun Baru
              </Link>
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
