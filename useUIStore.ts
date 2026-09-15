import { create } from "zustand";

type Theme = "light" | "dark";

type ToastType = "success" | "error" | "info";

interface Toast {
  message: string;
  type: ToastType;
}

interface UIState {
  sidebarOpen: boolean;
  theme: Theme;
  toast: Toast | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "light",
  toast: null,

  toggleSidebar: () => {
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    }));
  },

  setSidebarOpen: (open) => {
    set({
      sidebarOpen: open,
    });
  },

  setTheme: (theme) => {
    set({
      theme,
    });
  },

  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === "light" ? "dark" : "light",
    }));
  },

  showToast: (message, type = "info") => {
    set({
      toast: {
        message,
        type,
      },
    });

    window.setTimeout(() => {
      set({
        toast: null,
      });
    }, 3000);
  },

  hideToast: () => {
    set({
      toast: null,
    });
  },
}));