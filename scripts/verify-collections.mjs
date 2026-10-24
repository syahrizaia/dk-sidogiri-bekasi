import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set');
  process.exit(1);
}
const client = new MongoClient(uri);

async function verify() {
  try {
    await client.connect();
    const db = client.db('dk-sidogiri-bekasi');
    const cols = await db.listCollections().toArray();
    console.log('--- Current Collections in dk_sidogiri_bekasi ---');
    for (const c of cols) {
      const count = await db.collection(c.name).countDocuments();
      console.log(`- ${c.name}: ${count} documents`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

verify();
