"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction } from "@/lib/actions/auth";
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "staff",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Kata sandi minimal harus 6 karakter.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await registerAction({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal membuat akun.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/modules");
        router.refresh();
      }, 700);
    } catch {
      setErrorMessage("Terjadi gangguan saat memproses pendaftaran akun.");
      setIsLoading(false);
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
            <span>Pendaftaran Akun Baru</span>
          </div>
        </div>

        {/* Apple Liquid Glass Card */}
        <div className="liquid-glass-elevated rounded-[32px] p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-white/10 space-y-6 relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="space-y-3 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/20">
              <UserCheck size={24} />
            </div>

            <div className="space-y-1">
              <p className="font-serif text-lg text-emerald-800/90 dark:text-emerald-300/90">
                أَهْلاً وَسَهْلاً
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Registrasi Akun Tarbiyah
              </h1>
              <p className="text-xs text-muted-foreground">
                Darul Khidmah Sidogiri Bekasi
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
              <span>Akun berhasil didaftarkan. Mengarahkan ke modul sistem...</span>
            </div>
          )}

          {/* Form Inputs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label 
                htmlFor="name" 
                className="block text-xs font-semibold text-foreground/90"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  required
                  placeholder="Ustadz / Ustadzah / Nama Wali"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md pl-11 pr-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label 
                htmlFor="email" 
                className="block text-xs font-semibold text-foreground/90"
              >
                Alamat Email Aktif
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  required
                  placeholder="nama@sidogiri-bekasi.sch.id"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md pl-11 pr-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label 
                htmlFor="role" 
                className="block text-xs font-semibold text-foreground/90"
              >
                Peran Pengguna
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md px-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all cursor-pointer"
              >
                <option value="staff">Staf Administrasi / Tata Usaha</option>
                <option value="teacher">Dewan Asatidz / Guru Madrasah & TPQ</option>
                <option value="parent">Wali Santri / Orang Tua Murid</option>
              </select>
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
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md pl-11 pr-11 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label 
                htmlFor="confirmPassword" 
                className="block text-xs font-semibold text-foreground/90"
              >
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="confirmPassword" 
                  name="confirmPassword"
                  required
                  placeholder="Ulangi kata sandi"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-black/30 backdrop-blur-md pl-11 pr-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/60 shadow-sm transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading || isSuccess}
              className="liquid-sheen w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-500 text-white p-3 rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-950/20 hover:shadow-emerald-700/30 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? "Mendaftarkan Akun..." : "Daftar Akun Pengguna"}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Bottom Link to Login */}
          <div className="pt-3 border-t border-border/40 text-center space-y-2 text-xs">
            <p className="text-muted-foreground">
              Sudah memiliki akun terdaftar?{" "}
              <Link 
                href="/auth/login" 
                className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Masuk di Sini
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
