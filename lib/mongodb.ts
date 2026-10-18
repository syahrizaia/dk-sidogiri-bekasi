import "server-only";
import { MongoClient, Db, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb+srv://syahrizaalsistani_db_user:8vh4jPahFHbTrfp2@dk-sidogiri-bekasi.vchzsda.mongodb.net/?retryWrites=true&w=majority";
const dbName = process.env.MONGODB_DB || "dk-sidogiri-bekasi";

const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so the MongoClient is not repeated
  // on every module reload triggered by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Mendapatkan instance database MongoDB Atlas (dk-sidogiri-bekasi)
 */
export async function getDatabase(): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

export default clientPromise;
