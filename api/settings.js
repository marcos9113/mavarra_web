import { verify } from './lib/jwt.js';
import { getSettings, setSettings, getDefaultSettings } from './lib/settings.js';
import { resetMongoConnection } from './lib/mongo.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const identity = await getIdentity(req);
    if (!identity.isAdmin) return res.status(401).json({ success: false, message: 'Unauthorized' });

    if (req.method === 'GET') {
      const settings = await getSettings();
      return res.status(200).json({ success: true, data: sanitize(settings) });
    }

    if (req.method === 'PUT') {
      const body = req.body && typeof req.body === 'object' ? req.body : await readJson(req);
      const mongodbUri = typeof body?.mongodbUri === 'string' ? body.mongodbUri.trim() : '';
      const mongodbDb = typeof body?.mongodbDb === 'string' ? body.mongodbDb.trim() : '';
      if (!mongodbUri) return res.status(400).json({ success: false, message: 'mongodbUri required' });
      if (!mongodbDb) return res.status(400).json({ success: false, message: 'mongodbDb required' });
      const updated = await setSettings({ mongodbUri, mongodbDb });
      await resetMongoConnection();
      return res.status(200).json({ success: true, data: sanitize(updated) });
    }

    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Server error' });
  }
}

function sanitize(settings) {
  const defaults = getDefaultSettings();
  return {
    mongodbUri: settings.mongodbUri || defaults.mongodbUri,
    mongodbDb: settings.mongodbDb || defaults.mongodbDb,
  };
}

async function getIdentity(req) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return { isAdmin: false };
    const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
    const payload = verify(token, JWT_SECRET);
    return { isAdmin: payload?.role === 'admin', payload };
  } catch {
    return { isAdmin: false };
  }
}

function readJson(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
    });
  });
}
