import { create } from "zustand";

export type StatusFilter = "ALL" | "LIVE" | "DEMO" | "PAUSED";
export type CategoryFilter = "ALL" | "architect" | "currencypros" | "other";

interface FilterState {
  category: CategoryFilter;
  broker: string; // "ALL" or broker name
  status: StatusFilter;
  search: string;
  setCategory: (v: CategoryFilter) => void;
  setBroker: (v: string) => void;
  setStatus: (v: StatusFilter) => void;
  setSearch: (v: string) => void;
  reset: () => void;
}

export const useFilters = create<FilterState>((set) => ({
  category: "ALL",
  broker: "ALL",
  status: "ALL",
  search: "",
  setCategory: (category) => set({ category }),
  setBroker: (broker) => set({ broker }),
  setStatus: (status) => set({ status }),
  setSearch: (search) => set({ search }),
  reset: () => set({ category: "ALL", broker: "ALL", status: "ALL", search: "" }),
}));
