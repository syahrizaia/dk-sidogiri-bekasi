import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("dk-sidogiri-bekasi");
    console.log("Connected to MongoDB Atlas.");

    // 1. Kosongkan photoUrl di organization_members
    const orgRes = await db.collection("organization_members").updateMany(
      {},
      { $set: { photoUrl: "", updatedAt: new Date().toISOString() } }
    );
    console.log(`Updated organization_members: ${orgRes.modifiedCount} dokumen photoUrl dikosongkan.`);

    // 2. Kosongkan photoUrl di teachers
    const teachersRes = await db.collection("teachers").updateMany(
      {},
      { $set: { photoUrl: "", updatedAt: new Date().toISOString() } }
    );
    console.log(`Updated teachers: ${teachersRes.modifiedCount} dokumen photoUrl dikosongkan.`);

  } catch (err) {
    console.error("Error clearing photos:", err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

run();
