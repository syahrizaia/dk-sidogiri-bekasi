"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Building2,
  Compass,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Award,
  ScrollText,
  Quote
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Decorative Ambient Orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 flex items-center justify-center opacity-30 dark:opacity-20">
        <div className="w-[850px] h-[850px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-amber-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Hero Section: Mengenal Darul Khidmah Sidogiri Bekasi */}
      <section className="rounded-[32px] liquid-glass-elevated p-8 sm:p-12 mb-12 border border-white/60 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/15 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span>Profil Resmi Yayasan & Ekosistem Pendidikan</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Mengenal Darul Khidmah Sidogiri Bekasi
          </h1>

          <p className="text-base sm:text-lg text-emerald-800 dark:text-emerald-300 font-serif italic">
            &ldquo;Khidmah Lil-Ma&apos;had Wal-Ummah — Meneguhkan Sanad Keilmuan, Menjaga Akhlak Salaf, dan Mencetak Generasi Qur&apos;ani.&rdquo;
          </p>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Darul Khidmah Sidogiri Bekasi merupakan representasi pengabdian para alumni dan muhibbin Pondok Pesantren Sidogiri Pasuruan di wilayah Jawa Barat dan Jabodetabek. Menghadirkan lingkungan belajar yang teduh, berdisiplin tinggi, serta memadukan kurikulum pendidikan formal madrasah dan tradisi keilmuan salaf yang otentik.
          </p>

          {/* Quick Stats Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-3.5 rounded-2xl liquid-glass-card text-center border border-white/40 dark:border-white/5">
              <span className="block text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">1745 M</span>
              <span className="text-[11px] font-medium text-muted-foreground">Sanad Sidogiri</span>
            </div>
            <div className="p-3.5 rounded-2xl liquid-glass-card text-center border border-white/40 dark:border-white/5">
              <span className="block text-2xl font-black text-teal-700 dark:text-teal-400 font-mono">2</span>
              <span className="text-[11px] font-medium text-muted-foreground">Lembaga Aktif</span>
            </div>
            <div className="p-3.5 rounded-2xl liquid-glass-card text-center border border-white/40 dark:border-white/5">
              <span className="block text-2xl font-black text-cyan-700 dark:text-cyan-400 font-mono">1</span>
              <span className="text-[11px] font-medium text-muted-foreground">Persiapan MTs</span>
            </div>
            <div className="p-3.5 rounded-2xl liquid-glass-card text-center border border-white/40 dark:border-white/5">
              <span className="block text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">100%</span>
              <span className="text-[11px] font-medium text-muted-foreground">Aswaja Asy&apos;ariyah</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sejarah & Sanad Keilmuan Sidogiri */}
      <section className="mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <ScrollText size={13} />
            <span>Akar Sejarah & Sanad Salaf</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Warisan Keilmuan Sayyid Sulaiman Sejak 1745 M
          </h2>

          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              Pondok Pesantren Sidogiri di Pasuruan, Jawa Timur, didirikan pada tahun <strong>1745 M (1158 H)</strong> oleh ulama besar pejuang dakwah, <strong>Sayyid Sulaiman</strong> (cucu Sunan Gunung Jati Cirebon), bersama santri pertamanya <strong>Kiai Aminullah</strong> dari Pulau Bawean. Selama hampir tiga abad, Sidogiri teguh mempertahankan nilai kemandirian tanpa bantuan asing yang mengikat, keikhlasan total, dan pengajaran ilmu agama berasaskan <em>Ahlussunnah wal Jama&apos;ah</em>.
            </p>
            <p>
              Berangkat dari kerinduan masyarakat perkotaan akan pendidikan Islam yang berakar kuat pada nilai-nilai keteladanan Sidogiri, para alumni mendirikan <strong>Darul Khidmah Sidogiri Bekasi</strong>. Lembaga ini hadir sebagai rumah khidmah yang menyambungkan sanad keilmuan para masyayikh kepada generasi muda di Bekasi dan sekitarnya.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-foreground flex items-start gap-3">
            <Quote className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="italic">
              &ldquo;Tujuan utama pesantren bukanlah mencetak sarjana gelar semata, melainkan mencetak hamba-hamba Allah yang bertakwa, beradab mulia, dan berkhidmah tulus bagi agama serta masyarakat.&rdquo;
            </p>
          </div>
        </div>

        {/* Visual Card: Prinsip Khidmah */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl liquid-glass-card liquid-sheen p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white shadow-md">
                <GraduationCap size={24} />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Khidmah Santri Sidogiri</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Prinsip Pokok Pendidikan</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs">
              {[
                { title: "Tafaqquh fid-Din", desc: "Mendalami hukum syariat melalui kajian kitab turats (kitab kuning) standar Sidogiri." },
                { title: "Metode Tartil Sidogiri", desc: "Kefasihan membaca Al-Qur'an bersanad muttashil melalui tahapan 6 jilid." },
                { title: "Integritas & Akhlaqul Karimah", desc: "Memprioritaskan adab sebelum ilmu, hormat kepada guru, dan cinta ulama." },
                { title: "Kemandirian Hidup (Berdikari)", desc: "Meneladani jiwa wirausaha dan kemandirian pondok pesantren induk." }
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                  <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block">{item.title}</strong>
                    <span className="text-muted-foreground leading-tight block mt-0.5">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Visi & Misi Yayasan */}
      <section className="mb-12">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
            <Award size={13} />
            <span>Arah Langkah & Cita-Cita</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Visi & Misi Darul Khidmah Sidogiri Bekasi
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Panduan kompas strategis dalam menyelenggarakan pendidikan formal madrasah dan pengasuhan santri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Visi Card */}
          <div className="rounded-3xl liquid-glass-card p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Compass size={20} />
              </div>
              <h3 className="text-xl font-bold text-foreground">Visi Utama</h3>
              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
                &ldquo;Terwujudnya lembaga pendidikan Islam yang unggul, mandiri, dan berkarakter mulia berdasarkan ajaran Ahlussunnah wal Jama&apos;ah ala Thoriqoti Salafis Shalihin, serta mampu berkontribusi nyata bagi kemaslahatan umat dan peradaban bangsa.&rdquo;
              </p>
            </div>
            <div className="pt-6 border-t border-border/40 mt-6 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
              <ShieldCheck size={14} />
              <span>Berlandaskan Akidah Asy&apos;ariyah & Mazhab Syafi&apos;i</span>
            </div>
          </div>

          {/* Misi Card */}
          <div className="rounded-3xl liquid-glass-card p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-lg space-y-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Sparkles size={20} />
            </div>
            <h3 className="text-xl font-bold text-foreground">Misi Pengabdian</h3>
            <ol className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">1.</span>
                <span>Menyelenggarakan pendidikan formal madrasah (MI & persiapan MTs) yang memadukan kedalaman ilmu syariah dan kurikulum nasional terpadu.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">2.</span>
                <span>Menumbuhkan keteladanan adab salaf, sopan santun, serta keikhlasan dalam seluruh aspek pergaulan santri dan asatidz.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">3.</span>
                <span>Membina kemampuan baca tulis dan tahfizh Al-Qur&apos;an secara tartil, fasih, dan bertajwid menggunakan metode khas Sidogiri.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">4.</span>
                <span>Membentuk santri berjiwa mandiri, tangguh, berwawasan luas, dan siap berkhidmah di tengah masyarakat majemuk.</span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Panca Jiwa Pesantren Sidogiri */}
      <section className="mb-12">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
            <HeartHandshake size={13} />
            <span>Fondasi Karakter Santri</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Panca Jiwa Pondok Pesantren
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Lima nilai luhur pembentuk karakter santri Darul Khidmah Sidogiri Bekasi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              title: "1. Keikhlasan",
              sub: "Lillahi Ta'ala",
              desc: "Berbuat dan menuntut ilmu semata-mata mencari keridhaan Allah SWT tanpa pamrih keduniaan.",
              color: "emerald"
            },
            {
              title: "2. Kesederhanaan",
              sub: "Al-Qana'ah",
              desc: "Hidup bersahaja, wajar, bersyukur, serta mengedepankan ketahanan jiwa di atas kemewahan materi.",
              color: "teal"
            },
            {
              title: "3. Kemandirian",
              sub: "Berdikari",
              desc: "Sanggup menolong diri sendiri, bertanggung jawab atas amanah, dan tidak berpangku tangan.",
              color: "cyan"
            },
            {
              title: "4. Ukhuwah Islamiyah",
              sub: "Persaudaraan Suci",
              desc: "Saling menyayangi, tolong-menolong, dan menjaga ikatan batin sesama santri dan umat Islam.",
              color: "amber"
            },
            {
              title: "5. Bebas Terarah",
              sub: "Berwawasan Luas",
              desc: "Berpikir cerdas, dinamis, dan objektif dalam koridor syariat Islam Ahlussunnah wal Jama'ah.",
              color: "indigo"
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl liquid-glass-card p-5 border border-white/50 dark:border-white/5 shadow-md flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200"
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                  {item.sub}
                </span>
                <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Rincian Lembaga Pendidikan Resmi di Bekasi (STRICT: MI, MTs, TPQ - NO MA) */}
      <section className="mb-12">
        <div className="rounded-[32px] liquid-glass-elevated p-8 sm:p-10 border border-white/60 dark:border-white/10 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              <Building2 size={13} />
              <span>Struktur Jenjang Pendidikan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Lembaga Pendidikan yang Diselenggarakan
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
              Darul Khidmah Sidogiri Bekasi berfokus menyelenggarakan jenjang pendidikan dasar dan menengah pertama: <strong>Madrasah Ibtidaiyah (MI) Miftahul Ulum</strong> yang beroperasi aktif, persiapan pembukaan <strong>Madrasah Tsanawiyah (MTs) Miftahul Ulum</strong> tahun depan, serta <strong>TPQ Al-Qur&apos;an Metode Tartil Sidogiri</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lembaga 1: MI Miftahul Ulum (Aktif) */}
            <div className="rounded-3xl liquid-glass-card p-6 border border-emerald-500/30 shadow-lg relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <BookOpen size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                    Beroperasi Aktif
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground">Madrasah Ibtidaiyah (MI)</h3>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">MI Miftahul Ulum Darul Khidmah Sidogiri Bekasi</p>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  Pendidikan tingkat dasar setara SD dengan perpaduan kurikulum Kementerian Agama dan kurikulum kepesantrenan Sidogiri (kitab kuning dasar, fiqih ibadah, nahwu shorof, dan akhlak).
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-border/40">
                <Link
                  href="/instansi/mi"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  <span>Selengkapnya tentang MI</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Lembaga 2: MTs Miftahul Ulum (Persiapan Pembukaan Tahun Depan) */}
            <div className="rounded-3xl liquid-glass-card p-6 border border-teal-500/30 shadow-lg relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Building2 size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30">
                    Buka Tahun Depan
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground">Madrasah Tsanawiyah (MTs)</h3>
                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">MTs Miftahul Ulum Darul Khidmah Sidogiri Bekasi</p>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  Jenjang lanjutan tingkat menengah pertama setara SMP. Saat ini sedang dalam tahap finalisasi persiapan operasional dan infrastruktur untuk menerima santri angkatan pertama tahun ajaran baru mendatang.
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-border/40">
                <Link
                  href="/instansi/mts"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:underline"
                >
                  <span>Progres Persiapan MTs</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Lembaga 3: TPQ Al-Qur'an Sidogiri (Aktif) */}
            <div className="rounded-3xl liquid-glass-card p-6 border border-amber-500/30 shadow-lg relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Compass size={24} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                    Metode Tartil
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground">TPQ Al-Qur&apos;an Sidogiri</h3>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">Taman Pendidikan Al-Qur&apos;an</p>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  Program pendidikan tilawah Al-Qur&apos;an 6 jilid dengan sanad Metode Tartil Sidogiri Pasuruan. Menjamin kefasihan makhraj huruf, kaidah tajwid aplikatif, dan adab tilawah.
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-border/40">
                <Link
                  href="/instansi/tpq"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
                >
                  <span>Detail Metode TPQ</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Informasi Lokasi & Kontak Hubungi Kami */}
      <section className="rounded-3xl liquid-glass-card p-8 sm:p-10 border border-white/60 dark:border-white/10 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-pill text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <MapPin size={13} />
              <span>Sekretariat & Asrama</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Kunjungi Darul Khidmah Sidogiri Bekasi
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Kami menyambut hangat para orang tua, wali santri, alumni, dan kaum muslimin yang ingin bersilaturahmi atau mendaftarkan putra-putrinya ke lembaga pendidikan kami.
            </p>

            <div className="space-y-2.5 text-xs text-foreground/90 pt-2">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Jl. Khidmah Sidogiri No. 19, Bekasi, Jawa Barat 17111</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <span>+62 812-8888-2026 (Sekretariat PSB)</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>info@sidogiri-bekasi.sch.id</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link
              href="/santri-baru"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>Daftar Santri Baru (PSB)</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/modules"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full liquid-glass-pill hover:bg-white/40 dark:hover:bg-white/10 text-foreground text-xs font-bold transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>Masuk Portal Modul</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
