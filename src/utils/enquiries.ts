export type Enquiry = {
  id: string;
  createdAt: string; // ISO timestamp
  name: string;
  email: string;
  company?: string;
  phone?: string;
  idea: string;
  goals?: string;
  timeline?: string;
  budget?: string;
  notes?: string;
};

const KEY = 'mavarra:enquiries';

export function loadEnquiries(): Enquiry[] {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveEnquiries(list: Enquiry[]) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(KEY, JSON.stringify(list));
    }
  } catch {
    // ignore write errors
  }
}

export function addEnquiry(enquiry: Omit<Enquiry, 'id' | 'createdAt'>) {
  const item: Enquiry = {
    id: cryptoId(),
    createdAt: new Date().toISOString(),
    ...enquiry,
  };
  const current = loadEnquiries();
  const next = [item, ...current];
  saveEnquiries(next);
  return item;
}

export function clearEnquiries() {
  saveEnquiries([]);
}

function cryptoId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

