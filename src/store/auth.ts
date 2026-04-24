import { create } from "zustand";

const DEFAULT_API_BASE = "https://EAdashboard-api.runbickers.com";

export const API_BASE = (import.meta.env.VITE_API_BASE ?? DEFAULT_API_BASE).replace(/\/$/, "");

export type AuthStatus = "loading" | "disabled" | "authenticated" | "unauthenticated";

interface MeResponse {
  enabled: boolean;
  authenticated?: boolean;
}

interface AuthState {
  status: AuthStatus;
  error: string | null;
  /** Call GET /auth/me and update status. Returns final status. */
  refresh: () => Promise<AuthStatus>;
  /** POST /auth/login then refresh. Throws on failure. */
  login: (password: string) => Promise<void>;
  /** POST /auth/logout then mark unauthenticated. */
  logout: () => Promise<void>;
}

const jsonHeaders = { Accept: "application/json" } as const;

export const useAuth = create<AuthState>((set, get) => ({
  status: "loading",
  error: null,

  refresh: async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
        headers: jsonHeaders,
      });
      if (!res.ok) throw new Error(`auth/me ${res.status}`);
      const data = (await res.json()) as MeResponse;
      let next: AuthStatus;
      if (!data.enabled) next = "disabled";
      else if (data.authenticated) next = "authenticated";
      else next = "unauthenticated";
      set({ status: next, error: null });
      return next;
    } catch (e) {
      set({ status: "unauthenticated", error: (e as Error).message });
      return "unauthenticated";
    }
  },

  login: async (password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { ...jsonHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      throw new Error("INVALID_PASSWORD");
    }
    await get().refresh();
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: jsonHeaders,
      });
    } catch {
      /* ignore network errors — still go back to login */
    }
    set({ status: "unauthenticated", error: null });
  },
}));

/** Helper: is the user allowed to fetch protected data? */
export function canFetchData(status: AuthStatus): boolean {
  return status === "authenticated" || status === "disabled";
}
