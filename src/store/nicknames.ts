import { create } from "zustand";

const STORAGE_KEY = "eaNicknames_v1";

export type NicknameMap = Record<string, string>;

function loadFromStorage(): NicknameMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const out: NicknameMap = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "string" && v.trim().length > 0) out[k] = v;
      }
      return out;
    }
  } catch {
    // ignore corrupt storage
  }
  return {};
}

function saveToStorage(map: NicknameMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota / privacy mode — silently ignore
  }
}

interface NicknameState {
  /** strategy.id → nickname (only non-empty entries are stored). */
  map: NicknameMap;
  /** Replace the entire map (used by the bulk-edit dialog on save). */
  replaceAll: (next: NicknameMap) => void;
  /** Remove all nicknames. */
  clearAll: () => void;
}

export const useNicknames = create<NicknameState>((set) => ({
  map: loadFromStorage(),
  replaceAll: (next) => {
    // Drop empty strings on the way in.
    const cleaned: NicknameMap = {};
    for (const [k, v] of Object.entries(next)) {
      if (typeof v === "string" && v.trim().length > 0) cleaned[k] = v.trim();
    }
    saveToStorage(cleaned);
    set({ map: cleaned });
  },
  clearAll: () => {
    saveToStorage({});
    set({ map: {} });
  },
}));
