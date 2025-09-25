import fs from 'fs/promises';
import path from 'path';

const DEFAULT_URI = process.env.MONGODB_URI || 'mongodb://10.0.0.104:27017/?replicaSet=rs0';
const DEFAULT_DB = process.env.MONGODB_DB || 'mavarra';

const settingsPath = path.resolve(process.cwd(), 'config/settings.json');
const defaultSettings = {
  mongodbUri: DEFAULT_URI,
  mongodbDb: DEFAULT_DB,
};

let cachedSettings = null;
let loadingPromise = null;

async function ensureDirExists(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true }).catch(() => {});
}

async function readSettingsFromDisk() {
  try {
    const content = await fs.readFile(settingsPath, 'utf8');
    const parsed = JSON.parse(content);
    return {
      ...defaultSettings,
      ...parsed,
    };
  } catch (err) {
    return { ...defaultSettings };
  }
}

export async function getSettings() {
  if (cachedSettings) return cachedSettings;
  if (loadingPromise) return loadingPromise;
  loadingPromise = readSettingsFromDisk()
    .then((settings) => {
      cachedSettings = settings;
      loadingPromise = null;
      return cachedSettings;
    })
    .catch((err) => {
      loadingPromise = null;
      throw err;
    });
  return loadingPromise;
}

export async function setSettings(updates) {
  const current = await getSettings();
  const next = {
    ...current,
    ...updates,
  };
  cachedSettings = next;
  await ensureDirExists(settingsPath);
  await fs.writeFile(settingsPath, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

export function clearSettingsCache() {
  cachedSettings = null;
}

export function getDefaultSettings() {
  return { ...defaultSettings };
}
