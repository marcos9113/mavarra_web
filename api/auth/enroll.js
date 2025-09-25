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
  const email = (body?.email || '').trim().toLowerCase();
  const token = (body?.token || '').trim();
  const username = (body?.username || '').trim();
  if (!email || !token) return res.status(400).json({ success: false, message: 'email and token required' });

  const issuer = (process.env.AUTH_ISSUER || 'Mavarra').trim();
  const db = await getDb();
  const invite = await db.collection('invites').findOne({ email, token, used: false });
  if (!invite) return res.status(404).json({ success: false, message: 'Invalid or used invite' });
  if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) {
    return res.status(410).json({ success: false, message: 'Invite expired' });
  }

  const finalUsername = username || invite.username;
  if (!finalUsername) return res.status(400).json({ success: false, message: 'username required' });
  const existingUsername = await db.collection('user').findOne({ username: finalUsername });
  if (existingUsername) return res.status(409).json({ success: false, message: 'username already exists' });
  const secret = base32Encode(crypto.randomBytes(20));
  await db.collection('user').updateOne(
    { username: finalUsername },
    { $set: { username: finalUsername, email, secret }, $setOnInsert: { role: 'user', created_at: new Date() } },
    { upsert: true }
  );

  await db.collection('invites').updateOne({ _id: invite._id }, { $set: { used: true, used_at: new Date() } });

  const label = encodeURIComponent(`${issuer}:${finalUsername}`);
  const params = new URLSearchParams({ secret, issuer, algorithm: 'SHA1', digits: '6', period: '30' });
  const otpauth = `otpauth://totp/${label}?${params.toString()}`;
  const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(otpauth)}`;

  return res.status(200).json({ success: true, username: finalUsername, secret, otpauth, qrUrl, issuer });
}

function readJson(req) {
  return new Promise((resolve) => {
    let data='';
    req.on('data', c => data += c);
    req.on('end', () => { try { resolve(JSON.parse(data||'{}')); } catch { resolve({}); } });
  });
}
