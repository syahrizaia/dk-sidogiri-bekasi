import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dk-sidogiri-bekasi';
const client = new MongoClient(uri);

async function migrateCollection(db, sourceName, targetName) {
  console.log(`\n========================================`);
  console.log(`MIGRATING: "${sourceName}" -> "${targetName}"`);
  console.log(`========================================`);

  const sourceCol = db.collection(sourceName);
  const targetCol = db.collection(targetName);

  const sourceCount = await sourceCol.countDocuments();
  console.log(`[Source] Total documents in "${sourceName}": ${sourceCount}`);

  if (sourceCount === 0) {
    console.log(`[Notice] Source collection "${sourceName}" is empty or has no documents. Skipping transfer.`);
    return;
  }

  const cursor = sourceCol.find({});
  const documents = await cursor.toArray();
  console.log(`[Transfer] Read ${documents.length} documents from "${sourceName}". Transferring to "${targetName}"...`);

  // Build bulk upsert operations to ensure idempotency and preserve _id
  const bulkOps = documents.map((doc) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: doc },
      upsert: true,
    },
  }));

  const bulkResult = await targetCol.bulkWrite(bulkOps);
  console.log(`[Result] Upserted: ${bulkResult.upsertedCount}, Modified: ${bulkResult.modifiedCount}, Matched: ${bulkResult.matchedCount}`);

  const targetCount = await targetCol.countDocuments();
  console.log(`[Verify] Total documents in target "${targetName}": ${targetCount}`);

  if (targetCount < sourceCount) {
    throw new Error(`Migration verification failed! Target count (${targetCount}) is less than source count (${sourceCount})!`);
  }

  console.log(`[SUCCESS] Migration for "${sourceName}" -> "${targetName}" verified safely.`);
}

async function run() {
  try {
    await client.connect();
    const db = client.db('dk-sidogiri-bekasi');
    console.log('Connected to MongoDB Atlas: dk-sidogiri-bekasi');

    // 1. santri -> students
    await migrateCollection(db, 'santri', 'students');

    // 2. pendaftaran -> admissions
    await migrateCollection(db, 'pendaftaran', 'admissions');

    // 3. izin_santri -> leave_requests (if exists)
    const collections = await db.listCollections().toArray();
    const hasIzin = collections.some((c) => c.name === 'izin_santri');
    if (hasIzin) {
      await migrateCollection(db, 'izin_santri', 'leave_requests');
    } else {
      console.log('\n[Notice] "izin_santri" collection does not exist in Atlas yet. Target "leave_requests" will receive new records.');
    }

    console.log('\n========================================');
    console.log('FINAL DATABASE STATUS AFTER MIGRATION:');
    console.log('========================================');
    const updatedCollections = await db.listCollections().toArray();
    for (const c of updatedCollections) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`- ${c.name}: ${count} documents`);
    }

    console.log('\nAll data transferred successfully with zero loss!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
