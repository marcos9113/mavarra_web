import crypto from 'crypto';
import { base32Encode } from '../lib/totp.js';
import { getDb } from '../lib/mongo.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  const body = req.body && typeof req.body === 'object' ? req.body : await readJson(req);
  const username = (body?.username || 'admin').trim();
  const issuer = (process.env.AUTH_ISSUER || 'Mavarra').trim();
  if (!username) return res.status(400).json({ success: false, message: 'username required' });

  const db = await getDb();
  const existing = await db.collection('user').findOne({ username });
  let secret;
  let created = false;
  if (existing) {
    secret = existing.secret;
  } else {
    secret = base32Encode(crypto.randomBytes(20));
    await db.collection('user').insertOne({ username, secret, role: 'admin', created_at: new Date() });
    created = true;
  }

  const label = encodeURIComponent(`${issuer}:${username}`);
  const params = new URLSearchParams({ secret, issuer, algorithm: 'SHA1', digits: '6', period: '30' });
  const otpauth = `otpauth://totp/${label}?${params.toString()}`;
  const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(otpauth)}`;

  return res.status(200).json({ success: true, username, secret, otpauth, qrUrl, issuer, created });
}

function readJson(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', c => data += c);
    req.on('end', () => { try { resolve(JSON.parse(data||'{}')); } catch { resolve({}); } });
  });
}

