import crypto from 'crypto';

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
}

function base64urlJson(obj) {
  return base64url(JSON.stringify(obj));
}

export function sign(payload, secret, opts = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = opts.expiresIn ? now + opts.expiresIn : undefined;
  const full = exp ? { ...payload, iat: now, exp } : { ...payload, iat: now };
  const data = base64urlJson(header) + '.' + base64urlJson(full);
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  return data + '.' + sig;
}

export function verify(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const [h, p, s] = parts;
  const expected = crypto.createHmac('sha256', secret).update(h + '.' + p).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  if (!timingSafeEqual(expected, s)) throw new Error('Invalid signature');
  const payload = JSON.parse(Buffer.from(p, 'base64').toString('utf8'));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) throw new Error('Token expired');
  return payload;
}

function timingSafeEqual(a, b) {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

