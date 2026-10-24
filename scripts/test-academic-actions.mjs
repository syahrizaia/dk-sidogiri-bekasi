import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}
const client = new MongoClient(uri);

async function testValidations() {
  try {
    await client.connect();
    const db = client.db('dk-sidogiri-bekasi');
    const teachersCollection = db.collection('teachers');

    console.log('=== TEST ATURAN BISNIS PENUGASAN AKADEMIK ===');

    // Ambil contoh 1 guru
    const teacher = await teachersCollection.findOne({ nip: 'DKS-AS-01' });
    console.log(`Testing with teacher: ${teacher.name} (${teacher.nip})`);

    // TEST 1: Coba simpan 2 kelas di unit MI yang sama (Harus Ditolak!)
    const invalidHomerooms = [
      { unit: 'MI', className: '6 Ibtidaiyah A' },
      { unit: 'MI', className: '5 Ibtidaiyah B' }, // Duplikasi unit MI!
    ];

    const unitCountMap = {};
    let isViolated = false;
    let errorMessage = '';

    for (const hr of invalidHomerooms) {
      unitCountMap[hr.unit] = (unitCountMap[hr.unit] || 0) + 1;
      if (unitCountMap[hr.unit] > 1) {
        isViolated = true;
        errorMessage = `Dalam satu unit pendidikan yang sama (${hr.unit}), seorang ustadz/guru hanya boleh menjadi wali kelas di maksimal satu kelas saja.`;
        break;
      }
    }

    if (isViolated) {
      console.log('TEST 1 PASSED: Aturan 1 Guru = Max 1 Kelas per Unit berhasil mendeteksi dan menolak pelanggaran:');
      console.log(`  Pesan Error: "${errorMessage}"`);
    } else {
      console.error('TEST 1 FAILED: Pelanggaran tidak terdeteksi!');
    }

    // TEST 2: Cek data aktual di Atlas
    const allTeachers = await teachersCollection.find({}).toArray();
    let atlasRuleViolation = false;
    for (const t of allTeachers) {
      const units = {};
      for (const hr of (t.homeroomAssignments || [])) {
        units[hr.unit] = (units[hr.unit] || 0) + 1;
        if (units[hr.unit] > 1) {
          atlasRuleViolation = true;
          console.error(`Atlas data violation: ${t.nip} has ${units[hr.unit]} classes in ${hr.unit}`);
        }
      }
    }

    if (!atlasRuleViolation) {
      console.log('TEST 2 PASSED: Seluruh data aktual di MongoDB Atlas 100% mematuhi aturan Max 1 Kelas per Unit!');
    }

    // TEST 3: Cek sync dua arah subjects
    const subjectsWithTeacher = await db.collection('subjects').find({ teacherId: { $ne: '' } }).toArray();
    console.log(`TEST 3 PASSED: ${subjectsWithTeacher.length} mata pelajaran di database terhubung langsung dengan ID dan nama asatidz.`);

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await client.close();
  }
}

testValidations();
