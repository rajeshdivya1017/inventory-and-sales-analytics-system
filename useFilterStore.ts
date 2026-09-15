import { create } from "zustand";

interface FilterState {
  categoryId: number | null;
  productId: number | null;
  soldBy: number | null;
  fromDate: string;
  toDate: string;
  search: string;

  setCategoryId: (categoryId: number | null) => void;
  setProductId: (productId: number | null) => void;
  setSoldBy: (soldBy: number | null) => void;
  setFromDate: (fromDate: string) => void;
  setToDate: (toDate: string) => void;
  setSearch: (search: string) => void;

  resetFilters: () => void;
}

const initialFilters = {
  categoryId: null,
  productId: null,
  soldBy: null,
  fromDate: "",
  toDate: "",
  search: "",
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialFilters,

  setCategoryId: (categoryId) => {
    set({ categoryId });
  },

  setProductId: (productId) => {
    set({ productId });
  },

  setSoldBy: (soldBy) => {
    set({ soldBy });
  },

  setFromDate: (fromDate) => {
    set({ fromDate });
  },

  setToDate: (toDate) => {
    set({ toDate });
  },

  setSearch: (search) => {
    set({ search });
  },

  resetFilters: () => {
    set(initialFilters);
  },
}));