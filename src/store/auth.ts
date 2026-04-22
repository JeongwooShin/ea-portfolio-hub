import { create } from "zustand";

const STORAGE_KEY = "ea_dashboard_unlocked";

export const PASSWORD_HASH = (import.meta.env.VITE_DASHBOARD_PASSWORD_HASH ?? "")
  .trim()
  .toLowerCase();

/** 게이트 비활성화: 해시가 비어 있으면 항상 통과. */
export const GATE_DISABLED = PASSWORD_HASH.length === 0;

function readInitialUnlocked(): boolean {
  if (GATE_DISABLED) return true;
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

interface AuthState {
  unlocked: boolean;
  unlock: () => void;
  lock: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  unlocked: readInitialUnlocked(),
  unlock: () => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    set({ unlocked: true });
  },
  lock: () => {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    set({ unlocked: false });
  },
}));

/** 입력 비밀번호를 SHA-256(hex, 소문자)으로 해시. */
export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
