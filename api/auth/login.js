import { verifyTotp } from '../lib/totp.js';
import { sign } from '../lib/jwt.js';
import { getDb } from '../lib/mongo.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  const body = req.body && typeof req.body === 'object' ? req.body : await readJson(req);
  const username = (body?.username || '').trim();
  const code = String(body?.code || '').trim();
  if (!username || !code) return res.status(400).json({ success: false, message: 'username and code required' });

  const db = await getDb();
  const record = await db.collection('user').findOne({ username });
  if (!record) return res.status(404).json({ success: false, message: 'unknown user' });

  const valid = verifyTotp(record.secret, code, 30, 1);
  if (!valid) return res.status(401).json({ success: false, message: 'invalid code' });

  await db.collection('user').updateOne(
    { _id: record._id },
    {
      $set: {
        last_login_at: new Date(),
      },
      $inc: { login_count: 1 },
    }
  );

  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
  const role = record.role || 'user';
  const token = sign({ sub: username, role }, JWT_SECRET, { expiresIn: 60 * 60 * 24 }); // 1 day
  const cookieParts = [
    `session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${60 * 60 * 24}`,
  ];
  if (process.env.NODE_ENV === 'production') cookieParts.push('Secure');
  res.setHeader('Set-Cookie', cookieParts.join('; '));
  return res.status(200).json({ success: true, token, user: { username, role } });
}

function readJson(req) {
  return new Promise((resolve) => {
    let data='';
    req.on('data', c => data += c);
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
    });
  });
}
