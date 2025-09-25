// Minimal TOTP utils for client-side fallback in local development.
// Matches server implementation (SHA1, 6 digits, 30s period).

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(str: string): Uint8Array {
  const clean = (str || '').toUpperCase().replace(/=+$/,'').replace(/\s+/g,'');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

// HOTP/TOTP helpers use Web Crypto if available; fallback to a JS SHA1 implementation if needed.
async function hmacSha1(key: Uint8Array, msg: Uint8Array): Promise<Uint8Array> {
  if ('crypto' in globalThis && 'subtle' in crypto) {
    const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, msg);
    return new Uint8Array(sig);
  }
  // Simple fallback: dynamic import is not available; we would need a SHA1, but CRA has Web Crypto.
  throw new Error('Web Crypto not available');
}

function counterToBytes(counter: number): Uint8Array {
  const buf = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    buf[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }
  return buf;
}

export async function hotp(secretBase32: string, counter: number): Promise<string> {
  const key = base32Decode(secretBase32);
  const msg = counterToBytes(counter);
  const hmac = await hmacSha1(key, msg);
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = ((hmac[offset] & 0x7f) << 24) |
               ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) |
               (hmac[offset + 3] & 0xff);
  return (code % 1_000_000).toString().padStart(6, '0');
}

export async function verifyTotp(secretBase32: string, token: string, step = 30, window = 1): Promise<boolean> {
  const time = Math.floor(Date.now() / 1000);
  const counter = Math.floor(time / step);
  for (let w = -window; w <= window; w++) {
    const code = await hotp(secretBase32, counter + w);
    if (code === String(token)) return true;
  }
  return false;
}

export function randomBase32Secret(bytes = 20): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return base32Encode(arr);
}

