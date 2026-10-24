import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}
const client = new MongoClient(uri);

const COLLECTIONS_TO_DROP = ['santri', 'pendaftaran'];

async function run() {
  try {
    await client.connect();
    const db = client.db('dk-sidogiri-bekasi');

    console.log('=== PRE-DROP: Current collections ===');
    const beforeCollections = await db.listCollections().toArray();
    for (const c of beforeCollections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`  [${COLLECTIONS_TO_DROP.includes(c.name) ? 'TO DROP' : 'KEEP'}] ${c.name} -> ${count} documents`);
    }

    // Verify canonical collections have data before dropping duplicates
    const studentsCount = await db.collection('students').countDocuments();
    const admissionsCount = await db.collection('admissions').countDocuments();

    if (studentsCount === 0) {
      throw new Error('ABORT: "students" collection is empty! Cannot safely drop "santri".');
    }
    if (admissionsCount === 0) {
      throw new Error('ABORT: "admissions" collection is empty! Cannot safely drop "pendaftaran".');
    }

    console.log(`\n[SAFE] "students" has ${studentsCount} docs (canonical target for "santri")`);
    console.log(`[SAFE] "admissions" has ${admissionsCount} docs (canonical target for "pendaftaran")`);

    // Drop duplicate collections
    for (const name of COLLECTIONS_TO_DROP) {
      const exists = beforeCollections.some((c) => c.name === name);
      if (exists) {
        await db.dropCollection(name);
        console.log(`[DROPPED] "${name}" collection removed from Atlas.`);
      } else {
        console.log(`[SKIP] "${name}" collection does not exist.`);
      }
    }

    console.log('\n=== POST-DROP: Final collections ===');
    const afterCollections = await db.listCollections().toArray();
    for (const c of afterCollections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`  ${c.name} -> ${count} documents`);
    }

    console.log(`\nTotal collections: ${afterCollections.length} (was ${beforeCollections.length})`);
    console.log('Database cleanup completed successfully.');
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
