import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}
const client = new MongoClient(uri);

const DEFAULT_SUBJECTS = [
  // === MI ===
  {
    unit: "MI",
    code: "MI-DIN-01",
    name: "Fiqih Ibadah",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Fathul Qorib - Syaikh Ibn Qasim Al-Ghazi",
    grade: "Kelas 5-6",
    semester: "Semua",
    weeklyHours: 4,
    description: "Mempelajari hukum ibadah mahdhah (thaharah, shalat, zakat, puasa, haji) secara sistematis dengan metode sorogan dan bandongan.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-DIN-02",
    name: "Nahwu Dasar",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Al-Jurumiyah - Syaikh Ash-Shanhaji",
    grade: "Kelas 4-5",
    semester: "Semua",
    weeklyHours: 3,
    description: "Pengenalan dasar ilmu nahwu (tata bahasa Arab): kalam, isim, fi'il, huruf, i'rab, dan tanda-tanda i'rab.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-DIN-03",
    name: "Shorof I'lal",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Al-Amtsilah At-Tashrifiyah - KH. Ma'shum Ali",
    grade: "Kelas 4-6",
    semester: "Semua",
    weeklyHours: 3,
    description: "Tashrif lughawi & istilahi fi'il tsulatsi mujarrad hingga mazid beserta bina' dan kaidah i'lal dasar.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-DIN-04",
    name: "Aqidah & Tauhid",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Aqidatul Awam - Syaikh Ahmad Al-Marzuqi",
    grade: "Kelas 1-3",
    semester: "Semua",
    weeklyHours: 2,
    description: "Hafalan nazhom aqidah Ahlussunnah wal Jama'ah Asy'ariyah-Maturidiyah tentang sifat 20 wajib bagi Allah dan Rasul.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-DIN-05",
    name: "Akhlaq & Adab Santri",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Ta'limul Muta'allim - Imam Az-Zarnuji",
    grade: "Kelas 4-6",
    semester: "Semua",
    weeklyHours: 2,
    description: "Penanaman adab thalabul ilmi, memuliakan guru/kitab, tawakkal, dan tata krama pergaulan santri salaf.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-DIN-06",
    name: "Hadits Nabawi",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Arba'in An-Nawawiyah - Imam An-Nawawi",
    grade: "Kelas 5-6",
    semester: "Semua",
    weeklyHours: 2,
    description: "Hafalan matan dan pemahaman matan 42 hadits pokok ajaran Islam.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-KUM-01",
    name: "Bahasa Indonesia",
    category: "Kurikulum Nasional",
    kitabName: "Buku Paket Tematik Kemendikbud",
    grade: "Kelas 1-6",
    semester: "Semua",
    weeklyHours: 4,
    description: "Literasi, tata bahasa Indonesia baku, membaca pemahaman, dan menulis karangan narasi serta deskripsi.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-KUM-02",
    name: "Matematika",
    category: "Kurikulum Nasional",
    kitabName: "Buku Matematika Kurikulum Merdeka",
    grade: "Kelas 1-6",
    semester: "Semua",
    weeklyHours: 4,
    description: "Aritmatika, logika berhitung, bangun datar, pecahan, dan pemecahan masalah kuantitatif dasar.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-KUM-03",
    name: "Ilmu Pengetahuan Alam & Sosial (IPAS)",
    category: "Kurikulum Nasional",
    kitabName: "Buku IPAS Kurikulum Merdeka",
    grade: "Kelas 4-6",
    semester: "Semua",
    weeklyHours: 3,
    description: "Sains alamiah, makhluk hidup, siklus air, energi, serta dinamika keragaman sosial budaya Nusantara.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MI",
    code: "MI-KUM-04",
    name: "Pendidikan Pancasila & Kewarganegaraan",
    category: "Kurikulum Nasional",
    kitabName: "Buku Pendidikan Pancasila Kemendikbud",
    grade: "Kelas 1-6",
    semester: "Semua",
    weeklyHours: 2,
    description: "Penanaman jiwa nasionalisme, toleransi, cinta tanah air, dan ketaatan hukum negara.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // === MTs ===
  {
    unit: "MTs",
    code: "MTS-DIN-01",
    name: "Fiqih Menengah",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Fathul Mu'in bi Syarh Qurratil 'Ain - Syaikh Zainuddin Al-Malibari",
    grade: "Kelas 7-9",
    semester: "Semua",
    weeklyHours: 4,
    description: "Kajian fiqih Syafi'iyah mendalam disertai dalil furu'iyah, khilafiyah antar ashhab Syafi'i, dan qaul mu'tamad.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MTs",
    code: "MTS-DIN-02",
    name: "Nahwu Lanjutan",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Syarh Ibnu 'Aqil 'ala Alfiyyah Ibni Malik",
    grade: "Kelas 7-9",
    semester: "Semua",
    weeklyHours: 4,
    description: "Kajian gramatika bahasa Arab nazhom 1.000 bait Alfiyyah Ibni Malik beserta syarah i'rab dan syawahid sya'ir Arab kuno.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MTs",
    code: "MTS-DIN-03",
    name: "Ushul Fiqh",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Al-Waraqat fi Ushulil Fiqh - Imam Al-Haramain Al-Juwaini",
    grade: "Kelas 8-9",
    semester: "Semua",
    weeklyHours: 3,
    description: "Kaidah penggalian hukum syara' dari Al-Quran dan As-Sunnah (am-khas, muthlaq-muqayyad, nasakh, ijma', qiyas).",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MTs",
    code: "MTS-DIN-04",
    name: "Kaidah Fiqhiyyah",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Al-Faraidul Bahiyyah fi Qawa'idil Fiqhiyyah - Syaikh Mahmud Al-Ahdal",
    grade: "Kelas 8-9",
    semester: "Semua",
    weeklyHours: 2,
    description: "Panca kaidah asasi fiqhiyyah dan cabang kaidah kulliyah untuk menjawab problematika hukum Islam kontemporer.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MTs",
    code: "MTS-DIN-05",
    name: "Musthalah Hadits",
    category: "Kitab Kuning / Diniyah",
    kitabName: "Al-Manzhumah Al-Baiquniyah - Syaikh Thaha Al-Baiquni",
    grade: "Kelas 7-8",
    semester: "Semua",
    weeklyHours: 2,
    description: "Istilah dan metodologi kritik hadits: shahih, hasan, dha'if, muttashil, munqathi', maudhu', dan tadlis.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MTs",
    code: "MTS-KUM-01",
    name: "Bahasa Inggris Komunikatif",
    category: "Kurikulum Nasional",
    kitabName: "English in Mind & Cambridge Lower Secondary",
    grade: "Kelas 7-9",
    semester: "Semua",
    weeklyHours: 3,
    description: "Grammar, reading comprehension, listening, and active Islamic-themed speaking skills.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MTs",
    code: "MTS-KUM-02",
    name: "Matematika Menengah",
    category: "Kurikulum Nasional",
    kitabName: "Buku Matematika SMP/MTs Kurikulum Merdeka",
    grade: "Kelas 7-9",
    semester: "Semua",
    weeklyHours: 4,
    description: "Aljabar, fungsi linier, geometri ruang, pythagoras, statistika, dan peluang.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "MTs",
    code: "MTS-KUM-03",
    name: "Ilmu Pengetahuan Alam (Fisika & Biologi)",
    category: "Kurikulum Nasional",
    kitabName: "Buku IPA SMP/MTs Kurikulum Merdeka",
    grade: "Kelas 7-9",
    semester: "Semua",
    weeklyHours: 4,
    description: "Zat dan perubahannya, gerak dan gaya, sel hidup, pewarisan sifat, serta ekosistem.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // === TPQ ===
  {
    unit: "TPQ",
    code: "TPQ-TRT-01",
    name: "Metode Tartil Sidogiri Jilid 1 - 3",
    category: "Tahfidz & Al-Quran",
    kitabName: "Buku Panduan Metode Tartil Pasuruan (Jilid 1-3)",
    grade: "Jilid 1-3",
    semester: "Semua",
    weeklyHours: 6,
    description: "Pengenalan makharijul huruf hijaiyah, harakat kasrah-dhammah-fathah, bacaan panjang mad thabi'i, dan latihan kelancaran membaca.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "TPQ",
    code: "TPQ-TRT-02",
    name: "Metode Tartil Sidogiri Jilid 4 - 6",
    category: "Tahfidz & Al-Quran",
    kitabName: "Buku Panduan Metode Tartil Pasuruan (Jilid 4-6)",
    grade: "Jilid 4-6",
    semester: "Semua",
    weeklyHours: 6,
    description: "Waqaf wal ibtida', tanda saktah, tasydid, ghunnah, qalqalah, serta bacaan gharib sesuai kaidah qira'ah Ashim riwayat Hafs.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "TPQ",
    code: "TPQ-TAJ-01",
    name: "Ilmu Tajwid Nazhom",
    category: "Tahfidz & Al-Quran",
    kitabName: "Tuhfatul Athfal - Syaikh Sulaiman Al-Jamzuri",
    grade: "Al-Quran",
    semester: "Semua",
    weeklyHours: 3,
    description: "Hafalan matan nazhom Tuhfatul Athfal: hukum nun mati, tanwin, mim mati, hukum mad, dan ahkamul lam wal fi'l.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "TPQ",
    code: "TPQ-HAF-01",
    name: "Tahfidz Al-Qur'an Juz 30 & Pilihan",
    category: "Tahfidz & Al-Quran",
    kitabName: "Mushaf Al-Qur'an Rasm Utsmani",
    grade: "Semua Tingkat",
    semester: "Semua",
    weeklyHours: 5,
    description: "Hafalan mutqin surat An-Nas sampai An-Naba' beserta do'a khatam Al-Qur'an dan muraja'ah rutin.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    unit: "TPQ",
    code: "TPQ-IBD-01",
    name: "Praktik Shalat & Doa Sehari-hari",
    category: "Muatan Lokal",
    kitabName: "Risalah Tuntunan Shalat Lengkap & Khulashoh Doa",
    grade: "Semua Tingkat",
    semester: "Semua",
    weeklyHours: 2,
    description: "Bimbingan langsung gerakan, bacaan shalat fardhu, wudhu, doa qunut, adzan, iqamah, dan dzikir ba'da shalat.",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_SCHEDULES = [
  // === MI ===
  { unit: "MI", day: "Sabtu", startTime: "07:30", endTime: "09:00", activityType: "KBM", grade: "Kelas 4-6", room: "Ruang Kelas MI-A", subjectId: "", subjectName: "Matematika", teacherId: "", teacherName: "", notes: "Kurikulum Nasional", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "MI", day: "Sabtu", startTime: "09:15", endTime: "10:45", activityType: "Ta'lim Kitab", grade: "Kelas 5-6", room: "Majelis Tarbiyah", subjectId: "", subjectName: "Fiqih Ibadah (Fathul Qorib)", teacherId: "", teacherName: "", notes: "Metode Bandongan", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "MI", day: "Ahad", startTime: "07:30", endTime: "09:00", activityType: "Ta'lim Kitab", grade: "Kelas 4-5", room: "Majelis Tarbiyah", subjectId: "", subjectName: "Nahwu Dasar (Al-Jurumiyah)", teacherId: "", teacherName: "", notes: "Metode Sorogan", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "MI", day: "Ahad", startTime: "09:15", endTime: "10:45", activityType: "KBM", grade: "Kelas 4-6", room: "Ruang Kelas MI-B", subjectId: "", subjectName: "Bahasa Indonesia", teacherId: "", teacherName: "", notes: "Kurikulum Nasional", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "MI", day: "Senin", startTime: "07:30", endTime: "09:00", activityType: "Ta'lim Kitab", grade: "Kelas 5-6", room: "Majelis Tarbiyah", subjectId: "", subjectName: "Hadits Nabawi (Arba'in An-Nawawiyah)", teacherId: "", teacherName: "", notes: "Hafalan & Pemahaman", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "MI", day: "Selasa", startTime: "07:30", endTime: "09:00", activityType: "Ta'lim Kitab", grade: "Kelas 4-6", room: "Majelis Tarbiyah", subjectId: "", subjectName: "Akhlaq (Ta'limul Muta'allim)", teacherId: "", teacherName: "", notes: "Hafalan Nazhom & Syarah", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "MI", day: "Rabu", startTime: "07:30", endTime: "09:00", activityType: "KBM", grade: "Kelas 4-6", room: "Ruang Kelas MI-A", subjectId: "", subjectName: "Ilmu Pengetahuan Alam & Sosial", teacherId: "", teacherName: "", notes: "Kurikulum Merdeka", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "MI", day: "Kamis", startTime: "07:30", endTime: "08:30", activityType: "Praktik Ibadah", grade: "Kelas 4-6", room: "Musholla Kompleks", subjectId: "", subjectName: "Praktik Shalat & Wudhu", teacherId: "", teacherName: "", notes: "Bimbingan langsung", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  // === MTs ===
  { unit: "MTs", day: "Sabtu", startTime: "07:30", endTime: "09:30", activityType: "Ta'lim Kitab", grade: "Persiapan MTs", room: "Majelis Kitab Kuning", subjectId: "", subjectName: "Nahwu Lanjutan (Alfiyyah Ibni Malik)", teacherId: "", teacherName: "", notes: "Hafalan bait & i'rab", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "MTs", day: "Ahad", startTime: "07:30", endTime: "09:30", activityType: "Ta'lim Kitab", grade: "Persiapan MTs", room: "Majelis Kitab Kuning", subjectId: "", subjectName: "Fiqih Menengah (Fathul Mu'in)", teacherId: "", teacherName: "", notes: "Kajian mendalam", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "MTs", day: "Senin", startTime: "07:30", endTime: "09:00", activityType: "KBM", grade: "Persiapan MTs", room: "Ruang Kelas MTs-A", subjectId: "", subjectName: "Ilmu Pengetahuan Alam (IPA)", teacherId: "", teacherName: "", notes: "Kurikulum Nasional", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "MTs", day: "Selasa", startTime: "07:30", endTime: "09:00", activityType: "Ta'lim Kitab", grade: "Persiapan MTs", room: "Majelis Kitab Kuning", subjectId: "", subjectName: "Ushul Fiqh (Al-Waraqat)", teacherId: "", teacherName: "", notes: "Kaidah fiqhiyyah", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "MTs", day: "Rabu", startTime: "07:30", endTime: "09:00", activityType: "KBM", grade: "Persiapan MTs", room: "Ruang Kelas MTs-A", subjectId: "", subjectName: "Matematika Menengah", teacherId: "", teacherName: "", notes: "Kurikulum Nasional", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "MTs", day: "Kamis", startTime: "07:30", endTime: "09:00", activityType: "KBM", grade: "Persiapan MTs", room: "Ruang Kelas MTs-A", subjectId: "", subjectName: "Bahasa Inggris Komunikatif", teacherId: "", teacherName: "", notes: "Kurikulum Nasional", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  // === TPQ ===
  { unit: "TPQ", day: "Sabtu", startTime: "07:00", endTime: "08:30", activityType: "Tahfidz / Tadarus", grade: "Jilid 1-6", room: "Halaqah TPQ-A", subjectId: "", subjectName: "Metode Tartil Sidogiri Jilid 1-6", teacherId: "", teacherName: "", notes: "Setoran & Muraja'ah", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "TPQ", day: "Sabtu", startTime: "08:45", endTime: "09:45", activityType: "Ta'lim Kitab", grade: "Semua Jilid", room: "Halaqah TPQ-B", subjectId: "", subjectName: "Aqidatul Awam & Doa Harian", teacherId: "", teacherName: "", notes: "Hafalan nazhom", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "TPQ", day: "Ahad", startTime: "07:00", endTime: "08:30", activityType: "Tahfidz / Tadarus", grade: "Al-Quran", room: "Halaqah TPQ-A", subjectId: "", subjectName: "Tajwid Nazhom (Tuhfatul Athfal)", teacherId: "", teacherName: "", notes: "Teori & Praktik", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "TPQ", day: "Senin", startTime: "07:00", endTime: "08:30", activityType: "Tahfidz / Tadarus", grade: "Semua Jilid", room: "Halaqah TPQ-A", subjectId: "", subjectName: "Tahfidz Juz 30 (Juz Amma)", teacherId: "", teacherName: "", notes: "Setoran harian", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { unit: "TPQ", day: "Selasa", startTime: "07:00", endTime: "08:00", activityType: "Praktik Ibadah", grade: "Semua Jilid", room: "Musholla Kompleks", subjectId: "", subjectName: "Praktik Shalat & Wudhu", teacherId: "", teacherName: "", notes: "Bimbingan langsung", status: "Active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

async function seed() {
  try {
    await client.connect();
    const db = client.db('dk-sidogiri-bekasi');
    const teachersCollection = db.collection('teachers');
    const allTeachers = await teachersCollection.find({}).toArray();

    // 1. Seed Subjects
    const subjectsCollection = db.collection('subjects');
    const existingSubjectsCount = await subjectsCollection.countDocuments();
    console.log(`Current subjects count: ${existingSubjectsCount}`);
    if (existingSubjectsCount === 0) {
      const enrichedSubjects = DEFAULT_SUBJECTS.map((s) => {
        const matchedTeacher = allTeachers.find((t) => t.institution === s.unit);
        return {
          ...s,
          teacherId: matchedTeacher ? matchedTeacher._id.toString() : "",
          teacherName: matchedTeacher ? matchedTeacher.name : "",
        };
      });
      const res = await subjectsCollection.insertMany(enrichedSubjects);
      await subjectsCollection.createIndex({ unit: 1 });
      await subjectsCollection.createIndex({ unit: 1, code: 1 }, { unique: true });
      await subjectsCollection.createIndex({ status: 1 });
      console.log(`Inserted ${res.insertedCount} subjects with indexes!`);
    }

    // 2. Seed Schedules
    const schedulesCollection = db.collection('schedules');
    const existingSchedulesCount = await schedulesCollection.countDocuments();
    console.log(`Current schedules count: ${existingSchedulesCount}`);
    if (existingSchedulesCount === 0) {
      const allSubjects = await subjectsCollection.find({}).toArray();
      const enrichedSchedules = DEFAULT_SCHEDULES.map((s) => {
        const matchedTeacher = allTeachers.find((t) => t.institution === s.unit);
        const matchedSubject = allSubjects.find((sub) => sub.unit === s.unit && s.subjectName.toLowerCase().includes(sub.name.toLowerCase()));
        return {
          ...s,
          teacherId: matchedTeacher ? matchedTeacher._id.toString() : "",
          teacherName: matchedTeacher ? matchedTeacher.name : "",
          subjectId: matchedSubject ? matchedSubject._id.toString() : "",
        };
      });
      const res = await schedulesCollection.insertMany(enrichedSchedules);
      await schedulesCollection.createIndex({ unit: 1 });
      await schedulesCollection.createIndex({ unit: 1, day: 1 });
      await schedulesCollection.createIndex({ status: 1 });
      console.log(`Inserted ${res.insertedCount} schedules with indexes!`);
    }

    // Verify all collections again
    const cols = await db.listCollections().toArray();
    console.log('\n--- Final Verified MongoDB Atlas Collections ---');
    for (const c of cols) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`- ${c.name}: ${count} documents`);
    }
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await client.close();
  }
}

seed();
