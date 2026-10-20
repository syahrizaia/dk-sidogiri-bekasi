import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dk-sidogiri-bekasi';
const client = new MongoClient(uri);

async function run() {
  await client.connect();
  const db = client.db('dk-sidogiri-bekasi');
  const collections = await db.listCollections().toArray();
  console.log('--- Current Collections in Atlas ---');
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`[Collection] ${c.name} -> ${count} documents`);
  }
  await client.close();
}

run().catch(console.error);
