import dns from "node:dns";
import { MongoClient, type Db } from "mongodb";

// Use Google/Cloudflare DNS to avoid ISP SRV lookup failures
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || "dgb";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

interface MongoCache {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
}

const globalWithMongo = globalThis as typeof globalThis & {
  _mongoCache?: MongoCache;
};

const cache: MongoCache = globalWithMongo._mongoCache ?? {
  client: null,
  promise: null,
};

if (!globalWithMongo._mongoCache) {
  globalWithMongo._mongoCache = cache;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (cache.client) return cache.client;

  if (!cache.promise) {
    cache.promise = MongoClient.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    }).then((client) => {
      cache.client = client;
      return client;
    });
  }

  return cache.promise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(MONGODB_DB);
}
