import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}
const client = new MongoClient(uri);

async function testDataIntegrity() {
  try {
    await client.connect();
    const db = client.db('dk-sidogiri-bekasi');

    console.log('=== VERIFIKASI DATA KELENGKAPAN MODUL ===');
    
    // 1. Subjects per unit
    for (const unit of ['MI', 'MTs', 'TPQ']) {
      const subs = await db.collection('subjects').find({ unit }).toArray();
      console.log(`\nUnit ${unit} - Total Mata Pelajaran / Kitab: ${subs.length}`);
      subs.forEach((s, idx) => {
        console.log(`  ${idx + 1}. [${s.code}] ${s.name} (${s.category}) - ${s.weeklyHours} JP/minggu - Kitab: ${s.kitabName || 'N/A'}`);
      });
    }

    // 2. Schedules per unit
    for (const unit of ['MI', 'MTs', 'TPQ']) {
      const scheds = await db.collection('schedules').find({ unit }).toArray();
      console.log(`\nUnit ${unit} - Total Sesi Jadwal: ${scheds.length}`);
      scheds.forEach((s, idx) => {
        console.log(`  ${idx + 1}. [${s.day}] ${s.startTime}-${s.endTime} WIB: ${s.subjectName} (${s.activityType}) @ ${s.room}`);
      });
    }

    console.log('\n=== STATUS SELURUH COLLECTION ATLAS ===');
    const cols = await db.listCollections().toArray();
    for (const c of cols) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`Collection '${c.name}': ${count} docs`);
    }

  } catch (err) {
    console.error('Error testing:', err);
  } finally {
    await client.close();
  }
}

testDataIntegrity();
