import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  type SettingKey,
  type Settings,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseSettings(value: unknown): Settings {
  if (!isRecord(value)) return { ...DEFAULT_SETTINGS };

  const parsed = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS) as SettingKey[]) {
    if (typeof value[key] === "boolean") parsed[key] = value[key];
  }
  return parsed;
}

function getStorage(): chrome.storage.StorageArea | null {
  if (typeof chrome === "undefined" || !chrome.storage?.sync) return null;
  return chrome.storage.sync;
}

export async function loadSettings(): Promise<Settings> {
  const storage = getStorage();
  if (!storage) return { ...DEFAULT_SETTINGS };

  const result = await storage.get(SETTINGS_STORAGE_KEY);
  return parseSettings(result[SETTINGS_STORAGE_KEY]);
}

export async function saveSettings(settings: Settings): Promise<void> {
  const storage = getStorage();
  if (!storage) return;

  await storage.set({ [SETTINGS_STORAGE_KEY]: settings });
}
