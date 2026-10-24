import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

const client = new MongoClient(uri);

// Foto profil kosong default
const EMPTY_PHOTO = "";

async function run() {
  await client.connect();
  const db = client.db("dk-sidogiri-bekasi");
  console.log("Connected to MongoDB Atlas: dk-sidogiri-bekasi");

  // =========================================================================
  // 1. SEED / UPDATE: organization_members
  // =========================================================================
  const orgCol = db.collection("organization_members");
  await orgCol.createIndex({ category: 1, order: 1 });
  await orgCol.createIndex({ isActive: 1 });

  const existingOrgCount = await orgCol.countDocuments();
  console.log(`Current organization_members count: ${existingOrgCount}`);

  if (existingOrgCount === 0) {
    const defaultMembers = [
      // PENASIHAT
      {
        name: "KH. Fuad Noerhasan",
        title: "Majelis Masyayikh & Pembina Utama",
        category: "PENASIHAT",
        department: "Pondok Pesantren Sidogiri Pasuruan",
        photoUrl: EMPTY_PHOTO,
        period: "Masa Khidmah Berkelanjutan",
        bio: "Pengasuh Pondok Pesantren Sidogiri Pasuruan, pembimbing sanad keilmuan dan arah dakwah ranting.",
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Habib Ali bin Hasan Al-Attas",
        title: "Penasihat Keagamaan Ranting",
        category: "PENASIHAT",
        department: "Majelis Habaib Bekasi",
        photoUrl: EMPTY_PHOTO,
        period: "2024 - 2029",
        bio: "Ulama sepuh pembina majelis taklim dan silaturahmi ulama-habaib wilayah Bekasi.",
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
      },

      // PIMPINAN
      {
        name: "KH. Bahruddin Thohir",
        title: "Ketua Pengurus Ranting",
        category: "PIMPINAN",
        department: "Pengurus Harian Ranting",
        photoUrl: EMPTY_PHOTO,
        period: "2024 - 2029",
        bio: "Alumni Senior Sidogiri, memimpin pengembangan dakwah, wakaf, dan operasional ranting Bekasi.",
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "H. Abdullah Syukri",
        title: "Wakil Ketua Ranting",
        category: "PIMPINAN",
        department: "Pengurus Harian Ranting",
        photoUrl: EMPTY_PHOTO,
        period: "2024 - 2029",
        bio: "Mengoordinasikan hubungan kelembagaan, kemitraan wali santri, dan pengawasan program.",
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "M. Ridwan Ansori",
        title: "Sekretaris Ranting & Yayasan",
        category: "PIMPINAN",
        department: "Sekretariat Terpadu",
        photoUrl: EMPTY_PHOTO,
        period: "2024 - 2029",
        bio: "Mengelola tata kelola administrasi surat-menyurat, legalitas yayasan, dan sistem digital.",
        order: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "H. Muhammad Arsyad",
        title: "Bendahara Umum",
        category: "PIMPINAN",
        department: "Biro Keuangan & Wakaf",
        photoUrl: EMPTY_PHOTO,
        period: "2024 - 2029",
        bio: "Bertanggung jawab atas akuntabilitas keuangan tarbiyah, dana jariyah, dan kas yayasan.",
        order: 4,
        isActive: true,
        createdAt: new Date().toISOString(),
      },

      // KEPALA UNIT
      {
        name: "Ust. M. Sholeh Al-Bantani, S.Pd.I",
        title: "Kepala Madrasah Ibtidaiyah",
        category: "KEPALA_UNIT",
        department: "Madrasah Miftahul Ulum (MI)",
        photoUrl: EMPTY_PHOTO,
        period: "2024 - 2028",
        bio: "Memimpin pelaksanaan kurikulum integratif salaf-kemenag jenjang MI Miftahul Ulum.",
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Ust. Abdullah Faqih, M.Ag",
        title: "Kepala Persiapan MTs",
        category: "KEPALA_UNIT",
        department: "Madrasah Tsanawiyah (MTs)",
        photoUrl: EMPTY_PHOTO,
        period: "2025 - 2029",
        bio: "Mengawal persiapan pembukaan operasional dan kurikulum lanjutan Tsanawiyah.",
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Ust. Ahmad Fauzi",
        title: "Kepala TPQ Al-Qur'an",
        category: "KEPALA_UNIT",
        department: "TPQ Tartil Sidogiri",
        photoUrl: EMPTY_PHOTO,
        period: "2024 - 2028",
        bio: "Pembina sanad Metode Tartil Pasuruan 6 jilid untuk anak-anak dan santri cilik.",
        order: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
      },

      // BIDANG SEKSI
      {
        name: "Ust. Muhsin Zaini",
        title: "Koordinator Tarbiyah & Asrama",
        category: "BIDANG_SEKSI",
        department: "Pengasuhan Santri Mukim",
        photoUrl: EMPTY_PHOTO,
        period: "2024 - 2027",
        bio: "Mengatur kedisiplinan sholat berjamaah, halaqah taklim malam, dan tata tertib asrama.",
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Ust. Hasan Basri",
        title: "Koordinator Keamanan & Ketertiban",
        category: "BIDANG_SEKSI",
        department: "Biro Keamanan Kompleks",
        photoUrl: EMPTY_PHOTO,
        period: "2024 - 2027",
        bio: "Menjaga keamanan lingkungan pesantren, pintu gerbang, dan perizinan keluar-masuk.",
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Ust. Ilham Kurniawan",
        title: "Koordinator Sarana & Prasarana",
        category: "BIDANG_SEKSI",
        department: "Biro Perlengkapan",
        photoUrl: EMPTY_PHOTO,
        period: "2024 - 2027",
        bio: "Memelihara fasilitas asrama, ruang kelas madrasah, musholla, dan infrastruktur umum.",
        order: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        name: "Ust. Dani Hamdani",
        title: "Koordinator Humas & Ikatan Alumni (IASS)",
        category: "BIDANG_SEKSI",
        department: "Biro Humas & Kemitraan",
        photoUrl: EMPTY_PHOTO,
        period: "2024 - 2027",
        bio: "Menghubungkan ranting dengan Pengurus Pusat IASS Pasuruan dan masyarakat luas.",
        order: 4,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    await orgCol.insertMany(defaultMembers);
    console.log(`Inserted ${defaultMembers.length} organization members.`);
  }

  // =========================================================================
  // 2. SEED / UPDATE: about_contents
  // =========================================================================
  const aboutCol = db.collection("about_contents");
  const existingAbout = await aboutCol.findOne({ id: "global_about_content" });
  if (!existingAbout) {
    const defaultAbout = {
      id: "global_about_content",
      heroTagline: "Khidmah Lil-Ma'had Wal-Ummah — Meneguhkan Sanad Keilmuan, Menjaga Akhlak Salaf, dan Mencetak Generasi Qur'ani.",
      heroDescription:
        "Darul Khidmah Sidogiri Bekasi merupakan representasi pengabdian para alumni dan muhibbin Pondok Pesantren Sidogiri Pasuruan di wilayah Jawa Barat dan Jabodetabek. Menghadirkan lingkungan belajar yang teduh, berdisiplin tinggi, serta memadukan kurikulum pendidikan formal madrasah dan tradisi keilmuan salaf yang otentik.",
      historyTitle: "Warisan Keilmuan Sayyid Sulaiman Sejak 1745 M",
      historyParagraphs: [
        "Pondok Pesantren Sidogiri di Pasuruan, Jawa Timur, didirikan pada tahun 1745 M (1158 H) oleh ulama besar pejuang dakwah, Sayyid Sulaiman (cucu Sunan Gunung Jati Cirebon), bersama santri pertamanya Kiai Aminullah dari Pulau Bawean. Selama hampir tiga abad, Sidogiri teguh mempertahankan nilai kemandirian tanpa bantuan asing yang mengikat, keikhlasan total, dan pengajaran ilmu agama berasaskan Ahlussunnah wal Jama'ah.",
        "Berangkat dari kerinduan masyarakat perkotaan akan pendidikan Islam yang berakar kuat pada nilai-nilai keteladanan Sidogiri, para alumni mendirikan Darul Khidmah Sidogiri Bekasi. Lembaga ini hadir sebagai rumah khidmah yang menyambungkan sanad keilmuan para masyayikh kepada generasi muda di Bekasi dan sekitarnya.",
      ],
      quote:
        "Tujuan utama pesantren bukanlah mencetak sarjana gelar semata, melainkan mencetak hamba-hamba Allah yang bertakwa, beradab mulia, dan berkhidmah tulus bagi agama serta masyarakat.",
      quoteAuthor: "Masyayikh Pondok Pesantren Sidogiri Pasuruan",
      vision:
        "Terwujudnya lembaga pendidikan Islam yang unggul, mandiri, dan berkarakter mulia berdasarkan ajaran Ahlussunnah wal Jama'ah ala Thoriqoti Salafis Shalihin, serta mampu berkontribusi nyata bagi kemaslahatan umat dan peradaban bangsa.",
      missions: [
        "Menyelenggarakan pendidikan formal madrasah (MI & persiapan MTs) yang memadukan kedalaman ilmu syariah dan kurikulum nasional terpadu.",
        "Menumbuhkan keteladanan adab salaf, sopan santun, serta keikhlasan dalam seluruh aspek pergaulan santri dan asatidz.",
        "Membina kemampuan baca tulis dan tahfizh Al-Qur'an secara tartil, fasih, dan bertajwid menggunakan metode khas Sidogiri.",
        "Membentuk santri berjiwa mandiri, tangguh, berwawasan luas, dan siap berkhidmah di tengah masyarakat majemuk.",
      ],
      pancaJiwa: [
        {
          title: "1. Keikhlasan",
          sub: "Lillahi Ta'ala",
          desc: "Berbuat dan menuntut ilmu semata-mata mencari keridhaan Allah SWT tanpa pamrih keduniaan.",
          color: "emerald",
        },
        {
          title: "2. Kesederhanaan",
          sub: "Al-Qana'ah",
          desc: "Hidup bersahaja, wajar, bersyukur, serta mengedepankan ketahanan jiwa di atas kemewahan materi.",
          color: "teal",
        },
        {
          title: "3. Kemandirian",
          sub: "Berdikari",
          desc: "Sanggup menolong diri sendiri, bertanggung jawab atas amanah, dan tidak berpangku tangan.",
          color: "cyan",
        },
        {
          title: "4. Ukhuwah Islamiyah",
          sub: "Persaudaraan Suci",
          desc: "Saling menyayangi, tolong-menolong, dan menjaga ikatan batin sesama santri dan umat Islam.",
          color: "amber",
        },
        {
          title: "5. Bebas Terarah",
          sub: "Berwawasan Luas",
          desc: "Berpikir cerdas, dinamis, dan objektif dalam koridor syariat Islam Ahlussunnah wal Jama'ah.",
          color: "indigo",
        },
      ],
      updatedAt: new Date().toISOString(),
      updatedBy: "Sistem (Inisialisasi Otomatis)",
    };

    await aboutCol.insertOne(defaultAbout);
    console.log("Seeded global_about_content into about_contents collection.");
  }

  // =========================================================================
  // 3. ENRICH: teachers collection with public attributes
  // =========================================================================
  const teachersCol = db.collection("teachers");
  const teachers = await teachersCol.find({}).sort({ nip: 1 }).toArray();
  console.log(`Enriching ${teachers.length} teachers with public photoUrl, academicYear, education, bio...`);

  let idx = 0;
  for (const t of teachers) {
    const photo = EMPTY_PHOTO;
    const academicYear = t.academicYear || "2026/2027";
    const education = t.education || "Alumni Pondok Pesantren Sidogiri Pasuruan";
    const publicBio =
      t.publicBio ||
      `Pengampu materi ${t.specialization || "kitab kuning"} dan pembina santri di Darul Khidmah Sidogiri Bekasi.`;
    const isPublic = t.isPublic !== undefined ? t.isPublic : true;
    const order = t.order !== undefined ? t.order : idx + 1;

    await teachersCol.updateOne(
      { _id: t._id },
      {
        $set: {
          photoUrl: photo,
          academicYear,
          education,
          publicBio,
          isPublic,
          order,
          updatedAt: new Date().toISOString(),
        },
      }
    );
    idx++;
  }

  console.log("Teachers collection successfully enriched for public About view!");
  await client.close();
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
