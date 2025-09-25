import { MongoClient } from 'mongodb';
import { getSettings, getDefaultSettings } from './settings.js';

let cached = globalThis.__mavarra_mongo;
if (!cached) cached = globalThis.__mavarra_mongo = { client: null, db: null, uri: null, dbName: null };

async function ensureIndexes(db) {
  await db.collection('user').createIndex({ username: 1 }, { unique: true });
  await db.collection('enquiries').createIndex({ created_at: -1 });
  await db.collection('blog_posts').createIndex({ slug: 1 }, { unique: true });
  await db.collection('blog_posts').createIndex({ published_at: -1 });
}

export async function getDb() {
  const defaults = getDefaultSettings();
  const settings = await getSettings();
  const uri = settings.mongodbUri || defaults.mongodbUri;
  const dbName = settings.mongodbDb || defaults.mongodbDb;

  const reuseExisting = cached.db && cached.uri === uri && cached.dbName === dbName;
  if (reuseExisting) return cached.db;

  if (cached.client) {
    try { await cached.client.close(); } catch {}
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  await ensureIndexes(db);

  cached.client = client;
  cached.db = db;
  cached.uri = uri;
  cached.dbName = dbName;
  return db;
}

export async function resetMongoConnection() {
  if (cached && cached.client) {
    try { await cached.client.close(); } catch {}
  }
  if (cached) {
    cached.client = null;
    cached.db = null;
    cached.uri = null;
    cached.dbName = null;
  }
}
