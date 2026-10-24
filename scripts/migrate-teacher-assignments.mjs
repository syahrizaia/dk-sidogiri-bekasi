import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}
const client = new MongoClient(uri);

async function migrate() {
  try {
    await client.connect();
    const db = client.db('dk-sidogiri-bekasi');
    const teachersCollection = db.collection('teachers');
    const subjectsCollection = db.collection('subjects');

    console.log('--- Memulai Migrasi Skema Penugasan Akademik & Wali Kelas Asatidz ---');

    const teachers = await teachersCollection.find({}).toArray();
    const subjects = await subjectsCollection.find({}).toArray();

    console.log(`Ditemukan ${teachers.length} asatidz dan ${subjects.length} mata pelajaran.`);

    // Helper map subject by code
    const subjectByCode = new Map(subjects.map((s) => [s.code, s]));

    // Pemetaan realistis penugasan akademik & wali kelas
    // Format: nip -> { institutions, subjectCodes, homerooms: [{ unit, className }] }
    const assignmentMap = {
      // 1. Ust. M. Sholeh Al-Bantani (Kepala MI)
      'DKS-AS-01': {
        primaryInstitution: 'MI',
        institutions: ['MI'],
        subjectCodes: ['MI-DIN-01'], // Fiqih Ibadah
        homerooms: [{ unit: 'MI', className: '6 Ibtidaiyah A' }],
      },
      // 2. Ust. Abdullah Faqih (Koordinator MTs) -> Lintas Unit (MTs & MI)
      'DKS-AS-02': {
        primaryInstitution: 'MTs',
        institutions: ['MTs', 'MI'],
        subjectCodes: ['MTS-DIN-02', 'MI-DIN-02'], // Nahwu Lanjutan MTs & Nahwu Dasar MI
        homerooms: [
          { unit: 'MTs', className: 'Persiapan 1 MTs' },
          { unit: 'MI', className: '5 Ibtidaiyah A' },
        ],
      },
      // 3. Ust. Ahmad Zaini Al-Hafizh (Koordinator TPQ) -> Lintas Unit (TPQ & MI)
      'DKS-AS-03': {
        primaryInstitution: 'TPQ',
        institutions: ['TPQ', 'MI'],
        subjectCodes: ['TPQ-TRT-01', 'TPQ-TRT-02'], // Tartil 1-3 & 4-6
        homerooms: [{ unit: 'TPQ', className: "Jilid 4 Al-Qur'an" }],
      },
      // 4. Ust. H. Ridwan Mansyur (Guru Senior Kitab Kuning) -> Lintas Unit (MI & MTs)
      'DKS-AS-04': {
        primaryInstitution: 'MI',
        institutions: ['MI', 'MTs'],
        subjectCodes: ['MI-DIN-06', 'MTS-DIN-05'], // Hadits Nabawi MI & Musthalah Hadits MTs
        homerooms: [{ unit: 'MI', className: '4 Ibtidaiyah A' }],
      },
      // 5. Ust. Zainul Arifin (Wali Kelas & Pembina Bahasa) -> Lintas Unit (MI & TPQ)
      'DKS-AS-05': {
        primaryInstitution: 'MI',
        institutions: ['MI', 'TPQ'],
        subjectCodes: ['MI-KUM-01', 'TPQ-IBD-01'], // Bahasa Indonesia MI & Praktik Shalat TPQ
        homerooms: [
          { unit: 'MI', className: '5 Ibtidaiyah C' },
          { unit: 'TPQ', className: 'Tartil Tajwid' },
        ],
      },
      // 6. Ust. M. Nuruddin Habibi (Pengajar Diniyah & Sorogan)
      'DKS-AS-06': {
        primaryInstitution: 'MI',
        institutions: ['MI'],
        subjectCodes: ['MI-DIN-03', 'MI-DIN-04'], // Shorof I'lal & Aqidah Tauhid
        homerooms: [{ unit: 'MI', className: '5 Ibtidaiyah B' }],
      },
      // 7. Ust. Muhsin Al-Kaff (Pengajar Tahsin Al-Qur'an)
      'DKS-AS-07': {
        primaryInstitution: 'TPQ',
        institutions: ['TPQ'],
        subjectCodes: ['TPQ-TAJ-01'], // Ilmu Tajwid Nazhom
        homerooms: [{ unit: 'TPQ', className: "Jilid 5 Al-Qur'an" }],
      },
      // 8. Ust. Fahrur Rozi (Pengajar Sains & Matematika Islam) -> Lintas Unit (MI & MTs)
      'DKS-AS-08': {
        primaryInstitution: 'MI',
        institutions: ['MI', 'MTs'],
        subjectCodes: ['MI-KUM-02', 'MTS-KUM-02'], // Matematika MI & Matematika MTs
        homerooms: [{ unit: 'MI', className: '4 Ibtidaiyah B' }],
      },
      // 9. Ust. Kholilur Rahman (Pembina Bahtsul Masail MTs)
      'DKS-AS-09': {
        primaryInstitution: 'MTs',
        institutions: ['MTs'],
        subjectCodes: ['MTS-DIN-01', 'MTS-DIN-03'], // Fiqih Menengah & Ushul Fiqh
        homerooms: [],
      },
      // 10. Ust. Bahrul Ulum (Pengajar Gramatika Arab Lanjutan)
      'DKS-AS-10': {
        primaryInstitution: 'MTs',
        institutions: ['MTs'],
        subjectCodes: ['MTS-DIN-04'], // Kaidah Fiqhiyyah
        homerooms: [],
      },
      // 11. Usth. Fatimah Az-Zahra (Pengajar Tartil Putri & Doa Harian)
      'DKS-AS-11': {
        primaryInstitution: 'TPQ',
        institutions: ['TPQ'],
        subjectCodes: ['TPQ-HAF-01'], // Tahfidz Juz 30
        homerooms: [{ unit: 'TPQ', className: "Jilid 6 Al-Qur'an" }],
      },
      // 12. Usth. Nailul Muna Al-Hafizhah (Instruktur Tahfidz)
      'DKS-AS-12': {
        primaryInstitution: 'TPQ',
        institutions: ['TPQ'],
        subjectCodes: [],
        homerooms: [{ unit: 'TPQ', className: "Jilid 3 Al-Qur'an" }],
      },
      // 13. Ust. H. Syafi'i Ma'arif (Pembina Kedisiplinan & Asrama) -> Lintas Unit (MTs & MI)
      'DKS-AS-13': {
        primaryInstitution: 'MTs',
        institutions: ['MTs', 'MI'],
        subjectCodes: ['MI-DIN-05', 'MTS-KUM-03'], // Akhlaq Adab MI & IPA MTs
        homerooms: [{ unit: 'MI', className: '6 Ibtidaiyah B' }],
      },
      // 14. Ust. Syamsul Huda (Pengajar IT & Bahasa) -> Lintas Unit (MTs & MI)
      'DKS-AS-14': {
        primaryInstitution: 'MTs',
        institutions: ['MTs', 'MI'],
        subjectCodes: ['MTS-KUM-01', 'MI-KUM-03'], // Bahasa Inggris MTs & IPAS MI
        homerooms: [{ unit: 'MI', className: '3 Ibtidaiyah A' }],
      },
    };

    // Validasi Aturan Kunci Sebelum Simpan:
    console.log('\n--- Memeriksa Integritas Aturan Bisnis ---');
    const assignedHomeroomsPerClass = new Map(); // "unit:className" -> teacherNip

    for (const [nip, data] of Object.entries(assignmentMap)) {
      // Validasi 1: Maksimal 1 kelas per unit untuk 1 guru
      const unitCounts = {};
      for (const hr of data.homerooms) {
        unitCounts[hr.unit] = (unitCounts[hr.unit] || 0) + 1;
        if (unitCounts[hr.unit] > 1) {
          throw new Error(`VIOLATION: Guru ${nip} memiliki lebih dari 1 kelas di unit ${hr.unit}!`);
        }

        // Validasi 2: Cegah 2 guru berbeda menjadi wali kelas di kelas & unit yang sama
        const key = `${hr.unit}:${hr.className}`;
        if (assignedHomeroomsPerClass.has(key)) {
          throw new Error(`VIOLATION: Kelas ${key} ganda! Dipegang oleh ${assignedHomeroomsPerClass.get(key)} dan ${nip}`);
        }
        assignedHomeroomsPerClass.set(key, nip);
      }
    }
    console.log('Semua aturan bisnis lolos verifikasi: 1 guru = max 1 kelas per unit, tanpa tabrakan kelas!');

    // Eksekusi Pembaruan Teachers & Subjects
    console.log('\n--- Menerapkan Pembaruan ke MongoDB Atlas ---');
    for (const teacher of teachers) {
      const nip = teacher.nip;
      const config = assignmentMap[nip] || {
        primaryInstitution: teacher.institution || 'MI',
        institutions: [teacher.institution || 'MI'],
        subjectCodes: [],
        homerooms: [],
      };

      // Buat teachingAssignments terstruktur
      const teachingAssignments = [];
      for (const code of config.subjectCodes) {
        const subDoc = subjectByCode.get(code);
        if (subDoc) {
          teachingAssignments.push({
            subjectId: subDoc._id.toString(),
            subjectCode: subDoc.code,
            subjectName: subDoc.name,
            unit: subDoc.unit,
          });

          // Update two-way sync ke subjects
          await subjectsCollection.updateOne(
            { _id: subDoc._id },
            {
              $set: {
                teacherId: teacher._id.toString(),
                teacherName: teacher.name,
                updatedAt: new Date().toISOString(),
              },
            }
          );
        }
      }

      // Pastikan array institutions mencakup seluruh unit penugasan
      const allUnitsSet = new Set([
        config.primaryInstitution,
        ...config.institutions,
        ...teachingAssignments.map((t) => t.unit),
        ...config.homerooms.map((h) => h.unit),
      ]);
      const institutions = Array.from(allUnitsSet);

      // Update dokumen teacher
      await teachersCollection.updateOne(
        { _id: teacher._id },
        {
          $set: {
            institution: config.primaryInstitution, // backward compatibility
            institutions,
            teachingAssignments,
            homeroomAssignments: config.homerooms,
            updatedAt: new Date().toISOString(),
          },
        }
      );

      console.log(`Updated [${nip}] ${teacher.name}:`);
      console.log(`  - Lembaga: [${institutions.join(', ')}]`);
      console.log(`  - Mapel: ${teachingAssignments.map((t) => `${t.subjectCode} (${t.unit})`).join(', ') || 'Belum ada'}`);
      console.log(`  - Wali Kelas: ${config.homerooms.map((h) => `${h.className} (${h.unit})`).join(', ') || 'Bukan Wali Kelas'}`);
    }

    // Pastikan Index Terpasang di Koleksi teachers
    await teachersCollection.createIndex({ nip: 1 }, { unique: true });
    await teachersCollection.createIndex({ institutions: 1 });
    await teachersCollection.createIndex({ 'teachingAssignments.subjectId': 1 });
    await teachersCollection.createIndex({ 'homeroomAssignments.unit': 1 });

    console.log('\n--- Migrasi Selesai dengan Sukses & Index Berhasil Dibuat ---');
  } catch (err) {
    console.error('Migrasi gagal:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

migrate();
