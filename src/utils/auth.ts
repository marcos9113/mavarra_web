const KEY = 'mavarra:token';

let memoryToken: string | null = null;

export function setToken(t: string) {
  memoryToken = t;
  try { localStorage.setItem(KEY, t); } catch {}
}

export function getToken(): string | null {
  if (memoryToken) return memoryToken;
  try { memoryToken = localStorage.getItem(KEY); } catch {}
  return memoryToken;
}

export function clearToken() {
  memoryToken = null;
  try { localStorage.removeItem(KEY); } catch {}
}

